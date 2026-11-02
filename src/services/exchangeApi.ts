import type { ExchangeRates } from '../types/economics'

interface CoinbaseApiResponse {
  data?: {
    currency: string
    rates: Record<string, string>
  }
}

interface ErApiResponse {
  result: string
  time_last_update_utc: string
  rates: Record<string, number>
}

interface FawazCurrencyResponse {
  date?: string
  usd?: Record<string, number>
}

interface ProxyQuoteItem {
  price: number
  prevClose: number | null
  changePct: number | null
  time: number | null
}

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')

/**
 * Major & actively traded global currencies to overlay from Yahoo Finance via Cloudflare Worker proxy
 * when VITE_STOCK_PROXY_URL is configured (`USD{CODE}=X` quotes `1 USD = X units`).
 */
const PROXY_FX_CURRENCIES = [
  'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'CHF', 'AUD', 'CAD', 'INR', 'BRL',
  'MXN', 'RUB', 'IDR', 'TRY', 'SAR', 'PLN', 'SEK', 'ARS', 'NOK', 'ILS',
  'AED', 'SGD', 'MYR', 'ZAR', 'PHP', 'DKK', 'VND', 'THB', 'HKD', 'NZD',
  'TWD', 'COP', 'CLP', 'CZK', 'RON', 'PEN', 'QAR', 'HUF', 'KWD', 'UAH',
  'PKR', 'KZT', 'EGP', 'BDT', 'NGN',
]

let cachedRates: ExchangeRates | null = null
let cacheTimestamp = 0
const CACHE_DURATION_MS = 60 * 1000 // 1 minute cache for real-time market spot rates
let inFlightRequest: Promise<ExchangeRates> | null = null

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetches previous daily close rates (`1 USD = X currency`) from public CDN / reference APIs
 * so we can compute 24h change percentages for all 100+ currencies even without a custom proxy.
 */
async function fetchReferenceCloseRates(excludeDateIso?: string): Promise<Record<string, number>> {
  const prevRates: Record<string, number> = { USD: 1 }

  try {
    const fawazRes = await fetchWithTimeout(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
      4500
    )
    if (fawazRes.ok) {
      const fawazData: FawazCurrencyResponse = await fawazRes.json()
      let targetUsdMap = fawazData.usd

      // If the caller is using a daily benchmark from the exact same date, step back 1 day
      if (excludeDateIso && fawazData.date && fawazData.date === excludeDateIso) {
        const prevDateObj = new Date(new Date(fawazData.date).getTime() - 86400 * 1000)
        const prevDateStr = prevDateObj.toISOString().slice(0, 10)
        try {
          const prevDayRes = await fetchWithTimeout(
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${prevDateStr}/v1/currencies/usd.min.json`,
            4000
          )
          if (prevDayRes.ok) {
            const prevDayData: FawazCurrencyResponse = await prevDayRes.json()
            if (prevDayData.usd) targetUsdMap = prevDayData.usd
          }
        } catch {
          // Keep latest fawaz snapshot if stepping back fails
        }
      }

      if (targetUsdMap) {
        for (const [k, v] of Object.entries(targetUsdMap)) {
          if (typeof v === 'number' && v > 0) {
            prevRates[k.toUpperCase()] = v
          }
        }
      }
    }
  } catch {
    // Ignore CDN failure; open.er-api fallback handles reference rates below
  }

  return prevRates
}

/**
 * Overlay near-real-time Yahoo Finance `USD{C}=X` quotes and `chartPreviousClose` when proxy is configured.
 */
async function overlayYahooProxyRates(
  rates: Record<string, number>,
  prevRates: Record<string, number>
): Promise<void> {
  if (!PROXY_URL) return
  try {
    const symbols = PROXY_FX_CURRENCIES.map((c) => `USD${c}=X`)
    const res = await fetchWithTimeout(
      `${PROXY_URL}/?symbols=${encodeURIComponent(symbols.join(','))}`,
      5000
    )
    if (!res.ok) return
    const data = (await res.json()) as { quotes?: Record<string, ProxyQuoteItem> }
    const quotes = data.quotes || {}
    for (const c of PROXY_FX_CURRENCIES) {
      const q = quotes[`USD${c}=X`]
      if (q && typeof q.price === 'number' && q.price > 0) {
        rates[c] = q.price
        if (typeof q.prevClose === 'number' && q.prevClose > 0) {
          prevRates[c] = q.prevClose
        }
      }
    }
  } catch {
    // Proxy overlay is optional; silent fallback to Coinbase + ER-API
  }
}

/**
 * Fetches real-time exchange rates and previous daily close reference rates on-demand:
 * 1. Coinbase Public Exchange Rates API (real-time live spot rates, covers 600+ currencies, CORS open)
 * 2. open.er-api.com + @fawazahmed0/currency-api (daily official close reference for 24h change % & fallback)
 * 3. Yahoo Finance via Cloudflare Worker proxy (when VITE_STOCK_PROXY_URL is configured)
 * 4. api.frankfurter.dev (European Central Bank reference rates fallback)
 */
export async function fetchExchangeRates(forceRefresh = false): Promise<ExchangeRates> {
  const now = Date.now()
  if (!forceRefresh && cachedRates && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedRates
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = (async () => {
    try {
      // Fetch Live Spot (Coinbase), Daily Official Close (open.er-api), and CDN Reference Close in parallel
      const [cbResult, erResult, cdnPrevRates] = await Promise.allSettled([
        fetchWithTimeout('https://api.coinbase.com/v2/exchange-rates?currency=USD', 5500).then((r) =>
          r.ok ? (r.json() as Promise<CoinbaseApiResponse>) : null
        ),
        fetchWithTimeout('https://open.er-api.com/v6/latest/USD', 5500).then((r) =>
          r.ok ? (r.json() as Promise<ErApiResponse>) : null
        ),
        fetchReferenceCloseRates(),
      ])

      const cbData = cbResult.status === 'fulfilled' ? cbResult.value : null
      const erData = erResult.status === 'fulfilled' ? erResult.value : null
      const prevRates: Record<string, number> =
        cdnPrevRates.status === 'fulfilled' ? { ...cdnPrevRates.value } : { USD: 1 }

      // Merge open.er-api daily close rates into prevRates as authoritative daily close benchmark
      if (erData?.result === 'success' && erData.rates) {
        for (const [k, v] of Object.entries(erData.rates)) {
          if (typeof v === 'number' && v > 0) {
            prevRates[k] = v
          }
        }
      }

      // Tier 1: Coinbase real-time live spot feed
      if (cbData?.data?.rates) {
        const liveRates: Record<string, number> = {
          USD: 1,
          // Pre-populate with daily benchmark for any rare currency not listed on Coinbase
          ...(erData?.rates || {}),
        }

        for (const [key, val] of Object.entries(cbData.data.rates)) {
          const num = parseFloat(val)
          if (!isNaN(num) && num > 0) {
            liveRates[key] = num
          }
        }

        if (liveRates.KRW && liveRates.EUR && liveRates.JPY) {
          await overlayYahooProxyRates(liveRates, prevRates)
          const nowUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
          cachedRates = {
            base: 'USD',
            timeLastUpdateUtc: nowUtc,
            rates: liveRates,
            prevRates,
          }
          cacheTimestamp = Date.now()
          return cachedRates
        }
      }

      // Tier 2: open.er-api.com (Daily benchmark rates)
      if (erData?.result === 'success' && erData.rates) {
        const erDateIso = erData.time_last_update_utc
          ? new Date(erData.time_last_update_utc).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
        const distinctPrevRates = await fetchReferenceCloseRates(erDateIso)
        const ratesCopy: Record<string, number> = { USD: 1, ...erData.rates }
        await overlayYahooProxyRates(ratesCopy, distinctPrevRates)

        cachedRates = {
          base: 'USD',
          timeLastUpdateUtc: erData.time_last_update_utc || new Date().toUTCString(),
          rates: ratesCopy,
          prevRates: distinctPrevRates,
        }
        cacheTimestamp = Date.now()
        return cachedRates
      }

      // Tier 3: Frankfurter API (European Central Bank reference rates)
      const fbResponse = await fetch('https://api.frankfurter.dev/v1/latest?base=USD')
      if (!fbResponse.ok) throw new Error('All exchange rate providers failed')
      const fbData = await fbResponse.json()

      const ratesWithUsd: Record<string, number> = {
        USD: 1,
        ...fbData.rates,
      }
      await overlayYahooProxyRates(ratesWithUsd, prevRates)

      cachedRates = {
        base: 'USD',
        timeLastUpdateUtc: `${fbData.date} 16:00 CET (ECB)`,
        rates: ratesWithUsd,
        prevRates,
      }
      cacheTimestamp = Date.now()
      return cachedRates
    } catch (finalErr) {
      console.error('All exchange rate providers failed:', finalErr)
      if (cachedRates) return cachedRates
      throw new Error('Failed to retrieve exchange rate data from public providers.')
    } finally {
      inFlightRequest = null
    }
  })()

  return inFlightRequest
}

/**
 * Calculates conversion multiplier between two currencies: 1 unit of fromCurrency = X units of toCurrency.
 */
export function getConversionRate(
  exchangeRates: ExchangeRates,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return 1
  const fromRate = exchangeRates.rates[fromCurrency]
  const toRate = exchangeRates.rates[toCurrency]

  if (!fromRate || !toRate) return 0
  return toRate / fromRate
}

/**
 * Calculates previous daily close conversion rate: 1 unit of fromCurrency = X units of toCurrency.
 */
export function getPreviousConversionRate(
  exchangeRates: ExchangeRates | null | undefined,
  fromCurrency: string,
  toCurrency: string
): number | null {
  if (!exchangeRates?.prevRates || fromCurrency === toCurrency) return null
  const fromPrev = exchangeRates.prevRates[fromCurrency]
  const toPrev = exchangeRates.prevRates[toCurrency]

  if (!fromPrev || !toPrev || fromPrev <= 0 || toPrev <= 0) return null
  return toPrev / fromPrev
}

/**
 * Calculates 24h percentage change of 1 unit of fromCurrency expressed in toCurrency.
 * Matches the 777 Slot Machine convention (positive = fromCurrency strengthened vs toCurrency).
 */
export function getFxChangePct(
  exchangeRates: ExchangeRates | null | undefined,
  fromCurrency: string,
  toCurrency: string
): number | null {
  if (!exchangeRates || fromCurrency === toCurrency) return null
  const currentRate = getConversionRate(exchangeRates, fromCurrency, toCurrency)
  const prevRate = getPreviousConversionRate(exchangeRates, fromCurrency, toCurrency)
  if (!currentRate || !prevRate || prevRate <= 0) return null
  return Number((((currentRate - prevRate) / prevRate) * 100).toFixed(2))
}

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

let cachedRates: ExchangeRates | null = null
let cacheTimestamp = 0
const CACHE_DURATION_MS = 60 * 1000 // 1 minute cache for real-time market spot rates
let inFlightRequest: Promise<ExchangeRates> | null = null

/**
 * Fetches real-time exchange rates on-demand with multi-tier failover:
 * 1. Coinbase Public Exchange Rates API (real-time live spot rates, covers 600+ currencies, CORS open, no key)
 * 2. open.er-api.com (daily official benchmark rates fallback)
 * 3. api.frankfurter.dev (European Central Bank reference rates fallback)
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
      // Tier 1: Coinbase Public Exchange Rates API (Real-time live market feed)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      try {
        const cbRes = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        clearTimeout(timeoutId)

        if (cbRes.ok) {
          const cbData: CoinbaseApiResponse = await cbRes.json()
          if (cbData.data?.rates) {
            const numRates: Record<string, number> = { USD: 1 }
            for (const [key, val] of Object.entries(cbData.data.rates)) {
              const num = parseFloat(val)
              if (!isNaN(num) && num > 0) {
                numRates[key] = num
              }
            }

            // Ensure essential benchmark currencies are present
            if (numRates.KRW && numRates.EUR && numRates.JPY) {
              const nowUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
              cachedRates = {
                base: 'USD',
                timeLastUpdateUtc: nowUtc,
                rates: numRates,
              }
              cacheTimestamp = Date.now()
              return cachedRates
            }
          }
        }
      } catch (cbErr) {
        console.warn('Coinbase real-time API failed or timed out, trying Tier 2 (open.er-api.com)...', cbErr)
      }

      // Tier 2: open.er-api.com (Daily benchmark rates)
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD')
        if (erRes.ok) {
          const erData: ErApiResponse = await erRes.json()
          if (erData.result === 'success' && erData.rates) {
            cachedRates = {
              base: 'USD',
              timeLastUpdateUtc: erData.time_last_update_utc || new Date().toUTCString(),
              rates: erData.rates,
            }
            cacheTimestamp = Date.now()
            return cachedRates
          }
        }
      } catch (erErr) {
        console.warn('Tier 2 exchange API failed, trying Tier 3 (ECB / Frankfurter)...', erErr)
      }

      // Tier 3: Frankfurter API (European Central Bank reference rates)
      const fbResponse = await fetch('https://api.frankfurter.dev/v1/latest?base=USD')
      if (!fbResponse.ok) throw new Error('All exchange rate providers failed')
      const fbData = await fbResponse.json()

      const ratesWithUsd = {
        USD: 1,
        ...fbData.rates,
      }

      cachedRates = {
        base: 'USD',
        timeLastUpdateUtc: `${fbData.date} 16:00 CET (ECB)`,
        rates: ratesWithUsd,
      }
      cacheTimestamp = Date.now()
      return cachedRates
    } catch (finalErr) {
      console.error('All exchange rate providers failed:', finalErr)
      if (cachedRates) return cachedRates // Return stale cached rates if available
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

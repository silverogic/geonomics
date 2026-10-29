/**
 * Near-real-time FX quotes and 24h change percentages via the Geonomics Cloudflare Worker proxy.
 * Falls back silently when the proxy is not configured or fails.
 */
import type { BaseCurrency } from '../types/economics'

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const MIN_INTERVAL_MS = 60 * 1000

export interface LiveFxQuote {
  price: number
  prevClose: number | null
  changePct: number | null
  time: number | null
}

/**
 * Relative unit value ranking from highest per-unit value to lowest.
 * When targetCurrency has a lower unit value than baseCurrency (e.g. JPY or KRW vs USD),
 * Yahoo Finance truncates direct quotes like `JPYUSD=X` (0.0063) and the proxy rounds them (0.01).
 * Querying the inverse pair `USDJPY=X` (157.66) and inverting `1 / price` preserves full precision.
 */
const CURRENCY_UNIT_RANK: Record<string, number> = {
  GBP: 8,
  CHF: 7,
  EUR: 6,
  USD: 5,
  AUD: 4,
  CNY: 3,
  JPY: 2,
  KRW: 1,
}

function shouldUseInversePair(target: string, base: string): boolean {
  const targetRank = CURRENCY_UNIT_RANK[target] ?? 0
  const baseRank = CURRENCY_UNIT_RANK[base] ?? 0
  return targetRank < baseRank
}

const fxCache = new Map<string, { quote: LiveFxQuote; timestamp: number }>()
let inFlightRequest: Promise<Record<string, LiveFxQuote>> | null = null

export const isLiveFxEnabled = (): boolean => !!PROXY_URL

/**
 * Fetches near-real-time FX quotes and 24h change percentages for key currency pairs.
 * Always queries the direction where rate >= 1 (e.g. USDJPY=X instead of JPYUSD=X) to prevent rounding loss.
 */
export async function fetchLiveFxQuotes(
  baseCurrency: BaseCurrency,
  targetCurrencies: string[],
  force = false
): Promise<Record<string, LiveFxQuote>> {
  if (!PROXY_URL) return {}

  const now = Date.now()
  const neededCurrencies = targetCurrencies.filter((c) => {
    if (c === baseCurrency) return false
    const key = `${c}_${baseCurrency}`
    const cached = fxCache.get(key)
    return force || !cached || now - cached.timestamp >= MIN_INTERVAL_MS
  })

  // If all needed quotes are cached and fresh
  if (neededCurrencies.length === 0) {
    const res: Record<string, LiveFxQuote> = {}
    for (const c of targetCurrencies) {
      if (c === baseCurrency) continue
      const cached = fxCache.get(`${c}_${baseCurrency}`)
      if (cached) res[c] = cached.quote
    }
    return res
  }

  // Deduplicate in-flight requests
  if (inFlightRequest) return inFlightRequest

  inFlightRequest = (async () => {
    try {
      const symbols = neededCurrencies.map((c) =>
        shouldUseInversePair(c, baseCurrency) ? `${baseCurrency}${c}=X` : `${c}${baseCurrency}=X`
      )
      const url = `${PROXY_URL}/?symbols=${encodeURIComponent(symbols.join(','))}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = (await response.json()) as { quotes?: Record<string, LiveFxQuote> }
      const quotes = data.quotes || {}

      const result: Record<string, LiveFxQuote> = {}
      for (const c of targetCurrencies) {
        if (c === baseCurrency) continue
        const inverse = shouldUseInversePair(c, baseCurrency)
        const sym = inverse ? `${baseCurrency}${c}=X` : `${c}${baseCurrency}=X`
        const q = quotes[sym]

        if (q && typeof q.price === 'number' && q.price > 0) {
          let normalizedQuote: LiveFxQuote
          if (inverse) {
            const price = 1 / q.price
            const prevClose = q.prevClose && q.prevClose > 0 ? 1 / q.prevClose : null
            const changePct =
              prevClose && prevClose > 0
                ? Number((((price - prevClose) / prevClose) * 100).toFixed(2))
                : q.changePct != null
                  ? -q.changePct
                  : null
            normalizedQuote = {
              price,
              prevClose,
              changePct,
              time: q.time,
            }
          } else {
            normalizedQuote = q
          }

          fxCache.set(`${c}_${baseCurrency}`, { quote: normalizedQuote, timestamp: now })
          result[c] = normalizedQuote
        } else {
          const cached = fxCache.get(`${c}_${baseCurrency}`)
          if (cached) result[c] = cached.quote
        }
      }
      return result
    } catch (err) {
      console.warn('Failed to fetch live FX quotes from proxy:', err)
      const fallback: Record<string, LiveFxQuote> = {}
      for (const c of targetCurrencies) {
        if (c === baseCurrency) continue
        const cached = fxCache.get(`${c}_${baseCurrency}`)
        if (cached) fallback[c] = cached.quote
      }
      return fallback
    } finally {
      inFlightRequest = null
    }
  })()

  return inFlightRequest
}

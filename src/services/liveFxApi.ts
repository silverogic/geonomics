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

const fxCache = new Map<string, { quote: LiveFxQuote; timestamp: number }>()
let inFlightRequest: Promise<Record<string, LiveFxQuote>> | null = null

export const isLiveFxEnabled = (): boolean => !!PROXY_URL

/**
 * Fetches near-real-time FX quotes and 24h change percentages for key currency pairs.
 * Target symbols: e.g. USDKRW=X, EURKRW=X, JPYKRW=X.
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
      const symbols = neededCurrencies.map((c) => `${c}${baseCurrency}=X`)
      const url = `${PROXY_URL}/?symbols=${encodeURIComponent(symbols.join(','))}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = (await response.json()) as { quotes?: Record<string, LiveFxQuote> }
      const quotes = data.quotes || {}

      const result: Record<string, LiveFxQuote> = {}
      for (const c of targetCurrencies) {
        if (c === baseCurrency) continue
        const sym = `${c}${baseCurrency}=X`
        const q = quotes[sym]
        if (q && typeof q.price === 'number') {
          fxCache.set(`${c}_${baseCurrency}`, { quote: q, timestamp: now })
          result[c] = q
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

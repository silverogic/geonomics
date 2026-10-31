/**
 * Stock Market Capitalization On-Demand API Service
 *
 * Sourced from TradingView Global Scanner API (aggregating primary-listed common stocks
 * across each country's representative mainboard stock exchange) and supplemented by
 * curated national exchange baselines for smaller economies.
 */

import { STOCK_MARKET_CAPS_USD as FALLBACK_CAPS, MARKET_CAP_REPORT_DATE, MARKET_CAP_DATA_SOURCE } from '../data/stockMarketCaps'

const STORAGE_KEY = 'geonomics_stock_market_caps_v5'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

export interface LiveMarketCapData {
  caps: Record<string, number> // countryId -> live estimated market cap in USD
  baseCaps: Record<string, number> // countryId -> exchange aggregate baseline in USD
  multipliers: Record<string, number> // countryId -> index growth multiplier
  years: Record<string, string> // countryId -> reporting period (e.g. '2026 Live')
  sources: Record<string, string> // countryId -> source attribution
  updatedAt: string
}

let memoryCache: LiveMarketCapData | null = null

/**
 * Fetch latest domestic stock market caps from TradingView exchange aggregate JSON and fallback table
 */
export async function fetchStockMarketCaps(forceRefresh = false): Promise<LiveMarketCapData> {
  // Check memory cache
  if (!forceRefresh && memoryCache) {
    return memoryCache
  }

  // Check localStorage cache
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed: LiveMarketCapData = JSON.parse(cached)
        const age = Date.now() - new Date(parsed.updatedAt).getTime()
        if (age < CACHE_TTL_MS) {
          memoryCache = parsed
          return parsed
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // 1. Initialize with fallback benchmarks
  const caps: Record<string, number> = { ...FALLBACK_CAPS }
  const baseCaps: Record<string, number> = { ...FALLBACK_CAPS }
  const multipliers: Record<string, number> = {}
  const years: Record<string, string> = {}
  const sources: Record<string, string> = {}

  for (const code of Object.keys(FALLBACK_CAPS)) {
    years[code] = MARKET_CAP_REPORT_DATE
    sources[code] = MARKET_CAP_DATA_SOURCE
    multipliers[code] = 1.0
  }

  // 2. Fetch precompiled TradingView mainboard exchange aggregate JSON from public API
  try {
    const url = `${import.meta.env.BASE_URL}api/v1/stock-market-caps.json`
    const localRes = await fetch(url)
    if (localRes.ok) {
      const json = await localRes.json()
      for (const [code, val] of Object.entries(json)) {
        if (val && typeof val === 'object') {
          const item = val as {
            marketCapUsd?: number
            baseCapUsd?: number
            indexMultiplier?: number
            year?: string
            source?: string
          }
          if (item.marketCapUsd && typeof item.marketCapUsd === 'number' && item.marketCapUsd > 0) {
            caps[code] = item.marketCapUsd
            if (item.baseCapUsd) baseCaps[code] = item.baseCapUsd
            if (item.indexMultiplier) multipliers[code] = item.indexMultiplier
            if (item.year) years[code] = item.year
            if (item.source) sources[code] = item.source
          }
        }
      }
    }
  } catch (err) {
    console.warn('Local market cap dataset load fallback:', err)
  }

  const result: LiveMarketCapData = {
    caps,
    baseCaps,
    multipliers,
    years,
    sources,
    updatedAt: new Date().toISOString(),
  }

  memoryCache = result

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
    } catch {
      // Ignore quota errors
    }
  }

  return result
}

/**
 * Calculates market cap without double-counting static daily changePct.
 * - Static data (`stock?.isLive !== true`): returns `estimatedCapUsd` as-is because
 *   the prebuilt dataset already reflects that day's market movement.
 * - Live proxy data (`stock?.isLive === true`): scales `estimatedCapUsd` only by
 *   the post-build price ratio (`currentPrice / staticPrice`).
 */
export function calculateLiveMarketCap(
  estimatedCapUsd: number,
  stock?: { isLive?: boolean; currentPrice?: number; staticPrice?: number }
): number {
  if (!estimatedCapUsd || estimatedCapUsd <= 0) return 0
  if (
    stock?.isLive &&
    typeof stock.currentPrice === 'number' &&
    stock.currentPrice > 0 &&
    typeof stock.staticPrice === 'number' &&
    stock.staticPrice > 0
  ) {
    return Math.round(estimatedCapUsd * (stock.currentPrice / stock.staticPrice))
  }
  return Math.round(estimatedCapUsd)
}

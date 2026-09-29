/**
 * Stock Market Capitalization On-Demand API Service
 * 
 * Sourced from World Federation of Exchanges (WFE) Monthly Market Statistics (2026)
 * and supplemented by World Bank Open Data.
 * Dynamically scales market cap using daily stock index performance.
 */

import { STOCK_MARKET_CAPS_USD as FALLBACK_CAPS, WFE_REPORT_DATE, WFE_DATA_SOURCE } from '../data/stockMarketCaps'

const STORAGE_KEY = 'geonomics_stock_market_caps_v2'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

export interface LiveMarketCapData {
  caps: Record<string, number> // countryId -> base market cap in USD
  years: Record<string, string> // countryId -> reporting period (e.g. '2026 Monthly')
  sources: Record<string, string> // countryId -> 'World Federation of Exchanges (WFE) Monthly' | ...
  updatedAt: string
}

let memoryCache: LiveMarketCapData | null = null

/**
 * Fetch latest domestic stock market caps from WFE monthly dataset and local API
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

  // 1. Initialize with authoritative WFE Monthly 2026 Benchmarks
  const caps: Record<string, number> = { ...FALLBACK_CAPS }
  const years: Record<string, string> = {}
  const sources: Record<string, string> = {}

  for (const code of Object.keys(FALLBACK_CAPS)) {
    years[code] = WFE_REPORT_DATE
    sources[code] = WFE_DATA_SOURCE
  }

  // 2. Fetch precompiled WFE + World Bank unified JSON from public API
  try {
    const localRes = await fetch('/api/v1/stock-market-caps.json')
    if (localRes.ok) {
      const json = await localRes.json()
      for (const [code, val] of Object.entries(json)) {
        if (val && typeof val === 'object') {
          const item = val as { marketCapUsd?: number; year?: string; source?: string }
          if (item.marketCapUsd && typeof item.marketCapUsd === 'number' && item.marketCapUsd > 0) {
            caps[code] = item.marketCapUsd
            if (item.year) years[code] = item.year
            if (item.source) sources[code] = item.source
          }
        }
      }
    }
  } catch (err) {
    console.warn('WFE local dataset load fallback:', err)
  }

  const result: LiveMarketCapData = {
    caps,
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
 * Calculates dynamic real-time market cap scaled by daily index change %
 */
export function calculateLiveMarketCap(
  baseCapUsd: number,
  changePct: number = 0
): number {
  if (!baseCapUsd || baseCapUsd <= 0) return 0
  // Apply index fluctuation to WFE monthly market capitalization: Cap * (1 + change / 100)
  return Math.round(baseCapUsd * (1 + changePct / 100))
}

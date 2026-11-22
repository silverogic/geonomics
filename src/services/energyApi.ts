import type { Language } from '../types/economics'

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const CACHE_TTL_MS = 60 * 1000

export type CommodityIconType = 'oil' | 'gas' | 'gold' | 'silver'

export interface EnergyBenchmark {
  symbol: string
  code: string
  unit: string
  decimals: number
  iconType: CommodityIconType
  names: Record<Language, string>
}

export const ENERGY_BENCHMARKS: EnergyBenchmark[] = [
  {
    symbol: 'CL=F',
    code: 'WTI',
    unit: 'bbl',
    decimals: 2,
    iconType: 'oil',
    names: {
      ko: 'WTI 원유',
      en: 'WTI Crude',
      ja: 'WTI原油',
      es: 'WTI Crudo',
      zh: 'WTI 原油',
      hi: 'WTI क्रूड',
    },
  },
  {
    symbol: 'BZ=F',
    code: 'Brent',
    unit: 'bbl',
    decimals: 2,
    iconType: 'oil',
    names: {
      ko: '브렌트유',
      en: 'Brent Crude',
      ja: 'ブレント原油',
      es: 'Brent Crudo',
      zh: '布伦特原油',
      hi: 'ब्रेंट क्रूड',
    },
  },
  {
    symbol: 'NG=F',
    code: 'NatGas',
    unit: 'MMBtu',
    decimals: 3,
    iconType: 'gas',
    names: {
      ko: '천연가스',
      en: 'Natural Gas',
      ja: '天然ガス',
      es: 'Gas Natural',
      zh: '天然气',
      hi: 'प्राकृतिक गैस',
    },
  },
  {
    symbol: 'RB=F',
    code: 'Gasoline',
    unit: 'gal',
    decimals: 4,
    iconType: 'oil',
    names: {
      ko: '휘발유 선물',
      en: 'Gasoline',
      ja: 'ガソリン先物',
      es: 'Gasolina',
      zh: '汽油期货',
      hi: 'गैसोलीन',
    },
  },
  {
    symbol: 'GC=F',
    code: 'Gold',
    unit: 'oz',
    decimals: 2,
    iconType: 'gold',
    names: {
      ko: '금',
      en: 'Gold',
      ja: '金',
      es: 'Oro',
      zh: '黄金',
      hi: 'सोना',
    },
  },
  {
    symbol: 'SI=F',
    code: 'Silver',
    unit: 'oz',
    decimals: 2,
    iconType: 'silver',
    names: {
      ko: '은',
      en: 'Silver',
      ja: '銀',
      es: 'Plata',
      zh: '白银',
      hi: 'चांदी',
    },
  },
]

export interface EnergyQuote {
  price: number
  prevClose: number | null
  changePct: number | null
  currency: string
  isOpen: boolean
}

let cachedQuotes: Record<string, EnergyQuote> | null = null
let lastFetchedAt = 0

/**
 * Fetches near-real-time global energy futures quotes via the Cloudflare Worker (/?symbols=...).
 * Returns an empty map silently when the proxy is not configured or unavailable.
 */
export async function fetchLiveEnergyQuotes(
  forceRefresh = false
): Promise<Record<string, EnergyQuote>> {
  if (!PROXY_URL) return {}

  const now = Date.now()
  if (!forceRefresh && cachedQuotes && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedQuotes
  }

  const symbols = ENERGY_BENCHMARKS.map((b) => b.symbol)
  try {
    const res = await fetch(
      `${PROXY_URL}/?symbols=${encodeURIComponent(symbols.join(','))}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return cachedQuotes || {}

    const json = (await res.json()) as {
      quotes?: Record<
        string,
        {
          price?: number
          prevClose?: number | null
          changePct?: number | null
          currency?: string
          isOpen?: boolean
        }
      >
    }

    const result: Record<string, EnergyQuote> = {}
    for (const sym of symbols) {
      const q = json.quotes?.[sym]
      if (q && typeof q.price === 'number') {
        result[sym] = {
          price: q.price,
          prevClose: q.prevClose ?? null,
          changePct: q.changePct ?? null,
          currency: q.currency || 'USD',
          isOpen: !!q.isOpen,
        }
      }
    }

    if (Object.keys(result).length > 0) {
      cachedQuotes = result
      lastFetchedAt = now
    }
    return result
  } catch {
    return cachedQuotes || {}
  }
}

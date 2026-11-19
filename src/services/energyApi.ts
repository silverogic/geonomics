import type { Language } from '../types/economics'

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')

export type EnergyChartRange = '1d' | '1mo' | '1y'

export interface EnergyBenchmark {
  symbol: string
  code: string
  unit: string
  decimals: number
  accentHex: string
  names: Record<Language, string>
  subtitle: Record<Language, string>
}

export const ENERGY_BENCHMARKS: EnergyBenchmark[] = [
  {
    symbol: 'CL=F',
    code: 'WTI',
    unit: 'bbl',
    decimals: 2,
    accentHex: '#f59e0b',
    names: {
      ko: 'WTI 원유',
      en: 'WTI Crude Oil',
      ja: 'WTI原油',
      es: 'Petróleo WTI',
      zh: 'WTI 原油',
      hi: 'WTI क्रूड ऑयल',
    },
    subtitle: {
      ko: 'NYMEX 서부텍사스산원유 선물',
      en: 'NYMEX West Texas Intermediate',
      ja: 'NYMEX WTI原油先物',
      es: 'Futuros NYMEX WTI',
      zh: 'NYMEX 西德克萨斯轻质原油期货',
      hi: 'NYMEX वेस्ट टेक्सास इंटरमीडिएट',
    },
  },
  {
    symbol: 'BZ=F',
    code: 'BRENT',
    unit: 'bbl',
    decimals: 2,
    accentHex: '#10b981',
    names: {
      ko: '브렌트유',
      en: 'Brent Crude',
      ja: 'ブレント原油',
      es: 'Petróleo Brent',
      zh: '布伦特原油',
      hi: 'ब्रेंट क्रूड',
    },
    subtitle: {
      ko: 'ICE 북해산 브렌트유 선물',
      en: 'ICE Brent Crude Futures',
      ja: 'ICE ブレント原油先物',
      es: 'Futuros ICE Brent',
      zh: 'ICE 布伦特原油期货',
      hi: 'ICE ब्रेंट क्रूड फ्यूचर्स',
    },
  },
  {
    symbol: 'NG=F',
    code: 'NAT GAS',
    unit: 'MMBtu',
    decimals: 3,
    accentHex: '#38bdf8',
    names: {
      ko: '천연가스',
      en: 'Natural Gas',
      ja: '天然ガス',
      es: 'Gas Natural',
      zh: '天然气',
      hi: 'प्राकृतिक गैस',
    },
    subtitle: {
      ko: 'NYMEX Henry Hub 천연가스 선물',
      en: 'NYMEX Henry Hub Futures',
      ja: 'NYMEX ヘンリーハブ先物',
      es: 'Futuros NYMEX Henry Hub',
      zh: 'NYMEX 亨利枢纽天然气期货',
      hi: 'NYMEX हेनरी हब फ्यूचर्स',
    },
  },
  {
    symbol: 'RB=F',
    code: 'GASOLINE',
    unit: 'gal',
    decimals: 4,
    accentHex: '#a855f7',
    names: {
      ko: '휘발유 선물',
      en: 'RBOB Gasoline',
      ja: 'RBOBガソリン',
      es: 'Gasolina RBOB',
      zh: 'RBOB 汽油期货',
      hi: 'RBOB गैसोलीन',
    },
    subtitle: {
      ko: 'NYMEX RBOB 휘발유 선물',
      en: 'NYMEX RBOB Gasoline Futures',
      ja: 'NYMEX RBOBガソリン先物',
      es: 'Futuros Gasolina RBOB',
      zh: 'NYMEX RBOB 汽油期货',
      hi: 'NYMEX RBOB गैसोलीन फ्यूचर्स',
    },
  },
]

export interface EnergyPoint {
  time: number
  close: number
}

export interface EnergyChartData {
  symbol: string
  range: EnergyChartRange
  currency: string
  price: number | null
  prevClose: number | null
  changePct: number | null
  isOpen: boolean
  fetchedAt: number
  points: EnergyPoint[]
}

const chartMemoryCache = new Map<string, { ts: number; data: EnergyChartData }>()
const CACHE_TTL_MS = 60 * 1000

export async function fetchEnergyChart(
  symbol: string,
  range: EnergyChartRange,
  forceRefresh = false
): Promise<EnergyChartData | null> {
  const cacheKey = `${symbol}::${range}`
  const now = Date.now()
  if (!forceRefresh) {
    const cached = chartMemoryCache.get(cacheKey)
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return cached.data
    }
  }

  const endpoint = PROXY_URL
    ? `${PROXY_URL}/?chart=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`
    : import.meta.env.DEV
      ? `/api/chart?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`
      : null

  if (!endpoint) return null

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const data = (await res.json()) as EnergyChartData
    if (!data || !Array.isArray(data.points)) return null
    chartMemoryCache.set(cacheKey, { ts: now, data })
    return data
  } catch {
    return null
  }
}

export async function fetchAllEnergySnapshots(
  range: EnergyChartRange = '1d',
  forceRefresh = false
): Promise<Record<string, EnergyChartData | null>> {
  const entries = await Promise.all(
    ENERGY_BENCHMARKS.map(async (b) => {
      const data = await fetchEnergyChart(b.symbol, range, forceRefresh)
      return [b.symbol, data] as const
    })
  )
  const map = Object.fromEntries(entries) as Record<string, EnergyChartData | null>

  // Fallback to /?symbols=... for live prices if /?chart= is not yet deployed on the Worker
  const missingSymbols = ENERGY_BENCHMARKS.filter((b) => !map[b.symbol]).map((b) => b.symbol)
  if (missingSymbols.length > 0 && PROXY_URL) {
    try {
      const res = await fetch(
        `${PROXY_URL}/?symbols=${encodeURIComponent(missingSymbols.join(','))}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (res.ok) {
        const json = (await res.json()) as {
          fetchedAt?: number
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
        for (const sym of missingSymbols) {
          const q = json.quotes?.[sym]
          if (q && typeof q.price === 'number') {
            map[sym] = {
              symbol: sym,
              range,
              currency: q.currency || 'USD',
              price: q.price,
              prevClose: q.prevClose ?? null,
              changePct: q.changePct ?? null,
              isOpen: !!q.isOpen,
              fetchedAt: json.fetchedAt || Math.floor(Date.now() / 1000),
              points: [],
            }
          }
        }
      }
    } catch {
      // Silent fallback
    }
  }

  return map
}

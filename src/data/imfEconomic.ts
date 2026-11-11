import staticEconomicsJson from '../../public/api/v1/economics.json'
import { COUNTRIES } from './countries'
import type { EconomicYear, GdpYearPoint } from '../types/economics'

export interface ImfYearMetrics {
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  debtRatioPct: number | null
  inflationRatePct: number | null
}

export interface ImfCountryRecord {
  countryId: string
  years: Record<EconomicYear, ImfYearMetrics>
  historical: GdpYearPoint[]
  source: string
  lastUpdated: string
}

interface ImfDataMapperPayload {
  values?: {
    NGDPD?: Record<string, Record<string, number>>
    NGDPDPC?: Record<string, Record<string, number>>
    NGDP_RPCH?: Record<string, Record<string, number>>
    GGXWDG_NGDP?: Record<string, Record<string, number>>
    PCPIPCH?: Record<string, Record<string, number>>
  }
}

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const TARGET_YEARS = [
  '2015', '2016', '2017', '2018', '2019', '2020',
  '2021', '2022', '2023', '2024', '2025', '2026',
  '2027', '2028', '2029', '2030',
]

const IMF_DATA: Record<string, ImfCountryRecord> = {
  ...(staticEconomicsJson as unknown as Record<string, ImfCountryRecord>),
}

let isLiveImfSynced = false
let inFlightImfSync: Promise<boolean> | null = null

function getImfEndpointUrl(): string | null {
  if (PROXY_URL) return `${PROXY_URL}/?imf=weo`
  if (import.meta.env?.DEV) return '/api/imf-weo'
  return null
}

/**
 * Fetches live IMF World Economic Outlook (WEO) indicators (Total GDP, Per Capita GDP,
 * Real GDP Growth, General Gov Gross Debt % of GDP, and Inflation %) via Cloudflare Worker proxy
 * and merges them into the in-memory IMF store.
 */
export function syncLiveImfEconomicData(forceRefresh = false): Promise<boolean> {
  if (isLiveImfSynced && !forceRefresh) return Promise.resolve(true)
  if (inFlightImfSync) return inFlightImfSync

  const endpoint = getImfEndpointUrl()
  if (!endpoint) return Promise.resolve(false)

  inFlightImfSync = (async () => {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return false

      const data = (await res.json()) as ImfDataMapperPayload
      const values = data?.values
      if (!values || !values.NGDPD) return false

      const gdpMap = values.NGDPD || {}
      const pcapMap = values.NGDPDPC || {}
      const growthMap = values.NGDP_RPCH || {}
      const debtMap = values.GGXWDG_NGDP || {}
      const infMap = values.PCPIPCH || {}

      for (const c of COUNTRIES) {
        const id = c.id
        const existing = IMF_DATA[id]
        const gdpByYr = gdpMap[id] || {}
        const pcapByYr = pcapMap[id] || {}
        const growthByYr = growthMap[id] || {}
        const debtByYr = debtMap[id] || {}
        const infByYr = infMap[id] || {}

        // Skip if IMF API returned no GDP series at all for this country
        if (Object.keys(gdpByYr).length === 0 && existing) continue

        const yearsObj: Record<string, ImfYearMetrics> = {}
        const historicalList: GdpYearPoint[] = []

        let lastTotalGdp = 0
        let lastPerCapita = 0
        let lastGrowth: number | null = null
        let lastDebt: number | null = null
        let lastInflation: number | null = null

        for (const y of TARGET_YEARS) {
          const yNum = parseInt(y, 10)
          const fallbackYr = existing?.years?.[y]

          const rawGdpB = gdpByYr[y]
          const rawPcap = pcapByYr[y]
          const rawGrowth = growthByYr[y]
          const rawDebt = debtByYr[y]
          const rawInf = infByYr[y]

          const growthRatePct: number | null =
            typeof rawGrowth === 'number' && !isNaN(rawGrowth)
              ? Math.round(rawGrowth * 10) / 10
              : fallbackYr?.growthRatePct ?? lastGrowth
          if (growthRatePct !== null) lastGrowth = growthRatePct

          let totalGdpUsd: number =
            typeof rawGdpB === 'number' && rawGdpB > 0
              ? Math.round(rawGdpB * 1e9)
              : fallbackYr?.totalGdpUsd ?? 0
          if (totalGdpUsd <= 0 && lastTotalGdp > 0) {
            const g = growthRatePct ?? 3.0
            totalGdpUsd = Math.round(lastTotalGdp * (1 + g / 100))
          }
          if (totalGdpUsd > 0) lastTotalGdp = totalGdpUsd

          let gdpPerCapitaUsd: number =
            typeof rawPcap === 'number' && rawPcap > 0
              ? Math.round(rawPcap * 100) / 100
              : fallbackYr?.gdpPerCapitaUsd ?? 0
          if (gdpPerCapitaUsd <= 0 && lastPerCapita > 0) {
            const g = growthRatePct ?? 2.5
            gdpPerCapitaUsd = Math.round(lastPerCapita * (1 + g / 100) * 100) / 100
          }
          if (gdpPerCapitaUsd > 0) lastPerCapita = gdpPerCapitaUsd

          const debtRatioPct: number | null =
            typeof rawDebt === 'number' && !isNaN(rawDebt)
              ? Math.round(rawDebt * 10) / 10
              : fallbackYr?.debtRatioPct ?? lastDebt
          if (debtRatioPct !== null) lastDebt = debtRatioPct

          const inflationRatePct: number | null =
            typeof rawInf === 'number' && !isNaN(rawInf)
              ? Math.round(rawInf * 10) / 10
              : fallbackYr?.inflationRatePct ?? lastInflation
          if (inflationRatePct !== null) lastInflation = inflationRatePct

          yearsObj[y] = {
            totalGdpUsd,
            gdpPerCapitaUsd,
            growthRatePct,
            debtRatioPct,
            inflationRatePct,
          }

          historicalList.push({
            year: yNum,
            gdp: totalGdpUsd,
            gdpPerCapita: gdpPerCapitaUsd,
            growthRate: growthRatePct ?? undefined,
            debtRatio: debtRatioPct,
            inflationRate: inflationRatePct,
          })
        }

        IMF_DATA[id] = {
          countryId: id,
          years: yearsObj as Record<EconomicYear, ImfYearMetrics>,
          historical: historicalList,
          source: 'IMF DataMapper API v1 (Live Proxy)',
          lastUpdated: 'IMF WEO Official Live API',
        }
      }

      isLiveImfSynced = true
      return true
    } catch (err) {
      console.warn('Live IMF WEO proxy sync skipped, using bundled dataset:', err)
      return false
    } finally {
      inFlightImfSync = null
    }
  })()

  return inFlightImfSync
}

export const getImfCountryData = (countryId: string): ImfCountryRecord | undefined => {
  return IMF_DATA[countryId.toUpperCase()]
}

export const getAllImfData = (): Record<string, ImfCountryRecord> => {
  return IMF_DATA
}

export const getImfYearMap = (year: EconomicYear): Map<string, ImfYearMetrics> => {
  const map = new Map<string, ImfYearMetrics>()
  const yrNum = parseInt(year, 10)
  for (const [id, record] of Object.entries(IMF_DATA)) {
    if (record.years && record.years[year]) {
      map.set(id, record.years[year])
    } else if (record.historical) {
      const pt = record.historical.find((h) => h.year === yrNum)
      if (pt) {
        map.set(id, {
          totalGdpUsd: pt.gdp,
          gdpPerCapitaUsd: pt.gdpPerCapita ?? 0,
          growthRatePct: pt.growthRate ?? null,
          debtRatioPct: pt.debtRatio ?? null,
          inflationRatePct: pt.inflationRate ?? null,
        })
      }
    }
  }
  return map
}

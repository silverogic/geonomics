import excelDataJson from './excelEconomicData.json'
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

const IMF_DATA: Record<string, ImfCountryRecord> = excelDataJson as unknown as Record<string, ImfCountryRecord>

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

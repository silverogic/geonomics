import type { CountryGdpDetail, GdpYearPoint, EconomicYear } from '../types/economics'
import { getImfCountryData, getImfYearMap } from '../data/imfEconomic'
import { CURRENT_YEAR_STR } from '../utils/economicYears'

interface WbItem {
  indicator: { id: string; value: string }
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
}

type WbResponse = [
  { page: number; pages: number; per_page: number; total: number; lastupdated: string },
  WbItem[]
]

// In-memory cache for on-demand performance without database
const summaryCache: Map<string, { totalGdp: number; year: number }> = new Map()
const perCapitaCache: Map<string, { perCapita: number; year: number }> = new Map()
const growthCache: Map<string, { growth: number; year: number }> = new Map()
const debtCache: Map<string, { debtRatio: number | null; year: number }> = new Map()
const inflationCache: Map<string, { inflation: number | null; year: number }> = new Map()
const detailCache: Map<string, CountryGdpDetail> = new Map()

let isBulkLoaded = false

export interface GlobalEconomicOverview {
  gdpMap: Map<string, { totalGdp: number; year: number }>
  perCapitaMap: Map<string, { perCapita: number; year: number }>
  growthMap: Map<string, { growth: number; year: number }>
  debtMap: Map<string, { debtRatio: number | null; year: number }>
  inflationMap: Map<string, { inflation: number | null; year: number }>
}

/**
 * Loads macroeconomic indicators (Total GDP, GDP per capita, Growth rate, Debt % of GDP, Inflation %)
 * for all countries for the selected year (dynamically anchored to current year).
 */
export async function loadGlobalGdpOverview(
  forceRefresh = false,
  targetYear: EconomicYear = CURRENT_YEAR_STR
): Promise<GlobalEconomicOverview> {
  const yrNum = parseInt(targetYear, 10)

  // Retrieve from authoritative IMF WEO dataset for the selected target year
  const imfMap = getImfYearMap(targetYear)
  if (imfMap.size > 0) {
    const gdpMap = new Map<string, { totalGdp: number; year: number }>()
    const perCapitaMap = new Map<string, { perCapita: number; year: number }>()
    const growthMap = new Map<string, { growth: number; year: number }>()
    const debtMap = new Map<string, { debtRatio: number | null; year: number }>()
    const inflationMap = new Map<string, { inflation: number | null; year: number }>()

    for (const [id, m] of imfMap.entries()) {
      gdpMap.set(id, { totalGdp: m.totalGdpUsd, year: yrNum })
      perCapitaMap.set(id, { perCapita: m.gdpPerCapitaUsd, year: yrNum })
      growthMap.set(id, { growth: m.growthRatePct ?? 0, year: yrNum })
      debtMap.set(id, { debtRatio: m.debtRatioPct, year: yrNum })
      inflationMap.set(id, { inflation: m.inflationRatePct, year: yrNum })
    }

    return { gdpMap, perCapitaMap, growthMap, debtMap, inflationMap }
  }

  // Populate Debt and Inflation Map from IMF WEO for all countries if available
  for (const [id, m] of imfMap.entries()) {
    debtCache.set(id, { debtRatio: m.debtRatioPct, year: yrNum })
    inflationCache.set(id, { inflation: m.inflationRatePct, year: yrNum })
  }

  if (isBulkLoaded && !forceRefresh) {
    return {
      gdpMap: summaryCache,
      perCapitaMap: perCapitaCache,
      growthMap: growthCache,
      debtMap: debtCache,
      inflationMap: inflationCache,
    }
  }

  try {
    // 1. Fetch Total GDP (current US$)
    const gdpRes = await fetch(
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?date=2023:2024&format=json&per_page=600'
    )
    if (gdpRes.ok) {
      const data: WbResponse = await gdpRes.json()
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        const sortedItems = data[1].filter((item) => item.value !== null && item.countryiso3code)
        sortedItems.sort((a, b) => parseInt(b.date, 10) - parseInt(a.date, 10))

        for (const item of sortedItems) {
          const code = item.countryiso3code.toUpperCase()
          if (!summaryCache.has(code) && item.value !== null) {
            summaryCache.set(code, {
              totalGdp: item.value,
              year: parseInt(item.date, 10),
            })
          }
        }
      }
    }

    // 2. Fetch GDP per capita (current US$)
    const pcapRes = await fetch(
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?date=2023:2024&format=json&per_page=600'
    )
    if (pcapRes.ok) {
      const data: WbResponse = await pcapRes.json()
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        const sortedItems = data[1].filter((item) => item.value !== null && item.countryiso3code)
        sortedItems.sort((a, b) => parseInt(b.date, 10) - parseInt(a.date, 10))

        for (const item of sortedItems) {
          const code = item.countryiso3code.toUpperCase()
          if (!perCapitaCache.has(code) && item.value !== null) {
            perCapitaCache.set(code, {
              perCapita: item.value,
              year: parseInt(item.date, 10),
            })
          }
        }
      }
    }

    // 3. Fetch GDP growth rate (annual %)
    const growthRes = await fetch(
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?date=2023:2024&format=json&per_page=600'
    )
    if (growthRes.ok) {
      const data: WbResponse = await growthRes.json()
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        const sortedItems = data[1].filter((item) => item.value !== null && item.countryiso3code)
        sortedItems.sort((a, b) => parseInt(b.date, 10) - parseInt(a.date, 10))

        for (const item of sortedItems) {
          const code = item.countryiso3code.toUpperCase()
          if (!growthCache.has(code) && item.value !== null) {
            growthCache.set(code, {
              growth: item.value,
              year: parseInt(item.date, 10),
            })
          }
        }
      }
    }

    // Populate Taiwan and any missing country from IMF WEO
    for (const [id, m] of imfMap.entries()) {
      if (!summaryCache.has(id)) {
        summaryCache.set(id, { totalGdp: m.totalGdpUsd, year: yrNum })
      }
      if (!perCapitaCache.has(id)) {
        perCapitaCache.set(id, { perCapita: m.gdpPerCapitaUsd, year: yrNum })
      }
      if (!growthCache.has(id)) {
        growthCache.set(id, { growth: m.growthRatePct ?? 0, year: yrNum })
      }
    }

    isBulkLoaded = true
  } catch (err) {
    console.error('Failed to load global GDP overview from World Bank Open API, falling back to IMF:', err)
    for (const [id, m] of imfMap.entries()) {
      if (!summaryCache.has(id)) summaryCache.set(id, { totalGdp: m.totalGdpUsd, year: yrNum })
      if (!perCapitaCache.has(id)) perCapitaCache.set(id, { perCapita: m.gdpPerCapitaUsd, year: yrNum })
      if (!growthCache.has(id)) growthCache.set(id, { growth: m.growthRatePct ?? 0, year: yrNum })
    }
  }

  return {
    gdpMap: summaryCache,
    perCapitaMap: perCapitaCache,
    growthMap: growthCache,
    debtMap: debtCache,
    inflationMap: inflationCache,
  }
}

/**
 * Fetches historical trajectory and in-depth indicators for a specific country for a given year.
 */
export async function fetchCountryGdpDetail(
  countryId: string,
  targetYear: EconomicYear = CURRENT_YEAR_STR
): Promise<CountryGdpDetail> {
  const code = countryId.toUpperCase()
  const cacheKey = `${code}_${targetYear}`

  if (detailCache.has(cacheKey)) {
    return detailCache.get(cacheKey)!
  }

  const imfRecord = getImfCountryData(code)
  const yrNum = parseInt(targetYear, 10)

  if (imfRecord) {
    let yearMetrics = imfRecord.years?.[targetYear]
    if (!yearMetrics && imfRecord.historical) {
      const pt = imfRecord.historical.find((h) => h.year === yrNum)
      if (pt) {
        yearMetrics = {
          totalGdpUsd: pt.gdp,
          gdpPerCapitaUsd: pt.gdpPerCapita ?? 0,
          growthRatePct: pt.growthRate ?? null,
          debtRatioPct: pt.debtRatio ?? null,
          inflationRatePct: pt.inflationRate ?? null,
        }
      }
    }

    if (yearMetrics) {
      const startYear = yrNum - 9
      const filteredHistorical = (imfRecord.historical || []).filter(
        (h) => h.year >= startYear && h.year <= yrNum
      )
      const detail: CountryGdpDetail = {
        countryCode: code,
        latestYear: yrNum,
        totalGdpUsd: yearMetrics.totalGdpUsd,
        gdpPerCapitaUsd: yearMetrics.gdpPerCapitaUsd,
        growthRatePct: yearMetrics.growthRatePct,
        debtRatioPct: yearMetrics.debtRatioPct,
        inflationRatePct: yearMetrics.inflationRatePct,
        historical: filteredHistorical,
        source: 'IMF World Economic Outlook (WEO)',
        lastUpdated: 'IMF WEO Official Database',
      }
      detailCache.set(cacheKey, detail)
      return detail
    }
  }

  // Fallback to World Bank API for 10-year official historical curve
  const [totalRes, perCapitaRes, growthRes] = await Promise.allSettled([
    fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.CD?date=2015:2024&format=json`),
    fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.PCAP.CD?date=2015:2024&format=json`),
    fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.KD.ZG?date=2015:2024&format=json`),
  ])

  const historyMap: Map<number, GdpYearPoint> = new Map()
  let latestYear = yrNum
  let latestTotalGdp = 0
  let lastUpdated = 'World Bank Official API & IMF WEO'

  if (totalRes.status === 'fulfilled' && totalRes.value.ok) {
    const data: WbResponse = await totalRes.value.json()
    if (data && data[0]?.lastupdated) {
      lastUpdated = `World Bank & IMF (Updated: ${data[0].lastupdated})`
    }
    if (data && Array.isArray(data[1])) {
      for (const row of data[1]) {
        if (row.value !== null) {
          const y = parseInt(row.date, 10)
          const curr = historyMap.get(y) || { year: y, gdp: 0 }
          curr.gdp = row.value
          historyMap.set(y, curr)
          if (row.value > 0 && y >= latestYear) {
            latestYear = y
            latestTotalGdp = row.value
          }
        }
      }
    }
  }

  let latestPerCapita = 0
  if (perCapitaRes.status === 'fulfilled' && perCapitaRes.value.ok) {
    const data: WbResponse = await perCapitaRes.value.json()
    if (data && Array.isArray(data[1])) {
      for (const row of data[1]) {
        if (row.value !== null) {
          const y = parseInt(row.date, 10)
          const curr = historyMap.get(y) || { year: y, gdp: 0 }
          curr.gdpPerCapita = row.value
          historyMap.set(y, curr)
          if (y === latestYear) {
            latestPerCapita = row.value
          }
        }
      }
    }
  }

  let latestGrowth: number | null = null
  if (growthRes.status === 'fulfilled' && growthRes.value.ok) {
    const data: WbResponse = await growthRes.value.json()
    if (data && Array.isArray(data[1])) {
      for (const row of data[1]) {
        if (row.value !== null) {
          const y = parseInt(row.date, 10)
          const curr = historyMap.get(y) || { year: y, gdp: 0 }
          curr.growthRate = row.value
          historyMap.set(y, curr)
          if (y === latestYear) {
            latestGrowth = row.value
          }
        }
      }
    }
  }

  // Merge Debt ratio and future projections from IMF dataset into historical points
  if (imfRecord) {
    for (const p of imfRecord.historical) {
      const existing = historyMap.get(p.year)
      if (existing) {
        existing.debtRatio = p.debtRatio
        existing.inflationRate = p.inflationRate
      } else {
        historyMap.set(p.year, { ...p })
      }
    }
  }

  const startYear = yrNum - 9
  const sortedPoints = Array.from(historyMap.values())
    .filter((h) => h.year >= startYear && h.year <= yrNum)
    .sort((a, b) => a.year - b.year)

  const imfTarget = imfRecord?.years[targetYear] || imfRecord?.years['2024']
  if (!latestTotalGdp && imfTarget) {
    latestTotalGdp = imfTarget.totalGdpUsd
    latestPerCapita = imfTarget.gdpPerCapitaUsd
    latestGrowth = imfTarget.growthRatePct
  }

  const detail: CountryGdpDetail = {
    countryCode: code,
    latestYear: yrNum,
    totalGdpUsd: latestTotalGdp,
    gdpPerCapitaUsd: latestPerCapita,
    growthRatePct: latestGrowth,
    debtRatioPct: imfTarget?.debtRatioPct ?? null,
    inflationRatePct: imfTarget?.inflationRatePct ?? null,
    historical: sortedPoints,
    source: 'World Bank Open Data (NY.GDP.MKTP.CD) & IMF WEO',
    lastUpdated,
  }

  detailCache.set(cacheKey, detail)
  return detail
}

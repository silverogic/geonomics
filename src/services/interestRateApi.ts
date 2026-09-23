import type { CountryMeta, InterestRateInfo } from '../types/economics'
import {
  CENTRAL_BANK_NAMES,
  EUROZONE_ISO2_CODES,
  FALLBACK_INTEREST_RATES,
} from '../data/interestRatesFallback'

interface BisApiResponse {
  data?: {
    dataSets?: Array<{
      series?: Record<string, {
        attributes?: any[]
        observations?: Record<string, any[]>
      }>
    }>
    structure?: {
      dimensions?: {
        series?: Array<{
          id: string
          name: string
          values: Array<{ id: string; name: string }>
        }>
        observation?: Array<{
          id: string
          name: string
          values: Array<{ id: string; name: string }>
        }>
      }
    }
  }
}

let cachedInterestRates: Record<string, InterestRateInfo> | null = null
let cacheTimestamp = 0
const CACHE_DURATION_MS = 10 * 60 * 1000 // 10 minutes cache

/**
 * Fetches real-time central bank policy interest rates from the Bank for International Settlements (BIS).
 * Falls back gracefully to curated baseline data if offline or network times out.
 */
export async function fetchInterestRates(forceRefresh = false): Promise<Record<string, InterestRateInfo>> {
  const now = Date.now()
  if (!forceRefresh && cachedInterestRates && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedInterestRates
  }

  // Start with fallback baseline data
  const result: Record<string, InterestRateInfo> = { ...FALLBACK_INTEREST_RATES }

  try {
    // Official BIS SDMX REST API for Central Bank Policy Rates (WS_CBPOL)
    // Daily frequency, end of period, last 1 observation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(
      'https://stats.bis.org/api/v1/data/WS_CBPOL/D..D?lastNObservations=1',
      {
        headers: {
          Accept: 'application/vnd.sdmx.data+json',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`BIS API returned status ${response.status}: ${response.statusText}`)
    }

    const data: BisApiResponse = await response.json()
    const structure = data.data?.structure?.dimensions
    const seriesData = data.data?.dataSets?.[0]?.series

    if (structure?.series && seriesData) {
      const areaDim = structure.series.find((dim) => dim.id === 'REF_AREA') || structure.series[1]
      const timeObsDim = structure.observation?.[0]?.values

      if (areaDim && areaDim.values) {
        areaDim.values.forEach((area, index) => {
          const seriesKey = `0:${index}`
          const seriesEntry = seriesData[seriesKey]

          if (seriesEntry && seriesEntry.observations) {
            const obsEntries = Object.entries(seriesEntry.observations)
            if (obsEntries.length > 0) {
              const [obsIdxStr, obsValues] = obsEntries[obsEntries.length - 1]
              const rateRaw = obsValues?.[0]
              const rate = parseFloat(rateRaw)

              if (!isNaN(rate)) {
                const obsIdx = parseInt(obsIdxStr, 10)
                const date = timeObsDim?.[obsIdx]?.name || timeObsDim?.[obsIdx]?.id

                result[area.id] = {
                  countryCode: area.id,
                  ratePct: rate,
                  date,
                  centralBankName: CENTRAL_BANK_NAMES[area.id] || area.name,
                  source: 'BIS',
                }
              }
            }
          }
        })
      }
    }

    // Eurozone mapping: Assign ECB ('XM') rate to all Eurozone member nations
    const ecbRate = result['XM']
    if (ecbRate) {
      EUROZONE_ISO2_CODES.forEach((iso2) => {
        result[iso2] = {
          ...ecbRate,
          countryCode: iso2,
          centralBankName: 'ECB',
        }
      })
    }

    cachedInterestRates = result
    cacheTimestamp = now
    return result
  } catch (err) {
    console.warn('BIS Interest Rate API fetch failed, using fallback data:', err)

    // Even if BIS fetch fails, apply Eurozone mapping to fallback data
    const ecbFallback = result['XM']
    if (ecbFallback) {
      EUROZONE_ISO2_CODES.forEach((iso2) => {
        if (!result[iso2]) {
          result[iso2] = {
            ...ecbFallback,
            countryCode: iso2,
            centralBankName: 'ECB',
          }
        }
      })
    }

    cachedInterestRates = result
    cacheTimestamp = now
    return result
  }
}

/**
 * Gets the interest rate information for a specific country.
 */
export function getCountryInterestRate(
  rates: Record<string, InterestRateInfo> | null | undefined,
  country: CountryMeta
): InterestRateInfo | null {
  if (!rates) return null

  // 1. Direct match by ISO2
  if (rates[country.iso2]) {
    return rates[country.iso2]
  }

  // 2. Eurozone match if currency is EUR
  if (country.currencyCode === 'EUR' && rates['XM']) {
    return {
      ...rates['XM'],
      countryCode: country.iso2,
      centralBankName: 'ECB',
    }
  }

  // 3. Match by country ID (alpha-3) fallback
  if (rates[country.id]) {
    return rates[country.id]
  }

  return null
}

export type Region = 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Oceania'

export type Language = 'en' | 'ko' | 'ja' | 'es' | 'zh'

export interface CountryMeta {
  id: string // ISO 3166-1 alpha-3 (World Bank API country id, e.g., 'KOR', 'USA')
  iso2: string // ISO 3166-1 alpha-2 (e.g., 'KR', 'US')
  nameKo: string
  nameEn: string
  nameJa?: string
  nameEs?: string
  nameZh?: string
  currencyCode: string // e.g., 'KRW', 'USD'
  currencyNameEn: string
  currencyNameKo: string
  currencyNameJa?: string
  currencyNameEs?: string
  currencyNameZh?: string
  currencySymbol: string
  region: Region
  flagEmoji: string
}

export type EconomicYear = string

export interface GdpYearPoint {
  year: number
  gdp: number // Current US$
  gdpPerCapita?: number | null // Current US$
  growthRate?: number | null // Annual %
  debtRatio?: number | null // % of GDP
  inflationRate?: number | null // Annual %
}

export interface CountryGdpDetail {
  countryCode: string
  latestYear: number
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  debtRatioPct: number | null
  inflationRatePct: number | null
  historical: GdpYearPoint[]
  source: string
  lastUpdated: string
}

export interface ExchangeRates {
  base: string
  timeLastUpdateUtc: string
  rates: Record<string, number>
}

export interface EconomySummary {
  country: CountryMeta
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  debtRatioPct: number | null
  inflationRatePct: number | null
  rank: number
  latestYear: number
  exchangeRateVsBase: number
  rateToBase: number
}

export type BaseCurrency = 'USD' | 'EUR' | 'KRW' | 'JPY' | 'GBP' | 'CNY' | 'CHF' | 'AUD'

export interface InterestRateInfo {
  countryCode: string // ISO2 e.g. 'US', 'KR' or 'XM'
  ratePct: number // Policy interest rate in percent, e.g. 3.00
  date?: string // Last updated date string e.g. '2026-09-15'
  centralBankName: string // e.g. 'Fed', 'BOK', 'ECB', 'BOJ', 'BOE', 'PBOC'
  source?: string // 'BIS' or fallback
}

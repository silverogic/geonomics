import rawData from '../../public/api/v1/bigmac.json'
import type { BaseCurrency, Language } from '../types/economics'

export interface BigMacItem {
  countryId: string
  currencyCode: string
  date: string
  localPrice: number
  dollarEx: number
  dollarPrice: number
  valuationRawPct: number // % over (+) or undervalued (-) compared to USD baseline
  valuationAdjustedPct: number | null // GDP-adjusted valuation %
  adjPrice: number | null
  isEurozone: boolean
}

export interface BigMacDataset {
  updatedAt: string
  surveyDate: string
  source: string
  sourceUrl: string
  methodology: string
  baseCountry: string
  basePriceUsd: number
  count: number
  items: Record<string, BigMacItem>
}

export const BIG_MAC_DATA = rawData as BigMacDataset

// Color constants for Big Mac Map & Legend
export const BIG_MAC_COLOR_STRONG_UNDER = '#059669' // Emerald-600 (Super Cheap < -35%)
export const BIG_MAC_COLOR_UNDER = '#06b6d4'        // Cyan-500 (Undervalued -35% ~ -10%)
export const BIG_MAC_COLOR_FAIR = '#f59e0b'         // Amber-500 (Fair Baseline -10% ~ +10%)
export const BIG_MAC_COLOR_OVER = '#f97316'         // Orange-500 (Overvalued +10% ~ +30%)
export const BIG_MAC_COLOR_STRONG_OVER = '#f43f5e'  // Rose-500 (Super Expensive > +30%)
export const BIG_MAC_COLOR_NODATA = '#1e293b'       // Slate-800

/**
 * Returns hex color code for choropleth map tile based on Big Mac raw valuation %
 */
export function getBigMacColor(valuationPct: number | null | undefined): string {
  if (valuationPct === null || valuationPct === undefined || isNaN(valuationPct)) {
    return BIG_MAC_COLOR_NODATA
  }
  if (valuationPct < -35) return BIG_MAC_COLOR_STRONG_UNDER
  if (valuationPct < -10) return BIG_MAC_COLOR_UNDER
  if (valuationPct <= 10) return BIG_MAC_COLOR_FAIR
  if (valuationPct <= 30) return BIG_MAC_COLOR_OVER
  return BIG_MAC_COLOR_STRONG_OVER
}

/**
 * Fast lookup for Big Mac item of a country
 */
export function getBigMacData(countryId: string): BigMacItem | null {
  return BIG_MAC_DATA.items[countryId] ?? null
}

export function getBigMacPriceUsd(countryId: string): number | null {
  return BIG_MAC_DATA.items[countryId]?.dollarPrice ?? null
}

export function getBigMacValuationPct(countryId: string): number | null {
  return BIG_MAC_DATA.items[countryId]?.valuationRawPct ?? null
}

/**
 * Format Big Mac price into active base currency
 */
export function formatBigMacPrice(
  dollarPrice: number | null | undefined,
  baseCurrency: BaseCurrency,
  usdToBase: number,
  _lang: Language = 'en'
): string {
  if (dollarPrice === null || dollarPrice === undefined) {
    return '-'
  }

  const converted = dollarPrice * usdToBase

  if (baseCurrency === 'KRW') {
    return `${Math.round(converted).toLocaleString()}원`
  }
  if (baseCurrency === 'JPY') {
    return `¥${Math.round(converted).toLocaleString()}`
  }
  if (baseCurrency === 'EUR') {
    return `€${converted.toFixed(2)}`
  }
  if (baseCurrency === 'GBP') {
    return `£${converted.toFixed(2)}`
  }
  if (baseCurrency === 'CNY') {
    return `¥${converted.toFixed(2)}`
  }

  // Default USD
  return `$${converted.toFixed(2)}`
}

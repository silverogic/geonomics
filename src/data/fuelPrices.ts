import rawData from './fuelPricesData.json'
import type { BaseCurrency, Language } from '../types/economics'

export interface FuelPriceItem {
  countryId: string
  priceUsd: number
  currencyCode: string
}

export interface FuelPricesDataset {
  updatedAt: string
  source: string
  unit: string
  octaneStandard: string
  noteKo: string
  noteEn: string
  count: number
  prices: Record<string, FuelPriceItem>
}

export const FUEL_DATA = rawData as FuelPricesDataset

// Color thresholds for Option 3 gradient (Teal -> Amber -> Deep Orange)
export const FUEL_COLOR_LOW = '#0d9488' // Teal-600 (Subsidized / low tax / oil producers)
export const FUEL_COLOR_MID = '#d97706' // Amber-600 (World average benchmark ~$1.30/L)
export const FUEL_COLOR_HIGH = '#ea580c' // Orange-600 (High fuel tax / carbon tax $2.20+/L)

export const FUEL_MIN_PRICE = 0.40
export const FUEL_MID_PRICE = 1.30
export const FUEL_MAX_PRICE = 2.40

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.substring(1, 3), 16)
  const g1 = parseInt(c1.substring(3, 5), 16)
  const b1 = parseInt(c1.substring(5, 7), 16)
  const r2 = parseInt(c2.substring(1, 3), 16)
  const g2 = parseInt(c2.substring(3, 5), 16)
  const b2 = parseInt(c2.substring(5, 7), 16)
  const r = lerp(r1, r2, t)
  const g = lerp(g1, g2, t)
  const b = lerp(b1, b2, t)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/**
 * Returns smooth gradient hex color based on Option 3 (Teal -> Amber -> Warm Orange).
 */
export function getFuelPriceColor(priceUsd: number | null | undefined): string {
  if (priceUsd === null || priceUsd === undefined) {
    return '#334155' // slate-700
  }
  const p = Math.max(FUEL_MIN_PRICE, Math.min(FUEL_MAX_PRICE, priceUsd))
  if (p <= FUEL_MID_PRICE) {
    const t = (p - FUEL_MIN_PRICE) / (FUEL_MID_PRICE - FUEL_MIN_PRICE)
    return lerpColor(FUEL_COLOR_LOW, FUEL_COLOR_MID, t)
  } else {
    const t = (p - FUEL_MID_PRICE) / (FUEL_MAX_PRICE - FUEL_MID_PRICE)
    return lerpColor(FUEL_COLOR_MID, FUEL_COLOR_HIGH, t)
  }
}

/**
 * Fast lookup for fuel price data of a country
 */
export function getFuelPriceData(countryId: string): FuelPriceItem | null {
  return FUEL_DATA.prices[countryId] ?? null
}

export function getFuelPriceUsd(countryId: string): number | null {
  return FUEL_DATA.prices[countryId]?.priceUsd ?? null
}

/**
 * Format fuel price into base currency (per Liter)
 */
export function formatFuelPrice(
  priceUsd: number | null | undefined,
  baseCurrency: BaseCurrency,
  usdToBase: number,
  _lang: Language = 'en'
): string {
  if (priceUsd === null || priceUsd === undefined) {
    return '-'
  }

  const converted = priceUsd * usdToBase

  if (baseCurrency === 'KRW') {
    return `${Math.round(converted).toLocaleString()}원/L`
  }
  if (baseCurrency === 'JPY') {
    return `¥${Math.round(converted).toLocaleString()}/L`
  }
  if (baseCurrency === 'EUR') {
    return `€${converted.toFixed(2)}/L`
  }
  if (baseCurrency === 'GBP') {
    return `£${converted.toFixed(2)}/L`
  }
  if (baseCurrency === 'CNY') {
    return `¥${converted.toFixed(2)}/L`
  }

  // Default USD
  return `$${converted.toFixed(2)}/L`
}

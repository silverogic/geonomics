import type { ImfCountryRecord } from '../data/imfEconomic'
import type { StockPriceInfo } from '../data/stockPrices'
import type { FuelPricesDataset } from '../data/fuelPrices'

/**
 * Geonomics Open API Client Configuration
 */
export interface ApiRequestOptions {
  /** Custom base URL (e.g., 'https://silverogic.github.io/geonomics/api/v1' for external apps) */
  baseUrl?: string
  /** Custom fetch init options (headers, cache mode, signal, etc.) */
  fetchOptions?: RequestInit
}

/**
 * Resolves the appropriate API v1 Base URL depending on execution environment.
 * - In local/app environment: uses relative path (`/api/v1` or with BASE_URL prefix)
 * - In external environment: defaults to GitHub Pages production endpoint
 */
export function getDefaultApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const base = import.meta.env?.BASE_URL || '/'
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
    return `${cleanBase}/api/v1`
  }
  return 'https://silverogic.github.io/geonomics/api/v1'
}

/**
 * 1. 거시경제 지표 API (Macroeconomic Indicators)
 * - Endpoint: GET /api/v1/economics.json
 * - Source: World Bank & IMF WEO Official Economic Statistics (110 countries)
 * - Metrics: Total GDP, Per Capita GDP, Growth Rate, Gov Debt Ratio, Inflation Rate (2024-2026)
 */
export async function getEconomics(
  options?: ApiRequestOptions
): Promise<Record<string, ImfCountryRecord>> {
  const baseUrl = options?.baseUrl || getDefaultApiBaseUrl()
  const url = `${baseUrl}/economics.json`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    ...options?.fetchOptions,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch macroeconomic indicators: HTTP ${response.status} (${response.statusText})`)
  }

  return response.json()
}

/**
 * 2. 주가·증시 지표 API (Stock Benchmark Indices)
 * - Endpoint: GET /api/v1/stocks.json
 * - Source: Yahoo Finance & National Stock Exchanges (74 countries)
 * - Metrics: Benchmark index current price, 24h change %, and 30-day sparkline points
 */
export async function getStockPrices(
  options?: ApiRequestOptions
): Promise<Record<string, StockPriceInfo>> {
  const baseUrl = options?.baseUrl || getDefaultApiBaseUrl()
  const url = `${baseUrl}/stocks.json`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    ...options?.fetchOptions,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stock prices: HTTP ${response.status} (${response.statusText})`)
  }

  return response.json()
}

/**
 * 3. 유가(휘발유) 지표 API (Gasoline RON 95 Retail Prices)
 * - Endpoint: GET /api/v1/fuel.json
 * - Source: Global Petrol Prices & National Energy Ministries (170 countries)
 * - Metrics: National average retail gasoline price in USD/L inclusive of taxes
 */
export async function getFuelPrices(
  options?: ApiRequestOptions
): Promise<FuelPricesDataset> {
  const baseUrl = options?.baseUrl || getDefaultApiBaseUrl()
  const url = `${baseUrl}/fuel.json`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    ...options?.fetchOptions,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch fuel prices: HTTP ${response.status} (${response.statusText})`)
  }

  return response.json()
}

/**
 * 4. 종합 지표 병렬 조회 (All Geonomics Data)
 * - Executes all 3 endpoints concurrently via Promise.all
 */
export async function getAllData(options?: ApiRequestOptions) {
  const [economics, stocks, fuel] = await Promise.all([
    getEconomics(options),
    getStockPrices(options),
    getFuelPrices(options),
  ])

  return {
    economics,
    stocks,
    fuel,
    fetchedAt: new Date().toISOString(),
  }
}

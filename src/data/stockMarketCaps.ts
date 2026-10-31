import type { BaseCurrency, Language } from '../types/economics'
import stockMarketCapsDataJson from '../../public/api/v1/stock-market-caps.json'
import { getImfCountryData } from './imfEconomic'

export interface StockMarketCapRecord {
  marketCapUsd: number
  baseCapUsd?: number
  year?: string
  indexMultiplier?: number
  listedCount?: number
  countryName?: string
  source?: string
}

const PREBUILT_CAPS = stockMarketCapsDataJson as Record<string, StockMarketCapRecord>

export const MARKET_CAP_REPORT_DATE = `${new Date().getFullYear()} Live`
export const MARKET_CAP_DATA_SOURCE = 'TradingView Mainboard Exchange Aggregate'

/**
 * Dynamically estimates domestic equity market capitalization from IMF nominal GDP
 * and GDP per capita (Buffett Indicator tiered progression: 10% to 35% of GDP)
 * for smaller developing economies not directly covered by TradingView live exchange feeds.
 */
export function estimateMarketCapFromImfGdp(countryId: string, explicitGdpUsd?: number): number {
  const code = countryId.toUpperCase()
  const imfRecord = getImfCountryData(code)

  let totalGdpUsd = explicitGdpUsd ?? 0
  let gdpPerCapitaUsd = 0

  if (imfRecord && imfRecord.years) {
    const yearKeys = Object.keys(imfRecord.years).sort((a, b) => Number(b) - Number(a))
    for (const yr of yearKeys) {
      const m = imfRecord.years[yr as keyof typeof imfRecord.years]
      if (m && m.totalGdpUsd > 0) {
        if (totalGdpUsd <= 0) totalGdpUsd = m.totalGdpUsd
        if (m.gdpPerCapitaUsd > 0) gdpPerCapitaUsd = m.gdpPerCapitaUsd
        break
      }
    }
  }

  if (totalGdpUsd <= 0) {
    return 5_000_000_000
  }

  // Smooth linear interpolation of Market Cap / GDP ratio between $2,000 (10%) and $30,000 (35%) per capita
  const minRatio = 0.10
  const maxRatio = 0.35
  const clampedPerCapita = Math.max(2000, Math.min(30000, gdpPerCapitaUsd || 5000))
  const t = (clampedPerCapita - 2000) / (30000 - 2000)
  const ratio = minRatio + t * (maxRatio - minRatio)

  return Math.round(totalGdpUsd * ratio)
}

/**
 * Dynamically constructed baseline map from `public/api/v1/stock-market-caps.json`
 * (zero hardcoded country numbers in source code).
 */
export const STOCK_MARKET_CAPS_USD: Record<string, number> = Object.fromEntries(
  Object.entries(PREBUILT_CAPS)
    .filter(([, item]) => item && typeof item.marketCapUsd === 'number' && item.marketCapUsd > 0)
    .map(([code, item]) => [code, item.marketCapUsd])
)

/**
 * Returns domestic stock market capitalization in USD.
 * Reads from the dynamically generated `stock-market-caps.json` dataset first,
 * and falls back to dynamic IMF GDP-based calculation if not present.
 */
export function getStockMarketCapUsd(countryId: string, gdpUsd?: number): number {
  const code = countryId.toUpperCase()
  const prebuilt = PREBUILT_CAPS[code]?.marketCapUsd
  if (typeof prebuilt === 'number' && prebuilt > 0) return prebuilt
  return estimateMarketCapFromImfGdp(code, gdpUsd)
}

/**
 * Formats market capitalization in compact currency unit (e.g. $70.5T, $2.40T, $580B, ₩3,250조).
 */
export function formatStockMarketCap(
  marketCapUsd: number,
  baseCurrency: BaseCurrency,
  usdToBase = 1,
  lang: Language = 'en'
): string {
  const converted = marketCapUsd * (usdToBase > 0 ? usdToBase : 1)

  if (baseCurrency === 'KRW' && lang === 'ko') {
    if (converted >= 1e12) {
      return `₩${(converted / 1e12).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}조`
    }
    return `₩${Math.round(converted / 1e8).toLocaleString('ko-KR')}억`
  }

  const symbol =
    baseCurrency === 'USD'
      ? '$'
      : baseCurrency === 'KRW'
        ? '₩'
        : baseCurrency === 'EUR'
          ? '€'
          : baseCurrency === 'JPY'
            ? '¥'
            : baseCurrency === 'GBP'
              ? '£'
              : baseCurrency === 'CNY'
                ? '¥'
                : baseCurrency === 'AUD'
                  ? 'A$'
                  : baseCurrency === 'CHF'
                    ? 'CHF '
                    : '$'

  if (converted >= 1e12) {
    return `${symbol}${(converted / 1e12).toFixed(2)}T`
  }
  if (converted >= 1e9) {
    return `${symbol}${(converted / 1e9).toFixed(1)}B`
  }
  return `${symbol}${(converted / 1e6).toFixed(0)}M`
}

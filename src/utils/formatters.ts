import type { BaseCurrency, Language } from '../types/economics'

/**
 * Formats large GDP amounts into human-readable compact representations.
 * Supports English (T/B/M) and Korean (조/억/만) based on selected language and currency.
 */
export function formatGdpCompact(
  amountUsd: number,
  baseCurrency: BaseCurrency,
  exchangeRateToBase = 1,
  lang: Language = 'en'
): string {
  if (!amountUsd || isNaN(amountUsd)) return 'N/A'

  const converted = amountUsd * exchangeRateToBase

  // Korean localized format
  if (lang === 'ko' && baseCurrency === 'KRW') {
    const jo = converted / 1_000_000_000_000
    if (jo >= 1) {
      return `${jo.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}조 원`
    }
    const eok = converted / 100_000_000
    if (eok >= 1) {
      return `${eok.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}억 원`
    }
    return `${Math.round(converted).toLocaleString('ko-KR')}원`
  }

  // Japanese localized format
  if (lang === 'ja' && baseCurrency === 'JPY') {
    const cho = converted / 1_000_000_000_000
    if (cho >= 1) {
      return `${cho.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}兆円`
    }
    const oku = converted / 100_000_000
    if (oku >= 1) {
      return `${oku.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}億円`
    }
    return `${Math.round(converted).toLocaleString('ja-JP')}円`
  }

  // Chinese localized format
  if (lang === 'zh' && baseCurrency === 'CNY') {
    const wanyi = converted / 1_000_000_000_000
    if (wanyi >= 1) {
      return `${wanyi.toLocaleString('zh-CN', { maximumFractionDigits: 1 })}万亿元`
    }
    const yi = converted / 100_000_000
    if (yi >= 1) {
      return `${yi.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}亿元`
    }
    return `${Math.round(converted).toLocaleString('zh-CN')}元`
  }

  // Western / English / Spanish format
  const symbol = getCurrencySymbol(baseCurrency)
  if (converted >= 1e12) {
    return `${symbol}${(converted / 1e12).toFixed(2)}T`
  }
  if (converted >= 1e9) {
    return `${symbol}${(converted / 1e9).toFixed(2)}B`
  }
  if (converted >= 1e6) {
    return `${symbol}${(converted / 1e6).toFixed(2)}M`
  }
  return `${symbol}${converted.toLocaleString()}`
}

/**
 * Formats GDP per capita amounts into compact representations.
 */
export function formatPerCapita(
  amountUsd: number,
  baseCurrency: BaseCurrency,
  exchangeRateToBase = 1,
  lang: Language = 'en'
): string {
  if (!amountUsd || isNaN(amountUsd)) return 'N/A'

  const converted = amountUsd * exchangeRateToBase

  if (lang === 'ko' && baseCurrency === 'KRW') {
    const man = converted / 10_000
    if (man >= 1) {
      return `${man.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만 원`
    }
    return `${Math.round(converted).toLocaleString('ko-KR')}원`
  }

  if (lang === 'ja' && baseCurrency === 'JPY') {
    const man = converted / 10_000
    if (man >= 1) {
      return `${man.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}万円`
    }
    return `${Math.round(converted).toLocaleString('ja-JP')}円`
  }

  if (lang === 'zh' && baseCurrency === 'CNY') {
    const wan = converted / 10_000
    if (wan >= 1) {
      return `${wan.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}万元`
    }
    return `${Math.round(converted).toLocaleString('zh-CN')}元`
  }

  return `${getCurrencySymbol(baseCurrency)}${Math.round(converted).toLocaleString()}`
}

/**
 * Formats exchange rate numbers with appropriate decimal places.
 */
export function formatExchangeRate(rate: number, digits = 2): string {
  if (!rate || isNaN(rate)) return '0.00'
  if (rate < 0.001) {
    return rate.toFixed(4)
  }
  if (rate < 1) {
    return rate.toFixed(3)
  }
  return rate.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/**
 * Returns symbol for currency code.
 */
export function getCurrencySymbol(code: string): string {
  switch (code) {
    case 'KRW':
      return '₩'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'JPY':
      return '¥'
    case 'GBP':
      return '£'
    case 'CNY':
      return '¥'
    case 'CHF':
      return 'CHF '
    case 'AUD':
      return 'A$'
    default:
      return code + ' '
  }
}

/**
 * Returns color classes for GDP per capita:
 * Standardized to white (text-white) to match Total GDP and user preference.
 */
export function getPerCapitaColorClass(gdpPerCapitaUsd: number | null | undefined): string {
  if (!gdpPerCapitaUsd || gdpPerCapitaUsd <= 0) return 'text-slate-400'
  return 'text-white'
}

/**
 * Returns text color class for inflation rate:
 * <= 2.5%: Emerald (text-emerald-400) - Stable
 * <= 4.5%: Slate (text-slate-300) - Moderate
 * > 4.5%: Rose (text-rose-400) - Overheated
 */
export function getInflationColorClass(inflationRatePct: number | null | undefined): string {
  if (inflationRatePct === null || inflationRatePct === undefined) return 'text-slate-400'
  if (inflationRatePct <= 2.5) return 'text-emerald-400'
  if (inflationRatePct <= 4.5) return 'text-slate-300'
  return 'text-rose-400'
}

/**
 * Returns badge styling classes for inflation rate pill badges.
 */
export function getInflationBadgeClass(inflationRatePct: number | null | undefined): string {
  if (inflationRatePct === null || inflationRatePct === undefined) {
    return 'text-slate-400 bg-slate-900/60 border-slate-800'
  }
  if (inflationRatePct <= 2.5) {
    return 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
  }
  if (inflationRatePct <= 4.5) {
    return 'text-slate-300 bg-slate-800/60 border-slate-600/30'
  }
  return 'text-rose-400 bg-rose-950/60 border-rose-500/30'
}

/**
 * Returns hex color code for choropleth map fills (Emerald -> Amber -> Rose).
 */
export function getInflationHexColor(inflationRatePct: number | null | undefined): string {
  if (inflationRatePct === null || inflationRatePct === undefined) return '#334155'
  if (inflationRatePct <= 2.5) return '#10b981' // emerald-500
  if (inflationRatePct <= 4.5) return '#f59e0b' // amber-500 (caution)
  return '#f43f5e'                              // rose-500
}

/**
 * Returns text color class for FX rate based on 24h change percentage (matches 777 Slot Machine):
 * - Rising (> +0.01%): Green (text-emerald-400)
 * - Falling (< -0.01%): Red (text-rose-400)
 * - Minimal change (-0.01% ~ +0.01%) or unavailable: White (text-slate-100)
 */
export function getFxRateColorClass(changePct?: number | null): string {
  if (changePct == null || Math.abs(changePct) <= 0.01) {
    return 'text-slate-100'
  }
  return changePct > 0.01 ? 'text-emerald-400' : 'text-rose-400'
}

/**
 * Returns pill badge classes for 24h FX change percentage (matches 777 Slot Machine).
 */
export function getFxBadgeColorClass(changePct: number): string {
  if (Math.abs(changePct) <= 0.01) {
    return 'text-slate-300 bg-slate-800/50 border border-slate-700/50'
  }
  return changePct > 0.01
    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
}

/**
 * Formats 24h FX change percentage with directional triangle (▲ / ▼) matching the 777 Slot Machine.
 */
export function formatFxChangeBadgeText(changePct: number): string {
  if (changePct > 0.01) return `▲ +${changePct.toFixed(2)}%`
  if (changePct < -0.01) return `▼ ${changePct.toFixed(2)}%`
  return `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`
}

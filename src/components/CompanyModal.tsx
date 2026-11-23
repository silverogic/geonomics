import React, { useEffect, useMemo, useState } from 'react'
import { X, TrendingUp, TrendingDown, ExternalLink, Globe } from 'lucide-react'
import type { BaseCurrency, CountryMeta, Language } from '../types/economics'
import type { CompanyHeatmapItem } from './CompanyTreemapPanel'
import { buildCompany30dPoints } from './CompanyTreemapPanel'
import {
  fetchCompanyFundamentals,
  type CompanyFundamentals,
} from '../services/topCompaniesApi'
import { formatStockMarketCap } from '../data/stockMarketCaps'
import { getCountryName } from '../utils/countryNames'
import { CountryFlag } from './CountryFlag'
import { CompanyLogo } from './CompanyLogo'
import { SectorIcon } from './SectorIcon'
import { StockSparkline } from './StockSparkline'
import { Spinner } from './Spinner'

interface CompanyModalProps {
  item: CompanyHeatmapItem | null
  onClose: () => void
  onOpenCountry: (country: CountryMeta) => void
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
}

const MODAL_LABELS: Record<
  Language,
  {
    trend30d: string
    range52w: string
    marketCap: string
    revenue: string
    netIncome: string
    opMargin: string
    peRatio: string
    countryInfo: string
    viewOnTv: string
    perf1W: string
    perf1M: string
    perfYtd: string
    perf1Y: string
  }
> = {
  ko: {
    trend30d: '30일 등락 추이',
    range52w: '52주 가격 범위',
    marketCap: '시가총액',
    revenue: '연매출 (TTM)',
    netIncome: '순이익 (TTM)',
    opMargin: '영업이익률',
    peRatio: 'PER (TTM)',
    countryInfo: '소속 국가 정보',
    viewOnTv: 'TradingView에서 보기',
    perf1W: '1주',
    perf1M: '1개월',
    perfYtd: '연초대비',
    perf1Y: '1년',
  },
  en: {
    trend30d: '30D Trend',
    range52w: '52-Week Range',
    marketCap: 'Market Cap',
    revenue: 'Revenue (TTM)',
    netIncome: 'Net Income (TTM)',
    opMargin: 'Operating Margin',
    peRatio: 'P/E Ratio (TTM)',
    countryInfo: 'Country Overview',
    viewOnTv: 'Open on TradingView',
    perf1W: '1W',
    perf1M: '1M',
    perfYtd: 'YTD',
    perf1Y: '1Y',
  },
  ja: {
    trend30d: '30日推移',
    range52w: '52週レンジ',
    marketCap: '時価総額',
    revenue: '売上高 (TTM)',
    netIncome: '純利益 (TTM)',
    opMargin: '営業利益率',
    peRatio: 'PER (TTM)',
    countryInfo: '国別詳細を見る',
    viewOnTv: 'TradingViewで見る',
    perf1W: '1週',
    perf1M: '1ヶ月',
    perfYtd: '年初来',
    perf1Y: '1年',
  },
  es: {
    trend30d: 'Tendencia 30D',
    range52w: 'Rango 52 semanas',
    marketCap: 'Cap. bursátil',
    revenue: 'Ingresos (TTM)',
    netIncome: 'Beneficio neto',
    opMargin: 'Margen operativo',
    peRatio: 'PER (TTM)',
    countryInfo: 'Ver país',
    viewOnTv: 'Ver en TradingView',
    perf1W: '1S',
    perf1M: '1M',
    perfYtd: 'YTD',
    perf1Y: '1A',
  },
  zh: {
    trend30d: '30日走势',
    range52w: '52周价格区间',
    marketCap: '总市值',
    revenue: '年营收 (TTM)',
    netIncome: '净利润 (TTM)',
    opMargin: '营业利润率',
    peRatio: '市盈率 (TTM)',
    countryInfo: '查看国家详情',
    viewOnTv: '在 TradingView 查看',
    perf1W: '1周',
    perf1M: '1月',
    perfYtd: '年初至今',
    perf1Y: '1年',
  },
  hi: {
    trend30d: '30D रुझान',
    range52w: '52-सप्ताह रेंज',
    marketCap: 'मार्केट कैप',
    revenue: 'राजस्व (TTM)',
    netIncome: 'शुद्ध लाभ (TTM)',
    opMargin: 'ऑपरेटिंग मार्जिन',
    peRatio: 'P/E अनुपात',
    countryInfo: 'देश विवरण',
    viewOnTv: 'TradingView पर देखें',
    perf1W: '1W',
    perf1M: '1M',
    perfYtd: 'YTD',
    perf1Y: '1Y',
  },
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  item,
  onClose,
  onOpenCountry,
  baseCurrency,
  usdToBase,
  lang,
}) => {
  const [fundamentals, setFundamentals] = useState<CompanyFundamentals | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!item) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [item, onClose])

  useEffect(() => {
    if (!item) {
      setFundamentals(null)
      return
    }
    let active = true
    setIsLoading(true)
    setFundamentals(null)
    fetchCompanyFundamentals(item.company.symbol).then((data) => {
      if (!active) return
      setFundamentals(data)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [item])

  const sparklinePoints = useMemo(
    () => (item ? buildCompany30dPoints(item.company) : []),
    [item]
  )

  if (!item) return null

  const { company, country } = item
  const L = MODAL_LABELS[lang]
  const isUp1D = company.changePct >= 0
  const perf30d = fundamentals?.perf1MPct ?? company.changePct30d ?? company.changePct
  const isUp30d = perf30d >= 0

  const high52w = fundamentals?.high52w ?? null
  const low52w = fundamentals?.low52w ?? null
  const range52wPct =
    high52w != null && low52w != null && high52w > low52w && company.price > 0
      ? Math.min(100, Math.max(0, ((company.price - low52w) / (high52w - low52w)) * 100))
      : null

  const tvUrl = `https://www.tradingview.com/symbols/${encodeURIComponent(
    `${company.exchange}-${company.ticker}`
  )}/`

  const formatSignedPct = (val: number | null | undefined) => {
    if (val == null || Number.isNaN(val)) return 'N/A'
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={company.name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden select-text"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              logoUrl={company.logoUrl}
              name={company.name}
              ticker={company.ticker}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-black text-white leading-tight truncate">
                {company.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs font-medium font-mono text-slate-300">
                <span>{company.symbol}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-slate-200 font-sans font-semibold">
                  <CountryFlag iso2={country.iso2} className="w-4 h-3 rounded-[2px]" />
                  {getCountryName(country, lang)}
                </span>
                {company.sector && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-indigo-300 font-sans font-semibold">
                      <SectorIcon sectorKey={company.sectorKey} className="w-3.5 h-3.5 text-indigo-400" />
                      {company.sector}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Price + Market Cap */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-black font-mono text-white tabular-nums">
                  {company.price > 0
                    ? `${company.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${company.priceCurrency}`
                    : 'N/A'}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-mono text-xs font-black tabular-nums ${
                    isUp1D
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/35'
                  }`}
                >
                  {isUp1D ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatSignedPct(company.changePct)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400 font-semibold">{L.marketCap}</div>
              <div className="text-base font-mono font-black text-indigo-300 tabular-nums mt-0.5">
                {formatStockMarketCap(company.marketCapUsd, baseCurrency, usdToBase, lang)}
              </div>
            </div>
          </div>

          {/* 30D Trend Sparkline + 4 Period Chips */}
          {sparklinePoints.length > 1 && (
            <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{L.trend30d}</span>
                <span
                  className={`text-sm font-mono font-extrabold tabular-nums ${
                    isUp30d ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {formatSignedPct(perf30d)}
                </span>
              </div>
              <div className="h-12 w-full">
                <StockSparkline
                  points={sparklinePoints}
                  isPositive={isUp30d}
                  width={420}
                  height={48}
                  className="w-full"
                />
              </div>

              {/* Period Returns Strip */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/70">
                {[
                  { label: L.perf1W, val: fundamentals?.perfWeekPct ?? company.perfWeekPct ?? null },
                  { label: L.perf1M, val: fundamentals?.perf1MPct ?? company.changePct30d ?? null },
                  { label: L.perfYtd, val: fundamentals?.perfYtdPct ?? null },
                  { label: L.perf1Y, val: fundamentals?.perf1YPct ?? null },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="rounded-lg bg-slate-900/80 px-2 py-1.5 text-center"
                  >
                    <div className="text-xs font-medium text-slate-400">{p.label}</div>
                    <div
                      className={`text-xs font-mono font-extrabold tabular-nums mt-0.5 ${
                        p.val == null
                          ? 'text-slate-500'
                          : p.val >= 0
                            ? 'text-emerald-300'
                            : 'text-rose-300'
                      }`}
                    >
                      {formatSignedPct(p.val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 52-Week Range Bar */}
          {range52wPct !== null && low52w !== null && high52w !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-bold">{L.range52w}</span>
                <span className="font-mono font-semibold text-slate-300 tabular-nums">
                  {low52w.toLocaleString(undefined, { maximumFractionDigits: 2 })} —{' '}
                  {high52w.toLocaleString(undefined, { maximumFractionDigits: 2 })} {company.priceCurrency}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-800 overflow-visible">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500/70 via-amber-400/70 to-emerald-400/80"
                  style={{ width: `${range52wPct}%` }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow"
                  style={{ left: `${range52wPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Core 4 Financials (Minimal, Low-Fatigue 2x2 Grid) */}
          {isLoading ? (
            <div className="py-4 flex items-center justify-center">
              <Spinner size="sm" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
                <div className="text-xs text-slate-400 font-semibold">{L.revenue}</div>
                <div className="text-base font-mono font-black text-white tabular-nums mt-1">
                  {fundamentals?.revenueUsd != null
                    ? formatStockMarketCap(fundamentals.revenueUsd, baseCurrency, usdToBase, lang)
                    : 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
                <div className="text-xs text-slate-400 font-semibold">{L.netIncome}</div>
                <div
                  className={`text-base font-mono font-black tabular-nums mt-1 ${
                    fundamentals?.netIncomeUsd == null
                      ? 'text-slate-400'
                      : fundamentals.netIncomeUsd >= 0
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                  }`}
                >
                  {fundamentals?.netIncomeUsd != null
                    ? `${fundamentals.netIncomeUsd < 0 ? '-' : ''}${formatStockMarketCap(
                        Math.abs(fundamentals.netIncomeUsd),
                        baseCurrency,
                        usdToBase,
                        lang
                      )}`
                    : 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
                <div className="text-xs text-slate-400 font-semibold">{L.opMargin}</div>
                <div className="text-base font-mono font-black text-white tabular-nums mt-1">
                  {fundamentals?.operatingMarginPct != null
                    ? `${fundamentals.operatingMarginPct.toFixed(1)}%`
                    : 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
                <div className="text-xs text-slate-400 font-semibold">{L.peRatio}</div>
                <div className="text-base font-mono font-black text-white tabular-nums mt-1">
                  {fundamentals?.peRatio != null ? `${fundamentals.peRatio.toFixed(1)}x` : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-800 bg-slate-950/50 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenCountry(country)
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{L.countryInfo}</span>
          </button>

          <a
            href={tvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 font-semibold transition-colors"
          >
            <span>{L.viewOnTv}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

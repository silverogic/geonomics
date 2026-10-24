import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Maximize2, Minimize2, TrendingUp, TrendingDown } from 'lucide-react'
import type { CountryMeta, BaseCurrency, Language } from '../types/economics'
import { formatStockMarketCap } from '../data/stockMarketCaps'
import { computeSquarifiedTreemap, type TreemapRect } from '../utils/squarifiedTreemap'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import { CompanyLogo } from './CompanyLogo'
import { SectorIcon } from './SectorIcon'
import type { TopCompanyItem } from '../services/topCompaniesApi'

export interface CompanyHeatmapItem {
  id: string // e.g. "USA:NASDAQ:NVDA"
  country: CountryMeta
  company: TopCompanyItem
  nationalCapUsd: number
}

interface CompanyTreemapPanelProps {
  title: string
  sectorKey?: string
  items: CompanyHeatmapItem[]
  height: number
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  onZoom?: () => void
  isZoomed?: boolean
  showZoomBtn?: boolean
  hideHeader?: boolean
}

function getPerformanceColor(changePct: number, isHovered = false) {
  if (changePct >= 3.0) {
    return {
      bg: isHovered ? '#059669' : '#047857',
      border: '#10b981',
      text: '#ecfdf5',
      badgeBg: 'rgba(16, 185, 129, 0.25)',
      badgeText: '#6ee7b7',
    }
  }
  if (changePct >= 1.0) {
    return {
      bg: isHovered ? '#047857' : '#065f46',
      border: '#059669',
      text: '#d1fae5',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeText: '#a7f3d0',
    }
  }
  if (changePct > 0.2) {
    return {
      bg: isHovered ? '#064e3b' : '#022c22',
      border: '#047857',
      text: '#a7f3d0',
      badgeBg: 'rgba(5, 150, 105, 0.15)',
      badgeText: '#6ee7b7',
    }
  }
  if (changePct >= -0.2) {
    return {
      bg: isHovered ? '#334155' : '#1e293b',
      border: '#475569',
      text: '#cbd5e1',
      badgeBg: 'rgba(100, 116, 139, 0.25)',
      badgeText: '#94a3b8',
    }
  }
  if (changePct > -1.0) {
    return {
      bg: isHovered ? '#7f1d1d' : '#450a0a',
      border: '#991b1b',
      text: '#fecdd3',
      badgeBg: 'rgba(244, 63, 94, 0.15)',
      badgeText: '#fda4af',
    }
  }
  if (changePct > -3.0) {
    return {
      bg: isHovered ? '#9f1239' : '#881337',
      border: '#be123c',
      text: '#ffe4e6',
      badgeBg: 'rgba(244, 63, 94, 0.2)',
      badgeText: '#fecdd3',
    }
  }
  return {
    bg: isHovered ? '#be123c' : '#9f1239',
    border: '#f43f5e',
    text: '#ffffff',
    badgeBg: 'rgba(244, 63, 94, 0.3)',
    badgeText: '#ffe4e6',
  }
}

export const CompanyTreemapPanel: React.FC<CompanyTreemapPanelProps> = ({
  title,
  sectorKey = 'Other',
  items,
  height,
  baseCurrency,
  usdToBase,
  lang,
  onSelectCountry,
  onZoom,
  isZoomed = false,
  showZoomBtn = false,
  hideHeader = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width)
        }
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Aggregate sector / panel stats
  const { totalCap, avgChange } = useMemo(() => {
    let cap = 0
    let weightedChange = 0
    for (const it of items) {
      cap += it.company.marketCapUsd
      weightedChange += it.company.changePct * it.company.marketCapUsd
    }
    return {
      totalCap: cap,
      avgChange: cap > 0 ? weightedChange / cap : 0,
    }
  }, [items])

  const hoveredItem = useMemo(() => {
    if (!hoveredItemId) return null
    return items.find((it) => it.id === hoveredItemId) || null
  }, [hoveredItemId, items])

  const rects: TreemapRect<CompanyHeatmapItem>[] = useMemo(() => {
    if (containerWidth <= 0 || height <= 0 || items.length === 0) return []
    return computeSquarifiedTreemap(
      items.map((item) => ({
        id: item.id,
        value: Math.max(item.company.marketCapUsd, 1_000_000_000),
        data: item,
      })),
      containerWidth,
      height
    )
  }, [items, containerWidth, height])

  const hoveredRect = useMemo(() => {
    if (!hoveredItemId) return null
    return rects.find((r) => r.data.id === hoveredItemId) || null
  }, [hoveredItemId, rects])

  const placeHudLeft = useMemo(() => {
    if (!hoveredRect || containerWidth <= 0) return false
    const centerX = hoveredRect.x + hoveredRect.w / 2
    return centerX > containerWidth * 0.55
  }, [hoveredRect, containerWidth])

  return (
    <div className="rounded-xl bg-slate-900/95 border border-slate-800/90 overflow-hidden shadow-xl flex flex-col">
      {/* Optional Panel Header (shown in Sector Split View or Zoomed Sector View) */}
      {!hideHeader && (
        <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <SectorIcon sectorKey={sectorKey} className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-extrabold text-white tracking-tight truncate">{title}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 font-mono font-bold shrink-0">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-slate-200">
              {formatStockMarketCap(totalCap, baseCurrency, usdToBase, lang)}
            </span>
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                avgChange >= 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {avgChange > 0 ? `+${avgChange.toFixed(2)}%` : `${avgChange.toFixed(2)}%`}
            </span>
            {showZoomBtn && onZoom && (
              <button
                onClick={onZoom}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isZoomed ? 'Minimize' : 'Maximize'}
              >
                {isZoomed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Treemap Canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-slate-950 select-none overflow-hidden"
        style={{ height: `${height}px` }}
        onMouseLeave={() => setHoveredItemId(null)}
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs font-medium">
            {lang === 'ko' ? '조건에 일치하는 종목 데이터가 없습니다.' : 'No company data matches the criteria.'}
          </div>
        ) : (
          rects.map((rect) => {
            const item = rect.data
            const { company, country } = item
            const isHovered = hoveredItemId === item.id
            const colors = getPerformanceColor(company.changePct, isHovered)

            const w = rect.w
            const h = rect.h

            const isExtraLarge = w >= 210 && h >= 135
            const isWide = w >= 135 && h >= 88
            const isMedium = w >= 88 && h >= 58
            const isCompact = w >= 54 && h >= 36
            const isTiny = w >= 28 && h >= 20

            const changeText =
              company.changePct > 0
                ? `+${company.changePct.toFixed(2)}%`
                : `${company.changePct.toFixed(2)}%`

            return (
              <div
                key={item.id}
                onClick={() => onSelectCountry(country)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                style={{
                  position: 'absolute',
                  left: `${rect.x}px`,
                  top: `${rect.y}px`,
                  width: `${Math.max(0, w)}px`,
                  height: `${Math.max(0, h)}px`,
                  padding: '1.5px',
                }}
                className="group cursor-pointer transition-all duration-150"
              >
                <div
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: isHovered ? '#ffffff' : colors.border,
                    color: colors.text,
                  }}
                  className={`w-full h-full rounded-[4px] border overflow-hidden relative flex flex-col justify-between transition-all duration-150 ${
                    isHovered ? 'z-20 ring-2 ring-white/80 shadow-xl scale-[1.005]' : 'border-opacity-50'
                  }`}
                >
                  {isExtraLarge ? (
                    /* LEVEL 1: EXTRA LARGE COMPANY TILE */
                    <div className="p-2.5 flex flex-col justify-between h-full w-full">
                      <div className="flex items-start justify-between gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <CompanyLogo
                            logoUrl={company.logoUrl}
                            name={company.name}
                            ticker={company.ticker}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm sm:text-base leading-tight truncate drop-shadow-sm">
                              {company.name}
                            </div>
                            <div className="text-[10px] opacity-85 font-mono truncate flex items-center gap-1 mt-0.5">
                              <CountryFlag
                                iso2={country.iso2}
                                className="w-3.5 h-2.5 rounded-[2px] shrink-0"
                              />
                              <span>
                                {company.exchange}:{company.ticker}
                              </span>
                              <span className="opacity-60">·</span>
                              <span className="font-bold">#{company.rank}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          className="px-1.5 py-0.5 rounded text-xs font-mono font-black shrink-0 border border-white/10"
                        >
                          {changeText}
                        </span>
                      </div>

                      {company.sector && (
                        <div className="my-auto flex items-center gap-1 text-[10px] font-medium opacity-80 truncate">
                          <SectorIcon sectorKey={company.sectorKey} className="w-3 h-3 shrink-0 opacity-90" />
                          <span className="truncate">{company.sector}</span>
                        </div>
                      )}

                      <div className="flex items-end justify-between gap-1 pt-1 border-t border-white/10">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider opacity-70 font-semibold">
                            {getCountryName(country, lang)} Top #{company.rank}
                          </div>
                          <div className="text-sm sm:text-base font-mono font-black tracking-tight leading-none mt-0.5">
                            {formatStockMarketCap(company.marketCapUsd, baseCurrency, usdToBase, lang)}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono opacity-85 text-right">
                          {company.price > 0
                            ? `${company.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${company.priceCurrency}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  ) : isWide ? (
                    /* LEVEL 2: WIDE COMPANY TILE */
                    <div className="p-2 flex flex-col justify-between h-full w-full">
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CompanyLogo
                            logoUrl={company.logoUrl}
                            name={company.name}
                            ticker={company.ticker}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs leading-tight truncate">{company.name}</div>
                            <div className="text-[9px] font-mono opacity-80 truncate flex items-center gap-1">
                              <CountryFlag
                                iso2={country.iso2}
                                className="w-3 h-2 rounded-[1px] shrink-0"
                              />
                              <span>{company.ticker}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-1 mt-auto">
                        <span className="text-[11px] font-mono font-extrabold truncate">
                          {formatStockMarketCap(company.marketCapUsd, baseCurrency, usdToBase, lang)}
                        </span>
                        <span
                          style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          className="px-1 py-0.5 rounded text-[10px] font-mono font-black shrink-0"
                        >
                          {changeText}
                        </span>
                      </div>
                    </div>
                  ) : isMedium ? (
                    /* LEVEL 3: MEDIUM COMPANY TILE */
                    <div className="p-1.5 flex flex-col justify-between h-full w-full">
                      <div className="flex items-center gap-1 min-w-0">
                        <CompanyLogo
                          logoUrl={company.logoUrl}
                          name={company.name}
                          ticker={company.ticker}
                          size="xs"
                        />
                        <span className="font-bold text-[11px] truncate leading-tight">
                          {company.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-auto">
                        <span className="text-[9px] font-mono opacity-80 truncate">{company.ticker}</span>
                        <span className="text-[10px] font-mono font-black shrink-0">{changeText}</span>
                      </div>
                    </div>
                  ) : isCompact ? (
                    /* LEVEL 4: COMPACT COMPANY TILE */
                    <div className="p-1 flex flex-col items-center justify-center text-center h-full w-full leading-none">
                      <div className="font-bold text-[10px] truncate max-w-full">{company.ticker}</div>
                      <div className="text-[9px] font-mono font-semibold opacity-95 mt-0.5">
                        {changeText}
                      </div>
                    </div>
                  ) : isTiny ? (
                    /* LEVEL 5: TINY TILE */
                    <div className="flex items-center justify-center h-full w-full">
                      <span className="text-[8px] font-mono font-bold truncate px-0.5">
                        {company.ticker}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })
        )}

        {/* Floating Glassmorphic HUD on Company Hover */}
        {hoveredItem && (
          <div
            className={`pointer-events-none absolute top-3 ${
              placeHudLeft ? 'left-3' : 'right-3'
            } z-30 w-72 sm:w-80 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700/90 p-3.5 shadow-2xl transition-all duration-150`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <CompanyLogo
                  logoUrl={hoveredItem.company.logoUrl}
                  name={hoveredItem.company.name}
                  ticker={hoveredItem.company.ticker}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="font-black text-white text-sm leading-tight truncate">
                    {hoveredItem.company.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>{hoveredItem.company.symbol}</span>
                    <span>·</span>
                    <span className="text-indigo-400 font-bold">
                      {hoveredItem.country.id} #{hoveredItem.company.rank}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`px-2 py-0.5 rounded-md font-mono text-xs font-black flex items-center gap-1 shrink-0 ${
                  hoveredItem.company.changePct >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {hoveredItem.company.changePct >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {hoveredItem.company.changePct > 0
                    ? `+${hoveredItem.company.changePct.toFixed(2)}%`
                    : `${hoveredItem.company.changePct.toFixed(2)}%`}
                </span>
              </div>
            </div>

            {/* Country & Sector Badges */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-semibold">
                <CountryFlag
                  iso2={hoveredItem.country.iso2}
                  className="w-4 h-3 rounded-[2px]"
                />
                <span>{getCountryName(hoveredItem.country, lang)}</span>
              </span>
              {hoveredItem.company.sector && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-300 font-semibold">
                  <SectorIcon
                    sectorKey={hoveredItem.company.sectorKey}
                    className="w-3 h-3 text-indigo-400 shrink-0"
                  />
                  <span>{hoveredItem.company.sector}</span>
                </span>
              )}
            </div>

            {/* Market Cap & Share Price */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/90 grid grid-cols-2 gap-2">
              <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/70">
                <div className="text-[10px] text-slate-400 font-medium">
                  {lang === 'ko' ? '시가총액' : 'Market Cap'}
                </div>
                <div className="text-xs font-mono font-black text-white mt-0.5">
                  {formatStockMarketCap(
                    hoveredItem.company.marketCapUsd,
                    baseCurrency,
                    usdToBase,
                    lang
                  )}
                </div>
                {hoveredItem.nationalCapUsd > 0 && (
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                    {lang === 'ko' ? '자국 증시 비중' : 'National Share'}{' '}
                    {Math.min(
                      99.9,
                      (hoveredItem.company.marketCapUsd / hoveredItem.nationalCapUsd) * 100
                    ).toFixed(1)}
                    %
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/70">
                <div className="text-[10px] text-slate-400 font-medium">
                  {lang === 'ko' ? '현재 주가' : 'Share Price'}
                </div>
                <div className="text-xs font-mono font-black text-white mt-0.5">
                  {hoveredItem.company.price > 0
                    ? `${hoveredItem.company.price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} ${hoveredItem.company.priceCurrency}`
                    : '—'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {hoveredItem.company.exchange}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useMemo, useRef, useEffect, useState } from 'react'
import type { CountryMeta, BaseCurrency, Language, EconomicYear } from '../types/economics'
import type { CountryRowItem } from './RankingTable'
import type { MapMetric } from './GdpWorldMap'
import { computeSquarifiedTreemap, type TreemapRect } from '../utils/squarifiedTreemap'
import { formatGdpCompact, formatPerCapita } from '../utils/formatters'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import { translations } from '../i18n/translations'
import { getImfCountryData } from '../data/imfEconomic'
import { TrendingUp, TrendingDown, Globe } from 'lucide-react'

interface GdpTreemapProps {
  items: CountryRowItem[]
  allItems: CountryRowItem[]
  metric: MapMetric
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  searchQuery?: string
  hoveredCountryId: string | null
  pinnedCountryId: string | null
  getCountryFill: (countryId: string) => string
  onHoverCountry: (countryId: string | null) => void
  onSelectCountry: (country: CountryMeta) => void
  selectedYear: EconomicYear
}

interface ProcessedTreemapItem {
  item: CountryRowItem
  currentVal: number
  prevVal: number | null
  yoyPct: number | null
  debtDiff: number | null
  weight: number
  totalDebtUsd?: number
}

interface ColorStyle {
  bg: string
  border: string
  badgeBg: string
  badgeText: string
}

function getItemColor(metric: MapMetric, yoyPct: number | null, isHovered = false): ColorStyle {
  if (yoyPct === null || yoyPct === undefined) {
    return {
      bg: isHovered ? '#334155' : '#1e293b',
      border: '#475569',
      badgeBg: 'rgba(100, 116, 139, 0.25)',
      badgeText: '#94a3b8',
    }
  }

  if (metric === 'debt') {
    // For national debt: increase is risk (red/amber), decrease is fiscal health (emerald)
    if (yoyPct > 5.0) {
      return {
        bg: isHovered ? '#9f1239' : '#881337',
        border: '#e11d48',
        badgeBg: 'rgba(225, 29, 72, 0.3)',
        badgeText: '#fda4af',
      }
    }
    if (yoyPct > 0.0) {
      return {
        bg: isHovered ? '#854d0e' : '#713f12',
        border: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.25)',
        badgeText: '#fde68a',
      }
    }
    return {
      bg: isHovered ? '#059669' : '#047857',
      border: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.25)',
      badgeText: '#6ee7b7',
    }
  }

  // For GDP and GDP per Capita: growth is positive
  if (yoyPct >= 5.0) {
    return {
      bg: isHovered ? '#059669' : '#047857',
      border: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.3)',
      badgeText: '#6ee7b7',
    }
  }
  if (yoyPct >= 2.0) {
    return {
      bg: isHovered ? '#047857' : '#065f46',
      border: '#059669',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeText: '#a7f3d0',
    }
  }
  if (yoyPct >= 0.0) {
    return {
      bg: isHovered ? '#1e293b' : '#0f172a',
      border: '#334155',
      badgeBg: 'rgba(100, 116, 139, 0.25)',
      badgeText: '#cbd5e1',
    }
  }
  return {
    bg: isHovered ? '#9f1239' : '#881337',
    border: '#e11d48',
    badgeBg: 'rgba(244, 63, 94, 0.25)',
    badgeText: '#fda4af',
  }
}

export const GdpTreemap: React.FC<GdpTreemapProps> = ({
  items,
  allItems,
  metric,
  baseCurrency,
  usdToBase,
  lang,
  searchQuery = '',
  hoveredCountryId,
  pinnedCountryId,
  onHoverCountry,
  onSelectCountry,
  selectedYear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1100)
  const t = translations[lang]

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

  const prevYearNum = parseInt(selectedYear, 10) - 1
  const prevYearStr = String(prevYearNum)

  // World total GDP for share % calculation
  const worldTotalGdp = useMemo(() => {
    return allItems.reduce((acc, it) => acc + (it.totalGdpUsd > 0 ? it.totalGdpUsd : 0), 0)
  }, [allItems])

  // Filter valid items & calculate YoY change compared to previous year
  const processedItems = useMemo<ProcessedTreemapItem[]>(() => {
    const list: ProcessedTreemapItem[] = []

    for (const item of items) {
      if (item.totalGdpUsd <= 0) continue

      const imf = getImfCountryData(item.country.id)
      const prevMetrics = imf?.years?.[prevYearStr] || imf?.historical?.find((h) => h.year === prevYearNum)

      let currentVal = 0
      let prevVal: number | null = null
      let yoyPct: number | null = null
      let debtDiff: number | null = null
      let weight = 1
      let totalDebtUsd: number | undefined

      if (metric === 'gdp') {
        currentVal = item.totalGdpUsd
        prevVal = prevMetrics ? ('totalGdpUsd' in prevMetrics ? prevMetrics.totalGdpUsd : prevMetrics.gdp) : null
        if (currentVal > 0 && prevVal && prevVal > 0) {
          yoyPct = ((currentVal - prevVal) / prevVal) * 100
        } else if (item.growthRatePct !== null) {
          yoyPct = item.growthRatePct
        }
        weight = currentVal
      } else if (metric === 'perCapita') {
        currentVal = item.gdpPerCapitaUsd
        prevVal = prevMetrics
          ? 'gdpPerCapitaUsd' in prevMetrics
            ? prevMetrics.gdpPerCapitaUsd
            : prevMetrics.gdpPerCapita ?? null
          : null
        if (currentVal > 0 && prevVal && prevVal > 0) {
          yoyPct = ((currentVal - prevVal) / prevVal) * 100
        }
        weight = Math.max(1, currentVal)
      } else if (metric === 'debt') {
        currentVal = item.debtRatioPct ?? 0
        prevVal = prevMetrics
          ? 'debtRatioPct' in prevMetrics
            ? prevMetrics.debtRatioPct
            : prevMetrics.debtRatio ?? null
          : null
        if (prevVal !== null && prevVal > 0) {
          yoyPct = ((currentVal - prevVal) / prevVal) * 100
          debtDiff = currentVal - prevVal
        }
        // Area proportional to national debt volume (Total GDP * Debt Ratio)
        totalDebtUsd = item.totalGdpUsd * (Math.max(1, currentVal) / 100)
        weight = Math.max(10_000_000, totalDebtUsd)
      }

      list.push({
        item,
        currentVal,
        prevVal,
        yoyPct,
        debtDiff,
        weight,
        totalDebtUsd,
      })
    }

    // Sort descending by weight for squarification
    list.sort((a, b) => b.weight - a.weight)
    return list
  }, [items, metric, prevYearNum, prevYearStr])

  // Summary statistics
  const summary = useMemo(() => {
    let sumWeight = 0
    let weightedYoySum = 0
    let countWithYoy = 0

    for (const p of processedItems) {
      sumWeight += p.weight
      if (p.yoyPct !== null) {
        weightedYoySum += p.yoyPct * p.weight
        countWithYoy++
      }
    }

    const avgYoy = sumWeight > 0 ? weightedYoySum / sumWeight : 0

    return {
      totalCount: processedItems.length,
      avgYoy,
      sumWeight,
    }
  }, [processedItems])

  // Responsive canvas height
  const treemapHeight = useMemo(() => {
    if (containerWidth < 640) return 460
    if (containerWidth < 1024) return 520
    return 560
  }, [containerWidth])

  // Compute squarified rectangles
  const rects: TreemapRect<ProcessedTreemapItem>[] = useMemo(() => {
    if (processedItems.length === 0 || containerWidth <= 0 || treemapHeight <= 0) return []
    const inputs = processedItems.map((p) => ({
      id: p.item.country.id,
      value: p.weight,
      data: p,
    }))
    return computeSquarifiedTreemap(inputs, containerWidth, treemapHeight)
  }, [processedItems, containerWidth, treemapHeight])

  const searchLower = searchQuery.toLowerCase().trim()

  return (
    <div className="space-y-3">
      {/* 1. TOP SUMMARY BAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-lg">
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main metric summary badge */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5 font-mono shadow-sm">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px] font-sans font-medium">
              {selectedYear} {metric === 'gdp' ? t.metricTotalGdp : metric === 'perCapita' ? t.metricPerCapita : t.metricDebt}:
            </span>
            <span className="text-indigo-300 font-black">
              {metric === 'gdp'
                ? formatGdpCompact(summary.sumWeight, baseCurrency, usdToBase, lang)
                : metric === 'perCapita'
                ? formatPerCapita(
                    processedItems.length > 0
                      ? processedItems.reduce((acc, p) => acc + p.currentVal, 0) / processedItems.length
                      : 0,
                    baseCurrency,
                    usdToBase,
                    lang
                  )
                : `${(
                    processedItems.length > 0
                      ? processedItems.reduce((acc, p) => acc + p.currentVal, 0) / processedItems.length
                      : 0
                  ).toFixed(1)}%`}
            </span>
          </div>

          {/* Average YoY Change Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5 font-mono shadow-sm">
            {summary.avgYoy >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span className="text-slate-400 text-[11px] font-sans font-medium">
              {lang === 'ko' ? `전년(${prevYearStr}년) 대비 평균:` : `vs. ${prevYearStr} YoY Avg:`}
            </span>
            <span
              className={`font-black ${
                metric === 'debt'
                  ? summary.avgYoy > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                  : summary.avgYoy >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {summary.avgYoy > 0 ? `+${summary.avgYoy.toFixed(1)}%` : `${summary.avgYoy.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SQUARIFIED TREEMAP SVG CANVAS */}
      <div
        ref={containerRef}
        className="relative w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-2 sm:p-3 shadow-2xl overflow-hidden select-none"
      >
        <svg
          width={containerWidth}
          height={treemapHeight}
          className="w-full block select-none rounded-2xl"
          style={{ height: `${treemapHeight}px` }}
        >
          {rects.map((r) => {
            const p = r.data
            const item = p.item
            const isHovered = hoveredCountryId === item.country.id
            const isPinned = pinnedCountryId === item.country.id
            const isSearchMatch =
              searchLower.length > 0 &&
              (item.country.id.toLowerCase().includes(searchLower) ||
                item.country.nameEn.toLowerCase().includes(searchLower) ||
                item.country.nameKo.toLowerCase().includes(searchLower) ||
                item.country.currencyCode.toLowerCase().includes(searchLower))

            const sharePct = worldTotalGdp > 0 ? (item.totalGdpUsd / worldTotalGdp) * 100 : 0
            const colors = getItemColor(metric, p.yoyPct, isHovered)

            // Responsive tile sizing breakpoints (matched to actual inner content height/width)
            const rectW = Math.max(0, r.w - 1.5)
            const rectH = Math.max(0, r.h - 1.5)
            const isExtraLarge = r.w >= 140 && r.h >= 94
            const isLarge = r.w >= 92 && r.h >= 54
            const isMedium = r.w >= 52 && r.h >= 34
            const isSmall = r.w >= 26 && r.h >= 16
            const isTiny = r.w >= 15 && r.h >= 11

            // Formatted main value for display
            const mainDisplayVal =
              metric === 'gdp'
                ? formatGdpCompact(item.totalGdpUsd, baseCurrency, usdToBase, lang)
                : metric === 'perCapita'
                ? formatPerCapita(item.gdpPerCapitaUsd, baseCurrency, usdToBase, lang)
                : `${(item.debtRatioPct ?? 0).toFixed(1)}%`

            // Tooltip text
            const titleTooltip = `${getCountryName(item.country, lang)} (#${item.rank})
${metric === 'gdp' ? t.metricTotalGdp : metric === 'perCapita' ? t.metricPerCapita : t.metricDebt}: ${mainDisplayVal}
${lang === 'ko' ? '전년 대비 증감률' : 'YoY Growth'}: ${
              p.yoyPct !== null ? `${p.yoyPct > 0 ? '+' : ''}${p.yoyPct.toFixed(1)}%` : 'N/A'
            }
${p.totalDebtUsd ? `Total Gov Debt: ${formatGdpCompact(p.totalDebtUsd, baseCurrency, usdToBase, lang)}` : ''}`

            return (
              <g
                key={r.id}
                transform={`translate(${r.x}, ${r.y})`}
                onClick={() => onSelectCountry(item.country)}
                onMouseEnter={() => onHoverCountry(item.country.id)}
                onMouseLeave={() => onHoverCountry(null)}
                data-tooltip={titleTooltip}
                className="cursor-pointer transition-all duration-150"
              >

                {/* Rectangle Body */}
                <rect
                  width={rectW}
                  height={rectH}
                  rx={r.w > 40 && r.h > 30 ? 6 : 3}
                  fill={colors.bg}
                  stroke={
                    isSearchMatch
                      ? '#38bdf8'
                      : isHovered || isPinned
                      ? '#ffffff'
                      : colors.border
                  }
                  strokeWidth={isSearchMatch ? 2.5 : isHovered || isPinned ? 2 : 1}
                  className="transition-colors duration-150"
                  style={{
                    filter: isHovered ? 'brightness(1.2)' : undefined,
                  }}
                />

                {/* Top Glare Highlight */}
                <rect
                  width={rectW}
                  height={Math.max(0, Math.min(r.h * 0.4, 20))}
                  rx={r.w > 40 && r.h > 30 ? 6 : 3}
                  fill="url(#topGlareGrad)"
                  opacity={0.15}
                  pointerEvents="none"
                />

                {/* Content Inside ForeignObject */}
                {isExtraLarge ? (
                  /* EXTRA LARGE (USA, CHN, DEU, JPN, IND...) */
                  <foreignObject
                    x={2}
                    y={2}
                    width={Math.max(0, rectW - 4)}
                    height={Math.max(0, rectH - 4)}
                    overflow="hidden"
                    className="overflow-hidden pointer-events-none"
                  >
                    <div className="w-full h-full flex flex-col justify-between p-1.5 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CountryFlag
                            iso2={item.country.iso2}
                            className="w-4 h-3 sm:w-5 sm:h-3.5 rounded-[2px] shrink-0 shadow-sm"
                          />
                          <span className="font-black text-xs sm:text-sm leading-tight tracking-tight truncate block [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                            {getCountryName(item.country, lang)}
                          </span>
                        </div>
                        <span className="text-[10px] leading-none font-mono text-indigo-300 font-black px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/60 shrink-0 whitespace-nowrap">
                          #{item.rank}
                        </span>
                      </div>

                      <div className="my-auto py-0.5 min-w-0">
                        <div className="text-xs sm:text-base leading-tight font-black font-mono tracking-tight text-white truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                          {mainDisplayVal}
                        </div>
                        <div className="text-[10px] leading-tight text-slate-300/90 font-mono font-medium truncate">
                          {metric === 'debt' && p.totalDebtUsd ? (
                            <span>{formatGdpCompact(p.totalDebtUsd, baseCurrency, usdToBase, lang)} {lang === 'ko' ? '부채' : 'Debt'}</span>
                          ) : (
                            <span>{sharePct.toFixed(1)}% {lang === 'ko' ? '세계 점유' : 'of World'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0">
                        {p.yoyPct !== null ? (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] leading-none font-mono font-black shadow-sm shrink-0 whitespace-nowrap"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(1)}%` : `${p.yoyPct.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-[10px] leading-none text-slate-400 font-mono">-</span>
                        )}
                        <span className="text-[9px] leading-none font-mono text-slate-400 truncate">
                          {lang === 'ko' ? `전년비` : `YoY`}
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                ) : isLarge ? (
                  /* LARGE TILE */
                  <foreignObject
                    x={2}
                    y={2}
                    width={Math.max(0, rectW - 4)}
                    height={Math.max(0, rectH - 4)}
                    overflow="hidden"
                    className="overflow-hidden pointer-events-none"
                  >
                    <div className="w-full h-full flex flex-col justify-between p-1 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <CountryFlag iso2={item.country.iso2} className="w-3.5 h-2.5 rounded-[2px] shrink-0" />
                          <span className="font-black text-[11px] sm:text-xs leading-tight tracking-tight truncate">
                            {getCountryName(item.country, lang)}
                          </span>
                        </div>
                        {r.w >= 110 && (
                          <span className="text-[9px] leading-none font-mono text-slate-300 font-bold shrink-0 whitespace-nowrap">
                            #{item.rank}
                          </span>
                        )}
                      </div>

                      {r.w >= 115 ? (
                        <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0">
                          <span className="text-[11px] sm:text-xs leading-tight font-black font-mono text-white truncate min-w-0">
                            {mainDisplayVal}
                          </span>
                          {p.yoyPct !== null && (
                            <span
                              className="text-[9px] sm:text-[10px] leading-none font-mono font-black shrink-0 whitespace-nowrap px-1 py-0.5 rounded"
                              style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                            >
                              {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(1)}%` : `${p.yoyPct.toFixed(1)}%`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col justify-end min-w-0 gap-0.5">
                          <span className="text-[10px] leading-none font-black font-mono text-white truncate">
                            {mainDisplayVal}
                          </span>
                          {p.yoyPct !== null && r.h >= 62 && (
                            <span
                              className="text-[9px] leading-none font-mono font-bold truncate"
                              style={{ color: colors.badgeText }}
                            >
                              {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(1)}%` : `${p.yoyPct.toFixed(1)}%`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </foreignObject>
                ) : isMedium ? (
                  /* MEDIUM TILE */
                  <foreignObject
                    x={1.5}
                    y={1.5}
                    width={Math.max(0, rectW - 3)}
                    height={Math.max(0, rectH - 3)}
                    overflow="hidden"
                    className="overflow-hidden pointer-events-none"
                  >
                    <div className="w-full h-full flex flex-col justify-between p-0.5 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-center justify-between gap-0.5 min-w-0">
                        <span className="font-black text-[10px] leading-none font-mono tracking-tighter truncate">
                          {item.country.id}
                        </span>
                        {p.yoyPct !== null && r.w >= 64 && (
                          <span
                            className="text-[8px] leading-none font-mono font-bold shrink-0 whitespace-nowrap"
                            style={{ color: colors.badgeText }}
                          >
                            {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(0)}%` : `${p.yoyPct.toFixed(0)}%`}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] leading-none font-black font-mono text-slate-200 truncate block w-full">
                        {mainDisplayVal}
                      </span>
                    </div>
                  </foreignObject>
                ) : isSmall ? (
                  /* SMALL TILE */
                  <foreignObject
                    x={1}
                    y={1}
                    width={Math.max(0, rectW - 2)}
                    height={Math.max(0, rectH - 2)}
                    overflow="hidden"
                    className="overflow-hidden pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center text-center overflow-hidden text-white pointer-events-none select-none">
                      <span className="font-mono font-black text-[8px] sm:text-[9px] leading-none text-white/95 tracking-tighter whitespace-nowrap">
                        {r.w >= 32 ? item.country.id : item.country.iso2}
                      </span>
                    </div>
                  </foreignObject>
                ) : isTiny ? (
                  /* TINY TILE */
                  <foreignObject
                    x={0.5}
                    y={0.5}
                    width={Math.max(0, rectW - 1)}
                    height={Math.max(0, rectH - 1)}
                    overflow="hidden"
                    className="overflow-hidden pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center text-center overflow-hidden text-white pointer-events-none select-none">
                      <span className="font-mono font-bold text-[7px] leading-none text-white/90 tracking-tighter whitespace-nowrap">
                        {item.country.iso2}
                      </span>
                    </div>
                  </foreignObject>
                ) : null}
              </g>
            )
          })}

          <defs>
            <linearGradient id="topGlareGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. DYNAMIC YOY LEGEND */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <span>
            {lang === 'ko'
              ? `전년(${prevYearStr}년) 대비 증감률`
              : `YoY Growth Rate (vs. ${prevYearStr})`}
          </span>
        </div>

        {metric === 'debt' ? (
          /* Debt Color Scale */
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#881337] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">&gt; +5.0%</span>
              <span className="text-[10px] text-rose-400">({lang === 'ko' ? '부채 급증' : 'High Surge'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#713f12] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">0% ~ +5.0%</span>
              <span className="text-[10px] text-amber-300">({lang === 'ko' ? '부채 증가' : 'Increase'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#047857] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">&le; 0%</span>
              <span className="text-[10px] text-emerald-400">({lang === 'ko' ? '부채 건전화/감소' : 'Fiscal Health'})</span>
            </div>
          </div>
        ) : (
          /* GDP & Per Capita Growth Scale */
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#047857] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">&ge; +5.0%</span>
              <span className="text-[10px] text-emerald-400">({lang === 'ko' ? '고성장' : 'High Growth'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#065f46] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">+2.0% ~ +5.0%</span>
              <span className="text-[10px] text-emerald-300">({lang === 'ko' ? '견고' : 'Solid'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#1e293b] border border-slate-700 shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">0.0% ~ +2.0%</span>
              <span className="text-[10px] text-slate-400">({lang === 'ko' ? '보합/저성장' : 'Moderate'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#881337] shadow-sm"></span>
              <span className="text-slate-300 font-mono font-medium">&lt; 0.0%</span>
              <span className="text-[10px] text-rose-400">({lang === 'ko' ? '역성장/감소' : 'Contraction'})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

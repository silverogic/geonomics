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
import { TrendingUp, TrendingDown, Globe, Sparkles } from 'lucide-react'

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

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ({summary.totalCount} {lang === 'ko' ? '개국 표시 중' : 'Economies'})
          </span>
        </div>

        {/* Right: YoY Base Horizon Label */}
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800/80">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>
            {lang === 'ko'
              ? `기준: ${selectedYear}년 (vs. ${prevYearStr}년)`
              : `Horizon: ${selectedYear} (vs. ${prevYearStr})`}
          </span>
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

            // Responsive tile sizing breakpoints
            const isExtraLarge = r.w >= 130 && r.h >= 80
            const isLarge = r.w >= 85 && r.h >= 50
            const isMedium = r.w >= 50 && r.h >= 32
            const isSmall = r.w >= 28 && r.h >= 18
            const isTiny = r.w >= 14 && r.h >= 10

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
                className="cursor-pointer transition-all duration-150"
              >
                <title>{titleTooltip}</title>

                {/* Rectangle Body */}
                <rect
                  width={Math.max(0, r.w - 1.5)}
                  height={Math.max(0, r.h - 1.5)}
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
                  width={Math.max(0, r.w - 1.5)}
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
                    x={4}
                    y={4}
                    width={Math.max(0, r.w - 8)}
                    height={Math.max(0, r.h - 8)}
                  >
                    <div className="h-full flex flex-col justify-between p-1.5 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CountryFlag
                            iso2={item.country.iso2}
                            className="w-5 h-3.5 rounded-[2px] shrink-0 shadow-sm"
                          />
                          <span className="font-black text-xs sm:text-sm tracking-tight truncate block drop-shadow">
                            {getCountryName(item.country, lang)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-300 font-black px-1.5 py-0.2 rounded bg-indigo-950/70 border border-indigo-800/60 shrink-0">
                          #{item.rank}
                        </span>
                      </div>

                      <div className="my-auto py-0.5">
                        <div className="text-sm sm:text-base font-black font-mono tracking-tight text-white drop-shadow">
                          {mainDisplayVal}
                        </div>
                        <div className="text-[10px] text-slate-300/90 font-mono font-medium">
                          {metric === 'debt' && p.totalDebtUsd ? (
                            <span>{formatGdpCompact(p.totalDebtUsd, baseCurrency, usdToBase, lang)} {lang === 'ko' ? '부채' : 'Debt'}</span>
                          ) : (
                            <span>{sharePct.toFixed(1)}% {lang === 'ko' ? '세계 점유' : 'of World'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        {p.yoyPct !== null ? (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-black shadow-sm"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(1)}%` : `${p.yoyPct.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">-</span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">
                          {lang === 'ko' ? `전년비` : `YoY`}
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                ) : isLarge ? (
                  /* LARGE TILE */
                  <foreignObject
                    x={3}
                    y={3}
                    width={Math.max(0, r.w - 6)}
                    height={Math.max(0, r.h - 6)}
                  >
                    <div className="h-full flex flex-col justify-between p-1 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <CountryFlag iso2={item.country.iso2} className="w-4 h-3 rounded-[2px] shrink-0" />
                          <span className="font-black text-xs tracking-tight truncate">
                            {getCountryName(item.country, lang)}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 font-bold shrink-0">
                          #{item.rank}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-1 pt-0.5">
                        <span className="text-xs font-black font-mono text-white truncate">
                          {mainDisplayVal}
                        </span>
                        {p.yoyPct !== null && (
                          <span
                            className="text-[10px] font-mono font-black shrink-0 px-1 py-0.2 rounded"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(1)}%` : `${p.yoyPct.toFixed(1)}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  </foreignObject>
                ) : isMedium ? (
                  /* MEDIUM TILE */
                  <foreignObject
                    x={2}
                    y={2}
                    width={Math.max(0, r.w - 4)}
                    height={Math.max(0, r.h - 4)}
                  >
                    <div className="h-full flex flex-col justify-between p-0.5 overflow-hidden text-white pointer-events-none select-none">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-[10px] font-mono tracking-tighter truncate">
                          {item.country.id}
                        </span>
                        {p.yoyPct !== null && (
                          <span className="text-[9px] font-mono font-bold" style={{ color: colors.badgeText }}>
                            {p.yoyPct > 0 ? `+${p.yoyPct.toFixed(0)}%` : `${p.yoyPct.toFixed(0)}%`}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black font-mono text-slate-200 truncate">
                        {mainDisplayVal}
                      </span>
                    </div>
                  </foreignObject>
                ) : isSmall ? (
                  /* SMALL TILE */
                  <foreignObject
                    x={1}
                    y={1}
                    width={Math.max(0, r.w - 2)}
                    height={Math.max(0, r.h - 2)}
                  >
                    <div className="h-full flex items-center justify-center text-center p-0.5 overflow-hidden text-white pointer-events-none select-none">
                      <span className="font-mono font-black text-[8px] sm:text-[9px] text-white/95 tracking-tighter truncate">
                        {item.country.id}
                      </span>
                    </div>
                  </foreignObject>
                ) : isTiny ? (
                  /* TINY TILE */
                  <g pointerEvents="none">
                    <text
                      x={r.w / 2}
                      y={r.h / 2 + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7px"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {item.country.iso2}
                    </text>
                  </g>
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
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <span>{t.legendTitle}:</span>
          <span className="text-indigo-400 font-bold">
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

        <div className="text-[10px] text-slate-400 hidden xl:block">
          💡 {t.clickCountryHint}
        </div>
      </div>
    </div>
  )
}

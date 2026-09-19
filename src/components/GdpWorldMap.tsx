import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Search,
  Filter,
  Layers,
  List,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { WORLD_MAP_PATHS } from '../data/worldMapData'
import type { CountryMeta, BaseCurrency, ExchangeRates, Region, Language, EconomicYear } from '../types/economics'
import { CountryFlag } from './CountryFlag'
import { RankingTable, type CountryRowItem } from './RankingTable'
import { formatGdpCompact, formatPerCapita } from '../utils/formatters'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { ECONOMIC_YEAR_OPTIONS } from '../utils/economicYears'
import { getCountryName, COUNTRY_NAMES_JA } from '../utils/countryNames'

export type MapMetric = 'gdp' | 'perCapita' | 'growth' | 'debt'

interface GdpWorldMapProps {
  items: CountryRowItem[]
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
  selectedYear: EconomicYear
  onYearChange: (year: EconomicYear) => void
  onSelectCountry: (country: CountryMeta) => void
  localCountryItem?: CountryRowItem
}

// Bounding box presets for smooth region focus
const REGION_VIEWBOXES: Record<Region | 'All', { x: number; y: number; w: number; h: number }> = {
  All: { x: 0, y: 0, w: 1000, h: 520 },
  Asia: { x: 570, y: 80, w: 410, h: 300 },
  Europe: { x: 420, y: 60, w: 250, h: 190 },
  Americas: { x: 130, y: 40, w: 400, h: 460 },
  Africa: { x: 430, y: 180, w: 280, h: 260 },
  Oceania: { x: 740, y: 260, w: 250, h: 220 },
}

export const GdpWorldMap: React.FC<GdpWorldMapProps> = ({
  items,
  baseCurrency,
  exchangeRates,
  lang,
  selectedYear,
  onYearChange,
  onSelectCountry,
  localCountryItem,
}) => {
  const t = translations[lang]
  const [metric, setMetric] = useState<MapMetric>('gdp')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map')

  // Hover & Tooltip state
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null)
  const [pinnedCountryId, setPinnedCountryId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  // Zoom / Pan state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewBoxOffset, setViewBoxOffset] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1

  // Fast country lookup by ID
  const countryItemMap = useMemo(() => {
    const map = new Map<string, CountryRowItem>()
    for (const item of items) {
      map.set(item.country.id, item)
    }
    return map
  }, [items])

  // Filtered items when search is active
  const searchMatchedCountry = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return null
    return items.find(
      (item) =>
        item.country.id.toLowerCase() === q ||
        item.country.nameEn.toLowerCase().includes(q) ||
        item.country.nameKo.toLowerCase().includes(q) ||
        (COUNTRY_NAMES_JA[item.country.id] && COUNTRY_NAMES_JA[item.country.id].toLowerCase().includes(q)) ||
        item.country.currencyCode.toLowerCase() === q
    )
  }, [items, searchQuery])

  // Compute active country for inspection HUD
  const inspectedCountryItem = useMemo(() => {
    if (searchMatchedCountry) return searchMatchedCountry
    if (hoveredCountryId && countryItemMap.has(hoveredCountryId)) {
      return countryItemMap.get(hoveredCountryId)
    }
    if (pinnedCountryId && countryItemMap.has(pinnedCountryId)) {
      return countryItemMap.get(pinnedCountryId)
    }
    return items[0] // Default to #1 economy (US)
  }, [searchMatchedCountry, hoveredCountryId, pinnedCountryId, countryItemMap, items])

  // Top 10 economies
  const top10Items = useMemo(() => items.slice(0, 10), [items])

  // Color generator based on selected metric
  const getCountryFill = useCallback(
    (countryId: string) => {
      const item = countryItemMap.get(countryId)
      if (!item) {
        // Untracked background country
        return '#1e293b' // slate-800
      }

      if (metric === 'gdp') {
        const gdp = item.totalGdpUsd
        if (gdp >= 10_000_000_000_000) return '#f59e0b' // $10T+ Amber Gold (USA, China)
        if (gdp >= 2_000_000_000_000) return '#10b981' // $2T-$10T Emerald Green
        if (gdp >= 500_000_000_000) return '#06b6d4' // $500B-$2T Cyan
        if (gdp >= 100_000_000_000) return '#6366f1' // $100B-$500B Indigo
        return '#475569' // < $100B Slate
      }

      if (metric === 'perCapita') {
        const pcap = item.gdpPerCapitaUsd
        if (pcap >= 60_000) return '#10b981' // Emerald
        if (pcap >= 30_000) return '#06b6d4' // Cyan
        if (pcap >= 12_000) return '#6366f1' // Indigo
        return '#475569' // Slate
      }

      if (metric === 'growth') {
        const g = item.growthRatePct
        if (g === null || g === undefined) return '#334155'
        if (g >= 5.0) return '#10b981' // Strong Growth
        if (g >= 2.5) return '#06b6d4' // Solid
        if (g >= 0.0) return '#6366f1' // Modest
        return '#f43f5e' // Negative growth (Rose)
      }

      if (metric === 'debt') {
        const d = item.debtRatioPct
        if (d === null || d === undefined) return '#334155'
        if (d < 50) return '#10b981' // Low debt
        if (d < 80) return '#06b6d4' // Moderate
        if (d < 110) return '#f59e0b' // High
        return '#f43f5e' // Very high debt
      }

      return '#334155'
    },
    [countryItemMap, metric]
  )

  // Current viewBox with zoom & region offsets
  const currentViewBox = useMemo(() => {
    const base = REGION_VIEWBOXES[selectedRegion]
    const w = base.w / zoomLevel
    const h = base.h / zoomLevel
    const cx = base.x + base.w / 2 + viewBoxOffset.x
    const cy = base.y + base.h / 2 + viewBoxOffset.y
    return `${Math.max(0, cx - w / 2)} ${Math.max(0, cy - h / 2)} ${w} ${h}`
  }, [selectedRegion, zoomLevel, viewBoxOffset])

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3.5, z * 1.3))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(1, z / 1.3))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setViewBoxOffset({ x: 0, y: 0 })
    setSelectedRegion('All')
    setPinnedCountryId(null)
  }

  const handleRegionSelect = (reg: Region | 'All') => {
    setSelectedRegion(reg)
    setZoomLevel(1)
    setViewBoxOffset({ x: 0, y: 0 })
  }

  // Hover handlers
  const handleCountryMouseMove = (e: React.MouseEvent, countryId: string) => {
    if (!mapContainerRef.current) return
    const rect = mapContainerRef.current.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setHoveredCountryId(countryId)
  }

  const handleCountryMouseLeave = () => {
    setHoveredCountryId(null)
    setTooltipPos(null)
  }

  const handleCountryClick = (countryId: string) => {
    const item = countryItemMap.get(countryId)
    if (item) {
      setPinnedCountryId(countryId)
      onSelectCountry(item.country)
    }
  }

  // Currently hovered item
  const hoveredItem = hoveredCountryId ? countryItemMap.get(hoveredCountryId) : null

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO OVERVIEW: Macroeconomic Snapshot */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.heroBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {t.mapTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
              {t.mapSubtitle}
            </p>
          </div>

          {/* Quick View Mode Switcher: Map vs Table */}
          <div className="flex items-center self-start lg:self-center bg-slate-950/90 border border-slate-800 p-1.5 rounded-2xl shrink-0 shadow-lg">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.viewMap}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <List className="w-4 h-4" />
              <span>{t.viewTable}</span>
            </button>
          </div>
        </div>

        {/* Statistical Highlights Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] text-slate-400 font-medium">{t.statCountriesTracked}</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-0.5">
              {items.length}{' '}
              <span className="text-xs text-indigo-400 font-sans font-medium">/ 56</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] text-slate-400 font-medium">{t.statBaseCurrency}</div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono mt-0.5">
              {baseCurrency}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] text-slate-400 font-medium">{t.statTopEconomy}</div>
            <div className="text-sm sm:text-base font-bold text-slate-200 mt-1 truncate flex items-center">
              <CountryFlag iso2="US" className="w-5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                {items[0]?.totalGdpUsd
                  ? formatGdpCompact(items[0].totalGdpUsd, baseCurrency, usdToBase, lang)
                  : '...'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] text-slate-400 font-medium">
              {t.statLocalEconomy.replace(
                '{country}',
                localCountryItem ? getCountryName(localCountryItem.country, lang) : ''
              )}
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-200 mt-1 truncate flex items-center">
              {localCountryItem && (
                <>
                  <CountryFlag
                    iso2={localCountryItem.country.iso2}
                    className="w-5 h-3.5 mr-1.5 flex-shrink-0"
                  />
                  <span className="truncate">
                    {getCountryName(localCountryItem.country, lang)}{' '}
                    <span className="text-indigo-400 text-xs font-mono">
                      (#{localCountryItem.rank || '-'})
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAP CONTROLS & FILTER BAR */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Country Search */}
          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Metric Selector (Total GDP, Per Capita, Growth, Debt) */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 px-2 hidden md:inline">
              {t.mapMetricLabel}
            </span>
            {(
              [
                { id: 'gdp', label: t.metricTotalGdp },
                { id: 'perCapita', label: t.metricPerCapita },
                { id: 'growth', label: t.metricGrowth },
                { id: 'debt', label: t.metricDebt },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  metric === m.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Year Switcher */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 px-2 hidden md:inline">
              {t.yearLabel}:
            </span>
            {ECONOMIC_YEAR_OPTIONS.map((opt) => (
              <button
                key={opt.year}
                onClick={() => onYearChange(opt.year)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedYear === opt.year
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {t[opt.labelKey].replace('{year}', opt.year)}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline" />
          {(['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => handleRegionSelect(reg)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                selectedRegion === reg
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {reg === 'All'
                ? t.filterAll
                : reg === 'Asia'
                  ? t.filterAsia
                  : reg === 'Europe'
                    ? t.filterEurope
                    : reg === 'Americas'
                      ? t.filterAmericas
                      : reg === 'Africa'
                        ? t.filterAfrica
                        : t.filterOceania}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN DISPLAY: MAP VIEW OR TABLE VIEW */}
      {viewMode === 'table' ? (
        <RankingTable
          items={items}
          baseCurrency={baseCurrency}
          exchangeRates={exchangeRates}
          lang={lang}
          onSelectCountry={onSelectCountry}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          hideHeader={false}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* MAP CANVAS (Takes 3 columns on wide screens) */}
          <div className="xl:col-span-3 space-y-4">
            <div
              ref={mapContainerRef}
              className="relative w-full aspect-[1000/540] bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl select-none group"
            >
              {/* Decorative Subtle Gridlines */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Ocean glow background gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 pointer-events-none" />

              {/* Map Zoom Controls HUD */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
                <button
                  onClick={handleZoomIn}
                  title={t.mapZoomIn}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  title={t.mapZoomOut}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title={t.mapResetZoom}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive SVG Canvas */}
              <svg
                viewBox={currentViewBox}
                className="w-full h-full cursor-grab active:cursor-grabbing transition-[viewBox] duration-500 ease-out"
                style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4))' }}
              >
                <defs>
                  {/* Subtle drop shadow filter for active/hovered country */}
                  <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Country Polygons */}
                <g className="transition-all duration-300">
                  {WORLD_MAP_PATHS.map((countryPath) => {
                    const countryId = countryPath.id
                    const isTracked = countryItemMap.has(countryId)
                    const isHovered = hoveredCountryId === countryId
                    const isPinned = pinnedCountryId === countryId
                    const isSearchMatch = searchMatchedCountry?.country.id === countryId
                    const fill = getCountryFill(countryId)

                    return (
                      <path
                        key={countryId}
                        id={`map-country-${countryId}`}
                        d={countryPath.d}
                        fill={fill}
                        stroke={
                          isSearchMatch
                            ? '#38bdf8'
                            : isHovered || isPinned
                              ? '#ffffff'
                              : isTracked
                                ? '#1e293b'
                                : '#0f172a'
                        }
                        strokeWidth={
                          isSearchMatch ? '2.5' : isHovered || isPinned ? '1.8' : isTracked ? '0.75' : '0.4'
                        }
                        opacity={
                          isTracked
                            ? 1
                            : selectedRegion !== 'All'
                              ? 0.35
                              : 0.65
                        }
                        className={`transition-all duration-200 ${
                          isTracked
                            ? 'cursor-pointer hover:brightness-125'
                            : 'cursor-default pointer-events-none'
                        }`}
                        onMouseMove={(e) => {
                          if (isTracked) handleCountryMouseMove(e, countryId)
                        }}
                        onMouseLeave={handleCountryMouseLeave}
                        onClick={() => {
                          if (isTracked) handleCountryClick(countryId)
                        }}
                      />
                    )
                  })}

                  {/* Top 5 Beacon Markers */}
                  {top10Items.slice(0, 5).map((topItem) => {
                    const pathData = WORLD_MAP_PATHS.find((p) => p.id === topItem.country.id)
                    if (!pathData) return null
                    const [cx, cy] = pathData.centroid
                    return (
                      <g
                        key={`beacon-${topItem.country.id}`}
                        className="pointer-events-none transition-opacity duration-300"
                        opacity={zoomLevel >= 1 ? 0.9 : 0}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r="4.5"
                          fill="#f59e0b"
                          className="animate-ping opacity-60"
                        />
                        <circle cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                        <text
                          x={cx}
                          y={cy - 6}
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="select-none font-mono"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                        >
                          #{topItem.rank}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>

              {/* Floating Dynamic Tooltip HUD */}
              {hoveredItem && tooltipPos && (
                <div
                  className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-75"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y}px`,
                  }}
                >
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl min-w-[200px] text-xs space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <CountryFlag iso2={hoveredItem.country.iso2} className="w-5 h-3.5 rounded-sm" />
                        <span className="font-bold text-white text-sm">
                          {getCountryName(hoveredItem.country, lang)}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                        #{hoveredItem.rank}
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{t.cardTotalGdp}:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {formatGdpCompact(hoveredItem.totalGdpUsd, baseCurrency, usdToBase, lang)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{t.cardPerCapita}:</span>
                        <span className="font-mono text-slate-300">
                          {formatPerCapita(hoveredItem.gdpPerCapitaUsd, baseCurrency, usdToBase, lang)}
                        </span>
                      </div>
                      {hoveredItem.growthRatePct !== null && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span>{t.metricGrowth}:</span>
                          <span
                            className={`font-mono font-semibold ${
                              hoveredItem.growthRatePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {hoveredItem.growthRatePct > 0
                              ? `+${hoveredItem.growthRatePct.toFixed(1)}%`
                              : `${hoveredItem.growthRatePct.toFixed(1)}%`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hint */}
                    <div className="text-[10px] text-indigo-400 font-medium pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>{t.clickCountryHint}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Map Info Footer */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.clickCountryHint}</span>
              </div>
            </div>

            {/* CHOROPLETH COLOR SCALE LEGEND */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <span>{t.legendTitle}:</span>
                <span className="text-indigo-400 font-bold">
                  {metric === 'gdp'
                    ? t.metricTotalGdp
                    : metric === 'perCapita'
                      ? t.metricPerCapita
                      : metric === 'growth'
                        ? t.metricGrowth
                        : t.metricDebt}
                </span>
              </div>

              {/* Legend scale swatches */}
              <div className="flex flex-wrap items-center gap-3">
                {metric === 'gdp' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] shadow-sm"></span>
                      <span className="text-slate-300 font-mono font-medium">$10T+</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-sm"></span>
                      <span className="text-slate-300 font-mono font-medium">$2T ~ $10T</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#06b6d4] shadow-sm"></span>
                      <span className="text-slate-300 font-mono font-medium">$500B ~ $2T</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#6366f1] shadow-sm"></span>
                      <span className="text-slate-300 font-mono font-medium">$100B ~ $500B</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#475569] shadow-sm"></span>
                      <span className="text-slate-300 font-mono font-medium">&lt; $100B</span>
                    </div>
                  </>
                )}

                {metric === 'perCapita' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#10b981]"></span>
                      <span className="text-slate-300 font-mono font-medium">&gt; $60K</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#06b6d4]"></span>
                      <span className="text-slate-300 font-mono font-medium">$30K ~ $60K</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#6366f1]"></span>
                      <span className="text-slate-300 font-mono font-medium">$12K ~ $30K</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#475569]"></span>
                      <span className="text-slate-300 font-mono font-medium">&lt; $12K</span>
                    </div>
                  </>
                )}

                {metric === 'growth' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#10b981]"></span>
                      <span className="text-slate-300 font-mono font-medium">&gt; 5.0%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#06b6d4]"></span>
                      <span className="text-slate-300 font-mono font-medium">2.5% ~ 5.0%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#6366f1]"></span>
                      <span className="text-slate-300 font-mono font-medium">0% ~ 2.5%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#f43f5e]"></span>
                      <span className="text-slate-300 font-mono font-medium">&lt; 0%</span>
                    </div>
                  </>
                )}

                {metric === 'debt' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#10b981]"></span>
                      <span className="text-slate-300 font-mono font-medium">&lt; 50%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#06b6d4]"></span>
                      <span className="text-slate-300 font-mono font-medium">50% ~ 80%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#f59e0b]"></span>
                      <span className="text-slate-300 font-mono font-medium">80% ~ 110%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#f43f5e]"></span>
                      <span className="text-slate-300 font-mono font-medium">&gt; 110%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Selected / Hovered Economy Inspector HUD */}
          <div className="xl:col-span-1 space-y-4">
            {inspectedCountryItem && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
                {/* Badge & Country Identity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-indigo-400 tracking-wide uppercase">
                      {t.selectedCountryBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                      #{inspectedCountryItem.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CountryFlag
                      iso2={inspectedCountryItem.country.iso2}
                      className="w-8 h-6 rounded-md shadow"
                    />
                    <div>
                      <h2 className="text-xl font-black text-white leading-tight">
                        {getCountryName(inspectedCountryItem.country, lang)}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {inspectedCountryItem.country.region} · {inspectedCountryItem.country.currencyCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="space-y-2.5">
                  {/* Total GDP */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                    <div className="text-[11px] text-slate-400 font-medium">{t.cardTotalGdp}</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {formatGdpCompact(
                        inspectedCountryItem.totalGdpUsd,
                        baseCurrency,
                        usdToBase,
                        lang
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      (USD ${formatGdpCompact(inspectedCountryItem.totalGdpUsd, 'USD', 1, lang)})
                    </div>
                  </div>

                  {/* GDP Per Capita */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                    <div className="text-[11px] text-slate-400 font-medium">{t.cardPerCapita}</div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                      {formatPerCapita(
                        inspectedCountryItem.gdpPerCapitaUsd,
                        baseCurrency,
                        usdToBase,
                        lang
                      )}
                    </div>
                  </div>

                  {/* Growth Rate & Debt Ratio Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">{t.metricGrowth}</div>
                      <div
                        className={`text-base font-bold font-mono mt-0.5 flex items-center gap-1 ${
                          (inspectedCountryItem.growthRatePct ?? 0) >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {(inspectedCountryItem.growthRatePct ?? 0) >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {inspectedCountryItem.growthRatePct !== null
                            ? inspectedCountryItem.growthRatePct > 0
                              ? `+${inspectedCountryItem.growthRatePct.toFixed(1)}%`
                              : `${inspectedCountryItem.growthRatePct.toFixed(1)}%`
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">{t.metricDebt}</div>
                      <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                        {inspectedCountryItem.debtRatioPct !== null &&
                        inspectedCountryItem.debtRatioPct !== undefined
                          ? `${inspectedCountryItem.debtRatioPct.toFixed(1)}%`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Modal CTA Button */}
                <button
                  onClick={() => onSelectCountry(inspectedCountryItem.country)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{t.viewDetailsBtn}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GLOBAL TOP 10 LEADERBOARD QUICK BAR */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-sm">🏆</span>
            <h3 className="text-sm font-bold text-white tracking-tight">{t.top10Title}</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {t.yearLabel}: {selectedYear}
          </span>
        </div>

        {/* Scrollable quick country pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5">
          {top10Items.map((item) => (
            <button
              key={`top10-${item.country.id}`}
              onClick={() => {
                setPinnedCountryId(item.country.id)
                onSelectCountry(item.country)
              }}
              className={`flex flex-col p-2.5 rounded-2xl border transition-all text-left group ${
                pinnedCountryId === item.country.id
                  ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CountryFlag iso2={item.country.iso2} className="w-4 h-3 rounded-sm" />
                <span className="text-[10px] font-bold font-mono px-1 rounded bg-slate-800 text-slate-300">
                  #{item.rank}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-200 truncate group-hover:text-white">
                {getCountryName(item.country, lang)}
              </div>
              <div className="text-[11px] font-mono text-indigo-400 font-semibold mt-0.5">
                {formatGdpCompact(item.totalGdpUsd, baseCurrency, usdToBase, lang)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

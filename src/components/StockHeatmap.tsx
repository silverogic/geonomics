import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Columns,
} from 'lucide-react'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, Region } from '../types/economics'
import { COUNTRIES } from '../data/countries'
import { getAllStockPrices, type StockPriceInfo } from '../data/stockPrices'
import { getStockMarketCapUsd, formatStockMarketCap } from '../data/stockMarketCaps'
import { fetchStockMarketCaps, calculateLiveMarketCap, type LiveMarketCapData } from '../services/stockMarketCapApi'
import { computeSquarifiedTreemap, type TreemapRect } from '../utils/squarifiedTreemap'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { StockSparkline } from './StockSparkline'

interface StockHeatmapProps {
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  refreshKey?: number
}

interface MarketItem {
  country: CountryMeta
  stockInfo?: StockPriceInfo
  marketCapUsd: number
  baseCapUsd: number
  multiplier?: number
  capYear: string
  capSource: string
  changePct: number
  indexName: string
  isSupported: boolean
}

const REGION_ORDER: Region[] = ['Americas', 'Asia', 'Europe', 'Oceania', 'Africa']

const REGION_EMOJIS: Record<Region, string> = {
  Americas: '🌎',
  Asia: '🌏',
  Europe: '🌍',
  Oceania: '🦘',
  Africa: '🌍',
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

export const StockHeatmap: React.FC<StockHeatmapProps> = ({
  baseCurrency,
  exchangeRates,
  lang,
  onSelectCountry,
  refreshKey,
}) => {
  const t = translations[lang]
  const [selectedContinent, setSelectedContinent] = useState<Region | 'All'>('All')
  const [viewMode, setViewMode] = useState<'unified' | 'byContinent'>('unified')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null)
  const [liveCapData, setLiveCapData] = useState<LiveMarketCapData | null>(null)

  useEffect(() => {
    let mounted = true
    fetchStockMarketCaps()
      .then((data) => {
        if (mounted) setLiveCapData(data)
      })
      .catch((err) => console.warn('Live market cap fetch:', err))
    return () => {
      mounted = false
    }
  }, [refreshKey])

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1
  const allStocks = useMemo(() => getAllStockPrices(), [])

  // Build unified dataset of market items
  const allMarketItems: MarketItem[] = useMemo(() => {
    return COUNTRIES.map((c) => {
      const stock = allStocks[c.id]
      const estimatedCap = liveCapData?.caps[c.id] ?? getStockMarketCapUsd(c.id)
      const baseCap = liveCapData?.baseCaps?.[c.id] ?? estimatedCap
      const multiplier = liveCapData?.multipliers?.[c.id] ?? 1.0
      const currentYear = new Date().getFullYear()
      const capYear = liveCapData?.years[c.id] ?? `${currentYear} Live Est.`
      const capSource = liveCapData?.sources[c.id] ?? 'World Bank (WFE) × Live Index Tracking'
      const changePct = stock?.changePct ?? 0
      const marketCapUsd = calculateLiveMarketCap(estimatedCap, changePct)
      const indexName = stock ? (lang === 'ko' ? stock.nameKo : stock.nameEn) : 'Equity Market'
      const isSupported = stock?.isSupported ?? false

      return {
        country: c,
        stockInfo: stock,
        marketCapUsd,
        baseCapUsd: baseCap,
        multiplier,
        capYear,
        capSource,
        changePct,
        indexName,
        isSupported,
      }
    })
  }, [allStocks, liveCapData, lang])

  // Global summary stats
  const globalStats = useMemo(() => {
    let totalCap = 0
    let advancing = 0
    let declining = 0
    let unchanged = 0
    let weightedChangeSum = 0

    for (const item of allMarketItems) {
      totalCap += item.marketCapUsd
      weightedChangeSum += item.changePct * item.marketCapUsd
      if (item.changePct > 0.2) advancing++
      else if (item.changePct < -0.2) declining++
      else unchanged++
    }

    const avgChange = totalCap > 0 ? weightedChangeSum / totalCap : 0

    return {
      totalCap,
      advancing,
      declining,
      unchanged,
      avgChange,
    }
  }, [allMarketItems])

  // Filter items by continent & search query
  const filteredBySearch = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allMarketItems
    return allMarketItems.filter((it) => {
      return (
        it.country.nameEn.toLowerCase().includes(q) ||
        it.country.nameKo.toLowerCase().includes(q) ||
        it.country.id.toLowerCase().includes(q) ||
        it.indexName.toLowerCase().includes(q) ||
        it.country.region.toLowerCase().includes(q)
      )
    })
  }, [allMarketItems, searchQuery])

  // Group market items by region
  const regionGroups = useMemo(() => {
    const map = new Map<Region, MarketItem[]>()
    for (const reg of REGION_ORDER) {
      map.set(reg, [])
    }
    for (const item of filteredBySearch) {
      const list = map.get(item.country.region)
      if (list) list.push(item)
    }
    return map
  }, [filteredBySearch])

  const [isZenMode, setIsZenMode] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  )

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      setIsZenMode(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleZenMode = () => {
    if (!isZenMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
      setIsZenMode(true)
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsZenMode(false)
    }
  }

  // Calculate full-screen height so the entire heatmap fits without vertical scroll
  const unifiedCanvasHeight = isZenMode
    ? Math.max(500, viewportHeight - 56)
    : Math.max(500, viewportHeight - 130)

  return (
    <div
      className={
        isZenMode
          ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-3 flex flex-col space-y-2 overflow-hidden'
          : 'space-y-2 animate-in fade-in duration-200 w-full'
      }
    >
      {/* 1. SINGLE-LINE ULTRA-STREAMLINED TOOLBAR */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 px-2.5 sm:px-3 py-1.5 shadow-md flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Global Market Cap & Trend Summary */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5 font-mono text-xs shadow-sm">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px] font-sans font-medium hidden sm:inline">{t.heatmapTotalCap}:</span>
            <span className="text-indigo-300 font-black">
              {formatStockMarketCap(globalStats.totalCap, baseCurrency, usdToBase, lang)}
            </span>
          </div>

          <div
            className={`px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1 font-mono text-xs font-black shadow-sm ${
              globalStats.avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {globalStats.avgChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {globalStats.avgChange > 0
                ? `+${globalStats.avgChange.toFixed(2)}%`
                : `${globalStats.avgChange.toFixed(2)}%`}
            </span>
          </div>

          {/* Gainers / Losers Count */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{globalStats.advancing}</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{globalStats.declining}</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>{globalStats.unchanged}</span>
            </span>
          </div>
        </div>

        {/* Center: View Switcher & Continent Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-slate-950/90 border border-slate-800 p-0.5 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'unified'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.heatmapViewUnified}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">{t.heatmapViewUnified}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('byContinent')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'byContinent'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.heatmapViewByContinent}
            >
              <Columns className="w-3 h-3" />
              <span className="hidden sm:inline">{t.heatmapViewByContinent}</span>
            </button>
          </div>

          {/* Continent Pills */}
          <button
            onClick={() => setSelectedContinent('All')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedContinent === 'All'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
            }`}
          >
            <span>{t.heatmapAllContinents}</span>
          </button>

          {REGION_ORDER.map((region) => {
            const regLabel =
              region === 'Asia'
                ? t.filterAsia
                : region === 'Europe'
                  ? t.filterEurope
                  : region === 'Americas'
                    ? t.filterAmericas
                    : region === 'Africa'
                      ? t.filterAfrica
                      : t.filterOceania
            const isSelected = selectedContinent === region
            return (
              <button
                key={region}
                onClick={() => setSelectedContinent(region)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
                }`}
              >
                <span>{REGION_EMOJIS[region]}</span>
                <span className="hidden xl:inline">{regLabel}</span>
              </button>
            )
          })}
        </div>

        {/* Right: Search + Legend + Fullscreen Zen Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search */}
          <div className="relative w-36 sm:w-44 shrink-0">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.heatmapSearchPlaceholder}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Scale Legend */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
            <span className="w-3.5 h-2.5 rounded-[2px] bg-[#9f1239] text-[7px] text-white flex items-center justify-center font-mono font-bold">-3</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#881337]"></span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1e293b]"></span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#065f46]"></span>
            <span className="w-3.5 h-2.5 rounded-[2px] bg-[#047857] text-[7px] text-white flex items-center justify-center font-mono font-bold">+3</span>
          </div>

          {/* Zen / Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleZenMode}
            className={`p-1.5 rounded-lg border transition-all ${
              isZenMode
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={isZenMode ? (lang === 'ko' ? '일반 화면으로 복귀' : 'Exit Fullscreen') : (lang === 'ko' ? '전체화면 몰입 모드' : 'Zen Fullscreen Mode')}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. FULL-WIDTH IMMERSIVE TREEMAP CANVAS */}
      <div className="w-full flex-grow">
        {viewMode === 'unified' ? (
          /* UNIFIED VIEW: 100% Full-Width Treemap with Responsive Height & No Redundant Header */
          <TreemapPanel
            title={
              selectedContinent === 'All'
                ? (lang === 'ko' ? '글로벌 전체 통합 증시' : 'Global Stock Markets')
                : selectedContinent
            }
            emoji={selectedContinent === 'All' ? '🌐' : REGION_EMOJIS[selectedContinent]}
            items={selectedContinent === 'All' ? filteredBySearch : (regionGroups.get(selectedContinent) || [])}
            height={unifiedCanvasHeight}
            baseCurrency={baseCurrency}
            usdToBase={usdToBase}
            lang={lang}
            hoveredCountryId={hoveredCountryId}
            onHover={setHoveredCountryId}
            onSelect={onSelectCountry}
            onZoom={selectedContinent !== 'All' ? () => setSelectedContinent('All') : undefined}
            isZoomed={selectedContinent !== 'All'}
            showZoomBtn={selectedContinent !== 'All'}
            hideHeader={true}
          />
        ) : selectedContinent === 'All' ? (
          /* BY CONTINENT VIEW: 5 Balanced Panels */
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <TreemapPanel
                title="Americas"
                emoji={REGION_EMOJIS.Americas}
                region="Americas"
                items={regionGroups.get('Americas') || []}
                height={Math.round(unifiedCanvasHeight * 0.52)}
                baseCurrency={baseCurrency}
                usdToBase={usdToBase}
                lang={lang}
                hoveredCountryId={hoveredCountryId}
                onHover={setHoveredCountryId}
                onSelect={onSelectCountry}
                onZoom={() => setSelectedContinent('Americas')}
                showZoomBtn
              />
              <TreemapPanel
                title="Asia"
                emoji={REGION_EMOJIS.Asia}
                region="Asia"
                items={regionGroups.get('Asia') || []}
                height={Math.round(unifiedCanvasHeight * 0.52)}
                baseCurrency={baseCurrency}
                usdToBase={usdToBase}
                lang={lang}
                hoveredCountryId={hoveredCountryId}
                onHover={setHoveredCountryId}
                onSelect={onSelectCountry}
                onZoom={() => setSelectedContinent('Asia')}
                showZoomBtn
              />
            </div>

            <TreemapPanel
              title="Europe"
              emoji={REGION_EMOJIS.Europe}
              region="Europe"
              items={regionGroups.get('Europe') || []}
              height={Math.round(unifiedCanvasHeight * 0.44)}
              baseCurrency={baseCurrency}
              usdToBase={usdToBase}
              lang={lang}
              hoveredCountryId={hoveredCountryId}
              onHover={setHoveredCountryId}
              onSelect={onSelectCountry}
              onZoom={() => setSelectedContinent('Europe')}
              showZoomBtn
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <TreemapPanel
                title="Oceania"
                emoji={REGION_EMOJIS.Oceania}
                region="Oceania"
                items={regionGroups.get('Oceania') || []}
                height={Math.round(unifiedCanvasHeight * 0.35)}
                baseCurrency={baseCurrency}
                usdToBase={usdToBase}
                lang={lang}
                hoveredCountryId={hoveredCountryId}
                onHover={setHoveredCountryId}
                onSelect={onSelectCountry}
                onZoom={() => setSelectedContinent('Oceania')}
                showZoomBtn
              />
              <TreemapPanel
                title="Africa"
                emoji={REGION_EMOJIS.Africa}
                region="Africa"
                items={regionGroups.get('Africa') || []}
                height={Math.round(unifiedCanvasHeight * 0.35)}
                baseCurrency={baseCurrency}
                usdToBase={usdToBase}
                lang={lang}
                hoveredCountryId={hoveredCountryId}
                onHover={setHoveredCountryId}
                onSelect={onSelectCountry}
                onZoom={() => setSelectedContinent('Africa')}
                showZoomBtn
              />
            </div>
          </div>
        ) : (
          /* SINGLE CONTINENT ZOOMED VIEW */
          <TreemapPanel
            title={selectedContinent}
            emoji={REGION_EMOJIS[selectedContinent]}
            region={selectedContinent}
            items={regionGroups.get(selectedContinent) || []}
            height={unifiedCanvasHeight}
            baseCurrency={baseCurrency}
            usdToBase={usdToBase}
            lang={lang}
            hoveredCountryId={hoveredCountryId}
            onHover={setHoveredCountryId}
            onSelect={onSelectCountry}
            onZoom={() => setSelectedContinent('All')}
            isZoomed
            showZoomBtn
            hideHeader={false}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Generalized Treemap Panel (for Unified Global Map or Individual Continent)
 * Equipped with full-width container & Floating Glassmorphic HUD overlay
 */
interface TreemapPanelProps {
  title: string
  emoji?: string
  region?: Region
  items: MarketItem[]
  height: number
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  hoveredCountryId: string | null
  onHover: (id: string | null) => void
  onSelect: (country: CountryMeta) => void
  onZoom?: () => void
  isZoomed?: boolean
  showZoomBtn?: boolean
  hideHeader?: boolean
}

const TreemapPanel: React.FC<TreemapPanelProps> = ({
  title,
  emoji = '🌐',
  items,
  height,
  baseCurrency,
  usdToBase,
  lang,
  hoveredCountryId,
  onHover,
  onSelect,
  onZoom,
  isZoomed = false,
  showZoomBtn = false,
  hideHeader = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)

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

  // Aggregate stats
  const { totalCap, avgChange } = useMemo(() => {
    let cap = 0
    let weightedChange = 0
    for (const it of items) {
      cap += it.marketCapUsd
      weightedChange += it.changePct * it.marketCapUsd
    }
    return {
      totalCap: cap,
      avgChange: cap > 0 ? weightedChange / cap : 0,
    }
  }, [items])

  // Active hovered market item for floating HUD
  const hoveredItem = useMemo(() => {
    if (!hoveredCountryId) return null
    return items.find((it) => it.country.id === hoveredCountryId) || null
  }, [hoveredCountryId, items])

  // Compute treemap rectangles
  const rects: TreemapRect<MarketItem>[] = useMemo(() => {
    if (items.length === 0 || containerWidth <= 0 || height <= 0) return []
    const treemapInputs = items.map((it) => ({
      id: it.country.id,
      value: it.marketCapUsd,
      data: it,
    }))
    return computeSquarifiedTreemap(treemapInputs, containerWidth, height)
  }, [items, containerWidth, height])

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      {/* Optional Panel Header (only rendered when not hidden) */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {items.length}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-200 font-mono">
                {formatStockMarketCap(totalCap, baseCurrency, usdToBase, lang)}
              </span>
              <span
                className={`text-[10px] font-bold font-mono ${
                  avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {avgChange > 0 ? `+${avgChange.toFixed(2)}%` : `${avgChange.toFixed(2)}%`}
              </span>
            </div>

            {showZoomBtn && onZoom && (
              <button
                type="button"
                onClick={onZoom}
                className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isZoomed ? 'Back to All Continents' : `Zoom into ${title}`}
              >
                {isZoomed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Treemap SVG Canvas & Floating Glassmorphic HUD */}
      <div ref={containerRef} className="w-full relative overflow-hidden bg-slate-950">
        {/* Floating Glassmorphic HUD */}
        {hoveredItem && (
          <div className="absolute top-2 right-2 z-30 pointer-events-none w-64 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 p-3 shadow-2xl shadow-black/80 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <CountryFlag iso2={hoveredItem.country.iso2} className="w-5 h-3.5 rounded shadow-sm shrink-0" />
                <span className="font-black text-xs sm:text-sm text-white truncate">
                  {getCountryName(hoveredItem.country, lang)}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold shrink-0">
                {hoveredItem.country.id}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="truncate text-slate-400 font-medium max-w-[120px] text-[11px]">
                {hoveredItem.indexName}
              </div>
              <span
                className={`font-mono font-black text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  hoveredItem.changePct >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {hoveredItem.changePct >= 0 ? '+' : ''}{hoveredItem.changePct.toFixed(2)}%
              </span>
            </div>

            {/* Sparkline */}
            {hoveredItem.stockInfo?.points && hoveredItem.stockInfo.points.length > 1 && (
              <div className="pt-1 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-0.5">
                  <span>{hoveredItem.stockInfo.currentPrice.toLocaleString()} {hoveredItem.stockInfo.currency}</span>
                  <span>30D Trend</span>
                </div>
                <div className="h-8 w-full">
                  <StockSparkline
                    points={hoveredItem.stockInfo.points}
                    isPositive={hoveredItem.changePct >= 0}
                    height={32}
                  />
                </div>
              </div>
            )}

            {/* Market Cap & Estimation Breakdown */}
            <div className="pt-1 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {lang === 'ko'
                    ? `${hoveredItem.capYear ? hoveredItem.capYear.split(' ')[0] : new Date().getFullYear()} 추정 시총:`
                    : `${hoveredItem.capYear ? hoveredItem.capYear.split(' ')[0] : new Date().getFullYear()} Live Cap:`}
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-indigo-300">
                  {formatStockMarketCap(hoveredItem.marketCapUsd, baseCurrency, usdToBase, lang)}
                </span>
              </div>

              {hoveredItem.multiplier && hoveredItem.multiplier !== 1.0 && (
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/60">
                  <span>
                    {lang === 'ko' ? 'WFE 기준치 대비' : 'vs. WFE Base'}:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {hoveredItem.multiplier > 1.0 ? `+${Math.round((hoveredItem.multiplier - 1) * 100)}%` : `${Math.round((hoveredItem.multiplier - 1) * 100)}%`} ({hoveredItem.multiplier}x)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs font-medium">
            {lang === 'ko' ? '조건에 일치하는 증시 데이터가 없습니다.' : 'No market data matches the criteria.'}
          </div>
        ) : (
          <svg
            width={containerWidth}
            height={height}
            className="w-full block select-none"
            style={{ height: `${height}px` }}
          >
            {rects.map((r) => {
              const item = r.data
              const isHovered = hoveredCountryId === item.country.id
              const colors = getPerformanceColor(item.changePct, isHovered)

              // Adjust display based on rectangle dimensions
              const isExtraLarge = r.w >= 130 && r.h >= 90
              const isWide = r.w >= 85 && r.h >= 50
              const isMedium = r.w >= 52 && r.h >= 32
              const isCompact = r.w >= 28 && r.h >= 18
              const isTiny = r.w >= 16 && r.h >= 12

              return (
                <g
                  key={r.id}
                  transform={`translate(${r.x}, ${r.y})`}
                  onClick={() => onSelect(item.country)}
                  onMouseEnter={() => onHover(item.country.id)}
                  onMouseLeave={() => onHover(null)}
                  className="cursor-pointer transition-all duration-150"
                >
                  <title>{`${getCountryName(item.country, lang)} (${item.country.id}): ${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}% | ${formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}`}</title>

                  {/* Rect background */}
                  <rect
                    width={Math.max(0, r.w - 1.5)}
                    height={Math.max(0, r.h - 1.5)}
                    rx={r.w > 40 && r.h > 30 ? 5 : 2}
                    fill={colors.bg}
                    stroke={isHovered ? '#ffffff' : colors.border}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-colors duration-150"
                  />

                  {/* Content inside rectangle */}
                  {isExtraLarge ? (
                    // Extra Large Presentation (USA, China, Japan, India, etc.)
                    <foreignObject x={4} y={4} width={Math.max(0, r.w - 10)} height={Math.max(0, r.h - 10)}>
                      <div className="h-full flex flex-col justify-between p-2 overflow-hidden text-white pointer-events-none">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag iso2={item.country.iso2} className="w-5 h-3.5 rounded-[2px] shrink-0 shadow-sm" />
                            <div className="min-w-0">
                              <div className="font-black text-sm sm:text-base tracking-tight truncate drop-shadow">
                                {getCountryName(item.country, lang)}
                              </div>
                              <div className="text-[11px] text-slate-300 font-semibold truncate">
                                {item.indexName}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-slate-300 font-black px-1.5 py-0.5 rounded bg-black/30 shrink-0">
                            {item.country.id}
                          </span>
                        </div>

                        <div className="flex items-end justify-between pt-1">
                          <span
                            className="px-2 py-0.5 rounded-md text-sm sm:text-base font-mono font-black shadow-sm"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                          </span>
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-mono text-white font-black block">
                              {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              WFE
                            </span>
                          </div>
                        </div>
                      </div>
                    </foreignObject>
                  ) : isWide ? (
                    // Wide Presentation (UK, France, Germany, Korea, Taiwan, Brazil, etc.)
                    <foreignObject x={3} y={3} width={Math.max(0, r.w - 8)} height={Math.max(0, r.h - 8)}>
                      <div className="h-full flex flex-col justify-between p-1.5 overflow-hidden text-white pointer-events-none">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CountryFlag iso2={item.country.iso2} className="w-4 h-3 rounded-[2px] shrink-0" />
                            <span className="font-black text-xs sm:text-sm tracking-tight truncate drop-shadow">
                              {getCountryName(item.country, lang)}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-300 font-bold shrink-0">
                            {item.country.id}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-200/90 truncate font-semibold">
                          {item.indexName}
                        </div>

                        <div className="flex items-end justify-between pt-0.5">
                          <span
                            className="px-1.5 py-0.2 rounded text-[11px] font-mono font-black"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                          </span>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-200/90 font-bold">
                            {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                          </span>
                        </div>
                      </div>
                    </foreignObject>
                  ) : isMedium ? (
                    // Medium Presentation
                    <foreignObject x={2} y={2} width={Math.max(0, r.w - 6)} height={Math.max(0, r.h - 6)}>
                      <div className="h-full flex flex-col justify-between p-1 overflow-hidden text-white pointer-events-none text-center">
                        <div className="flex items-center justify-center gap-1">
                          <CountryFlag iso2={item.country.iso2} className="w-3.5 h-2.5 rounded-[2px] shrink-0" />
                          <span className="font-black text-xs tracking-tight truncate">
                            {item.country.id}
                          </span>
                        </div>
                        <div
                          className="text-[10px] font-mono font-bold leading-tight"
                          style={{ color: colors.badgeText }}
                        >
                          {item.changePct > 0 ? `+${item.changePct.toFixed(1)}%` : `${item.changePct.toFixed(1)}%`}
                        </div>
                        <div className="text-[9px] font-mono text-slate-300 truncate">
                          {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                        </div>
                      </div>
                    </foreignObject>
                  ) : isCompact ? (
                    // Compact Presentation
                    <foreignObject x={1} y={1} width={Math.max(0, r.w - 4)} height={Math.max(0, r.h - 4)}>
                      <div className="h-full flex flex-col items-center justify-center p-0.5 overflow-hidden text-white pointer-events-none text-center leading-none">
                        <span className="font-bold text-[9px] font-mono">{item.country.id}</span>
                        <span className="text-[8px] font-mono font-bold mt-0.5" style={{ color: colors.badgeText }}>
                          {item.changePct > 0 ? `+${item.changePct.toFixed(1)}%` : `${item.changePct.toFixed(1)}%`}
                        </span>
                      </div>
                    </foreignObject>
                  ) : isTiny ? (
                    // Micro Presentation
                    <foreignObject x={1} y={1} width={Math.max(0, r.w - 2)} height={Math.max(0, r.h - 2)}>
                      <div className="h-full flex items-center justify-center overflow-hidden text-white pointer-events-none text-center leading-none">
                        <span className="font-bold text-[8px] font-mono tracking-tighter truncate px-0.5">
                          {item.country.id}
                        </span>
                      </div>
                    </foreignObject>
                  ) : null}
                </g>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}

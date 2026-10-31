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
  Building2,
  Layers,
  Loader2,
} from 'lucide-react'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, Region } from '../types/economics'
import { COUNTRIES } from '../data/countries'
import { getAllStockPrices, type StockPriceInfo } from '../data/stockPrices'
import { fetchLiveStocks, isLiveStockEnabled } from '../services/liveStockApi'
import { getStockMarketCapUsd, formatStockMarketCap } from '../data/stockMarketCaps'
import { fetchStockMarketCaps, calculateLiveMarketCap, type LiveMarketCapData } from '../services/stockMarketCapApi'
import { computeSquarifiedTreemap, type TreemapRect } from '../utils/squarifiedTreemap'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { StockSparkline } from './StockSparkline'
import { CompanyLogo } from './CompanyLogo'
import {
  fetchCountryTopCompanies,
  fetchBatchTopCompanies,
  TIER1_MARKET_IDS,
  ALL_SUPPORTED_MARKET_IDS,
  getSectorEmoji,
  type TopCompanyItem,
} from '../services/topCompaniesApi'
import { CompanyTreemapPanel, type CompanyHeatmapItem } from './CompanyTreemapPanel'
import { SectorIcon } from './SectorIcon'

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
  const [viewMode, setViewMode] = useState<
    'unified' | 'byContinent' | 'companiesUnified' | 'companiesBySector'
  >('unified')
  const [selectedSector, setSelectedSector] = useState<string>('All')
  const [topCompaniesByCountry, setTopCompaniesByCountry] = useState<Record<string, TopCompanyItem[]>>({})
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null)
  const [liveCapData, setLiveCapData] = useState<LiveMarketCapData | null>(null)
  const [liveVersion, setLiveVersion] = useState(0)
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<number | null>(null)
  const [flashingCountries, setFlashingCountries] = useState<Record<string, 'up' | 'down'>>({})
  const [isToolbarFlashing, setIsToolbarFlashing] = useState(false)
  const prevPricesRef = useRef<Map<string, number>>(new Map())
  const isFirstLoadRef = useRef(true)
  const flashTimerRef = useRef<number | null>(null)
  const toolbarFlashTimerRef = useRef<number | null>(null)

  const isCompanyMode = viewMode === 'companiesUnified' || viewMode === 'companiesBySector'

  // Progressive 2-stage batch loading of Top 5 companies when in company view modes
  useEffect(() => {
    if (!isCompanyMode) return
    let active = true

    const loadAllCompanies = async () => {
      setIsLoadingCompanies(true)
      try {
        // Stage 1: Instant load of top 25 flagship markets (>96% of global cap)
        const tier1Data = await fetchBatchTopCompanies(TIER1_MARKET_IDS, lang, exchangeRates)
        if (!active) return
        setTopCompaniesByCountry((prev) => ({ ...prev, ...tier1Data }))
        setIsLoadingCompanies(false)

        // Stage 2: Background load of remaining exchanges
        const tier1Set = new Set(TIER1_MARKET_IDS)
        const tier2Ids = ALL_SUPPORTED_MARKET_IDS.filter((id) => !tier1Set.has(id))
        if (tier2Ids.length > 0) {
          const tier2Data = await fetchBatchTopCompanies(tier2Ids, lang, exchangeRates)
          if (!active) return
          setTopCompaniesByCountry((prev) => ({ ...prev, ...tier2Data }))
        }
      } catch (err) {
        console.warn('Batch top companies fetch error:', err)
        if (active) setIsLoadingCompanies(false)
      }
    }

    loadAllCompanies()
    return () => {
      active = false
    }
  }, [isCompanyMode, lang, exchangeRates, refreshKey])

  // Near-real-time quotes (via Cloudflare Worker proxy). Silently no-op if not configured.
  useEffect(() => {
    if (!isLiveStockEnabled()) return

    // Pre-populate with initial static prices on first mount
    const initialStocks = getAllStockPrices()
    for (const [id, s] of Object.entries(initialStocks)) {
      if (typeof s.currentPrice === 'number') {
        prevPricesRef.current.set(id, s.currentPrice)
      }
    }

    let mounted = true
    const load = (force: boolean) => {
      fetchLiveStocks(force).then((ok) => {
        if (ok && mounted) {
          const newStocks = getAllStockPrices()
          const newFlashes: Record<string, 'up' | 'down'> = {}

          if (!isFirstLoadRef.current) {
            for (const [id, s] of Object.entries(newStocks)) {
              const oldPrice = prevPricesRef.current.get(id)
              if (oldPrice !== undefined && typeof s.currentPrice === 'number' && s.currentPrice !== oldPrice) {
                newFlashes[id] = s.currentPrice > oldPrice ? 'up' : 'down'
              }
            }
          } else {
            isFirstLoadRef.current = false
            // On first live load, flash open markets that have active live quotes
            for (const [id, s] of Object.entries(newStocks)) {
              const oldPrice = prevPricesRef.current.get(id)
              if (s.isMarketOpen || (oldPrice !== undefined && s.currentPrice !== oldPrice)) {
                newFlashes[id] = s.changePct >= 0 ? 'up' : 'down'
              }
            }
          }

          // Update tracked prices for the next comparison
          for (const [id, s] of Object.entries(newStocks)) {
            if (typeof s.currentPrice === 'number') {
              prevPricesRef.current.set(id, s.currentPrice)
            }
          }

          if (Object.keys(newFlashes).length > 0) {
            setFlashingCountries(newFlashes)
            if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current)
            flashTimerRef.current = window.setTimeout(() => {
              if (mounted) setFlashingCountries({})
            }, 1200)
          }

          setIsToolbarFlashing(true)
          if (toolbarFlashTimerRef.current !== null) window.clearTimeout(toolbarFlashTimerRef.current)
          toolbarFlashTimerRef.current = window.setTimeout(() => {
            if (mounted) setIsToolbarFlashing(false)
          }, 1200)

          setLiveVersion((v) => v + 1)
          setLiveUpdatedAt(Date.now())
        }
      })
    }
    load(true)
    const timer = window.setInterval(() => {
      if (!document.hidden) load(false)
    }, 60 * 1000)
    return () => {
      mounted = false
      window.clearInterval(timer)
      if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current)
      if (toolbarFlashTimerRef.current !== null) window.clearTimeout(toolbarFlashTimerRef.current)
    }
  }, [refreshKey])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allStocks = useMemo(() => ({ ...getAllStockPrices() }), [liveVersion])

  // Build unified dataset of market items
  const allMarketItems: MarketItem[] = useMemo(() => {
    return COUNTRIES.map((c) => {
      const stock = allStocks[c.id]
      const estimatedCap = liveCapData?.caps[c.id] ?? getStockMarketCapUsd(c.id)
      const baseCap = liveCapData?.baseCaps?.[c.id] ?? estimatedCap
      const multiplier = liveCapData?.multipliers?.[c.id] ?? 1.0
      const currentYear = new Date().getFullYear()
      const capYear = liveCapData?.years[c.id] ?? `${currentYear} Live Est.`
      const capSource = liveCapData?.sources[c.id] ?? 'TradingView Mainboard Exchange Aggregate'
      // Ensure 1-Day daily change percentage (전일 대비 1일 등락률 보장)
      let changePct = stock?.changePct ?? 0
      if (stock?.points && stock.points.length >= 2) {
        const prevClose = stock.points[stock.points.length - 2].close
        if (prevClose > 0) {
          changePct = Number((((stock.currentPrice - prevClose) / prevClose) * 100).toFixed(2))
        }
      }

      const marketCapUsd = calculateLiveMarketCap(estimatedCap, stock)
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

  // Build flat list of Top 5 company items filtered by continent and search query
  const companyBaseFilteredItems: CompanyHeatmapItem[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const marketMap = new Map(allMarketItems.map((m) => [m.country.id, m]))
    const list: CompanyHeatmapItem[] = []

    for (const [countryId, companies] of Object.entries(topCompaniesByCountry)) {
      const marketItem = marketMap.get(countryId)
      if (!marketItem) continue
      const country = marketItem.country

      if (selectedContinent !== 'All' && country.region !== selectedContinent) {
        continue
      }

      for (const comp of companies) {
        if (q) {
          const matchCompany =
            comp.name.toLowerCase().includes(q) ||
            comp.ticker.toLowerCase().includes(q) ||
            comp.symbol.toLowerCase().includes(q) ||
            comp.sector.toLowerCase().includes(q) ||
            comp.sectorKey.toLowerCase().includes(q) ||
            country.nameEn.toLowerCase().includes(q) ||
            country.nameKo.toLowerCase().includes(q) ||
            country.id.toLowerCase().includes(q)
          if (!matchCompany) continue
        }

        list.push({
          id: `${country.id}:${comp.symbol}`,
          country,
          company: comp,
          nationalCapUsd: marketItem.marketCapUsd,
        })
      }
    }

    list.sort((a, b) => b.company.marketCapUsd - a.company.marketCapUsd)
    return list
  }, [topCompaniesByCountry, allMarketItems, selectedContinent, searchQuery])

  // Group companies by canonical sectorKey, sorted by total sector market cap descending
  const sectorGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        sectorKey: string
        label: string
        emoji: string
        totalCap: number
        items: CompanyHeatmapItem[]
      }
    >()

    for (const item of companyBaseFilteredItems) {
      const key = item.company.sectorKey || 'Other'
      let group = map.get(key)
      if (!group) {
        group = {
          sectorKey: key,
          label: item.company.sector || key,
          emoji: getSectorEmoji(key),
          totalCap: 0,
          items: [],
        }
        map.set(key, group)
      }
      group.totalCap += item.company.marketCapUsd
      group.items.push(item)
    }

    return Array.from(map.values()).sort((a, b) => b.totalCap - a.totalCap)
  }, [companyBaseFilteredItems])

  // Final filtered companies when a specific sector is selected in `companiesUnified` or `companiesBySector`
  const finalCompanyItems = useMemo(() => {
    if (selectedSector === 'All') return companyBaseFilteredItems
    return companyBaseFilteredItems.filter(
      (item) => (item.company.sectorKey || 'Other') === selectedSector
    )
  }, [companyBaseFilteredItems, selectedSector])

  const [isZenMode, setIsZenMode] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  )

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarHeight, setToolbarHeight] = useState(48)

  useEffect(() => {
    const el = toolbarRef.current
    if (!el) return
    const updateHeight = () => {
      if (el.offsetHeight > 0) {
        setToolbarHeight(el.offsetHeight)
      }
    }
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement
      setIsZenMode(isFs)
      setViewportHeight(window.innerHeight)
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
      setViewportHeight(window.innerHeight)
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsZenMode(false)
      setViewportHeight(window.innerHeight)
    }
  }

  // Calculate full-screen height so the entire heatmap fits without vertical scroll or bottom clipping
  const unifiedCanvasHeight = useMemo(() => {
    const sectorBarExtra = isCompanyMode ? 38 : 0
    if (isZenMode) {
      // In Zen mode: container padding p-2 (16px) / sm:p-3 (24px) + space-y-2 (8px) + panel border (2px) + safe margin (6px)
      const overhead = toolbarHeight + sectorBarExtra + 40
      return Math.max(300, viewportHeight - overhead)
    }
    // In normal mode: Navbar (64/80px) + main padding (12px) + toolbar + space-y-2 (8px) + bottom margin (24px)
    const overhead = toolbarHeight + sectorBarExtra + 124
    return Math.max(450, viewportHeight - overhead)
  }, [isZenMode, viewportHeight, toolbarHeight, isCompanyMode])

  const zoomedCanvasHeight = useMemo(() => {
    // Single continent or single sector panel with header bar (~34px)
    return Math.max(300, unifiedCanvasHeight - 34)
  }, [unifiedCanvasHeight])

  const activeSectorGroup = useMemo(() => {
    if (selectedSector === 'All') return null
    return sectorGroups.find((g) => g.sectorKey === selectedSector) || null
  }, [selectedSector, sectorGroups])

  return (
    <div
      className={
        isZenMode
          ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-3 flex flex-col space-y-2 overflow-hidden'
          : 'space-y-2 animate-in fade-in duration-200 w-full'
      }
    >
      {/* 1. SINGLE-LINE ULTRA-STREAMLINED TOOLBAR */}
      <div
        ref={toolbarRef}
        className="rounded-xl bg-slate-900/90 border border-slate-800/80 px-2.5 sm:px-3 py-1.5 shadow-md flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap"
      >
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

          {liveUpdatedAt && (
            <div
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 text-[10px] font-mono font-bold shadow-sm transition-all duration-300 ${
                isToolbarFlashing
                  ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
              title={`Live quotes updated ${new Date(liveUpdatedAt).toLocaleTimeString()}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isToolbarFlashing ? 'bg-white scale-125' : 'bg-emerald-400'} animate-pulse`} />
              LIVE {new Date(liveUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

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
            <button
              type="button"
              onClick={() => setViewMode('companiesUnified')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'companiesUnified'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.heatmapViewCompaniesUnified}
            >
              <Building2 className="w-3 h-3" />
              <span className="hidden sm:inline">{t.heatmapViewCompaniesUnified}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('companiesBySector')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'companiesBySector'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.heatmapViewCompaniesBySector}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">{t.heatmapViewCompaniesBySector}</span>
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

      {/* 1.5 SECTOR FILTER BAR (Visible in Top 5 Companies Unified & By Sector modes) */}
      {isCompanyMode && (
        <div className="rounded-xl bg-slate-900/75 border border-slate-800/80 px-2.5 py-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSector('All')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              selectedSector === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
            }`}
          >
            <SectorIcon sectorKey="All" className="w-3 h-3 shrink-0" />
            <span>{t.heatmapAllSectors}</span>
            <span className="text-[10px] font-mono opacity-80">
              ({companyBaseFilteredItems.length})
            </span>
          </button>

          {sectorGroups.map((group) => {
            const isSelected = selectedSector === group.sectorKey
            return (
              <button
                key={group.sectorKey}
                type="button"
                onClick={() =>
                  setSelectedSector(isSelected ? 'All' : group.sectorKey)
                }
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
                }`}
              >
                <SectorIcon
                  sectorKey={group.sectorKey}
                  className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`}
                />
                <span>{group.label}</span>
                <span className="text-[10px] font-mono opacity-75">
                  ({group.items.length})
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* 2. FULL-WIDTH IMMERSIVE TREEMAP CANVAS */}
      <div className="w-full flex-grow min-h-0 overflow-y-auto">
        {isCompanyMode ? (
          isLoadingCompanies && companyBaseFilteredItems.length === 0 ? (
            <div
              className="rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center gap-2 text-slate-400"
              style={{ height: `${unifiedCanvasHeight}px` }}
            >
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-xs font-medium">{t.heatmapCompaniesLoading}</span>
            </div>
          ) : viewMode === 'companiesUnified' ? (
            /* TOP 5 COMPANIES UNIFIED VIEW */
            <CompanyTreemapPanel
              title={
                activeSectorGroup
                  ? activeSectorGroup.label
                  : t.heatmapViewCompaniesUnified
              }
              sectorKey={activeSectorGroup ? activeSectorGroup.sectorKey : 'Other'}
              items={finalCompanyItems}
              height={activeSectorGroup ? zoomedCanvasHeight : unifiedCanvasHeight}
              baseCurrency={baseCurrency}
              usdToBase={usdToBase}
              lang={lang}
              onSelectCountry={onSelectCountry}
              onZoom={activeSectorGroup ? () => setSelectedSector('All') : undefined}
              isZoomed={Boolean(activeSectorGroup)}
              showZoomBtn={Boolean(activeSectorGroup)}
              hideHeader={!activeSectorGroup}
            />
          ) : activeSectorGroup ? (
            /* SINGLE SECTOR ZOOMED VIEW */
            <CompanyTreemapPanel
              title={activeSectorGroup.label}
              sectorKey={activeSectorGroup.sectorKey}
              items={activeSectorGroup.items}
              height={zoomedCanvasHeight}
              baseCurrency={baseCurrency}
              usdToBase={usdToBase}
              lang={lang}
              onSelectCountry={onSelectCountry}
              onZoom={() => setSelectedSector('All')}
              isZoomed={true}
              showZoomBtn={true}
              hideHeader={false}
            />
          ) : (
            /* BY SECTOR MULTI-PANEL VIEW (Sorted by Sector Total Market Cap) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-2">
              {sectorGroups.map((group, idx) => {
                const panelHeight =
                  idx < 2
                    ? Math.max(260, Math.round(unifiedCanvasHeight * 0.48))
                    : idx < 6
                      ? Math.max(220, Math.round(unifiedCanvasHeight * 0.40))
                      : Math.max(190, Math.round(unifiedCanvasHeight * 0.34))

                return (
                  <CompanyTreemapPanel
                    key={group.sectorKey}
                    title={group.label}
                    sectorKey={group.sectorKey}
                    items={group.items}
                    height={panelHeight}
                    baseCurrency={baseCurrency}
                    usdToBase={usdToBase}
                    lang={lang}
                    onSelectCountry={onSelectCountry}
                    onZoom={() => setSelectedSector(group.sectorKey)}
                    isZoomed={false}
                    showZoomBtn={true}
                    hideHeader={false}
                  />
                )
              })}
            </div>
          )
        ) : viewMode === 'unified' ? (
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
            flashingCountries={flashingCountries}
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
                flashingCountries={flashingCountries}
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
                flashingCountries={flashingCountries}
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
              flashingCountries={flashingCountries}
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
                flashingCountries={flashingCountries}
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
                flashingCountries={flashingCountries}
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
            height={zoomedCanvasHeight}
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
            flashingCountries={flashingCountries}
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
  flashingCountries?: Record<string, 'up' | 'down'>
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
  flashingCountries,
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

  const [hoveredTopCompanies, setHoveredTopCompanies] = useState<TopCompanyItem[]>([])
  const [isLoadingTopCompanies, setIsLoadingTopCompanies] = useState(false)

  useEffect(() => {
    if (!hoveredItem) {
      setHoveredTopCompanies([])
      setIsLoadingTopCompanies(false)
      return
    }
    let active = true
    setIsLoadingTopCompanies(true)
    fetchCountryTopCompanies(hoveredItem.country.id, lang)
      .then((res) => {
        if (active) {
          setHoveredTopCompanies(res.companies)
          setIsLoadingTopCompanies(false)
        }
      })
      .catch(() => {
        if (active) {
          setHoveredTopCompanies([])
          setIsLoadingTopCompanies(false)
        }
      })
    return () => {
      active = false
    }
  }, [hoveredItem?.country.id, lang])

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
          <div className="absolute top-2 right-2 z-30 pointer-events-none w-72 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 p-3 shadow-2xl shadow-black/80 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
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
                    {lang === 'ko' ? '기준치 대비' : 'vs. Base'}:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {hoveredItem.multiplier > 1.0 ? `+${Math.round((hoveredItem.multiplier - 1) * 100)}%` : `${Math.round((hoveredItem.multiplier - 1) * 100)}%`} ({hoveredItem.multiplier}x)
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Top 5 Companies in HUD */}
            {(isLoadingTopCompanies || hoveredTopCompanies.length > 0) && (
              <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span>{translations[lang].top5CompaniesTitle}</span>
                </div>
                {isLoadingTopCompanies && hoveredTopCompanies.length === 0 ? (
                  <div className="text-[10px] text-slate-500 font-mono py-1">
                    {translations[lang].top5Loading}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {hoveredTopCompanies.map((comp) => (
                      <div
                        key={comp.symbol}
                        className="flex items-center justify-between gap-1.5 text-[10px] bg-slate-950/70 px-1.5 py-1 rounded border border-slate-800/60"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[9px] font-mono font-bold text-slate-400 w-3 shrink-0">
                            {comp.rank}.
                          </span>
                          <CompanyLogo
                            logoUrl={comp.logoUrl}
                            name={comp.name}
                            ticker={comp.ticker}
                            size="xs"
                          />
                          <span className="font-semibold text-slate-200 truncate max-w-[105px]">
                            {comp.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-mono">
                          <span className="font-bold text-indigo-300">
                            {formatStockMarketCap(comp.marketCapUsd, baseCurrency, usdToBase, lang)}
                          </span>
                          <span
                            className={`text-[9px] font-bold ${
                              comp.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {comp.changePct >= 0 ? `+${comp.changePct.toFixed(1)}%` : `${comp.changePct.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              const flashDirection = flashingCountries?.[item.country.id]

              // Adjust display based on rectangle dimensions
              const rectW = Math.max(0, r.w - 1.5)
              const rectH = Math.max(0, r.h - 1.5)
              const isExtraLarge = r.w >= 145 && r.h >= 94
              const isWide = r.w >= 92 && r.h >= 56
              const isMedium = r.w >= 54 && r.h >= 34
              const isCompact = r.w >= 32 && r.h >= 22
              const isTiny = r.w >= 16 && r.h >= 11

              return (
                <g
                  key={r.id}
                  transform={`translate(${r.x}, ${r.y})`}
                  onClick={() => onSelect(item.country)}
                  onMouseEnter={() => onHover(item.country.id)}
                  onMouseLeave={() => onHover(null)}
                  className="cursor-pointer transition-all duration-150"
                >

                  {/* Rect background */}
                  <rect
                    width={rectW}
                    height={rectH}
                    rx={r.w > 40 && r.h > 30 ? 5 : 2}
                    fill={colors.bg}
                    stroke={isHovered ? '#ffffff' : colors.border}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-colors duration-150"
                  />

                  {/* Flash Glow Effect for Live Price Changes */}
                  {flashDirection && (
                    <rect
                      key={`flash-${item.country.id}-${flashDirection}`}
                      width={rectW}
                      height={rectH}
                      rx={r.w > 40 && r.h > 30 ? 5 : 2}
                      fill={flashDirection === 'up' ? 'rgba(52, 211, 153, 0.35)' : 'rgba(244, 63, 94, 0.35)'}
                      stroke={flashDirection === 'up' ? '#34d399' : '#fb7185'}
                      strokeWidth={2.5}
                      style={{
                        animation: 'flashGlow 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      }}
                      className="pointer-events-none animate-flash-glow"
                    />
                  )}

                  {/* Content inside rectangle */}
                  {isExtraLarge ? (
                    // Extra Large Presentation (USA, China, Japan, India, etc.)
                    <foreignObject
                      x={2}
                      y={2}
                      width={Math.max(0, rectW - 4)}
                      height={Math.max(0, rectH - 4)}
                      overflow="hidden"
                      className="overflow-hidden pointer-events-none"
                    >
                      <div className="w-full h-full flex flex-col justify-between p-1.5 sm:p-2 overflow-hidden text-white pointer-events-none select-none">
                        <div className="flex items-start justify-between gap-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <CountryFlag iso2={item.country.iso2} className="w-4 h-3 sm:w-5 sm:h-3.5 rounded-[2px] shrink-0 shadow-sm" />
                            <div className="min-w-0">
                              <div className="font-black text-xs sm:text-base leading-tight tracking-tight truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                                {getCountryName(item.country, lang)}
                              </div>
                              <div className="text-[10px] sm:text-[11px] leading-tight text-slate-300 font-semibold truncate">
                                {item.indexName}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs leading-none font-mono text-slate-300 font-black px-1.5 py-0.5 rounded bg-black/30 shrink-0 whitespace-nowrap">
                            {item.country.id}
                          </span>
                        </div>

                        <div className="flex items-end justify-between gap-1 pt-0.5 min-w-0">
                          <span
                            className="px-1.5 sm:px-2 py-0.5 rounded-md text-xs sm:text-base leading-tight font-mono font-black shadow-sm shrink-0 whitespace-nowrap"
                            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                          >
                            {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                          </span>
                          <div className="text-right min-w-0">
                            <span className="text-[11px] sm:text-sm leading-tight font-mono text-white font-black block truncate">
                              {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                            </span>
                            <span className="text-[8px] sm:text-[9px] leading-none text-slate-400 font-mono block">
                              CAP
                            </span>
                          </div>
                        </div>
                      </div>
                    </foreignObject>
                  ) : isWide ? (
                    // Wide Presentation (UK, France, Germany, Korea, Taiwan, Brazil, etc.)
                    <foreignObject
                      x={2}
                      y={2}
                      width={Math.max(0, rectW - 4)}
                      height={Math.max(0, rectH - 4)}
                      overflow="hidden"
                      className="overflow-hidden pointer-events-none"
                    >
                      <div className="w-full h-full flex flex-col justify-between p-1 sm:p-1.5 overflow-hidden text-white pointer-events-none select-none">
                        <div className="flex items-center justify-between gap-1 min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <CountryFlag iso2={item.country.iso2} className="w-3.5 h-2.5 sm:w-4 sm:h-3 rounded-[2px] shrink-0" />
                            <span className="font-black text-[11px] sm:text-sm leading-tight tracking-tight truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                              {getCountryName(item.country, lang)}
                            </span>
                          </div>
                          {r.w >= 115 && (
                            <span className="text-[9px] sm:text-[10px] leading-none font-mono text-slate-300 font-bold shrink-0 whitespace-nowrap">
                              {item.country.id}
                            </span>
                          )}
                        </div>

                        {r.h >= 72 && (
                          <div className="text-[9px] sm:text-[10px] leading-tight text-slate-200/90 truncate font-semibold">
                            {item.indexName}
                          </div>
                        )}

                        {r.w >= 118 ? (
                          <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0">
                            <span
                              className="px-1 py-0.5 rounded text-[10px] sm:text-[11px] leading-none font-mono font-black shrink-0 whitespace-nowrap"
                              style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                            >
                              {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                            </span>
                            <span className="text-[10px] sm:text-xs leading-none font-mono text-slate-200/90 font-bold truncate min-w-0">
                              {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-end min-w-0 gap-0.5">
                            <span
                              className="text-[10px] leading-none font-mono font-black whitespace-nowrap truncate"
                              style={{ color: colors.badgeText }}
                            >
                              {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                            </span>
                            <span className="text-[9px] leading-none font-mono text-slate-200/90 font-bold truncate">
                              {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                            </span>
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  ) : isMedium ? (
                    // Medium Presentation
                    <foreignObject
                      x={1.5}
                      y={1.5}
                      width={Math.max(0, rectW - 3)}
                      height={Math.max(0, rectH - 3)}
                      overflow="hidden"
                      className="overflow-hidden pointer-events-none"
                    >
                      <div className="w-full h-full flex flex-col justify-between p-0.5 sm:p-1 overflow-hidden text-white pointer-events-none select-none text-center">
                        <div className="flex items-center justify-center gap-1 min-w-0">
                          <CountryFlag iso2={item.country.iso2} className="w-3 h-2 rounded-[1px] shrink-0" />
                          <span className="font-black text-[10px] sm:text-xs leading-none tracking-tight truncate">
                            {item.country.id}
                          </span>
                        </div>
                        <div
                          className="text-[9px] sm:text-[10px] font-mono font-bold leading-none whitespace-nowrap truncate"
                          style={{ color: colors.badgeText }}
                        >
                          {item.changePct > 0 ? `+${item.changePct.toFixed(1)}%` : `${item.changePct.toFixed(1)}%`}
                        </div>
                        {r.h >= 46 && (
                          <div className="text-[8px] sm:text-[9px] leading-none font-mono text-slate-300 truncate">
                            {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  ) : isCompact ? (
                    // Compact Presentation
                    <foreignObject
                      x={1}
                      y={1}
                      width={Math.max(0, rectW - 2)}
                      height={Math.max(0, rectH - 2)}
                      overflow="hidden"
                      className="overflow-hidden pointer-events-none"
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-0.5 overflow-hidden text-white pointer-events-none select-none text-center leading-none gap-0.5">
                        <span className="font-bold text-[8px] sm:text-[9px] leading-none font-mono whitespace-nowrap">
                          {item.country.id}
                        </span>
                        <span
                          className="text-[7px] sm:text-[8px] leading-none font-mono font-bold whitespace-nowrap"
                          style={{ color: colors.badgeText }}
                        >
                          {r.w >= 40
                            ? item.changePct > 0
                              ? `+${item.changePct.toFixed(1)}%`
                              : `${item.changePct.toFixed(1)}%`
                            : item.changePct > 0
                              ? `+${item.changePct.toFixed(0)}%`
                              : `${item.changePct.toFixed(0)}%`}
                        </span>
                      </div>
                    </foreignObject>
                  ) : isTiny ? (
                    // Micro Presentation
                    <foreignObject
                      x={0.5}
                      y={0.5}
                      width={Math.max(0, rectW - 1)}
                      height={Math.max(0, rectH - 1)}
                      overflow="hidden"
                      className="overflow-hidden pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center overflow-hidden text-white pointer-events-none select-none text-center leading-none">
                        <span className="font-bold text-[7px] sm:text-[8px] leading-none font-mono tracking-tighter whitespace-nowrap">
                          {r.w >= 24 ? item.country.id : item.country.iso2}
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

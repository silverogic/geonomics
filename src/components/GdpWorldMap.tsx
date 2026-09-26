import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ChevronDown,
  Check,
  ExternalLink,
  Activity,
} from 'lucide-react'
import { TileWorldMap } from './TileWorldMap'
import type { CountryMeta, BaseCurrency, ExchangeRates, Region, Language, EconomicYear } from '../types/economics'
import { CountryFlag } from './CountryFlag'
import { RankingTable, type CountryRowItem } from './RankingTable'
import { formatGdpCompact, formatPerCapita, getPerCapitaColorClass, getInflationColorClass, getInflationHexColor } from '../utils/formatters'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { ECONOMIC_YEAR_OPTIONS } from '../utils/economicYears'
import { getCountryName, COUNTRY_NAMES_JA } from '../utils/countryNames'
import { getFuelPriceColor, formatFuelPrice, FUEL_COLOR_LOW, FUEL_COLOR_MID, FUEL_COLOR_HIGH } from '../data/fuelPrices'

export type MapMetric = 'gdp' | 'perCapita' | 'growth' | 'debt' | 'inflation' | 'fuelPrice'

interface GdpWorldMapProps {
  items: CountryRowItem[]
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
  selectedYear: EconomicYear
  onYearChange: (year: EconomicYear) => void
  onSelectCountry: (country: CountryMeta) => void
}

const ALL_REGIONS: Region[] = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania']

interface MetricOptionConfig {
  id: MapMetric
  labelKey: 'metricTotalGdp' | 'metricPerCapita' | 'metricGrowth' | 'metricDebt' | 'metricInflation' | 'metricFuelPrice'
}

const METRIC_OPTIONS: MetricOptionConfig[] = [
  { id: 'gdp', labelKey: 'metricTotalGdp' },
  { id: 'perCapita', labelKey: 'metricPerCapita' },
  { id: 'growth', labelKey: 'metricGrowth' },
  { id: 'debt', labelKey: 'metricDebt' },
  { id: 'inflation', labelKey: 'metricInflation' },
  { id: 'fuelPrice', labelKey: 'metricFuelPrice' },
]

export const GdpWorldMap: React.FC<GdpWorldMapProps> = ({
  items,
  baseCurrency,
  exchangeRates,
  lang,
  selectedYear,
  onYearChange,
  onSelectCountry,
}) => {
  const t = translations[lang]
  const [metric, setMetric] = useState<MapMetric>('gdp')
  const [isMetricMenuOpen, setIsMetricMenuOpen] = useState(false)
  const metricMenuRef = useRef<HTMLDivElement>(null)
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([])
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false)
  const regionMenuRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const isAllRegions = selectedRegions.length === 0 || selectedRegions.length === ALL_REGIONS.length

  // Click outside and ESC key listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionMenuRef.current && !regionMenuRef.current.contains(e.target as Node)) {
        setIsRegionMenuOpen(false)
      }
      if (metricMenuRef.current && !metricMenuRef.current.contains(e.target as Node)) {
        setIsMetricMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRegionMenuOpen(false)
        setIsMetricMenuOpen(false)
      }
    }
    if (isRegionMenuOpen || isMetricMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRegionMenuOpen, isMetricMenuOpen])

  // Hover state for HUD inspection
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null)
  const [pinnedCountryId, setPinnedCountryId] = useState<string | null>(null)

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

  // Country count per region for informative multi-select badges
  const regionCountryCounts = useMemo(() => {
    const counts: Record<Region, number> = {
      Asia: 0,
      Europe: 0,
      Americas: 0,
      Africa: 0,
      Oceania: 0,
    }
    for (const item of items) {
      if (counts[item.country.region] !== undefined) {
        counts[item.country.region]++
      }
    }
    return counts
  }, [items])

  // Filtered items when continent multi-selection is active
  const filteredItems = useMemo(() => {
    if (isAllRegions) return items
    return items.filter((item) => selectedRegions.includes(item.country.region))
  }, [items, selectedRegions, isAllRegions])

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
        if (gdp >= 10_000_000_000_000) return '#fbbf24' // $10T+ Vivid Gold (USA, China)
        if (gdp >= 2_000_000_000_000) return '#34d399' // $2T-$10T Bright Mint/Emerald (Germany, Japan, India, UK, France, Italy, Brazil, Canada)
        if (gdp >= 500_000_000_000) return '#10b981' // $500B-$2T Medium Emerald (South Korea, Australia, Mexico, Spain, Indonesia, etc.)
        if (gdp >= 100_000_000_000) return '#047857' // $100B-$500B Deep Forest (Netherlands, Saudi, Switzerland, Poland, etc.)
        return '#064e3b' // < $100B Dark Forest Slate
      }

      if (metric === 'perCapita') {
        const pcap = item.gdpPerCapitaUsd
        if (pcap >= 50_000) return '#facc15' // Champagne Gold ($50K+)
        if (pcap >= 25_000) return '#06b6d4' // Cyan ($25K ~ $50K)
        if (pcap >= 12_000) return '#6366f1' // Indigo ($12K ~ $25K)
        return '#475569' // Slate (< $12K)
      }

      if (metric === 'growth') {
        const g = item.growthRatePct
        if (g === null || g === undefined) return '#334155'
        if (g >= 5.0) return '#34d399' // > 5.0% (Light Mint Emerald)
        if (g >= 2.5) return '#10b981' // 2.5% ~ 5.0% (Medium Emerald)
        if (g >= 0.0) return '#047857' // 0% ~ 2.5% (Deep Forest Emerald)
        return '#f43f5e' // < 0% Negative growth (Rose)
      }

      if (metric === 'debt') {
        const d = item.debtRatioPct
        if (d === null || d === undefined) return '#334155'
        if (d < 60) return '#10b981' // 좋음 (< 60%, Emerald)
        if (d < 90) return '#f59e0b' // 주의 (60% ~ 90%, Amber)
        return '#f43f5e' // 위험 (>= 90%, Rose)
      }

      if (metric === 'inflation') {
        return getInflationHexColor(item.inflationRatePct)
      }

      if (metric === 'fuelPrice') {
        return getFuelPriceColor(item.fuelPriceUsd)
      }

      return '#334155'
    },
    [countryItemMap, metric]
  )

  const handleToggleRegion = (reg: Region) => {
    setSelectedRegions((prev) => {
      // If currently all (empty or 5), clicking a specific region isolates that region
      if (prev.length === 0 || prev.length === ALL_REGIONS.length) {
        return [reg]
      }
      if (prev.includes(reg)) {
        const next = prev.filter((r) => r !== reg)
        return next
      } else {
        const next = [...prev, reg]
        return next.length === ALL_REGIONS.length ? [] : next
      }
    })
  }

  const handleSelectAllRegions = () => {
    setSelectedRegions([])
  }

  // 0.7-second Long Press handler to isolate a single continent
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressTriggeredRef = useRef<boolean>(false)
  const [pressingRegion, setPressingRegion] = useState<Region | null>(null)

  const handleIsolateRegion = useCallback((reg: Region) => {
    setSelectedRegions([reg])
  }, [])

  const handleRegionMouseDown = (reg: Region) => {
    isLongPressTriggeredRef.current = false
    setPressingRegion(reg)
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true
      handleIsolateRegion(reg)
      setPressingRegion(null)
    }, 700)
  }

  const handleRegionMouseUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setPressingRegion(null)
  }

  const handleRegionClick = (reg: Region) => {
    if (isLongPressTriggeredRef.current) {
      // Ignore click event if 0.7s long-press already triggered isolation
      isLongPressTriggeredRef.current = false
      return
    }
    handleToggleRegion(reg)
  }

  const getRegionButtonLabel = () => {
    if (isAllRegions) return t.filterAll
    if (selectedRegions.length === 1) {
      const reg = selectedRegions[0]
      return reg === 'Asia'
        ? t.filterAsia
        : reg === 'Europe'
          ? t.filterEurope
          : reg === 'Americas'
            ? t.filterAmericas
            : reg === 'Africa'
              ? t.filterAfrica
              : t.filterOceania
    }
    if (selectedRegions.length === 2) {
      const getRegName = (r: Region) =>
        r === 'Asia'
          ? t.filterAsia
          : r === 'Europe'
            ? t.filterEurope
            : r === 'Americas'
              ? t.filterAmericas
              : r === 'Africa'
                ? t.filterAfrica
                : t.filterOceania
      return `${getRegName(selectedRegions[0])}, ${getRegName(selectedRegions[1])}`
    }
    if (lang === 'ko') return `${selectedRegions.length}개 대륙`
    if (lang === 'ja') return `${selectedRegions.length}地域`
    if (lang === 'es') return `${selectedRegions.length} regiones`
    if (lang === 'zh') return `${selectedRegions.length}个大洲`
    return `${selectedRegions.length} Regions`
  }

  const getMetricLabel = (m: MapMetric) => {
    const opt = METRIC_OPTIONS.find((o) => o.id === m)
    return opt ? t[opt.labelKey] : ''
  }

  // Cleanup long-press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    }
  }, [])

  const handleCountrySelect = (country: CountryMeta) => {
    setPinnedCountryId(country.id)
    onSelectCountry(country)
  }

  return (
    <div className="space-y-6">
      {/* 1. UNIFIED MAP HEADER & CONTROL BAR */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        {/* Upper Row: Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {t.mapTitle}
          </h1>
        </div>

        {/* Lower Row: Filter HUD (Metric, Region, Year, Map Style & Search) */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Selector Combobox */}
            <div className="relative" ref={metricMenuRef}>
              <button
                type="button"
                id="mapMetricCombobox"
                onClick={() => setIsMetricMenuOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isMetricMenuOpen}
                className={`flex items-center gap-2 bg-slate-950/90 border rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0 transition-all ${isMetricMenuOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
                  }`}
              >
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.mapMetricLabel}:</span>
                </span>
                <span className="text-slate-100 font-bold max-w-[130px] sm:max-w-[180px] truncate">
                  {getMetricLabel(metric)}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMetricMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Metric Dropdown Menu (Single-select) */}
              {isMetricMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 sm:w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-0.5">
                    {METRIC_OPTIONS.map((opt) => {
                      const isSelected = metric === opt.id
                      const label = t[opt.labelKey]
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setMetric(opt.id)
                            setIsMetricMenuOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none ${isSelected
                            ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                            }`}
                        >
                          <span className={isSelected ? 'text-white font-bold' : 'text-slate-300'}>{label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Region Filter Multi-select Combobox */}
            <div className="relative" ref={regionMenuRef}>
              <button
                type="button"
                id="mapRegionMultiSelect"
                onClick={() => setIsRegionMenuOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isRegionMenuOpen}
                className={`flex items-center gap-2 bg-slate-950/90 border rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0 transition-all ${isRegionMenuOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
                  }`}
              >
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'ko' ? '대륙' : lang === 'ja' ? '地域' : lang === 'es' ? 'Región' : lang === 'zh' ? '大洲' : 'Region'}:</span>
                </span>
                <span className="text-slate-100 font-bold max-w-[130px] sm:max-w-[180px] truncate">
                  {getRegionButtonLabel()}
                </span>
                {!isAllRegions && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                    {selectedRegions.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isRegionMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Multi-select Dropdown Menu */}
              {isRegionMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* 'All' Option */}
                  <button
                    type="button"
                    onClick={handleSelectAllRegions}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isAllRegions
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${isAllRegions ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-950'
                        }`}>
                        {isAllRegions && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{t.filterAll} ({lang === 'ko' ? '전체 대륙' : 'All Regions'})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{items.length}</span>
                  </button>

                  <div className="h-px bg-slate-800/80 my-1.5" />

                  {/* 5 Region Options with Checkboxes & Counts */}
                  <div className="space-y-1">
                    {ALL_REGIONS.map((reg) => {
                      const isChecked = isAllRegions || selectedRegions.includes(reg)
                      const isIsolated = !isAllRegions && selectedRegions.includes(reg)
                      const count = regionCountryCounts[reg] || 0
                      const regLabel =
                        reg === 'Asia'
                          ? t.filterAsia
                          : reg === 'Europe'
                            ? t.filterEurope
                            : reg === 'Americas'
                              ? t.filterAmericas
                              : reg === 'Africa'
                                ? t.filterAfrica
                                : t.filterOceania

                      return (
                        <button
                          key={reg}
                          type="button"
                          onMouseDown={() => handleRegionMouseDown(reg)}
                          onMouseUp={handleRegionMouseUpOrLeave}
                          onMouseLeave={handleRegionMouseUpOrLeave}
                          onTouchStart={() => handleRegionMouseDown(reg)}
                          onTouchEnd={handleRegionMouseUpOrLeave}
                          onClick={() => handleRegionClick(reg)}
                          title={
                            lang === 'ko'
                              ? '클릭: 다중 선택 토글 | 0.7초 이상 길게 누름: 이 대륙만 단독 선택'
                              : 'Click: Toggle | Hold for 0.7s: Select only this region'
                          }
                          className={`relative overflow-hidden w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none ${pressingRegion === reg ? 'scale-[0.98] bg-indigo-950/70 border-indigo-500/50' : ''
                            } ${isIsolated
                              ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                              : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                        >
                          {/* 0.7s Long-press Progress Bar Indicator */}
                          {pressingRegion === reg && (
                            <div
                              className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-300 pointer-events-none rounded-full"
                              style={{
                                width: '100%',
                                animation: 'longPressBar 0.7s linear forwards',
                              }}
                            />
                          )}

                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-950'
                              }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{regLabel}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{count}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 1-second Long-press Discovery Tip */}
                  <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/30 text-[10px] text-indigo-300/80 flex items-center justify-center gap-1.5">
                    <span>💡</span>
                    <span>
                      {lang === 'ko'
                        ? '길게 누르면 해당 대륙만 단독 선택'
                        : 'Hold for long to select only this region'}
                    </span>
                  </div>

                  {/* Quick Actions Footer */}
                  <div className="pt-2 mt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] px-1">
                    <button
                      type="button"
                      onClick={handleSelectAllRegions}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors py-1 px-1.5 rounded hover:bg-indigo-950/40"
                    >
                      {lang === 'ko' ? '전체 선택' : lang === 'ja' ? '全選択' : lang === 'es' ? 'Seleccionar todo' : lang === 'zh' ? '全选' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRegions(['Asia'])
                      }}
                      className="text-slate-400 hover:text-slate-200 transition-colors py-1 px-1.5 rounded hover:bg-slate-800/40"
                    >
                      {lang === 'ko' ? '초기화' : lang === 'ja' ? 'リセット' : lang === 'es' ? 'Restablecer' : lang === 'zh' ? '重置' : 'Reset'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Year Switcher (3 options - toggle switch permitted under 4 options) */}
            <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
                {t.yearLabel}
              </span>
              {ECONOMIC_YEAR_OPTIONS.map((opt) => (
                <button
                  key={opt.year}
                  onClick={() => onYearChange(opt.year)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedYear === opt.year
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                  {t[opt.labelKey].replace('{year}', opt.year)}
                </button>
              ))}
            </div>

          </div>

          {/* Quick Country Search (Alined with filter row) */}
          <div className="relative w-full sm:w-64 xl:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE WORLD MAP & INSPECTOR HUD */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* MAP CANVAS (Takes 3 columns on wide screens) */}
        <div className="xl:col-span-3 space-y-4">
          <TileWorldMap
            items={items}
            metric={metric}
            baseCurrency={baseCurrency}
            usdToBase={usdToBase}
            lang={lang}
            selectedRegions={selectedRegions}
            selectedRegion={selectedRegions.length === 1 ? selectedRegions[0] : 'All'}
            searchQuery={searchQuery}
            hoveredCountryId={hoveredCountryId}
            pinnedCountryId={pinnedCountryId}
            getCountryFill={getCountryFill}
            onHoverCountry={(id) => setHoveredCountryId(id)}
            onSelectCountry={handleCountrySelect}
          />

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
                      : metric === 'debt'
                        ? t.metricDebt
                        : metric === 'inflation'
                          ? t.metricInflation
                          : t.metricFuelPrice}
              </span>
            </div>

            {/* Legend scale swatches */}
            <div className="flex flex-wrap items-center gap-3">
              {metric === 'gdp' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#fbbf24] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$10T+</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#34d399] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$2T ~ $10T</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$500B ~ $2T</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#047857] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$100B ~ $500B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#064e3b] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">&lt; $100B</span>
                  </div>
                </>
              )}

              {metric === 'perCapita' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#facc15] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">&ge; $50K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#06b6d4] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$25K ~ $50K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#6366f1] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">$12K ~ $25K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#475569] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">&lt; $12K</span>
                  </div>
                </>
              )}

              {metric === 'growth' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#34d399] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">&gt; 5.0%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">2.5% ~ 5.0%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#047857] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">0% ~ 2.5%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#f43f5e] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">&lt; 0%</span>
                  </div>
                </>
              )}

              {metric === 'debt' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      &lt; 60%
                      <span className="text-[10px] text-emerald-400 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '좋음' : lang === 'ja' ? '良好' : lang === 'es' ? 'Bueno' : lang === 'zh' ? '良好' : 'Good'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      60% ~ 90%
                      <span className="text-[10px] text-amber-400 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '주의' : lang === 'ja' ? '注意' : lang === 'es' ? 'Precaución' : lang === 'zh' ? '注意' : 'Caution'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#f43f5e] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      &ge; 90%
                      <span className="text-[10px] text-rose-400 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '위험' : lang === 'ja' ? '危険' : lang === 'es' ? 'Peligro' : lang === 'zh' ? '危险' : 'Danger'})
                      </span>
                    </span>
                  </div>
                </>
              )}

              {metric === 'inflation' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#06b6d4] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      &le; 2.5%
                      <span className="text-[10px] text-cyan-400 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '안정' : lang === 'ja' ? '安定' : lang === 'es' ? 'Estable' : lang === 'zh' ? '稳定' : 'Stable'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#fcd34d] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      2.5% ~ 4.5%
                      <span className="text-[10px] text-amber-200 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '상승' : lang === 'ja' ? '上昇' : lang === 'es' ? 'Moderada' : lang === 'zh' ? '温和' : 'Moderate'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] shadow-sm"></span>
                    <span className="text-slate-300 font-mono font-medium">
                      &gt; 4.5%
                      <span className="text-[10px] text-amber-400 ml-1 font-sans font-semibold">
                        ({lang === 'ko' ? '과열' : lang === 'ja' ? '過熱' : lang === 'es' ? 'Alta' : lang === 'zh' ? '过热' : 'High'})
                      </span>
                    </span>
                  </div>
                </>
              )}

              {metric === 'fuelPrice' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                  {/* Continuous Spectrum Bar (Option 3: Teal -> Amber -> Deep Orange) */}
                  <div className="flex flex-col gap-1 w-full sm:w-60">
                    <div
                      className="h-2.5 rounded-full w-full shadow-inner border border-slate-700/60"
                      style={{
                        background: `linear-gradient(to right, ${FUEL_COLOR_LOW} 0%, ${FUEL_COLOR_MID} 50%, ${FUEL_COLOR_HIGH} 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold px-0.5">
                      <span>$0.40</span>
                      <span>$1.30</span>
                      <span>$2.40+</span>
                    </div>
                  </div>
                  {/* Range Labels */}
                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488] shadow-sm"></span>
                      <span className="text-slate-300 font-medium">{t.fuelLowPrice}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shadow-sm"></span>
                      <span className="text-slate-300 font-medium">{t.fuelMidPrice}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] shadow-sm"></span>
                      <span className="text-slate-300 font-medium">{t.fuelHighPrice}</span>
                    </div>
                    <span className="hidden xl:inline text-[10px] text-slate-500 border-l border-slate-800 pl-2">
                      {t.fuelPriceNote}
                    </span>
                  </div>
                </div>
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
                  {baseCurrency !== 'USD' && (
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      ${(inspectedCountryItem.totalGdpUsd / 1e12).toFixed(2)}T
                    </div>
                  )}
                </div>

                {/* GDP Per Capita */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">{t.cardPerCapita}</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${getPerCapitaColorClass(inspectedCountryItem.gdpPerCapitaUsd)}`}>
                    {formatPerCapita(
                      inspectedCountryItem.gdpPerCapitaUsd,
                      baseCurrency,
                      usdToBase,
                      lang
                    )}
                  </div>
                  {baseCurrency !== 'USD' && (
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      ${Math.round(inspectedCountryItem.gdpPerCapitaUsd).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Growth Rate, Inflation Rate & Debt Ratio Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2 min-w-0 overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-medium truncate">{t.metricGrowth}</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 flex items-center gap-0.5 min-w-0 ${inspectedCountryItem.growthRatePct === null || inspectedCountryItem.growthRatePct === undefined
                        ? 'text-slate-400'
                        : inspectedCountryItem.growthRatePct >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        }`}
                    >
                      {inspectedCountryItem.growthRatePct !== null && inspectedCountryItem.growthRatePct !== undefined ? (
                        inspectedCountryItem.growthRatePct >= 0 ? (
                          <TrendingUp className="w-3 h-3 shrink-0" />
                        ) : (
                          <TrendingDown className="w-3 h-3 shrink-0" />
                        )
                      ) : null}
                      <span className="truncate">
                        {inspectedCountryItem.growthRatePct !== null && inspectedCountryItem.growthRatePct !== undefined
                          ? inspectedCountryItem.growthRatePct > 0
                            ? `+${inspectedCountryItem.growthRatePct.toFixed(1)}%`
                            : `${inspectedCountryItem.growthRatePct.toFixed(1)}%`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2 min-w-0 overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-medium truncate">{t.metricInflation}</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 truncate ${getInflationColorClass(
                        inspectedCountryItem.inflationRatePct
                      )}`}
                    >
                      {inspectedCountryItem.inflationRatePct !== null && inspectedCountryItem.inflationRatePct !== undefined
                        ? `${inspectedCountryItem.inflationRatePct.toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2 min-w-0 overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-medium truncate">{t.metricDebt}</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 truncate ${inspectedCountryItem.debtRatioPct === null || inspectedCountryItem.debtRatioPct === undefined
                        ? 'text-slate-400'
                        : inspectedCountryItem.debtRatioPct < 60
                          ? 'text-emerald-400'
                          : inspectedCountryItem.debtRatioPct < 90
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                    >
                      {inspectedCountryItem.debtRatioPct !== null &&
                        inspectedCountryItem.debtRatioPct !== undefined
                        ? `${inspectedCountryItem.debtRatioPct.toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Fuel Price Card in HUD */}
                {inspectedCountryItem.fuelPriceUsd !== null && inspectedCountryItem.fuelPriceUsd !== undefined && (
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: getFuelPriceColor(inspectedCountryItem.fuelPriceUsd) }}
                        />
                        <span>{t.metricFuelPrice}</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {formatFuelPrice(inspectedCountryItem.fuelPriceUsd, baseCurrency, usdToBase, lang)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        RON 95 / ${inspectedCountryItem.fuelPriceUsd.toFixed(2)}/L
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
                        style={{
                          backgroundColor: `${getFuelPriceColor(inspectedCountryItem.fuelPriceUsd)}20`,
                          color: getFuelPriceColor(inspectedCountryItem.fuelPriceUsd),
                        }}
                      >
                        {inspectedCountryItem.fuelPriceUsd < 0.8
                          ? t.fuelLowPrice
                          : inspectedCountryItem.fuelPriceUsd <= 1.8
                            ? t.fuelMidPrice
                            : t.fuelHighPrice}
                      </span>
                    </div>
                  </div>
                )}
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

      {/* 4. FULL RANKING LIST TABLE */}
      <div className="pt-2">
        <RankingTable
          items={filteredItems}
          baseCurrency={baseCurrency}
          exchangeRates={exchangeRates}
          lang={lang}
          onSelectCountry={onSelectCountry}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          hideHeader={false}
        />
      </div>
    </div>
  )
}

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowUpDown, Search, ArrowUp, ArrowDown, AlertCircle, Sparkles } from 'lucide-react'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, EconomicYear } from '../types/economics'
import { ECONOMIC_YEAR_OPTIONS, DEFAULT_ECONOMIC_YEAR } from '../utils/economicYears'
import { formatGdpCompact, formatPerCapita, formatExchangeRate } from '../utils/formatters'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { getCountryName, getCountrySecondaryName, COUNTRY_NAMES_JA } from '../utils/countryNames'
import { StockSparkline } from './StockSparkline'
import { getStockPriceData } from '../data/stockPrices'

export interface CountryRowItem {
  country: CountryMeta
  rank: number
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  debtRatioPct: number | null
  inflationRatePct: number | null
  interestRatePct?: number | null
  centralBankName?: string | null
}

interface RankingTableProps {
  items: CountryRowItem[]
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
  onSelectCountry: (c: CountryMeta) => void
  hideHeader?: boolean
  selectedYear?: EconomicYear
  onYearChange?: (year: EconomicYear) => void
}

type SortField =
  | 'rank'
  | 'countryName'
  | 'totalGdpUsd'
  | 'gdpPerCapitaUsd'
  | 'growthRatePct'
  | 'debtRatioPct'
  | 'inflationRatePct'
  | 'fxRate'
  | 'stockChangePct'
  | 'interestRatePct'

export const RankingTable: React.FC<RankingTableProps> = ({
  items,
  baseCurrency,
  exchangeRates,
  lang,
  onSelectCountry,
  hideHeader = false,
  selectedYear = DEFAULT_ECONOMIC_YEAR,
  onYearChange,
}) => {
  const t = translations[lang]
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Ref to the table wrapper — used to scroll data rows into view below the dock
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  // Ref to the datatable scroll container, table, and mobile floating dock
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const mobileDockRef = useRef<HTMLDivElement>(null)

  // State to track if table content exceeds container width
  const [isTableOverflowing, setIsTableOverflowing] = useState(false)
  const isFrozen = isTableOverflowing

  // Mobile/desktop floating dock state
  const [isMobileDockActive, setIsMobileDockActive] = useState(false)
  const [dockTop, setDockTop] = useState(100)
  const [dockGeometry, setDockGeometry] = useState<{
    left: number
    width: number
    tableWidth: number
    colWidths: number[]
  }>({
    left: 0,
    width: 0,
    tableWidth: 0,
    colWidths: [],
  })

  // Prevent circular scroll sync between table container and mobile dock
  const isSyncingFromDock = useRef(false)
  const isSyncingFromContainer = useRef(false)

  const handleContainerScroll = () => {
    if (isSyncingFromDock.current) return
    if (mobileDockRef.current && tableContainerRef.current) {
      isSyncingFromContainer.current = true
      mobileDockRef.current.scrollLeft = tableContainerRef.current.scrollLeft
      requestAnimationFrame(() => {
        isSyncingFromContainer.current = false
      })
    }
  }

  const handleDockScroll = () => {
    if (isSyncingFromContainer.current) return
    if (mobileDockRef.current && tableContainerRef.current) {
      isSyncingFromDock.current = true
      tableContainerRef.current.scrollLeft = mobileDockRef.current.scrollLeft
      requestAnimationFrame(() => {
        isSyncingFromDock.current = false
      })
    }
  }

  const setDockRef = (node: HTMLDivElement | null) => {
    mobileDockRef.current = node
    if (node && tableContainerRef.current) {
      node.scrollLeft = tableContainerRef.current.scrollLeft
    }
  }

  const updateGeometry = () => {
    if (typeof window === 'undefined') return
    if (!tableRef.current || !tableContainerRef.current) return

    // 1. Detect if table content actually exceeds container width
    const container = tableContainerRef.current
    const table = tableRef.current
    const overflowing = table.scrollWidth > container.clientWidth + 2
    setIsTableOverflowing((prev) => (prev !== overflowing ? overflowing : prev))

    // 2. Measure geometry for the floating dock
    const ths = table.querySelectorAll<HTMLTableCellElement>('thead:first-of-type tr th')
    if (ths.length === 0) return

    const widths = Array.from(ths).map((th) => Math.round(th.getBoundingClientRect().width))
    const cRect = container.getBoundingClientRect()
    const tRect = table.getBoundingClientRect()
    const newLeft = Math.round(cRect.left)
    const newWidth = Math.round(cRect.width)
    const newTableWidth = Math.round(tRect.width)

    // Only update state if geometry actually changed! Prevents unnecessary re-renders.
    setDockGeometry((prev) => {
      if (
        prev.left === newLeft &&
        prev.width === newWidth &&
        prev.tableWidth === newTableWidth &&
        prev.colWidths.length === widths.length &&
        prev.colWidths.every((w, i) => Math.abs(w - widths[i]) < 1)
      ) {
        return prev // Same reference, React skips re-rendering!
      }
      return {
        left: newLeft,
        width: newWidth,
        tableWidth: newTableWidth,
        colWidths: widths,
      }
    })
  }

  useEffect(() => {
    let resizeRaf: number | null = null

    const checkDockVisibility = () => {
      if (typeof window === 'undefined') {
        setIsMobileDockActive((prev) => (prev ? false : prev))
        return
      }
      if (!tableContainerRef.current || !tableRef.current) return

      // If table completely fits within container (e.g. wide desktop screen),
      // native CSS sticky thead handles vertical pinning; dock is not needed!
      const isOverflowing = tableRef.current.scrollWidth > tableContainerRef.current.clientWidth + 2
      if (!isOverflowing) {
        setIsMobileDockActive((prev) => (prev ? false : prev))
        return
      }

      const rect = tableContainerRef.current.getBoundingClientRect()
      const navEl = document.querySelector('header')
      const navbarH = navEl
        ? Math.round(navEl.getBoundingClientRect().height)
        : window.innerWidth < 640
        ? 100
        : window.innerWidth < 768
        ? 116
        : 80
      const dockHeight = 44

      const shouldDock = rect.top <= navbarH && rect.bottom > navbarH

      if (shouldDock) {
        const calculatedTop = Math.min(navbarH, rect.bottom - dockHeight)
        setDockTop((prev) => (prev !== calculatedTop ? calculatedTop : prev))
        setIsMobileDockActive((prev) => (!prev ? true : prev))
      } else {
        setIsMobileDockActive((prev) => (prev ? false : prev))
      }
    }

    const onScroll = () => {
      checkDockVisibility()
    }

    const handleResize = () => {
      if (typeof window === 'undefined') return

      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        updateGeometry()
        checkDockVisibility()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Initial check (runs once on mount or when items/lang change)
    if (typeof window !== 'undefined') {
      updateGeometry()
    }
    checkDockVisibility()

    let ro: ResizeObserver | null = null
    if (tableContainerRef.current && typeof window !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf)
        resizeRaf = requestAnimationFrame(() => {
          updateGeometry()
          checkDockVisibility()
        })
      })
      ro.observe(tableContainerRef.current)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleResize)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      if (ro) ro.disconnect()
    }
  }, [items.length, lang, baseCurrency])

  useEffect(() => {
    if (isMobileDockActive && mobileDockRef.current && tableContainerRef.current) {
      mobileDockRef.current.scrollLeft = tableContainerRef.current.scrollLeft
    }
  }, [isMobileDockActive])

  // When searchTerm changes (and has content), scroll the table into view so that
  // the first matching data row appears below the sticky thead (dock), not behind it.
  // scroll-padding-top in index.css ensures the dock offset is respected.
  useEffect(() => {
    if (!searchTerm || !tableWrapperRef.current) return
    tableWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [searchTerm])

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      if (['totalGdpUsd', 'gdpPerCapitaUsd', 'growthRatePct', 'debtRatioPct', 'inflationRatePct', 'stockChangePct', 'interestRatePct'].includes(field)) {
        setSortDirection('desc')
      } else {
        setSortDirection('asc')
      }
    }
  }

  const filteredAndSorted = useMemo(() => {
    return items
      .filter((item) => {
        const query = searchTerm.toLowerCase().trim()
        if (!query) return true
        const matchesNameJa = COUNTRY_NAMES_JA[item.country.id]?.toLowerCase().includes(query) || false
        return (
          item.country.nameEn.toLowerCase().includes(query) ||
          item.country.nameKo.toLowerCase().includes(query) ||
          matchesNameJa ||
          item.country.id.toLowerCase().includes(query) ||
          item.country.currencyCode.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof CountryRowItem]
        let valB: any = b[sortField as keyof CountryRowItem]

        if (sortField === 'countryName') {
          valA = getCountryName(a.country, lang)
          valB = getCountryName(b.country, lang)
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }

        if (sortField === 'fxRate') {
          valA = exchangeRates ? getConversionRate(exchangeRates, a.country.currencyCode, baseCurrency) : 0
          valB = exchangeRates ? getConversionRate(exchangeRates, b.country.currencyCode, baseCurrency) : 0
        }

        if (sortField === 'stockChangePct') {
          const sA = getStockPriceData(a.country.id)
          const sB = getStockPriceData(b.country.id)
          valA = sA && sA.isSupported ? sA.changePct : -Infinity
          valB = sB && sB.isSupported ? sB.changePct : -Infinity
        }

        if (sortField === 'interestRatePct') {
          valA = a.interestRatePct !== null && a.interestRatePct !== undefined ? a.interestRatePct : -Infinity
          valB = b.interestRatePct !== null && b.interestRatePct !== undefined ? b.interestRatePct : -Infinity
        }

        valA = valA ?? -Infinity
        valB = valB ?? -Infinity

        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
      })
  }, [items, searchTerm, sortField, sortDirection, exchangeRates, baseCurrency, lang])

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
    )
  }

  const renderHeaderCells = (isDock: boolean) => (
    <>
      <th
        onClick={() => handleSort('rank')}
        style={isDock && dockGeometry.colWidths[0] ? { width: `${dockGeometry.colWidths[0]}px`, minWidth: `${dockGeometry.colWidths[0]}px`, maxWidth: `${dockGeometry.colWidths[0]}px` } : undefined}
        className={`${isDock || isFrozen ? 'sticky left-0 z-30' : 'static'} bg-slate-950 py-3 px-1 sm:px-3 cursor-pointer hover:text-slate-200 border-b border-slate-800 shadow-sm first:rounded-tl-xl transition-colors whitespace-nowrap w-10 min-w-[40px] max-w-[40px] sm:w-12 sm:min-w-[48px] sm:max-w-[48px] text-center`}
      >
        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
          <span>{t.colRank}</span>
          {renderSortIcon('rank')}
        </div>
      </th>

      <th
        onClick={() => handleSort('countryName')}
        style={isDock && dockGeometry.colWidths[1] ? { width: `${dockGeometry.colWidths[1]}px`, minWidth: `${dockGeometry.colWidths[1]}px`, maxWidth: `${dockGeometry.colWidths[1]}px` } : undefined}
        className={`${
          isDock || isFrozen
            ? 'sticky left-10 sm:left-12 z-30 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.5)] border-r border-slate-800/80'
            : 'static shadow-none border-r-0'
        } bg-slate-950 py-3 px-1.5 sm:px-3 cursor-pointer hover:text-slate-200 border-b border-slate-800 transition-colors whitespace-nowrap min-w-[100px] sm:min-w-[130px] md:min-w-[170px]`}
      >
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span>{t.colCountry}</span>
          {renderSortIcon('countryName')}
        </div>
      </th>

      <th
        style={isDock && dockGeometry.colWidths[2] ? { width: `${dockGeometry.colWidths[2]}px`, minWidth: `${dockGeometry.colWidths[2]}px`, maxWidth: `${dockGeometry.colWidths[2]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 border-b border-slate-800 shadow-sm text-slate-400 whitespace-nowrap min-w-[65px] sm:min-w-[75px]"
      >
        {t.colCurrency}
      </th>

      <th
        onClick={() => handleSort('fxRate')}
        style={isDock && dockGeometry.colWidths[3] ? { width: `${dockGeometry.colWidths[3]}px`, minWidth: `${dockGeometry.colWidths[3]}px`, maxWidth: `${dockGeometry.colWidths[3]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[110px] sm:min-w-[125px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colFxRate.replace('{base}', baseCurrency)}</span>
          {renderSortIcon('fxRate')}
        </div>
      </th>

      <th
        onClick={() => handleSort('stockChangePct')}
        style={isDock && dockGeometry.colWidths[4] ? { width: `${dockGeometry.colWidths[4]}px`, minWidth: `${dockGeometry.colWidths[4]}px`, maxWidth: `${dockGeometry.colWidths[4]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[140px] sm:min-w-[160px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colStockIndex}</span>
          {renderSortIcon('stockChangePct')}
        </div>
      </th>

      <th
        onClick={() => handleSort('interestRatePct')}
        style={isDock && dockGeometry.colWidths[5] ? { width: `${dockGeometry.colWidths[5]}px`, minWidth: `${dockGeometry.colWidths[5]}px`, maxWidth: `${dockGeometry.colWidths[5]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[100px] sm:min-w-[115px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colInterestRate}</span>
          {renderSortIcon('interestRatePct')}
        </div>
      </th>

      <th
        onClick={() => handleSort('totalGdpUsd')}
        style={isDock && dockGeometry.colWidths[6] ? { width: `${dockGeometry.colWidths[6]}px`, minWidth: `${dockGeometry.colWidths[6]}px`, maxWidth: `${dockGeometry.colWidths[6]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-3 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[105px] sm:min-w-[120px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colTotalGdp}</span>
          {renderSortIcon('totalGdpUsd')}
        </div>
      </th>

      <th
        onClick={() => handleSort('gdpPerCapitaUsd')}
        style={isDock && dockGeometry.colWidths[7] ? { width: `${dockGeometry.colWidths[7]}px`, minWidth: `${dockGeometry.colWidths[7]}px`, maxWidth: `${dockGeometry.colWidths[7]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[105px] sm:min-w-[120px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colPerCapita}</span>
          {renderSortIcon('gdpPerCapitaUsd')}
        </div>
      </th>

      <th
        onClick={() => handleSort('growthRatePct')}
        style={isDock && dockGeometry.colWidths[8] ? { width: `${dockGeometry.colWidths[8]}px`, minWidth: `${dockGeometry.colWidths[8]}px`, maxWidth: `${dockGeometry.colWidths[8]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[85px] sm:min-w-[95px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colGrowth}</span>
          {renderSortIcon('growthRatePct')}
        </div>
      </th>

      <th
        onClick={() => handleSort('inflationRatePct')}
        style={isDock && dockGeometry.colWidths[9] ? { width: `${dockGeometry.colWidths[9]}px`, minWidth: `${dockGeometry.colWidths[9]}px`, maxWidth: `${dockGeometry.colWidths[9]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap min-w-[90px] sm:min-w-[100px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colInflation}</span>
          {renderSortIcon('inflationRatePct')}
        </div>
      </th>

      <th
        onClick={() => handleSort('debtRatioPct')}
        style={isDock && dockGeometry.colWidths[10] ? { width: `${dockGeometry.colWidths[10]}px`, minWidth: `${dockGeometry.colWidths[10]}px`, maxWidth: `${dockGeometry.colWidths[10]}px` } : undefined}
        className="bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm rounded-tr-xl last:rounded-tr-xl transition-colors whitespace-nowrap min-w-[90px] sm:min-w-[100px]"
      >
        <div className="flex items-center justify-end gap-1.5">
          <span>{t.colDebt}</span>
          {renderSortIcon('debtRatioPct')}
        </div>
      </th>
    </>
  )

  return (
    <div ref={tableWrapperRef} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
      {/* Header & Search */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{t.tableTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t.tableSubtitle.replace('{count}', items.length.toString())}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {onYearChange && (
              <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
                  {t.yearLabel}:
                </span>
                {ECONOMIC_YEAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.year}
                    onClick={() => onYearChange(opt.year)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedYear === opt.year
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {t[opt.labelKey].replace('{year}', opt.year)}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
      {/* Mobile Hint Banner: Explains Option 1 + Option 2 */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800/90 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{t.tableMobileHint}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0 ml-2">
          {t.tableMobileAllMetrics}
        </span>
      </div>

      {/* Floating Sticky Header Dock */}
      {isMobileDockActive && dockGeometry.colWidths.length > 0 && (
        <div
          ref={setDockRef}
          onScroll={handleDockScroll}
          className="fixed z-40 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] bg-slate-950 border-x border-b border-slate-800 shadow-2xl transition-[top] duration-75"
          style={{
            top: `${dockTop}px`,
            left: `${dockGeometry.left}px`,
            width: `${dockGeometry.width}px`,
          }}
        >
          <table
            style={{ width: `${dockGeometry.tableWidth}px` }}
            className="text-left border-separate border-spacing-0 text-sm table-fixed"
          >
            <colgroup>
              {dockGeometry.colWidths.map((w, idx) => (
                <col key={idx} style={{ width: `${w}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-slate-950 text-xs font-semibold text-slate-400">
                {renderHeaderCells(true)}
              </tr>
            </thead>
          </table>
        </div>
      )}

      {/* Datatable */}
      <div
        ref={tableContainerRef}
        onScroll={handleContainerScroll}
        className={`rounded-xl border border-slate-800 ${
          isTableOverflowing
            ? 'overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent'
            : 'overflow-visible'
        }`}
      >
        <table ref={tableRef} className="w-full text-left border-separate border-spacing-0 text-sm">
          <thead
            className={`sticky z-30 bg-slate-950 transition-opacity duration-150 ${
              isTableOverflowing
                ? isMobileDockActive
                  ? 'opacity-0 pointer-events-none top-0'
                  : 'top-0'
                : 'top-0 md:top-[var(--navbar-h)]'
            }`}
          >
            <tr className="bg-slate-950 text-xs font-semibold text-slate-400">
              {renderHeaderCells(false)}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  {t.noCountriesFound}
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((item) => {
              const fxRate = exchangeRates
                ? getConversionRate(exchangeRates, item.country.currencyCode, baseCurrency)
                : 0

              const displayName = getCountryName(item.country, lang)
              const secondaryName = getCountrySecondaryName(item.country, lang)

              return (
                <tr
                  key={item.country.id}
                  onClick={() => onSelectCountry(item.country)}
                  className="hover:bg-slate-800/70 transition-colors cursor-pointer group"
                >
                  <td className={`${isFrozen ? 'sticky left-0 z-20' : 'static'} bg-slate-900 group-hover:bg-slate-800/95 py-3 px-1 sm:px-3 border-b border-slate-800/60 font-mono font-bold text-slate-400 group-hover:text-indigo-400 whitespace-nowrap w-10 min-w-[40px] max-w-[40px] sm:w-12 sm:min-w-[48px] sm:max-w-[48px] text-center transition-colors`}>
                    #{item.rank}
                  </td>

                  <td className={`${
                    isFrozen
                      ? 'sticky left-10 sm:left-12 z-20 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.5)] border-r border-slate-800/80'
                      : 'static shadow-none border-r-0'
                  } bg-slate-900 group-hover:bg-slate-800/95 py-3 px-1.5 sm:px-3 border-b border-slate-800/60 transition-colors whitespace-nowrap min-w-[100px] sm:min-w-[130px] md:min-w-[170px]`}>
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                      <CountryFlag iso2={item.country.iso2} className="w-5 h-3.5 sm:w-7 sm:h-5 shrink-0" alt={displayName} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 group-hover:text-white flex items-center gap-1 sm:gap-1.5 min-w-0">
                          <span className="truncate max-w-[68px] sm:max-w-none">{displayName}</span>
                          <span className="text-[11px] font-mono text-slate-500 hidden md:inline shrink-0">{item.country.id}</span>
                        </div>
                        <span className="text-xs text-slate-400 truncate hidden md:block">{secondaryName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-xs whitespace-nowrap min-w-[65px] sm:min-w-[75px]">
                    <span
                      className="font-mono font-bold text-slate-200"
                      title={`${item.country.currencyCode} (${item.country.currencySymbol})`}
                    >
                      {item.country.currencyCode}
                    </span>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right font-mono font-semibold text-slate-200 whitespace-nowrap min-w-[110px] sm:min-w-[125px]">
                    {formatExchangeRate(fxRate, item.country.currencyCode === 'KRW' ? 4 : 2)}
                  </td>

                  {/* Stock Market Mini Chart */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right min-w-[140px] sm:min-w-[160px]">
                    {(() => {
                      const stockData = getStockPriceData(item.country.id)
                      if (!stockData) {
                        return <span className="text-slate-600 font-mono text-xs">-</span>
                      }
                      if (!stockData.isSupported) {
                        return (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {lang === 'ko'
                              ? '제재/제한'
                              : lang === 'ja'
                              ? '制限'
                              : lang === 'es'
                              ? 'Restringido'
                              : lang === 'zh'
                              ? '受限'
                              : 'Restricted'}
                          </span>
                        )
                      }
                      return (
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <div className="text-right min-w-0">
                            <span className="text-xs font-mono font-semibold text-slate-200 block leading-normal whitespace-nowrap">
                              {stockData.currentPrice.toLocaleString()}
                            </span>
                            <span
                              className="text-[10px] text-slate-400 truncate block leading-normal max-w-[70px]"
                              title={stockData.nameEn}
                            >
                              {lang === 'ko' ? stockData.nameKo : stockData.nameEn}
                            </span>
                          </div>
                          {stockData.points.length > 0 && (
                            <StockSparkline
                              points={stockData.points}
                              isPositive={stockData.changePct >= 0}
                              width={44}
                              height={18}
                            />
                          )}
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                              stockData.changePct >= 0
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            }`}
                          >
                            {stockData.changePct >= 0 ? '+' : ''}{stockData.changePct}%
                          </span>
                        </div>
                      )
                    })()}
                  </td>

                  {/* Central Bank Policy Rate */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[100px] sm:min-w-[115px]">
                    {item.interestRatePct !== null && item.interestRatePct !== undefined ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-mono font-bold text-slate-200 text-xs sm:text-sm">
                          {item.interestRatePct.toFixed(2)}%
                        </span>
                        {item.centralBankName && (
                          <span
                            className="text-[10px] font-mono text-indigo-300 bg-indigo-950/70 border border-indigo-500/30 px-1.5 py-0.5 rounded"
                            title={item.centralBankName}
                          >
                            {item.centralBankName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600 font-mono text-xs">-</span>
                    )}
                  </td>

                  {/* Total GDP */}
                  <td className="py-3 px-2 sm:px-3 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[105px] sm:min-w-[120px]">
                    <span className="font-bold text-slate-100 block">
                      {formatGdpCompact(item.totalGdpUsd, baseCurrency, usdToBase, lang)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ${(item.totalGdpUsd / 1e12).toFixed(2)}T
                    </span>
                  </td>

                  {/* GDP Per Capita */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[105px] sm:min-w-[120px]">
                    <span className="font-semibold text-white block">
                      {formatPerCapita(item.gdpPerCapitaUsd, baseCurrency, usdToBase, lang)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ${Math.round(item.gdpPerCapitaUsd).toLocaleString()}
                    </span>
                  </td>

                  {/* Growth Rate */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[85px] sm:min-w-[95px]">
                    {item.growthRatePct !== null ? (
                       <span
                        className={`font-mono font-semibold ${
                          item.growthRatePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.growthRatePct > 0 ? `+${item.growthRatePct.toFixed(1)}%` : `${item.growthRatePct.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">-</span>
                    )}
                  </td>

                  {/* Inflation Rate */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[90px] sm:min-w-[100px]">
                    {item.inflationRatePct !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-xs border ${
                          item.inflationRatePct < 0
                            ? 'text-purple-300 bg-purple-950/60 border-purple-500/30'
                            : item.inflationRatePct <= 2.5
                            ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                            : item.inflationRatePct <= 4.0
                            ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
                            : item.inflationRatePct <= 7.0
                            ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                            : 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                        }`}
                        title={`${t.modalInflationTitle}: ${item.inflationRatePct.toFixed(1)}%`}
                      >
                        {item.inflationRatePct > 7.0 && (
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        )}
                        {item.inflationRatePct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">-</span>
                    )}
                  </td>

                  {/* Debt Ratio */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right whitespace-nowrap min-w-[90px] sm:min-w-[100px]">
                    {item.debtRatioPct !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-xs border ${
                          item.debtRatioPct < 60
                            ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                            : item.debtRatioPct < 90
                            ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                            : 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                        }`}
                        title={`${t.modalDebtTitle}: ${item.debtRatioPct.toFixed(1)}%`}
                      >
                        {item.debtRatioPct >= 90 && (
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        )}
                        {item.debtRatioPct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">-</span>
                    )}
                  </td>
                </tr>
              )
            }))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

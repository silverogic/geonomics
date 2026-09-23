import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowUpDown, Search, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react'
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

      {/* Datatable */}
      <div className="rounded-xl border border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <table className="w-full text-left border-separate border-spacing-0 text-sm">
          <thead className="sticky top-[var(--navbar-h)] z-30">
            <tr className="bg-slate-950 text-xs font-semibold text-slate-400">
              <th
                onClick={() => handleSort('rank')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-3 cursor-pointer hover:text-slate-200 border-b border-slate-800 shadow-sm first:rounded-tl-xl transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colRank}</span>
                  {renderSortIcon('rank')}
                </div>
              </th>

              <th
                onClick={() => handleSort('countryName')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-3 cursor-pointer hover:text-slate-200 border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colCountry}</span>
                  {renderSortIcon('countryName')}
                </div>
              </th>

              <th className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 hidden xl:table-cell border-b border-slate-800 shadow-sm text-slate-400 whitespace-nowrap">
                {t.colCurrency}
              </th>

              <th
                onClick={() => handleSort('fxRate')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colFxRate.replace('{base}', baseCurrency)}</span>
                  {renderSortIcon('fxRate')}
                </div>
              </th>

              <th
                onClick={() => handleSort('stockChangePct')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden sm:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colStockIndex}</span>
                  {renderSortIcon('stockChangePct')}
                </div>
              </th>

              <th
                onClick={() => handleSort('interestRatePct')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden md:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colInterestRate}</span>
                  {renderSortIcon('interestRatePct')}
                </div>
              </th>

              <th
                onClick={() => handleSort('totalGdpUsd')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-3 cursor-pointer hover:text-slate-200 text-right border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colTotalGdp.replace('{base}', baseCurrency)}</span>
                  {renderSortIcon('totalGdpUsd')}
                </div>
              </th>

              <th
                onClick={() => handleSort('gdpPerCapitaUsd')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden lg:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colPerCapita}</span>
                  {renderSortIcon('gdpPerCapitaUsd')}
                </div>
              </th>

              <th
                onClick={() => handleSort('growthRatePct')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden sm:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colGrowth}</span>
                  {renderSortIcon('growthRatePct')}
                </div>
              </th>

              <th
                onClick={() => handleSort('inflationRatePct')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden sm:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colInflation}</span>
                  {renderSortIcon('inflationRatePct')}
                </div>
              </th>

              <th
                onClick={() => handleSort('debtRatioPct')}
                className="sticky top-[var(--navbar-h)] z-30 bg-slate-950 py-3 px-2 sm:px-2.5 cursor-pointer hover:text-slate-200 text-right hidden md:table-cell border-b border-slate-800 shadow-sm transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.colDebt}</span>
                  {renderSortIcon('debtRatioPct')}
                </div>
              </th>
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
                  <td className="py-3 px-2 sm:px-3 border-b border-slate-800/60 font-mono font-bold text-slate-400 group-hover:text-indigo-400 whitespace-nowrap">
                    #{item.rank}
                  </td>

                  <td className="py-3 px-2 sm:px-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <CountryFlag iso2={item.country.iso2} className="w-6 h-4 sm:w-7 sm:h-5 shrink-0" alt={displayName} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5 truncate">
                          <span>{displayName}</span>
                          <span className="text-[11px] font-mono text-slate-500">{item.country.id}</span>
                        </div>
                        <span className="text-xs text-slate-400 truncate block">{secondaryName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 hidden xl:table-cell text-xs text-slate-300 whitespace-nowrap">
                    <span className="font-mono font-bold">{item.country.currencyCode}</span>{' '}
                    <span className="text-slate-500">({item.country.currencySymbol})</span>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right font-mono font-semibold text-slate-200 whitespace-nowrap">
                    {formatExchangeRate(fxRate, item.country.currencyCode === 'KRW' ? 4 : 2)}
                  </td>

                  {/* Stock Market Mini Chart */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden sm:table-cell">
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

                  {/* Central Bank Policy Rate (Right of Stock Benchmark) */}
                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden md:table-cell whitespace-nowrap">
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

                  <td className="py-3 px-2 sm:px-3 border-b border-slate-800/60 text-right whitespace-nowrap">
                    <span className="font-bold text-slate-100 block">
                      {formatGdpCompact(item.totalGdpUsd, baseCurrency, usdToBase, lang)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ${(item.totalGdpUsd / 1e12).toFixed(2)}T
                    </span>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden lg:table-cell whitespace-nowrap">
                    <span className="font-semibold text-slate-300 block">
                      {formatPerCapita(item.gdpPerCapitaUsd, baseCurrency, usdToBase, lang)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ${Math.round(item.gdpPerCapitaUsd).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden sm:table-cell whitespace-nowrap">
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

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden sm:table-cell whitespace-nowrap">
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

                  <td className="py-3 px-2 sm:px-2.5 border-b border-slate-800/60 text-right hidden md:table-cell whitespace-nowrap">
                    {item.debtRatioPct !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-xs border ${
                          item.debtRatioPct < 60
                            ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                            : item.debtRatioPct <= 100
                            ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                            : 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                        }`}
                        title={`${t.modalDebtTitle}: ${item.debtRatioPct.toFixed(1)}%`}
                      >
                        {item.debtRatioPct > 100 && (
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

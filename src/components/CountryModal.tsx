import React, { useEffect, useState } from 'react'
import { X, ExternalLink, ShieldCheck, TrendingUp, TrendingDown, Award, LineChart, AlertCircle } from 'lucide-react'
import type { CountryMeta, CountryGdpDetail, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from '../types/economics'
import { fetchCountryGdpDetail } from '../services/worldBankApi'
import { getConversionRate } from '../services/exchangeApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { formatGdpCompact, formatPerCapita, getPerCapitaColorClass, getInflationColorClass } from '../utils/formatters'
import { DEFAULT_ECONOMIC_YEAR } from '../utils/economicYears'
import { GdpChart } from './GdpChart'
import { CurrencyConverter } from './CurrencyConverter'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { StockChart } from './StockChart'
import { getStockPriceData } from '../data/stockPrices'
import { getCountryName, getCountrySecondaryName, getCurrencyName } from '../utils/countryNames'
import { getBigMacData, getBigMacColor, formatBigMacPrice } from '../data/bigMac'
import { Spinner } from './Spinner'

interface CountryModalProps {
  country: CountryMeta
  rank: number
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  lang: Language
  selectedYear?: EconomicYear
  onClose: () => void
}

export const CountryModal: React.FC<CountryModalProps> = ({
  country,
  rank,
  baseCurrency,
  exchangeRates,
  interestRates,
  lang,
  selectedYear = DEFAULT_ECONOMIC_YEAR,
  onClose,
}) => {
  const t = translations[lang]
  const interestRateInfo = getCountryInterestRate(interestRates, country)
  const [detail, setDetail] = useState<CountryGdpDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const stockData = getStockPriceData(country.id)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetchCountryGdpDetail(country.id, selectedYear)
      .then((res) => {
        if (isMounted) {
          setDetail(res)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load country detail:', err)
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [country.id, selectedYear])

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Conversion rates
  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1

  const displayName = getCountryName(country, lang)
  const secondaryName = getCountrySecondaryName(country, lang)
  const currencyName = getCurrencyName(country, lang)

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Country Flag, Name, Rank */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <CountryFlag iso2={country.iso2} className="w-11 h-7.5 sm:w-12 sm:h-8 shrink-0" alt={displayName} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate" title={`${displayName} (${secondaryName})`}>
                  {displayName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {country.id}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0"
                  title={`${t.modalRankTitle} (${t.modalRankSub})`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{t.modalRankValue.replace('{rank}', rank.toString())}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {country.region} • {currencyName} ({country.currencyCode})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
            title={t.modalClose}
            aria-label={t.modalClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Total GDP */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={detail ? `$${(detail.totalGdpUsd / 1e12).toFixed(2)}T USD` : undefined}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalTotalGdpTitle} ({detail?.latestYear ?? selectedYear})
              </span>
              <div className="text-base lg:text-lg font-bold font-mono text-white tracking-tight truncate">
                {detail ? formatGdpCompact(detail.totalGdpUsd, baseCurrency, usdToBase, lang) : t.loadingData}
              </div>
            </div>

            {/* GDP Per Capita */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={detail ? `$${Math.round(detail.gdpPerCapitaUsd).toLocaleString()} USD` : undefined}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalPerCapitaTitle}
              </span>
              <div className={`text-base lg:text-lg font-bold font-mono tracking-tight truncate ${getPerCapitaColorClass(detail?.gdpPerCapitaUsd)}`}>
                {detail ? formatPerCapita(detail.gdpPerCapitaUsd, baseCurrency, usdToBase, lang) : t.loadingData}
              </div>
            </div>

            {/* Annual Growth Rate */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={t.modalRealGrowth}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalGrowthTitle}
              </span>
              <div
                className={`text-base lg:text-lg font-bold font-mono flex items-center gap-1 min-w-0 ${
                  detail?.growthRatePct !== null && (detail?.growthRatePct ?? 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {detail?.growthRatePct !== null && (detail?.growthRatePct ?? 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">
                  {detail?.growthRatePct !== null && detail?.growthRatePct !== undefined
                    ? `${detail.growthRatePct.toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Inflation Rate */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={t.modalInflationSub}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalInflationTitle}
              </span>
              <div
                className={`text-base lg:text-lg font-bold flex items-center gap-1 font-mono truncate ${getInflationColorClass(
                  detail?.inflationRatePct
                )}`}
              >
                {detail?.inflationRatePct !== null &&
                  detail?.inflationRatePct !== undefined &&
                  detail.inflationRatePct > 4.5 && (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                {detail?.inflationRatePct !== null && detail?.inflationRatePct !== undefined
                  ? `${detail.inflationRatePct.toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>

            {/* National Debt Ratio */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={t.modalDebtSub}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalDebtTitle}
              </span>
              <div
                className={`text-base lg:text-lg font-bold flex items-center gap-1 font-mono truncate ${
                  detail?.debtRatioPct === null || detail?.debtRatioPct === undefined
                    ? 'text-slate-400'
                    : detail.debtRatioPct < 60
                      ? 'text-emerald-400'
                      : detail.debtRatioPct < 90
                        ? 'text-amber-400'
                        : 'text-rose-400'
                }`}
              >
                {detail?.debtRatioPct !== null && detail?.debtRatioPct !== undefined && detail.debtRatioPct >= 90 && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                {detail?.debtRatioPct !== null && detail?.debtRatioPct !== undefined
                  ? `${detail.debtRatioPct.toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>

            {/* Central Bank Policy Rate */}
            <div
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
              title={interestRateInfo?.date ? `${interestRateInfo.date} (${interestRateInfo.source})` : t.modalInterestRateSub}
            >
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalInterestRateTitle}
              </span>
              <div className="text-base lg:text-lg font-bold text-indigo-300 font-mono flex items-center gap-1.5 truncate">
                {interestRateInfo ? (
                  <>
                    <span>{interestRateInfo.ratePct.toFixed(2)}%</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/70 border border-indigo-700/50 px-1.5 py-0.5 rounded font-normal">
                      {interestRateInfo.centralBankName}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-mono text-sm">-</span>
                )}
              </div>
            </div>

            {/* Big Mac Index Card */}
            {(() => {
              const bm = getBigMacData(country.id)
              if (!bm) return null
              const color = getBigMacColor(bm.valuationRawPct)
              return (
                <div
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-0 overflow-hidden"
                  title={`$${bm.dollarPrice.toFixed(2)} USD (${bm.localPrice.toLocaleString()} ${bm.currencyCode})`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 truncate">
                      🍔 {t.metricBigMac}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="flex items-baseline gap-1.5 truncate font-mono">
                    <span className="text-base lg:text-lg font-bold text-white tracking-tight">
                      {formatBigMacPrice(bm.dollarPrice, baseCurrency, usdToBase, lang)}
                    </span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {bm.valuationRawPct > 0 ? `+${bm.valuationRawPct.toFixed(1)}%` : `${bm.valuationRawPct.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Real-time Currency Converter (includes exchange rate info) */}
          <CurrencyConverter
            country={country}
            baseCurrency={baseCurrency}
            exchangeRates={exchangeRates}
            lang={lang}
          />

          {/* National Benchmark Stock Index Chart */}
          {stockData && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  {t.modalStockIndexTitle} ({lang === 'ko' ? stockData.nameKo : stockData.nameEn})
                </h4>
                {stockData.ticker && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {stockData.ticker}
                  </span>
                )}
              </div>

              <StockChart countryId={country.id} lang={lang} />
            </div>
          )}

          {/* 10-Year Historical GDP Chart */}
          <div>
            {(() => {
              const endYear = detail?.latestYear ?? (selectedYear ? parseInt(selectedYear, 10) : 2024)
              const startYear = endYear - 9
              const chartPoints = (detail?.historical || []).filter(
                (p) => p.year >= startYear && p.year <= endYear
              )
              const chartTitle = t.modalChartTitle
                .replace('{startYear}', startYear.toString())
                .replace('2015', startYear.toString())
                .replace('{year}', endYear.toString())

              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-200">
                      {chartTitle}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {t.modalChartUnit.replace('{base}', baseCurrency)}
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="h-72 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800">
                      <Spinner size="md" label={t.modalChartLoading} />
                    </div>
                  ) : (
                    <GdpChart
                      countryName={displayName}
                      dataPoints={chartPoints}
                      baseCurrency={baseCurrency}
                      exchangeRateToBase={usdToBase}
                      lang={lang}
                    />
                  )}
                </>
              )
            })()}
          </div>

          {/* Compact Single-Line Source & Official Portals Bar */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {lang === 'ko'
                  ? '출처: IMF WEO · World Bank · BIS · ECB · The Economist · Yahoo Finance'
                  : 'Sources: IMF WEO · World Bank · BIS · ECB · The Economist · Yahoo Finance'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-indigo-400 shrink-0">
              <a
                href={country.id === 'TWN' ? 'https://www.imf.org/en/Countries/TWN' : `https://data.worldbank.org/country/${country.id.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <span>
                  {country.id === 'TWN'
                    ? lang === 'ko'
                      ? 'IMF 대만 포털'
                      : 'IMF Taiwan Portal'
                    : t.modalWorldBankLink}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.imf.org/external/datamapper/GGXWDG_NGDP@WEO/OEMDC/ADVEC/WEOWORLD/${country.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <span>{t.modalImfLink}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

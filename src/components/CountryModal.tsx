import React, { useEffect, useState } from 'react'
import { X, ExternalLink, ShieldCheck, TrendingUp, TrendingDown, Award, LineChart, AlertCircle } from 'lucide-react'
import type { CountryMeta, CountryGdpDetail, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from '../types/economics'
import { fetchCountryGdpDetail } from '../services/worldBankApi'
import { getConversionRate } from '../services/exchangeApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { formatGdpCompact, formatPerCapita } from '../utils/formatters'
import { DEFAULT_ECONOMIC_YEAR } from '../utils/economicYears'
import { GdpChart } from './GdpChart'
import { CurrencyConverter } from './CurrencyConverter'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { StockChart } from './StockChart'
import { getStockPriceData } from '../data/stockPrices'
import { getCountryName, getCountrySecondaryName, getCurrencyName } from '../utils/countryNames'
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3.5">
            <CountryFlag iso2={country.iso2} className="w-13 h-9" alt={displayName} />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-white">{displayName}</h2>
                <span className="text-sm text-slate-400 font-medium">({secondaryName})</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {country.id} / {country.iso2}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.modalContinent}: {country.region} • {t.modalCurrency}: {currencyName} ({country.currencyCode} {country.currencySymbol})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={t.modalClose}
            aria-label={t.modalClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            {/* Total GDP */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalTotalGdpTitle} ({detail?.latestYear ?? selectedYear})
              </span>
              <div className="text-base lg:text-lg font-bold text-white tracking-tight truncate">
                {detail ? formatGdpCompact(detail.totalGdpUsd, baseCurrency, usdToBase, lang) : t.loadingData}
              </div>
              {baseCurrency !== 'USD' && detail && (
                <span className="text-xs text-indigo-400 font-mono truncate block">
                  ${(detail.totalGdpUsd / 1e12).toFixed(2)}T USD
                </span>
              )}
            </div>

            {/* GDP Per Capita */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalPerCapitaTitle}
              </span>
              <div className="text-base lg:text-lg font-bold text-white tracking-tight truncate">
                {detail ? formatPerCapita(detail.gdpPerCapitaUsd, baseCurrency, usdToBase, lang) : t.loadingData}
              </div>
              {baseCurrency !== 'USD' && detail && (
                <span className="text-xs text-indigo-400 font-mono truncate block">
                  ${Math.round(detail.gdpPerCapitaUsd).toLocaleString()} USD
                </span>
              )}
            </div>

            {/* Annual Growth Rate */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalGrowthTitle}
              </span>
              <div
                className={`text-base lg:text-lg font-bold flex items-center gap-1 min-w-0 ${
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
              <span className="text-[11px] text-slate-400 truncate block">{t.modalRealGrowth}</span>
            </div>

            {/* Inflation Rate */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 block mb-1 truncate">
                {t.modalInflationTitle}
              </span>
              <div
                className={`text-base lg:text-lg font-bold flex items-center gap-1 font-mono truncate ${
                  detail?.inflationRatePct === null || detail?.inflationRatePct === undefined
                    ? 'text-slate-400'
                    : detail.inflationRatePct < 0
                      ? 'text-purple-400'
                      : detail.inflationRatePct <= 2.5
                        ? 'text-emerald-400'
                        : detail.inflationRatePct <= 4.0
                          ? 'text-cyan-400'
                          : detail.inflationRatePct <= 7.0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                }`}
              >
                {detail?.inflationRatePct !== null && detail?.inflationRatePct !== undefined && detail.inflationRatePct > 7.0 && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                {detail?.inflationRatePct !== null && detail?.inflationRatePct !== undefined
                  ? `${detail.inflationRatePct.toFixed(1)}%`
                  : 'N/A'}
              </div>
              <span className="text-[11px] text-slate-400 truncate block" title={t.modalInflationSub}>
                {t.modalInflationSub}
              </span>
            </div>

            {/* National Debt Ratio */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
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
              <span className="text-[11px] text-slate-400 truncate block" title={t.modalDebtSub}>
                {t.modalDebtSub}
              </span>
            </div>

            {/* Central Bank Policy Rate */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 min-w-0 overflow-hidden">
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
              <span className="text-[11px] text-slate-400 truncate block" title={t.modalInterestRateSub}>
                {interestRateInfo?.date ? `${interestRateInfo.date} (${interestRateInfo.source})` : t.modalInterestRateSub}
              </span>
            </div>

            {/* Global Rank */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.modalRankTitle}
              </span>
              <div className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{t.modalRankValue.replace('{rank}', rank.toString())}</span>
              </div>
              <span className="text-[11px] text-slate-500">{t.modalRankSub}</span>
            </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
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
                <span className="text-[11px] text-slate-400">{t.modalStockIndexSub}</span>
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

          {/* Authoritative Source Transparency */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.modalAccuracyTitle}</span>
            </div>
            <p>
              • {country.id === 'TWN'
                ? (lang === 'ko'
                    ? 'GDP 통계: 세계은행 미수록 국가로 국제통화기금(IMF WEO) 및 대만 행정원 주계총처(DGBAS) 공식 집계치 기준.'
                    : lang === 'ja'
                      ? 'GDP統計: 世界銀行未収録のため、国際通貨基金(IMF WEO)および台湾行政院主計総処(DGBAS)公式統計基準。'
                      : lang === 'es'
                        ? 'Estadísticas del PIB: no registradas en el Banco Mundial; basadas en las estadísticas oficiales del FMI (WEO) y la DGBAS de Taiwán.'
                        : lang === 'zh'
                          ? 'GDP 统计: 鉴于世行未收录，数据来源于国际货币基金组织 (IMF WEO) 与台湾地区统计部门官方数据。'
                          : 'GDP Statistics: Sourced from IMF World Economic Outlook (WEO) & DGBAS Taiwan official data.')
                : t.modalAccuracyGdp}
            </p>
            <p>• {t.modalAccuracyDebt}</p>
            <p>• {t.modalAccuracyInflation}</p>
            <p>• {t.modalAccuracyFx}</p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-indigo-400">
              <a
                href={country.id === 'TWN' ? 'https://www.imf.org/en/Countries/TWN' : `https://data.worldbank.org/country/${country.id.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <span>
                  {country.id === 'TWN'
                    ? lang === 'ko'
                      ? 'IMF 대만 공식 경제 포털 바로가기'
                      : lang === 'ja'
                        ? 'IMF 台湾公式経済ポータル'
                        : lang === 'es'
                          ? 'Visitar el portal de datos del FMI sobre Taiwán'
                          : lang === 'zh'
                            ? '访问 IMF 台湾地区数据门户'
                            : 'Visit IMF Taiwan Data Portal'
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

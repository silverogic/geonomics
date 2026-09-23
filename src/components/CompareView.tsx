import React, { useState, useEffect } from 'react'
import { GitCompare, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import type { CountryGdpDetail, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from '../types/economics'
import { ECONOMIC_YEAR_OPTIONS, DEFAULT_ECONOMIC_YEAR } from '../utils/economicYears'
import { fetchCountryGdpDetail } from '../services/worldBankApi'
import { getConversionRate } from '../services/exchangeApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { formatGdpCompact, formatPerCapita, formatExchangeRate } from '../utils/formatters'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { GdpChart } from './GdpChart'
import { getCountryName, getCountrySecondaryName } from '../utils/countryNames'

interface CompareViewProps {
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  lang: Language
  selectedYear?: EconomicYear
  onYearChange?: (year: EconomicYear) => void
}

export const CompareView: React.FC<CompareViewProps> = ({
  baseCurrency,
  exchangeRates,
  interestRates,
  lang,
  selectedYear = DEFAULT_ECONOMIC_YEAR,
  onYearChange,
}) => {
  const t = translations[lang]
  const [countryAId, setCountryAId] = useState<string>('USA')
  const [countryBId, setCountryBId] = useState<string>('CHN')

  const [detailA, setDetailA] = useState<CountryGdpDetail | null>(null)
  const [detailB, setDetailB] = useState<CountryGdpDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const countryA = COUNTRIES.find((c) => c.id === countryAId) || COUNTRIES[0]
  const countryB = COUNTRIES.find((c) => c.id === countryBId) || COUNTRIES[1]

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      fetchCountryGdpDetail(countryA.id, selectedYear),
      fetchCountryGdpDetail(countryB.id, selectedYear),
    ])
      .then(([resA, resB]) => {
        if (active) {
          setDetailA(resA)
          setDetailB(resB)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load comparison details:', err)
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [countryA.id, countryB.id, selectedYear])

  const handleSwap = () => {
    const temp = countryAId
    setCountryAId(countryBId)
    setCountryBId(temp)
  }

  const setPreset = (a: string, b: string) => {
    setCountryAId(a)
    setCountryBId(b)
  }

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1
  const rateA = exchangeRates ? getConversionRate(exchangeRates, countryA.currencyCode, baseCurrency) : 0
  const rateB = exchangeRates ? getConversionRate(exchangeRates, countryB.currencyCode, baseCurrency) : 0

  const interestA = getCountryInterestRate(interestRates, countryA)
  const interestB = getCountryInterestRate(interestRates, countryB)
  const interestSpread = interestA && interestB ? interestA.ratePct - interestB.ratePct : null

  const gdpRatio = detailA && detailB && detailB.totalGdpUsd > 0 ? detailA.totalGdpUsd / detailB.totalGdpUsd : 1
  const perCapitaRatio = detailA && detailB && detailB.gdpPerCapitaUsd > 0 ? detailA.gdpPerCapitaUsd / detailB.gdpPerCapitaUsd : 1

  const nameA = getCountryName(countryA, lang)
  const nameB = getCountryName(countryB, lang)

  const insightFormatted = t.compareInsightText
    .replace('{countryA}', nameA)
    .replace('{countryB}', nameB)
    .replace('{gdpRatio}', gdpRatio.toFixed(2))
    .replace('{perCapitaRatio}', perCapitaRatio.toFixed(2))

  return (
    <div className="space-y-6">
      {/* Top Header & Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-indigo-400" />
              {t.compareTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.compareDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            {/* Preset Buttons with Vector Flags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 mr-1 font-medium">{t.compareRecommended}</span>
            <button
              onClick={() => setPreset('USA', 'CHN')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <CountryFlag iso2="US" className="w-4 h-3" /> USA vs <CountryFlag iso2="CN" className="w-4 h-3" /> CHN
            </button>
            <button
              onClick={() => setPreset('KOR', 'JPN')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <CountryFlag iso2="KR" className="w-4 h-3" /> KOR vs <CountryFlag iso2="JP" className="w-4 h-3" /> JPN
            </button>
            <button
              onClick={() => setPreset('DEU', 'GBR')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <CountryFlag iso2="DE" className="w-4 h-3" /> DEU vs <CountryFlag iso2="GB" className="w-4 h-3" /> GBR
            </button>
            <button
              onClick={() => setPreset('KOR', 'TWN')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <CountryFlag iso2="KR" className="w-4 h-3" /> KOR vs <CountryFlag iso2="TW" className="w-4 h-3" /> TWN
            </button>
          </div>
        </div>
      </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* Country A Picker */}
          <div className="bg-slate-950/80 border border-indigo-500/40 rounded-xl p-3 min-w-0 overflow-hidden">
            <label htmlFor="countryASelect" className="text-xs font-semibold text-indigo-400 block mb-1 truncate">
              {t.compareBaseCountry}
            </label>
            <select
              id="countryASelect"
              value={countryAId}
              onChange={(e) => setCountryAId(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-white focus:outline-none cursor-pointer truncate"
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.flagEmoji} {getCountryName(c, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="mx-auto p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all transform hover:rotate-180 duration-200"
            title={t.swapCurrencies}
          >
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
          </button>

          {/* Country B Picker */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 min-w-0 overflow-hidden">
            <label htmlFor="countryBSelect" className="text-xs font-semibold text-emerald-400 block mb-1 truncate">
              {t.compareTargetCountry}
            </label>
            <select
              id="countryBSelect"
              value={countryBId}
              onChange={(e) => setCountryBId(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-white focus:outline-none cursor-pointer truncate"
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.flagEmoji} {getCountryName(c, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Country A Card */}
        <div className="bg-slate-900/80 border-2 border-indigo-500/30 rounded-2xl p-5 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center gap-3 mb-4">
            <CountryFlag iso2={countryA.iso2} className="w-12 h-8" alt={nameA} />
            <div>
              <h3 className="text-xl font-bold text-white">{nameA}</h3>
              <p className="text-xs text-slate-400">
                {getCountrySecondaryName(countryA, lang)} • {countryA.currencyCode}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardTotalGdp} ({detailA?.latestYear ?? selectedYear})</span>
              <div className="text-right">
                <span className="text-base font-bold text-indigo-400 block">
                  {detailA ? formatGdpCompact(detailA.totalGdpUsd, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {detailA ? `$${(detailA.totalGdpUsd / 1e12).toFixed(2)}T USD` : ''}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardPerCapita}</span>
              <div className="text-right">
                <span className="text-base font-bold text-white block">
                  {detailA ? formatPerCapita(detailA.gdpPerCapitaUsd, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {detailA ? `$${Math.round(detailA.gdpPerCapitaUsd).toLocaleString()} USD` : ''}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardFxRate}</span>
              <span className="text-sm font-mono font-bold text-slate-200">
                1 {countryA.currencyCode} = {formatExchangeRate(rateA, countryA.currencyCode === 'KRW' ? 4 : 2)} {baseCurrency}
              </span>
            </div>

            {interestA && (
              <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400">{t.compareInterestRate}</span>
                <span className="text-sm font-mono font-bold text-indigo-300">
                  {interestA.ratePct.toFixed(2)}%
                  <span className="ml-1 text-[11px] text-slate-400 font-normal">({interestA.centralBankName})</span>
                </span>
              </div>
            )}

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardGrowthRate}</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {detailA?.growthRatePct !== null && detailA?.growthRatePct !== undefined
                  ? `${detailA.growthRatePct > 0 ? '+' : ''}${detailA.growthRatePct.toFixed(2)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.compareInflationRate}</span>
              <span
                className={`text-sm font-mono font-bold ${
                  detailA?.inflationRatePct === null || detailA?.inflationRatePct === undefined
                    ? 'text-slate-400'
                    : detailA.inflationRatePct < 0
                      ? 'text-purple-400'
                      : detailA.inflationRatePct <= 2.5
                        ? 'text-emerald-400'
                        : detailA.inflationRatePct <= 4.0
                          ? 'text-cyan-400'
                          : detailA.inflationRatePct <= 7.0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                }`}
              >
                {detailA?.inflationRatePct !== null && detailA?.inflationRatePct !== undefined
                  ? `${detailA.inflationRatePct.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.compareDebtRatio}</span>
              <span
                className={`text-sm font-mono font-bold ${
                  detailA?.debtRatioPct === null || detailA?.debtRatioPct === undefined
                    ? 'text-slate-400'
                    : detailA.debtRatioPct < 60
                      ? 'text-emerald-400'
                      : detailA.debtRatioPct <= 100
                        ? 'text-amber-400'
                        : 'text-rose-400'
                }`}
              >
                {detailA?.debtRatioPct !== null && detailA?.debtRatioPct !== undefined
                  ? `${detailA.debtRatioPct.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Country B Card */}
        <div className="bg-slate-900/80 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <CountryFlag iso2={countryB.iso2} className="w-12 h-8" alt={nameB} />
            <div>
              <h3 className="text-xl font-bold text-white">{nameB}</h3>
              <p className="text-xs text-slate-400">
                {getCountrySecondaryName(countryB, lang)} • {countryB.currencyCode}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardTotalGdp} ({detailB?.latestYear ?? selectedYear})</span>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-400 block">
                  {detailB ? formatGdpCompact(detailB.totalGdpUsd, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {detailB ? `$${(detailB.totalGdpUsd / 1e12).toFixed(2)}T USD` : ''}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardPerCapita}</span>
              <div className="text-right">
                <span className="text-base font-bold text-white block">
                  {detailB ? formatPerCapita(detailB.gdpPerCapitaUsd, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {detailB ? `$${Math.round(detailB.gdpPerCapitaUsd).toLocaleString()} USD` : ''}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardFxRate}</span>
              <span className="text-sm font-mono font-bold text-slate-200">
                1 {countryB.currencyCode} = {formatExchangeRate(rateB, countryB.currencyCode === 'KRW' ? 4 : 2)} {baseCurrency}
              </span>
            </div>

            {interestB && (
              <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400">{t.compareInterestRate}</span>
                <span className="text-sm font-mono font-bold text-indigo-300">
                  {interestB.ratePct.toFixed(2)}%
                  <span className="ml-1 text-[11px] text-slate-400 font-normal">({interestB.centralBankName})</span>
                </span>
              </div>
            )}

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.cardGrowthRate}</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {detailB?.growthRatePct !== null && detailB?.growthRatePct !== undefined
                  ? `${detailB.growthRatePct > 0 ? '+' : ''}${detailB.growthRatePct.toFixed(2)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.compareInflationRate}</span>
              <span
                className={`text-sm font-mono font-bold ${
                  detailB?.inflationRatePct === null || detailB?.inflationRatePct === undefined
                    ? 'text-slate-400'
                    : detailB.inflationRatePct < 0
                      ? 'text-purple-400'
                      : detailB.inflationRatePct <= 2.5
                        ? 'text-emerald-400'
                        : detailB.inflationRatePct <= 4.0
                          ? 'text-cyan-400'
                          : detailB.inflationRatePct <= 7.0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                }`}
              >
                {detailB?.inflationRatePct !== null && detailB?.inflationRatePct !== undefined
                  ? `${detailB.inflationRatePct.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.compareDebtRatio}</span>
              <span
                className={`text-sm font-mono font-bold ${
                  detailB?.debtRatioPct === null || detailB?.debtRatioPct === undefined
                    ? 'text-slate-400'
                    : detailB.debtRatioPct < 60
                      ? 'text-emerald-400'
                      : detailB.debtRatioPct <= 100
                        ? 'text-amber-400'
                        : 'text-rose-400'
                }`}
              >
                {detailB?.debtRatioPct !== null && detailB?.debtRatioPct !== undefined
                  ? `${detailB.debtRatioPct.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Insights Banner */}
      {detailA && detailB && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div>
            <strong>{t.compareInsightTitle}</strong> {insightFormatted}
            {interestSpread !== null && (
              <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 inline-block mt-1 sm:mt-0">
                {t.compareSpread}: {interestSpread > 0 ? `+${interestSpread.toFixed(2)}` : interestSpread.toFixed(2)}%p
              </span>
            )}
          </div>
        </div>
      )}

      {/* Combined 10-Year GDP Trend Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        {(() => {
          const endYear = selectedYear ? parseInt(selectedYear, 10) : (detailA?.latestYear || 2024)
          const startYear = endYear - 9
          const chartPointsA = (detailA?.historical || []).filter(
            (p) => p.year >= startYear && p.year <= endYear
          )
          const chartPointsB = (detailB?.historical || []).filter(
            (p) => p.year >= startYear && p.year <= endYear
          )

          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>
                    {t.compareChartTitle} ({startYear} ~ {endYear})
                  </span>
                  <span className="text-xs font-normal text-slate-400">
                    ({nameA} <span className="text-indigo-400">■</span> vs {nameB}{' '}
                    <span className="text-emerald-400">■</span>)
                  </span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">{baseCurrency}</span>
              </div>

              {loading ? (
                <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
                  {t.compareChartLoading}
                </div>
              ) : (
                <GdpChart
                  countryName={nameA}
                  dataPoints={chartPointsA}
                  baseCurrency={baseCurrency}
                  exchangeRateToBase={usdToBase}
                  comparisonPoints={chartPointsB}
                  comparisonCountryName={nameB}
                  lang={lang}
                />
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}

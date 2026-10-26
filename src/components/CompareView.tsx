import React, { useState, useEffect } from 'react'
import { GitCompare, ArrowRightLeft, TrendingUp, Building2 } from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import type { CountryGdpDetail, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from '../types/economics'
import { ECONOMIC_YEAR_OPTIONS, DEFAULT_ECONOMIC_YEAR } from '../utils/economicYears'
import { fetchCountryGdpDetail } from '../services/worldBankApi'
import { getConversionRate } from '../services/exchangeApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { formatGdpCompact, formatPerCapita, formatExchangeRate, getPerCapitaColorClass, getInflationColorClass } from '../utils/formatters'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { GdpChart } from './GdpChart'
import { getCountryName } from '../utils/countryNames'
import { getBigMacData, getBigMacColor, formatBigMacPrice } from '../data/bigMac'
import { Spinner } from './Spinner'
import { CompanyLogo } from './CompanyLogo'
import { TopCompaniesStackedBar, getRankBadgeStyle } from './TopCompaniesStackedBar'
import { fetchCountryTopCompanies, type TopCompanyItem } from '../services/topCompaniesApi'
import { getStockMarketCapUsd, formatStockMarketCap } from '../data/stockMarketCaps'

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
  const [topCompaniesA, setTopCompaniesA] = useState<TopCompanyItem[]>([])
  const [topCompaniesB, setTopCompaniesB] = useState<TopCompanyItem[]>([])
  const [topCompaniesLoading, setTopCompaniesLoading] = useState<boolean>(true)

  const countryA = COUNTRIES.find((c) => c.id === countryAId) || COUNTRIES[0]
  const countryB = COUNTRIES.find((c) => c.id === countryBId) || COUNTRIES[1]

  useEffect(() => {
    let active = true
    setTopCompaniesLoading(true)
    Promise.all([
      fetchCountryTopCompanies(countryA.id, lang, exchangeRates),
      fetchCountryTopCompanies(countryB.id, lang, exchangeRates),
    ])
      .then(([resA, resB]) => {
        if (active) {
          setTopCompaniesA(resA.companies)
          setTopCompaniesB(resB.companies)
          setTopCompaniesLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setTopCompaniesA([])
          setTopCompaniesB([])
          setTopCompaniesLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [countryA.id, countryB.id, lang, exchangeRates])

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-indigo-400" />
            {t.compareTitle}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {onYearChange && (
              <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
                  {t.yearLabel}
                </span>
                {ECONOMIC_YEAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.year}
                    onClick={() => onYearChange(opt.year)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedYear === opt.year
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Country A Picker */}
          <div className="flex-1 min-w-0 bg-slate-950/80 border border-indigo-500/40 rounded-xl p-2 sm:p-3 overflow-hidden">
            <label htmlFor="countryASelect" className="text-[10px] sm:text-xs font-semibold text-indigo-400 block mb-0.5 sm:mb-1 truncate">
              {t.compareBaseCountry}
            </label>
            <select
              id="countryASelect"
              value={countryAId}
              onChange={(e) => setCountryAId(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base md:text-lg font-bold text-white focus:outline-none cursor-pointer truncate"
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
            className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all transform hover:rotate-180 duration-200 shrink-0"
            title={t.swapCurrencies}
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </button>

          {/* Country B Picker */}
          <div className="flex-1 min-w-0 bg-slate-950/80 border border-emerald-500/40 rounded-xl p-2 sm:p-3 overflow-hidden">
            <label htmlFor="countryBSelect" className="text-[10px] sm:text-xs font-semibold text-emerald-400 block mb-0.5 sm:mb-1 truncate">
              {t.compareTargetCountry}
            </label>
            <select
              id="countryBSelect"
              value={countryBId}
              onChange={(e) => setCountryBId(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base md:text-lg font-bold text-white focus:outline-none cursor-pointer truncate"
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

      {/* 1:1 Head-to-Head Symmetric Matrix View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl divide-y divide-slate-800/80">
        {/* Header Country VS Banner */}
        <div className="sticky top-16 sm:top-20 z-30 bg-gradient-to-r from-indigo-950/95 via-slate-900/95 to-emerald-950/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 shadow-md p-3 sm:p-4 md:p-5 flex items-center justify-between gap-2 sm:gap-3 transition-shadow">
          {/* Country A */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <CountryFlag iso2={countryA.iso2} className="w-8 h-6 sm:w-10 sm:h-7 shrink-0 rounded-sm shadow" alt={nameA} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-lg font-bold text-white truncate">{nameA}</span>
                <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {countryA.currencyCode}
                </span>
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <button
            type="button"
            onClick={handleSwap}
            title={t.swapCurrencies}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-indigo-400 text-[11px] sm:text-xs font-black tracking-wider text-slate-300 hover:text-white shrink-0 shadow-inner cursor-pointer transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1 group"
          >
            <span>VS</span>
            <ArrowRightLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-indigo-300 transition-colors" />
          </button>

          {/* Country B */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0 text-right">
            <div className="min-w-0">
              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {countryB.currencyCode}
                </span>
                <span className="text-sm sm:text-lg font-bold text-white truncate">{nameB}</span>
              </div>
            </div>
            <CountryFlag iso2={countryB.iso2} className="w-8 h-6 sm:w-10 sm:h-7 shrink-0 rounded-sm shadow" alt={nameB} />
          </div>
        </div>

        {/* Metric 1: Total GDP with Dual Ratio Visualizer Bar */}
        {(() => {
          const gdpA = detailA?.totalGdpUsd || 0
          const gdpB = detailB?.totalGdpUsd || 0
          const sum = gdpA + gdpB
          const pctA = sum > 0 ? (gdpA / sum) * 100 : 50
          const pctB = 100 - pctA
          const ratioText = gdpRatio >= 1
            ? `${nameA} ${gdpRatio.toFixed(2)}x`
            : `${nameB} ${(1 / gdpRatio).toFixed(2)}x`

          return (
            <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors last:rounded-b-2xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">
                  {t.cardTotalGdp} ({detailA?.latestYear ?? selectedYear})
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {ratioText}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base sm:text-lg font-bold font-mono text-indigo-400">
                  {detailA ? formatGdpCompact(gdpA, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 text-right">
                  {detailB ? formatGdpCompact(gdpB, baseCurrency, usdToBase, lang) : '...'}
                </span>
              </div>

              {sum > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden shadow-inner">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
                    <span>{pctA.toFixed(1)}%</span>
                    <span>{pctB.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Metric 2: GDP per Capita with Dual Ratio Visualizer Bar */}
        {(() => {
          const capA = detailA?.gdpPerCapitaUsd || 0
          const capB = detailB?.gdpPerCapitaUsd || 0
          const sum = capA + capB
          const pctA = sum > 0 ? (capA / sum) * 100 : 50
          const pctB = 100 - pctA
          const ratioText = perCapitaRatio >= 1
            ? `${nameA} ${perCapitaRatio.toFixed(2)}x`
            : `${nameB} ${(1 / perCapitaRatio).toFixed(2)}x`

          return (
            <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors last:rounded-b-2xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">{t.cardPerCapita}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {ratioText}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-base sm:text-lg font-bold font-mono ${getPerCapitaColorClass(capA)}`}>
                  {detailA ? formatPerCapita(capA, baseCurrency, usdToBase, lang) : '...'}
                </span>
                <span className={`text-base sm:text-lg font-bold font-mono text-right ${getPerCapitaColorClass(capB)}`}>
                  {detailB ? formatPerCapita(capB, baseCurrency, usdToBase, lang) : '...'}
                </span>
              </div>

              {sum > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden shadow-inner">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
                    <span>{pctA.toFixed(1)}%</span>
                    <span>{pctB.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Metric 3: Policy Interest Rate */}
        <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">{t.compareInterestRate}</span>
            {interestSpread !== null && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                {interestSpread > 0 ? nameA : nameB} +{Math.abs(interestSpread).toFixed(2)}%p
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                {interestA ? `${interestA.ratePct.toFixed(2)}%` : 'N/A'}
              </span>
              {interestA && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate max-w-[120px]">
                  ({interestA.centralBankName})
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-end gap-1.5 text-right">
              {interestB && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate max-w-[120px]">
                  ({interestB.centralBankName})
                </span>
              )}
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-300">
                {interestB ? `${interestB.ratePct.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Real GDP Growth Rate */}
        <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">{t.cardGrowthRate}</span>
            {detailA?.growthRatePct != null && detailB?.growthRatePct != null && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {detailA.growthRatePct > detailB.growthRatePct ? nameA : nameB} +{Math.abs(detailA.growthRatePct - detailB.growthRatePct).toFixed(2)}%p
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`text-base sm:text-lg font-bold font-mono ${
                detailA?.growthRatePct == null
                  ? 'text-slate-400'
                  : detailA.growthRatePct >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {detailA?.growthRatePct != null ? `${detailA.growthRatePct > 0 ? '+' : ''}${detailA.growthRatePct.toFixed(2)}%` : 'N/A'}
            </span>
            <span
              className={`text-base sm:text-lg font-bold font-mono text-right ${
                detailB?.growthRatePct == null
                  ? 'text-slate-400'
                  : detailB.growthRatePct >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {detailB?.growthRatePct != null ? `${detailB.growthRatePct > 0 ? '+' : ''}${detailB.growthRatePct.toFixed(2)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Metric 5: Inflation Rate (CPI) */}
        <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">{t.compareInflationRate}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className={`text-base sm:text-lg font-bold font-mono ${getInflationColorClass(detailA?.inflationRatePct)}`}>
              {detailA?.inflationRatePct != null ? `${detailA.inflationRatePct.toFixed(1)}%` : 'N/A'}
            </span>
            <span className={`text-base sm:text-lg font-bold font-mono text-right ${getInflationColorClass(detailB?.inflationRatePct)}`}>
              {detailB?.inflationRatePct != null ? `${detailB.inflationRatePct.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Metric 6: Government Debt Ratio (% GDP) */}
        <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">{t.compareDebtRatio}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`text-base sm:text-lg font-bold font-mono ${
                detailA?.debtRatioPct == null
                  ? 'text-slate-400'
                  : detailA.debtRatioPct < 60
                  ? 'text-emerald-400'
                  : detailA.debtRatioPct < 90
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {detailA?.debtRatioPct != null ? `${detailA.debtRatioPct.toFixed(1)}%` : 'N/A'}
            </span>
            <span
              className={`text-base sm:text-lg font-bold font-mono text-right ${
                detailB?.debtRatioPct == null
                  ? 'text-slate-400'
                  : detailB.debtRatioPct < 60
                  ? 'text-emerald-400'
                  : detailB.debtRatioPct < 90
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {detailB?.debtRatioPct != null ? `${detailB.debtRatioPct.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Metric 7: Exchange Rate to Base Currency */}
        <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors last:rounded-b-2xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">{t.cardFxRate}</span>
            <span className="text-[10px] font-mono text-slate-400">vs {baseCurrency}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm font-mono font-bold">
            <span className="text-indigo-300">
              1 {countryA.currencyCode} = {formatExchangeRate(rateA, countryA.currencyCode === 'KRW' ? 4 : 2)}
            </span>
            <span className="text-emerald-300 text-right">
              1 {countryB.currencyCode} = {formatExchangeRate(rateB, countryB.currencyCode === 'KRW' ? 4 : 2)}
            </span>
          </div>
        </div>

        {/* Metric 8: Big Mac Index */}
        {(() => {
          const bmA = getBigMacData(countryA.id)
          const bmB = getBigMacData(countryB.id)
          if (!bmA && !bmB) return null

          return (
            <div className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors last:rounded-b-2xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">🍔 {t.metricBigMac}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 font-mono">
                <div className="flex items-baseline gap-1.5">
                  {bmA ? (
                    <>
                      <span className="text-sm sm:text-base font-bold text-slate-200">
                        {formatBigMacPrice(bmA.dollarPrice, baseCurrency, usdToBase, lang)}
                      </span>
                      <span className="text-xs font-bold" style={{ color: getBigMacColor(bmA.valuationRawPct) }}>
                        {bmA.valuationRawPct > 0 ? `+${bmA.valuationRawPct.toFixed(1)}%` : `${bmA.valuationRawPct.toFixed(1)}%`}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">N/A</span>
                  )}
                </div>

                <div className="flex items-baseline justify-end gap-1.5 text-right">
                  {bmB ? (
                    <>
                      <span className="text-xs font-bold" style={{ color: getBigMacColor(bmB.valuationRawPct) }}>
                        {bmB.valuationRawPct > 0 ? `+${bmB.valuationRawPct.toFixed(1)}%` : `${bmB.valuationRawPct.toFixed(1)}%`}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-200">
                        {formatBigMacPrice(bmB.dollarPrice, baseCurrency, usdToBase, lang)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">N/A</span>
                  )}
                </div>
              </div>
            </div>
          )
        })()}
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

      {/* Side-by-Side Top 5 Market Cap Companies Comparison */}
      {(topCompaniesLoading || topCompaniesA.length > 0 || topCompaniesB.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{t.compareTop5Title}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{baseCurrency}</span>
          </div>

          {topCompaniesLoading ? (
            <div className="py-8 flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/60">
              <Spinner size="sm" label={t.top5Loading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Country A Top 5 */}
              <div className="bg-slate-950/60 border border-indigo-500/30 rounded-xl p-3.5 space-y-2.5">
                {(() => {
                  const sumA = topCompaniesA.reduce((acc, c) => acc + c.marketCapUsd, 0)
                  const rawCapA = getStockMarketCapUsd(countryA.id, detailA?.totalGdpUsd)
                  const effectiveCapA = Math.max(rawCapA, sumA * 1.12)
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CountryFlag iso2={countryA.iso2} className="w-6 h-4 rounded-sm shrink-0" alt={nameA} />
                          <span className="text-sm font-bold text-white truncate">{nameA}</span>
                        </div>
                        {topCompaniesA.length > 0 && (
                          <span className="text-xs font-mono font-bold text-indigo-300">
                            {formatStockMarketCap(sumA, baseCurrency, usdToBase, lang)}
                          </span>
                        )}
                      </div>

                      {topCompaniesA.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">{t.top5Empty}</div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            {topCompaniesA.map((item) => (
                              <div
                                key={item.symbol}
                                className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-4.5 h-4.5 rounded border text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${getRankBadgeStyle(item.rank)}`}>
                                    {item.rank}
                                  </span>
                                  <CompanyLogo logoUrl={item.logoUrl} name={item.name} ticker={item.ticker} size="sm" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[190px]">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 truncate">
                                      {item.ticker}{item.sector ? ` · ${item.sector}` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 font-mono text-right">
                                  <span className="text-xs font-black text-indigo-300">
                                    {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[48px] text-center ${
                                      item.changePct >= 0
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                  >
                                    {item.changePct >= 0 ? `+${item.changePct.toFixed(1)}%` : `${item.changePct.toFixed(1)}%`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <TopCompaniesStackedBar
                            companies={topCompaniesA}
                            effectiveNationalCapUsd={effectiveCapA}
                            othersLabel={t.top5OthersLabel}
                            concentrationLabel={t.top5ConcentrationLabel}
                          />
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Country B Top 5 */}
              <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
                {(() => {
                  const sumB = topCompaniesB.reduce((acc, c) => acc + c.marketCapUsd, 0)
                  const rawCapB = getStockMarketCapUsd(countryB.id, detailB?.totalGdpUsd)
                  const effectiveCapB = Math.max(rawCapB, sumB * 1.12)
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CountryFlag iso2={countryB.iso2} className="w-6 h-4 rounded-sm shrink-0" alt={nameB} />
                          <span className="text-sm font-bold text-white truncate">{nameB}</span>
                        </div>
                        {topCompaniesB.length > 0 && (
                          <span className="text-xs font-mono font-bold text-emerald-300">
                            {formatStockMarketCap(sumB, baseCurrency, usdToBase, lang)}
                          </span>
                        )}
                      </div>

                      {topCompaniesB.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">{t.top5Empty}</div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            {topCompaniesB.map((item) => (
                              <div
                                key={item.symbol}
                                className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-4.5 h-4.5 rounded border text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${getRankBadgeStyle(item.rank)}`}>
                                    {item.rank}
                                  </span>
                                  <CompanyLogo logoUrl={item.logoUrl} name={item.name} ticker={item.ticker} size="sm" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[190px]">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 truncate">
                                      {item.ticker}{item.sector ? ` · ${item.sector}` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 font-mono text-right">
                                  <span className="text-xs font-black text-emerald-300">
                                    {formatStockMarketCap(item.marketCapUsd, baseCurrency, usdToBase, lang)}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[48px] text-center ${
                                      item.changePct >= 0
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                  >
                                    {item.changePct >= 0 ? `+${item.changePct.toFixed(1)}%` : `${item.changePct.toFixed(1)}%`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <TopCompaniesStackedBar
                            companies={topCompaniesB}
                            effectiveNationalCapUsd={effectiveCapB}
                            othersLabel={t.top5OthersLabel}
                            concentrationLabel={t.top5ConcentrationLabel}
                          />
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}
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
                <h3 className="text-lg font-bold text-white">
                  {t.compareChartTitle} ({startYear} ~ {endYear})
                </h3>
                <span className="text-xs text-slate-500 font-mono">{baseCurrency}</span>
              </div>

              {loading ? (
                <div className="h-80 flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <Spinner size="md" label={t.compareChartLoading} />
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

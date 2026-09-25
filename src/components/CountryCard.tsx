import React from 'react'
import { TrendingUp, TrendingDown, ArrowRight, LineChart, AlertCircle } from 'lucide-react'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from '../types/economics'
import { formatGdpCompact, formatPerCapita, formatExchangeRate } from '../utils/formatters'
import { getConversionRate } from '../services/exchangeApi'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { StockSparkline } from './StockSparkline'
import { getStockPriceData } from '../data/stockPrices'
import { getCountryName, getCountrySecondaryName } from '../utils/countryNames'

interface CountryCardProps {
  country: CountryMeta
  rank: number
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  debtRatioPct: number | null
  inflationRatePct?: number | null
  interestRateInfo?: InterestRateInfo | null
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
  selectedYear?: EconomicYear
  onSelect: (c: CountryMeta) => void
}

export const CountryCard: React.FC<CountryCardProps> = ({
  country,
  rank,
  totalGdpUsd,
  gdpPerCapitaUsd,
  growthRatePct,
  debtRatioPct,
  inflationRatePct,
  interestRateInfo,
  baseCurrency,
  exchangeRates,
  lang,
  onSelect,
}) => {
  const t = translations[lang]

  let fxRate = 0
  let isRateLoaded = false
  if (exchangeRates) {
    fxRate = getConversionRate(exchangeRates, country.currencyCode, baseCurrency)
    isRateLoaded = true
  }

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1

  const displayName = getCountryName(country, lang)
  const secondaryName = getCountrySecondaryName(country, lang)
  const stockData = getStockPriceData(country.id)

  return (
    <div
      onClick={() => onSelect(country)}
      className="group relative bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
    >
      {/* Card Header: Flag, Name, Rank */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <CountryFlag iso2={country.iso2} className="w-10 h-7" alt={displayName} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors">
                  {displayName}
                </h3>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {country.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">{secondaryName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {inflationRatePct !== undefined && inflationRatePct !== null && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  inflationRatePct < 0
                    ? 'text-purple-300 bg-purple-950/60 border-purple-500/30'
                    : inflationRatePct <= 2.5
                    ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                    : inflationRatePct <= 4.0
                    ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
                    : inflationRatePct <= 7.0
                    ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                    : 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                }`}
                title={`${t.modalInflationTitle}: ${inflationRatePct.toFixed(1)}%`}
              >
                {inflationRatePct > 7.0 && (
                  <AlertCircle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                )}
                {t.cardInflationRate} {inflationRatePct.toFixed(1)}%
              </span>
            )}
            {debtRatioPct !== null && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  debtRatioPct < 60
                    ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                    : debtRatioPct <= 100
                    ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                    : 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                }`}
                title={`${t.modalDebtTitle}: ${debtRatioPct.toFixed(1)}%`}
              >
                {debtRatioPct > 100 && (
                  <AlertCircle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                )}
                {t.cardDebtRatio} {debtRatioPct.toFixed(1)}%
              </span>
            )}
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
              #{rank}
            </span>
          </div>
        </div>

        {/* GDP & Stock Index Metrics */}
        <div className="py-3 border-y border-slate-800/80 my-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">{t.cardTotalGdp}</span>
              <span className="text-base sm:text-lg font-bold text-slate-100 tracking-tight block">
                {formatGdpCompact(totalGdpUsd, baseCurrency, usdToBase, lang)}
              </span>
              {baseCurrency !== 'USD' && (
                <span className="text-[10px] text-slate-500 font-mono block">
                  ${(totalGdpUsd / 1e12).toFixed(2)}T USD
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">{t.cardPerCapita}</span>
              <span className="text-base sm:text-lg font-bold text-slate-200 tracking-tight block">
                {formatPerCapita(gdpPerCapitaUsd, baseCurrency, usdToBase, lang)}
              </span>
              {baseCurrency !== 'USD' && (
                <span className="text-[10px] text-slate-400 font-mono block">
                  ${Math.round(gdpPerCapitaUsd).toLocaleString()} USD
                </span>
              )}
            </div>
          </div>

          {/* Stock Index Benchmark Row with Mini Sparkline */}
          {stockData && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <LineChart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">
                    {lang === 'ko' ? stockData.nameKo : stockData.nameEn}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {stockData.isSupported ? (
                    <span className="text-[11px] font-mono font-semibold text-slate-200">
                      {stockData.currentPrice.toLocaleString()} {stockData.currency}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {lang === 'ko'
                        ? '제재/조회제한'
                        : lang === 'ja'
                        ? '制限地域'
                        : lang === 'es'
                        ? 'Restringido'
                        : lang === 'zh'
                        ? '限制区域'
                        : 'Restricted'}
                    </span>
                  )}
                </div>
              </div>

              {stockData.isSupported && stockData.points.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <StockSparkline
                    points={stockData.points}
                    isPositive={stockData.changePct >= 0}
                    width={58}
                    height={22}
                  />
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      stockData.changePct >= 0
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    }`}
                  >
                    {stockData.changePct >= 0 ? '+' : ''}{stockData.changePct}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Exchange Rate, Interest Rate & Growth Rate */}
      <div>
        <div className="flex items-center justify-between text-xs py-1 gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block">{t.cardFxRate}</span>
            {isRateLoaded ? (
              <span className="font-mono font-semibold text-slate-200">
                1 {country.currencyCode} = {formatExchangeRate(fxRate, country.currencyCode === 'KRW' ? 4 : 2)} {baseCurrency}
              </span>
            ) : (
              <span className="text-slate-400 animate-pulse">{t.loadingData}</span>
            )}
          </div>

          {interestRateInfo && (
            <div className="text-center px-1">
              <span className="text-[11px] text-slate-400 block">{t.cardInterestRate}</span>
              <span className="font-mono font-bold text-indigo-300">
                {interestRateInfo.ratePct.toFixed(2)}%
                <span className="ml-1 text-[10px] text-slate-400 font-normal">({interestRateInfo.centralBankName})</span>
              </span>
            </div>
          )}

          {growthRatePct !== null && (
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">{t.cardGrowthRate}</span>
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-bold ${
                  growthRatePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {growthRatePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {`${growthRatePct.toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>

        {/* View Details Action Link */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
          <span>{t.cardViewDetails}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

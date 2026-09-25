import React, { useState, useEffect } from 'react'
import { ArrowLeftRight, Coins } from 'lucide-react'
import type { ExchangeRates, BaseCurrency, CountryMeta, Language } from '../types/economics'
import { getConversionRate } from '../services/exchangeApi'
import { formatExchangeRate } from '../utils/formatters'
import { translations } from '../i18n/translations'

interface CurrencyConverterProps {
  country: CountryMeta
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  lang: Language
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  country,
  baseCurrency,
  exchangeRates,
  lang,
}) => {
  const t = translations[lang]
  const [amount, setAmount] = useState<number>(1000)
  const [fromCurrency, setFromCurrency] = useState<string>(country.currencyCode)
  const [toCurrency, setToCurrency] = useState<string>(baseCurrency)

  useEffect(() => {
    setFromCurrency(country.currencyCode)
    setToCurrency(baseCurrency)
    if (country.currencyCode === 'KRW') {
      setAmount(100000)
    } else if (country.currencyCode === 'JPY') {
      setAmount(10000)
    } else {
      setAmount(100)
    }
  }, [country, baseCurrency])

  if (!exchangeRates) return null

  const conversionRate = getConversionRate(exchangeRates, fromCurrency, toCurrency)
  const convertedAmount = amount * conversionRate

  // Official rate info for the banner row
  const countryToBase = getConversionRate(exchangeRates, country.currencyCode, baseCurrency)
  const baseToCountry = getConversionRate(exchangeRates, baseCurrency, country.currencyCode)

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header: Title + Real-time badge + Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Coins className="w-4 h-4 text-indigo-400" />
          <span>{t.converterTitle}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
            {t.modalOnDemandBadge}
          </span>
        </div>
        <div className="text-xs text-slate-400 sm:text-right">
          <span className="font-mono text-slate-300">
            {exchangeRates?.timeLastUpdateUtc || 'Live Feed'}
          </span>
        </div>
      </div>

      {/* Official Rate Info Row */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-slate-950/40 rounded-lg px-3 py-2 border border-slate-800/60">
        {country.currencyCode === baseCurrency ? (
          <span className="text-base sm:text-lg font-mono font-bold text-white">
            1 {country.currencyCode} = 1.00 {baseCurrency}
            <span className="text-xs text-slate-400 font-normal ml-2">
              ({lang === 'ko' ? '동일 기준 통화' : lang === 'ja' ? '同一基準通貨' : lang === 'es' ? 'Misma moneda base' : lang === 'zh' ? '相同基准货币' : 'Same Base Currency'})
            </span>
          </span>
        ) : (
          <>
            <span className="text-base sm:text-lg font-mono font-bold text-white">
              1 {country.currencyCode} = {formatExchangeRate(countryToBase, 4)} {baseCurrency}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (1 {baseCurrency} = {formatExchangeRate(baseToCountry, 2)} {country.currencyCode})
            </span>
          </>
        )}
      </div>

      {/* Converter Input/Output */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Input Box */}
        <div className="flex-1 min-w-0 bg-slate-950/80 border border-slate-700/60 rounded-xl p-2.5 sm:p-3 focus-within:border-indigo-500 transition-colors">
          <div className="text-[11px] font-semibold text-slate-400 mb-0.5 flex justify-between items-center">
            <span className="truncate">{t.converterSending}</span>
            <span className="text-slate-300 font-bold font-mono shrink-0 ml-1">{fromCurrency}</span>
          </div>
          <input
            type="number"
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-transparent text-base sm:text-lg font-mono font-bold text-white focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="shrink-0 p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all transform hover:rotate-180 duration-200"
          title={t.swapCurrencies}
          aria-label={t.swapCurrencies}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Output Box */}
        <div className="flex-1 min-w-0 bg-slate-950/80 border border-slate-700/60 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] font-semibold text-slate-400 mb-0.5 flex justify-between items-center">
            <span className="truncate">{t.converterConverted}</span>
            <span className="text-indigo-400 font-bold font-mono shrink-0 ml-1">{toCurrency}</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 truncate">
            {formatExchangeRate(convertedAmount, 2)}
          </div>
        </div>
      </div>
    </div>
  )
}


import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { COUNTRIES } from './data/countries'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from './types/economics'
import { DEFAULT_ECONOMIC_YEAR } from './utils/economicYears'
import { fetchExchangeRates } from './services/exchangeApi'
import { fetchInterestRates, getCountryInterestRate } from './services/interestRateApi'
import { loadGlobalGdpOverview } from './services/worldBankApi'
import { translations } from './i18n/translations'
import { Navbar } from './components/Navbar'
import { TickerBar } from './components/TickerBar'
import { CountryModal } from './components/CountryModal'
import { CompareView } from './components/CompareView'
import type { CountryRowItem } from './components/RankingTable'
import { Footer } from './components/Footer'
import { GdpWorldMap } from './components/GdpWorldMap'
import {
  detectBrowserLanguage,
  detectBrowserBaseCurrency,
  saveLanguagePreference,
  saveBaseCurrencyPreference,
} from './utils/locale'

export function App() {
  // Localization: Auto-detected from browser locale or restored from localStorage
  const [lang, setLangState] = useState<Language>(() => detectBrowserLanguage())

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    saveLanguagePreference(newLang)
  }

  // Base currency: Auto-detected based on regional hints or restored from localStorage
  const [baseCurrency, setBaseCurrencyState] = useState<BaseCurrency>(() => detectBrowserBaseCurrency())

  const setBaseCurrency = (newCurrency: BaseCurrency) => {
    setBaseCurrencyState(newCurrency)
    saveBaseCurrencyPreference(newCurrency)
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang]
  const [activeTab, setActiveTab] = useState<'cards' | 'compare'>('cards')

  // Selected economic year: Default 2024 (Actual)
  const [selectedYear, setSelectedYear] = useState<EconomicYear>(DEFAULT_ECONOMIC_YEAR)

  // Selected country for deep-dive modal
  const [selectedCountry, setSelectedCountry] = useState<CountryMeta | null>(null)

  // Remote data state
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null)
  const [interestRates, setInterestRates] = useState<Record<string, InterestRateInfo> | null>(null)
  const [gdpMap, setGdpMap] = useState<Map<string, { totalGdp: number; year: number }>>(new Map())
  const [perCapitaMap, setPerCapitaMap] = useState<Map<string, { perCapita: number; year: number }>>(new Map())
  const [growthMap, setGrowthMap] = useState<Map<string, { growth: number; year: number }>>(new Map())
  const [debtMap, setDebtMap] = useState<Map<string, { debtRatio: number | null; year: number }>>(new Map())
  const [inflationMap, setInflationMap] = useState<Map<string, { inflation: number | null; year: number }>>(new Map())

  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initial and refresh data fetcher
  const loadData = useCallback(async (isRefresh = false, yearToLoad?: EconomicYear) => {
    setIsLoading(true)
    setErrorMsg(null)

    const yr = yearToLoad ?? selectedYear

    try {
      const [fx, gdpData, rates] = await Promise.all([
        fetchExchangeRates(isRefresh),
        loadGlobalGdpOverview(isRefresh, yr),
        fetchInterestRates(isRefresh),
      ])

      setExchangeRates(fx)
      setInterestRates(rates)
      setGdpMap(new Map(gdpData.gdpMap))
      setPerCapitaMap(new Map(gdpData.perCapitaMap))
      setGrowthMap(new Map(gdpData.growthMap))
      setDebtMap(new Map(gdpData.debtMap))
      setInflationMap(new Map(gdpData.inflationMap))
    } catch (err: any) {
      console.error('Error synchronizing economic data:', err)
      setErrorMsg(
        lang === 'ko'
          ? '데이터를 동기화하는 중 네트워크 지연이 발생했습니다. 다시 시도해 주세요.'
          : lang === 'ja'
            ? 'データの同期中にネットワーク遅延が発生しました。再試行してください。'
            : lang === 'es'
              ? 'Se produjo un retraso en la red al sincronizar los datos. Por favor, inténtelo de nuevo.'
              : lang === 'zh'
                ? '同步数据时发生网络延迟，请重试。'
                : 'A network timeout occurred while synchronizing data. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [lang, selectedYear])

  const handleYearChange = (newYear: EconomicYear) => {
    if (newYear === selectedYear) return
    setSelectedYear(newYear)
    loadData(false, newYear)
  }

  useEffect(() => {
    loadData(false)
  }, [loadData])

  // Build ranked country metrics list
  const allRankedItems: CountryRowItem[] = useMemo(() => {
    const list = COUNTRIES.map((country) => {
      const gdpObj = gdpMap.get(country.id)
      const pcapObj = perCapitaMap.get(country.id)
      const growthObj = growthMap.get(country.id)
      const debtObj = debtMap.get(country.id)
      const infObj = inflationMap.get(country.id)
      const rateInfo = getCountryInterestRate(interestRates, country)

      return {
        country,
        rank: 0,
        totalGdpUsd: gdpObj?.totalGdp || 0,
        gdpPerCapitaUsd: pcapObj?.perCapita || 0,
        growthRatePct: growthObj?.growth ?? null,
        debtRatioPct: debtObj?.debtRatio ?? null,
        inflationRatePct: infObj?.inflation ?? null,
        interestRatePct: rateInfo?.ratePct ?? null,
        centralBankName: rateInfo?.centralBankName ?? null,
      }
    })

    list.sort((a, b) => b.totalGdpUsd - a.totalGdpUsd)
    list.forEach((item, index) => {
      item.rank = index + 1
    })

    return list
  }, [gdpMap, perCapitaMap, growthMap, debtMap, inflationMap, interestRates])

  // Selected country rank for modal
  const selectedRank = useMemo(() => {
    if (!selectedCountry) return 1
    const found = allRankedItems.find((i) => i.country.id === selectedCountry.id)
    return found ? found.rank : 1
  }, [allRankedItems, selectedCountry])



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        baseCurrency={baseCurrency}
        setBaseCurrency={setBaseCurrency}
        lang={lang}
        setLang={setLang}
        onRefresh={() => loadData(true)}
        isRefreshing={isLoading}
      />

      {/* Real-time FX Ticker */}
      <TickerBar
        exchangeRates={exchangeRates}
        interestRates={interestRates}
        baseCurrency={baseCurrency}
        lang={lang}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Network Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="flex-1">{errorMsg}</div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
            >
              {lang === 'ko' ? '다시 시도' : lang === 'ja' ? '再試行' : 'Retry'}
            </button>
          </div>
        )}

        {/* TAB 1: GDP WORLD MAP & EXPLORER */}
        {activeTab === 'cards' && (
          isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">{t.loadingData}</p>
            </div>
          ) : (
            <GdpWorldMap
              items={allRankedItems}
              baseCurrency={baseCurrency}
              exchangeRates={exchangeRates}
              lang={lang}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              onSelectCountry={(c) => setSelectedCountry(c)}
            />
          )
        )}

        {/* 1:1 COMPARE */}
        {activeTab === 'compare' && (
          <CompareView
            baseCurrency={baseCurrency}
            exchangeRates={exchangeRates}
            interestRates={interestRates}
            lang={lang}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
          />
        )}
      </main>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          rank={selectedRank}
          baseCurrency={baseCurrency}
          exchangeRates={exchangeRates}
          interestRates={interestRates}
          lang={lang}
          selectedYear={selectedYear}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Global Footer */}
      <Footer lang={lang} />
    </div>
  )
}

export default App

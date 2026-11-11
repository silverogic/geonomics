import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertCircle, GitCompare, X } from 'lucide-react'
import { COUNTRIES } from './data/countries'
import type { CountryMeta, BaseCurrency, ExchangeRates, Language, EconomicYear, InterestRateInfo } from './types/economics'
import { DEFAULT_ECONOMIC_YEAR } from './utils/economicYears'
import { fetchExchangeRates } from './services/exchangeApi'
import { fetchInterestRates, getCountryInterestRate } from './services/interestRateApi'
import { loadGlobalGdpOverview } from './services/worldBankApi'
import { translations } from './i18n/translations'
import { Navbar } from './components/Navbar'
import { CountryModal } from './components/CountryModal'
import { CompareView } from './components/CompareView'
import { CountryFlag } from './components/CountryFlag'
import { getCountryName } from './utils/countryNames'
import type { CountryRowItem } from './components/RankingTable'
import { Footer } from './components/Footer'
import { GdpWorldMap } from './components/GdpWorldMap'
import { StockHeatmap } from './components/StockHeatmap'
import { FinancialGlobeView } from './components/FinancialGlobeView'
import { EconomicNewsView } from './components/EconomicNewsView'
import { Spinner } from './components/Spinner'
import { AppTooltip } from './components/AppTooltip'
import { getFuelPriceUsd } from './data/fuelPrices'
import { getBigMacPriceUsd, getBigMacValuationPct } from './data/bigMac'
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
  const [activeTab, setActiveTab] = useState<'globe' | 'cards' | 'heatmap' | 'news'>('globe')

  // Selected economic year: Default current year (e.g. 2026)
  const [selectedYear, setSelectedYear] = useState<EconomicYear>(DEFAULT_ECONOMIC_YEAR)

  // Selected country for deep-dive modal
  const [selectedCountry, setSelectedCountry] = useState<CountryMeta | null>(null)

  // Floating 1:1 Compare Tray & Compare Modal states
  const [compareTrayActive, setCompareTrayActive] = useState<boolean>(false)
  const [compareCountryA, setCompareCountryA] = useState<CountryMeta | null>(null)
  const [compareCountryB, setCompareCountryB] = useState<CountryMeta | null>(null)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false)

  const handleSelectCountry = useCallback(
    (country: CountryMeta) => {
      if (compareTrayActive) {
        if (!compareCountryA) {
          setCompareCountryA(country)
        } else if (compareCountryA.id === country.id) {
          setCompareCountryA(null)
        } else {
          setCompareCountryB(country)
          setCompareTrayActive(false)
          setIsCompareModalOpen(true)
        }
        return
      }
      setSelectedCountry(country)
    },
    [compareTrayActive, compareCountryA]
  )

  const handleStartCompareFromModal = useCallback((country: CountryMeta) => {
    setSelectedCountry(null)
    setCompareCountryA(country)
    setCompareCountryB(null)
    setCompareTrayActive(true)
  }, [])

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
  const [refreshCount, setRefreshCount] = useState(0)

  // Initial and refresh data fetcher
  const loadData = useCallback(async (isRefresh = false, yearToLoad?: EconomicYear) => {
    setIsLoading(true)
    setErrorMsg(null)
    if (isRefresh) {
      setRefreshCount((c) => c + 1)
    }

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

  // Background auto-refresh of live exchange rates & 24h FX change % every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchExchangeRates(true)
          .then((freshFx) => setExchangeRates(freshFx))
          .catch(() => {})
      }
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

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
        fuelPriceUsd: getFuelPriceUsd(country.id),
        bigMacPriceUsd: getBigMacPriceUsd(country.id),
        bigMacValuationPct: getBigMacValuationPct(country.id),
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Navigation Header with Integrated 777 FX & Policy Rate Slot Roller */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        baseCurrency={baseCurrency}
        setBaseCurrency={setBaseCurrency}
        lang={lang}
        setLang={setLang}
        exchangeRates={exchangeRates}
        interestRates={interestRates}
      />

      {/* Main Content Area */}
      <main
        className={
          activeTab === 'heatmap' || activeTab === 'globe'
            ? 'flex-grow w-full max-w-none px-1.5 sm:px-3 py-1 sm:py-1.5'
            : 'flex-grow w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5'
        }
      >
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

        {/* TAB 0 (HOME): 3D GLOBAL FINANCIAL GLOBE */}
        {activeTab === 'globe' && (
          <FinancialGlobeView
            items={allRankedItems}
            baseCurrency={baseCurrency}
            exchangeRates={exchangeRates}
            interestRates={interestRates}
            lang={lang}
            onSelectCountry={handleSelectCountry}
            refreshKey={refreshCount}
          />
        )}

        {/* TAB 1: GDP WORLD MAP & EXPLORER */}
        {activeTab === 'cards' && (
          isLoading && allRankedItems.length === 0 ? (
            <div className="py-24 flex items-center justify-center">
              <Spinner size="lg" label={t.loadingData} />
            </div>
          ) : (
            <GdpWorldMap
              items={allRankedItems}
              baseCurrency={baseCurrency}
              exchangeRates={exchangeRates}
              lang={lang}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              onSelectCountry={handleSelectCountry}
              onToggleCompareTray={() => setCompareTrayActive((prev) => !prev)}
              isCompareTrayActive={compareTrayActive}
            />
          )
        )}

        {/* TAB 2: GLOBAL STOCK HEATMAP */}
        {activeTab === 'heatmap' && (
          <StockHeatmap
            baseCurrency={baseCurrency}
            exchangeRates={exchangeRates}
            lang={lang}
            onSelectCountry={handleSelectCountry}
            refreshKey={refreshCount}
          />
        )}

        {/* TAB 3: GLOBAL ECONOMIC NEWS */}
        {activeTab === 'news' && (
          <EconomicNewsView
            lang={lang}
            onSelectCountry={handleSelectCountry}
            refreshKey={refreshCount}
          />
        )}
      </main>

      {/* Slim 1-Line Floating Compare Tray (Only visible while picking countries to compare) */}
      {compareTrayActive && (
        <div className="fixed bottom-[64px] md:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-20px)] max-w-xl pointer-events-auto animate-fadeIn">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 shadow-2xl shadow-black/90">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <GitCompare className="w-3.5 h-3.5" />
              </div>

              {/* Slot A */}
              {compareCountryA ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-white min-w-0">
                  <CountryFlag iso2={compareCountryA.iso2} className="w-4 h-3 rounded-[2px] shrink-0" />
                  <span className="truncate max-w-[84px] sm:max-w-[120px]">
                    {getCountryName(compareCountryA, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompareCountryA(null)}
                    className="text-slate-400 hover:text-white ml-0.5 cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-dashed border-indigo-400/50 text-[11px] font-semibold text-indigo-300 truncate animate-pulse">
                  {lang === 'ko' ? '1. 첫 번째 국가 클릭' : '1. Tap 1st country'}
                </div>
              )}

              <span className="text-[10px] font-black font-mono text-slate-400 shrink-0">VS</span>

              {/* Slot B */}
              <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-dashed border-emerald-400/50 text-[11px] font-semibold text-emerald-300 truncate animate-pulse">
                {lang === 'ko'
                  ? compareCountryA
                    ? '2. 상대 국가 클릭'
                    : '2. 두 번째 국가'
                  : '2. Tap 2nd country'}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCompareTrayActive(false)
                  setIsCompareModalOpen(true)
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {lang === 'ko' ? '바로 비교' : 'Compare'}
              </button>
              <button
                type="button"
                onClick={() => setCompareTrayActive(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={t.modalClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 Compare Modal Sheet */}
      {isCompareModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
          onClick={() => setIsCompareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl px-3 pb-3 pt-0 sm:px-6 sm:pb-6 sm:pt-0 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CompareView
              baseCurrency={baseCurrency}
              exchangeRates={exchangeRates}
              interestRates={interestRates}
              lang={lang}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              initialCountryAId={compareCountryA?.id || 'USA'}
              initialCountryBId={
                compareCountryB?.id || (compareCountryA?.id === 'USA' ? 'CHN' : 'USA')
              }
              onClose={() => setIsCompareModalOpen(false)}
            />
          </div>
        </div>
      )}

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
          onStartCompare={handleStartCompareFromModal}
        />
      )}

      {/* Global Footer (hidden in heatmap mode for clean full-height viewing) */}
      {activeTab !== 'heatmap' && activeTab !== 'globe' && <Footer lang={lang} />}

      {/* Global App-Themed Custom Tooltip */}
      <AppTooltip />
    </div>
  )
}

export default App

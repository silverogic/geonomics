import React from 'react'
import { Globe, Layers, GitCompare, Coins, Languages, RefreshCw, ChevronDown } from 'lucide-react'
import { BASE_CURRENCIES } from '../data/countries'
import type { BaseCurrency, Language } from '../types/economics'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'

const LANGUAGE_CONFIG: Record<Language, { label: string; short: string; flagIso2: string }> = {
  ko: { label: '한국어 (KO)', short: 'KO', flagIso2: 'KR' },
  en: { label: 'English (EN)', short: 'EN', flagIso2: 'US' },
  ja: { label: '日本語 (JA)', short: 'JA', flagIso2: 'JP' },
  es: { label: 'Español (ES)', short: 'ES', flagIso2: 'ES' },
  zh: { label: '中文 (ZH)', short: 'ZH', flagIso2: 'CN' },
}

interface NavbarProps {
  activeTab: 'cards' | 'compare'
  setActiveTab: (tab: 'cards' | 'compare') => void
  baseCurrency: BaseCurrency
  setBaseCurrency: (c: BaseCurrency) => void
  lang: Language
  setLang: (l: Language) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  baseCurrency,
  setBaseCurrency,
  lang,
  setLang,
  onRefresh,
  isRefreshing = false,
}) => {
  const t = translations[lang]

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => setActiveTab('cards')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shrink-0">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'cards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t.navExplorer}
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              {t.navCompare}
            </button>
          </nav>

          {/* Controls: Base Currency, Language Switcher, and Refresh */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer group">
              {/* Visible presentation */}
              <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-none">
                {/* Mobile: Flag + 2-letter ISO */}
                <CountryFlag
                  iso2={LANGUAGE_CONFIG[lang].flagIso2}
                  className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm"
                  alt={LANGUAGE_CONFIG[lang].label}
                />
                <span className="font-bold sm:hidden text-slate-100">{LANGUAGE_CONFIG[lang].short}</span>

                {/* Desktop: Full label */}
                <span className="hidden sm:inline font-semibold text-slate-100">{LANGUAGE_CONFIG[lang].label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform" />
              </div>

              {/* Native invisible select overlay for seamless mobile OS picker */}
              <select
                id="languageSelect"
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                aria-label="Select language"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {Object.entries(LANGUAGE_CONFIG).map(([code, meta]) => (
                  <option key={code} value={code} className="bg-slate-900 text-white">
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Currency Select */}
            {(() => {
              const activeCurrency = BASE_CURRENCIES.find((c) => c.code === baseCurrency) || BASE_CURRENCIES[0]
              const currencyLabel =
                lang === 'ko'
                  ? activeCurrency.nameKo
                  : lang === 'ja'
                    ? activeCurrency.nameJa
                    : lang === 'es'
                      ? activeCurrency.nameEs
                      : lang === 'zh'
                        ? activeCurrency.nameZh
                        : activeCurrency.nameEn

              return (
                <div className="relative flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer group">
                  {/* Visible presentation */}
                  <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-none">
                    {/* Mobile: Currency Symbol + Code ($ USD) */}
                    <span className="font-mono font-bold text-indigo-400 sm:hidden">{activeCurrency.symbol}</span>
                    <span className="font-bold sm:hidden text-slate-100">{activeCurrency.code}</span>

                    {/* Desktop: Coins icon + Full Name */}
                    <Coins className="w-4 h-4 text-indigo-400 hidden sm:inline shrink-0" />
                    <label htmlFor="baseCurrency" className="text-slate-400 hidden lg:inline mr-0.5">
                      {t.baseCurrencyLabel}
                    </label>
                    <span className="hidden sm:inline font-semibold text-slate-100">{currencyLabel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform" />
                  </div>

                  {/* Native invisible select overlay for seamless mobile OS picker */}
                  <select
                    id="baseCurrency"
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value as BaseCurrency)}
                    aria-label="Select base currency"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {BASE_CURRENCIES.map((bc) => (
                      <option key={bc.code} value={bc.code} className="bg-slate-900 text-white">
                        {lang === 'ko'
                          ? bc.nameKo
                          : lang === 'ja'
                            ? bc.nameJa
                            : lang === 'es'
                              ? bc.nameEs
                              : lang === 'zh'
                                ? bc.nameZh
                                : bc.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })()}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title={t.refreshTooltip}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t.refreshBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all duration-150 active:scale-95 ${
              activeTab === 'cards'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold tracking-tight">{t.navExplorer}</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all duration-150 active:scale-95 ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <GitCompare className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold tracking-tight">{t.navCompare}</span>
          </button>
        </div>
      </nav>
    </>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { Globe, Layers, GitCompare, Coins, ChevronDown, LayoutGrid, Newspaper, Check } from 'lucide-react'
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
  activeTab: 'cards' | 'heatmap' | 'compare' | 'news'
  setActiveTab: (tab: 'cards' | 'heatmap' | 'compare' | 'news') => void
  baseCurrency: BaseCurrency
  setBaseCurrency: (c: BaseCurrency) => void
  lang: Language
  setLang: (l: Language) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  baseCurrency,
  setBaseCurrency,
  lang,
  setLang,
}) => {
  const t = translations[lang]

  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const currencyMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangOpen(false)
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setIsCurrencyOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false)
        setIsCurrencyOpen(false)
      }
    }
    if (isLangOpen || isCurrencyOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLangOpen, isCurrencyOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => setActiveTab('cards')}>
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
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
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'heatmap'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {t.navStockHeatmap}
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
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'news'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              {t.navNews}
            </button>
          </nav>

          {/* Controls: Base Currency, Language Switcher, and Refresh */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Selector Combobox */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                id="languageSelectBtn"
                onClick={() => {
                  setIsLangOpen((prev) => !prev)
                  setIsCurrencyOpen(false)
                }}
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                aria-label="Select language"
                className={`flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer group select-none ${
                  isLangOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                    : 'border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Mobile: Flag + 2-letter ISO */}
                <CountryFlag
                  iso2={LANGUAGE_CONFIG[lang].flagIso2}
                  className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm"
                  alt={LANGUAGE_CONFIG[lang].label}
                />
                <span className="font-bold sm:hidden text-slate-100">{LANGUAGE_CONFIG[lang].short}</span>

                {/* Desktop: Full label */}
                <span className="hidden sm:inline font-semibold text-slate-100">{LANGUAGE_CONFIG[lang].label}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform duration-200 ${
                    isLangOpen ? 'rotate-180 text-indigo-400 opacity-100' : ''
                  }`}
                />
              </button>

              {/* Custom Themed Language Dropdown Popover */}
              {isLangOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 sm:left-0 top-full mt-2 w-44 sm:w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
                >
                  {Object.entries(LANGUAGE_CONFIG).map(([code, meta]) => {
                    const isSelected = lang === code
                    return (
                      <button
                        key={code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setLang(code as Language)
                          setIsLangOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CountryFlag
                            iso2={meta.flagIso2}
                            className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm"
                            alt={meta.label}
                          />
                          <span className={isSelected ? 'text-white font-bold' : 'text-slate-200'}>
                            {meta.label}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Base Currency Select Combobox */}
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
                <div className="relative" ref={currencyMenuRef}>
                  <button
                    type="button"
                    id="baseCurrencyBtn"
                    onClick={() => {
                      setIsCurrencyOpen((prev) => !prev)
                      setIsLangOpen(false)
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isCurrencyOpen}
                    aria-label="Select base currency"
                    className={`flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer group select-none ${
                      isCurrencyOpen
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                        : 'border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    {/* Mobile: Currency Symbol + Code ($ USD) */}
                    <span className="font-mono font-bold text-indigo-400 sm:hidden">{activeCurrency.symbol}</span>
                    <span className="font-bold sm:hidden text-slate-100">{activeCurrency.code}</span>

                    {/* Desktop: Coins icon + Full Name */}
                    <Coins className="w-4 h-4 text-indigo-400 hidden sm:inline shrink-0" />
                    <span className="text-slate-400 hidden lg:inline mr-0.5">
                      {t.baseCurrencyLabel}
                    </span>
                    <span className="hidden sm:inline font-semibold text-slate-100">{currencyLabel}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform duration-200 ${
                        isCurrencyOpen ? 'rotate-180 text-indigo-400 opacity-100' : ''
                      }`}
                    />
                  </button>

                  {/* Custom Themed Currency Dropdown Popover */}
                  {isCurrencyOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 max-h-80 overflow-y-auto [scrollbar-width:thin]"
                    >
                      {BASE_CURRENCIES.map((bc) => {
                        const isSelected = baseCurrency === bc.code
                        const name =
                          lang === 'ko'
                            ? bc.nameKo
                            : lang === 'ja'
                              ? bc.nameJa
                              : lang === 'es'
                                ? bc.nameEs
                                : lang === 'zh'
                                  ? bc.nameZh
                                  : bc.nameEn

                        return (
                          <button
                            key={bc.code}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setBaseCurrency(bc.code as BaseCurrency)
                              setIsCurrencyOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-5 rounded bg-slate-800 text-indigo-400 border border-slate-700/80 font-mono font-bold text-center text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {bc.symbol}
                              </span>
                              <span className={`truncate ${isSelected ? 'text-white font-bold' : 'text-slate-200'}`}>
                                {name}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5] shrink-0 ml-1.5" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-95 min-w-0 ${
              activeTab === 'cards'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-tight truncate">{t.navExplorer}</span>
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-95 min-w-0 ${
              activeTab === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-tight truncate">{t.navStockHeatmap}</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-95 min-w-0 ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-tight truncate">{t.navCompare}</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-95 min-w-0 ${
              activeTab === 'news'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-tight truncate">{t.navNews}</span>
          </button>
        </div>
      </nav>
    </>
  )
}

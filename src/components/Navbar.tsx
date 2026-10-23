import React, { useState, useRef, useEffect } from 'react'
import { Layers, GitCompare, Coins, ChevronDown, LayoutGrid, Newspaper, Check } from 'lucide-react'
import { BASE_CURRENCIES } from '../data/countries'
import type { BaseCurrency, Language, ExchangeRates, InterestRateInfo } from '../types/economics'
import { translations } from '../i18n/translations'
import { CountryFlag } from './CountryFlag'
import { TickerBar } from './TickerBar'

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
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  baseCurrency,
  setBaseCurrency,
  lang,
  setLang,
  exchangeRates,
  interestRates,
}) => {
  const t = translations[lang]
  const activeCurrency = BASE_CURRENCIES.find((c) => c.code === baseCurrency) || BASE_CURRENCIES[0]

  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const currencyMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangOpen(false)
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setIsCurrencyOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false)
        setIsCurrencyOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    if (isLangOpen || isCurrencyOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLangOpen, isCurrencyOpen, isMobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo (Icon removed for compact header) */}
          <div className="flex items-center cursor-pointer min-w-0 shrink-0" onClick={() => setActiveTab('cards')}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop Open Menu with Underline Indicator) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
            {[
              { id: 'cards', label: t.navExplorer, icon: Layers },
              { id: 'heatmap', label: t.navStockHeatmap, icon: LayoutGrid },
              { id: 'compare', label: t.navCompare, icon: GitCompare },
              { id: 'news', label: t.navNews, icon: Newspaper },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`group relative flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all whitespace-nowrap rounded-lg cursor-pointer ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Controls: 777 FX Slot Roller, Language Switcher, and Base Currency */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 777 FX & Policy Rate Slot Machine Roller */}
            <TickerBar
              exchangeRates={exchangeRates}
              interestRates={interestRates}
              baseCurrency={baseCurrency}
              lang={lang}
            />

            {/* Mobile Unified Settings Trigger (Language + Base Currency Combined) */}
            <div className="relative sm:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                id="mobileSettingsBtn"
                onClick={() => {
                  setIsMobileMenuOpen((prev) => !prev)
                  setIsLangOpen(false)
                  setIsCurrencyOpen(false)
                }}
                aria-haspopup="dialog"
                aria-expanded={isMobileMenuOpen}
                aria-label="Language and currency settings"
                className={`flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-2 py-1.5 text-xs font-semibold transition-all select-none cursor-pointer ${
                  isMobileMenuOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                    : 'border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <CountryFlag
                  iso2={LANGUAGE_CONFIG[lang].flagIso2}
                  className="w-3.5 h-2.5 rounded-[2px] shrink-0 shadow-sm"
                  alt={LANGUAGE_CONFIG[lang].label}
                />
                <span className="font-bold text-slate-100">{LANGUAGE_CONFIG[lang].short}</span>
                <span className="text-slate-500 font-normal">·</span>
                <span className="font-mono font-bold text-indigo-400">{activeCurrency.symbol}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform duration-200 ${
                    isMobileMenuOpen ? 'rotate-180 text-indigo-400 opacity-100' : ''
                  }`}
                />
              </button>

              {/* Mobile Settings Modal Popover */}
              {isMobileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-slate-900/98 backdrop-blur-2xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
                >
                  {/* Language Section */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{lang === 'ko' ? '언어 설정' : lang === 'ja' ? '言語設定' : lang === 'zh' ? '语言设置' : 'Language'}</span>
                      <span className="text-indigo-400 font-mono text-[10px] font-bold">{LANGUAGE_CONFIG[lang].short}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(LANGUAGE_CONFIG).map(([code, meta]) => {
                        const isSelected = lang === code
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setLang(code as Language)
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <CountryFlag iso2={meta.flagIso2} className="w-3.5 h-2.5 rounded-[2px] shrink-0" alt={meta.label} />
                              <span className="truncate">{meta.label.split(' ')[0]}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-indigo-400 stroke-[2.5] shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-800/80" />

                  {/* Base Currency Section */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{lang === 'ko' ? '기준 통화' : lang === 'ja' ? '基準通貨' : lang === 'zh' ? '基准货币' : 'Base Currency'}</span>
                      <span className="text-emerald-400 font-mono text-[10px] font-bold">{baseCurrency}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto [scrollbar-width:thin]">
                      {BASE_CURRENCIES.map((bc) => {
                        const isSelected = baseCurrency === bc.code
                        const name =
                          lang === 'ko'
                            ? bc.nameKo.split(' ')[0]
                            : lang === 'ja'
                              ? bc.nameJa.split(' ')[0]
                              : lang === 'zh'
                                ? bc.nameZh.split(' ')[0]
                                : bc.code

                        return (
                          <button
                            key={bc.code}
                            type="button"
                            onClick={() => {
                              setBaseCurrency(bc.code as BaseCurrency)
                              setIsMobileMenuOpen(false)
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-4 h-4 rounded bg-slate-800 text-indigo-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                {bc.symbol}
                              </span>
                              <span className="truncate">{name}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-indigo-400 stroke-[2.5] shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Language Selector Combobox */}
            <div className="relative hidden sm:block" ref={langMenuRef}>
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
                className={`flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer group select-none ${
                  isLangOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                    : 'border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <CountryFlag
                  iso2={LANGUAGE_CONFIG[lang].flagIso2}
                  className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm"
                  alt={LANGUAGE_CONFIG[lang].label}
                />
                <span className="font-bold text-slate-100">{LANGUAGE_CONFIG[lang].short}</span>
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

            {/* Desktop Base Currency Select Combobox */}
            <div className="relative hidden sm:block" ref={currencyMenuRef}>
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
                className={`flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer group select-none ${
                  isCurrencyOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                    : 'border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-bold text-slate-100">{activeCurrency.code}</span>
                <span className="hidden xl:inline text-slate-400 text-xs font-mono">({activeCurrency.symbol})</span>
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

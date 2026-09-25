import React from 'react'
import { Globe, Layers, GitCompare, Coins, Languages, RefreshCw } from 'lucide-react'
import { BASE_CURRENCIES } from '../data/countries'
import type { BaseCurrency, Language } from '../types/economics'
import { translations } from '../i18n/translations'

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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Combobox */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium">
              <Languages className="w-4 h-4 text-indigo-400" />
              <select
                id="languageSelect"
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                aria-label="Select language"
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="ko" className="bg-slate-900 text-white">한국어 (KO)</option>
                <option value="ja" className="bg-slate-900 text-white">日本語 (JA)</option>
                <option value="es" className="bg-slate-900 text-white">Español (ES)</option>
                <option value="zh" className="bg-slate-900 text-white">中文 (ZH)</option>
              </select>
            </div>

            {/* Base Currency Select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium">
              <Coins className="w-4 h-4 text-indigo-400" />
              <label htmlFor="baseCurrency" className="text-slate-400 hidden lg:inline">
                {t.baseCurrencyLabel}
              </label>
              <select
                id="baseCurrency"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as BaseCurrency)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
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

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title={t.refreshTooltip}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
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

import React from 'react'
import { Globe, RefreshCw, Layers, GitCompare, DollarSign, Languages } from 'lucide-react'
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
  onRefresh: () => void
  isRefreshing: boolean
  lastUpdatedText: string
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  baseCurrency,
  setBaseCurrency,
  lang,
  setLang,
  onRefresh,
  isRefreshing,
  lastUpdatedText,
}) => {
  const t = translations[lang]

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('cards')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 text-xs font-bold">
              <Languages className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ko')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  lang === 'ko' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                KO
              </button>
              <button
                onClick={() => setLang('ja')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  lang === 'ja' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JA
              </button>
            </div>

            {/* Base Currency Select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium">
              <DollarSign className="w-4 h-4 text-indigo-400" />
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
                    {lang === 'ko' ? bc.nameKo : lang === 'ja' ? bc.nameJa : bc.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={`${t.refreshTooltip} (${t.asOf} ${lastUpdatedText})`}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-300 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">{t.refreshBtn}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around pb-2.5 border-t border-slate-800/60 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.navExplorer}
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'compare' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {t.navCompare}
          </button>
        </div>
      </div>
    </header>
  )
}

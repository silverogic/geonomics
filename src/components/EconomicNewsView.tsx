import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  Languages,
  ChevronDown,
  Check,
  Globe2,
  ExternalLink,
  Cpu,
  Layers,
  Landmark,
  Zap,
  Ship,
  TrendingUp,
  X,
} from 'lucide-react'
import type {
  Language,
  CountryMeta,
  CountryTopicCategory,
  CountryNewsArticle,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'
import { getCountryName } from '../utils/countryNames'
import { translations } from '../i18n/translations'
import {
  fetchCountrySpecificNews,
  translateBatchOnTheFly,
} from '../services/newsApi'
import { CountryFlag } from './CountryFlag'
import { Spinner } from './Spinner'

interface EconomicNewsViewProps {
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  refreshKey?: number
}

const PRIORITY_COUNTRY_IDS = [
  'USA',
  'KOR',
  'IND',
  'JPN',
  'CHN',
  'TWN',
  'DEU',
  'GBR',
  'FRA',
  'VNM',
  'SAU',
  'SGP',
  'CAN',
  'AUS',
  'BRA',
]

const QUICK_PICKS: Array<{
  countryId: string
  topic: CountryTopicCategory
  customKeyword: string
  labelByLang: Record<Language, string>
}> = [
  {
    countryId: 'USA',
    topic: 'CENTRAL_BANK',
    customKeyword: '',
    labelByLang: {
      en: 'US · Fed & Rates',
      ko: '미국 · 연준 금리 & 물가',
      ja: '米国 · FRB金利 & 物価',
      es: 'EE.UU. · Fed y Tasas',
      zh: '美国 · 美联储与利率',
    },
  },
  {
    countryId: 'KOR',
    topic: 'SEMICONDUCTOR_AI',
    customKeyword: '',
    labelByLang: {
      en: 'South Korea · Chips & AI',
      ko: '대한민국 · 반도체 & AI',
      ja: '韓国 · 半導体 & AI',
      es: 'Corea del Sur · Chips e IA',
      zh: '韩国 · 芯片与AI',
    },
  },
  {
    countryId: 'IND',
    topic: 'SEMICONDUCTOR_AI',
    customKeyword: '',
    labelByLang: {
      en: 'India · Semiconductor & AI',
      ko: '인도 · 반도체 & AI',
      ja: 'インド · 半導体 & AI',
      es: 'India · Semiconductores',
      zh: '印度 · 半导体与AI',
    },
  },
  {
    countryId: 'JPN',
    topic: 'CENTRAL_BANK',
    customKeyword: '',
    labelByLang: {
      en: 'Japan · Yen & BOJ',
      ko: '일본 · 엔화 & 일본은행',
      ja: '日本 · 円相場 & 日銀',
      es: 'Japón · Yen y BOJ',
      zh: '日本 · 日元与央行',
    },
  },
  {
    countryId: 'CHN',
    topic: 'ENERGY',
    customKeyword: '',
    labelByLang: {
      en: 'China · EV & Battery',
      ko: '중국 · 전기차 & 배터리',
      ja: '中国 · EV & 電池',
      es: 'China · VE y Baterías',
      zh: '中国 · 新能源与电池',
    },
  },
  {
    countryId: 'TWN',
    topic: 'SEMICONDUCTOR_AI',
    customKeyword: '',
    labelByLang: {
      en: 'Taiwan · TSMC & Foundry',
      ko: '대만 · 파운드리 & AI',
      ja: '台湾 · TSMC & 半導体',
      es: 'Taiwán · TSMC y Chips',
      zh: '台湾 · 晶圆代工与AI',
    },
  },
]

function formatRelativeTime(isoString: string, lang: Language): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.max(1, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    if (lang === 'ko') return `${diffMins}분 전`
    if (lang === 'ja') return `${diffMins}分前`
    if (lang === 'zh') return `${diffMins}分钟前`
    if (lang === 'es') return `hace ${diffMins} min`
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    if (lang === 'ko') return `${diffHours}시간 전`
    if (lang === 'ja') return `${diffHours}時間前`
    if (lang === 'zh') return `${diffHours}小时前`
    if (lang === 'es') return `hace ${diffHours} h`
    return `${diffHours}h ago`
  }
  if (lang === 'ko') return `${diffDays}일 전`
  if (lang === 'ja') return `${diffDays}日前`
  if (lang === 'zh') return `${diffDays}天前`
  if (lang === 'es') return `hace ${diffDays} d`
  return `${diffDays}d ago`
}

export const EconomicNewsView: React.FC<EconomicNewsViewProps> = ({
  lang,
  onSelectCountry,
  refreshKey = 0,
}) => {
  const t = translations[lang]

  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // Country & Sector Customized News State (Defaults to USA + Rates/FX/Inflation)
  const [targetCountryId, setTargetCountryId] = useState<string>('USA')
  const [targetTopic, setTargetTopic] = useState<CountryTopicCategory>('CENTRAL_BANK')
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('')
  const [submittedKeyword, setSubmittedKeyword] = useState<string>('')
  const [countryArticles, setCountryArticles] = useState<CountryNewsArticle[]>([])
  const [isLoadingCountryNews, setIsLoadingCountryNews] = useState<boolean>(true)

  // Custom App-Themed Combobox States & Refs
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false)
  const [countryFilterQuery, setCountryFilterQuery] = useState('')
  const countryMenuRef = useRef<HTMLDivElement>(null)

  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false)
  const topicMenuRef = useRef<HTMLDivElement>(null)

  // Close combobox popovers on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(e.target as Node)) {
        setIsCountryMenuOpen(false)
      }
      if (topicMenuRef.current && !topicMenuRef.current.contains(e.target as Node)) {
        setIsTopicMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCountryMenuOpen(false)
        setIsTopicMenuOpen(false)
      }
    }
    if (isCountryMenuOpen || isTopicMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCountryMenuOpen, isTopicMenuOpen])

  // Map from English source text -> translated text in current `lang`
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({})

  // Country lookup map by ISO3
  const countryById = useMemo(() => {
    const map = new Map<string, CountryMeta>()
    for (const c of COUNTRIES) {
      map.set(c.id, c)
    }
    return map
  }, [])

  // Sorted countries list for Country Combobox (major economies first, then alphabetical)
  const sortedCountries = useMemo(() => {
    const prioritySet = new Set(PRIORITY_COUNTRY_IDS)
    const priorityList = PRIORITY_COUNTRY_IDS.map((id) => countryById.get(id)).filter(
      (c): c is CountryMeta => Boolean(c)
    )
    const restList = COUNTRIES.filter((c) => !prioritySet.has(c.id)).sort((a, b) =>
      getCountryName(a, lang).localeCompare(getCountryName(b, lang))
    )
    return [...priorityList, ...restList]
  }, [countryById, lang])

  const filteredComboboxCountries = useMemo(() => {
    const q = countryFilterQuery.trim().toLowerCase()
    if (!q) return sortedCountries
    return sortedCountries.filter(
      (c) =>
        getCountryName(c, lang).toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameKo.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q)
    )
  }, [sortedCountries, countryFilterQuery, lang])

  const selectedTargetCountry = useMemo(
    () => countryById.get(targetCountryId) || COUNTRIES[0],
    [countryById, targetCountryId]
  )

  // 1. Fetch Country & Sector Customized Economic News on-demand
  useEffect(() => {
    let cancelled = false
    setIsLoadingCountryNews(true)

    fetchCountrySpecificNews(
      selectedTargetCountry,
      targetTopic,
      submittedKeyword,
      refreshKey > 0
    )
      .then((items) => {
        if (!cancelled) {
          setCountryArticles(items)
        }
      })
      .catch((err) => {
        console.error('Failed to load country-specific news:', err)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCountryNews(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedTargetCountry, targetTopic, submittedKeyword, refreshKey])

  // 2. Real-time On-the-Fly Translation when `countryArticles` or `lang` changes
  useEffect(() => {
    if (lang === 'en') {
      setIsTranslating(false)
      return
    }

    const textsToTranslate: string[] = []
    for (const art of countryArticles) {
      if (art.title) textsToTranslate.push(art.title)
      if (art.description) textsToTranslate.push(art.description)
    }

    if (textsToTranslate.length === 0) {
      setIsTranslating(false)
      return
    }

    let cancelled = false
    setIsTranslating(true)

    translateBatchOnTheFly(textsToTranslate, lang)
      .then((translatedBatch) => {
        if (cancelled) return
        setTranslatedMap((prev) => {
          const next = { ...prev }
          translatedBatch.forEach((val, orig) => {
            next[orig] = val || orig
          })
          return next
        })
      })
      .finally(() => {
        if (!cancelled) {
          setIsTranslating(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [countryArticles, lang])

  // Helper to get localized or original text
  const getText = (original: string): string => {
    if (!original) return ''
    if (lang === 'en' || showOriginal) return original
    return translatedMap[original] || original
  }

  // Topic options for Country & Sector Explorer
  const topicOptions: {
    id: CountryTopicCategory
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { id: 'ALL', label: t.newsTopicAll, icon: Layers },
    { id: 'SEMICONDUCTOR_AI', label: t.newsTopicSemiAi, icon: Cpu },
    { id: 'CENTRAL_BANK', label: t.newsTopicCentralBank, icon: Landmark },
    { id: 'ENERGY', label: t.newsTopicEnergy, icon: Zap },
    { id: 'TRADE', label: t.newsTopicTrade, icon: Ship },
    { id: 'FINANCE', label: t.newsTopicFinance, icon: TrendingUp },
  ]

  const activeTopicOption =
    topicOptions.find((o) => o.id === targetTopic) || topicOptions[0]
  const ActiveTopicIcon = activeTopicOption.icon

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.newsCountrySectionTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                {countryArticles.length}
              </span>
              {selectedTargetCountry && (
                <button
                  type="button"
                  onClick={() => onSelectCountry(selectedTargetCountry)}
                  data-tooltip={`${getCountryName(selectedTargetCountry, lang)} (${selectedTargetCountry.currencyCode})`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500/50 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <CountryFlag
                    iso2={selectedTargetCountry.iso2}
                    className="w-4 h-3 rounded-[1px] shrink-0"
                    alt={selectedTargetCountry.nameEn}
                  />
                  <span>{getCountryName(selectedTargetCountry, lang)}</span>
                </button>
              )}

              {lang !== 'en' && isTranslating && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <Spinner size="xs" />
                  <span>{t.newsTranslating}</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 pl-0.5">
              {t.newsCountrySectionSubtitle}
            </p>
          </div>

          {/* Right: Original/Auto-Translate Toggle */}
          {lang !== 'en' && (
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowOriginal((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shrink-0 ${
                  showOriginal
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                }`}
              >
                <Languages className="w-4 h-4 shrink-0" />
                <span>{showOriginal ? t.newsShowTranslated : t.newsShowOriginal}</span>
              </button>
            </div>
          )}
        </div>

        {/* Popular Quick-Pick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            {t.newsQuickPicksLabel}
          </span>
          {QUICK_PICKS.map((pick) => {
            const pickCountry = countryById.get(pick.countryId)
            const isActive =
              targetCountryId === pick.countryId &&
              targetTopic === pick.topic &&
              submittedKeyword === pick.customKeyword
            return (
              <button
                key={`${pick.countryId}-${pick.topic}`}
                type="button"
                onClick={() => {
                  setTargetCountryId(pick.countryId)
                  setTargetTopic(pick.topic)
                  setCustomKeywordInput(pick.customKeyword)
                  setSubmittedKeyword(pick.customKeyword)
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {pickCountry && (
                  <CountryFlag
                    iso2={pickCountry.iso2}
                    className="w-3.5 h-2.5 rounded-[1px] shrink-0"
                    alt={pickCountry.nameEn}
                  />
                )}
                <span>{pick.labelByLang[lang]}</span>
              </button>
            )
          })}
        </div>

        {/* Filter & Search Bar: App-Themed Country Combobox + Topic Combobox + Custom Keyword Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-2 border-t border-slate-800/80">
          {/* 1. App-Themed Country Selector Combobox */}
          <div className="relative md:w-64 shrink-0" ref={countryMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsCountryMenuOpen((prev) => !prev)
                setIsTopicMenuOpen(false)
              }}
              aria-haspopup="listbox"
              aria-expanded={isCountryMenuOpen}
              className={`w-full flex items-center justify-between bg-slate-950/90 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 transition-all cursor-pointer ${
                isCountryMenuOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <CountryFlag
                  iso2={selectedTargetCountry.iso2}
                  className="w-4 h-3 rounded-[1px] shrink-0"
                  alt={selectedTargetCountry.nameEn}
                />
                <span className="text-white font-bold truncate">
                  {getCountryName(selectedTargetCountry, lang)}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({selectedTargetCountry.id})
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                  isCountryMenuOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>

            {isCountryMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Quick filter inside Country Combobox */}
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={countryFilterQuery}
                    onChange={(e) => setCountryFilterQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    autoFocus
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  {countryFilterQuery && (
                    <button
                      type="button"
                      onClick={() => setCountryFilterQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredComboboxCountries.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      {t.noCountriesFound}
                    </div>
                  ) : (
                    filteredComboboxCountries.map((c) => {
                      const isSelected = c.id === targetCountryId
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setTargetCountryId(c.id)
                            setIsCountryMenuOpen(false)
                            setCountryFilterQuery('')
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag
                              iso2={c.iso2}
                              className="w-4 h-3 rounded-[1px] shrink-0"
                              alt={c.nameEn}
                            />
                            <span
                              className={`truncate ${
                                isSelected ? 'text-white font-bold' : 'text-slate-200'
                              }`}
                            >
                              {getCountryName(c, lang)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {c.id}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5] shrink-0" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. App-Themed Sector / Topic Selector Combobox */}
          <div className="relative md:w-64 shrink-0" ref={topicMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsTopicMenuOpen((prev) => !prev)
                setIsCountryMenuOpen(false)
              }}
              aria-haspopup="listbox"
              aria-expanded={isTopicMenuOpen}
              className={`w-full flex items-center justify-between bg-slate-950/90 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 transition-all cursor-pointer ${
                isTopicMenuOpen
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <ActiveTopicIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-bold truncate">
                  {activeTopicOption.label}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                  isTopicMenuOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {isTopicMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-68 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="space-y-0.5">
                  {topicOptions.map((opt) => {
                    const isSelected = opt.id === targetTopic
                    const OptIcon = opt.icon
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTargetTopic(opt.id)
                          setCustomKeywordInput('')
                          setSubmittedKeyword('')
                          setIsTopicMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <OptIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span className={`truncate ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Custom Keyword Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmittedKeyword(customKeywordInput.trim())
            }}
            className="flex items-center gap-2 flex-1"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                placeholder={t.newsCustomKeywordPlaceholder}
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              {(customKeywordInput || submittedKeyword) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomKeywordInput('')
                    setSubmittedKeyword('')
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {t.newsSearchBtn}
            </button>
          </form>
        </div>
      </div>

      {/* Country & Sector News Results */}
      {isLoadingCountryNews ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl py-20 flex items-center justify-center">
          <Spinner size="lg" label={t.newsCountryLoading} />
        </div>
      ) : countryArticles.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 text-sm">
          {t.newsCountryNoResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {countryArticles.map((art) => {
            const displayTitle = getText(art.title)
            const displayDesc = art.description ? getText(art.description) : ''

            return (
              <a
                key={art.id}
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between gap-2.5 transition-all shadow-md"
              >
                <div className="space-y-2">
                  {/* Source Publisher + Relative Time + Read Article */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] truncate">
                        {art.source}
                      </span>
                      {art.publishedAt && (
                        <span className="text-slate-400 text-[11px] font-mono shrink-0">
                          {formatRelativeTime(art.publishedAt, lang)}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 group-hover:text-emerald-300 font-semibold shrink-0 transition-colors">
                      <span>{t.newsReadArticle}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Article Title */}
                  <h3
                    data-tooltip={
                      lang !== 'en' && !showOriginal ? art.title : undefined
                    }
                    className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white leading-snug transition-colors"
                  >
                    {displayTitle}
                  </h3>

                  {/* Optional Article Snippet (from Reuters/Bloomberg RSS Pool) */}
                  {displayDesc && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {displayDesc}
                    </p>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}




import React, { useState, useEffect, useMemo } from 'react'
import {
  Newspaper,
  Search,
  Languages,
  Sparkles,
  ChevronDown,
  Clock,
  TrendingUp,
  Landmark,
  Flame,
  BarChart3,
  Globe2,
  X,
} from 'lucide-react'
import type {
  Language,
  CountryMeta,
  NewsCategory,
  EconomicNewsData,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'
import { getCountryName } from '../utils/countryNames'
import { translations } from '../i18n/translations'
import { fetchGlobalEconomicNews, translateBatchOnTheFly } from '../services/newsApi'
import { CountryFlag } from './CountryFlag'
import { Spinner } from './Spinner'

interface EconomicNewsViewProps {
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  refreshKey?: number
}

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

  const [rawNews, setRawNews] = useState<EconomicNewsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedBriefIds, setExpandedBriefIds] = useState<Set<string>>(new Set())

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

  // 1. Fetch live macro economic briefings from GitHub open repository
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchGlobalEconomicNews(refreshKey > 0)
      .then((data) => {
        if (!cancelled) {
          setRawNews(data)
          // Expand first 2 macro briefings by default for quick scanning
          const initialExpanded = new Set<string>()
          data.briefings.slice(0, 2).forEach((b) => initialExpanded.add(b.id))
          setExpandedBriefIds(initialExpanded)
        }
      })
      .catch((err) => {
        console.error('Failed to load economic briefings:', err)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // 2. Real-time On-the-Fly Translation when `rawNews` or `lang` changes
  useEffect(() => {
    if (!rawNews || lang === 'en') {
      setIsTranslating(false)
      return
    }

    let cancelled = false
    setIsTranslating(true)

    async function runLiveTranslation() {
      if (!rawNews) return

      const briefTexts: string[] = []
      for (const b of rawNews.briefings) {
        if (b.headline) briefTexts.push(b.headline)
        if (b.body) briefTexts.push(b.body)
        if (b.explain) briefTexts.push(b.explain)
      }

      if (briefTexts.length > 0) {
        const translatedBriefs = await translateBatchOnTheFly(briefTexts, lang)
        if (cancelled) return
        setTranslatedMap((prev) => {
          const next = { ...prev }
          translatedBriefs.forEach((val, orig) => {
            next[orig] = val || orig
          })
          return next
        })
      }

      if (!cancelled) {
        setIsTranslating(false)
      }
    }

    runLiveTranslation()

    return () => {
      cancelled = true
    }
  }, [rawNews, lang])

  // Helper to get localized or original text
  const getText = (original: string): string => {
    if (!original) return ''
    if (lang === 'en' || showOriginal) return original
    return translatedMap[original] || original
  }

  // Category metadata
  const categoryOptions: { id: NewsCategory; label: string }[] = [
    { id: 'ALL', label: t.newsCatAll },
    { id: 'MACRO', label: t.newsCatMacro },
    { id: 'CENTRAL_BANKS', label: t.newsCatCentralBanks },
    { id: 'COMMODITIES', label: t.newsCatCommodities },
    { id: 'MARKETS', label: t.newsCatMarkets },
    { id: 'WORLD', label: t.newsCatWorld },
  ]

  const getCategoryStyle = (cat: NewsCategory) => {
    switch (cat) {
      case 'MACRO':
        return {
          label: t.newsCatMacro,
          badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          icon: TrendingUp,
        }
      case 'CENTRAL_BANKS':
        return {
          label: t.newsCatCentralBanks,
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: Landmark,
        }
      case 'COMMODITIES':
        return {
          label: t.newsCatCommodities,
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: Flame,
        }
      case 'MARKETS':
        return {
          label: t.newsCatMarkets,
          badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          icon: BarChart3,
        }
      default:
        return {
          label: t.newsCatWorld,
          badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          icon: Globe2,
        }
    }
  }

  // Filtered Briefings
  const filteredBriefings = useMemo(() => {
    if (!rawNews) return []
    const q = searchQuery.trim().toLowerCase()
    return rawNews.briefings.filter((b) => {
      if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false
      if (!q) return true
      const headlineTrans = (translatedMap[b.headline] || '').toLowerCase()
      const bodyTrans = (translatedMap[b.body] || '').toLowerCase()
      const countryMatch = b.relatedCountryIds.some((iso3) => {
        const c = countryById.get(iso3)
        if (!c) return false
        return (
          c.id.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.nameKo.toLowerCase().includes(q) ||
          getCountryName(c, lang).toLowerCase().includes(q)
        )
      })
      return (
        b.headline.toLowerCase().includes(q) ||
        b.body.toLowerCase().includes(q) ||
        headlineTrans.includes(q) ||
        bodyTrans.includes(q) ||
        countryMatch
      )
    })
  }, [rawNews, selectedCategory, searchQuery, translatedMap, countryById, lang])

  const toggleBriefExplain = (id: string) => {
    setExpandedBriefIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (isLoading && !rawNews) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" label={t.loadingData} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Control & Filter Bar */}
      <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title + Count + Relative Update Time + Live Translation Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.newsBriefingsTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
              {filteredBriefings.length}
            </span>

            {rawNews?.lastUpdated && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatRelativeTime(rawNews.lastUpdated, lang)}</span>
              </span>
            )}

            {lang !== 'en' && isTranslating && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                <Spinner size="xs" />
                <span>{t.newsTranslating}</span>
              </div>
            )}
          </div>

          {/* Right: Controls (Category Combobox + Original Toggle + Search) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Category Filter Combobox (6 options -> Combobox per UX/UI rule) */}
            <div className="relative flex items-center bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-100 transition-colors cursor-pointer shrink-0">
              <div className="flex items-center gap-2 pointer-events-none">
                <span className="text-indigo-400">
                  {categoryOptions.find((c) => c.id === selectedCategory)?.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as NewsCategory)}
                aria-label="Select news category"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Real-Time Translation / Original Toggle (only when lang !== 'en') */}
            {lang !== 'en' && (
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
            )}

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.newsSearchPlaceholder}
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Briefings Grid */}
      {filteredBriefings.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 text-sm">
          {t.newsNoResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBriefings.map((brief) => {
            const catStyle = getCategoryStyle(brief.category)
            const CatIcon = catStyle.icon
            const isExpanded = expandedBriefIds.has(brief.id)
            const displayHeadline = getText(brief.headline)
            const displayBody = getText(brief.body)
            const displayExplain = getText(brief.explain)

            return (
              <article
                key={brief.id}
                className="bg-slate-900/75 hover:bg-slate-900/95 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all shadow-lg"
              >
                <div className="space-y-2.5">
                  {/* Category Badge + Related Countries */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${catStyle.badgeClass}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catStyle.label}
                    </span>

                    {brief.relatedCountryIds.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {brief.relatedCountryIds.map((iso3) => {
                          const c = countryById.get(iso3)
                          if (!c) return null
                          return (
                            <button
                              key={iso3}
                              type="button"
                              onClick={() => onSelectCountry(c)}
                              data-tooltip={`${getCountryName(c, lang)} (${c.currencyCode})`}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                            >
                              <CountryFlag
                                iso2={c.iso2}
                                className="w-3.5 h-2.5 rounded-[1px] shrink-0"
                                alt={c.nameEn}
                              />
                              <span>{getCountryName(c, lang)}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Headline */}
                  <h3
                    data-tooltip={
                      lang !== 'en' && !showOriginal ? brief.headline : undefined
                    }
                    className="text-base sm:text-lg font-bold text-white leading-snug"
                  >
                    {displayHeadline}
                  </h3>

                  {/* Summary Body */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {displayBody}
                  </p>
                </div>

                {/* Why It Matters (Collapsible Box) */}
                {brief.explain && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleBriefExplain(brief.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.newsWhyItMatters}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-indigo-950/35 border border-indigo-500/25 text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                        {displayExplain}
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

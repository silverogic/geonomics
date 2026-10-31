import React, { useState, useEffect, useMemo } from 'react'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Flame,
  Briefcase,
  TrendingUp,
  ShoppingBag,
  Star,
  Newspaper,
  ExternalLink,
  Search,
  List,
  LayoutGrid,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react'
import type {
  CountryMeta,
  CountryTopicCategory,
  InterestRateInfo,
  Language,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'
import {
  CALENDAR_MARKETS,
  fetchEconomicCalendar,
  formatCalendarValue,
  formatEventTimeZones,
  getSurpriseInfo,
  localizeEventTitle,
  type CalendarMarketId,
  type EconomicCalendarEvent,
  type EventCategory,
} from '../services/economicCalendarApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { CountryFlag } from './CountryFlag'
import { Spinner } from './Spinner'

export interface NewsJumpRequest {
  countryId: string
  topic: CountryTopicCategory
  keyword: string
}

interface EconomicCalendarViewProps {
  lang: Language
  interestRates?: Record<string, InterestRateInfo> | null
  onSelectCountry?: (country: CountryMeta) => void
  onJumpToNews?: (req: NewsJumpRequest) => void
  refreshKey?: number
}

type CategoryFilter = 'ALL' | EventCategory
type ViewMode = 'timeline' | 'grid'
type TimezoneMode = 'KST' | 'LOCAL'

const CATEGORY_META: Record<
  CategoryFilter,
  {
    icon: React.FC<{ className?: string }>
    dotClass: string
    badgeClass: string
    label: Record<Language, string>
  }
> = {
  ALL: {
    icon: Sparkles,
    dotClass: 'bg-indigo-400',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    label: {
      en: 'All',
      ko: '전체',
      ja: 'すべて',
      es: 'Todos',
      zh: '全部',
    },
  },
  CENTRAL_BANK: {
    icon: Landmark,
    dotClass: 'bg-violet-400',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    label: {
      en: 'FOMC · Fed',
      ko: 'FOMC · 금리',
      ja: 'FOMC · 金利',
      es: 'FOMC · Fed',
      zh: 'FOMC · 利率',
    },
  },
  INFLATION: {
    icon: Flame,
    dotClass: 'bg-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    label: {
      en: 'Inflation',
      ko: '물가 (CPI·PCE)',
      ja: '物価 (CPI·PCE)',
      es: 'Inflación',
      zh: '通胀 (CPI·PCE)',
    },
  },
  EMPLOYMENT: {
    icon: Briefcase,
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    label: {
      en: 'Employment',
      ko: '고용',
      ja: '雇用',
      es: 'Empleo',
      zh: '就业',
    },
  },
  GROWTH: {
    icon: TrendingUp,
    dotClass: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    label: {
      en: 'GDP · PMI',
      ko: '성장 (GDP·PMI)',
      ja: '成長 (GDP·PMI)',
      es: 'PIB · PMI',
      zh: '增长 (GDP·PMI)',
    },
  },
  CONSUMER: {
    icon: ShoppingBag,
    dotClass: 'bg-cyan-400',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    label: {
      en: 'Consumer',
      ko: '소비 · 주택',
      ja: '消費 · 住宅',
      es: 'Consumo',
      zh: '消费 · 房市',
    },
  },
}

const UI_TEXT = {
  headerTitle: {
    en: 'U.S. Fed & Key Macroeconomic Calendar',
    ko: '미국 연준(FED) · 핵심 경제지표 달력',
    ja: '米FRB・主要マクロ経済カレンダー',
    es: 'Calendario de la Fed e Indicadores Clave',
    zh: '美联储 (FED) 与核心宏观经济日历',
  },
  nextFomcLabel: {
    en: 'Next FOMC',
    ko: '다음 FOMC 금리결정',
    ja: '次回 FOMC',
    es: 'Próximo FOMC',
    zh: '下次 FOMC 决议',
  },
  currentRateLabel: {
    en: 'Fed Funds Rate',
    ko: '미국 기준금리',
    ja: '米政策金利',
    es: 'Tasa Fed',
    zh: '美联储基准利率',
  },
  nextReleaseLabel: {
    en: 'Up Next',
    ko: '다음 주요 발표',
    ja: '次回の主要発表',
    es: 'Próximo Dato',
    zh: '下一重点公布',
  },
  viewTimeline: {
    en: 'List',
    ko: '리스트',
    ja: 'リスト',
    es: 'Lista',
    zh: '列表',
  },
  viewGrid: {
    en: 'Calendar',
    ko: '달력',
    ja: 'カレンダー',
    es: 'Calendario',
    zh: '日历',
  },
  coreOnly: {
    en: 'Key Only',
    ko: '핵심만',
    ja: '重要のみ',
    es: 'Clave',
    zh: '仅看核心',
  },
  includeAll: {
    en: 'All Events',
    ko: '전체 일정',
    ja: '全日程',
    es: 'Todos',
    zh: '全部日程',
  },
  thisMonthBtn: {
    en: 'Today',
    ko: '오늘',
    ja: '今日',
    es: 'Hoy',
    zh: '今天',
  },
  actualLabel: {
    en: 'Actual',
    ko: '실제',
    ja: '結果',
    es: 'Actual',
    zh: '实际',
  },
  forecastLabel: {
    en: 'Forecast',
    ko: '예상',
    ja: '予想',
    es: 'Prev.',
    zh: '预测',
  },
  previousLabel: {
    en: 'Previous',
    ko: '이전',
    ja: '前回',
    es: 'Ant.',
    zh: '前值',
  },
  pendingRelease: {
    en: 'Pending',
    ko: '발표 예정',
    ja: '発表予定',
    es: 'Pendiente',
    zh: '待公布',
  },
  statementEvent: {
    en: 'Policy / Speech',
    ko: '통화정책 · 연설',
    ja: '金融政策・講演',
    es: 'Política / Discurso',
    zh: '政策 / 讲话',
  },
  relatedNewsBtn: {
    en: 'News',
    ko: '뉴스',
    ja: 'ニュース',
    es: 'Noticias',
    zh: '新闻',
  },
  officialSourceBtn: {
    en: 'Official Source',
    ko: '공식 출처',
    ja: '公式発表元',
    es: 'Fuente Oficial',
    zh: '官方来源',
  },
  searchPlaceholder: {
    en: 'Search (e.g. FOMC, CPI, PCE, NFP, GDP)...',
    ko: '지표 검색 (예: FOMC, CPI, 물가, 고용, GDP)...',
    ja: '指標を検索 (例: FOMC, CPI, 雇用, GDP)...',
    es: 'Buscar (ej. FOMC, IPC, PCE, PIB)...',
    zh: '搜索指标 (如: FOMC, CPI, 非农, GDP)...',
  },
  noEventsFound: {
    en: 'No economic events match your filter in this month.',
    ko: '해당 월에 선택한 조건의 경제 일정이 없습니다.',
    ja: '選択した条件に一致する予定はありません。',
    es: 'No hay eventos que coincidan con su filtro.',
    zh: '该月份暂无符合筛选条件的日程。',
  },
  todayBadge: {
    en: 'TODAY',
    ko: '오늘',
    ja: '今日',
    es: 'HOY',
    zh: '今天',
  },
}

export const EconomicCalendarView: React.FC<EconomicCalendarViewProps> = ({
  lang,
  interestRates,
  onSelectCountry,
  onJumpToNews,
  refreshKey = 0,
}) => {
  const enabledMarkets = useMemo(() => CALENDAR_MARKETS.filter((m) => m.enabled), [])
  const [selectedMarketId, setSelectedMarketId] = useState<CalendarMarketId>('USA')
  const activeMarket = useMemo(
    () => enabledMarkets.find((m) => m.id === selectedMarketId) || CALENDAR_MARKETS[0],
    [enabledMarkets, selectedMarketId]
  )

  const now = useMemo(() => new Date(), [])
  const [selectedYear, setSelectedYear] = useState<number>(() => now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(() => now.getMonth() + 1)

  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  // Default to core headline indicators (importance === 3) to keep visual fatigue low
  const [coreOnly, setCoreOnly] = useState<boolean>(true)
  const [tzMode, setTzMode] = useState<TimezoneMode>(() => (lang === 'ko' ? 'KST' : 'LOCAL'))
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [selectedGridDateKey, setSelectedGridDateKey] = useState<string | null>(null)

  const [allEvents, setAllEvents] = useState<EconomicCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchEconomicCalendar(selectedMarketId, refreshKey > 0)
      .then((res) => {
        if (!cancelled) {
          setAllEvents(res.events)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedMarketId, refreshKey])

  const enrichedEvents = useMemo(() => {
    return allEvents.map((ev) => {
      const titleLocalized = localizeEventTitle(ev.titleEn, lang)
      const tz = formatEventTimeZones(ev.dateUtc, lang, activeMarket.localTimezone)
      const surprise = getSurpriseInfo(ev)
      const activeDateKey = tzMode === 'KST' ? tz.kstDateKey : tz.etDateKey
      const activeTime = tzMode === 'KST' ? tz.kstTime : tz.etTime
      const activeDateLabel = tzMode === 'KST' ? tz.kstDateLabel : tz.etDateLabel
      const secondaryTime =
        tzMode === 'KST' ? `${tz.etTime} ${tz.etTzAbbr}` : `${tz.kstTime} KST`

      return {
        ...ev,
        titleLocalized,
        tz,
        surprise,
        activeDateKey,
        activeTime,
        activeDateLabel,
        secondaryTime,
      }
    })
  }, [allEvents, lang, activeMarket.localTimezone, tzMode])

  const todayDateKey = useMemo(() => {
    const t = formatEventTimeZones(new Date().toISOString(), lang, activeMarket.localTimezone)
    return tzMode === 'KST' ? t.kstDateKey : t.etDateKey
  }, [lang, activeMarket.localTimezone, tzMode])

  // Next FOMC Rate Decision
  const nextFomcDecision = useMemo(() => {
    const nowMs = Date.now()
    return (
      enrichedEvents.find(
        (e) =>
          e.titleEn === 'Fed Interest Rate Decision' &&
          new Date(e.dateUtc).getTime() >= nowMs - 6 * 3600 * 1000
      ) ||
      enrichedEvents
        .filter((e) => e.titleEn === 'Fed Interest Rate Decision')
        .slice(-1)[0] ||
      null
    )
  }, [enrichedEvents])

  const usCountryMeta = useMemo(
    () => COUNTRIES.find((c) => c.id === activeMarket.countryId) || null,
    [activeMarket.countryId]
  )

  const latestFomcActualRate = useMemo(() => {
    const released = [...enrichedEvents]
      .filter((e) => e.titleEn === 'Fed Interest Rate Decision' && e.actual !== null)
      .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime())
    if (released.length > 0 && released[0].actual !== null) {
      return released[0].actual
    }
    if (usCountryMeta && interestRates) {
      return getCountryInterestRate(interestRates, usCountryMeta)?.ratePct ?? 3.75
    }
    return 3.75
  }, [enrichedEvents, interestRates, usCountryMeta])

  // Next Upcoming 3-Star Event
  const nextHighImpactEvent = useMemo(() => {
    const nowMs = Date.now()
    return (
      enrichedEvents.find(
        (e) =>
          e.importance === 3 &&
          new Date(e.dateUtc).getTime() >= nowMs &&
          !/Press Conference|Statement/i.test(e.titleEn)
      ) || null
    )
  }, [enrichedEvents])

  const selectedYearMonthPrefix = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  }, [selectedYear, selectedMonth])

  // In "Core Only" mode, show 3-star events + Beige Book / GDPNow / Michigan Sentiment / PPI MoM
  // while hiding duplicate sub-variants (e.g. Press Conference on same day as Rate Decision, or weekly minor claims)
  const isHeadlineCoreEvent = (ev: EconomicCalendarEvent): boolean => {
    if (/Fed Press Conference|FOMC Statement/i.test(ev.titleEn)) return false
    if (ev.importance === 3) return true
    if (
      /Fed Beige Book|PPI MoM|Core PPI MoM|Michigan Consumer Sentiment Prel|Atlanta Fed GDPNow|ADP Employment Change|Initial Jobless Claims/i.test(
        ev.titleEn
      )
    ) {
      return true
    }
    return false
  }

  const monthCategoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      ALL: 0,
      CENTRAL_BANK: 0,
      INFLATION: 0,
      EMPLOYMENT: 0,
      GROWTH: 0,
      CONSUMER: 0,
    }
    for (const ev of enrichedEvents) {
      if (!ev.activeDateKey.startsWith(selectedYearMonthPrefix)) continue
      if (coreOnly && !isHeadlineCoreEvent(ev)) continue
      counts.ALL += 1
      counts[ev.category] = (counts[ev.category] || 0) + 1
    }
    return counts
  }, [enrichedEvents, selectedYearMonthPrefix, coreOnly])

  const filteredMonthEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return enrichedEvents.filter((ev) => {
      if (!ev.activeDateKey.startsWith(selectedYearMonthPrefix)) return false
      if (coreOnly && !isHeadlineCoreEvent(ev)) return false
      if (categoryFilter !== 'ALL' && ev.category !== categoryFilter) return false
      if (q) {
        const matchTitle =
          ev.titleLocalized.toLowerCase().includes(q) ||
          ev.titleEn.toLowerCase().includes(q) ||
          (ev.period && ev.period.toLowerCase().includes(q)) ||
          (ev.newsKeyword && ev.newsKeyword.toLowerCase().includes(q))
        if (!matchTitle) return false
      }
      return true
    })
  }, [enrichedEvents, selectedYearMonthPrefix, coreOnly, categoryFilter, searchQuery])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof filteredMonthEvents>()
    for (const ev of filteredMonthEvents) {
      const list = map.get(ev.activeDateKey) || []
      list.push(ev)
      map.set(ev.activeDateKey, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredMonthEvents])

  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const startWeekday = firstDayOfMonth.getDay()
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()

    const byDate = new Map<string, typeof filteredMonthEvents>()
    for (const ev of filteredMonthEvents) {
      const arr = byDate.get(ev.activeDateKey) || []
      arr.push(ev)
      byDate.set(ev.activeDateKey, arr)
    }

    const cells: Array<{
      dateKey: string | null
      dayNum: number | null
      events: typeof filteredMonthEvents
    }> = []

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ dateKey: null, dayNum: null, events: [] })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        dateKey,
        dayNum: d,
        events: byDate.get(dateKey) || [],
      })
    }
    return cells
  }, [selectedYear, selectedMonth, filteredMonthEvents])

  const handlePrevMonth = () => {
    setSelectedGridDateKey(null)
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1)
      setSelectedMonth(12)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    setSelectedGridDateKey(null)
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1)
      setSelectedMonth(1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const handleJumpToDateKey = (dateKey: string) => {
    const [yStr, mStr] = dateKey.split('-')
    const y = parseInt(yStr, 10)
    const m = parseInt(mStr, 10)
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      setSelectedYear(y)
      setSelectedMonth(m)
      if (viewMode === 'grid') {
        setSelectedGridDateKey(dateKey)
      }
    }
  }

  const formatDdayBadge = (dateUtc: string) => {
    const diffMs = new Date(dateUtc).getTime() - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0 && diffDays > -1) return 'D-Day'
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`
    return `D-${diffDays}`
  }

  const formattedMonthHeader = useMemo(() => {
    if (lang === 'ko') return `${selectedYear}년 ${selectedMonth}월`
    if (lang === 'ja') return `${selectedYear}年 ${selectedMonth}月`
    if (lang === 'zh') return `${selectedYear}年 ${selectedMonth}月`
    const d = new Date(selectedYear, selectedMonth - 1, 1)
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
    }).format(d)
  }, [selectedYear, selectedMonth, lang])

  const weekdayHeaders = useMemo(() => {
    if (lang === 'ko') return ['일', '월', '화', '수', '목', '금', '토']
    if (lang === 'ja') return ['日', '月', '火', '水', '木', '金', '土']
    if (lang === 'zh') return ['日', '一', '二', '三', '四', '五', '六']
    if (lang === 'es') return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }, [lang])

  const renderEventRow = (ev: (typeof enrichedEvents)[number]) => {
    const isExpanded = expandedEventId === ev.id
    const isReleased = ev.actual !== null
    const catMeta = CATEGORY_META[ev.category]
    const hasNumericComparison =
      ev.actual !== null || ev.forecast !== null || ev.previous !== null

    return (
      <div
        key={ev.id}
        className="rounded-xl bg-slate-950/65 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
      >
        <div
          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
          className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
        >
          {/* Left: Time + Category Dot + Title + Period */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Compact Time Column */}
            <div className="w-16 shrink-0 text-left">
              <div className="text-xs sm:text-sm font-mono font-bold text-slate-200">
                {ev.activeTime}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                {ev.secondaryTime}
              </div>
            </div>

            {/* Category Dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${catMeta.dotClass}`} />

            {/* Clean Title & Minimal Inline Tags */}
            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold truncate ${
                  ev.importance === 3 ? 'text-white font-bold' : 'text-slate-200'
                }`}
              >
                {ev.titleLocalized}
              </span>

              {ev.period && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-slate-400">
                  {ev.period}
                </span>
              )}

              {ev.importance === 3 && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Right: Clean Unified 3-Column Comparison (Actual | Forecast | Previous) + News Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
            {hasNumericComparison ? (
              <div className="grid grid-cols-3 divide-x divide-slate-800/80 rounded-lg bg-slate-900/90 border border-slate-800/90 min-w-[220px] sm:min-w-[260px] text-right">
                {/* Actual */}
                <div className="px-2.5 py-1">
                  <div className="text-[10px] text-slate-500">{UI_TEXT.actualLabel[lang]}</div>
                  {isReleased ? (
                    <div className="text-xs sm:text-sm font-mono font-bold text-white flex items-center justify-end gap-1">
                      <span>{formatCalendarValue(ev.actual, ev.unit, ev.scale)}</span>
                      {ev.surprise && ev.surprise.direction !== 'inline' && (
                        <span
                          className={`text-[9px] font-mono px-1 rounded ${
                            ev.surprise.direction === 'beat'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {ev.surprise.diffText}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-500">
                      {UI_TEXT.pendingRelease[lang]}
                    </div>
                  )}
                </div>

                {/* Forecast */}
                <div className="px-2.5 py-1">
                  <div className="text-[10px] text-slate-500">{UI_TEXT.forecastLabel[lang]}</div>
                  <div className="text-xs sm:text-sm font-mono font-semibold text-amber-300/90">
                    {formatCalendarValue(ev.forecast, ev.unit, ev.scale)}
                  </div>
                </div>

                {/* Previous */}
                <div className="px-2.5 py-1">
                  <div className="text-[10px] text-slate-500">{UI_TEXT.previousLabel[lang]}</div>
                  <div className="text-xs sm:text-sm font-mono text-slate-400">
                    {formatCalendarValue(ev.previous, ev.unit, ev.scale)}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800/80">
                {UI_TEXT.statementEvent[lang]}
              </span>
            )}

            <div className="flex items-center gap-1 shrink-0">
              {onJumpToNews && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onJumpToNews({
                      countryId: activeMarket.countryId,
                      topic: ev.newsTopic,
                      keyword: ev.newsKeyword,
                    })
                  }}
                  title={UI_TEXT.relatedNewsBtn[lang]}
                  className="h-7 px-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/70 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Newspaper className="w-3 h-3 text-indigo-400" />
                  <span className="hidden md:inline">{UI_TEXT.relatedNewsBtn[lang]}</span>
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  isExpanded ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expanded Details Drawer */}
        {isExpanded && (
          <div className="px-4 pb-3 pt-2 border-t border-slate-800/70 bg-slate-900/40 rounded-b-xl space-y-1.5 text-xs text-slate-300">
            {ev.comment && <p className="leading-relaxed text-slate-300">{ev.comment}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-3 font-mono">
                <span>KST: {ev.tz.kstDateKey} {ev.tz.kstTime}</span>
                <span>{ev.tz.etTzAbbr}: {ev.tz.etDateKey} {ev.tz.etTime}</span>
                {ev.source && <span className="font-sans">출처: {ev.source}</span>}
              </div>
              {ev.sourceUrl && (
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>{UI_TEXT.officialSourceBtn[lang]}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Compact Header & Key Status Strip (Low Visual Fatigue) */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <CountryFlag iso2={activeMarket.iso2} className="w-5 h-3.5 rounded-[2px]" alt={activeMarket.centralBankCode} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">
                {UI_TEXT.headerTitle[lang]}
              </h1>
              {enabledMarkets.length > 1 && (
                <div className="flex items-center gap-1">
                  {enabledMarkets.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMarketId(m.id)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold border cursor-pointer ${
                        m.id === selectedMarketId
                          ? 'bg-indigo-600/25 border-indigo-500/50 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {m.centralBankCode}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeMarket.centralBankName[lang]} · FOMC · CPI · PCE · NFP · GDP
            </p>
          </div>
        </div>

        {/* 3 Compact KPI Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Pill 1: Current US Policy Rate */}
          <div
            onClick={() => usCountryMeta && onSelectCountry?.(usCountryMeta)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <span className="text-xs font-semibold text-slate-400">
              {UI_TEXT.currentRateLabel[lang]}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
              {latestFomcActualRate.toFixed(2)}%
            </span>
          </div>

          {/* Pill 2: Next FOMC Rate Decision */}
          <div
            onClick={() => nextFomcDecision && handleJumpToDateKey(nextFomcDecision.activeDateKey)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-violet-500/30 hover:border-violet-400/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-violet-300">
                {UI_TEXT.nextFomcLabel[lang]}
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {nextFomcDecision ? `${nextFomcDecision.activeDateKey} (${nextFomcDecision.activeTime})` : '—'}
              </div>
            </div>
            {nextFomcDecision && (
              <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-200 text-xs font-mono font-black shrink-0">
                {formatDdayBadge(nextFomcDecision.dateUtc)}
              </span>
            )}
          </div>

          {/* Pill 3: Next Upcoming High-Impact Indicator */}
          <div
            onClick={() => nextHighImpactEvent && handleJumpToDateKey(nextHighImpactEvent.activeDateKey)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-amber-300">
                {UI_TEXT.nextReleaseLabel[lang]}
              </div>
              <div className="text-xs font-bold text-white truncate">
                {nextHighImpactEvent ? nextHighImpactEvent.titleLocalized : '—'}
              </div>
            </div>
            {nextHighImpactEvent && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-xs font-mono font-black shrink-0">
                {formatDdayBadge(nextHighImpactEvent.dateUtc)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Clean Filter & Navigation Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Month Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-[125px] text-center text-sm sm:text-base font-black text-white">
              {formattedMonthHeader}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedYear(now.getFullYear())
                setSelectedMonth(now.getMonth() + 1)
                setSelectedGridDateKey(null)
              }}
              className="ml-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
            >
              {UI_TEXT.thisMonthBtn[lang]}
            </button>
          </div>

          {/* Right Controls: Core Toggle, Timezone, View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Core vs All Toggle */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setCoreOnly(true)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  coreOnly ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ★ {UI_TEXT.coreOnly[lang]}
              </button>
              <button
                type="button"
                onClick={() => setCoreOnly(false)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  !coreOnly ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {UI_TEXT.includeAll[lang]}
              </button>
            </div>

            {/* Timezone Toggle */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setTzMode('KST')}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  tzMode === 'KST'
                    ? 'bg-slate-800 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 inline mr-1" />
                KST
              </button>
              <button
                type="button"
                onClick={() => setTzMode('LOCAL')}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  tzMode === 'LOCAL'
                    ? 'bg-slate-800 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                US {activeMarket.localTzShort}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{UI_TEXT.viewTimeline[lang]}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{UI_TEXT.viewGrid[lang]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/70">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((catKey) => {
              const meta = CATEGORY_META[catKey]
              const isSelected = categoryFilter === catKey
              const count = monthCategoryCounts[catKey] || 0
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryFilter(catKey)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {catKey !== 'ALL' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                  )}
                  <span>{meta.label[lang]}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={UI_TEXT.searchPlaceholder[lang]}
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Content */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {weekdayHeaders.map((dayLabel, idx) => (
                <div
                  key={dayLabel}
                  className={`text-center text-xs font-bold py-1 ${
                    idx === 0
                      ? 'text-rose-400'
                      : idx === 6
                        ? 'text-indigo-400'
                        : 'text-slate-400'
                  }`}
                >
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarGridDays.map((cell, idx) => {
                if (!cell.dateKey || cell.dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[76px] sm:min-h-[104px] rounded-xl bg-slate-950/25 border border-slate-900/40"
                    />
                  )
                }

                const isToday = cell.dateKey === todayDateKey
                const isSelected = cell.dateKey === selectedGridDateKey
                const hasFomc = cell.events.some((e) => /FOMC|Fed Interest Rate/i.test(e.titleEn))

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() =>
                      setSelectedGridDateKey(
                        selectedGridDateKey === cell.dateKey ? null : cell.dateKey
                      )
                    }
                    className={`min-h-[76px] sm:min-h-[104px] rounded-xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-400'
                        : isToday
                          ? 'bg-indigo-950/25 border-indigo-500/60'
                          : hasFomc
                            ? 'bg-violet-950/25 border-violet-500/40'
                            : cell.events.length > 0
                              ? 'bg-slate-950/75 border-slate-800 hover:border-slate-600'
                              : 'bg-slate-950/35 border-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isToday
                            ? 'px-1.5 py-0.2 rounded bg-indigo-600 text-white'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {cell.events.length > 0 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {cell.events.slice(0, 2).map((ev) => {
                        const catMeta = CATEGORY_META[ev.category]
                        return (
                          <div
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${catMeta.badgeClass}`}
                          >
                            {ev.titleLocalized}
                          </div>
                        )
                      })}
                      {cell.events.length > 2 && (
                        <div className="text-[10px] font-mono text-slate-500 pl-1">
                          +{cell.events.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedGridDateKey && (
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white font-mono">
                  {selectedGridDateKey} ({tzMode === 'KST' ? 'KST' : activeMarket.localTzShort})
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedGridDateKey(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {filteredMonthEvents
                  .filter((e) => e.activeDateKey === selectedGridDateKey)
                  .map((ev) => renderEventRow(ev))}
              </div>
            </div>
          )}
        </div>
      ) : groupedByDate.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-sm">
          {UI_TEXT.noEventsFound[lang]}
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByDate.map(([dateKey, dayEvents]) => {
            const isToday = dateKey === todayDateKey
            const sample = dayEvents[0]
            return (
              <div
                key={dateKey}
                className={`rounded-2xl border p-3 sm:p-4 space-y-2 ${
                  isToday
                    ? 'bg-indigo-950/20 border-indigo-500/50'
                    : 'bg-slate-900/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      {sample.activeDateLabel}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{dateKey}</span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        {UI_TEXT.todayBadge[lang]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">{dayEvents.map((ev) => renderEventRow(ev))}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import {
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
      en: 'FOMC · Rate',
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
      ko: '물가',
      ja: '物価',
      es: 'Inflación',
      zh: '通胀',
    },
  },
  EMPLOYMENT: {
    icon: Briefcase,
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    label: {
      en: 'Jobs',
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
      ko: '성장',
      ja: '成長',
      es: 'PIB · PMI',
      zh: '增长',
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
    en: 'U.S. Fed & Macro Calendar',
    ko: '미국 연준(FED) · 경제지표 달력',
    ja: '米FRB・経済指標カレンダー',
    es: 'Calendario Fed e Indicadores',
    zh: '美联储与宏观经济日历',
  },
  nextFomcLabel: {
    en: 'Next FOMC',
    ko: '다음 FOMC',
    ja: '次回FOMC',
    es: 'Próx. FOMC',
    zh: '下次FOMC',
  },
  currentRateLabel: {
    en: 'Fed Rate',
    ko: '기준금리',
    ja: '政策金利',
    es: 'Tasa Fed',
    zh: '基准利率',
  },
  nextReleaseLabel: {
    en: 'Next',
    ko: '다음 발표',
    ja: '次回発表',
    es: 'Próximo',
    zh: '下一公布',
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
    en: 'Key',
    ko: '핵심만',
    ja: '重要のみ',
    es: 'Clave',
    zh: '核心',
  },
  includeAll: {
    en: 'All',
    ko: '전체',
    ja: '全体',
    es: 'Todos',
    zh: '全部',
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
    en: 'Prev',
    ko: '이전',
    ja: '前回',
    es: 'Ant.',
    zh: '前值',
  },
  statementEvent: {
    en: 'Statement / Speech',
    ko: '성명 · 연설',
    ja: '声明・講演',
    es: 'Discurso',
    zh: '声明 / 讲话',
  },
  relatedNewsBtn: {
    en: 'Related News',
    ko: '관련 뉴스 보기',
    ja: '関連ニュース',
    es: 'Ver Noticias',
    zh: '查看相关新闻',
  },
  officialSourceBtn: {
    en: 'Official Source',
    ko: '공식 발표 원문',
    ja: '公式発表元',
    es: 'Fuente Oficial',
    zh: '官方来源',
  },
  searchPlaceholder: {
    en: 'Search indicator (e.g. FOMC, CPI, PCE, NFP, GDP)...',
    ko: '지표명 검색 (예: FOMC, CPI, 물가, 고용, GDP)...',
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
  const [selectedMarketId] = useState<CalendarMarketId>('USA')
  const activeMarket = useMemo(
    () => enabledMarkets.find((m) => m.id === selectedMarketId) || CALENDAR_MARKETS[0],
    [enabledMarkets, selectedMarketId]
  )

  const now = useMemo(() => new Date(), [])
  const [selectedYear, setSelectedYear] = useState<number>(() => now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(() => now.getMonth() + 1)

  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [coreOnly, setCoreOnly] = useState<boolean>(true)
  const [tzMode, setTzMode] = useState<TimezoneMode>(() => (lang === 'ko' ? 'KST' : 'LOCAL'))
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
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

  /**
   * Item 4: In `★ 핵심만` (`coreOnly`) mode, deduplicate simultaneous YoY/MoM pairs
   * (keep headline YoY for CPI, Core CPI, and Core PCE; hide simultaneous Press Conference/Statement)
   * so mobile users aren't flooded with 4-5 identical rows at the same release timestamp.
   */
  const isHeadlineCoreEvent = (ev: EconomicCalendarEvent): boolean => {
    if (
      /Fed Press Conference|FOMC Statement|Inflation Rate MoM|Core Inflation Rate MoM|Core PCE Price Index MoM/i.test(
        ev.titleEn
      )
    ) {
      return false
    }
    if (ev.importance === 3) return true
    if (
      /Fed Beige Book|PPI MoM|Michigan Consumer Sentiment Prel|Atlanta Fed GDPNow|ADP Employment Change|Initial Jobless Claims/i.test(
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
      month: 'short',
    }).format(d)
  }, [selectedYear, selectedMonth, lang])

  const weekdayHeaders = useMemo(() => {
    if (lang === 'ko') return ['일', '월', '화', '수', '목', '금', '토']
    if (lang === 'ja') return ['日', '月', '火', '水', '木', '金', '土']
    if (lang === 'zh') return ['日', '一', '二', '三', '四', '五', '六']
    if (lang === 'es') return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }, [lang])

  /**
   * Item 3: Single-line compact event row on both mobile and desktop.
   * - No repeated `실제 / 예상 / 이전` labels inside every row (shown once in the date group header).
   * - Secondary time (`ET`), reference period (`Oct`), commentary, and `[관련 뉴스]` button
   *   are tucked cleanly into the tap-to-expand drawer.
   */
  const renderEventRow = (ev: (typeof enrichedEvents)[number]) => {
    const isExpanded = expandedEventId === ev.id
    const isReleased = ev.actual !== null
    const catMeta = CATEGORY_META[ev.category]
    const hasNumericComparison =
      ev.actual !== null || ev.forecast !== null || ev.previous !== null

    return (
      <div
        key={ev.id}
        className={`rounded-xl border transition-colors ${
          isExpanded
            ? 'bg-slate-900 border-indigo-500/40'
            : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/70 hover:border-slate-700'
        }`}
      >
        <div
          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
          className="px-2.5 sm:px-3.5 py-2 flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          {/* Left: Time + Category Dot + Concise Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="w-10 sm:w-12 shrink-0 text-[11px] sm:text-xs font-mono font-semibold text-slate-400">
              {ev.activeTime}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${catMeta.dotClass}`} />
            <span
              className={`text-xs sm:text-sm truncate ${
                ev.importance === 3 ? 'text-white font-bold' : 'text-slate-200 font-medium'
              }`}
            >
              {ev.titleLocalized}
            </span>
            {ev.importance === 3 && (
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>

          {/* Right: 3-Column Numbers Only (Actual | Forecast | Previous) */}
          {hasNumericComparison ? (
            <div className="w-[150px] sm:w-[228px] shrink-0 grid grid-cols-3 gap-1 text-right font-mono text-xs sm:text-sm items-center">
              {/* Actual */}
              <div
                className={`font-bold truncate ${
                  !isReleased
                    ? 'text-slate-600'
                    : ev.surprise?.direction === 'beat'
                      ? 'text-emerald-400'
                      : ev.surprise?.direction === 'miss'
                        ? 'text-rose-400'
                        : 'text-white'
                }`}
              >
                {isReleased ? formatCalendarValue(ev.actual, ev.unit, ev.scale) : '—'}
              </div>

              {/* Forecast */}
              <div className="text-amber-300/90 font-medium truncate">
                {formatCalendarValue(ev.forecast, ev.unit, ev.scale)}
              </div>

              {/* Previous */}
              <div className="text-slate-400 truncate">
                {formatCalendarValue(ev.previous, ev.unit, ev.scale)}
              </div>
            </div>
          ) : (
            <div className="w-[150px] sm:w-[228px] shrink-0 text-right">
              <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {UI_TEXT.statementEvent[lang]}
              </span>
            </div>
          )}
        </div>

        {/* Tap-to-Expand Drawer: Secondary Time, Period, Surprise Delta, Description, News & Source */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-3 pt-2 border-t border-slate-800/70 bg-slate-950/70 rounded-b-xl space-y-2 text-xs text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                {ev.period && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                    {ev.period}
                  </span>
                )}
                <span>KST {ev.tz.kstDateKey} {ev.tz.kstTime}</span>
                <span>·</span>
                <span>{ev.tz.etTzAbbr} {ev.tz.etDateKey} {ev.tz.etTime}</span>
                {ev.surprise && ev.surprise.direction !== 'inline' && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      ev.surprise.direction === 'beat'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {ev.surprise.diffText}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-[11px] font-bold text-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Newspaper className="w-3 h-3 text-indigo-300" />
                    <span>{UI_TEXT.relatedNewsBtn[lang]}</span>
                  </button>
                )}
                {ev.sourceUrl && (
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 inline-flex items-center gap-1"
                  >
                    <span>{UI_TEXT.officialSourceBtn[lang]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {ev.comment && (
              <p className="text-[11px] sm:text-xs leading-relaxed text-slate-400">
                {ev.comment}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 1. Item 1: Single-Line Slim Header & Status Strip */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <CountryFlag
            iso2={activeMarket.iso2}
            className="w-5 h-3.5 rounded-[2px] shrink-0"
            alt={activeMarket.centralBankCode}
          />
          <h1 className="text-sm sm:text-lg font-black text-white truncate">
            {UI_TEXT.headerTitle[lang]}
          </h1>
        </div>

        {/* Single-Line Horizontal KPI Pills (No 3-Row Vertical Stacking on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
          {/* Pill 1: Current US Policy Rate */}
          <button
            type="button"
            onClick={() => usCountryMeta && onSelectCountry?.(usCountryMeta)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-xs cursor-pointer shrink-0"
          >
            <span className="text-slate-400 font-medium">{UI_TEXT.currentRateLabel[lang]}</span>
            <span className="font-mono font-black text-emerald-400">
              {latestFomcActualRate.toFixed(2)}%
            </span>
          </button>

          {/* Pill 2: Next FOMC Rate Decision */}
          {nextFomcDecision && (
            <button
              type="button"
              onClick={() => handleJumpToDateKey(nextFomcDecision.activeDateKey)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-950/35 border border-violet-500/35 text-xs cursor-pointer shrink-0"
            >
              <span className="text-violet-300 font-semibold">{UI_TEXT.nextFomcLabel[lang]}</span>
              <span className="font-mono font-bold text-white">
                {nextFomcDecision.activeDateKey.slice(5).replace('-', '/')}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-violet-500/25 text-violet-200 text-[10px] font-mono font-black">
                {formatDdayBadge(nextFomcDecision.dateUtc)}
              </span>
            </button>
          )}

          {/* Pill 3: Next Upcoming High-Impact Indicator */}
          {nextHighImpactEvent && (
            <button
              type="button"
              onClick={() => handleJumpToDateKey(nextHighImpactEvent.activeDateKey)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs cursor-pointer shrink-0"
            >
              <span className="text-amber-300 font-semibold">{UI_TEXT.nextReleaseLabel[lang]}</span>
              <span className="font-bold text-white max-w-[120px] sm:max-w-[160px] truncate">
                {nextHighImpactEvent.titleLocalized}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 text-[10px] font-mono font-black">
                {formatDdayBadge(nextHighImpactEvent.dateUtc)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Item 2: Compact 2-Row Filter Bar (Single-Line Swipe Categories + Collapsible Search Icon) */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 sm:p-3.5 space-y-2.5">
        {/* Row 1: Month Navigator + Compact Control Chips */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Month Navigator */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-[96px] sm:min-w-[120px] text-center text-xs sm:text-base font-black text-white">
              {formattedMonthHeader}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
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
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] sm:text-xs font-bold text-slate-200 cursor-pointer"
            >
              {UI_TEXT.thisMonthBtn[lang]}
            </button>
          </div>

          {/* Right Compact Chips */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Single-Chip Core vs All Toggle */}
            <button
              type="button"
              onClick={() => setCoreOnly((prev) => !prev)}
              className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                coreOnly
                  ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <Star className={`w-3 h-3 ${coreOnly ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
              <span>{coreOnly ? UI_TEXT.coreOnly[lang] : UI_TEXT.includeAll[lang]}</span>
            </button>

            {/* Single-Chip Timezone Toggle (KST <-> US ET) */}
            <button
              type="button"
              onClick={() => setTzMode((prev) => (prev === 'KST' ? 'LOCAL' : 'KST'))}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] sm:text-xs font-mono font-bold text-emerald-300 cursor-pointer"
              title="Toggle KST / US ET Timezone"
            >
              {tzMode === 'KST' ? 'KST' : activeMarket.localTzShort}
            </button>

            {/* Search Icon Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((prev) => {
                  if (prev) setSearchQuery('')
                  return !prev
                })
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                isSearchOpen || searchQuery
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              aria-label="Toggle search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* View Mode Toggle (List vs Calendar Grid) */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={UI_TEXT.viewTimeline[lang]}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{UI_TEXT.viewTimeline[lang]}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={UI_TEXT.viewGrid[lang]}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{UI_TEXT.viewGrid[lang]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Search Input (Only visible when Search icon is toggled) */}
        {isSearchOpen && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={UI_TEXT.searchPlaceholder[lang]}
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500"
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
        )}

        {/* Row 2: Single-Line Horizontal Scroll Category Chips (Never wraps onto multiple lines on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap pt-1">
          {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((catKey) => {
            const meta = CATEGORY_META[catKey]
            const isSelected = categoryFilter === catKey
            const count = monthCategoryCounts[catKey] || 0
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
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
      </div>

      {/* 3. Main Content */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdayHeaders.map((dayLabel, idx) => (
                <div
                  key={dayLabel}
                  className={`text-center text-[11px] font-bold py-1 ${
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

            <div className="grid grid-cols-7 gap-1">
              {calendarGridDays.map((cell, idx) => {
                if (!cell.dateKey || cell.dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[64px] sm:min-h-[100px] rounded-xl bg-slate-950/25 border border-slate-900/40"
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
                    className={`min-h-[64px] sm:min-h-[100px] rounded-xl p-1 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
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
                        className={`text-[11px] sm:text-xs font-mono font-bold ${
                          isToday
                            ? 'px-1 rounded bg-indigo-600 text-white'
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

                    <div className="space-y-0.5 mt-1 overflow-hidden">
                      {cell.events.slice(0, 2).map((ev) => {
                        const catMeta = CATEGORY_META[ev.category]
                        return (
                          <div
                            key={ev.id}
                            className={`px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-medium truncate border ${catMeta.badgeClass}`}
                          >
                            {ev.titleLocalized}
                          </div>
                        )
                      })}
                      {cell.events.length > 2 && (
                        <div className="text-[9px] font-mono text-slate-500 pl-0.5">
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
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-black text-white font-mono">
                  {selectedGridDateKey} ({tzMode === 'KST' ? 'KST' : activeMarket.localTzShort})
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-[150px] sm:w-[228px] grid grid-cols-3 gap-1 text-right text-[10px] font-semibold text-slate-500">
                    <span>{UI_TEXT.actualLabel[lang]}</span>
                    <span>{UI_TEXT.forecastLabel[lang]}</span>
                    <span>{UI_TEXT.previousLabel[lang]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGridDateKey(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
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
        /* Item 3: Date-Grouped Timeline with ONE Column Header (`실제 | 예상 | 이전`) per Date Group */
        <div className="space-y-2.5">
          {groupedByDate.map(([dateKey, dayEvents]) => {
            const isToday = dateKey === todayDateKey
            const sample = dayEvents[0]
            return (
              <div
                key={dateKey}
                className={`rounded-2xl border p-2.5 sm:p-3.5 space-y-1.5 ${
                  isToday
                    ? 'bg-indigo-950/20 border-indigo-500/50'
                    : 'bg-slate-900/70 border-slate-800/80'
                }`}
              >
                {/* Date Group Header + Single `실제 | 예상 | 이전` Table Header */}
                <div className="flex items-center justify-between gap-2 px-1 pb-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-white truncate">
                      {sample.activeDateLabel}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[10px] font-bold shrink-0">
                        {UI_TEXT.todayBadge[lang]}
                      </span>
                    )}
                  </div>

                  {/* Single 3-Column Header for the Day */}
                  <div className="w-[150px] sm:w-[228px] shrink-0 grid grid-cols-3 gap-1 text-right text-[10px] font-semibold text-slate-500">
                    <span>{UI_TEXT.actualLabel[lang]}</span>
                    <span>{UI_TEXT.forecastLabel[lang]}</span>
                    <span>{UI_TEXT.previousLabel[lang]}</span>
                  </div>
                </div>

                <div className="space-y-1">{dayEvents.map((ev) => renderEventRow(ev))}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
  Clock,
  CheckCircle2,
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
/**
 * Timeline Feed Filter:
 * - 'smart': Today & Upcoming (closest first) + Recent Released (newest first, including late last month at month start)
 * - 'upcoming': Today & Upcoming scheduled events (chronological: closest to today first)
 * - 'released': Already released / past events (descending: most recent release first)
 */
type TimelineMode = 'smart' | 'upcoming' | 'released'

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
    ko: '연설 · 의사록 일정',
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
    en: 'No economic events match your filter in this period.',
    ko: '선택한 조건에 해당하는 경제 일정이 없습니다.',
    ja: '選択した条件に一致する予定はありません。',
    es: 'No hay eventos que coincidan con su filtro.',
    zh: '暂无符合筛选条件的日程。',
  },
  modeSmart: {
    en: 'Today · Recent',
    ko: '오늘 · 최신중심',
    ja: '今日・最新中心',
    es: 'Hoy · Recientes',
    zh: '今日 · 最新',
  },
  modeReleased: {
    en: 'Released ↓',
    ko: '발표완료 ↓',
    ja: '発表済み ↓',
    es: 'Publicados ↓',
    zh: '已公布 ↓',
  },
  modeUpcoming: {
    en: 'Upcoming ↑',
    ko: '예정일정 ↑',
    ja: '予定 ↑',
    es: 'Próximos ↑',
    zh: '即将公布 ↑',
  },
  sectionReleasedTitle: {
    en: 'Recently Released (Newest First ↓)',
    ko: '최근 발표 완료 (최신순 ↓)',
    ja: '最近の発表結果 (新しい順 ↓)',
    es: 'Publicados Recientemente (↓)',
    zh: '最近已公布 (最新优先 ↓)',
  },
  sectionUpcomingTitle: {
    en: 'Today & Upcoming Schedule (Closest First ↑)',
    ko: '오늘 · 다가오는 예정 일정 (가까운 순 ↑)',
    ja: '今日・今後の予定 (近い順 ↑)',
    es: 'Hoy y Próximos Eventos (↑)',
    zh: '今日与即将公布日程 (由近到远 ↑)',
  },
  todayBadge: {
    en: 'TODAY',
    ko: '오늘',
    ja: '今日',
    es: 'HOY',
    zh: '今天',
  },
  upcomingBadge: {
    en: 'Scheduled',
    ko: '예정',
    ja: '予定',
    es: 'Próx.',
    zh: '待公布',
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
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('smart')
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

  const currentYearMonthPrefix = useMemo(() => todayDateKey.slice(0, 7), [todayDateKey])

  const selectedYearMonthPrefix = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  }, [selectedYear, selectedMonth])

  const isViewingCurrentMonth = selectedYearMonthPrefix === currentYearMonthPrefix

  // Calculate 14-day lookback dateKey so at the start of a new month (e.g. Nov 1st~10th),
  // "Recently Released (Newest First ↓)" smoothly includes late previous month releases (e.g. Oct 28 FOMC, Oct 30 PCE)
  const lookback14DaysDateKey = useMemo(() => {
    const d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const t = formatEventTimeZones(d.toISOString(), lang, activeMarket.localTimezone)
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

  /**
   * In `★ 핵심만` (`coreOnly`) mode, deduplicate simultaneous YoY/MoM pairs
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

  /**
   * Events in the active scope:
   * - In Calendar Grid view or when browsing past/future months: strictly `selectedYearMonthPrefix`.
   * - In Timeline List view during the current month (`isViewingCurrentMonth`):
   *   also include the last 14 days of released events (`lookback14DaysDateKey <= activeDateKey <= todayDateKey`)
   *   so that on the 1st of the month (e.g. Nov 1st), the descending released list isn't empty and seamlessly
   *   shows Nov 1 -> Oct 31 -> Oct 30 -> Oct 28 in true descending order!
   */
  const baseScopedEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => {
      const inSelectedMonth = ev.activeDateKey.startsWith(selectedYearMonthPrefix)
      const inRecentLookback =
        viewMode === 'timeline' &&
        isViewingCurrentMonth &&
        ev.activeDateKey >= lookback14DaysDateKey &&
        ev.activeDateKey <= todayDateKey

      if (!inSelectedMonth && !inRecentLookback) return false
      if (coreOnly && !isHeadlineCoreEvent(ev)) return false
      return true
    })
  }, [
    enrichedEvents,
    selectedYearMonthPrefix,
    viewMode,
    isViewingCurrentMonth,
    lookback14DaysDateKey,
    todayDateKey,
    coreOnly,
  ])

  const monthCategoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      ALL: 0,
      CENTRAL_BANK: 0,
      INFLATION: 0,
      EMPLOYMENT: 0,
      GROWTH: 0,
      CONSUMER: 0,
    }
    for (const ev of baseScopedEvents) {
      counts.ALL += 1
      counts[ev.category] = (counts[ev.category] || 0) + 1
    }
    return counts
  }, [baseScopedEvents])

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return baseScopedEvents.filter((ev) => {
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
  }, [baseScopedEvents, categoryFilter, searchQuery])

  /**
   * Smart Date Grouping to solve the "Nov 1st descending sort" issue:
   * - Past / Released dates (`dateKey <= todayDateKey`): ALWAYS sorted DESCENDING (`11/01 -> 10/31 -> 10/30 -> 10/28`),
   *   so the most recent release is always at the top!
   * - Future / Upcoming dates (`dateKey > todayDateKey`): ALWAYS sorted ASCENDING from Today (`11/03 -> 11/04 -> 11/05...`),
   *   so you see tomorrow's/this week's upcoming events first instead of Nov 27 (end of month) at the top!
   */
  const { releasedDateGroups, upcomingDateGroups } = useMemo(() => {
    const releasedMap = new Map<string, typeof filteredEvents>()
    const upcomingMap = new Map<string, typeof filteredEvents>()

    for (const ev of filteredEvents) {
      // If viewing a past month (e.g. Oct when today is Nov), all events in that month are past/released.
      // If viewing a future month (e.g. Dec when today is Nov), all events are upcoming.
      // In current month, split cleanly around `todayDateKey`:
      const isPastOrTodayReleased =
        ev.activeDateKey < todayDateKey ||
        (ev.activeDateKey === todayDateKey && ev.actual !== null)

      if (isPastOrTodayReleased) {
        const list = releasedMap.get(ev.activeDateKey) || []
        list.push(ev)
        releasedMap.set(ev.activeDateKey, list)
      } else {
        const list = upcomingMap.get(ev.activeDateKey) || []
        list.push(ev)
        upcomingMap.set(ev.activeDateKey, list)
      }
    }

    // Released: Newest date first (DESC: 11월 1일 -> 10월 31일 -> 10월 30일...)
    const releasedGroups = [...releasedMap.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(
        ([dateKey, list]) =>
          [
            dateKey,
            [...list].sort(
              (a, b) =>
                new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime() ||
                b.importance - a.importance
            ),
          ] as const
      )

    // Upcoming: Closest date to Today first (ASC: 오늘/내일 11월 2일 -> 11월 3일 -> 11월 4일...)
    const upcomingGroups = [...upcomingMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(
        ([dateKey, list]) =>
          [
            dateKey,
            [...list].sort(
              (a, b) =>
                new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime() ||
                b.importance - a.importance
            ),
          ] as const
      )

    return { releasedDateGroups: releasedGroups, upcomingDateGroups: upcomingGroups }
  }, [filteredEvents, todayDateKey])

  // Purely month-scoped events for Calendar Grid view
  const gridMonthEvents = useMemo(() => {
    return filteredEvents.filter((ev) => ev.activeDateKey.startsWith(selectedYearMonthPrefix))
  }, [filteredEvents, selectedYearMonthPrefix])

  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const startWeekday = firstDayOfMonth.getDay()
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()

    const byDate = new Map<string, typeof gridMonthEvents>()
    for (const ev of gridMonthEvents) {
      const arr = byDate.get(ev.activeDateKey) || []
      arr.push(ev)
      byDate.set(ev.activeDateKey, arr)
    }

    const cells: Array<{
      dateKey: string | null
      dayNum: number | null
      events: typeof gridMonthEvents
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
  }, [selectedYear, selectedMonth, gridMonthEvents])

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
   * Low-Fatigue, High-Readability Event Row:
   * - No nested card borders ("box inside box" removed; uses clean flat divider lines).
   * - On mobile (< sm): 2-line clear layout so the indicator name NEVER gets truncated to 5 chars,
   *   and Actual / Forecast / Previous values have explicit inline labels (`실제`, `예상`, `이전`).
   * - On desktop (sm+): spacious single-line table row.
   */
  const renderEventRow = (ev: (typeof enrichedEvents)[number]) => {
    const isExpanded = expandedEventId === ev.id
    const isReleased = ev.actual !== null
    const catMeta = CATEGORY_META[ev.category]
    const hasNumericComparison =
      ev.actual !== null || ev.forecast !== null || ev.previous !== null

    const actualColorClass = !isReleased
      ? 'text-slate-500'
      : ev.surprise?.direction === 'beat'
        ? 'text-emerald-400'
        : ev.surprise?.direction === 'miss'
          ? 'text-rose-400'
          : 'text-white'

    return (
      <div
        key={ev.id}
        className={`transition-colors ${
          isExpanded ? 'bg-indigo-950/25' : 'hover:bg-slate-800/40 active:bg-slate-800/60'
        }`}
      >
        <div
          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
          className="px-3 sm:px-4 py-2.5 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 cursor-pointer select-none"
        >
          {/* Top / Left: Category Pill + Full Indicator Title (Never crushed on iPhone) + Time on Mobile */}
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Desktop Time */}
              <span className="hidden sm:inline-block w-12 shrink-0 text-xs font-mono font-semibold text-slate-400">
                {ev.activeTime}
              </span>

              {/* Category Badge */}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${catMeta.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotClass}`} />
                <span>{catMeta.label[lang]}</span>
              </span>

              {/* Full Indicator Name */}
              <span
                className={`text-[13px] sm:text-sm leading-snug truncate ${
                  ev.importance === 3 ? 'text-white font-bold' : 'text-slate-200 font-medium'
                }`}
              >
                {ev.titleLocalized}
              </span>

              {ev.importance === 3 && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              )}
            </div>

            {/* Mobile Time (Right-aligned on Line 1) */}
            <span className="sm:hidden text-[11px] font-mono font-semibold text-slate-400 shrink-0">
              {ev.activeTime}
            </span>
          </div>

          {/* Bottom (Mobile) / Right (Desktop): Metrics Comparison */}
          {hasNumericComparison ? (
            <>
              {/* Mobile Labeled Inline Strip (Easy to read at a glance on iPhone) */}
              <div className="flex sm:hidden items-center justify-between bg-slate-950/60 rounded-lg px-2.5 py-1.5 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-sans font-medium text-slate-400">
                    {UI_TEXT.actualLabel[lang]}
                  </span>
                  <span className={`font-bold ${actualColorClass}`}>
                    {isReleased
                      ? formatCalendarValue(ev.actual, ev.unit, ev.scale)
                      : UI_TEXT.upcomingBadge[lang]}
                  </span>
                  {isReleased && ev.surprise && ev.surprise.direction !== 'inline' && (
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                        ev.surprise.direction === 'beat'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {ev.surprise.diffText}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-sans text-slate-500">
                      {UI_TEXT.forecastLabel[lang]}
                    </span>
                    <span className="text-amber-300/90 font-semibold">
                      {formatCalendarValue(ev.forecast, ev.unit, ev.scale)}
                    </span>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-sans text-slate-500">
                      {UI_TEXT.previousLabel[lang]}
                    </span>
                    <span className="text-slate-300">
                      {formatCalendarValue(ev.previous, ev.unit, ev.scale)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop 3-Column Table Alignment */}
              <div className="hidden sm:grid w-[228px] shrink-0 grid-cols-3 gap-1 text-right font-mono text-sm items-center">
                <div className={`font-bold truncate ${actualColorClass}`}>
                  {isReleased ? formatCalendarValue(ev.actual, ev.unit, ev.scale) : '—'}
                </div>
                <div className="text-amber-300/90 font-medium truncate">
                  {formatCalendarValue(ev.forecast, ev.unit, ev.scale)}
                </div>
                <div className="text-slate-400 truncate">
                  {formatCalendarValue(ev.previous, ev.unit, ev.scale)}
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:block w-[228px] shrink-0 text-right">
              <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {UI_TEXT.statementEvent[lang]}
              </span>
            </div>
          )}
        </div>

        {/* Tap-to-Expand Drawer: Secondary Time, Period, Commentary, News & Source */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-3 pt-1.5 bg-slate-950/75 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
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

  const renderDateGroupCard = ([dateKey, dayEvents]: readonly [
    string,
    typeof enrichedEvents,
  ]) => {
    const isToday = dateKey === todayDateKey
    const sample = dayEvents[0]
    return (
      <div
        key={dateKey}
        className={`rounded-2xl border overflow-hidden ${
          isToday
            ? 'bg-slate-900/95 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
            : 'bg-slate-900/80 border-slate-800/80'
        }`}
      >
        {/* Clean Date Header Bar */}
        <div
          className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b ${
            isToday
              ? 'bg-indigo-950/40 border-indigo-500/40'
              : 'bg-slate-950/60 border-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-black text-white truncate">
              {sample.activeDateLabel}
            </span>
            {isToday && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold shrink-0">
                {UI_TEXT.todayBadge[lang]}
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-500">
              ({dayEvents.length})
            </span>
          </div>

          {/* Desktop-only 3-Column Header (Mobile uses inline labels inside each row) */}
          <div className="hidden sm:grid w-[228px] shrink-0 grid-cols-3 gap-1 text-right text-[10px] font-semibold text-slate-500">
            <span>{UI_TEXT.actualLabel[lang]}</span>
            <span>{UI_TEXT.forecastLabel[lang]}</span>
            <span>{UI_TEXT.previousLabel[lang]}</span>
          </div>
        </div>

        {/* Flat Divider List (No nested boxes!) */}
        <div className="divide-y divide-slate-800/60">
          {dayEvents.map((ev) => renderEventRow(ev))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 1. Slim Header & Status Strip */}
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

        {/* Single-Line Horizontal KPI Pills */}
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

      {/* 2. Filter & Mode Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 sm:p-3.5 space-y-2">
        {/* Row 1: Month Navigator + Compact Controls */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
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
            <div className="min-w-[88px] sm:min-w-[116px] text-center text-xs sm:text-base font-black text-white">
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
                setTimelineMode('smart')
                setSelectedGridDateKey(null)
              }}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] sm:text-xs font-bold text-slate-200 cursor-pointer"
            >
              {UI_TEXT.thisMonthBtn[lang]}
            </button>
          </div>

          {/* Right Compact Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Core vs All Toggle */}
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

            {/* Timezone Toggle (KST <-> US ET) */}
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

        {/* Collapsible Search Input */}
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

        {/* Row 2: Timeline Ordering Tabs (Solves the Nov 1st descending order mismatch) + Category Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          {viewMode === 'timeline' && (
            <div className="inline-flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl shrink-0 self-start">
              {(
                [
                  { id: 'smart', label: UI_TEXT.modeSmart[lang], count: releasedDateGroups.length + upcomingDateGroups.length },
                  { id: 'released', label: UI_TEXT.modeReleased[lang], count: releasedDateGroups.length },
                  { id: 'upcoming', label: UI_TEXT.modeUpcoming[lang], count: upcomingDateGroups.length },
                ] as const
              ).map((tab) => {
                const active = timelineMode === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTimelineMode(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
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
            <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800">
                <h3 className="text-xs sm:text-sm font-black text-white font-mono">
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
              <div className="divide-y divide-slate-800/60">
                {gridMonthEvents
                  .filter((e) => e.activeDateKey === selectedGridDateKey)
                  .map((ev) => renderEventRow(ev))}
              </div>
            </div>
          )}
        </div>
      ) : releasedDateGroups.length === 0 && upcomingDateGroups.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-sm">
          {UI_TEXT.noEventsFound[lang]}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section A: Recently Released Events (Sorted Newest First ↓: Nov 1 -> Oct 31 -> Oct 30...) */}
          {(timelineMode === 'smart' || timelineMode === 'released') &&
            releasedDateGroups.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-extrabold text-emerald-300 tracking-tight">
                    {UI_TEXT.sectionReleasedTitle[lang]}
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {(timelineMode === 'smart' && upcomingDateGroups.length > 0
                    ? releasedDateGroups.slice(0, 6)
                    : releasedDateGroups
                  ).map((group) => renderDateGroupCard(group))}
                </div>
              </div>
            )}

          {/* Section B: Today & Upcoming Events (Sorted Closest to Today First ↑: Nov 2 -> Nov 3 -> Nov 4...) */}
          {(timelineMode === 'smart' || timelineMode === 'upcoming') &&
            upcomingDateGroups.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 pt-1">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-extrabold text-indigo-300 tracking-tight">
                    {UI_TEXT.sectionUpcomingTitle[lang]}
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {upcomingDateGroups.map((group) => renderDateGroupCard(group))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

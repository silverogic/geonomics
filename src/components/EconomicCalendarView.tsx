import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
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
  Info,
  Search,
  List,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
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
    badgeClass: string
    dotClass: string
    label: Record<Language, string>
  }
> = {
  ALL: {
    icon: Sparkles,
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
    label: {
      en: 'All Events',
      ko: '전체 일정',
      ja: 'すべての予定',
      es: 'Todos los Eventos',
      zh: '全部日程',
    },
  },
  CENTRAL_BANK: {
    icon: Landmark,
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/35',
    dotClass: 'bg-violet-400',
    label: {
      en: 'FOMC & Fed Policy',
      ko: 'FOMC · 통화정책',
      ja: 'FOMC · 金融政策',
      es: 'FOMC y Política Fed',
      zh: 'FOMC 与货币政策',
    },
  },
  INFLATION: {
    icon: Flame,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    dotClass: 'bg-rose-400',
    label: {
      en: 'Inflation (CPI · PCE)',
      ko: '물가 (CPI · PCE)',
      ja: '物価 (CPI · PCE)',
      es: 'Inflación (IPC · PCE)',
      zh: '通胀 (CPI · PCE)',
    },
  },
  EMPLOYMENT: {
    icon: Briefcase,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    dotClass: 'bg-amber-400',
    label: {
      en: 'Jobs (NFP · JOLTs)',
      ko: '고용 (NFP · 실업률)',
      ja: '雇用 (NFP · 失業率)',
      es: 'Empleo (NFP · Paro)',
      zh: '就业 (非农 · 失业率)',
    },
  },
  GROWTH: {
    icon: TrendingUp,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    dotClass: 'bg-emerald-400',
    label: {
      en: 'GDP & PMI Growth',
      ko: '성장 (GDP · PMI)',
      ja: '成長 (GDP · PMI)',
      es: 'PIB y PMI',
      zh: '增长 (GDP · PMI)',
    },
  },
  CONSUMER: {
    icon: ShoppingBag,
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    dotClass: 'bg-cyan-400',
    label: {
      en: 'Consumer & Housing',
      ko: '소비 · 주택 · 무역',
      ja: '消費 · 住宅 · 貿易',
      es: 'Consumo y Vivienda',
      zh: '消费 · 房市 · 贸易',
    },
  },
}

const UI_TEXT = {
  headerTitle: {
    en: 'Global Central Bank & Macroeconomic Calendar',
    ko: '글로벌 중앙은행 · 핵심 거시지표 경제 달력',
    ja: '世界中央銀行・主要マクロ経済指標カレンダー',
    es: 'Calendario de Bancos Centrales e Indicadores Macro',
    zh: '全球央行与核心宏观经济指标日历',
  },
  headerSub: {
    en: 'FOMC Rate Decisions, Dot Plot, CPI, Core PCE, Nonfarm Payrolls & GDP with Previous / Forecast / Actual comparisons',
    ko: 'FOMC 기준금리 결정·점도표·의사록 및 CPI·PCE·고용·GDP의 이전치(Previous) · 예상치(Forecast) · 실제치(Actual) 실시간 비교',
    ja: 'FOMC政策金利・ドットプロット・CPI・PCE・雇用統計の前回値・予想値・結果値を一目で比較',
    es: 'Decisiones del FOMC, IPC, PCE, Nóminas y PIB con comparación de Anterior / Previsión / Actual',
    zh: 'FOMC 利率决议、点阵图、CPI、PCE、非农与 GDP 的前值 · 预测值 · 实际公布值对比',
  },
  comingSoon: {
    en: 'Soon',
    ko: '확장 예정',
    ja: '近日対応',
    es: 'Pronto',
    zh: '即将推出',
  },
  nextFomcTitle: {
    en: 'Next FOMC Rate Decision',
    ko: '다음 FOMC 기준금리 결정',
    ja: '次回 FOMC 政策金利発表',
    es: 'Próxima Decisión del FOMC',
    zh: '下次 FOMC 利率决议',
  },
  dotPlotIncluded: {
    en: 'Includes Dot Plot & SEP',
    ko: '점도표(Dot Plot) · 경제전망 발표',
    ja: 'ドットプロット・経済見通し発表',
    es: 'Incluye Dot Plot y Proyecciones',
    zh: '包含点阵图 (Dot Plot) 与经济预测',
  },
  currentRateTitle: {
    en: 'U.S. Fed Funds Target Rate',
    ko: '현재 미국 연준 기준금리 (상단)',
    ja: '現在の米FRB政策金利 (上限)',
    es: 'Tasa Objetivo de la Fed Actual',
    zh: '当前美联储基准利率 (上限)',
  },
  fomcPath2026: {
    en: '2026 FOMC Rate Trajectory',
    ko: '2026년 FOMC 금리 결정 궤적',
    ja: '2026年 FOMC 政策金利推移',
    es: 'Trayectoria de Tasas FOMC 2026',
    zh: '2026 年 FOMC 利率轨迹',
  },
  nextHighImpactTitle: {
    en: 'Next ⭐⭐⭐ Key Indicator Release',
    ko: '다음 발표 임박 ⭐⭐⭐ 핵심 지표',
    ja: '次回の注目 ⭐⭐⭐ 重要指標発表',
    es: 'Próximo Indicador Clave ⭐⭐⭐',
    zh: '下一项即将公布的 ⭐⭐⭐ 核心指标',
  },
  viewTimeline: {
    en: 'Timeline List',
    ko: '타임라인 리스트',
    ja: 'タイムライン',
    es: 'Lista Cronológica',
    zh: '时间轴列表',
  },
  viewGrid: {
    en: 'Monthly Calendar',
    ko: '월간 달력 그리드',
    ja: '月間カレンダー',
    es: 'Calendario Mensual',
    zh: '月度日历视图',
  },
  coreOnly: {
    en: 'Key Indicators Only',
    ko: '핵심 지표만 보기',
    ja: '重要指標のみ',
    es: 'Solo Indicadores Clave',
    zh: '仅看核心指标',
  },
  includeSpeeches: {
    en: 'All (+ Fed Speeches)',
    ko: '연준 위원 연설 포함 전체',
    ja: 'FRB高官講演を含む全体',
    es: 'Todos (+ Discursos Fed)',
    zh: '全部 (含美联储官员讲话)',
  },
  thisMonthBtn: {
    en: 'This Month',
    ko: '이번 달 (오늘)',
    ja: '今月 (今日)',
    es: 'Este Mes',
    zh: '本月 (今天)',
  },
  actualLabel: {
    en: 'Actual',
    ko: '실제 (Actual)',
    ja: '結果 (Actual)',
    es: 'Actual',
    zh: '实际 (Actual)',
  },
  forecastLabel: {
    en: 'Forecast',
    ko: '예상 (Forecast)',
    ja: '予想 (Forecast)',
    es: 'Previsión',
    zh: '预测 (Forecast)',
  },
  previousLabel: {
    en: 'Previous',
    ko: '이전 (Previous)',
    ja: '前回 (Previous)',
    es: 'Anterior',
    zh: '前值 (Previous)',
  },
  pendingRelease: {
    en: 'Pending',
    ko: '발표 예정',
    ja: '発表予定',
    es: 'Pendiente',
    zh: '待公布',
  },
  statementEvent: {
    en: 'Event / Speech',
    ko: '성명 / 연설',
    ja: '声明 / 講演',
    es: 'Evento / Discurso',
    zh: '声明 / 讲话',
  },
  relatedNewsBtn: {
    en: 'Related News',
    ko: '관련 뉴스',
    ja: '関連ニュース',
    es: 'Noticias',
    zh: '相关新闻',
  },
  officialSourceBtn: {
    en: 'Official Release',
    ko: '공식 발표 원문',
    ja: '公式発表元',
    es: 'Fuente Oficial',
    zh: '官方发布源',
  },
  searchPlaceholder: {
    en: 'Filter by indicator (e.g. FOMC, CPI, PCE, NFP, GDP, Powell)...',
    ko: '지표명 또는 키워드 검색 (예: FOMC, CPI, 물가, 고용, 파월, GDP)...',
    ja: '指標名で検索 (例: FOMC, CPI, PCE, 雇用統計, GDP)...',
    es: 'Buscar indicador (ej. FOMC, IPC, PCE, NFP, PIB)...',
    zh: '搜索指标名称或关键词 (如: FOMC, CPI, 通胀, 非农, GDP)...',
  },
  noEventsFound: {
    en: 'No economic events match your filter in this month.',
    ko: '선택한 월 및 필터 조건에 해당하는 경제 일정이 없습니다.',
    ja: '選択した月・フィルター条件に一致する経済予定はありません。',
    es: 'No hay eventos económicos que coincidan con su filtro en este mes.',
    zh: '所选月份与筛选条件下暂无匹配的经济日程。',
  },
  todayBadge: {
    en: 'TODAY',
    ko: '오늘',
    ja: '今日',
    es: 'HOY',
    zh: '今天',
  },
  releasedBadge: {
    en: 'Released',
    ko: '발표 완료',
    ja: '発表済',
    es: 'Publicado',
    zh: '已公布',
  },
}

export const EconomicCalendarView: React.FC<EconomicCalendarViewProps> = ({
  lang,
  interestRates,
  onSelectCountry,
  onJumpToNews,
  refreshKey = 0,
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<CalendarMarketId>('USA')
  const activeMarket = useMemo(
    () => CALENDAR_MARKETS.find((m) => m.id === selectedMarketId) || CALENDAR_MARKETS[0],
    [selectedMarketId]
  )

  // Default to current year & month in KST
  const now = useMemo(() => new Date(), [])
  const [selectedYear, setSelectedYear] = useState<number>(() => now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(() => now.getMonth() + 1) // 1..12

  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [coreOnly, setCoreOnly] = useState<boolean>(true) // true: importance >= 2 (or FOMC), false: all including 1-star speeches
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

  // Enrich events with localized titles and formatted KST/ET timestamps
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

  // Today's date key in the active timezone
  const todayDateKey = useMemo(() => {
    const t = formatEventTimeZones(new Date().toISOString(), lang, activeMarket.localTimezone)
    return tzMode === 'KST' ? t.kstDateKey : t.etDateKey
  }, [lang, activeMarket.localTimezone, tzMode])

  // Summary Card 1: Next Upcoming FOMC Rate Decision
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

  // Summary Card 2: Current Fed Funds Rate & 2026 FOMC decision history
  const usCountryMeta = useMemo(
    () => COUNTRIES.find((c) => c.id === activeMarket.countryId) || null,
    [activeMarket.countryId]
  )
  const fomcDecisions2026 = useMemo(() => {
    return enrichedEvents.filter(
      (e) => e.titleEn === 'Fed Interest Rate Decision' && e.dateUtc.startsWith('2026-')
    )
  }, [enrichedEvents])

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

  // Summary Card 3: Next Upcoming ⭐⭐⭐ High-Impact Event (excluding Press Conference / Statement duplicates)
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

  // Selected YYYY-MM prefix
  const selectedYearMonthPrefix = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  }, [selectedYear, selectedMonth])

  // Category counts for the currently selected month
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
      if (coreOnly && ev.importance < 2) continue
      counts.ALL += 1
      counts[ev.category] = (counts[ev.category] || 0) + 1
    }
    return counts
  }, [enrichedEvents, selectedYearMonthPrefix, coreOnly])

  // Filtered events for the selected month
  const filteredMonthEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return enrichedEvents.filter((ev) => {
      if (!ev.activeDateKey.startsWith(selectedYearMonthPrefix)) return false
      if (coreOnly && ev.importance < 2) return false
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

  // Group filtered events by activeDateKey for Timeline View
  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof filteredMonthEvents>()
    for (const ev of filteredMonthEvents) {
      const list = map.get(ev.activeDateKey) || []
      list.push(ev)
      map.set(ev.activeDateKey, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredMonthEvents])

  // Calendar Grid cells for the selected month
  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const startWeekday = firstDayOfMonth.getDay() // 0 (Sun) .. 6 (Sat)
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

  // Navigation handlers
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
    const isPastTime = new Date(ev.dateUtc).getTime() <= Date.now()
    const catMeta = CATEGORY_META[ev.category]
    const CatIcon = catMeta.icon
    const hasNumericComparison =
      ev.actual !== null || ev.forecast !== null || ev.previous !== null

    return (
      <div
        key={ev.id}
        className={`group rounded-2xl border transition-all duration-150 ${
          ev.importance === 3
            ? 'bg-slate-900/90 border-slate-700/80 hover:border-indigo-500/50 shadow-md shadow-black/20'
            : 'bg-slate-900/55 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div
          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
          className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer select-none"
        >
          {/* Left: Timezone + Importance + Category + Title */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Release Time Box */}
            <div className="w-20 sm:w-24 shrink-0 bg-slate-950/80 border border-slate-800/90 rounded-xl px-2.5 py-1.5 text-center">
              <div className="text-xs sm:text-sm font-mono font-black text-slate-100 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{ev.activeTime}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                {ev.secondaryTime}
              </div>
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Category Pill */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${catMeta.badgeClass}`}
                >
                  <CatIcon className="w-3 h-3 shrink-0" />
                  <span>{catMeta.label[lang]}</span>
                </span>

                {/* Importance Stars */}
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    ev.importance === 3
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : ev.importance === 2
                        ? 'bg-slate-800 text-amber-400/90 border-slate-700'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {Array.from({ length: ev.importance }).map((_, idx) => (
                    <Star key={idx} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </span>

                {/* Reference Period Badge (e.g. Oct, Q3, Sep) */}
                {ev.period && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/70 text-[10px] font-mono font-bold text-slate-300">
                    {ev.period}
                  </span>
                )}

                {/* Released / D-Day status badge */}
                {isReleased ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {UI_TEXT.releasedBadge[lang]}
                  </span>
                ) : !isPastTime ? (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300">
                    {formatDdayBadge(ev.dateUtc)}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <h4
                  className={`text-sm sm:text-base font-bold truncate ${
                    ev.importance === 3 ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {ev.titleLocalized}
                </h4>
                {lang !== 'en' && (
                  <span className="hidden xl:inline text-xs text-slate-500 font-medium truncate">
                    ({ev.titleEn})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: 3-Column Actual / Forecast / Previous Comparison Box + Actions */}
          <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
            {hasNumericComparison ? (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 lg:flex-initial min-w-[250px] sm:min-w-[310px]">
                {/* Column 1: Actual */}
                <div
                  className={`rounded-xl px-2.5 py-1.5 border text-right ${
                    isReleased
                      ? 'bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end gap-1">
                    <span>{UI_TEXT.actualLabel[lang]}</span>
                  </div>
                  {isReleased ? (
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-xs sm:text-sm font-mono font-black text-white">
                        {formatCalendarValue(ev.actual, ev.unit, ev.scale)}
                      </span>
                      {ev.surprise && ev.surprise.direction !== 'inline' && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                            ev.surprise.direction === 'beat'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                          title={`Actual vs Forecast (${ev.surprise.diffText})`}
                        >
                          {ev.surprise.diffText}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                      {UI_TEXT.pendingRelease[lang]}
                    </div>
                  )}
                </div>

                {/* Column 2: Forecast */}
                <div className="rounded-xl px-2.5 py-1.5 bg-slate-950/70 border border-slate-800/80 text-right">
                  <div className="text-[10px] font-semibold text-slate-400">
                    {UI_TEXT.forecastLabel[lang]}
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-amber-300/95 mt-0.5">
                    {formatCalendarValue(ev.forecast, ev.unit, ev.scale)}
                  </div>
                </div>

                {/* Column 3: Previous */}
                <div className="rounded-xl px-2.5 py-1.5 bg-slate-950/70 border border-slate-800/80 text-right">
                  <div className="text-[10px] font-semibold text-slate-400">
                    {UI_TEXT.previousLabel[lang]}
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-semibold text-slate-300 mt-0.5">
                    {formatCalendarValue(ev.previous, ev.unit, ev.scale)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>{UI_TEXT.statementEvent[lang]}</span>
              </div>
            )}

            {/* Quick News Jump & Details Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
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
                  className="h-9 px-2.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Newspaper className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">{UI_TEXT.relatedNewsBtn[lang]}</span>
                </button>
              )}
              <div
                className={`w-8 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isExpanded
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Indicator Description & Source Drawer */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 rounded-b-2xl space-y-2.5 text-xs text-slate-300 animate-in fade-in duration-150">
            {ev.comment && (
              <p className="leading-relaxed text-slate-300">{ev.comment}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  <strong className="text-slate-300">KST:</strong> {ev.tz.kstDateKey} {ev.tz.kstTime}
                </span>
                <span>
                  <strong className="text-slate-300">{ev.tz.etTzAbbr}:</strong> {ev.tz.etDateKey} {ev.tz.etTime}
                </span>
                {ev.source && (
                  <span>
                    <strong className="text-slate-300">Source:</strong> {ev.source}
                  </span>
                )}
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
    <div className="space-y-5">
      {/* 1. Header & Extensible Multi-Country Central Bank Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>FED · FOMC · MACRO ECONOMIC CALENDAR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {UI_TEXT.headerTitle[lang]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {UI_TEXT.headerSub[lang]}
            </p>
          </div>

          {/* Extensible Multi-Country Market Selector Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CALENDAR_MARKETS.map((m) => {
              const isSelected = m.id === selectedMarketId
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={!m.enabled}
                  onClick={() => m.enabled && setSelectedMarketId(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/25 border-indigo-500/60 text-white shadow-md shadow-indigo-500/10 cursor-pointer'
                      : m.enabled
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                        : 'bg-slate-950/60 border-slate-800/70 text-slate-500 opacity-65 cursor-not-allowed'
                  }`}
                >
                  <CountryFlag iso2={m.iso2} className="w-4 h-3 rounded-[2px] shrink-0" alt={m.centralBankCode} />
                  <span>{m.centralBankCode}</span>
                  {!m.enabled && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                      {UI_TEXT.comingSoon[lang]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Top 3-Card Intelligence Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          {/* Card 1: Next FOMC Rate Decision Countdown */}
          <div
            onClick={() => nextFomcDecision && handleJumpToDateKey(nextFomcDecision.activeDateKey)}
            className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/45 via-slate-900/90 to-slate-950 border border-violet-500/30 hover:border-violet-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-violet-400" />
                {UI_TEXT.nextFomcTitle[lang]}
              </span>
              {nextFomcDecision && (
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/40 text-xs font-mono font-black text-violet-200">
                  {formatDdayBadge(nextFomcDecision.dateUtc)}
                </span>
              )}
            </div>
            {nextFomcDecision ? (
              <div className="space-y-1.5">
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {nextFomcDecision.tz.kstDateKey} ({nextFomcDecision.tz.kstTime} KST)
                </div>
                <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2">
                  <span>
                    US {nextFomcDecision.tz.etTzAbbr}: {nextFomcDecision.tz.etDateKey} {nextFomcDecision.tz.etTime}
                  </span>
                  {/(Mar|Jun|Sep|Dec)/i.test(nextFomcDecision.period) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-sans font-bold text-amber-300">
                      ★ {UI_TEXT.dotPlotIncluded[lang]}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">—</div>
            )}
          </div>

          {/* Card 2: Current U.S. Fed Funds Target Rate & 2026 FOMC Path */}
          <div
            onClick={() => usCountryMeta && onSelectCountry?.(usCountryMeta)}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CountryFlag iso2={activeMarket.iso2} className="w-4 h-3 rounded-[2px]" alt="US" />
                {UI_TEXT.currentRateTitle[lang]}
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                {latestFomcActualRate.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mb-1.5">{UI_TEXT.fomcPath2026[lang]}</div>
            <div className="grid grid-cols-8 gap-1">
              {fomcDecisions2026.slice(0, 8).map((d) => {
                const isDone = d.actual !== null
                return (
                  <div
                    key={d.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJumpToDateKey(d.activeDateKey)
                    }}
                    className={`rounded-lg px-1 py-1 text-center border transition-colors ${
                      isDone
                        ? 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-indigo-400'
                        : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-[9px] font-bold text-slate-400">{d.period}</div>
                    <div className="text-[10px] font-mono font-black">
                      {d.actual !== null
                        ? `${d.actual}%`
                        : d.forecast !== null
                          ? `${d.forecast}%*`
                          : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 3: Next Upcoming ⭐⭐⭐ High-Impact Macro Release */}
          <div
            onClick={() => nextHighImpactEvent && handleJumpToDateKey(nextHighImpactEvent.activeDateKey)}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 border border-amber-500/30 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {UI_TEXT.nextHighImpactTitle[lang]}
              </span>
              {nextHighImpactEvent && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-mono font-black text-amber-200">
                  {formatDdayBadge(nextHighImpactEvent.dateUtc)}
                </span>
              )}
            </div>
            {nextHighImpactEvent ? (
              <div className="space-y-1.5">
                <div className="text-sm sm:text-base font-black text-white truncate">
                  {nextHighImpactEvent.titleLocalized}
                  {nextHighImpactEvent.period ? ` (${nextHighImpactEvent.period})` : ''}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="text-slate-400">
                    {nextHighImpactEvent.activeDateKey} {nextHighImpactEvent.activeTime} ({tzMode === 'KST' ? 'KST' : nextHighImpactEvent.tz.etTzAbbr})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300">
                      {UI_TEXT.forecastLabel[lang].split(' ')[0]}:{' '}
                      <strong>
                        {formatCalendarValue(
                          nextHighImpactEvent.forecast,
                          nextHighImpactEvent.unit,
                          nextHighImpactEvent.scale
                        )}
                      </strong>
                    </span>
                    <span className="text-slate-400">
                      {UI_TEXT.previousLabel[lang].split(' ')[0]}:{' '}
                      <strong>
                        {formatCalendarValue(
                          nextHighImpactEvent.previous,
                          nextHighImpactEvent.unit,
                          nextHighImpactEvent.scale
                        )}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">—</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter & Month Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-lg">
        {/* Top Row: Month Navigator + View Mode + Timezone + Importance Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Month Navigator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-[140px] sm:min-w-[165px] text-center text-base sm:text-lg font-black text-white">
              {formattedMonthHeader}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
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
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 cursor-pointer transition-colors"
            >
              {UI_TEXT.thisMonthBtn[lang]}
            </button>
          </div>

          {/* Right Controls: View Mode, Importance, Timezone */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle (Timeline List vs Monthly Calendar Grid) */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{UI_TEXT.viewTimeline[lang]}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{UI_TEXT.viewGrid[lang]}</span>
              </button>
            </div>

            {/* Importance Filter Toggle */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setCoreOnly(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  coreOnly
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{UI_TEXT.coreOnly[lang]}</span>
              </button>
              <button
                type="button"
                onClick={() => setCoreOnly(false)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !coreOnly
                    ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {UI_TEXT.includeSpeeches[lang]}
              </button>
            </div>

            {/* Timezone Primary Toggle (KST vs US ET) */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setTzMode('KST')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  tzMode === 'KST'
                    ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇰🇷 KST (UTC+9)
              </button>
              <button
                type="button"
                onClick={() => setTzMode('LOCAL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  tzMode === 'LOCAL'
                    ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇺🇸 US {activeMarket.localTzShort}
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Category Filter Pills & Search Box */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((catKey) => {
              const meta = CATEGORY_META[catKey]
              const Icon = meta.icon
              const isSelected = categoryFilter === catKey
              const count = monthCategoryCounts[catKey] || 0
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryFilter(catKey)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{meta.label[lang]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={UI_TEXT.searchPlaceholder[lang]}
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Main Calendar Content Area */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'grid' ? (
        /* MONTHLY CALENDAR GRID VIEW */
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekdayHeaders.map((dayLabel, idx) => (
                <div
                  key={dayLabel}
                  className={`text-center text-xs font-bold py-1.5 ${
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

            {/* 7-Column Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarGridDays.map((cell, idx) => {
                if (!cell.dateKey || cell.dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[84px] sm:min-h-[115px] rounded-2xl bg-slate-950/30 border border-slate-900/50"
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
                    className={`min-h-[84px] sm:min-h-[115px] rounded-2xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-400 ring-2 ring-indigo-500/25'
                        : isToday
                          ? 'bg-indigo-950/25 border-indigo-500/60'
                          : hasFomc
                            ? 'bg-violet-950/25 border-violet-500/40 hover:border-violet-400'
                            : cell.events.length > 0
                              ? 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                              : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold ${
                          isToday
                            ? 'px-1.5 py-0.5 rounded-md bg-indigo-600 text-white'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {cell.events.length > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {cell.events.slice(0, 3).map((ev) => {
                        const catMeta = CATEGORY_META[ev.category]
                        return (
                          <div
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${catMeta.badgeClass}`}
                            title={`${ev.activeTime} ${ev.titleLocalized}`}
                          >
                            <span className="hidden sm:inline font-mono mr-1">
                              {ev.activeTime}
                            </span>
                            <span>{ev.titleLocalized}</span>
                          </div>
                        )
                      })}
                      {cell.events.length > 3 && (
                        <div className="text-[10px] font-mono text-center text-slate-400">
                          +{cell.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer below Calendar Grid */}
          {selectedGridDateKey && (
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-white font-mono">
                  📅 {selectedGridDateKey} ({tzMode === 'KST' ? 'KST' : activeMarket.localTzShort})
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedGridDateKey(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                {filteredMonthEvents
                  .filter((e) => e.activeDateKey === selectedGridDateKey)
                  .map((ev) => renderEventRow(ev))}
              </div>
            </div>
          )}
        </div>
      ) : groupedByDate.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
          {UI_TEXT.noEventsFound[lang]}
        </div>
      ) : (
        /* TIMELINE LIST VIEW (Grouped by Date) */
        <div className="space-y-4">
          {groupedByDate.map(([dateKey, dayEvents]) => {
            const isToday = dateKey === todayDateKey
            const sample = dayEvents[0]
            return (
              <div
                key={dateKey}
                className={`rounded-3xl border p-3.5 sm:p-5 space-y-3 ${
                  isToday
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-900/70 border-slate-800/90'
                }`}
              >
                {/* Date Group Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-black text-white">
                      {sample.activeDateLabel}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{dateKey}</span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider">
                        {UI_TEXT.todayBadge[lang]}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {dayEvents.length}{' '}
                    {lang === 'ko'
                      ? '건의 일정'
                      : lang === 'ja'
                        ? '件の予定'
                        : lang === 'zh'
                          ? '项日程'
                          : 'events'}
                  </span>
                </div>

                {/* Day's Events */}
                <div className="space-y-2.5">{dayEvents.map((ev) => renderEventRow(ev))}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

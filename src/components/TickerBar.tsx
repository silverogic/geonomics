import React, { useRef, useState, useEffect, useMemo } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import type { ExchangeRates, BaseCurrency, Language, InterestRateInfo, CountryMeta } from '../types/economics'
import { translations } from '../i18n/translations'
import { getConversionRate, getPreviousConversionRate, getFxChangePct } from '../services/exchangeApi'
import { fetchLiveFxQuotes, type LiveFxQuote } from '../services/liveFxApi'
import { getFxRateColorClass, getFxBadgeColorClass, formatFxChangeBadgeText } from '../utils/formatters'
import { detectVisitorCountry } from '../utils/locale'
import { CountryFlag } from './CountryFlag'

interface TickerBarProps {
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  baseCurrency: BaseCurrency
  lang: Language
}

interface ReelItem {
  currency: string
  flagIso2: string
  displayName: string
  multiplier: number
  rate: number
  changePct?: number | null
  prevClose?: number | null
  centralBankName?: string
  policyRatePct?: number | null
  policyRateDate?: string
}

const TARGET_CURRENCY_I18N: Record<string, Partial<Record<Language, string>>> = {
  USD: { ko: '1달러', ja: '1ドル', zh: '1美元', es: '1 USD', en: '1 USD' },
  EUR: { ko: '1유로', ja: '1ユーロ', zh: '1欧元', es: '1 EUR', en: '1 EUR' },
  JPY: { ko: '100엔', ja: '100円', zh: '100日元', es: '100 JPY', en: '100 JPY' },
  CNY: { ko: '1위안', ja: '1元', zh: '1元', es: '1 CNY', en: '1 CNY' },
  GBP: { ko: '1파운드', ja: '1ポンド', zh: '1英镑', es: '1 GBP', en: '1 GBP' },
  KRW: { ko: '1,000원', ja: '1,000ウォン', zh: '1,000韩元', es: '1.000 KRW', en: '1,000 KRW' },
  CHF: { ko: '1프랑', ja: '1フラン', zh: '1瑞郎', es: '1 CHF', en: '1 CHF' },
  AUD: { ko: '1호주달러', ja: '1豪ドル', zh: '1澳元', es: '1 AUD', en: '1 AUD' },
}

const BASE_SLOT_CURRENCIES = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'CHF', 'AUD'] as const

const EXCLUDED_VISITOR_COUNTRY_IDS = new Set([
  'JPN', // Japan
  'CHN', // China
  'GBR', // United Kingdom
  'KOR', // South Korea
  'CHE', // Switzerland
  'AUS', // Australia
  'USA', // United States
])

function getLocalizedTargetCurrencyName(currency: string, lang: Language, multiplier = 1): string {
  const i18n = TARGET_CURRENCY_I18N[currency]
  if (i18n && i18n[lang]) return i18n[lang]!
  const formattedUnit =
    multiplier === 1000
      ? lang === 'es'
        ? '1.000'
        : '1,000'
      : String(multiplier)
  return `${formattedUnit} ${currency}`
}

function formatLocalizedFxRate(rate: number, baseCurrency: BaseCurrency, lang: Language): string {
  const digits = 2
  const formattedNum =
    !rate || isNaN(rate)
      ? '0.00'
      : rate.toLocaleString(undefined, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })

  if (lang === 'ko') {
    switch (baseCurrency) {
      case 'KRW': return `${formattedNum}원`
      case 'USD': return `${formattedNum}달러`
      case 'JPY': return `${formattedNum}엔`
      case 'EUR': return `${formattedNum}유로`
      case 'GBP': return `${formattedNum}파운드`
      case 'CNY': return `${formattedNum}위안`
      case 'CHF': return `${formattedNum}프랑`
      case 'AUD': return `${formattedNum}호주달러`
      default: return `${formattedNum} ${baseCurrency}`
    }
  }

  if (lang === 'ja') {
    switch (baseCurrency) {
      case 'JPY': return `${formattedNum}円`
      case 'KRW': return `${formattedNum}ウォン`
      case 'USD': return `${formattedNum}ドル`
      case 'EUR': return `${formattedNum}ユーロ`
      case 'GBP': return `${formattedNum}ポンド`
      case 'CNY': return `${formattedNum}元`
      default: return `${formattedNum} ${baseCurrency}`
    }
  }

  if (lang === 'zh') {
    switch (baseCurrency) {
      case 'CNY': return `${formattedNum}元`
      case 'KRW': return `${formattedNum}韩元`
      case 'USD': return `${formattedNum}美元`
      case 'JPY': return `${formattedNum}日元`
      case 'EUR': return `${formattedNum}欧元`
      case 'GBP': return `${formattedNum}英镑`
      default: return `${formattedNum} ${baseCurrency}`
    }
  }

  if (lang === 'en') {
    switch (baseCurrency) {
      case 'USD': return `$${formattedNum}`
      case 'EUR': return `€${formattedNum}`
      case 'GBP': return `£${formattedNum}`
      case 'JPY': return `¥${formattedNum}`
      case 'CNY': return `¥${formattedNum}`
      case 'AUD': return `A$${formattedNum}`
      default: return `${formattedNum} ${baseCurrency}`
    }
  }

  return `${formattedNum} ${baseCurrency}`
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: 'US',
  EUR: 'EU',
  KRW: 'KR',
  JPY: 'JP',
  GBP: 'GB',
  CNY: 'CN',
  CHF: 'CH',
  AUD: 'AU',
}

const CURRENCY_CB_CODES: Record<string, string> = {
  USD: 'US',
  EUR: 'XM',
  KRW: 'KR',
  JPY: 'JP',
  GBP: 'GB',
  CNY: 'CN',
  CHF: 'CH',
  AUD: 'AU',
}

export const TickerBar: React.FC<TickerBarProps> = ({
  exchangeRates,
  interestRates,
  baseCurrency,
  lang,
}) => {
  const t = translations[lang]
  const [liveFxQuotes, setLiveFxQuotes] = useState<Record<string, LiveFxQuote>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Detect visitor's physical country and append its currency at the end of the slot if not already included
  const extraVisitorCountry: CountryMeta | null = useMemo(() => {
    const detected = detectVisitorCountry()
    if (!detected) return null
    if (EXCLUDED_VISITOR_COUNTRY_IDS.has(detected.id)) return null
    if ((BASE_SLOT_CURRENCIES as readonly string[]).includes(detected.currencyCode)) return null
    return detected
  }, [])

  // Key currency codes to display in slot carousel
  const keyCurrencies = useMemo(() => {
    const list: string[] = BASE_SLOT_CURRENCIES.filter((c) => c !== baseCurrency)
    if (
      extraVisitorCountry &&
      extraVisitorCountry.currencyCode !== baseCurrency &&
      !list.includes(extraVisitorCountry.currencyCode)
    ) {
      list.push(extraVisitorCountry.currencyCode)
    }
    return list
  }, [baseCurrency, extraVisitorCountry])

  // Fetch near-real-time quotes via Cloudflare Worker proxy
  useEffect(() => {
    let isMounted = true

    const loadQuotes = (force = false) => {
      fetchLiveFxQuotes(baseCurrency, keyCurrencies, force).then((quotes) => {
        if (isMounted && Object.keys(quotes).length > 0) {
          setLiveFxQuotes((prev) => ({ ...prev, ...quotes }))
        }
      })
    }

    loadQuotes(false)
    const interval = setInterval(() => loadQuotes(true), 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [baseCurrency, keyCurrencies])

  // Build unified 3-reel items: [Currency & Flag] - [Rate & 24h Change] - [Policy Rate]
  const reelItems: ReelItem[] = useMemo(() => {
    if (!exchangeRates) return []

    return keyCurrencies.map((curr) => {
      const isJpy = curr === 'JPY'
      const isKrw = curr === 'KRW'
      const usdPerUnit = exchangeRates.rates[curr] || 1
      const multiplier = isJpy
        ? 100
        : isKrw
          ? 1000
          : usdPerUnit >= 500
            ? 1000
            : usdPerUnit >= 80
              ? 100
              : 1
      const liveQuote = liveFxQuotes[curr]
      const rate =
        liveQuote?.price && typeof liveQuote.price === 'number'
          ? liveQuote.price * multiplier
          : getConversionRate(exchangeRates, curr, baseCurrency) * multiplier

      const fallbackPrevRate = getPreviousConversionRate(exchangeRates, curr, baseCurrency)
      const fallbackChangePct = getFxChangePct(exchangeRates, curr, baseCurrency)

      const isExtraVisitorCurr = extraVisitorCountry?.currencyCode === curr
      const cbCode = CURRENCY_CB_CODES[curr] || (isExtraVisitorCurr ? extraVisitorCountry.iso2 : curr)
      const cbInfo = interestRates?.[cbCode]

      return {
        currency: curr,
        flagIso2: CURRENCY_FLAGS[curr] || (isExtraVisitorCurr ? extraVisitorCountry.iso2 : curr.slice(0, 2)),
        displayName: getLocalizedTargetCurrencyName(curr, lang, multiplier),
        multiplier,
        rate,
        changePct: liveQuote?.changePct ?? fallbackChangePct,
        prevClose: liveQuote?.prevClose
          ? liveQuote.prevClose * multiplier
          : fallbackPrevRate
            ? fallbackPrevRate * multiplier
            : undefined,
        centralBankName: cbInfo?.centralBankName,
        policyRatePct: cbInfo?.ratePct,
        policyRateDate: cbInfo?.date,
      }
    })
  }, [exchangeRates, interestRates, baseCurrency, keyCurrencies, liveFxQuotes, lang, extraVisitorCountry])

  // Reset index when items change
  useEffect(() => {
    setCurrentIndex(0)
  }, [baseCurrency])

  // Auto-roll every 3.5 seconds like a slot machine reel
  useEffect(() => {
    if (isPaused || isPopoverOpen || reelItems.length <= 1) return

    const timer = setInterval(() => {
      if (!document.hidden) {
        setCurrentIndex((prev) => (prev + 1) % reelItems.length)
      }
    }, 3500)

    return () => clearInterval(timer)
  }, [isPaused, isPopoverOpen, reelItems.length])

  // Dismiss popover on outside click or Escape key
  useEffect(() => {
    if (!isPopoverOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPopoverOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPopoverOpen])

  if (!exchangeRates || reelItems.length === 0) return null

  // Look for the latest quote timestamp if available
  const latestQuoteEpoch = Object.values(liveFxQuotes).reduce<number | null>((acc, q) => {
    if (typeof q.time === 'number') {
      return acc === null ? q.time : Math.max(acc, q.time)
    }
    return acc
  }, null)

  const liveTooltipText = latestQuoteEpoch
    ? `${t.asOf}: ${new Date(latestQuoteEpoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : `${t.asOf}: ${exchangeRates.timeLastUpdateUtc.replace('00:00:00', '').trim()}`

  return (
    <div ref={popoverRef} className="relative flex items-center shrink-0">
      {/* 777 3-Reel Slot Machine Capsule (Compact Minimal Pill) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className="h-9 flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl px-2 sm:px-2.5 text-xs font-medium transition-all select-none shadow-sm cursor-pointer group"
        title={t.tickerPopoverTooltip}
      >
        {/* Vertical Rolling Slot Reel Window */}
        <div className="h-7 overflow-hidden relative w-[130px] sm:w-[230px] lg:w-[245px]">
          <div
            className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col"
            style={{ transform: `translateY(-${(currentIndex * 100) / reelItems.length}%)` }}
          >
            {reelItems.map((item) => (
              <div
                key={item.currency}
                className="h-7 flex items-center justify-between gap-1 sm:gap-2 shrink-0 px-0.5"
              >
                {/* Reel 1: Flag & Currency */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
                  <CountryFlag
                    iso2={item.flagIso2}
                    className="w-3.5 h-2.5 sm:w-4 sm:h-3 rounded-[2px] shadow-sm shrink-0"
                  />
                  <span className="font-bold text-slate-100 text-xs sm:text-sm whitespace-nowrap">
                    {item.displayName}
                  </span>
                </div>

                <span className="text-slate-600 text-xs shrink-0 hidden sm:inline">→</span>

                {/* Reel 2: Live FX Rate & 24h Change */}
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${getFxRateColorClass(
                      item.changePct
                    )}`}
                  >
                    {formatLocalizedFxRate(item.rate, baseCurrency, lang)}
                  </span>
                  {item.changePct != null && (
                    <span
                      title={
                        item.prevClose
                          ? `${t.prevClose}: ${formatLocalizedFxRate(item.prevClose, baseCurrency, lang)}`
                          : undefined
                      }
                      className={`hidden sm:inline-flex items-center text-[10px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap ${getFxBadgeColorClass(
                        item.changePct
                      )}`}
                    >
                      {formatFxChangeBadgeText(item.changePct)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 opacity-70 transition-transform duration-200 ${
            isPopoverOpen ? 'rotate-180 text-indigo-400 opacity-100' : ''
          }`}
        />

        {/* Live Indicator Dot */}
        <span
          title={liveTooltipText}
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 cursor-help ml-0.5"
        />
      </div>

      {/* Full View Glassmorphic Popover Modal (Fixed full-width with safe margins on mobile, right-aligned on desktop) */}
      {isPopoverOpen && (
        <div
          className="fixed left-3 right-3 top-[68px] w-auto sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[460px] max-w-[480px] mx-auto sm:mx-0 bg-slate-900/98 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {t.tickerTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {t.baseCurrencyLabel}{' '}
              <strong className="text-white">{baseCurrency}</strong>
            </span>
          </div>

          <div className="space-y-1 max-h-[340px] overflow-y-auto [scrollbar-width:thin]">
            {reelItems.map((item, idx) => (
              <button
                key={item.currency}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx)
                  setIsPopoverOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                {/* Left: Flag & Currency */}
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
                  <CountryFlag iso2={item.flagIso2} className="w-4 h-3 rounded shadow-sm shrink-0" />
                  <span className="font-bold text-slate-200 whitespace-nowrap">
                    {item.displayName}
                    <span className="text-[10px] text-slate-400 ml-1 font-normal font-mono">({item.currency})</span>
                  </span>
                </div>

                {/* Center: Rate & Change */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`font-mono font-semibold whitespace-nowrap ${getFxRateColorClass(
                      item.changePct
                    )}`}
                  >
                    {formatLocalizedFxRate(item.rate, baseCurrency, lang)}
                  </span>
                  {item.changePct != null && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 rounded whitespace-nowrap ${getFxBadgeColorClass(
                        item.changePct
                      )}`}
                    >
                      {formatFxChangeBadgeText(item.changePct)}
                    </span>
                  )}
                </div>

                {/* Right: Policy Rate */}
                {item.centralBankName && item.policyRatePct != null ? (
                  <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-indigo-300 shrink-0 whitespace-nowrap">
                    <span className="text-slate-500 text-[9px] sm:text-[10px] hidden xs:inline sm:inline">
                      {item.centralBankName}
                    </span>
                    <span className="font-bold">{item.policyRatePct.toFixed(2)}%</span>
                  </div>
                ) : (
                  <span className="text-slate-600 text-[10px] shrink-0">-</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

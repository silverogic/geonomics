import React, { useRef, useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronLeft, ChevronDown, Sparkles } from 'lucide-react'
import type { ExchangeRates, BaseCurrency, Language, InterestRateInfo } from '../types/economics'
import { getConversionRate } from '../services/exchangeApi'
import { fetchLiveFxQuotes, type LiveFxQuote } from '../services/liveFxApi'
import { formatExchangeRate } from '../utils/formatters'
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
  const [liveFxQuotes, setLiveFxQuotes] = useState<Record<string, LiveFxQuote>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Key currency codes to display in slot carousel
  const keyCurrencies = useMemo(
    () => ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'CHF', 'AUD'].filter((c) => c !== baseCurrency),
    [baseCurrency]
  )

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
      const multiplier = isJpy ? 100 : 1
      const liveQuote = liveFxQuotes[curr]
      const rate =
        liveQuote?.price && typeof liveQuote.price === 'number'
          ? liveQuote.price * multiplier
          : getConversionRate(exchangeRates, curr, baseCurrency) * multiplier

      const cbCode = CURRENCY_CB_CODES[curr] || curr
      const cbInfo = interestRates?.[cbCode]

      return {
        currency: curr,
        flagIso2: CURRENCY_FLAGS[curr] || curr.slice(0, 2),
        displayName: isJpy ? '100 JPY' : `1 ${curr}`,
        multiplier,
        rate,
        changePct: liveQuote?.changePct,
        prevClose: liveQuote?.prevClose ? liveQuote.prevClose * multiplier : undefined,
        centralBankName: cbInfo?.centralBankName,
        policyRatePct: cbInfo?.ratePct,
        policyRateDate: cbInfo?.date,
      }
    })
  }, [exchangeRates, interestRates, baseCurrency, keyCurrencies, liveFxQuotes])

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
    ? `${lang === 'ko' ? '기준' : 'As of'}: ${new Date(latestQuoteEpoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : `${lang === 'ko' ? '기준' : 'As of'}: ${exchangeRates.timeLastUpdateUtc.replace('00:00:00', '').trim()}`

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + reelItems.length) % reelItems.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % reelItems.length)
  }

  return (
    <div className="relative flex items-center">
      {/* 777 3-Reel Slot Machine Capsule */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl px-2 py-1 text-xs font-medium transition-all select-none shadow-sm group"
      >
        {/* Prev Button */}
        <button
          type="button"
          onClick={handlePrev}
          title="Previous currency"
          className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Vertical Rolling Slot Reel Window */}
        <div
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          className="h-7 sm:h-8 overflow-hidden relative cursor-pointer min-w-[160px] sm:min-w-[230px] md:min-w-[280px] lg:min-w-[340px]"
          title={lang === 'ko' ? '클릭 시 7개 통화 전체 보기' : 'Click to view all rates'}
        >
          <div
            className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col"
            style={{ transform: `translateY(-${(currentIndex * 100) / reelItems.length}%)` }}
          >
            {reelItems.map((item) => (
              <div
                key={item.currency}
                className="h-7 sm:h-8 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 px-0.5"
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
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
                    {formatExchangeRate(item.rate, item.currency === 'JPY' ? 2 : 2)} {baseCurrency}
                  </span>
                  {item.changePct != null && (
                    <span
                      title={
                        item.prevClose
                          ? `${lang === 'ko' ? '전일 종가' : 'Prev Close'}: ${item.prevClose.toLocaleString()} ${baseCurrency}`
                          : undefined
                      }
                      className={`inline-flex items-center text-[10px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap ${
                        item.changePct > 0
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : item.changePct < 0
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : 'text-slate-400 bg-slate-800/40 border border-slate-700/40'
                      }`}
                    >
                      {item.changePct > 0
                        ? `▲ +${item.changePct.toFixed(2)}%`
                        : item.changePct < 0
                          ? `▼ ${item.changePct.toFixed(2)}%`
                          : '0.00%'}
                    </span>
                  )}
                </div>

                {/* Reel 3: Central Bank Policy Rate */}
                {item.centralBankName && item.policyRatePct != null && (
                  <div
                    className="hidden lg:flex items-center gap-1 pl-1.5 border-l border-slate-700/60 shrink-0 text-slate-300"
                    title={`${item.centralBankName} (${item.policyRateDate || 'Latest'})`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {item.centralBankName}:
                    </span>
                    <span className="font-mono font-bold text-indigo-400 text-xs whitespace-nowrap">
                      {item.policyRatePct.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Counter & Toggle */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-[10px] font-mono text-slate-500 font-semibold px-0.5 hidden xl:inline">
            {currentIndex + 1}/{reelItems.length}
          </span>
          <button
            type="button"
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            title={lang === 'ko' ? '전체 보기' : 'View all'}
            className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0 cursor-pointer"
          >
            <ChevronDown
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${
                isPopoverOpen ? 'rotate-180 text-indigo-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          title="Next currency"
          className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Live Indicator Dot */}
        <span
          title={liveTooltipText}
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 cursor-help ml-0.5"
        />
      </div>

      {/* Full View Glassmorphic Popover Modal */}
      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-[92vw] sm:w-[460px] max-w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {lang === 'ko' ? '주요 통화 환율 & 기준금리 요약' : 'Key FX Rates & Policy Rates'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Base: <strong className="text-white">{baseCurrency}</strong>
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                {/* Left: Flag & Currency */}
                <div className="flex items-center gap-2 min-w-0">
                  <CountryFlag iso2={item.flagIso2} className="w-4 h-3 rounded shadow-sm shrink-0" />
                  <span className="font-bold text-slate-200">{item.displayName}</span>
                </div>

                {/* Center: Rate & Change */}
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-emerald-400">
                    {formatExchangeRate(item.rate, item.currency === 'JPY' ? 2 : 2)} {baseCurrency}
                  </span>
                  {item.changePct != null && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        item.changePct > 0
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : item.changePct < 0
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-slate-400 bg-slate-800/50'
                      }`}
                    >
                      {item.changePct > 0 ? `+${item.changePct.toFixed(2)}%` : `${item.changePct.toFixed(2)}%`}
                    </span>
                  )}
                </div>

                {/* Right: Policy Rate */}
                {item.centralBankName && item.policyRatePct != null ? (
                  <div className="flex items-center gap-1 font-mono text-[11px] text-indigo-300">
                    <span className="text-slate-500 text-[10px]">{item.centralBankName}</span>
                    <span className="font-bold">{item.policyRatePct.toFixed(2)}%</span>
                  </div>
                ) : (
                  <span className="text-slate-600 text-[10px]">-</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

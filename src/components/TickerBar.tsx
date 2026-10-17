import React, { useRef, useState, useEffect, useCallback } from 'react'
import { TrendingUp, Clock, ChevronRight, ChevronLeft } from 'lucide-react'
import type { ExchangeRates, BaseCurrency, Language, InterestRateInfo } from '../types/economics'
import { getConversionRate } from '../services/exchangeApi'
import { formatExchangeRate } from '../utils/formatters'
import { translations } from '../i18n/translations'

interface TickerBarProps {
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  baseCurrency: BaseCurrency
  lang: Language
}

export const TickerBar: React.FC<TickerBarProps> = ({
  exchangeRates,
  interestRates,
  baseCurrency,
  lang,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const scrollDirRef = useRef<'left' | 'right' | null>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollBounds = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(maxScroll - el.scrollLeft > 2)
  }, [])

  const stopAutoScroll = useCallback(() => {
    scrollDirRef.current = null
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const startAutoScroll = useCallback(
    (dir: 'left' | 'right') => {
      scrollDirRef.current = dir
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

      const step = () => {
        const el = scrollRef.current
        if (!el || !scrollDirRef.current) return
        const speed = 4.5
        el.scrollLeft += scrollDirRef.current === 'right' ? speed : -speed
        updateScrollBounds()

        const maxScroll = el.scrollWidth - el.clientWidth
        if (
          (scrollDirRef.current === 'right' && el.scrollLeft >= maxScroll - 1) ||
          (scrollDirRef.current === 'left' && el.scrollLeft <= 1)
        ) {
          stopAutoScroll()
          return
        }
        rafRef.current = requestAnimationFrame(step)
      }

      rafRef.current = requestAnimationFrame(step)
    },
    [stopAutoScroll, updateScrollBounds]
  )

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollBounds()

    const ro = new ResizeObserver(() => updateScrollBounds())
    ro.observe(el)
    window.addEventListener('resize', updateScrollBounds)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateScrollBounds)
      stopAutoScroll()
    }
  }, [exchangeRates, interestRates, baseCurrency, lang, updateScrollBounds, stopAutoScroll])

  if (!exchangeRates) return null

  const t = translations[lang]

  // Key currency codes to display in top ticker bar
  const keyCurrencies = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'CHF', 'AUD'].filter((c) => c !== baseCurrency)
  const keyRateCodes = ['US', 'KR', 'XM', 'JP', 'GB', 'CH', 'AU']

  return (
    <div className="relative bg-slate-900 border-b border-slate-800/80 text-xs text-slate-300">
      {/* Left Hover Auto-Scroll Zone */}
      {canScrollLeft && (
        <div
          onMouseEnter={() => startAutoScroll('left')}
          onMouseLeave={stopAutoScroll}
          aria-hidden="true"
          className="hidden sm:flex items-center justify-start pl-1.5 absolute inset-y-0 left-0 w-14 z-20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent cursor-w-resize transition-opacity"
        >
          <div className="w-5 h-5 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-indigo-400 shadow-md">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Right Hover Auto-Scroll Zone */}
      {canScrollRight && (
        <div
          onMouseEnter={() => startAutoScroll('right')}
          onMouseLeave={stopAutoScroll}
          aria-hidden="true"
          className="hidden sm:flex items-center justify-end pr-1.5 absolute inset-y-0 right-0 w-16 z-20 bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent cursor-e-resize transition-opacity"
        >
          <div className="w-5 h-5 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-indigo-400 shadow-md animate-pulse">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Scrollable Ticker Container (Scrollbar Hidden) */}
      <div
        ref={scrollRef}
        onScroll={updateScrollBounds}
        className="py-2.5 px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6 min-w-max">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider shrink-0">
              <TrendingUp className="w-4 h-4" />
              <span>{t.tickerTitle}</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {keyCurrencies.map((curr) => {
                const isJpy = curr === 'JPY'
                const multiplier = isJpy ? 100 : 1
                const rate = getConversionRate(exchangeRates, curr, baseCurrency) * multiplier

                return (
                  <div
                    key={curr}
                    className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <span className="font-bold text-slate-200">
                      {isJpy ? '100 JPY' : `1 ${curr}`}
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {formatExchangeRate(rate, isJpy ? 2 : 2)} {baseCurrency}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Key Central Bank Policy Rates */}
            {interestRates && (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  {t.cardInterestRate}:
                </span>
                <div className="flex items-center gap-2">
                  {keyRateCodes.map((code) => {
                    const info = interestRates[code]
                    if (!info) return null
                    return (
                      <div
                        key={code}
                        className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-lg hover:border-slate-700 transition-colors"
                        title={`${info.centralBankName} (${info.date || 'Latest'})`}
                      >
                        <span className="font-semibold text-slate-300">{info.centralBankName}</span>
                        <span className="font-mono font-bold text-indigo-400">{info.ratePct.toFixed(2)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.liveBadge || 'LIVE'}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{t.asOf} {exchangeRates.timeLastUpdateUtc.replace('00:00:00', '').trim()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

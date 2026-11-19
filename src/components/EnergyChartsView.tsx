import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Flame, RefreshCw, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { BaseCurrency, Language } from '../types/economics'
import { translations } from '../i18n/translations'
import {
  ENERGY_BENCHMARKS,
  fetchAllEnergySnapshots,
  fetchEnergyChart,
  type EnergyChartData,
  type EnergyChartRange,
} from '../services/energyApi'
import { Spinner } from './Spinner'

interface EnergyChartsViewProps {
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  refreshKey?: number
}

const RANGE_OPTIONS: Array<{ id: EnergyChartRange; labels: Record<Language, string> }> = [
  { id: '1d', labels: { ko: '1일', en: '1D', ja: '1日', es: '1D', zh: '1天', hi: '1D' } },
  { id: '1mo', labels: { ko: '1개월', en: '1M', ja: '1ヶ月', es: '1M', zh: '1月', hi: '1M' } },
  { id: '1y', labels: { ko: '1년', en: '1Y', ja: '1年', es: '1A', zh: '1年', hi: '1Y' } },
]

function formatChartTimestamp(epochSec: number, range: EnergyChartRange, lang: Language): string {
  const d = new Date(epochSec * 1000)
  const locale =
    lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US'
  if (range === '1d') {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: range === '1y' ? '2-digit' : undefined })
}

export const EnergyChartsView: React.FC<EnergyChartsViewProps> = ({
  baseCurrency,
  usdToBase,
  lang,
  refreshKey,
}) => {
  const t = translations[lang]
  const [selectedSymbol, setSelectedSymbol] = useState<string>(ENERGY_BENCHMARKS[0].symbol)
  const [range, setRange] = useState<EnergyChartRange>('1mo')
  const [snapshots, setSnapshots] = useState<Record<string, EnergyChartData | null>>({})
  const [activeChart, setActiveChart] = useState<EnergyChartData | null>(null)
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState<boolean>(true)
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [manualTick, setManualTick] = useState(0)

  const loadSnapshots = useCallback((force = false) => {
    setIsLoadingSnapshots(true)
    fetchAllEnergySnapshots('1d', force).then((res) => {
      setSnapshots(res)
      setIsLoadingSnapshots(false)
    })
  }, [])

  useEffect(() => {
    loadSnapshots(!!refreshKey || manualTick > 0)
  }, [loadSnapshots, refreshKey, manualTick])

  useEffect(() => {
    let active = true
    setIsLoadingChart(true)
    setHoverIdx(null)
    fetchEnergyChart(selectedSymbol, range, manualTick > 0).then((data) => {
      if (!active) return
      setActiveChart(data)
      setIsLoadingChart(false)
    })
    return () => {
      active = false
    }
  }, [selectedSymbol, range, refreshKey, manualTick])

  const activeBenchmark = useMemo(
    () => ENERGY_BENCHMARKS.find((b) => b.symbol === selectedSymbol) || ENERGY_BENCHMARKS[0],
    [selectedSymbol]
  )

  const activeSnapshot = snapshots[selectedSymbol] || activeChart

  const chartStats = useMemo(() => {
    const pts = activeChart?.points || []
    if (pts.length === 0) return null
    let min = Infinity
    let max = -Infinity
    for (const p of pts) {
      if (p.close < min) min = p.close
      if (p.close > max) max = p.close
    }
    const first = pts[0].close
    const last = pts[pts.length - 1].close
    const rangeChangePct = first > 0 ? Number((((last - first) / first) * 100).toFixed(2)) : null
    return { pts, min, max, first, last, rangeChangePct }
  }, [activeChart])

  // SVG chart geometry
  const W = 820
  const H = 300
  const PAD_L = 14
  const PAD_R = 64
  const PAD_T = 20
  const PAD_B = 28
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const svgGeometry = useMemo(() => {
    if (!chartStats || chartStats.pts.length < 2) return null
    const { pts, min, max } = chartStats
    const refPrev = range === '1d' ? activeChart?.prevClose ?? null : null
    const lo = refPrev !== null ? Math.min(min, refPrev) : min
    const hi = refPrev !== null ? Math.max(max, refPrev) : max
    const span = Math.max(hi - lo, hi * 0.004 || 0.01)
    const yMin = lo - span * 0.08
    const yMax = hi + span * 0.08
    const ySpan = yMax - yMin || 1

    const coords = pts.map((p, idx) => {
      const x = PAD_L + (idx / (pts.length - 1)) * plotW
      const y = PAD_T + (1 - (p.close - yMin) / ySpan) * plotH
      return { x, y, ...p }
    })

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
    const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(PAD_T + plotH).toFixed(1)} L${coords[0].x.toFixed(1)},${(PAD_T + plotH).toFixed(1)} Z`

    const prevY =
      refPrev !== null ? PAD_T + (1 - (refPrev - yMin) / ySpan) * plotH : null

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((tFrac) => ({
      y: PAD_T + tFrac * plotH,
      val: yMax - tFrac * ySpan,
    }))

    return { coords, linePath, areaPath, prevY, yTicks }
  }, [chartStats, activeChart?.prevClose, range, plotW, plotH])

  const hoveredPoint =
    hoverIdx !== null && svgGeometry?.coords[hoverIdx] ? svgGeometry.coords[hoverIdx] : null

  const displayPrice = hoveredPoint?.close ?? activeSnapshot?.price ?? activeChart?.price ?? null
  const displayPct =
    range === '1d'
      ? activeSnapshot?.changePct ?? activeChart?.changePct ?? null
      : chartStats?.rangeChangePct ?? null

  const isUp = displayPct !== null && displayPct > 0.01
  const isDown = displayPct !== null && displayPct < -0.01

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {t.energyTitle}
            </h2>
            <p className="text-xs text-slate-400">{t.energySubtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setManualTick((n) => n + 1)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSnapshots || isLoadingChart ? 'animate-spin text-amber-400' : ''}`} />
          <span>{t.energyRefresh}</span>
        </button>
      </div>

      {/* 4 Energy Benchmark Selector Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ENERGY_BENCHMARKS.map((b) => {
          const snap = snapshots[b.symbol]
          const isSelected = b.symbol === selectedSymbol
          const pct = snap?.changePct ?? null
          const up = pct !== null && pct > 0.01
          const down = pct !== null && pct < -0.01
          const pts = snap?.points || []

          // Mini sparkline path
          let sparkPath = ''
          if (pts.length >= 2) {
            let mn = Infinity
            let mx = -Infinity
            for (const p of pts) {
              if (p.close < mn) mn = p.close
              if (p.close > mx) mx = p.close
            }
            const sp = mx - mn || 1
            sparkPath = pts
              .map((p, idx) => {
                const sx = (idx / (pts.length - 1)) * 100
                const sy = 26 - ((p.close - mn) / sp) * 22
                return `${idx === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`
              })
              .join(' ')
          }

          return (
            <button
              key={b.symbol}
              type="button"
              onClick={() => setSelectedSymbol(b.symbol)}
              className={`text-left rounded-2xl p-3.5 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-400/70 ring-1 ring-amber-400/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.accentHex }}
                    />
                    <span className="text-xs font-extrabold text-white truncate">
                      {b.names[lang]}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {b.code} · /{b.unit}
                  </div>
                </div>

                {pct !== null ? (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                      up
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : down
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {up ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : down ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">N/A</span>
                )}
              </div>

              <div className="flex items-end justify-between gap-2 mt-1">
                <div>
                  <div className="text-lg sm:text-xl font-black font-mono text-white tabular-nums leading-none">
                    {snap?.price != null ? `$${snap.price.toFixed(b.decimals)}` : 'N/A'}
                  </div>
                  {baseCurrency !== 'USD' && snap?.price != null && usdToBase > 0 && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1 tabular-nums">
                      ≈ {(snap.price * usdToBase).toLocaleString(undefined, { maximumFractionDigits: baseCurrency === 'KRW' || baseCurrency === 'JPY' ? 0 : 2 })} {baseCurrency}
                    </div>
                  )}
                </div>

                {sparkPath && (
                  <svg viewBox="0 0 100 28" className="w-16 h-7 shrink-0 overflow-visible">
                    <path
                      d={sparkPath}
                      fill="none"
                      stroke={up ? '#34d399' : down ? '#fb7185' : b.accentHex}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Interactive Time-Series Chart */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {activeBenchmark.names[lang]}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                ({activeBenchmark.symbol} · USD/{activeBenchmark.unit})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeBenchmark.subtitle[lang]}
            </p>
          </div>

          {/* 3-option Range Selector (under 4-option combobox threshold) */}
          <div className="flex items-center rounded-xl bg-slate-950/90 border border-slate-800 p-1 self-start sm:self-auto">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  range === opt.id
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {opt.labels[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Price & Hover Readout Bar */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
              {displayPrice !== null ? `$${displayPrice.toFixed(activeBenchmark.decimals)}` : 'N/A'}
            </span>
            {displayPct !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold tabular-nums ${
                  isUp
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : isDown
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isDown ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {displayPct > 0 ? `+${displayPct.toFixed(2)}%` : `${displayPct.toFixed(2)}%`}
              </span>
            )}
            {hoveredPoint && (
              <span className="text-xs font-mono text-amber-300">
                {formatChartTimestamp(hoveredPoint.time, range, lang)}
              </span>
            )}
          </div>

          {chartStats && (
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 tabular-nums">
              <span>
                H: <strong className="text-slate-200">${chartStats.max.toFixed(activeBenchmark.decimals)}</strong>
              </span>
              <span>
                L: <strong className="text-slate-200">${chartStats.min.toFixed(activeBenchmark.decimals)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* SVG Chart Area */}
        <div className="relative w-full h-[260px] sm:h-[300px]">
          {isLoadingChart && !svgGeometry ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" label={t.loadingData} />
            </div>
          ) : !svgGeometry ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              {t.energyUnavailable}
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full select-none touch-none"
              onMouseLeave={() => setHoverIdx(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const relX = ((e.clientX - rect.left) / rect.width) * W
                const clamped = Math.max(PAD_L, Math.min(PAD_L + plotW, relX))
                const idx = Math.round(((clamped - PAD_L) / plotW) * (svgGeometry.coords.length - 1))
                setHoverIdx(Math.max(0, Math.min(svgGeometry.coords.length - 1, idx)))
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                if (!touch) return
                const rect = e.currentTarget.getBoundingClientRect()
                const relX = ((touch.clientX - rect.left) / rect.width) * W
                const clamped = Math.max(PAD_L, Math.min(PAD_L + plotW, relX))
                const idx = Math.round(((clamped - PAD_L) / plotW) * (svgGeometry.coords.length - 1))
                setHoverIdx(Math.max(0, Math.min(svgGeometry.coords.length - 1, idx)))
              }}
              onTouchEnd={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id={`energyGrad-${activeBenchmark.code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeBenchmark.accentHex} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={activeBenchmark.accentHex} stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid + Right Y-Axis Labels */}
              {svgGeometry.yTicks.map((tk, i) => (
                <g key={i}>
                  <line
                    x1={PAD_L}
                    y1={tk.y}
                    x2={PAD_L + plotW}
                    y2={tk.y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={PAD_L + plotW + 8}
                    y={tk.y + 4}
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    ${tk.val.toFixed(activeBenchmark.decimals)}
                  </text>
                </g>
              ))}

              {/* Previous Close Reference Line (1D) */}
              {svgGeometry.prevY !== null && (
                <line
                  x1={PAD_L}
                  y1={svgGeometry.prevY}
                  x2={PAD_L + plotW}
                  y2={svgGeometry.prevY}
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Area & Line */}
              <path d={svgGeometry.areaPath} fill={`url(#energyGrad-${activeBenchmark.code})`} />
              <path
                d={svgGeometry.linePath}
                fill="none"
                stroke={activeBenchmark.accentHex}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hover Crosshair */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={hoveredPoint.x}
                    y1={PAD_T}
                    x2={hoveredPoint.x}
                    y2={PAD_T + plotH}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="5"
                    fill={activeBenchmark.accentHex}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Start / Mid / End X-Axis Timestamps */}
              {[0, Math.floor(svgGeometry.coords.length / 2), svgGeometry.coords.length - 1].map((idx) => {
                const c = svgGeometry.coords[idx]
                if (!c) return null
                return (
                  <text
                    key={idx}
                    x={c.x}
                    y={H - 6}
                    textAnchor={idx === 0 ? 'start' : idx === svgGeometry.coords.length - 1 ? 'end' : 'middle'}
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {formatChartTimestamp(c.time, range, lang)}
                  </text>
                )
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

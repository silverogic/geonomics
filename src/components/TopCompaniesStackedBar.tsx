import React from 'react'
import type { TopCompanyItem } from '../services/topCompaniesApi'

const SEGMENT_COLORS = [
  { bar: 'bg-amber-400', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { bar: 'bg-indigo-400', dot: 'bg-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { bar: 'bg-cyan-400', dot: 'bg-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { bar: 'bg-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { bar: 'bg-purple-400', dot: 'bg-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
]

export function getRankBadgeStyle(rank: number): string {
  return SEGMENT_COLORS[rank - 1]?.badge || 'bg-slate-800/90 text-slate-400 border-slate-700'
}

interface TopCompaniesStackedBarProps {
  companies: TopCompanyItem[]
  effectiveNationalCapUsd: number
  othersLabel: string
  concentrationLabel: string
}

export const TopCompaniesStackedBar: React.FC<TopCompaniesStackedBarProps> = ({
  companies,
  effectiveNationalCapUsd,
  othersLabel,
  concentrationLabel,
}) => {
  if (!companies.length || effectiveNationalCapUsd <= 0) return null

  const segments = companies.map((item, idx) => {
    const rawPct = (item.marketCapUsd / effectiveNationalCapUsd) * 100
    return {
      item,
      pct: Math.max(0.1, rawPct),
      color: SEGMENT_COLORS[idx] || SEGMENT_COLORS[SEGMENT_COLORS.length - 1],
    }
  })

  const top5TotalPct = Math.min(
    99.9,
    segments.reduce((sum, s) => sum + (s.item.marketCapUsd / effectiveNationalCapUsd) * 100, 0)
  )
  const othersPct = Math.max(0.1, 100 - top5TotalPct)

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-semibold">{concentrationLabel}</span>
        <span className="font-mono font-bold text-indigo-300">
          {top5TotalPct.toFixed(1)}% <span className="text-slate-500 font-normal">/ 100%</span>
        </span>
      </div>

      {/* Unified 100% National Stock Market Stacked Horizontal Bar */}
      <div className="h-2.5 w-full bg-slate-800/90 rounded-full overflow-hidden flex gap-[1px] p-[1px]">
        {segments.map(({ item, pct, color }) => (
          <div
            key={item.symbol}
            className={`h-full ${color.bar} first:rounded-l-full transition-all duration-300`}
            style={{ width: `${Math.max(1.2, pct)}%` }}
            title={`${item.rank}. ${item.name}: ${pct.toFixed(1)}%`}
          />
        ))}
        <div
          className="h-full bg-slate-700/60 rounded-r-full flex-1"
          title={`${othersLabel}: ${othersPct.toFixed(1)}%`}
        />
      </div>

      {/* Compact Color-Coded Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
        {segments.map(({ item, pct, color }) => (
          <div key={item.symbol} className="flex items-center gap-1 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
            <span className="text-slate-300 truncate max-w-[95px] font-medium">{item.name}</span>
            <span className="font-mono font-bold text-slate-200">{pct.toFixed(1)}%</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-2 h-2 rounded-full shrink-0 bg-slate-600" />
          <span className="text-slate-400">{othersLabel}</span>
          <span className="font-mono font-semibold text-slate-400">{othersPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

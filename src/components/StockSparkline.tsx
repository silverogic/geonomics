import React from 'react'
import type { StockPoint } from '../data/stockPrices'

interface StockSparklineProps {
  points: StockPoint[]
  isPositive: boolean
  width?: number
  height?: number
  className?: string
}

export const StockSparkline: React.FC<StockSparklineProps> = ({
  points,
  isPositive,
  width = 68,
  height = 24,
  className = '',
}) => {
  if (!points || points.length < 2) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center text-[10px] text-slate-600 ${className}`}
      >
        —
      </div>
    )
  }

  const closes = points.map((p) => p.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min

  const padY = 3
  const usableHeight = height - padY * 2

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = range === 0 ? height / 2 : height - padY - ((p.close - min) / range) * usableHeight
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) }
  })

  // Build SVG path strings
  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`
  }, '')

  const lastCoord = coords[coords.length - 1]
  const firstCoord = coords[0]
  const areaD = `${pathD} L ${lastCoord.x},${height} L ${firstCoord.x},${height} Z`

  const strokeColor = isPositive ? '#34d399' : '#f87171' // emerald-400 : rose-400
  const gradientId = `sparkline-grad-${isPositive ? 'pos' : 'neg'}-${width}-${height}`

  return (
    <div className={`inline-block relative overflow-hidden ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible w-full block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isPositive ? '#10b981' : '#f43f5e'}
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor={isPositive ? '#10b981' : '#f43f5e'}
              stopOpacity={0.0}
            />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Trend Polyline */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End-point Pulse Dot */}
        <circle
          cx={lastCoord.x}
          cy={lastCoord.y}
          r="2"
          fill={strokeColor}
        />
      </svg>
    </div>
  )
}

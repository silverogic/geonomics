import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { GdpYearPoint, BaseCurrency, Language } from '../types/economics'
import { formatGdpCompact, getCurrencySymbol } from '../utils/formatters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface GdpChartProps {
  countryName: string
  dataPoints: GdpYearPoint[]
  baseCurrency: BaseCurrency
  exchangeRateToBase: number // Multiplier from USD to baseCurrency
  comparisonPoints?: GdpYearPoint[]
  comparisonCountryName?: string
  lang?: Language
}

export const GdpChart: React.FC<GdpChartProps> = ({
  countryName,
  dataPoints,
  baseCurrency,
  exchangeRateToBase,
  comparisonPoints,
  comparisonCountryName,
  lang = 'en',
}) => {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-slate-800">
        {lang === 'ko' ? '시계열 데이터가 없습니다.' : 'No time-series data available.'}
      </div>
    )
  }

  const labels = dataPoints.map((p) => p.year.toString())
  const gdpValues = dataPoints.map((p) => (p.gdp * exchangeRateToBase))

  const datasets: any[] = [
    {
      label: `${countryName} (${baseCurrency})`,
      data: gdpValues,
      borderColor: '#6366f1', // Indigo
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      fill: !comparisonPoints,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    },
  ]

  if (comparisonPoints && comparisonCountryName) {
    const compValues = labels.map((yearStr) => {
      const found = comparisonPoints.find((p) => p.year.toString() === yearStr)
      return found ? found.gdp * exchangeRateToBase : null
    })

    datasets.push({
      label: `${comparisonCountryName} (${baseCurrency})`,
      data: compValues,
      borderColor: '#10b981', // Emerald
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      fill: false,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    })
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600,
          },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const rawVal = context.raw as number
            const valInUsd = rawVal / exchangeRateToBase
            const formatted = formatGdpCompact(valInUsd, baseCurrency, exchangeRateToBase, lang || 'en')
            return ` ${context.dataset.label}: ${formatted}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
          callback: (value) => {
            const num = Number(value)
            if (lang === 'ko' && baseCurrency === 'KRW') {
              const jo = num / 1e12
              return jo >= 1 ? `${jo.toFixed(0)}조` : `${(num / 1e8).toFixed(0)}억`
            }
            if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`
            if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
            return `${getCurrencySymbol(baseCurrency)}${num}`
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-72 sm:h-80 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  )
}

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
import { TrendingUp, TrendingDown, Info, ShieldAlert } from 'lucide-react'
import type { Language } from '../types/economics'
import { getStockPriceData } from '../data/stockPrices'

// Ensure ChartJS plugins are registered
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

interface StockChartProps {
  countryId: string
  lang?: Language
}

export const StockChart: React.FC<StockChartProps> = ({
  countryId,
  lang = 'en',
}) => {
  const stockData = getStockPriceData(countryId)

  if (!stockData || !stockData.isSupported || stockData.points.length === 0) {
    const fallbackReason = lang === 'ko'
      ? stockData?.fallbackReasonKo || '해당 국가는 증시 데이터가 제공되지 않거나 조회가 제한되어 있습니다.'
      : lang === 'ja'
      ? '該当国・地域は株式市場データが提供されていないか、照会が制限されています。'
      : stockData?.fallbackReasonEn || 'Stock market data is not available or restricted for this region.'

    return (
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-200">
            {lang === 'ko' ? '증시 시세 조회 제한 지역' : lang === 'ja' ? '市場データ照会制限地域' : 'Market Data Notice'}
          </h5>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {fallbackReason}
          </p>
        </div>
        <div className="pt-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            Index: {stockData?.nameEn || 'N/A'}
          </span>
        </div>
      </div>
    )
  }

  const { points, changePct, currentPrice, currency, nameKo, nameEn, ticker } = stockData
  const isPositive = changePct >= 0

  const closes = points.map((p) => p.close)
  const minPrice = Math.min(...closes)
  const maxPrice = Math.max(...closes)

  // Format short date for X-axis: "08/12"
  const labels = points.map((p) => {
    const parts = p.date.split('-')
    return parts.length >= 3 ? `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}` : p.date
  })

  const strokeColor = isPositive ? '#10b981' : '#f43f5e'
  const bgColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'

  const datasets = [
    {
      label: `${lang === 'ko' ? nameKo : nameEn} (${currency})`,
      data: closes,
      borderColor: strokeColor,
      backgroundColor: bgColor,
      fill: true,
      tension: 0.25,
      pointRadius: 2,
      pointHoverRadius: 6,
      pointBackgroundColor: strokeColor,
      borderWidth: 2,
    },
  ]

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0
            return points[idx]?.date ?? ''
          },
          label: (context) => {
            const rawVal = context.raw as number
            return ` ${context.dataset.label}: ${rawVal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${currency}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
          },
          callback: (value) => {
            const num = Number(value)
            return num >= 1000 ? num.toLocaleString() : num.toString()
          },
        },
      },
    },
  }

  const startDate = points[0]?.date
  const endDate = points[points.length - 1]?.date

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-mono font-medium text-slate-400">
              {currency}
            </span>
            <div
              className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                isPositive
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{changePct.toFixed(2)}%</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            {lang === 'ko'
              ? '최근 30거래일 등락률'
              : lang === 'ja'
              ? '直近30取引日の騰落率'
              : '30-Day Trading Trend'}{' '}
            ({startDate} ~ {endDate})
          </span>
        </div>

        {/* 30-Day High / Low Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block">
              {lang === 'ko' ? '30일 최고' : lang === 'ja' ? '30日最高' : '30D High'}
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {maxPrice.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block">
              {lang === 'ko' ? '30일 최저' : lang === 'ja' ? '30日最安' : '30D Low'}
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {minPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Chart.js Line Canvas */}
      <div className="w-full h-64 sm:h-72">
        <Line data={{ labels, datasets }} options={options} />
      </div>

      {/* Footer Info / Source Attribution */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {lang === 'ko'
              ? `야후 파이낸스(Yahoo Finance) 일별 공식 종가 데이터 (${ticker})`
              : lang === 'ja'
              ? `Yahoo Finance 公式日次終値データ (${ticker})`
              : `Yahoo Finance Official Daily Close Data (${ticker})`}
          </span>
        </div>
        <span className="font-mono text-slate-400">
          {points.length} {lang === 'ko' ? '거래일' : lang === 'ja' ? '営業日' : 'trading days'}
        </span>
      </div>
    </div>
  )
}

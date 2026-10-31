/**
 * Near-real-time stock quotes via the Geonomics Cloudflare Worker proxy.
 * Falls back silently to the static build-time data when the proxy is not configured or fails.
 */
import {
  getAllStockPrices,
  updateStockPriceData,
  type StockPriceInfo,
} from '../data/stockPrices'

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const MIN_INTERVAL_MS = 60 * 1000
const BATCH_SIZE = 100

interface LiveQuote {
  price: number
  prevClose: number | null
  changePct: number | null
  time: number | null
  gmtoffset: number
  isOpen: boolean
}

let lastFetchAt = 0
let inFlight: Promise<boolean> | null = null

export const isLiveStockEnabled = (): boolean => !!PROXY_URL

function toLocalDate(epochSec: number, gmtoffset: number): string {
  return new Date((epochSec + gmtoffset) * 1000).toISOString().split('T')[0]
}

function mergeQuote(base: StockPriceInfo, q: LiveQuote): StockPriceInfo {
  const staticPrice = base.staticPrice ?? base.currentPrice
  const points = [...base.points]
  const date = q.time ? toLocalDate(q.time, q.gmtoffset) : points[points.length - 1]?.date
  const close = q.price

  if (date && points.length > 0) {
    const last = points[points.length - 1]
    // If the last static point equals the previous close, today's candle is missing -> append.
    const lastIsPrevClose = q.prevClose != null && Math.abs(last.close - q.prevClose) / q.prevClose < 0.0001
    if (lastIsPrevClose && last.date !== date) {
      points.push({ date, close })
    } else {
      points[points.length - 1] = { date: last.date, close }
    }
  }

  const first = points[0]?.close
  const changePct30d =
    first && first > 0 ? Number((((close - first) / first) * 100).toFixed(2)) : base.changePct30d

  return {
    ...base,
    currentPrice: close,
    staticPrice,
    changePct: q.changePct ?? base.changePct,
    changePct30d,
    points,
    isLive: true,
    liveTime: q.time ?? undefined,
    isMarketOpen: q.isOpen,
  }
}

/**
 * Fetches live quotes for all supported tickers and merges them into the stock store.
 * Returns true when at least one quote was applied.
 */
export function fetchLiveStocks(force = false): Promise<boolean> {
  if (!PROXY_URL) return Promise.resolve(false)
  if (inFlight) return inFlight
  if (!force && Date.now() - lastFetchAt < MIN_INTERVAL_MS) return Promise.resolve(false)

  inFlight = (async () => {
    try {
      const all = getAllStockPrices()
      const tickerToIds = new Map<string, string[]>()
      for (const [id, info] of Object.entries(all)) {
        if (!info.isSupported || !info.ticker) continue
        const ids = tickerToIds.get(info.ticker) ?? []
        ids.push(id)
        tickerToIds.set(info.ticker, ids)
      }

      const tickers = [...tickerToIds.keys()]
      const updates: Record<string, StockPriceInfo> = {}

      for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
        const batch = tickers.slice(i, i + BATCH_SIZE)
        const res = await fetch(`${PROXY_URL}/?symbols=${encodeURIComponent(batch.join(','))}`)
        if (!res.ok) continue
        const json = (await res.json()) as { quotes?: Record<string, LiveQuote> }
        for (const [ticker, quote] of Object.entries(json.quotes ?? {})) {
          for (const id of tickerToIds.get(ticker) ?? []) {
            updates[id] = mergeQuote(all[id], quote)
          }
        }
      }

      if (Object.keys(updates).length === 0) return false
      updateStockPriceData(updates)
      lastFetchAt = Date.now()
      return true
    } catch (err) {
      console.warn('Live stock fetch failed, using static data:', err)
      return false
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

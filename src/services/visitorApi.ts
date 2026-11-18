const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const VISITED_STORAGE_KEY = 'geonomics_visitor_date'

export interface VisitorStats {
  today: number
  total: number
  date?: string
}

let cachedStats: VisitorStats | null = null
let pendingRequest: Promise<VisitorStats | null> | null = null

/**
 * Records (once per UTC day per browser) and fetches real daily/total unique visitor counts
 * via the Cloudflare Worker D1 endpoint (?visit=1 / ?visit=read).
 * Returns null silently when the proxy or D1 database is not configured.
 */
export async function fetchVisitorStats(): Promise<VisitorStats | null> {
  if (cachedStats) return cachedStats
  if (!PROXY_URL) return null
  if (pendingRequest) return pendingRequest

  pendingRequest = (async () => {
    try {
      const todayUtc = new Date().toISOString().slice(0, 10)
      let alreadyVisitedToday = false
      try {
        alreadyVisitedToday = window.localStorage.getItem(VISITED_STORAGE_KEY) === todayUtc
      } catch {
        // Ignore storage access errors in restricted modes
      }

      const mode = alreadyVisitedToday ? 'read' : '1'
      const res = await fetch(`${PROXY_URL}/?visit=${mode}`, {
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) return null

      const data = (await res.json()) as {
        configured?: boolean
        today?: number | null
        total?: number | null
        date?: string
      }

      if (!data.configured || typeof data.today !== 'number' || typeof data.total !== 'number') {
        return null
      }

      try {
        window.localStorage.setItem(VISITED_STORAGE_KEY, data.date || todayUtc)
      } catch {
        // Ignore storage write errors
      }

      cachedStats = {
        today: data.today,
        total: data.total,
        date: data.date,
      }
      return cachedStats
    } catch {
      return null
    } finally {
      pendingRequest = null
    }
  })()

  return pendingRequest
}

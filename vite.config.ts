import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEV_GOOGLE_NEWS_FEEDS: Record<string, string> = {
  ko: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko',
  en: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  ja: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ja&gl=JP&ceid=JP:ja',
  zh: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
  es: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=es-419&gl=MX&ceid=MX:es-419',
  hi: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi',
}

const DEV_GLOBAL_FEEDS = [
  'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://finance.yahoo.com/news/rssindex',
]

function decodeRssText(str: string): string {
  return (str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function breakingNewsDevPlugin(): Plugin {
  const cache = new Map<string, { ts: number; payload: string }>()
  return {
    name: 'breaking-news-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/breaking-news', async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const langParam = (url.searchParams.get('lang') || 'en').toLowerCase().slice(0, 2)
          const lang = DEV_GOOGLE_NEWS_FEEDS[langParam] ? langParam : 'en'
          const cached = cache.get(lang)
          if (cached && Date.now() - cached.ts < 60_000) {
            res.setHeader('Content-Type', 'application/json')
            res.end(cached.payload)
            return
          }

          const feedUrls = [...DEV_GLOBAL_FEEDS]
          if (DEV_GOOGLE_NEWS_FEEDS[lang] && !feedUrls.includes(DEV_GOOGLE_NEWS_FEEDS[lang])) {
            feedUrls.unshift(DEV_GOOGLE_NEWS_FEEDS[lang])
          }

          const results = await Promise.all(
            feedUrls.map(async (feedUrl) => {
              try {
                const r = await fetch(feedUrl, {
                  signal: AbortSignal.timeout(3500),
                  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsDev/1.0)' },
                })
                if (!r.ok) return []
                const xml = await r.text()
                const items: Array<{ title: string; url: string; source: string; publishedAt: string }> = []
                for (const raw of xml.split('<item>').slice(1)) {
                  const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/)
                  const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/)
                  const pubMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
                  const sourceMatch = raw.match(/<source[^>]*>([\s\S]*?)<\/source>/)
                  let title = titleMatch ? decodeRssText(titleMatch[1]) : ''
                  const link = linkMatch ? decodeRssText(linkMatch[1]) : ''
                  const pubDate = pubMatch ? decodeRssText(pubMatch[1]) : ''
                  let source = sourceMatch ? decodeRssText(sourceMatch[1]) : ''
                  if (!title || !link) continue
                  if (!source && title.includes(' - ')) {
                    const idx = title.lastIndexOf(' - ')
                    if (idx > 12) {
                      source = title.slice(idx + 3).trim()
                      title = title.slice(0, idx).trim()
                    }
                  }
                  if (!source) {
                    try {
                      source = new URL(link).hostname.replace(/^www\./, '')
                    } catch {
                      source = 'Global Wire'
                    }
                  }
                  const d = pubDate ? new Date(pubDate) : new Date()
                  items.push({
                    title,
                    url: link,
                    source,
                    publishedAt: Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(),
                  })
                }
                return items
              } catch {
                return []
              }
            })
          )

          const merged = results.flat().sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )
          const seen = new Set<string>()
          const deduped = []
          for (const item of merged) {
            const key = item.title.toLowerCase().replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥]/g, '').slice(0, 40)
            if (!key || seen.has(key)) continue
            seen.add(key)
            deduped.push(item)
            if (deduped.length >= 120) break
          }

          const payload = JSON.stringify({ fetchedAt: Math.floor(Date.now() / 1000), lang, items: deduped })
          if (deduped.length > 0) cache.set(lang, { ts: Date.now(), payload })
          res.setHeader('Content-Type', 'application/json')
          res.end(payload)
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ items: [] }))
        }
      })

      const chartCache = new Map<string, { ts: number; payload: string }>()
      const DEV_CHART_RANGES: Record<string, string> = {
        '1d': '15m',
        '5d': '1h',
        '1mo': '1d',
        '3mo': '1d',
        '6mo': '1d',
        '1y': '1d',
      }
      server.middlewares.use('/api/chart', async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const symbol = (url.searchParams.get('symbol') || '').trim()
          const range = url.searchParams.get('range') || '1mo'
          const interval = DEV_CHART_RANGES[range]
          if (!/^[A-Za-z0-9^.=\-]{1,20}$/.test(symbol) || !interval) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'invalid chart params' }))
            return
          }
          const key = `${symbol}::${range}`
          const cached = chartCache.get(key)
          if (cached && Date.now() - cached.ts < 60_000) {
            res.setHeader('Content-Type', 'application/json')
            res.end(cached.payload)
            return
          }
          const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
          const yRes = await fetch(yUrl, {
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsDev/1.0)' },
          })
          if (!yRes.ok) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'upstream error' }))
            return
          }
          const data = (await yRes.json()) as {
            chart?: {
              result?: Array<{
                meta?: {
                  currency?: string
                  regularMarketPrice?: number
                  chartPreviousClose?: number
                  currentTradingPeriod?: { regular?: { start: number; end: number } }
                }
                timestamp?: number[]
                indicators?: { quote?: Array<{ close?: Array<number | null> }> }
              }>
            }
          }
          const result = data?.chart?.result?.[0]
          const meta = result?.meta
          const timestamps = result?.timestamp || []
          const closes = result?.indicators?.quote?.[0]?.close || []
          const points: Array<{ time: number; close: number }> = []
          for (let i = 0; i < timestamps.length; i++) {
            const c = closes[i]
            if (typeof c === 'number' && Number.isFinite(c)) {
              points.push({ time: timestamps[i], close: Number(c.toFixed(4)) })
            }
          }
          const price = typeof meta?.regularMarketPrice === 'number' ? meta.regularMarketPrice : null
          const prevClose =
            typeof meta?.chartPreviousClose === 'number' ? meta.chartPreviousClose : null
          const changePct =
            price !== null && prevClose && prevClose > 0
              ? Number((((price - prevClose) / prevClose) * 100).toFixed(2))
              : null
          const now = Math.floor(Date.now() / 1000)
          const regular = meta?.currentTradingPeriod?.regular
          const isOpen = regular ? now >= regular.start && now <= regular.end : false
          const payload = JSON.stringify({
            symbol,
            range,
            currency: meta?.currency || 'USD',
            price,
            prevClose,
            changePct,
            isOpen,
            fetchedAt: now,
            points,
          })
          if (points.length > 0) chartCache.set(key, { ts: Date.now(), payload })
          res.setHeader('Content-Type', 'application/json')
          res.end(payload)
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'chart failed' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    breakingNewsDevPlugin(),
  ],
  base: './',
  server: {
    proxy: {
      '/api/imf-weo': {
        target: 'https://www.imf.org',
        changeOrigin: true,
        rewrite: () =>
          '/external/datamapper/api/v1/NGDPD/NGDPDPC/NGDP_RPCH/GGXWDG_NGDP/PCPIPCH',
      },
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})

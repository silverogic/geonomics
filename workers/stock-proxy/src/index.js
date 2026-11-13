/**
 * Geonomics Stock Proxy (Cloudflare Worker)
 *
 * GET /?symbols=%5EKS11,%5EGSPC,...
 * Returns near-real-time quotes from Yahoo Finance chart endpoint with CORS headers.
 * Responses are edge-cached for CACHE_SECONDS to stay within free-tier limits.
 */

const CACHE_SECONDS = 60
const NEWS_CACHE_SECONDS = 120
const MAX_SYMBOLS = 120
const CONCURRENCY = 12
const SYMBOL_PATTERN = /^[A-Za-z0-9^.=\-]{1,20}$/

const GOOGLE_NEWS_FEEDS = {
  ko: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko',
  en: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  ja: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ja&gl=JP&ceid=JP:ja',
  zh: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
  es: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=es-419&gl=MX&ceid=MX:es-419',
  hi: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi',
}

const GLOBAL_WIRE_FEEDS = [
  'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://finance.yahoo.com/news/rssindex',
]

function decodeRssText(str) {
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

function parseRssItems(xml) {
  const rawItems = (xml || '').split('<item>').slice(1)
  const items = []
  for (const raw of rawItems) {
    const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/)
    const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/)
    const pubMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
    const sourceMatch = raw.match(/<source[^>]*>([\s\S]*?)<\/source>/)

    let title = titleMatch ? decodeRssText(titleMatch[1]) : ''
    const url = linkMatch ? decodeRssText(linkMatch[1]) : ''
    const pubDate = pubMatch ? decodeRssText(pubMatch[1]) : ''
    let source = sourceMatch ? decodeRssText(sourceMatch[1]) : ''

    if (!title || !url) continue
    if (!source && title.includes(' - ')) {
      const idx = title.lastIndexOf(' - ')
      if (idx > 12) {
        source = title.slice(idx + 3).trim()
        title = title.slice(0, idx).trim()
      }
    }
    if (!source) {
      try {
        source = new URL(url).hostname.replace(/^www\./, '')
      } catch {
        source = 'Global Wire'
      }
    }

    const parsedDate = pubDate ? new Date(pubDate) : new Date()
    const publishedAt = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString()

    items.push({ title, url, source, publishedAt })
  }
  return items
}

async function fetchBreakingNewsPool(lang) {
  const feedUrls = [...GLOBAL_WIRE_FEEDS]
  const regionalFeed = GOOGLE_NEWS_FEEDS[lang]
  if (regionalFeed && !feedUrls.includes(regionalFeed)) {
    feedUrls.unshift(regionalFeed)
  }

  const results = await Promise.all(
    feedUrls.map(async (feedUrl) => {
      try {
        const res = await fetch(feedUrl, {
          signal: AbortSignal.timeout(3500),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsProxy/1.0)' },
        })
        if (!res.ok) return []
        const xml = await res.text()
        return parseRssItems(xml)
      } catch {
        return []
      }
    })
  )

  const merged = results.flat()
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const seen = new Set()
  const deduped = []
  for (const item of merged) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥]/g, '').slice(0, 40)
    if (!key || seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= 120) break
  }
  return deduped
}

function getAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin') || ''
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0) return '*'
  if (allowed.includes(origin)) return origin
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return origin
  return null
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

async function fetchQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsProxy/1.0)' } })
    if (!res.ok) return null
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null

    const price = meta.regularMarketPrice
    const prevClose = typeof meta.chartPreviousClose === 'number' ? meta.chartPreviousClose : null
    const changePct = prevClose && prevClose > 0 ? Number((((price - prevClose) / prevClose) * 100).toFixed(2)) : null

    const now = Math.floor(Date.now() / 1000)
    const regular = meta.currentTradingPeriod?.regular
    const isOpen = regular ? now >= regular.start && now <= regular.end : false

    const decimals = price < 1 ? 6 : price < 10 ? 4 : 2
    return {
      price: typeof price === 'number' ? Number(price.toFixed(decimals)) : price,
      prevClose,
      changePct,
      time: meta.regularMarketTime || null,
      gmtoffset: typeof meta.gmtoffset === 'number' ? meta.gmtoffset : 0,
      currency: meta.currency || null,
      isOpen,
    }
  } catch {
    return null
  }
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}

export default {
  async fetch(request, env, ctx) {
    const origin = getAllowedOrigin(request, env)
    if (!origin) return new Response('Forbidden', { status: 403 })

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(origin) })
    }

    const url = new URL(request.url)

    // Breaking Economic News RSS Aggregator endpoint: ?news=breaking&lang=ko
    if (url.searchParams.get('news') === 'breaking') {
      const langParam = (url.searchParams.get('lang') || 'en').toLowerCase().slice(0, 2)
      const lang = GOOGLE_NEWS_FEEDS[langParam] ? langParam : 'en'
      const newsCacheKey = new Request(`${url.origin}/?news=breaking&lang=${lang}`)
      const cache = caches.default
      const cachedNews = await cache.match(newsCacheKey)
      if (cachedNews) {
        const hit = new Response(cachedNews.body, cachedNews)
        Object.entries(corsHeaders(origin)).forEach(([k, v]) => hit.headers.set(k, v))
        return hit
      }

      const items = await fetchBreakingNewsPool(lang)
      const newsResponse = new Response(
        JSON.stringify({ fetchedAt: Math.floor(Date.now() / 1000), lang, items }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${NEWS_CACHE_SECONDS}`,
          },
        }
      )
      if (items.length > 0) {
        ctx.waitUntil(cache.put(newsCacheKey, newsResponse.clone()))
      }
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => newsResponse.headers.set(k, v))
      return newsResponse
    }

    // IMF World Economic Outlook (WEO) DataMapper proxy endpoint: ?imf=weo or /imf-weo
    if (url.searchParams.get('imf') === 'weo' || url.pathname.endsWith('/imf-weo')) {
      const imfCacheKey = new Request(`${url.origin}/?imf=weo`)
      const cache = caches.default
      const cachedImf = await cache.match(imfCacheKey)
      if (cachedImf) {
        const hit = new Response(cachedImf.body, cachedImf)
        Object.entries(corsHeaders(origin)).forEach(([k, v]) => hit.headers.set(k, v))
        return hit
      }

      const imfUrl =
        'https://www.imf.org/external/datamapper/api/v1/NGDPD/NGDPDPC/NGDP_RPCH/GGXWDG_NGDP/PCPIPCH'
      try {
        const imfRes = await fetch(imfUrl, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsProxy/1.0)',
          },
        })
        if (imfRes.ok) {
          const imfText = await imfRes.text()
          const cacheable = new Response(imfText, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=86400',
            },
          })
          ctx.waitUntil(cache.put(imfCacheKey, cacheable.clone()))
          Object.entries(corsHeaders(origin)).forEach(([k, v]) => cacheable.headers.set(k, v))
          return cacheable
        }
      } catch {
        // Fall through on error
      }
      return new Response(JSON.stringify({ error: 'IMF WEO upstream unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Optional live Economic Calendar proxy endpoint: ?calendar=US&from=...&to=...
    const calendarCountries = url.searchParams.get('calendar')
    if (calendarCountries && /^[A-Z,]{2,30}$/.test(calendarCountries)) {
      const fromIso = url.searchParams.get('from') || ''
      const toIso = url.searchParams.get('to') || ''
      const tvUrl = `https://economic-calendar.tradingview.com/events?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&countries=${encodeURIComponent(calendarCountries)}`
      try {
        const tvRes = await fetch(tvUrl, {
          headers: {
            Origin: 'https://www.tradingview.com',
            Referer: 'https://www.tradingview.com/',
            'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsProxy/1.0)',
          },
        })
        if (tvRes.ok) {
          const tvData = await tvRes.text()
          return new Response(tvData, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=120',
              ...corsHeaders(origin),
            },
          })
        }
      } catch {
        // Fall through on error
      }
      return new Response(JSON.stringify({ result: [] }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }
    const symbols = [...new Set((url.searchParams.get('symbols') || '').split(',').map((s) => s.trim()).filter(Boolean))]
    if (symbols.length === 0 || symbols.length > MAX_SYMBOLS || !symbols.every((s) => SYMBOL_PATTERN.test(s))) {
      return new Response(JSON.stringify({ error: 'invalid symbols' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Cache key is origin-independent so every visitor shares one upstream fetch per minute
    const cacheKey = new Request(`${url.origin}/?symbols=${encodeURIComponent([...symbols].sort().join(','))}`)
    const cache = caches.default
    const cached = await cache.match(cacheKey)
    if (cached) {
      const hit = new Response(cached.body, cached)
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => hit.headers.set(k, v))
      return hit
    }

    const quotes = await mapWithConcurrency(symbols, CONCURRENCY, fetchQuote)
    const body = { fetchedAt: Math.floor(Date.now() / 1000), quotes: {} }
    symbols.forEach((s, i) => {
      if (quotes[i]) body.quotes[s] = quotes[i]
    })

    const response = new Response(JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      },
    })
    ctx.waitUntil(cache.put(cacheKey, response.clone()))

    Object.entries(corsHeaders(origin)).forEach(([k, v]) => response.headers.set(k, v))
    return response
  },
}

/**
 * Geonomics Stock Proxy (Cloudflare Worker)
 *
 * GET /?symbols=%5EKS11,%5EGSPC,...
 * Returns near-real-time quotes from Yahoo Finance chart endpoint with CORS headers.
 * Responses are edge-cached for CACHE_SECONDS to stay within free-tier limits.
 */

const CACHE_SECONDS = 60
const MAX_SYMBOLS = 120
const CONCURRENCY = 12
const SYMBOL_PATTERN = /^[A-Za-z0-9^.=\-]{1,20}$/

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

    return {
      price: typeof price === 'number' ? Number(price.toFixed(price < 10 ? 4 : 2)) : price,
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

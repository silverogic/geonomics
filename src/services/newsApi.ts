import type {
  CountryNewsArticle,
  Language,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'

const RSS_POOL_XML_URL =
  'https://raw.githubusercontent.com/laapy/reuters-bloomberg-news-rss-pool/main/data/deduplicated.xml'

const COUNTRY_KEYWORD_RULES: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'USA',
    regex: /\b(U\.?S\.?|United States|Wall Street|Nasdaq|S&P 500|Dow Jones|Fed\b|Federal Reserve|Treasury|White House|SEC\b|FOMC|Powell)\b|(미국|미\s*증시|뉴욕증시|월가|나스닥|다우|연준|파월|백악관|달러|米国|ニューヨーク|美联储|美股)/i,
  },
  {
    id: 'CHN',
    regex: /\b(China|Chinese|Beijing|PBOC|Shanghai|Shenzhen|Yuan|Renminbi|Hang Seng)\b|(중국|베이징|상하이|인민은행|위안화|홍콩|中国|人民銀行|人民币)/i,
  },
  {
    id: 'KOR',
    regex: /\b(South Korea|Korea\b|Korean|KOSPI|Seoul|Bank of Korea|Samsung|SK Hynix)\b|(한국|국내|코스피|코스닥|한국은행|한은|원화|삼성전자|SK하이닉스|현대차|서울|韓国|ウォン)/i,
  },
  {
    id: 'JPN',
    regex: /\b(Japan|Japanese|Tokyo|Nikkei|Bank of Japan|BOJ|Yen)\b|(일본|도쿄|닛케이|일본은행|엔화|엔저|엔고|日本|日銀|円安|円高)/i,
  },
  {
    id: 'DEU',
    regex: /\b(Germany|German|Frankfurt|DAX|Bundesbank|ECB|Eurozone)\b|(독일|프랑크푸르트|유로존|유럽중앙은행|유로화|ドイツ|欧州)/i,
  },
  {
    id: 'GBR',
    regex: /\b(U\.?K\.?|United Kingdom|Britain|British|London|FTSE|Bank of England|BOE|Sterling)\b|(영국|런던|파운드|영란은행|英国|ポンド)/i,
  },
  {
    id: 'TWN',
    regex: /\b(Taiwan|Taiwanese|Taipei|TSMC|TAIEX)\b|(대만|타이완|台湾)/i,
  },
  {
    id: 'IND',
    regex: /\b(India|Indian|Mumbai|Sensex|Nifty|RBI)\b|(인도|뭄바이|루피|インド)/i,
  },
  {
    id: 'FRA',
    regex: /\b(France|French|Paris|CAC 40)\b|(프랑스|파리|フランス)/i,
  },
  {
    id: 'CAN',
    regex: /\b(Canada|Canadian|Toronto|Bank of Canada)\b|(캐나다|カナダ)/i,
  },
  {
    id: 'AUS',
    regex: /\b(Australia|Australian|Sydney|RBA|ASX)\b|(호주|오스트레일리아|オーストラリア)/i,
  },
  {
    id: 'SAU',
    regex: /\b(Saudi Arabia|Saudi|Riyadh|Aramco|OPEC|Hormuz)\b|(사우디|리야드|아람코|중동|호르무즈|サウジ)/i,
  },
  {
    id: 'VNM',
    regex: /\b(Vietnam|Vietnamese|Hanoi|Dong|Ho Chi Minh)\b/i,
  },
  {
    id: 'SGP',
    regex: /\b(Singapore|MAS|Straits Times)\b/i,
  },
  {
    id: 'CHE',
    regex: /\b(Switzerland|Swiss|SNB|Zurich)\b/i,
  },
  {
    id: 'BRA',
    regex: /\b(Brazil|Brazilian|Bovespa|Brasilia|Real)\b/i,
  },
  {
    id: 'MEX',
    regex: /\b(Mexico|Mexican|Banxico|Peso)\b/i,
  },
  {
    id: 'IDN',
    regex: /\b(Indonesia|Indonesian|Jakarta|Rupiah|BI\b)\b/i,
  },
  {
    id: 'TUR',
    regex: /\b(Turkey|Turkish|Erdogan|Lira|TCMB)\b/i,
  },
  {
    id: 'NLD',
    regex: /\b(Netherlands|Dutch|ASML|Amsterdam|AEX)\b/i,
  },
  {
    id: 'ESP',
    regex: /\b(Spain|Spanish|Madrid|IBEX)\b/i,
  },
  {
    id: 'ARE',
    regex: /\b(UAE|Dubai|Abu Dhabi|Emirates)\b/i,
  },
  {
    id: 'IRN',
    regex: /\b(Iran|Iranian|Tehran|Hormuz)\b/i,
  },
  {
    id: 'RUS',
    regex: /\b(Russia|Russian|Moscow|Ruble)\b/i,
  },
]

const validCountryIds = new Set(COUNTRIES.map((c) => c.id))

/**
 * Detects countries related to an article based on keyword rules and appearance order.
 * Returns up to `limit` unique ISO3 country codes.
 */
export function detectRelatedCountries(text: string, limit = 3): string[] {
  if (!text) return []

  const hits: Array<{ id: string; index: number }> = []

  // 1. Check specialized rules first, recording the first index where each appears
  for (const rule of COUNTRY_KEYWORD_RULES) {
    if (!validCountryIds.has(rule.id)) continue
    const idx = text.search(rule.regex)
    if (idx !== -1) {
      hits.push({ id: rule.id, index: idx })
    }
  }

  // 2. Sort by earliest mention so the most focal country appears first
  hits.sort((a, b) => a.index - b.index)

  const seen = new Set<string>()
  const result: string[] = []

  for (const h of hits) {
    if (!seen.has(h.id)) {
      seen.add(h.id)
      result.push(h.id)
      if (result.length >= limit) return result
    }
  }

  // 3. Fallback: Check other tracked countries in COUNTRIES if we still haven\'t reached limit
  if (result.length < limit) {
    const fallbackHits: Array<{ id: string; index: number }> = []
    for (const c of COUNTRIES) {
      if (seen.has(c.id)) continue
      const escapedEn = c.nameEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const escapedKo = c.nameKo ? c.nameKo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''
      const pattern = escapedKo ? `\\b(${escapedEn})\\b|(${escapedKo})` : `\\b(${escapedEn})\\b`
      const regex = new RegExp(pattern, 'i')
      const idx = text.search(regex)
      if (idx !== -1) {
        fallbackHits.push({ id: c.id, index: idx })
      }
    }
    fallbackHits.sort((a, b) => a.index - b.index)
    for (const fb of fallbackHits) {
      if (!seen.has(fb.id)) {
        seen.add(fb.id)
        result.push(fb.id)
        if (result.length >= limit) break
      }
    }
  }

  return result
}


const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes


interface RawRssPoolItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
}

let cachedRssPoolItems: RawRssPoolItem[] | null = null
let lastRssPoolFetchTime = 0

const KNOWN_PUBLISHER_NAMES: Record<string, string> = {
  'reuters.com': 'Reuters',
  'bloomberg.com': 'Bloomberg',
  'ft.com': 'Financial Times',
  'wsj.com': 'Wall Street Journal',
  'cnbc.com': 'CNBC',
  'asia.nikkei.com': 'Nikkei Asia',
  'nikkei.com': 'Nikkei',
  'economictimes.indiatimes.com': 'Economic Times',
  'indiatimes.com': 'Times of India',
  'indianexpress.com': 'Indian Express',
  'thehindu.com': 'The Hindu',
  'livemint.com': 'Mint',
  'scmp.com': 'SCMP',
  'koreaherald.com': 'Korea Herald',
  'koreatimes.co.kr': 'Korea Times',
  'yna.co.kr': 'Yonhap News',
  'japantimes.co.jp': 'Japan Times',
  'techcrunch.com': 'TechCrunch',
  'theregister.com': 'The Register',
  'arstechnica.com': 'Ars Technica',
  'semianalysis.com': 'SemiAnalysis',
  'digitimes.com': 'DigiTimes',
  'tomshardware.com': "Tom's Hardware",
  'nytimes.com': 'New York Times',
  'washingtonpost.com': 'Washington Post',
  'bbc.com': 'BBC',
  'bbc.co.uk': 'BBC',
  'theguardian.com': 'The Guardian',
  'economist.com': 'The Economist',
  'apnews.com': 'AP News',
  'afp.com': 'AFP',
  'dw.com': 'DW',
  'france24.com': 'France 24',
  'aljazeera.com': 'Al Jazeera',
  'yahoo.com': 'Yahoo Finance',
  'finance.yahoo.com': 'Yahoo Finance',
  'marketwatch.com': 'MarketWatch',
  'barrons.com': "Barron's",
  'fortune.com': 'Fortune',
  'forbes.com': 'Forbes',
  'businessinsider.com': 'Business Insider',
}

function formatPublisherFromUrl(url: string, fallbackSource?: string): string {
  if (fallbackSource && !fallbackSource.includes('.')) return fallbackSource
  try {
    const host = new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
    if (KNOWN_PUBLISHER_NAMES[host]) return KNOWN_PUBLISHER_NAMES[host]
    for (const [domain, label] of Object.entries(KNOWN_PUBLISHER_NAMES)) {
      if (host.endsWith(`.${domain}`)) return label
    }
    return host
  } catch {
    return fallbackSource || 'Global Wire'
  }
}

function decodeXmlEntities(str: string): string {
  return str
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

async function getRssPoolItems(): Promise<RawRssPoolItem[]> {
  const now = Date.now()
  if (cachedRssPoolItems && now - lastRssPoolFetchTime < CACHE_TTL_MS) {
    return cachedRssPoolItems
  }

  try {
    const res = await fetch(RSS_POOL_XML_URL)
    if (!res.ok) return cachedRssPoolItems || []
    const xml = await res.text()
    const itemsRaw = xml.split('<item>').slice(1)
    const parsed: RawRssPoolItem[] = []

    for (const raw of itemsRaw) {
      const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/)
      const descMatch = raw.match(/<description>([\s\S]*?)<\/description>/)
      const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/)
      const pubMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
      const wireMatch = raw.match(/<wire:publisher>([\s\S]*?)<\/wire:publisher>/)

      const title = titleMatch ? decodeXmlEntities(titleMatch[1]) : ''
      const description = descMatch ? decodeXmlEntities(descMatch[1]) : ''
      const url = linkMatch ? decodeXmlEntities(linkMatch[1]) : ''
      const pubDate = pubMatch ? decodeXmlEntities(pubMatch[1]) : ''
      const publisher = wireMatch ? decodeXmlEntities(wireMatch[1]) : ''

      if (!title || !url) continue
      // Filter out pure entertainment / sports / lifestyle fluff
      if (/\b(NHL|NBA|NFL|MLB|Premier League|Champions League|Oscars|Grammys|Box Office|Crossword)\b/i.test(title)) {
        continue
      }

      parsed.push({
        title,
        description: description !== title ? description : '',
        url,
        source: publisher || formatPublisherFromUrl(url),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      })
    }

    cachedRssPoolItems = parsed
    lastRssPoolFetchTime = now
    return parsed
  } catch {
    return cachedRssPoolItems || []
  }
}

const PROXY_URL = (import.meta.env?.VITE_STOCK_PROXY_URL as string | undefined)?.replace(/\/$/, '')
const globeBreakingCache = new Map<string, { ts: number; map: Map<string, CountryNewsArticle[]> }>()
const GLOBE_BREAKING_TTL_MS = 90 * 1000 // 90s client cache

/**
 * Fetches live breaking economic news from the Cloudflare Worker (?news=breaking)
 * or local Vite dev middleware (/api/breaking-news), falling back to the RSS pool if needed,
 * and maps every article to its related ISO3 country codes for the Economic Globe News Mode.
 */
export async function fetchBreakingNewsByCountry(
  lang: Language,
  forceRefresh = false
): Promise<Map<string, CountryNewsArticle[]>> {
  const now = Date.now()
  if (!forceRefresh) {
    const cached = globeBreakingCache.get(lang)
    if (cached && now - cached.ts < GLOBE_BREAKING_TTL_MS) {
      return cached.map
    }
  }

  let rawItems: RawRssPoolItem[] = []
  const endpoint = PROXY_URL
    ? `${PROXY_URL}/?news=breaking&lang=${encodeURIComponent(lang)}`
    : import.meta.env.DEV
      ? `/api/breaking-news?lang=${encodeURIComponent(lang)}`
      : null

  if (endpoint) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = (await res.json()) as {
          items?: Array<{ title: string; url: string; source: string; publishedAt: string }>
        }
        if (Array.isArray(data.items) && data.items.length > 0) {
          rawItems = data.items.map((it) => ({
            title: it.title,
            description: '',
            url: it.url,
            source: it.source,
            publishedAt: it.publishedAt,
          }))
        }
      }
    } catch {
      // Fall back to static RSS pool below
    }
  }

  if (rawItems.length === 0) {
    rawItems = await getRssPoolItems()
  }

  const byCountry = new Map<string, CountryNewsArticle[]>()
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i]
    const fullText = `${item.title} ${item.description}`
    const related = detectRelatedCountries(fullText, 2)
    // Default unmapped general macro/Wall St headlines to USA only if macro US terms present, else skip
    for (const cid of related) {
      const list = byCountry.get(cid) || []
      if (list.length >= 6) continue
      list.push({
        id: `brk-${cid}-${i}`,
        title: item.title,
        description: item.description || undefined,
        url: item.url,
        source: item.source,
        publishedAt: item.publishedAt,
        countryId: cid,
        topic: 'ALL',
        relatedCountryIds: related,
      })
      byCountry.set(cid, list)
    }
  }

  // Sort each country's articles newest-first
  for (const [cid, list] of byCountry.entries()) {
    list.sort(
      (a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0)
    )
    byCountry.set(cid, list)
  }

  globeBreakingCache.set(lang, { ts: now, map: byCountry })
  return byCountry
}



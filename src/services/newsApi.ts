import type {
  CountryMeta,
  CountryNewsArticle,
  CountryTopicCategory,
  EconomicNewsData,
  Language,
  MacroBriefItem,
  NewsCategory,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'

const BRIEF_JSON_URL = 'https://raw.githubusercontent.com/givanchris/News/main/data/brief.json'
const RSS_POOL_XML_URL =
  'https://raw.githubusercontent.com/laapy/reuters-bloomberg-news-rss-pool/main/data/deduplicated.xml'

const ALLOWED_BRIEF_CATEGORIES = new Set([
  'MACRO',
  'CENTRAL BANKS',
  'COMMODITIES',
  'MARKETS',
  'ECONOMY',
  'POLITICS',
  'GEOPOLITICS',
  'FISCAL',
  'EARNINGS',
  'TRADE',
])

const EXCLUDED_SPORTS_CATEGORIES = new Set([
  'NBA',
  'NFL',
  'MCBB',
  'NCAA CFB',
  'MLB',
  'NHL',
  'SOCCER',
  'SPORTS',
])

const COUNTRY_KEYWORD_RULES: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'USA',
    regex: /\b(U\.?S\.?|United States|Wall Street|Nasdaq|S&P 500|Dow Jones|Fed\b|Federal Reserve|Treasury|White House|SEC\b|FOMC|Powell)\b/i,
  },
  {
    id: 'CHN',
    regex: /\b(China|Chinese|Beijing|PBOC|Shanghai|Shenzhen|Yuan|Renminbi|Hang Seng)\b/i,
  },
  {
    id: 'KOR',
    regex: /\b(South Korea|Korea\b|Korean|KOSPI|Seoul|Bank of Korea|Samsung|SK Hynix)\b/i,
  },
  {
    id: 'JPN',
    regex: /\b(Japan|Japanese|Tokyo|Nikkei|Bank of Japan|BOJ|Yen)\b/i,
  },
  {
    id: 'DEU',
    regex: /\b(Germany|German|Frankfurt|DAX|Bundesbank|ECB|Eurozone)\b/i,
  },
  {
    id: 'GBR',
    regex: /\b(U\.?K\.?|United Kingdom|Britain|British|London|FTSE|Bank of England|BOE|Sterling)\b/i,
  },
  {
    id: 'TWN',
    regex: /\b(Taiwan|Taiwanese|Taipei|TSMC|TAIEX)\b/i,
  },
  {
    id: 'IND',
    regex: /\b(India|Indian|Mumbai|Sensex|Nifty|RBI)\b/i,
  },
  {
    id: 'FRA',
    regex: /\b(France|French|Paris|CAC 40)\b/i,
  },
  {
    id: 'CAN',
    regex: /\b(Canada|Canadian|Toronto|Bank of Canada)\b/i,
  },
  {
    id: 'AUS',
    regex: /\b(Australia|Australian|Sydney|RBA|ASX)\b/i,
  },
  {
    id: 'SAU',
    regex: /\b(Saudi Arabia|Saudi|Riyadh|Aramco|OPEC|Hormuz)\b/i,
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

function normalizeCategory(rawCat: string, text = ''): Exclude<NewsCategory, 'ALL'> {
  const upper = (rawCat || '').toUpperCase().trim()
  if (upper.includes('CENTRAL') || upper.includes('FED') || upper.includes('RATE')) {
    return 'CENTRAL_BANKS'
  }
  if (upper.includes('COMMODIT') || /\b(WTI|Crude|Oil|Gold|Silver|Copper|Gas)\b/i.test(text)) {
    return 'COMMODITIES'
  }
  if (upper === 'MACRO' || upper === 'ECONOMY' || upper === 'POLITICS' || upper === 'FISCAL') {
    return 'MACRO'
  }
  if (upper === 'WORLD' || upper === 'GEOPOLITICS') {
    return 'WORLD'
  }
  if (/\b(Fed|CPI|Inflation|GDP|Yield|Treasury|Tariff|Recession|Central Bank)\b/i.test(text)) {
    return 'MACRO'
  }
  return 'MARKETS'
}

// In-memory cache for raw news feed
let cachedRawNews: EconomicNewsData | null = null
let lastFetchTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches live global macro economic briefings directly from open GitHub repository:
 * givanchris/News (data/brief.json)
 */
export async function fetchGlobalEconomicNews(forceRefresh = false): Promise<EconomicNewsData> {
  const now = Date.now()
  if (!forceRefresh && cachedRawNews && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedRawNews
  }

  const cacheBuster = forceRefresh ? `?t=${now}` : ''
  const briefJson = await fetch(`${BRIEF_JSON_URL}${cacheBuster}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  const briefings: MacroBriefItem[] = []

  if (briefJson && Array.isArray(briefJson.stories)) {
    briefJson.stories.forEach((st: any, idx: number) => {
      const rawCat = String(st.cat || '').toUpperCase().trim()
      if (EXCLUDED_SPORTS_CATEGORIES.has(rawCat)) return
      if (!ALLOWED_BRIEF_CATEGORIES.has(rawCat) && rawCat.length > 0) return

      const headline = String(st.headline || '').trim()
      const body = String(st.body || '').trim()
      const explain = String(st.explain || '').trim()
      if (!headline || !body) return

      const combinedText = `${headline} ${body} ${explain}`
      briefings.push({
        id: `brief-${idx}`,
        category: normalizeCategory(rawCat, combinedText),
        rawCategory: rawCat || 'MACRO',
        headline,
        body,
        explain,
        relatedCountryIds: detectRelatedCountries(combinedText),
      })
    })
  }

  const result: EconomicNewsData = {
    lastUpdated: briefJson?.lastUpdated || new Date().toISOString(),
    briefings,
    repositories: ['givanchris/News'],
  }

  cachedRawNews = result
  lastFetchTimestamp = now
  return result
}

// ============================================================================
// ON-THE-FLY REAL-TIME TRANSLATION ENGINE (In-Memory Session Cache)
// ============================================================================

const translationMemoryCache = new Map<string, string>()

const TARGET_LANG_CODE_MAP: Record<Language, string> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-CN',
  es: 'es',
}

function getCacheKey(lang: Language, text: string): string {
  return `${lang}:::${text}`
}

const FINANCIAL_ACRONYMS = new Set([
  'AI', 'CPI', 'PPI', 'PCE', 'GDP', 'GNP', 'WTI', 'EIA', 'OPEC', 'OPEC+',
  'FED', 'FOMC', 'ECB', 'BOJ', 'BOE', 'PBOC', 'BOK', 'RBA', 'SNB', 'IMF',
  'BIS', 'WTO', 'WHO', 'UN', 'US', 'U.S.', 'UK', 'U.K.', 'EU', 'UAE',
  'G7', 'G20', 'BRICS', 'NATO', 'KOSPI', 'KOSDAQ', 'NASDAQ', 'NYSE',
  'S&P', 'DOW', 'FTSE', 'DAX', 'CAC', 'NIKKEI', 'ETF', 'ETFS', 'IPO', 'IPOS',
  'M&A', 'CEO', 'CFO', 'COO', 'CTO', 'EV', 'EVS', 'GPU', 'GPUS', 'TSMC',
  'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD', 'ASML',
  'ARM', 'FX', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'RMB', 'KRW', 'CHF',
  'CAD', 'AUD', 'YOY', 'QOQ', 'MOM', 'PMI', 'ISM', 'NFP', 'JOLTS', 'EPS',
  'PE', 'P/E', 'ROE', 'ROI', 'CAPEX', 'OPEX', 'QE', 'QT', 'YCC', 'BPS',
  'LNG', 'LPG', 'IEA', 'Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2',
])

const PROPER_NOUNS_MAP = new Map<string, string>([
  ['fed', 'Fed'],
  ['treasury', 'Treasury'],
  ['treasuries', 'Treasuries'],
  ['wall', 'Wall'],
  ['street', 'Street'],
  ['nasdaq', 'Nasdaq'],
  ['nasdaq-100', 'Nasdaq-100'],
  ['dow', 'Dow'],
  ['brent', 'Brent'],
  ['hormuz', 'Hormuz'],
  ['china', 'China'],
  ['chinese', 'Chinese'],
  ['korea', 'Korea'],
  ['korean', 'Korean'],
  ['japan', 'Japan'],
  ['japanese', 'Japanese'],
  ['europe', 'Europe'],
  ['european', 'European'],
  ['eurozone', 'Eurozone'],
  ['america', 'America'],
  ['american', 'American'],
  ['britain', 'Britain'],
  ['british', 'British'],
  ['germany', 'Germany'],
  ['german', 'German'],
  ['france', 'France'],
  ['french', 'French'],
  ['india', 'India'],
  ['indian', 'Indian'],
  ['russia', 'Russia'],
  ['russian', 'Russian'],
  ['iran', 'Iran'],
  ['iranian', 'Iranian'],
  ['israel', 'Israel'],
  ['israeli', 'Israeli'],
  ['taiwan', 'Taiwan'],
  ['saudi', 'Saudi'],
  ['arabia', 'Arabia'],
  ['powell', 'Powell'],
  ['warsh', 'Warsh'],
  ['lagarde', 'Lagarde'],
  ['ueda', 'Ueda'],
  ['yellen', 'Yellen'],
  ['trump', 'Trump'],
  ['biden', 'Biden'],
  ['january', 'January'],
  ['february', 'February'],
  ['march', 'March'],
  ['april', 'April'],
  ['may', 'May'],
  ['june', 'June'],
  ['july', 'July'],
  ['august', 'August'],
  ['september', 'September'],
  ['october', 'October'],
  ['november', 'November'],
  ['december', 'December'],
])

/**
 * Normalizes ALL-CAPS wire headlines into grammatical sentence-case while preserving
 * financial acronyms and proper nouns so NMT engines parse syntax accurately.
 */
function normalizeAllCapsHeadline(text: string): string {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  if (!letters) return text
  const upperCount = text.replace(/[^A-Z]/g, '').length
  if (upperCount / letters.length < 0.7) return text

  return text
    .split(/\s+/)
    .map((token, idx) => {
      const match = token.match(/^([^A-Za-z0-9]*)([A-Za-z0-9.&/-]+?)(['’]S|['’]s)?([^A-Za-z0-9]*)$/)
      if (!match) return token
      const [, prefix, core, poss, suffix] = match
      const upperCore = core.toUpperCase()
      if (FINANCIAL_ACRONYMS.has(upperCore)) {
        return `${prefix}${upperCore}${poss ? "'s" : ''}${suffix}`
      }
      const lowerCore = core.toLowerCase()
      if (PROPER_NOUNS_MAP.has(lowerCore)) {
        return `${prefix}${PROPER_NOUNS_MAP.get(lowerCore)}${poss ? "'s" : ''}${suffix}`
      }
      if (idx === 0) {
        return `${prefix}${lowerCore.charAt(0).toUpperCase() + lowerCore.slice(1)}${poss ? "'s" : ''}${suffix}`
      }
      return `${prefix}${lowerCore}${poss ? "'s" : ''}${suffix}`
    })
    .join(' ')
}

/**
 * Financial Domain Pre-Glossary: Expands Wall Street idioms & polysemous jargon
 * into explicit economic terms before NMT translation to eliminate literal mistranslations.
 */
const FINANCIAL_PRE_GLOSSARY: Array<[RegExp, string]> = [
  // Safe-haven flows & bids
  [/\bflight[- ]to[- ]safety\b/gi, 'safe-haven asset buying'],
  [/\bflight[- ]to[- ]quality['’]?\s*bid\b/gi, 'safe-haven buying demand'],
  [/\bflight[- ]to[- ]quality\b/gi, 'safe-haven asset buying'],
  [/\bsafe[- ]haven bid\b/gi, 'safe-haven buying demand'],
  [/\bbid for Treasuries\b/gi, 'buying demand for U.S. Treasury bonds'],
  [/\binto haven(s)?\b/gi, 'into safe-haven assets'],

  // Yields & Bonds
  [/\b10-year yield\b/gi, 'U.S. 10-year Treasury bond yield'],
  [/\b2-year yield\b/gi, 'U.S. 2-year Treasury bond yield'],
  [/\b30-year yield\b/gi, 'U.S. 30-year Treasury bond yield'],
  [/\b([0-9.]+%)\s+yields\b/gi, '$1 government bond yields'],
  [/\bTreasury yields\b/gi, 'U.S. Treasury bond yields'],
  [/\bTreasury yield\b/gi, 'U.S. Treasury bond yield'],
  [/\bfor Treasuries\b/gi, 'for U.S. Treasury bonds'],
  [/\bin Treasuries\b/gi, 'in U.S. Treasury bonds'],
  [/\bwell off the ([0-9.]+%\+?)\s*spike\b/gi, 'retreating significantly from the $1 peak'],
  [/\bwell off the highs?\b/gi, 'retreating significantly from the peak'],

  // Headline action verbs ("slips", "edges", "inks", "mulls", "taps", "shrugs off")
  [/\bgold slips\b/gi, 'gold price edges lower'],
  [/\boil slips\b/gi, 'oil price edges lower'],
  [/\bdollar slips\b/gi, 'U.S. dollar edges lower'],
  [/\byield(s)? slip(ped|s)?\b/gi, 'bond yield$1 edged lower'],
  [/\bslipped (\d+)\s*basis points?\b/gi, 'fell $1 bp (0.01%p)'],
  [/\bslips (\d+)\s*basis points?\b/gi, 'falls $1 bp (0.01%p)'],
  [/\b1 basis point\b/gi, '1 bp (0.01%p)'],
  [/\b(\d+)\s*basis points?\b/gi, '$1 bp'],
  [/\bpare(d|s)? gains\b/gi, 'reduced gains'],
  [/\bpare(d|s)? losses\b/gi, 'reduced losses'],
  [/\btrim(med|s)? gains\b/gi, 'reduced gains'],
  [/\btrim(med|s)? losses\b/gi, 'reduced losses'],
  [/\bshrug(ged|s)? off\b/gi, 'overcame'],
  [/\bweigh(ed|s)? on\b/gi, 'put downward pressure on'],

  // Inflation & Economic prints
  [/\bhotter-than-expected CPI print\b/gi, 'higher-than-expected CPI inflation data'],
  [/\bhot CPI report\b/gi, 'higher-than-expected CPI inflation report'],
  [/\bhot CPI print\b/gi, 'higher-than-expected CPI inflation data'],
  [/\bhot CPI\b/gi, 'higher-than-expected CPI inflation'],
  [/\bcool CPI\b/gi, 'lower-than-expected CPI inflation'],
  [/\bsoft CPI\b/gi, 'lower-than-expected CPI inflation'],
  [/\bCPI print\b/gi, 'CPI inflation data'],
  [/\bPPI print\b/gi, 'PPI inflation data'],
  [/\bjobs print\b/gi, 'employment data'],
  [/\bpayrolls print\b/gi, 'nonfarm payrolls data'],

  // Commodities & Inventories
  [/\bstee(p|per) inventory draw\b/gi, 'sharp crude oil inventory decline'],
  [/\binventory draw\b/gi, 'crude oil inventory decline'],
  [/\bcrude draw\b/gi, 'crude oil inventory decline'],
  [/\binventory build\b/gi, 'crude oil inventory increase'],
  [/\bcrude build\b/gi, 'crude oil inventory increase'],
  [/\bgreenback\b/gi, 'U.S. dollar'],

  // Sessions & Market Structure
  [/\bworst session\b/gi, 'worst trading day'],
  [/\bbest session\b/gi, 'best trading day'],
  [/\btypical session\b/gi, 'typical trading day'],
  [/\bin the same session\b/gi, 'on the same trading day'],
  [/\bmega-cap tech names\b/gi, 'big-tech stocks'],
  [/\bmega-cap tech\b/gi, 'big-tech'],
  [/\bdebt-funded\b/gi, 'debt-financed'],
  [/\bchip-heavy\b/gi, 'semiconductor-heavy'],
  [/\bcap-weighted\b/gi, 'market-cap-weighted'],
  [/\bAI-related capex\b/gi, 'AI-related capital expenditure'],
  [/\bcapex\b/gi, 'capital expenditure'],
  [/\bopex\b/gi, 'operating expenditure'],
  [/\bhigh multiples\b/gi, 'high valuation multiples'],
  [/\bmarket breadth is only modestly negative\b/gi, 'overall market decline is relatively mild'],
  [/\bmarket breadth\b/gi, 'overall market advancing-to-declining ratio'],
  [/\btech selloff\b/gi, 'technology stock selloff'],
  [/\bequity selloff\b/gi, 'stock market selloff'],
  [/\brisk-off move\b/gi, 'risk-averse market selloff'],
  [/\brisk-off flows\b/gi, 'safe-haven investment flows'],
  [/\brisk-off\b/gi, 'risk-averse'],
  [/\brisk-on\b/gi, 'risk-seeking'],
  [/\bholds rates higher for longer\b/gi, 'keeps interest rates high for longer'],
  [/\bhigher for longer\b/gi, 'high interest rates for longer'],
  [/\bround trip\b/gi, 'sharp reversal'],
  [/\bfundamentals surprise\b/gi, 'unexpectedly strong supply-demand fundamentals'],
]

function preprocessForTranslation(text: string): string {
  let out = normalizeAllCapsHeadline(text.replace(/\s+/g, ' ').trim())
  for (const [pattern, replacement] of FINANCIAL_PRE_GLOSSARY) {
    out = out.replace(pattern, replacement)
  }
  return out
}

/**
 * Post-processes translated text into natural financial journalism terminology.
 */
function postprocessFinancialTranslation(text: string, lang: Language): string {
  const trimmed = text.trim()
  if (lang !== 'ko') return trimmed

  return trimmed
    .replace(/미국 10년 만기 국채\s*수익률은/g, '미 10년물 국채 금리는')
    .replace(/미국 10년 만기 국채\s*수익률이/g, '미 10년물 국채 금리가')
    .replace(/미국 10년 만기 국채\s*수익률을/g, '미 10년물 국채 금리를')
    .replace(/미국 10년 만기 국채\s*수익률/g, '미 10년물 국채 금리')
    .replace(/10년 만기 미국 국채\s*수익률은/g, '미 10년물 국채 금리는')
    .replace(/10년 만기 미국 국채\s*수익률이/g, '미 10년물 국채 금리가')
    .replace(/10년 만기 미국 국채\s*수익률/g, '미 10년물 국채 금리')
    .replace(/10년 만기 국채\s*수익률은/g, '10년물 국채 금리는')
    .replace(/10년 만기 국채\s*수익률이/g, '10년물 국채 금리가')
    .replace(/10년 만기 국채\s*수익률/g, '10년물 국채 금리')
    .replace(/미국 재무부 채권/g, '미 국채')
    .replace(/국채\s*수익률은/g, '국채 금리는')
    .replace(/국채\s*수익률이/g, '국채 금리가')
    .replace(/국채\s*수익률을/g, '국채 금리를')
    .replace(/국채\s*수익률/g, '국채 금리')
    .replace(/채권\s*수익률은/g, '채권 금리는')
    .replace(/채권\s*수익률이/g, '채권 금리가')
    .replace(/채권\s*수익률을/g, '채권 금리를')
    .replace(/채권\s*수익률/g, '채권 금리')
    .replace(/수익률을 끌어올리는/g, '금리를 끌어올리는')
    .replace(/수익률을 끌어내리는/g, '금리를 끌어내리는')
    .replace(/금리은/g, '금리는')
    .replace(/금리이/g, '금리가')
    .replace(/금리을/g, '금리를')
    .replace(/나스닥-100/g, '나스닥 100')
    .replace(/Nasdaq-100/g, '나스닥 100')
    .replace(/Nasdaq 100/g, '나스닥 100')
    .replace(/안전 피난처 구매 수요/g, '안전자산 매수 수요')
    .replace(/안전 피난처/g, '안전자산')
    .replace(/안전한 매수 수요/g, '안전자산 매수 수요')
    .replace(/안전한 자산 매입/g, '안전자산 매수')
    .replace(/안전 자산/g, '안전자산')
    .replace(/안전자산 입찰/g, '안전자산 매수세')
    .replace(/가치 배수/g, '밸류에이션 멀티플(배수)')
    .replace(/자본 지출/g, '설비투자(CAPEX)')
    .replace(/연방준비제도\(Fed\)/g, '연준(Fed)')
    .replace(/연방준비제도/g, '연준(Fed)')
    .trim()
}

async function translateSingleTextFallback(
  text: string,
  targetLangCode: string,
  lang: Language
): Promise<string> {
  const clean = preprocessForTranslation(text)
  if (!clean) return text

  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(
      targetLangCode
    )}&q=${encodeURIComponent(clean)}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && typeof data[0] === 'string') {
        return postprocessFinancialTranslation(data[0], lang)
      }
    }
  } catch {
    // Fallback to MyMemory below
  }

  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      clean.slice(0, 480)
    )}&langpair=en|${encodeURIComponent(targetLangCode)}`
    const res = await fetch(mmUrl)
    if (res.ok) {
      const data = await res.json()
      if (data?.responseData?.translatedText) {
        return postprocessFinancialTranslation(String(data.responseData.translatedText), lang)
      }
    }
  } catch {
    // Ignore and return original
  }

  return text
}

/**
 * Translates an array of texts on-the-fly in real time when the user views or switches language.
 * Applies Option A (Financial Domain Pre-Glossary + ALL-CAPS Normalization + Terminology Post-Processing).
 */
export async function translateBatchOnTheFly(
  texts: string[],
  lang: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>()
  if (lang === 'en' || texts.length === 0) {
    for (const t of texts) {
      resultMap.set(t, t)
    }
    return resultMap
  }

  const targetLangCode = TARGET_LANG_CODE_MAP[lang]
  const uncached: string[] = []
  const seenUncached = new Set<string>()

  for (const raw of texts) {
    if (!raw || !raw.trim()) continue
    const key = getCacheKey(lang, raw)
    const cached = translationMemoryCache.get(key)
    if (cached) {
      resultMap.set(raw, cached)
    } else if (!seenUncached.has(raw)) {
      seenUncached.add(raw)
      uncached.push(raw)
    }
  }

  if (uncached.length === 0) {
    return resultMap
  }

  // Group into batches of up to 8 items (or ~1400 chars) separated by single newline
  const batches: string[][] = []
  let currentBatch: string[] = []
  let currentLen = 0

  for (const item of uncached) {
    const preprocessed = preprocessForTranslation(item)
    if (
      currentBatch.length >= 8 ||
      (currentLen + preprocessed.length > 1400 && currentBatch.length > 0)
    ) {
      batches.push(currentBatch)
      currentBatch = []
      currentLen = 0
    }
    currentBatch.push(item)
    currentLen += preprocessed.length
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  await Promise.all(
    batches.map(async (batch) => {
      const sanitizedLines = batch.map((it) => preprocessForTranslation(it))
      const joinedPayload = sanitizedLines.join('\n')

      try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(
          targetLangCode
        )}&q=${encodeURIComponent(joinedPayload)}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          const rawTranslated = Array.isArray(data)
            ? typeof data[0] === 'string'
              ? data[0]
              : Array.isArray(data[0])
              ? data[0].map((seg: any) => seg[0]).join('')
              : ''
            : ''

          const splitLines = rawTranslated
            .split('\n')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)

          if (splitLines.length === batch.length) {
            batch.forEach((orig, idx) => {
              const tr = postprocessFinancialTranslation(splitLines[idx] || orig, lang)
              translationMemoryCache.set(getCacheKey(lang, orig), tr)
              resultMap.set(orig, tr)
            })
            return
          }
        }
      } catch {
        // Fall through to individual parallel requests
      }

      // Per-item fallback if newline count mismatched or batch failed
      await Promise.all(
        batch.map(async (orig) => {
          const tr = await translateSingleTextFallback(orig, targetLangCode, lang)
          translationMemoryCache.set(getCacheKey(lang, orig), tr)
          resultMap.set(orig, tr)
        })
      )
    })
  )

  return resultMap
}

// ============================================================================
// COUNTRY & SECTOR CUSTOMIZED ECONOMIC NEWS ENGINE ("1 + A")
// High-quality single-source engine:
// laapy/reuters-bloomberg-news-rss-pool (820+ global wire articles with summaries)
// Updated every 4 hours via GitHub Actions (Bloomberg, Reuters, FT, CNBC, CNA)
// ============================================================================

interface RawRssPoolItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
}

let cachedRssPoolItems: RawRssPoolItem[] | null = null
let lastRssPoolFetchTime = 0
const countryNewsCache = new Map<string, { ts: number; items: CountryNewsArticle[] }>()

const KEYWORD_TO_ENGLISH_DICT: Record<string, string> = {
  // Korean
  반도체: 'semiconductor chip',
  칩: 'semiconductor chip',
  파운드리: 'foundry semiconductor',
  인공지능: 'AI artificial intelligence',
  금리: 'interest rate central bank',
  기준금리: 'interest rate central bank',
  환율: 'currency exchange rate',
  물가: 'inflation CPI',
  인플레이션: 'inflation CPI',
  전기차: 'EV electric vehicle',
  배터리: 'battery EV',
  이차전지: 'battery EV',
  원전: 'nuclear power energy',
  원자력: 'nuclear power energy',
  석유: 'oil crude energy',
  유가: 'oil price crude',
  가스: 'natural gas LNG',
  태양광: 'solar energy',
  관세: 'tariff trade',
  수출: 'export trade',
  수입: 'import trade',
  공급망: 'supply chain',
  무역: 'trade export',
  증시: 'stock market index',
  주식: 'stock market shares',
  채권: 'bond yield treasury',
  국채: 'government bond yield',
  부동산: 'real estate property housing',
  방산: 'defense military export',
  조선: 'shipbuilding',
  철강: 'steel industry',
  자동차: 'automaker car automotive',
  바이오: 'biotech pharmaceutical',
  제약: 'pharmaceutical drug',
  은행: 'banking financial',
  // Japanese
  半導体: 'semiconductor chip',
  金利: 'interest rate',
  為替: 'currency exchange',
  インフレ: 'inflation',
  電気自動車: 'EV electric vehicle',
  電池: 'battery',
  原発: 'nuclear power',
  関税: 'tariff trade',
  輸出: 'export trade',
  株価: 'stock market',
  不動産: 'real estate',
  // Chinese
  半导体: 'semiconductor chip',
  芯片: 'semiconductor chip',
  利率: 'interest rate',
  汇率: 'currency exchange',
  通胀: 'inflation',
  电动车: 'EV electric vehicle',
  新能源汽车: 'EV electric vehicle',
  锂电池: 'lithium battery',
  电池: 'battery',
  关税: 'tariff trade',
  出口: 'export trade',
  股市: 'stock market',
  房地产: 'real estate property',
  // Spanish
  semiconductores: 'semiconductor chip',
  tasas: 'interest rate',
  inflación: 'inflation',
  aranceles: 'tariff trade',
  energía: 'energy oil',
  baterías: 'battery EV',
}

export async function translateQueryToEnglish(rawQuery: string): Promise<string> {
  const trimmed = rawQuery.trim()
  if (!trimmed) return ''

  const directMatch = KEYWORD_TO_ENGLISH_DICT[trimmed.toLowerCase()]
  if (directMatch) return directMatch

  // Check if ASCII-only (already English)
  if (/^[\x00-\x7F]+$/.test(trimmed)) {
    return trimmed
  }

  // Check if any token in the query is in our dictionary
  const tokens = trimmed.split(/\s+/)
  const mappedTokens = tokens.map((tok) => KEYWORD_TO_ENGLISH_DICT[tok.toLowerCase()] || null)
  if (mappedTokens.every((m) => m !== null)) {
    return mappedTokens.join(' ')
  }

  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=en&q=${encodeURIComponent(
      trimmed
    )}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const translated = Array.isArray(data)
        ? typeof data[0] === 'string'
          ? data[0]
          : Array.isArray(data[0]) && typeof data[0][0] === 'string'
          ? data[0][0]
          : ''
        : ''
      if (translated.trim()) {
        return translated.trim()
      }
    }
  } catch {
    // Ignore and return original
  }
  return trimmed
}

const COUNTRY_SEARCH_ALIASES: Record<
  string,
  { primary: string; extraTerms: string[]; regex: RegExp }
> = {
  USA: {
    primary: 'US',
    extraTerms: ['United States', 'Wall Street', 'Fed'],
    regex: /\b(U\.?S\.?|United States|America|American|Wall Street|Fed\b|Federal Reserve|White House|Treasury|Nasdaq)\b/i,
  },
  IND: {
    primary: 'India',
    extraTerms: ['Indian', 'Mumbai', 'Modi'],
    regex: /\b(India|Indian|Mumbai|New Delhi|Sensex|Nifty|RBI|Rupee|Modi)\b/i,
  },
  KOR: {
    primary: 'South Korea',
    extraTerms: ['Korea', 'Korean', 'Samsung', 'Seoul'],
    regex: /\b(South Korea|Korea|Korean|Seoul|KOSPI|Samsung|SK Hynix|Hyundai|Won|BOK)\b/i,
  },
  JPN: {
    primary: 'Japan',
    extraTerms: ['Japanese', 'Tokyo', 'BOJ', 'Yen'],
    regex: /\b(Japan|Japanese|Tokyo|Nikkei|BOJ|Bank of Japan|Yen|Toyota|SoftBank|RapidUs)\b/i,
  },
  CHN: {
    primary: 'China',
    extraTerms: ['Chinese', 'Beijing', 'Shanghai'],
    regex: /\b(China|Chinese|Beijing|Shanghai|Shenzhen|PBOC|Yuan|Renminbi|Huawei|BYD|Alibaba|Tencent)\b/i,
  },
  TWN: {
    primary: 'Taiwan',
    extraTerms: ['Taiwanese', 'TSMC', 'Taipei'],
    regex: /\b(Taiwan|Taiwanese|Taipei|TSMC|Foxconn|MediaTek|TAIEX)\b/i,
  },
  DEU: {
    primary: 'Germany',
    extraTerms: ['German', 'Berlin', 'Frankfurt'],
    regex: /\b(Germany|German|Berlin|Frankfurt|DAX|Bundesbank|Volkswagen|Siemens|SAP)\b/i,
  },
  GBR: {
    primary: 'UK',
    extraTerms: ['Britain', 'British', 'London'],
    regex: /\b(U\.?K\.?|United Kingdom|Britain|British|London|FTSE|Bank of England|BOE|Sterling|Pound)\b/i,
  },
  FRA: {
    primary: 'France',
    extraTerms: ['French', 'Paris'],
    regex: /\b(France|French|Paris|CAC 40|Macron|TotalEnergies|Airbus|LVMH)\b/i,
  },
  VNM: {
    primary: 'Vietnam',
    extraTerms: ['Vietnamese', 'Hanoi'],
    regex: /\b(Vietnam|Vietnamese|Hanoi|Ho Chi Minh|VinFast)\b/i,
  },
  SAU: {
    primary: 'Saudi Arabia',
    extraTerms: ['Saudi', 'Riyadh', 'Aramco'],
    regex: /\b(Saudi Arabia|Saudi|Riyadh|Aramco|PIF)\b/i,
  },
  ARE: {
    primary: 'UAE',
    extraTerms: ['Dubai', 'Abu Dhabi'],
    regex: /\b(UAE|United Arab Emirates|Dubai|Abu Dhabi|MGX|Mubadala)\b/i,
  },
  SGP: {
    primary: 'Singapore',
    extraTerms: ['Singaporean', 'MAS'],
    regex: /\b(Singapore|Singaporean|Temasek|GIC|MAS)\b/i,
  },
  CAN: {
    primary: 'Canada',
    extraTerms: ['Canadian', 'Toronto', 'Ottawa'],
    regex: /\b(Canada|Canadian|Toronto|Ottawa|Bank of Canada|Loonie)\b/i,
  },
  AUS: {
    primary: 'Australia',
    extraTerms: ['Australian', 'Sydney', 'RBA'],
    regex: /\b(Australia|Australian|Sydney|Canberra|RBA|ASX)\b/i,
  },
  BRA: {
    primary: 'Brazil',
    extraTerms: ['Brazilian', 'Brasilia', 'Petrobras'],
    regex: /\b(Brazil|Brazilian|Brasilia|Sao Paulo|Bovespa|Petrobras|Lula)\b/i,
  },
  MEX: {
    primary: 'Mexico',
    extraTerms: ['Mexican', 'Peso'],
    regex: /\b(Mexico|Mexican|Mexico City|Banxico)\b/i,
  },
  NLD: {
    primary: 'Netherlands',
    extraTerms: ['Dutch', 'ASML', 'Amsterdam'],
    regex: /\b(Netherlands|Dutch|Amsterdam|ASML|NXP)\b/i,
  },
  CHE: {
    primary: 'Switzerland',
    extraTerms: ['Swiss', 'Zurich', 'UBS', 'SNB'],
    regex: /\b(Switzerland|Swiss|Zurich|Geneva|SNB|UBS|Novartis|Nestle)\b/i,
  },
  IDN: {
    primary: 'Indonesia',
    extraTerms: ['Indonesian', 'Jakarta'],
    regex: /\b(Indonesia|Indonesian|Jakarta|Rupiah)\b/i,
  },
  MYS: {
    primary: 'Malaysia',
    extraTerms: ['Malaysian', 'Kuala Lumpur'],
    regex: /\b(Malaysia|Malaysian|Kuala Lumpur|Ringgit|Johor)\b/i,
  },
  THA: {
    primary: 'Thailand',
    extraTerms: ['Thai', 'Bangkok'],
    regex: /\b(Thailand|Thai|Bangkok|Baht)\b/i,
  },
  TUR: {
    primary: 'Turkey',
    extraTerms: ['Turkish', 'Istanbul', 'Lira'],
    regex: /\b(Turkey|Turkish|Turkiye|Istanbul|Ankara|Lira)\b/i,
  },
  RUS: {
    primary: 'Russia',
    extraTerms: ['Russian', 'Moscow', 'Ruble'],
    regex: /\b(Russia|Russian|Moscow|Ruble|Gazprom)\b/i,
  },
}

function getCountrySearchProfile(country: CountryMeta): {
  primary: string
  extraTerms: string[]
  regex: RegExp
} {
  const preset = COUNTRY_SEARCH_ALIASES[country.id]
  if (preset) return preset
  const escaped = country.nameEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return {
    primary: country.nameEn,
    extraTerms: [country.currencyCode],
    regex: new RegExp(`\\b(${escaped}|${country.currencyCode})\\b`, 'i'),
  }
}

const TOPIC_CONFIG: Record<
  CountryTopicCategory,
  {
    subTerms: string[]
    regex: RegExp
  }
> = {
  ALL: {
    subTerms: ['economy', 'market', 'trade', 'investment', 'industry'],
    regex: /\b(econom|market|trade|export|import|gdp|invest|bank|rate|inflation|growth|industry|tariff|stock|bond|currency|chip|semiconductor|tech|energy|oil|ev|finance|fund|billion|million|company|corp|business|manufacturing|factory|supply chain|revenue|profit|tax|policy|central bank|deal|pact)\b/i,
  },
  SEMICONDUCTOR_AI: {
    subTerms: ['semiconductor', 'chip', 'AI', 'data center'],
    regex: /\b(semiconductor|semiconductors|chip|chips|chipmaker|wafer|foundry|fab\b|fabs\b|tsmc|nvidia|micron|samsung|hynix|asml|arm\b|ai\b|artificial intelligence|gpu|data center|tech|electronics|computing|quantum)\b/i,
  },
  CENTRAL_BANK: {
    subTerms: ['interest rate', 'inflation', 'central bank', 'currency', 'bond'],
    regex: /\b(rate|rates|inflation|cpi|deflation|central bank|fed\b|ecb|boj|pboc|rbi|bok|rba|snb|currency|forex|dollar|yen|yuan|rupee|won|euro|sterling|peso|lira|bond|bonds|yield|yields|treasury|gdp|monetary|fiscal|debt|deficit)\b/i,
  },
  ENERGY: {
    subTerms: ['energy', 'EV', 'battery', 'oil', 'nuclear', 'solar'],
    regex: /\b(energy|oil|crude|gas|lng|solar|wind|nuclear|reactor|ev\b|evs\b|electric vehicle|battery|batteries|lithium|grid|power|renewable|hydrogen|opec|refinery|mining|coal|electricity)\b/i,
  },
  TRADE: {
    subTerms: ['trade', 'tariff', 'export', 'supply chain', 'manufacturing'],
    regex: /\b(trade|tariff|tariffs|export|exports|import|imports|supply chain|manufacturing|factory|customs|sanction|sanctions|pact|deal|wto|fdi|investment|port|shipping|logistics)\b/i,
  },
  FINANCE: {
    subTerms: ['stock', 'market', 'bank', 'investment', 'IPO'],
    regex: /\b(stock|stocks|shares|equity|equities|market|index|bank|banks|banking|ipo|fund|invest|investment|investor|billion|million|valuation|earnings|profit|revenue|merger|acquisition|fintech|capital|wealth)\b/i,
  },
}

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

/**
 * Fetches country-specific & sector/topic-specific economic news on-demand.
 * Powered by 820+ item Reuters/Bloomberg/FT/CNBC live RSS pool.
 * When `country` is null or `country.id === 'ALL'`, fetches Global Overall (세계종합) news.
 */
export async function fetchCountrySpecificNews(
  country: CountryMeta | null,
  topic: CountryTopicCategory,
  customQuery = '',
  forceRefresh = false
): Promise<CountryNewsArticle[]> {
  const isAll = !country || country.id === 'ALL'
  const scopeId = isAll ? 'ALL' : country.id
  const cleanCustom = customQuery.trim()
  const cacheKey = `${scopeId}::${topic}::${cleanCustom.toLowerCase()}`
  const now = Date.now()

  if (!forceRefresh) {
    const cached = countryNewsCache.get(cacheKey)
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return cached.items
    }
  }

  const englishCustomQuery = cleanCustom ? await translateQueryToEnglish(cleanCustom) : ''
  const countryProfile = isAll ? null : getCountrySearchProfile(country)
  const topicConfig = TOPIC_CONFIG[topic]

  // Build custom regex if customQuery is provided
  const customTokens = englishCustomQuery
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9+-]/g, ''))
    .filter((w) => w.length >= 2)

  const customRegex =
    customTokens.length > 0
      ? new RegExp(
          `\\b(${customTokens
            .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')})`,
          'i'
        )
      : null

  // Filter directly from 820+ item Reuters/Bloomberg/CNBC/FT RSS Pool (instant 0ms filtering)
  const pool = await getRssPoolItems()
  const matched: CountryNewsArticle[] = []

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i]
    const fullText = `${item.title} ${item.description}`

    if (isAll) {
      if (customRegex) {
        if (!customRegex.test(fullText)) continue
      } else if (topic !== 'ALL' && !topicConfig.regex.test(fullText)) {
        continue
      }
      const related = detectRelatedCountries(fullText)
      matched.push({
        id: `rss-ALL-${i}`,
        title: item.title,
        description: item.description || undefined,
        url: item.url,
        source: item.source,
        publishedAt: item.publishedAt,
        countryId: 'ALL',
        topic,
        relatedCountryIds: related,
      })
    } else {
      if (!countryProfile!.regex.test(fullText)) continue
      if (customRegex) {
        if (!customRegex.test(fullText)) continue
      } else if (topic !== 'ALL' && !topicConfig.regex.test(fullText)) {
        continue
      }
      matched.push({
        id: `rss-${country!.id}-${i}`,
        title: item.title,
        description: item.description || undefined,
        url: item.url,
        source: item.source,
        publishedAt: item.publishedAt,
        countryId: country!.id,
        topic,
        relatedCountryIds: [country!.id],
      })
    }
  }

  // Deduplicate by normalized title prefix (just in case)
  const seenTitles = new Set<string>()
  const seenUrls = new Set<string>()
  const deduplicated: CountryNewsArticle[] = []

  for (const item of matched) {
    const normTitle = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 50)
    if (!normTitle || seenTitles.has(normTitle) || seenUrls.has(item.url)) continue
    seenTitles.add(normTitle)
    seenUrls.add(item.url)
    deduplicated.push(item)
  }

  // Sort by most recent date
  deduplicated.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime() || 0
    const timeB = new Date(b.publishedAt).getTime() || 0
    return timeB - timeA
  })

  const finalItems = deduplicated.slice(0, 16)
  countryNewsCache.set(cacheKey, { ts: Date.now(), items: finalItems })
  return finalItems
}


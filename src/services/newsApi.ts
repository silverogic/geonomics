import type {
  EconomicNewsData,
  Language,
  MacroBriefItem,
  NewsCategory,
} from '../types/economics'
import { COUNTRIES } from '../data/countries'

const BRIEF_JSON_URL = 'https://raw.githubusercontent.com/givanchris/News/main/data/brief.json'

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
    id: 'IRN',
    regex: /\b(Iran|Iranian|Tehran|Hormuz)\b/i,
  },
  {
    id: 'RUS',
    regex: /\b(Russia|Russian|Moscow|Ruble)\b/i,
  },
  {
    id: 'BRA',
    regex: /\b(Brazil|Brazilian|Bovespa|Brasilia)\b/i,
  },
  {
    id: 'CHE',
    regex: /\b(Switzerland|Swiss|SNB|Zurich)\b/i,
  },
  {
    id: 'SGP',
    regex: /\b(Singapore|MAS|Straits Times)\b/i,
  },
]

const validCountryIds = new Set(COUNTRIES.map((c) => c.id))

export function detectRelatedCountries(text: string): string[] {
  if (!text) return []
  const matched: string[] = []
  for (const rule of COUNTRY_KEYWORD_RULES) {
    if (validCountryIds.has(rule.id) && rule.regex.test(text)) {
      matched.push(rule.id)
      if (matched.length >= 3) break
    }
  }
  return matched
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

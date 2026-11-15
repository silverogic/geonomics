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
    regex:
      /\b(U\.?S\.?|United States|Wall Street|Nasdaq|S&P 500|Dow Jones|Fed\b|Federal Reserve|Treasury|White House|SEC\b|FOMC|Powell)\b|(미국|미\s*증시|뉴욕증시|월가|나스닥|다우|연준|파월|백악관|달러|米国|ニューヨーク|FRB|美联储|美股|华尔街)/i,
  },
  {
    id: 'CHN',
    regex:
      /\b(China|Chinese|Beijing|PBOC|Shanghai|Shenzhen|Yuan|Renminbi)\b|(중국|베이징|상하이|인민은행|위안화|中国|北京|上海|人民銀行|人民币)/i,
  },
  {
    id: 'HKG',
    regex:
      /\b(Hong Kong|Hang Seng|HKEX)\b|(홍콩|항셍|香港|ハンセン)/i,
  },
  {
    id: 'KOR',
    regex:
      /\b(South Korea|Korea\b|Korean|KOSPI|KOSDAQ|Seoul|Bank of Korea|Samsung|SK Hynix|Hyundai)\b|(한국|국내|코스피|코스닥|한국은행|한은|원화|원\/달러|삼성전자|SK하이닉스|현대차|서울|韓国|ソウル|ウォン)/i,
  },
  {
    id: 'JPN',
    regex:
      /\b(Japan|Japanese|Tokyo|Nikkei|Bank of Japan|BOJ|Yen|Ueda)\b|(일본|도쿄|닛케이|일본은행|엔화|엔저|엔고|日本|東京|日銀|日経|円安|円高)/i,
  },
  {
    id: 'DEU',
    regex:
      /\b(Germany|German|Frankfurt|Berlin|DAX|Bundesbank|ECB|Eurozone|Lagarde)\b|(독일|프랑크푸르트|베를린|유로존|유럽중앙은행|유로화|ドイツ|欧州中央銀行|ユーロ圏)/i,
  },
  {
    id: 'GBR',
    regex:
      /\b(U\.?K\.?|United Kingdom|Britain|British|London|FTSE|Bank of England|BOE|Sterling|Pound)\b|(영국|런던|파운드|영란은행|英国|ロンドン|ポンド|英中銀)/i,
  },
  {
    id: 'TWN',
    regex:
      /\b(Taiwan|Taiwanese|Taipei|TSMC|Foxconn|TAIEX)\b|(대만|타이완|TSMC|폭스콘|台湾|台北)/i,
  },
  {
    id: 'IND',
    regex:
      /\b(India|Indian|Mumbai|New Delhi|Sensex|Nifty|RBI|Rupee|Modi)\b|(인도|뭄바이|뉴델리|루피|모디|インド|ムンバイ|ルピー)/i,
  },
  {
    id: 'FRA',
    regex:
      /\b(France|French|Paris|CAC 40|Macron)\b|(프랑스|파리|마크롱|フランス|パリ)/i,
  },
  {
    id: 'ITA',
    regex:
      /\b(Italy|Italian|Rome|Milan|FTSE MIB|Meloni)\b|(이탈리아|로마|밀라노|イタリア|ミラノ)/i,
  },
  {
    id: 'CAN',
    regex:
      /\b(Canada|Canadian|Toronto|Ottawa|Bank of Canada|TSX)\b|(캐나다|토론토|오타와|カナダ|トロント)/i,
  },
  {
    id: 'AUS',
    regex:
      /\b(Australia|Australian|Sydney|Canberra|RBA|ASX)\b|(호주|오스트레일리아|시드니|オーストラリア|シドニー)/i,
  },
  {
    id: 'SAU',
    regex:
      /\b(Saudi Arabia|Saudi|Riyadh|Aramco|OPEC|Hormuz)\b|(사우디|리야드|아람코|오펙|호르무즈|サウジ|アラムコ)/i,
  },
  {
    id: 'VNM',
    regex:
      /\b(Vietnam|Vietnamese|Hanoi|Ho Chi Minh|VinFast)\b|(베트남|하노이|호찌민|호치민|ベトナム|ハノイ)/i,
  },
  {
    id: 'SGP',
    regex:
      /\b(Singapore|Singaporean|MAS|Straits Times|Temasek)\b|(싱가포르|테마섹|シンガポール)/i,
  },
  {
    id: 'CHE',
    regex:
      /\b(Switzerland|Swiss|SNB|Zurich|Geneva|UBS)\b|(스위스|취리히|제네바|スイス|チューリッヒ)/i,
  },
  {
    id: 'BRA',
    regex:
      /\b(Brazil|Brazilian|Bovespa|Brasilia|Sao Paulo|Petrobras|Lula|Real)\b|(브라질|상파울루|보베스파|룰라|ブラジル)/i,
  },
  {
    id: 'MEX',
    regex:
      /\b(Mexico|Mexican|Mexico City|Banxico|Peso)\b|(멕시코|페소|メキシコ)/i,
  },
  {
    id: 'IDN',
    regex:
      /\b(Indonesia|Indonesian|Jakarta|Rupiah)\b|(인도네시아|자카르타|루피아|インドネシア)/i,
  },
  {
    id: 'TUR',
    regex:
      /\b(Turkey|Turkish|Turkiye|Istanbul|Ankara|Erdogan|Lira|TCMB)\b|(튀르키예|터키|이스탄불|리라|トルコ|リラ)/i,
  },
  {
    id: 'NLD',
    regex:
      /\b(Netherlands|Dutch|ASML|Amsterdam|AEX)\b|(네덜란드|암스테르담|ASML|オランダ)/i,
  },
  {
    id: 'ESP',
    regex:
      /\b(Spain|Spanish|Madrid|Barcelona|IBEX)\b|(스페인|마드리드|바르셀로나|スペイン|マドリード)/i,
  },
  {
    id: 'ARE',
    regex:
      /\b(UAE|United Arab Emirates|Dubai|Abu Dhabi|Emirates)\b|(아랍에미리트|두바이|아부다비|ドバイ|アブダビ)/i,
  },
  {
    id: 'ISR',
    regex:
      /\b(Israel|Israeli|Tel Aviv|Jerusalem|Shekel)\b|(이스라엘|텔아비브|예루살렘|중동|イスラエル)/i,
  },
  {
    id: 'QAT',
    regex:
      /\b(Qatar|Qatari|Doha)\b|(카타르|도하|カタール)/i,
  },
  {
    id: 'THA',
    regex:
      /\b(Thailand|Thai|Bangkok|Baht)\b|(태국|방콕|바트|タイ|バンコク)/i,
  },
  {
    id: 'MYS',
    regex:
      /\b(Malaysia|Malaysian|Kuala Lumpur|Ringgit)\b|(말레이시아|쿠알라룸푸르|링깃|マレーシア)/i,
  },
  {
    id: 'PHL',
    regex:
      /\b(Philippines|Philippine|Manila|Peso)\b|(필리핀|마닐라|フィリピン|マニラ)/i,
  },
  {
    id: 'SWE',
    regex:
      /\b(Sweden|Swedish|Stockholm|Riksbank|Krona)\b|(스웨덴|스톡홀름|スウェーデン)/i,
  },
  {
    id: 'POL',
    regex:
      /\b(Poland|Polish|Warsaw|Zloty)\b|(폴란드|바르샤바|ポーランド)/i,
  },
  {
    id: 'NOR',
    regex:
      /\b(Norway|Norwegian|Oslo|Norges Bank)\b|(노르웨이|오슬로|ノルウェー)/i,
  },
  {
    id: 'ARG',
    regex:
      /\b(Argentina|Argentine|Buenos Aires|Milei)\b|(아르헨티나|밀레이|アルゼンチン)/i,
  },
  {
    id: 'ZAF',
    regex:
      /\b(South Africa|Johannesburg|Rand|SARB)\b|(남아공|남아프리카|요하네스버그|南アフリカ)/i,
  },
  {
    id: 'EGY',
    regex:
      /\b(Egypt|Egyptian|Cairo|Suez)\b|(이집트|카이로|수에즈|エジプト|スエズ)/i,
  },
  {
    id: 'NGA',
    regex:
      /\b(Nigeria|Nigerian|Lagos|Abuja|Naira)\b|(나이지리아|라고스|ナイジェリア)/i,
  },
  {
    id: 'NZL',
    regex:
      /\b(New Zealand|Auckland|Wellington|RBNZ|Kiwi)\b|(뉴질랜드|오클랜드|ニュージーランド)/i,
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

  // 3. Fallback: Check other tracked countries in COUNTRIES if we still haven't reached limit
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

// ============================================================================
// ON-THE-FLY REAL-TIME TRANSLATION ENGINE (Memory + LocalStorage Cache)
// ============================================================================

const translationMemoryCache = new Map<string, string>()
const STORAGE_CACHE_PREFIX = 'geonomics_news_tr_v2_'
const hydratedLangs = new Set<Language>()

const TARGET_LANG_CODE_MAP: Record<Language, string> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-CN',
  es: 'es',
  hi: 'hi',
}

function getCacheKey(lang: Language, text: string): string {
  return `${lang}:::${text}`
}

function hydrateLangCacheFromStorage(lang: Language): void {
  if (hydratedLangs.has(lang) || typeof window === 'undefined') return
  hydratedLangs.add(lang)
  try {
    const raw = window.localStorage.getItem(`${STORAGE_CACHE_PREFIX}${lang}`)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, string>
    for (const [orig, tr] of Object.entries(parsed)) {
      if (orig && tr) {
        translationMemoryCache.set(getCacheKey(lang, orig), tr)
      }
    }
  } catch {
    // Ignore storage read errors
  }
}

function persistLangCacheToStorage(lang: Language): void {
  if (typeof window === 'undefined') return
  try {
    const obj: Record<string, string> = {}
    const prefix = `${lang}:::`
    let count = 0
    for (const [k, v] of translationMemoryCache.entries()) {
      if (k.startsWith(prefix)) {
        obj[k.slice(prefix.length)] = v
        count++
        if (count >= 250) break
      }
    }
    window.localStorage.setItem(`${STORAGE_CACHE_PREFIX}${lang}`, JSON.stringify(obj))
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Checks whether a headline is already written in the user's selected UI language
 * so native regional RSS articles (e.g. Korean Google News when lang === 'ko')
 * are kept untouched while foreign/English wire headlines are translated.
 */
export function isAlreadyInTargetLang(text: string, lang: Language): boolean {
  if (!text) return true
  switch (lang) {
    case 'ko':
      return /[가-힣]/.test(text)
    case 'ja':
      return /[ぁ-んァ-ヶ]/.test(text)
    case 'zh':
      return /[\u4e00-\u9fff]/.test(text) && !/[가-힣ぁ-んァ-ヶ]/.test(text)
    case 'hi':
      return /[\u0900-\u097F]/.test(text)
    case 'en':
      return !/[가-힣ぁ-んァ-ヶ\u4e00-\u9fff\u0900-\u097Fáéíóúñ¿¡]/i.test(text)
    case 'es':
      return (
        /[áéíóúñ¿¡]/i.test(text) ||
        /\b(el|la|los|las|del|para|por|con|sobre|entre|tras|según|mercado|economía|banco|acciones|dólar|inflación)\b/i.test(
          text
        )
      )
    default:
      return false
  }
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
  ['lagarde', 'Lagarde'],
  ['ueda', 'Ueda'],
  ['yellen', 'Yellen'],
  ['trump', 'Trump'],
  ['biden', 'Biden'],
])

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

const FINANCIAL_PRE_GLOSSARY: Array<[RegExp, string]> = [
  [/\bflight[- ]to[- ]safety\b/gi, 'safe-haven asset buying'],
  [/\bflight[- ]to[- ]quality['’]?\s*bid\b/gi, 'safe-haven buying demand'],
  [/\bflight[- ]to[- ]quality\b/gi, 'safe-haven asset buying'],
  [/\bsafe[- ]haven bid\b/gi, 'safe-haven buying demand'],
  [/\bbid for Treasuries\b/gi, 'buying demand for U.S. Treasury bonds'],
  [/\binto haven(s)?\b/gi, 'into safe-haven assets'],
  [/\b10-year yield\b/gi, 'U.S. 10-year Treasury bond yield'],
  [/\b2-year yield\b/gi, 'U.S. 2-year Treasury bond yield'],
  [/\b30-year yield\b/gi, 'U.S. 30-year Treasury bond yield'],
  [/\b([0-9.]+%)\s+yields\b/gi, '$1 government bond yields'],
  [/\bTreasury yields\b/gi, 'U.S. Treasury bond yields'],
  [/\bTreasury yield\b/gi, 'U.S. Treasury bond yield'],
  [/\bfor Treasuries\b/gi, 'for U.S. Treasury bonds'],
  [/\bin Treasuries\b/gi, 'in U.S. Treasury bonds'],
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
  [/\bgreenback\b/gi, 'U.S. dollar'],
  [/\bmega-cap tech names\b/gi, 'big-tech stocks'],
  [/\bmega-cap tech\b/gi, 'big-tech'],
  [/\bcapex\b/gi, 'capital expenditure'],
  [/\bopex\b/gi, 'operating expenditure'],
  [/\btech selloff\b/gi, 'technology stock selloff'],
  [/\bequity selloff\b/gi, 'stock market selloff'],
  [/\brisk-off\b/gi, 'risk-averse'],
  [/\brisk-on\b/gi, 'risk-seeking'],
  [/\bhigher for longer\b/gi, 'high interest rates for longer'],
]

function preprocessForTranslation(text: string): string {
  let out = normalizeAllCapsHeadline(text.replace(/\s+/g, ' ').trim())
  for (const [pattern, replacement] of FINANCIAL_PRE_GLOSSARY) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function postprocessFinancialTranslation(text: string, lang: Language): string {
  const trimmed = text.trim()
  if (lang !== 'ko') return trimmed

  return trimmed
    .replace(/미국 10년 만기 국채\s*수익률은/g, '미 10년물 국채 금리는')
    .replace(/미국 10년 만기 국채\s*수익률이/g, '미 10년물 국채 금리가')
    .replace(/미국 10년 만기 국채\s*수익률을/g, '미 10년물 국채 금리를')
    .replace(/미국 10년 만기 국채\s*수익률/g, '미 10년물 국채 금리')
    .replace(/10년 만기 미국 국채\s*수익률/g, '미 10년물 국채 금리')
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
    .replace(/금리은/g, '금리는')
    .replace(/금리이/g, '금리가')
    .replace(/금리을/g, '금리를')
    .replace(/나스닥-100/g, '나스닥 100')
    .replace(/Nasdaq-100/g, '나스닥 100')
    .replace(/안전 피난처/g, '안전자산')
    .replace(/안전 자산/g, '안전자산')
    .replace(/자본 지출/g, '설비투자(CAPEX)')
    .replace(/연방준비제도\(Fed\)/g, '연준(Fed)')
    .replace(/연방준비제도/g, '연준(Fed)')
    .trim()
}

function extractClients5TranslatedText(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return ''
  if (typeof data[0] === 'string') return data[0]
  if (Array.isArray(data[0]) && typeof data[0][0] === 'string') return data[0][0]
  return ''
}

async function translateSingleTextFallback(
  text: string,
  targetLangCode: string,
  lang: Language
): Promise<string> {
  const clean = preprocessForTranslation(text)
  if (!clean) return text

  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(
      targetLangCode
    )}&q=${encodeURIComponent(clean)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (res.ok) {
      const data = await res.json()
      const extracted = extractClients5TranslatedText(data)
      if (extracted) {
        return postprocessFinancialTranslation(extracted, lang)
      }
    }
  } catch {
    // Fallback to MyMemory below
  }

  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      clean.slice(0, 480)
    )}&langpair=en|${encodeURIComponent(targetLangCode)}`
    const res = await fetch(mmUrl, { signal: AbortSignal.timeout(4000) })
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
 * Translates an array of headlines on-the-fly in real time into `lang`.
 * Skips headlines that are already in the target language.
 */
export async function translateBatchOnTheFly(
  texts: string[],
  lang: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>()
  if (texts.length === 0) return resultMap

  hydrateLangCacheFromStorage(lang)

  const targetLangCode = TARGET_LANG_CODE_MAP[lang] || 'en'
  const uncached: string[] = []
  const seenUncached = new Set<string>()

  for (const raw of texts) {
    if (!raw || !raw.trim()) continue
    if (isAlreadyInTargetLang(raw, lang)) {
      resultMap.set(raw, raw)
      continue
    }
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

  const batches: string[][] = []
  let currentBatch: string[] = []
  let currentLen = 0

  for (const item of uncached) {
    const preprocessed = preprocessForTranslation(item)
    if (
      currentBatch.length >= 10 ||
      (currentLen + preprocessed.length > 1500 && currentBatch.length > 0)
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
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(
          targetLangCode
        )}&q=${encodeURIComponent(joinedPayload)}`
        const res = await fetch(url, { signal: AbortSignal.timeout(4500) })
        if (res.ok) {
          const data = await res.json()
          const rawTranslated = extractClients5TranslatedText(data)
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

      await Promise.all(
        batch.map(async (orig) => {
          const tr = await translateSingleTextFallback(orig, targetLangCode, lang)
          translationMemoryCache.set(getCacheKey(lang, orig), tr)
          resultMap.set(orig, tr)
        })
      )
    })
  )

  persistLangCacheToStorage(lang)
  return resultMap
}

// ============================================================================
// BREAKING ECONOMIC NEWS ENGINE FOR 3D/2D GLOBE
// ============================================================================

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

function stripTrailingPublisherFromTitle(title: string): string {
  const idx = title.lastIndexOf(' - ')
  if (idx > 14 && title.length - idx <= 36) {
    return title.slice(0, idx).trim()
  }
  return title.trim()
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

const EXCLUDED_FLUFF_REGEX =
  /\b(NHL|NBA|NFL|MLB|Premier League|Champions League|Figure Skating|Skate America|Soccer|Football|Tennis|Golf|Cricket|Rugby|Formula 1|Olympics|Boxing|UFC|MMA|Baseball|Basketball|Volleyball|Sponichi|Oscars|Grammys|Box Office|Crossword)\b|(スポニチ|サッカー|野球|フィギュア|五輪)/i

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

      const rawTitle = titleMatch ? decodeXmlEntities(titleMatch[1]) : ''
      const title = stripTrailingPublisherFromTitle(rawTitle)
      const description = descMatch ? decodeXmlEntities(descMatch[1]) : ''
      const url = linkMatch ? decodeXmlEntities(linkMatch[1]) : ''
      const pubDate = pubMatch ? decodeXmlEntities(pubMatch[1]) : ''
      const publisher = wireMatch ? decodeXmlEntities(wireMatch[1]) : ''

      if (!title || !url) continue
      if (EXCLUDED_FLUFF_REGEX.test(rawTitle) || EXCLUDED_FLUFF_REGEX.test(publisher)) {
        continue
      }

      parsed.push({
        title,
        description: description !== rawTitle ? description : '',
        url,
        source: publisher || formatPublisherFromUrl(url),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      })
    }

    parsed.sort(
      (a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0)
    )

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
const MAX_ARTICLES_PER_COUNTRY = 4

async function fetchLiveBreakingEndpoint(lang: Language): Promise<RawRssPoolItem[]> {
  const candidateEndpoints: string[] = []
  if (import.meta.env?.DEV) {
    candidateEndpoints.push(`/api/breaking-news?lang=${encodeURIComponent(lang)}`)
  }
  if (PROXY_URL) {
    candidateEndpoints.push(`${PROXY_URL}/?news=breaking&lang=${encodeURIComponent(lang)}`)
  }

  for (const endpoint of candidateEndpoints) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(2500) })
      if (!res.ok) continue
      const data = (await res.json()) as {
        items?: Array<{ title: string; url: string; source: string; publishedAt: string }>
      }
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items
          .filter((it) => it.title && !EXCLUDED_FLUFF_REGEX.test(it.title))
          .map((it) => ({
            title: stripTrailingPublisherFromTitle(it.title),
            description: '',
            url: it.url,
            source: it.source,
            publishedAt: it.publishedAt,
          }))
      }
    } catch {
      // Try next candidate endpoint
    }
  }
  return []
}

/**
 * Fetches live breaking economic news from the local dev middleware or Cloudflare Worker
 * plus the 820+ global wire RSS pool, maps articles to their related ISO3 country codes,
 * and translates all selected headlines into `lang` for the Economic Globe News Mode.
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

  const [liveItems, poolItems] = await Promise.all([
    fetchLiveBreakingEndpoint(lang),
    getRssPoolItems(),
  ])

  const combinedItems = [...liveItems, ...poolItems]
  const rawByCountry = new Map<string, CountryNewsArticle[]>()
  const seenKeysPerCountry = new Map<string, Set<string>>()

  for (let i = 0; i < combinedItems.length; i++) {
    const item = combinedItems[i]
    const fullText = `${item.title} ${item.description}`
    const related = detectRelatedCountries(fullText, 2)

    for (const cid of related) {
      const list = rawByCountry.get(cid) || []

      const normKey = item.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥]/g, '')
        .slice(0, 36)
      const countrySeen = seenKeysPerCountry.get(cid) || new Set<string>()
      if (normKey && countrySeen.has(normKey)) continue
      if (normKey) countrySeen.add(normKey)
      seenKeysPerCountry.set(cid, countrySeen)

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
      rawByCountry.set(cid, list)
    }
  }

  // Sort each country's articles newest-first and keep top MAX_ARTICLES_PER_COUNTRY
  const byCountry = new Map<string, CountryNewsArticle[]>()
  for (const [cid, list] of rawByCountry.entries()) {
    list.sort(
      (a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0)
    )
    byCountry.set(cid, list.slice(0, MAX_ARTICLES_PER_COUNTRY))
  }

  // Collect all unique headlines across matched countries and translate into `lang`
  const titlesToTranslate: string[] = []
  for (const list of byCountry.values()) {
    for (const art of list) {
      titlesToTranslate.push(art.title)
    }
  }

  if (titlesToTranslate.length > 0) {
    const translatedMap = await translateBatchOnTheFly(titlesToTranslate, lang)
    for (const [cid, list] of byCountry.entries()) {
      byCountry.set(
        cid,
        list.map((art) => ({
          ...art,
          title: translatedMap.get(art.title) || art.title,
        }))
      )
    }
  }

  globeBreakingCache.set(lang, { ts: now, map: byCountry })
  return byCountry
}

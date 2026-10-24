import type { ExchangeRates, Language } from '../types/economics'
import { COUNTRIES } from '../data/countries'
import { getConversionRate } from './exchangeApi'

export interface TopCompanyItem {
  rank: number
  symbol: string          // e.g. "NASDAQ:NVDA" or "KRX:005930"
  exchange: string        // e.g. "NASDAQ", "KRX"
  ticker: string          // e.g. "NVDA", "005930"
  name: string            // Cleaned company name
  marketCapUsd: number    // Dynamically fetched market cap in USD
  price: number           // Current stock price in trading currency
  priceCurrency: string   // Trading currency code (e.g. "USD", "KRW")
  changePct: number       // 24h price change percentage
  sector: string          // Localized industry sector
  logoUrl: string | null  // Official SVG logo URL if available
}

export interface CountryTopCompaniesResult {
  countryId: string
  companies: TopCompanyItem[]
  totalListedCount: number
  fetchedAt: number
}

const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes in-memory runtime cache (no static files)
const memoryCache = new Map<string, CountryTopCompaniesResult>()
const inflightRequests = new Map<string, Promise<CountryTopCompaniesResult>>()

/**
 * Special endpoint overrides for markets that require a dedicated scanner slug
 */
const DEDICATED_MARKET_ENDPOINTS: Record<string, string> = {
  RUS: 'https://scanner.tradingview.com/russia/scan',
}

/**
 * Country English name overrides if TradingView's country filter differs from CountryMeta.nameEn
 */
const TV_COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  KOR: 'South Korea',
  USA: 'United States',
  GBR: 'United Kingdom',
  ARE: 'United Arab Emirates',
  CZE: 'Czech Republic',
  CIV: 'Ivory Coast',
}

/**
 * Strict domestic stock exchange whitelist per country.
 * Prevents foreign-listed stocks (e.g. NYSE/NASDAQ/HKEX/LSE cross-listings or tax-inversion companies)
 * from polluting a country's domestic stock market Top 5.
 */
const COUNTRY_DOMESTIC_EXCHANGES: Record<string, string[]> = {
  USA: ['NASDAQ', 'NYSE', 'AMEX'],
  KOR: ['KRX'],
  CHN: ['SSE', 'SZSE'],
  HKG: ['HKEX'],
  JPN: ['TSE'],
  TWN: ['TWSE'], // Strictly TWSE main board (excludes TPEX/OTC)
  IND: ['NSE', 'BSE'],
  GBR: ['LSE'],
  DEU: ['XETR', 'FWB'],
  FRA: ['EURONEXT'],
  ITA: ['MIL'],
  ESP: ['BME'],
  NLD: ['EURONEXT'],
  CHE: ['SIX'],
  SWE: ['OMXSTO'],
  CAN: ['TSX'],
  BRA: ['BMFBOVESPA'],
  AUS: ['ASX'],
  MEX: ['BMV'],
  IRL: ['EURONEXT'],
  SGP: ['SGX'],
  NZL: ['NZX'],
  NGA: ['NSENG'],
  ISR: ['TASE'],
  SAU: ['TADAWUL'],
  ARE: ['ADX', 'DFM'],
  ZAF: ['JSE'],
  IDN: ['IDX'],
  TUR: ['BIST'],
  POL: ['GPW'],
  BEL: ['EURONEXT'],
  NOR: ['OSL'],
  AUT: ['VIE'],
  DNK: ['OMXCOP'],
  FIN: ['OMXHEX'],
  PRT: ['EURONEXT'],
  THA: ['SET'],
  MYS: ['MYX'],
  PHL: ['PSE'],
  VNM: ['HOSE', 'HNX'],
  EGY: ['EGX'],
  ARG: ['BCBA'],
  CHL: ['BCS'],
  COL: ['BVC'],
  PER: ['BVL'],
  QAT: ['QSE'],
  KWT: ['KSE'],
  KAZ: ['KASE'],
  PAK: ['PSX'],
  BGD: ['DSEBD'],
  GRC: ['ATHEX'],
  ROU: ['BVB'],
  HUN: ['BET'],
  CZE: ['PSECZ'],
  MAR: ['CSEMA'],
  SVK: ['BSSE'],
  VEN: ['BVCV'],
  KEN: ['NSEKE'],
  BGR: ['BSESOF'],
  LKA: ['CSELK'],
  HRV: ['ZSE'],
  SRB: ['BELEX'],
  LTU: ['OMXVSE'],
  SVN: ['LJSE'],
  TUN: ['BVMT'],
  BHR: ['BAHRAIN'],
  LVA: ['OMXRSE'],
  EST: ['OMXTSE'],
  ISL: ['OMXICE'],
  CYP: ['CSECY'],
  LUX: ['LUXSE'],
}

/**
 * Countries whose stock exchanges are unsanctioned/unsupported in live global feeds
 * and must NEVER fall back to regional or proxy country tickers.
 */
const UNSUPPORTED_COUNTRIES = new Set<string>([
  'IRN', // Iran (Tehran Stock Exchange - never mix with Saudi/UAE)
  'PRK', // North Korea
  'CUB', // Cuba
  'SYR', // Syria
  'AFG', // Afghanistan
  'YEM', // Yemen
  'SDN', // Sudan
  'MMR', // Myanmar
  'ETH', // Ethiopia
])

/**
 * Cleans verbose legal/share-class suffixes from scanner company descriptions
 * so that names render cleanly across modal cards, heatmap HUDs, and comparison views.
 */
function cleanCompanyName(rawName: string, ticker: string): string {
  if (!rawName) return ticker
  let name = rawName.trim()

  // Korean share class suffix cleanup (e.g. "삼성전자보통주" -> "삼성전자", "에스케이하이닉스보통주" -> "SK하이닉스")
  name = name.replace(/보통주$/, '').replace(/우선주$/, '').trim()
  if (name === '에스케이하이닉스') name = 'SK하이닉스'
  if (name === '에스케이이노베이션') name = 'SK이노베이션'
  if (name === '에스케이텔레콤') name = 'SK텔레콤'
  if (name === '엘지에너지솔루션') name = 'LG에너지솔루션'
  if (name === '엘지전자') name = 'LG전자'
  if (name === '엘지화학') name = 'LG화학'
  if (name === '삼성바이오로직스') name = '삼성바이오로직스'

  // Strip verbose share class / ADR / legal suffixes
  name = name
    .replace(/\s+TEMP$/i, '')
    .replace(/\s+Sponsored\s+ADR.*$/i, '')
    .replace(/\s+Units\s+Cons\..*$/i, '')
    .replace(/\s+\(Persero\)\s+Tbk.*$/i, '')
    .replace(/\s+Tbk(\s+Class\s+[A-Z])?$/i, '')
    .replace(/\s+Class\s+[A-Z0-9]+$/i, '')
    .replace(/\s+Series\s+[A-Z0-9]+$/i, '')
    .replace(/,?\s+Co\.,?\s+Ltd\.?$/i, '')
    .replace(/,?\s+Corporation$/i, ' Corp.')
    .replace(/,?\s+Incorporated$/i, ' Inc.')
    .replace(/\s+Public\s+Company\s+Limited$/i, '')
    .replace(/\s+Societe\s+Anonyme$/i, '')
    .replace(/\s+Anonim\s+Sirketi$/i, '')
    .replace(/\s+S\.A\.B\.\s+de\s+C\.V\.$/i, '')
    .replace(/\s+SAB\s+de\s+CV$/i, '')
    .trim()

  return name || rawName
}

/**
 * Generates a normalized deduplication key based strictly on the company's cleaned name
 * (NOT `logoid`, because conglomerate affiliates like Samsung Electronics, Samsung Biologics,
 * and Samsung Electro-Mechanics share the same `logoid: "samsung"`!).
 */
function getDeduplicationKey(cleanedName: string): string {
  const normalized = cleanedName
    .toLowerCase()
    .replace(/\b(inc|corp|ltd|plc|sa|ag|nv|se|spa|bhd|limited|company|co|temp)\b/g, '')
    .replace(/[^a-z0-9가-힣一-龥ぁ-んァ-ヶ]/g, '')
    .slice(0, 18)
  return `name:${normalized}`
}

/**
 * Dynamically fetches the Top 5 companies by market capitalization for a given country
 * directly at runtime with zero static JSON storage.
 */
export async function fetchCountryTopCompanies(
  countryId: string,
  lang: Language = 'en',
  exchangeRates?: ExchangeRates | null,
  forceRefresh = false
): Promise<CountryTopCompaniesResult> {
  const upperId = countryId.toUpperCase()

  if (UNSUPPORTED_COUNTRIES.has(upperId)) {
    return {
      countryId: upperId,
      companies: [],
      totalListedCount: 0,
      fetchedAt: Date.now(),
    }
  }

  const cacheKey = `${upperId}:${lang}`

  if (!forceRefresh) {
    const cached = memoryCache.get(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached
    }
    const inflight = inflightRequests.get(cacheKey)
    if (inflight) {
      return inflight
    }
  }

  const countryMeta = COUNTRIES.find((c) => c.id === upperId)
  const tvCountryName = TV_COUNTRY_NAME_OVERRIDES[upperId] || countryMeta?.nameEn

  if (!tvCountryName && !DEDICATED_MARKET_ENDPOINTS[upperId]) {
    return {
      countryId: upperId,
      companies: [],
      totalListedCount: 0,
      fetchedAt: Date.now(),
    }
  }

  const endpoint = DEDICATED_MARKET_ENDPOINTS[upperId] || 'https://scanner.tradingview.com/global/scan'
  const isDedicatedEndpoint = Boolean(DEDICATED_MARKET_ENDPOINTS[upperId])
  const domesticExchanges = COUNTRY_DOMESTIC_EXCHANGES[upperId]

  // Strictly require a verified domestic exchange mapping (or dedicated endpoint)
  // so unmapped countries never fall back to foreign exchange listings (e.g. OTC/NYSE/LSE/JSE).
  if ((!domesticExchanges || domesticExchanges.length === 0) && !isDedicatedEndpoint) {
    return {
      countryId: upperId,
      companies: [],
      totalListedCount: 0,
      fetchedAt: Date.now(),
    }
  }

  const filter: Array<Record<string, unknown>> = [
    { left: 'type', operation: 'equal', right: 'stock' },
    { left: 'typespecs', operation: 'has_none_of', right: ['preferred', 'dr'] },
  ]

  // Keep is_primary=true except for Canada (TSX), where dual-listed Canadian giants like Shopify (TSX:SHOP)
  // have NASDAQ marked as primary in TradingView
  if (upperId !== 'CAN') {
    filter.push({ left: 'is_primary', operation: 'equal', right: true })
  }

  if (!isDedicatedEndpoint && tvCountryName) {
    filter.unshift({ left: 'country', operation: 'equal', right: tvCountryName })
  }

  if (domesticExchanges && domesticExchanges.length > 0) {
    filter.push(
      domesticExchanges.length === 1
        ? { left: 'exchange', operation: 'equal', right: domesticExchanges[0] }
        : { left: 'exchange', operation: 'in_range', right: domesticExchanges }
    )
  }

  const tvLang = lang === 'ko' ? 'ko' : lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : lang === 'es' ? 'es' : 'en'

  const requestPromise = (async (): Promise<CountryTopCompaniesResult> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          filter,
          options: { lang: tvLang },
          columns: [
            'name',
            'description',
            'market_cap_basic',
            'fundamental_currency_code',
            'currency',
            'close',
            'change',
            'logoid',
            'sector.tr',
            'sector',
            'indexes',
            'country',
          ],
          sort: {
            sortBy: 'market_cap_basic',
            sortOrder: 'desc',
          },
          range: [0, 20],
        }),
      })

      if (!response.ok) {
        throw new Error(`Scanner HTTP ${response.status}`)
      }

      const json = (await response.json()) as {
        totalCount?: number
        data?: Array<{ s: string; d: unknown[] }>
      }

      const rows = Array.isArray(json.data) ? json.data : []
      const seenKeys = new Set<string>()
      const companies: TopCompanyItem[] = []

      for (const row of rows) {
        if (!row || !Array.isArray(row.d)) continue
        const [
          rawTicker,
          rawDesc,
          rawMarketCap,
          rawFundCurrency,
          rawPriceCurrency,
          rawClose,
          rawChange,
          rawLogoId,
          rawSectorTr,
          rawSectorEn,
          rawIndexes,
          rawRowCountry,
        ] = row.d

        const marketCapBasic = typeof rawMarketCap === 'number' ? rawMarketCap : 0
        if (marketCapBasic <= 0) continue

        // Strict country match check (prevents any cross-country contamination)
        if (!isDedicatedEndpoint && tvCountryName && typeof rawRowCountry === 'string' && rawRowCountry !== tvCountryName) {
          continue
        }

        // Benchmark index membership enforcement:
        // 1) South Korea (KOR): Benchmark is KOSPI (^KS11) -> Strictly require KRX:KOSPI and exclude KOSDAQ (KRX:KOSDAQ)
        // 2) United States (USA): Benchmark is S&P 500 (^GSPC) -> Require SP:SPX membership to exclude pre-IPO/synthetic tickers
        const indexPronames: string[] = Array.isArray(rawIndexes)
          ? rawIndexes
              .map((idx) => (idx && typeof idx === 'object' && 'proname' in idx ? String((idx as { proname: unknown }).proname) : ''))
              .filter(Boolean)
          : []

        if (upperId === 'KOR') {
          if (indexPronames.includes('KRX:KOSDAQ')) continue
          if (indexPronames.length > 0 && !indexPronames.includes('KRX:KOSPI')) continue
        }

        if (upperId === 'USA' && indexPronames.length > 0) {
          if (!indexPronames.includes('SP:SPX')) continue
        }

        const ticker = String(rawTicker || row.s.split(':')[1] || row.s)
        const exchange = row.s.includes(':') ? row.s.split(':')[0] : ''
        if (domesticExchanges && domesticExchanges.length > 0 && !domesticExchanges.includes(exchange)) {
          continue
        }
        const cleanedName = cleanCompanyName(String(rawDesc || ticker), ticker)
        const logoId = typeof rawLogoId === 'string' && rawLogoId.trim() ? rawLogoId.trim() : null

        const dedupKey = getDeduplicationKey(cleanedName)
        if (seenKeys.has(dedupKey)) continue
        seenKeys.add(dedupKey)

        // Convert marketCapBasic to USD if fundamental_currency_code is not already USD
        const fundCurrency = typeof rawFundCurrency === 'string' ? rawFundCurrency.toUpperCase() : 'USD'
        let marketCapUsd = marketCapBasic
        if (fundCurrency !== 'USD') {
          if (exchangeRates) {
            const rateToUsd = getConversionRate(exchangeRates, fundCurrency, 'USD')
            if (rateToUsd > 0) {
              marketCapUsd = marketCapBasic * rateToUsd
            }
          } else if (fundCurrency === 'RUB') {
            marketCapUsd = marketCapBasic / 95
          }
        }

        const price = typeof rawClose === 'number' ? rawClose : 0
        const priceCurrency = typeof rawPriceCurrency === 'string' ? rawPriceCurrency : fundCurrency
        const changePct = typeof rawChange === 'number' ? Number(rawChange.toFixed(2)) : 0
        const sector = String(rawSectorTr || rawSectorEn || '')

        companies.push({
          rank: companies.length + 1,
          symbol: row.s,
          exchange,
          ticker,
          name: cleanedName,
          marketCapUsd,
          price,
          priceCurrency,
          changePct,
          sector,
          logoUrl: logoId ? `https://s3-symbol-logo.tradingview.com/${logoId}.svg` : null,
        })

        if (companies.length === 5) break
      }

      const result: CountryTopCompaniesResult = {
        countryId: upperId,
        companies,
        totalListedCount: typeof json.totalCount === 'number' ? json.totalCount : companies.length,
        fetchedAt: Date.now(),
      }

      memoryCache.set(cacheKey, result)
      return result
    } catch (err) {
      console.warn(`Failed to fetch dynamic top companies for ${upperId}:`, err)
      return {
        countryId: upperId,
        companies: [],
        totalListedCount: 0,
        fetchedAt: Date.now(),
      }
    } finally {
      inflightRequests.delete(cacheKey)
    }
  })()

  inflightRequests.set(cacheKey, requestPromise)
  return requestPromise
}

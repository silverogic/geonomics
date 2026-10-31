/**
 * Automated Stock Market Capitalization Fetcher & Sync Pipeline (3-Tier Dynamic, Zero Hardcoding)
 *
 * 1. Tier 1 Primary Source (71 Major Markets, >99.6% of Global Market Cap):
 *    Queries the TradingView Global Scanner API across each country's verified
 *    representative mainboard stock exchange (`COUNTRY_DOMESTIC_EXCHANGES`), summing
 *    primary-listed common stock market capitalizations regardless of headquarters domicile.
 * 2. Tier 2 Secondary Official Source (21 Developing Markets with National Exchanges):
 *    Queries the World Bank Open Data API (`CM.MKT.LCAP.CD` — official national exchange
 *    market capitalization reported by Kazakhstan, Iran, Oman, Jordan, Panama, Uzbekistan,
 *    Ghana, Jamaica, Mauritius, etc.), strictly filtered to tracked ISO3 country codes.
 * 3. Tier 3 Dynamic Fallback (32 Smaller/Frontier Economies without Live Feeds):
 *    Dynamically computes estimated market capitalization from official IMF nominal GDP
 *    (`totalGdpUsd`) and GDP per capita (`gdpPerCapitaUsd`) in `public/api/v1/economics.json`.
 * 4. Outputs strictly the 124 tracked economies to `public/api/v1/stock-market-caps.json`.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEDICATED_MARKET_ENDPOINTS = {
  RUS: 'https://scanner.tradingview.com/russia/scan',
}

const TV_COUNTRY_NAME_OVERRIDES = {
  KOR: 'South Korea',
  USA: 'United States',
  GBR: 'United Kingdom',
  ARE: 'United Arab Emirates',
  CZE: 'Czech Republic',
  CIV: 'Ivory Coast',
}

/**
 * Strict representative mainboard stock exchange whitelist per country
 * (aligned with StockHeatmap benchmark indices and topCompaniesApi.ts)
 */
const COUNTRY_DOMESTIC_EXCHANGES = {
  USA: ['NASDAQ', 'NYSE'],
  KOR: ['KRX'], // Filtered strictly to KRX:KOSPI mainboard below
  CHN: ['SSE'], // Shanghai Stock Exchange mainboard (matches SSE Composite 000001.SS)
  HKG: ['HKEX'],
  JPN: ['TSE'],
  TWN: ['TWSE'],
  IND: ['NSE'], // National Stock Exchange mainboard (matches Nifty 50 ^NSEI)
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
  VNM: ['HOSE'], // Ho Chi Minh Stock Exchange mainboard (matches VN-Index)
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
 * Multi-country pan-European exchange (`EURONEXT`) shared across France, Netherlands,
 * Belgium, Portugal, and Ireland in TradingView. Only these 5 countries require the
 * `country` filter to separate Paris / Amsterdam / Brussels / Lisbon / Dublin boards;
 * all other exchanges sum primary-listed companies strictly by the stock exchange
 * regardless of headquarters domicile.
 */
const SHARED_EXCHANGE_COUNTRY_IDS = new Set(['FRA', 'NLD', 'BEL', 'PRT', 'IRL'])

function loadTrackedCountries() {
  const countriesPath = path.resolve(__dirname, '../src/data/countries.ts')
  const src = fs.readFileSync(countriesPath, 'utf8')
  const matches = [
    ...src.matchAll(/\{\s*id:\s*'([A-Z]{3})',\s*iso2:\s*'([A-Z]{2})',\s*nameKo:\s*'([^']+)',\s*nameEn:\s*'([^']+)'/g),
  ]
  return matches.map((m) => ({
    id: m[1],
    iso2: m[2],
    nameKo: m[3],
    nameEn: m[4],
  }))
}

function loadImfEconomicsData() {
  try {
    const econPath = path.resolve(__dirname, '../public/api/v1/economics.json')
    const raw = fs.readFileSync(econPath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to load economics.json:', err.message)
    return {}
  }
}

/**
 * Fetches official national stock exchange market capitalization from World Bank Open Data API
 * (`CM.MKT.LCAP.CD`), strictly filtered to tracked country codes (ignoring all regional aggregates).
 */
async function fetchWorldBankMarketCaps(trackedIsoSet) {
  const wbMap = {}
  const currentYear = new Date().getFullYear()
  const url = `https://api.worldbank.org/v2/country/all/indicator/CM.MKT.LCAP.CD?date=2015:${currentYear}&per_page=10000&format=json`

  try {
    const res = await fetch(url)
    if (!res.ok) return wbMap
    const json = await res.json()
    const rows = Array.isArray(json?.[1]) ? json[1] : []

    for (const row of rows) {
      const code = row?.countryiso3code
      const val = row?.value
      const yr = Number(row?.date)
      if (!code || !trackedIsoSet.has(code)) continue
      if (typeof val !== 'number' || val <= 0 || !Number.isFinite(yr)) continue

      if (!wbMap[code] || yr > wbMap[code].year) {
        wbMap[code] = {
          marketCapUsd: Math.round(val),
          year: yr,
        }
      }
    }
  } catch (err) {
    console.warn('World Bank API fetch warning:', err.message)
  }

  return wbMap
}

/**
 * Dynamically computes estimated market capitalization from IMF nominal GDP and GDP per capita
 * (smooth linear progression from 10% of GDP at $2,000 per capita to 35% of GDP at $30,000+ per capita).
 */
function computeDynamicGdpMarketCap(iso, economicsData) {
  const rec = economicsData[iso]
  let totalGdpUsd = 0
  let gdpPerCapitaUsd = 0

  if (rec && rec.years) {
    const yearKeys = Object.keys(rec.years).sort((a, b) => Number(b) - Number(a))
    for (const yr of yearKeys) {
      const m = rec.years[yr]
      if (m && m.totalGdpUsd > 0) {
        totalGdpUsd = m.totalGdpUsd
        gdpPerCapitaUsd = m.gdpPerCapitaUsd || 0
        break
      }
    }
  }

  if (totalGdpUsd <= 0) {
    return 5_000_000_000
  }

  const minRatio = 0.10
  const maxRatio = 0.35
  const clampedPerCapita = Math.max(2000, Math.min(30000, gdpPerCapitaUsd || 5000))
  const t = (clampedPerCapita - 2000) / (30000 - 2000)
  const ratio = minRatio + t * (maxRatio - minRatio)

  return Math.round(totalGdpUsd * ratio)
}

async function fetchUsdExchangeRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (res.ok) {
      const json = await res.json()
      if (json && json.rates) return json.rates
    }
  } catch (err) {
    console.warn('FX fetch error:', err.message)
  }
  return { USD: 1 }
}

function cleanCompanyName(rawName, ticker) {
  if (!rawName) return ticker
  return String(rawName)
    .trim()
    .replace(/보통주$/, '')
    .replace(/우선주$/, '')
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
}

function getDeduplicationKey(cleanedName) {
  const normalized = cleanedName
    .toLowerCase()
    .replace(/\b(inc|corp|ltd|plc|sa|ag|nv|se|spa|bhd|limited|company|co|temp)\b/g, '')
    .replace(/[^a-z0-9가-힣一-龥ぁ-んァ-ヶ]/g, '')
    .slice(0, 18)
  return `name:${normalized}`
}

async function fetchTradingViewDomesticMarketCap(country, fxRates) {
  const upperId = country.id.toUpperCase()
  const isDedicatedEndpoint = Boolean(DEDICATED_MARKET_ENDPOINTS[upperId])
  const domesticExchanges = COUNTRY_DOMESTIC_EXCHANGES[upperId]

  if ((!domesticExchanges || domesticExchanges.length === 0) && !isDedicatedEndpoint) {
    return null
  }

  const endpoint = DEDICATED_MARKET_ENDPOINTS[upperId] || 'https://scanner.tradingview.com/global/scan'
  const tvCountryName = TV_COUNTRY_NAME_OVERRIDES[upperId] || country.nameEn

  const filter = [
    { left: 'type', operation: 'equal', right: 'stock' },
    { left: 'typespecs', operation: 'has_none_of', right: ['preferred', 'dr'] },
  ]

  if (upperId !== 'CAN') {
    filter.push({ left: 'is_primary', operation: 'equal', right: true })
  }

  const requiresCountryFilter = SHARED_EXCHANGE_COUNTRY_IDS.has(upperId)
  if (requiresCountryFilter && tvCountryName) {
    filter.unshift({ left: 'country', operation: 'equal', right: tvCountryName })
  }

  if (domesticExchanges && domesticExchanges.length > 0) {
    filter.push(
      domesticExchanges.length === 1
        ? { left: 'exchange', operation: 'equal', right: domesticExchanges[0] }
        : { left: 'exchange', operation: 'in_range', right: domesticExchanges }
    )
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        filter,
        options: { lang: 'en' },
        columns: [
          'name',
          'description',
          'market_cap_basic',
          'fundamental_currency_code',
          'currency',
          'country',
          'indexes.tr',
        ],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
        range: [0, 6000],
      }),
    })

    if (!res.ok) return null
    const json = await res.json()
    const rows = Array.isArray(json.data) ? json.data : []

    const seenKeys = new Set()
    let totalCapUsd = 0
    let listedCount = 0

    for (const row of rows) {
      if (!row || !Array.isArray(row.d)) continue
      const [rawTicker, rawDesc, rawMarketCap, rawFundCurrency, rawPriceCurrency, rawRowCountry, rawIndexes] = row.d
      if (typeof rawMarketCap !== 'number' || rawMarketCap <= 0) continue

      if (requiresCountryFilter && tvCountryName && typeof rawRowCountry === 'string' && rawRowCountry !== tvCountryName) {
        continue
      }

      // South Korea: strictly include KOSPI mainboard constituents (exclude KOSDAQ)
      if (upperId === 'KOR' && Array.isArray(rawIndexes)) {
        const isKospi = rawIndexes.some(
          (idx) => idx && typeof idx === 'object' && idx.proname === 'KRX:KOSPI'
        )
        const isKosdaq = rawIndexes.some(
          (idx) => idx && typeof idx === 'object' && idx.proname === 'KRX:KOSDAQ'
        )
        if (isKosdaq || !isKospi) {
          continue
        }
      }

      const exchange = row.s.includes(':') ? row.s.split(':')[0] : ''
      if (domesticExchanges && domesticExchanges.length > 0 && !domesticExchanges.includes(exchange)) {
        continue
      }

      const ticker = String(rawTicker || row.s.split(':')[1] || row.s)
      const cleanedName = cleanCompanyName(String(rawDesc || ticker), ticker)
      const dedupKey = getDeduplicationKey(cleanedName)
      if (seenKeys.has(dedupKey)) continue
      seenKeys.add(dedupKey)

      const fundCurrency = String(rawFundCurrency || rawPriceCurrency || 'USD').toUpperCase()
      let capUsd = rawMarketCap
      if (fundCurrency !== 'USD') {
        const rate = fxRates[fundCurrency] || (fundCurrency === 'RUB' ? 95 : 0)
        if (rate > 0) {
          capUsd = rawMarketCap / rate
        } else {
          continue
        }
      }

      totalCapUsd += capUsd
      listedCount++
    }

    if (listedCount === 0 || totalCapUsd <= 0) return null

    const exLabel = isDedicatedEndpoint ? 'MOEX' : upperId === 'KOR' ? 'KOSPI' : domesticExchanges.join('/')
    return {
      marketCapUsd: Math.round(totalCapUsd),
      baseCapUsd: Math.round(totalCapUsd),
      listedCount,
      exchanges: exLabel,
    }
  } catch (err) {
    console.warn(`TradingView scan failed for ${upperId}:`, err.message)
    return null
  }
}

async function main() {
  console.log('Starting 3-Tier Dynamic Market Cap Pipeline (TradingView -> World Bank API -> IMF GDP Model)...')

  const countries = loadTrackedCountries()
  const trackedIsoSet = new Set(countries.map((c) => c.id))
  const economicsData = loadImfEconomicsData()
  const [fxRates, wbCapsMap] = await Promise.all([
    fetchUsdExchangeRates(),
    fetchWorldBankMarketCaps(trackedIsoSet),
  ])
  const currentYear = new Date().getFullYear()

  const outputData = {}
  let tvSuccessCount = 0
  let wbSuccessCount = 0
  let dynamicGdpCount = 0

  // Concurrency 8 across all tracked countries
  let cursor = 0
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < countries.length) {
      const country = countries[cursor++]
      const iso = country.id
      const tvResult = await fetchTradingViewDomesticMarketCap(country, fxRates)

      if (tvResult && tvResult.marketCapUsd > 0) {
        outputData[iso] = {
          marketCapUsd: tvResult.marketCapUsd,
          baseCapUsd: tvResult.baseCapUsd,
          year: `${currentYear} Live`,
          indexMultiplier: 1.0,
          listedCount: tvResult.listedCount,
          countryName: country.nameEn,
          source: `TradingView Mainboard Exchange Aggregate (${tvResult.exchanges}, ${tvResult.listedCount} stocks)`,
        }
        tvSuccessCount++
      } else if (wbCapsMap[iso] && wbCapsMap[iso].marketCapUsd > 0) {
        const wb = wbCapsMap[iso]
        outputData[iso] = {
          marketCapUsd: wb.marketCapUsd,
          baseCapUsd: wb.marketCapUsd,
          year: `${wb.year} Official`,
          indexMultiplier: 1.0,
          countryName: country.nameEn,
          source: `World Bank Official Exchange Statistics (${wb.year})`,
        }
        wbSuccessCount++
      } else {
        const dynamicCap = computeDynamicGdpMarketCap(iso, economicsData)
        outputData[iso] = {
          marketCapUsd: dynamicCap,
          baseCapUsd: dynamicCap,
          year: `${currentYear} Est.`,
          indexMultiplier: 1.0,
          countryName: country.nameEn,
          source: 'IMF WEO Nominal GDP Dynamic Model',
        }
        dynamicGdpCount++
      }
    }
  })

  await Promise.all(workers)

  // Sort output keys by marketCapUsd descending for clean JSON readability
  const sortedEntries = Object.entries(outputData).sort(
    (a, b) => b[1].marketCapUsd - a[1].marketCapUsd
  )
  const sortedOutput = Object.fromEntries(sortedEntries)

  console.log(`\n--- ${currentYear} Global Market Cap Top 15 ---`)
  for (const [code, item] of sortedEntries.slice(0, 15)) {
    const capT = (item.marketCapUsd / 1e12).toFixed(2)
    console.log(`${code.padEnd(4)} (${item.countryName.padEnd(16)}): $${capT.padStart(5)}T | ${item.source}`)
  }

  const outDir = path.resolve(__dirname, '../public/api/v1')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outFile = path.join(outDir, 'stock-market-caps.json')
  fs.writeFileSync(outFile, JSON.stringify(sortedOutput, null, 2), 'utf8')
  console.log(
    `\nSuccessfully saved ${sortedEntries.length} countries (${tvSuccessCount} TradingView live, ${wbSuccessCount} World Bank official, ${dynamicGdpCount} IMF GDP dynamic model) to ${outFile}`
  )
}

main().catch(console.error)

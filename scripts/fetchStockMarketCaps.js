/**
 * Automated Stock Market Capitalization Fetcher & Real-Time Sync Pipeline
 *
 * 100% Automated, Data-Driven, ZERO Hardcoding:
 * 1. Primary Source: Automatically fetches live market capitalization for major economies
 *    from CompaniesMarketCap (real-time exchange aggregate covering 99%+ of global market cap).
 * 2. Secondary/Fallback Source: Fetches official World Bank indicators (CM.MKT.LCAP.CD / WFE)
 *    and scales with Yahoo Finance live index performance for smaller/frontier economies.
 * 3. Outputs public/api/v1/stock-market-caps.json.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { COUNTRY_TICKERS } from './fetchStockData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COUNTRY_NAME_TO_ISO = {
  'United States': 'USA',
  'China': 'CHN',
  'Japan': 'JPN',
  'United Kingdom': 'GBR',
  'Canada': 'CAN',
  'Taiwan': 'TWN',
  'India': 'IND',
  'South Korea': 'KOR',
  'Switzerland': 'CHE',
  'France': 'FRA',
  'Germany': 'DEU',
  'Saudi Arabia': 'SAU',
  'Australia': 'AUS',
  'Netherlands': 'NLD',
  'Spain': 'ESP',
  'Sweden': 'SWE',
  'Italy': 'ITA',
  'Ireland': 'IRL',
  'Brazil': 'BRA',
  'Hong Kong': 'HKG',
  'United Arab Emirates': 'ARE',
  'Singapore': 'SGP',
  'Denmark': 'DNK',
  'Israel': 'ISR',
  'Mexico': 'MEX',
  'Thailand': 'THA',
  'Belgium': 'BEL',
  'Norway': 'NOR',
  'South Africa': 'ZAF',
  'Finland': 'FIN',
  'Russia': 'RUS',
  'Poland': 'POL',
  'Malaysia': 'MYS',
  'Indonesia': 'IDN',
  'Austria': 'AUT',
  'Luxembourg': 'LUX',
  'Turkey': 'TUR',
  'Vietnam': 'VNM',
  'Chile': 'CHL',
  'Kuwait': 'KWT',
  'Greece': 'GRC',
  'Argentina': 'ARG',
  'Qatar': 'QAT',
  'New Zealand': 'NZL',
  'Philippines': 'PHL',
  'Portugal': 'PRT',
  'Czech Republic': 'CZE',
  'Pakistan': 'PAK',
  'Oman': 'OMN',
  'Bahrain': 'BHR',
  'Iceland': 'ISL',
  'Cambodia': 'KHM',
}

async function fetchCompaniesMarketCaps() {
  console.log('Fetching live consensus market capitalization from CompaniesMarketCap...')
  const url = 'https://companiesmarketcap.com/all-countries/'
  const result = {}

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) {
      console.warn(`CompaniesMarketCap HTTP error: ${res.status}`)
      return result
    }

    const html = await res.text()
    // Pattern to match: <td data-sort="Country Name"> ... <td class="td-right" data-sort="ExactIntegerCap">
    const pattern = /<td data-sort="([A-Za-z\s]+)">[\s\S]*?<td class="td-right" data-sort="(\d+)">/g
    let match

    while ((match = pattern.exec(html)) !== null) {
      const countryName = match[1].trim()
      const rawCap = parseInt(match[2], 10)
      const iso = COUNTRY_NAME_TO_ISO[countryName]

      if (iso && !isNaN(rawCap) && rawCap > 0) {
        result[iso] = {
          marketCapUsd: rawCap,
          baseCapUsd: rawCap,
          year: `${new Date().getFullYear()} Live`,
          indexMultiplier: 1.0,
          countryName,
          source: 'CompaniesMarketCap (Real-Time Global Exchanges Consensus)',
        }
      }
    }

    console.log(`Successfully parsed live market cap for ${Object.keys(result).length} countries.`)
  } catch (err) {
    console.warn('CompaniesMarketCap fetch error:', err.message)
  }

  return result
}

async function fetchWorldBankDomesticMarketCaps() {
  console.log('Fetching World Bank indicator CM.MKT.LCAP.CD (WFE Domestic Market Capitalization)...')
  const result = {}
  let page = 1
  let totalPages = 1

  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 10

  while (page <= totalPages) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/CM.MKT.LCAP.CD?format=json&date=${startYear}:${currentYear}&per_page=1000&page=${page}`
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
      if (!res.ok) break
      const json = await res.json()
      if (!Array.isArray(json) || !json[0] || !json[1]) break

      totalPages = json[0].pages || 1
      for (const r of json[1]) {
        if (r.value != null && r.countryiso3code) {
          const iso = r.countryiso3code.toUpperCase()
          if (!result[iso] || r.date > result[iso].year) {
            result[iso] = {
              year: r.date,
              baseCapUsd: r.value,
              countryName: r.country?.value || iso,
              source: 'World Bank (CM.MKT.LCAP.CD / WFE Database)'
            }
          }
        }
      }
      page++
    } catch (err) {
      console.warn(`World Bank page ${page} fetch error:`, err.message)
      break
    }
  }

  return result
}

/**
 * Automatically fetch historical and current index prices from Yahoo Finance API
 * to dynamically extract baseIndexPrice and currentIndexPrice from real market data.
 */
async function fetchIndexPerformance(ticker, targetYear) {
  if (!ticker) return null

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=10y&interval=1mo`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json.chart?.result?.[0]
    if (!result) return null

    const timestamps = result.timestamp || []
    const closes = result.indicators?.quote?.[0]?.close || []

    let basePrice = null
    let latestPrice = null

    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i]
      if (close != null && !isNaN(close)) {
        latestPrice = close
        const dateStr = new Date(timestamps[i] * 1000).toISOString().slice(0, 10)
        if (dateStr.startsWith(targetYear)) {
          basePrice = close
        }
      }
    }

    if (!basePrice && closes.length > 0) {
      basePrice = closes.find(c => c != null && !isNaN(c)) || latestPrice
    }

    if (!basePrice || !latestPrice || basePrice <= 0 || latestPrice <= 0) return null

    const multiplier = Number((latestPrice / basePrice).toFixed(4))
    return {
      baseIndexPrice: Number(basePrice.toFixed(2)),
      currentIndexPrice: Number(latestPrice.toFixed(2)),
      multiplier
    }
  } catch {
    return null
  }
}

async function main() {
  console.log('Starting 100% automated market capitalization pipeline...')

  // 1. Primary: Fetch real-time market cap for major economies (50+ countries)
  const liveMarketCaps = await fetchCompaniesMarketCaps()

  // 2. Secondary: Fetch World Bank baseline data for remaining smaller economies
  const wbBaseData = await fetchWorldBankDomesticMarketCaps()

  // 3. Map tickers by country ID
  const tickerMap = new Map()
  for (const item of COUNTRY_TICKERS) {
    if (item.isSupported && item.ticker) {
      tickerMap.set(item.id, item.ticker)
    }
  }

  // 4. Combine sources into unified outputData
  const outputData = { ...liveMarketCaps }
  const currentYear = new Date().getFullYear()

  // For countries not in liveMarketCaps, scale World Bank baseline
  for (const [iso, baseInfo] of Object.entries(wbBaseData)) {
    if (outputData[iso]) continue // Already covered by real-time primary source

    const baseCap = baseInfo.baseCapUsd
    const ticker = tickerMap.get(iso)
    let multiplier = 1.0
    let baseIndexPrice = null
    let currentIndexPrice = null

    if (ticker) {
      const perf = await fetchIndexPerformance(ticker, baseInfo.year)
      if (perf) {
        multiplier = perf.multiplier
        baseIndexPrice = perf.baseIndexPrice
        currentIndexPrice = perf.currentIndexPrice
      }
    }

    const marketCapUsd = Math.round(baseCap * multiplier)

    outputData[iso] = {
      marketCapUsd,
      baseCapUsd: baseCap,
      baseYear: baseInfo.year,
      year: `${currentYear} Live Est.`,
      indexMultiplier: multiplier,
      baseIndexPrice,
      currentIndexPrice,
      indexTicker: ticker || null,
      countryName: baseInfo.countryName,
      source: multiplier !== 1.0
        ? `World Bank (WFE ${baseInfo.year}) × Live Index Multiplier (${multiplier}x via Yahoo Finance)`
        : baseInfo.source
    }
  }

  // 5. Print sample estimates to verify precision
  const sampleCodes = ['USA', 'CHN', 'JPN', 'KOR', 'IND', 'DEU', 'GBR', 'TWN', 'CAN', 'ITA', 'NLD']
  console.log(`\n--- ${currentYear} Synchronized Market Capitalization Samples ---`)
  for (const code of sampleCodes) {
    const item = outputData[code]
    if (item) {
      const capInTrillions = (item.marketCapUsd / 1e12).toFixed(2)
      console.log(`${code} (${item.countryName}): $${capInTrillions}T | Source: ${item.source}`)
    }
  }

  // 6. Save to public/api/v1/stock-market-caps.json
  const outDir = path.resolve(__dirname, '../public/api/v1')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outFile = path.join(outDir, 'stock-market-caps.json')
  fs.writeFileSync(outFile, JSON.stringify(outputData, null, 2), 'utf8')
  console.log(`\nSuccessfully saved ${Object.keys(outputData).length} countries to ${outFile}`)
}

main().catch(console.error)

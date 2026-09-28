import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { COUNTRIES } from '../src/data/countries.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_PATH_API = path.join(__dirname, '../public/api/v1/bigmac.json')
const CSV_URL = 'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-full-index.csv'

export async function fetchBigMacData() {
  console.log('[fetchBigMacData] Fetching latest Big Mac Index from The Economist repository...')

  let csvText = ''
  try {
    const res = await fetch(CSV_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    csvText = await res.text()
  } catch (err) {
    console.error('[fetchBigMacData] Network error fetching CSV:', err.message)
    if (fs.existsSync(OUT_PATH_API)) {
      console.log('[fetchBigMacData] Existing public/api/v1/bigmac.json retained.')
      return
    }
    throw err
  }

  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV content is empty or invalid.')
  }

  const header = lines[0].split(',')
  const rows = lines.slice(1).map((l) => l.split(','))

  // Find latest survey date
  const allDates = Array.from(new Set(rows.map((r) => r[0]))).sort()
  const latestDate = allDates[allDates.length - 1]
  console.log(`[fetchBigMacData] Latest index survey date identified: ${latestDate}`)

  const latestRows = rows.filter((r) => r[0] === latestDate)
  const rowByIso = new Map()
  for (const r of latestRows) {
    rowByIso.set(r[1], r)
  }

  // Also build fallback map for older records (e.g. RUS, LKA)
  const allLatestByIso = new Map()
  for (const r of rows) {
    const [date, iso] = r
    if (!allLatestByIso.has(iso) || allLatestByIso.get(iso)[0] < date) {
      allLatestByIso.set(iso, r)
    }
  }

  // Get US base record
  const usRow = rowByIso.get('USA')
  const basePriceUsd = usRow ? Math.round(parseFloat(usRow[6]) * 100) / 100 : 6.22

  const items = {}
  let matchCount = 0

  for (const country of COUNTRIES) {
    let r = rowByIso.get(country.id)
    let isEurozone = false

    // Check if Eurozone country inheriting from EUZ
    if (!r && country.currencyCode === 'EUR' && rowByIso.has('EUZ')) {
      r = rowByIso.get('EUZ')
      isEurozone = true
    }

    // Fallback to older survey date if recent survey was missed
    if (!r && allLatestByIso.has(country.id)) {
      r = allLatestByIso.get(country.id)
    }

    if (r) {
      const [
        date,
        iso_a3,
        currency_code,
        name,
        local_price,
        dollar_ex,
        dollar_price,
        usd_raw,
        eur_raw,
        gbp_raw,
        jpy_raw,
        cny_raw,
        gdp_bigmac,
        adj_price,
        usd_adjusted,
      ] = r

      const dollarPrice = Math.round(parseFloat(dollar_price) * 100) / 100
      const localPrice = Math.round(parseFloat(local_price) * 100) / 100
      const dollarEx = parseFloat(dollar_ex)
      const rawValuation = parseFloat(usd_raw)
      const adjValuation = usd_adjusted ? parseFloat(usd_adjusted) : null

      items[country.id] = {
        countryId: country.id,
        currencyCode: country.currencyCode,
        date,
        localPrice,
        dollarEx: Math.round(dollarEx * 10000) / 10000,
        dollarPrice,
        valuationRawPct: Math.round(rawValuation * 1000) / 10,
        valuationAdjustedPct: adjValuation !== null && !isNaN(adjValuation)
          ? Math.round(adjValuation * 1000) / 10
          : null,
        adjPrice: adj_price ? Math.round(parseFloat(adj_price) * 100) / 100 : null,
        isEurozone,
      }
      matchCount++
    }
  }

  const output = {
    updatedAt: new Date().toISOString().split('T')[0],
    surveyDate: latestDate,
    source: 'The Economist Big Mac Index',
    sourceUrl: 'https://github.com/TheEconomist/big-mac-data',
    methodology: 'Purchasing Power Parity (PPP) based on local Big Mac prices relative to the US dollar baseline',
    baseCountry: 'USA',
    basePriceUsd,
    count: matchCount,
    items,
  }

  const jsonStr = JSON.stringify(output, null, 2)
  const apiDir = path.dirname(OUT_PATH_API)
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true })
  fs.writeFileSync(OUT_PATH_API, jsonStr, 'utf-8')
  console.log(`[fetchBigMacData] Successfully saved ${matchCount} country Big Mac records to public/api/v1/bigmac.json`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchBigMacData()
}

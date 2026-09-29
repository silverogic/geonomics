/**
 * Automated Stock Market Capitalization Fetcher
 * Combines World Federation of Exchanges (WFE) Monthly Market Statistics (2026)
 * with official World Bank API (CM.MKT.LCAP.CD) supplemental indicators.
 * Generates public/api/v1/stock-market-caps.json.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { STOCK_MARKET_CAPS_USD, WFE_REPORT_DATE, WFE_DATA_SOURCE } from '../src/data/stockMarketCaps.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchWorldBankSupplemental() {
  console.log('Fetching World Bank Domestic Market Capitalization (CM.MKT.LCAP.CD) for supplemental markets...')
  
  const years = ['2023:2025', '2020:2022']
  const allRecords = []

  for (const dateRange of years) {
    try {
      const url = `https://api.worldbank.org/v2/country/all/indicator/CM.MKT.LCAP.CD?format=json&date=${dateRange}&per_page=1000`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json[1]) {
          allRecords.push(...json[1])
        }
      }
    } catch (e) {
      console.warn(`World Bank supplemental fetch for ${dateRange}:`, e.message)
    }
  }

  const wbCaps = {}
  for (const item of allRecords) {
    if (item.value != null && item.countryiso3code) {
      const iso = item.countryiso3code.toUpperCase()
      if (!wbCaps[iso] || item.date > wbCaps[iso].year) {
        wbCaps[iso] = {
          year: item.date,
          marketCapUsd: item.value,
          countryName: item.country?.value || iso,
          source: 'World Bank (CM.MKT.LCAP.CD)',
        }
      }
    }
  }

  return wbCaps
}

async function main() {
  console.log('Building authoritative Stock Market Caps dataset...')

  // 1. Initialize with authoritative WFE Monthly 2026 Statistics
  const unifiedCaps = {}

  for (const [iso, cap] of Object.entries(STOCK_MARKET_CAPS_USD)) {
    unifiedCaps[iso] = {
      year: WFE_REPORT_DATE,
      marketCapUsd: cap,
      source: WFE_DATA_SOURCE,
    }
  }

  // 2. Fetch supplemental records from World Bank for any country missing in WFE
  const wbCaps = await fetchWorldBankSupplemental()
  console.log(`Fetched ${Object.keys(wbCaps).length} supplemental country entries from World Bank.`)

  for (const [iso, data] of Object.entries(wbCaps)) {
    // Only supplement if not already present in WFE benchmarks
    if (!unifiedCaps[iso]) {
      unifiedCaps[iso] = data
    }
  }

  console.log(`Total market cap entries compiled: ${Object.keys(unifiedCaps).length}`)

  // 3. Save raw JSON to public API directory
  const outDir = path.resolve(__dirname, '../public/api/v1')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const jsonPath = path.join(outDir, 'stock-market-caps.json')
  fs.writeFileSync(jsonPath, JSON.stringify(unifiedCaps, null, 2), 'utf-8')
  console.log(`Saved public API to ${jsonPath}`)
}

main().catch(console.error)

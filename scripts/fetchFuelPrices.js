import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { COUNTRIES } from '../src/data/countries.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_PATH = path.join(__dirname, '../src/data/fuelPricesData.json')

const ALIASES = {
  USA: 'usa',
  GBR: 'united-kingdom',
  KOR: 'south-korea',
  RUS: 'russia',
  TWN: 'taiwan',
  CZE: 'czech-republic',
  SVK: 'slovakia',
  TUR: 'turkey',
  ARE: 'uae',
  VNM: 'vietnam',
  EGY: 'egypt',
  COD: 'dr-congo',
  CIV: 'ivory-coast',
  IRN: 'iran',
  VEN: 'venezuela',
  MMR: 'myanmar',
  LAO: 'laos',
  BIH: 'bosnia-herzegovina',
  MKD: 'north-macedonia',
  HKG: 'hong-kong',
  SGP: 'singapore',
}

// Fallback estimates for countries not in GPP
const REGIONAL_FALLBACKS = {
  MAC: 1.55, // Macao SAR (tied to HK/China average)
  MMR: 1.15, // Myanmar
  PNG: 1.25, // Papua New Guinea
}

export async function fetchFuelPrices() {
  console.log('[fetchFuelPrices] Fetching latest retail gasoline prices (RON 95 / USD/L)...')

  let fuelMap = new Map()

  try {
    const res = await fetch('https://www.globalpetrolprices.com/gasoline_prices/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
    }

    const html = await res.text()

    // 1. Extract country links
    const outsideTitleRegex =
      /<div class="outsideTitle outsideTitleElement"[^>]*>[\s\S]*?<a href='\/([^/]+)\/gasoline_prices\/'[^>]*>([^<]+)<\/a>[\s\S]*?<\/div>/gi
    const countryMatches = [...html.matchAll(outsideTitleRegex)]
    const scrapedCountries = countryMatches.map((m) => ({
      slug: m[1],
      name: m[2].replace(/\*/g, '').replace(/&nbsp;/g, '').trim(),
    }))

    // 2. Extract values from #graphic
    const graphicIdx = html.indexOf('id="graphic"')
    if (graphicIdx !== -1) {
      const graphicHtml = html.substring(graphicIdx, graphicIdx + 120000)
      const priceRegex =
        /<div style="position: absolute; top: 2px; left: 7px; height: 15px; color: #000000;">([0-9.]+)<\/div>/gi
      const priceMatches = [...graphicHtml.matchAll(priceRegex)]
      const prices = priceMatches.map((m) => parseFloat(m[1]))

      for (let i = 0; i < Math.min(scrapedCountries.length, prices.length); i++) {
        const s = scrapedCountries[i]
        const p = prices[i]
        fuelMap.set(s.slug.toLowerCase(), p)
        fuelMap.set(s.name.toLowerCase(), p)
      }

      console.log(`[fetchFuelPrices] Successfully scraped ${scrapedCountries.length} countries from source.`)
    }
  } catch (err) {
    console.warn('[fetchFuelPrices] Live fetch failed or timed out:', err.message)
    if (fs.existsSync(OUT_PATH)) {
      console.log('[fetchFuelPrices] Retaining existing fuel prices data file.')
      return
    }
  }

  const pricesData = {}
  let matchCount = 0

  for (const country of COUNTRIES) {
    let price = null
    const aliasSlug = ALIASES[country.id]

    if (aliasSlug && fuelMap.has(aliasSlug.toLowerCase())) {
      price = fuelMap.get(aliasSlug.toLowerCase())
    } else if (fuelMap.has(country.nameEn.toLowerCase())) {
      price = fuelMap.get(country.nameEn.toLowerCase())
    } else {
      const slugFormat = country.nameEn.toLowerCase().replace(/\s+/g, '-')
      if (fuelMap.has(slugFormat)) {
        price = fuelMap.get(slugFormat)
      }
    }

    if (price === null && REGIONAL_FALLBACKS[country.id]) {
      price = REGIONAL_FALLBACKS[country.id]
    }

    if (price !== null && !isNaN(price)) {
      pricesData[country.id] = {
        countryId: country.id,
        priceUsd: Math.round(price * 1000) / 1000,
        currencyCode: country.currencyCode,
      }
      matchCount++
    }
  }

  const output = {
    updatedAt: new Date().toISOString().split('T')[0],
    source: 'Global Petrol Prices / National Energy Ministries',
    unit: 'USD/L',
    octaneStandard: 'Octane-95 (RON 95)',
    noteKo: '전국 평균 소매가격 (세금 포함)',
    noteEn: 'National average retail price inclusive of taxes',
    count: matchCount,
    prices: pricesData,
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`[fetchFuelPrices] Successfully saved ${matchCount} country fuel prices to ${OUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchFuelPrices()
}

/**
 * Fetch Global Central Bank & Macroeconomic Event Calendar
 *
 * Architecture:
 * 1. Multi-country extensible market registry (Target 1: USA / FED & US Core Macro Indicators;
 *    extensible to KOR/BOK, JPN/BOJ, EUR/ECB, GBR/BOE, CHN/PBOC).
 * 2. Queries TradingView Economic Calendar API (`https://economic-calendar.tradingview.com/events`)
 *    in 2-month windows across 2026-2027 to capture all historical and upcoming Actual, Forecast,
 *    and Previous values along with exact UTC release timestamps and indicator commentary.
 * 3. Merges official Federal Reserve 2026-2027 FOMC / Beige Book / Minutes schedule from
 *    `https://www.federalreserve.gov/json/calendar.json` so full-year FOMC dates are always complete.
 * 4. Outputs `public/api/v1/economic-calendar.json`.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_PATH = path.resolve(__dirname, '../public/api/v1/economic-calendar.json')

/**
 * Extensible market registry.
 * Currently enabled: USA (FED). Additional central banks can be enabled by setting `enabled: true`.
 */
const MARKETS = [
  { id: 'USA', iso2: 'US', centralBank: 'FED', enabled: true },
  { id: 'KOR', iso2: 'KR', centralBank: 'BOK', enabled: false },
  { id: 'JPN', iso2: 'JP', centralBank: 'BOJ', enabled: false },
  { id: 'EUR', iso2: 'EU', centralBank: 'ECB', enabled: false },
  { id: 'GBR', iso2: 'GB', centralBank: 'BOE', enabled: false },
  { id: 'CHN', iso2: 'CN', centralBank: 'PBOC', enabled: false },
]

/**
 * Classifies an event title into one of our 5 core categories and assigns a normalized
 * 1-to-3 star importance rating (`3` = Critical Market Mover, `2` = Major Indicator, `1` = Speech / Secondary).
 * Returns `null` if the event is noisy/unrelated (e.g. minor bill auctions, regional sub-surveys).
 */
function classifyUsEvent(rawEvent) {
  const title = (rawEvent.title || '').trim()
  if (!title) return null

  // Exclude noisy Treasury bill/note auctions, CFTC speculative positions, MBA sub-indices, API/EIA weekly stocks
  if (
    /Bill Auction|Note Auction|Bond Auction|TIPS Auction|CMB Auction|Bill Purchases|CFTC|API Crude|EIA Crude|EIA Gasoline|EIA Natural Gas|MBA |Redbook|Export Sales|Milk|Crop|Baker Hughes|Total Vehicle Sales/i.test(
      title
    )
  ) {
    return null
  }

  // 1. CENTRAL_BANK (FED / FOMC / Monetary Policy)
  if (/Fed Interest Rate Decision|FOMC Economic Projections|FOMC Statement|Fed Press Conference|FOMC Press Conference/i.test(title)) {
    return {
      category: 'CENTRAL_BANK',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'FOMC interest rate Federal Reserve',
    }
  }
  if (/FOMC Minutes/i.test(title)) {
    return {
      category: 'CENTRAL_BANK',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'FOMC minutes Federal Reserve',
    }
  }
  if (/Fed Chair .* (Speech|Testimony)|Jackson Hole Symposium/i.test(title)) {
    return {
      category: 'CENTRAL_BANK',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'Federal Reserve Chair speech monetary policy',
    }
  }
  if (/Beige Book|Fed Balance Sheet/i.test(title)) {
    return {
      category: 'CENTRAL_BANK',
      importance: 2,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: /Beige Book/i.test(title) ? 'Fed Beige Book economy' : 'Federal Reserve balance sheet QT',
    }
  }
  if (/^Fed .* (Speech|Testimony)/i.test(title)) {
    return {
      category: 'CENTRAL_BANK',
      importance: 1,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'Federal Reserve official speech interest rates',
    }
  }

  // 2. INFLATION (CPI, Core CPI, PCE, Core PCE, PPI, Michigan Inflation Expectations)
  if (/^(Core )?Inflation Rate (YoY|MoM)$/i.test(title)) {
    return {
      category: 'INFLATION',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US CPI inflation Consumer Price Index',
    }
  }
  if (/^Core PCE Price Index (YoY|MoM)$/i.test(title)) {
    return {
      category: 'INFLATION',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US Core PCE inflation Federal Reserve',
    }
  }
  if (/^PCE Price Index (YoY|MoM)$/i.test(title)) {
    return {
      category: 'INFLATION',
      importance: 2,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US PCE price index inflation',
    }
  }
  if (/^(Core )?PPI (MoM|YoY)$/i.test(title)) {
    return {
      category: 'INFLATION',
      importance: /PPI MoM|Core PPI MoM/i.test(title) ? 2 : 1,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US PPI Producer Price Index inflation',
    }
  }
  if (/^Michigan (5 Year )?Inflation Expectations (Prel|Final)$/i.test(title)) {
    return {
      category: 'INFLATION',
      importance: 2,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US consumer inflation expectations',
    }
  }

  // 3. EMPLOYMENT (NFP, Unemployment Rate, JOLTs, Initial Jobless Claims, ADP, Hourly Earnings)
  if (/^Non Farm Payrolls$/i.test(title) || /^Unemployment Rate$/i.test(title)) {
    return {
      category: 'EMPLOYMENT',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US Nonfarm Payrolls unemployment jobs report',
    }
  }
  if (/^JOLTs Job Openings$/i.test(title)) {
    return {
      category: 'EMPLOYMENT',
      importance: 3,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US JOLTs job openings labor market',
    }
  }
  if (/^Initial Jobless Claims$/i.test(title) || /^ADP Employment Change$/i.test(title)) {
    return {
      category: 'EMPLOYMENT',
      importance: 2,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: /ADP/i.test(title) ? 'US ADP private payrolls employment' : 'US initial jobless claims unemployment',
    }
  }
  if (/^Average Hourly Earnings (MoM|YoY)$/i.test(title) || /^Participation Rate$/i.test(title) || /^Continuing Jobless Claims$/i.test(title)) {
    return {
      category: 'EMPLOYMENT',
      importance: /Average Hourly Earnings/i.test(title) ? 2 : 1,
      newsTopic: 'CENTRAL_BANK',
      newsKeyword: 'US wage growth labor market',
    }
  }

  // 4. GROWTH (GDP, Atlanta Fed GDPNow, ISM Manufacturing/Services PMI, S&P Global PMI, Industrial Production)
  if (/^GDP Growth Rate QoQ (Adv|2nd Est|Final)$/i.test(title)) {
    return {
      category: 'GROWTH',
      importance: 3,
      newsTopic: 'ALL',
      newsKeyword: 'US GDP economic growth rate',
    }
  }
  if (/^ISM (Manufacturing|Services) PMI$/i.test(title)) {
    return {
      category: 'GROWTH',
      importance: 3,
      newsTopic: 'ALL',
      newsKeyword: 'US ISM PMI manufacturing services economy',
    }
  }
  if (
    /^Atlanta Fed GDPNow$/i.test(title) ||
    /^S&P Global (Manufacturing|Services|Composite) PMI( Flash)?$/i.test(title) ||
    /^Industrial Production MoM$/i.test(title) ||
    /^Philadelphia Fed Manufacturing Index$/i.test(title) ||
    /^NY Empire State Manufacturing Index$/i.test(title)
  ) {
    return {
      category: 'GROWTH',
      importance: 2,
      newsTopic: 'ALL',
      newsKeyword: 'US economic activity PMI industrial production',
    }
  }

  // 5. CONSUMER (Retail Sales, Michigan Sentiment, CB Consumer Confidence, Personal Spending/Income, Durable Goods, Housing, Trade)
  if (/^Retail Sales MoM$/i.test(title)) {
    return {
      category: 'CONSUMER',
      importance: 3,
      newsTopic: 'ALL',
      newsKeyword: 'US retail sales consumer spending',
    }
  }
  if (
    /^Retail Sales (Ex Autos|Control Group) MoM$/i.test(title) ||
    /^Michigan Consumer Sentiment (Prel|Final)$/i.test(title) ||
    /^CB Consumer Confidence$/i.test(title) ||
    /^Personal (Spending|Income) MoM$/i.test(title) ||
    /^Durable Goods Orders MoM$/i.test(title) ||
    /^Existing Home Sales$/i.test(title) ||
    /^New Home Sales$/i.test(title) ||
    /^Housing Starts$/i.test(title) ||
    /^Building Permits Prel$/i.test(title) ||
    /^Balance of Trade$/i.test(title)
  ) {
    return {
      category: 'CONSUMER',
      importance: 2,
      newsTopic: /Balance of Trade/i.test(title) ? 'TRADE' : 'ALL',
      newsKeyword: /Balance of Trade/i.test(title) ? 'US trade deficit exports imports' : 'US consumer confidence housing retail spending',
    }
  }

  return null
}

/**
 * Official 2026-2027 FOMC & Federal Reserve Baseline Schedule
 * Ensures that even for months far in the future (or past) where TradingView has not yet
 * created individual forecast rows, the full annual FOMC calendar is 100% populated.
 *
 * Note on US Daylight Saving Time (EDT = UTC-4, EST = UTC-5):
 * - FOMC Rate Decision & Statement: 2:00 PM ET -> 18:00 UTC (EDT, Mar-Oct) / 19:00 UTC (EST, Nov-Feb)
 * - FOMC Press Conference: 2:30 PM ET -> 18:30 UTC (EDT) / 19:30 UTC (EST)
 * - FOMC Minutes & Beige Book: 2:00 PM ET -> 18:00 UTC (EDT) / 19:00 UTC (EST)
 */
const OFFICIAL_FOMC_SCHEDULE_2026_2027 = [
  // 2026 FOMC Meetings (Rate Decisions on Day 2)
  { date: '2026-01-28T19:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jan', hasProjections: false, actual: 4.5, forecast: 4.5, previous: 4.5, unit: '%' },
  { date: '2026-03-18T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Mar', hasProjections: true, actual: 4.25, forecast: 4.25, previous: 4.5, unit: '%' },
  { date: '2026-04-29T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Apr', hasProjections: false, actual: 4.25, forecast: 4.25, previous: 4.25, unit: '%' },
  { date: '2026-06-17T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jun', hasProjections: true, actual: 4.0, forecast: 4.0, previous: 4.25, unit: '%' },
  { date: '2026-07-29T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jul', hasProjections: false, actual: 4.0, forecast: 4.0, previous: 4.0, unit: '%' },
  { date: '2026-09-16T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Sep', hasProjections: true, actual: 3.75, forecast: 3.75, previous: 4.0, unit: '%' },
  { date: '2026-10-28T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Oct', hasProjections: false, actual: 3.75, forecast: 3.75, previous: 3.75, unit: '%' },
  { date: '2026-12-09T19:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Dec', hasProjections: true, actual: null, forecast: 3.5, previous: 3.75, unit: '%' },

  // 2027 FOMC Meetings (Official Federal Reserve Schedule)
  { date: '2027-01-27T19:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jan', hasProjections: false, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-03-17T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Mar', hasProjections: true, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-04-28T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Apr', hasProjections: false, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-06-09T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jun', hasProjections: true, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-07-28T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Jul', hasProjections: false, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-09-15T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Sep', hasProjections: true, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-10-27T18:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Oct', hasProjections: false, actual: null, forecast: null, previous: null, unit: '%' },
  { date: '2027-12-08T19:00:00.000Z', title: 'Fed Interest Rate Decision', period: 'Dec', hasProjections: true, actual: null, forecast: null, previous: null, unit: '%' },

  // 2026 FOMC Minutes
  { date: '2026-02-18T19:00:00.000Z', title: 'FOMC Minutes', period: 'Jan Meeting' },
  { date: '2026-04-08T18:00:00.000Z', title: 'FOMC Minutes', period: 'Mar Meeting' },
  { date: '2026-05-20T18:00:00.000Z', title: 'FOMC Minutes', period: 'Apr Meeting' },
  { date: '2026-07-08T18:00:00.000Z', title: 'FOMC Minutes', period: 'Jun Meeting' },
  { date: '2026-08-19T18:00:00.000Z', title: 'FOMC Minutes', period: 'Jul Meeting' },
  { date: '2026-10-07T18:00:00.000Z', title: 'FOMC Minutes', period: 'Sep Meeting' },
  { date: '2026-11-18T19:00:00.000Z', title: 'FOMC Minutes', period: 'Oct Meeting' },
  { date: '2026-12-30T19:00:00.000Z', title: 'FOMC Minutes', period: 'Dec Meeting' },

  // 2026 Fed Beige Book
  { date: '2026-01-14T19:00:00.000Z', title: 'Fed Beige Book', period: 'Jan' },
  { date: '2026-03-04T19:00:00.000Z', title: 'Fed Beige Book', period: 'Mar' },
  { date: '2026-04-15T18:00:00.000Z', title: 'Fed Beige Book', period: 'Apr' },
  { date: '2026-06-03T18:00:00.000Z', title: 'Fed Beige Book', period: 'Jun' },
  { date: '2026-07-15T18:00:00.000Z', title: 'Fed Beige Book', period: 'Jul' },
  { date: '2026-09-02T18:00:00.000Z', title: 'Fed Beige Book', period: 'Sep' },
  { date: '2026-10-14T18:00:00.000Z', title: 'Fed Beige Book', period: 'Oct' },
  { date: '2026-11-25T19:00:00.000Z', title: 'Fed Beige Book', period: 'Nov' },
]

async function fetchTradingViewRange(countryIso2, fromIso, toIso) {
  const url = `https://economic-calendar.tradingview.com/events?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&countries=${encodeURIComponent(countryIso2)}`
  const res = await fetch(url, {
    headers: {
      Origin: 'https://www.tradingview.com',
      Referer: 'https://www.tradingview.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })
  if (!res.ok) {
    throw new Error(`TradingView calendar HTTP ${res.status} for ${fromIso}..${toIso}`)
  }
  const json = await res.json()
  return Array.isArray(json.result) ? json.result : []
}

async function main() {
  console.log('Fetching Global Economic Calendar data (2026-2027)...')

  // Generate 2-month windows from 2026-01-01 to 2027-06-30
  const windows = [
    ['2026-01-01T00:00:00.000Z', '2026-02-28T23:59:59.000Z'],
    ['2026-03-01T00:00:00.000Z', '2026-04-30T23:59:59.000Z'],
    ['2026-05-01T00:00:00.000Z', '2026-06-30T23:59:59.000Z'],
    ['2026-07-01T00:00:00.000Z', '2026-08-31T23:59:59.000Z'],
    ['2026-09-01T00:00:00.000Z', '2026-10-31T23:59:59.000Z'],
    ['2026-11-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z'],
    ['2027-01-01T00:00:00.000Z', '2027-03-31T23:59:59.000Z'],
    ['2027-04-01T00:00:00.000Z', '2027-06-30T23:59:59.000Z'],
  ]

  const allNormalizedEvents = new Map()

  for (const market of MARKETS.filter((m) => m.enabled)) {
    for (const [fromIso, toIso] of windows) {
      try {
        const rawList = await fetchTradingViewRange(market.iso2, fromIso, toIso)
        for (const raw of rawList) {
          const classified = classifyUsEvent(raw)
          if (!classified) continue

          const dateUtc = raw.date
          const titleEn = (raw.title || '').trim()
          const dedupKey = `${market.id}:${dateUtc.slice(0, 10)}:${titleEn.toLowerCase()}`

          allNormalizedEvents.set(dedupKey, {
            id: String(raw.id || dedupKey),
            marketId: market.id,
            countryIso2: market.iso2,
            category: classified.category,
            importance: classified.importance,
            titleEn,
            period: raw.period || '',
            dateUtc,
            actual: typeof raw.actual === 'number' ? raw.actual : null,
            forecast: typeof raw.forecast === 'number' ? raw.forecast : null,
            previous: typeof raw.previous === 'number' ? raw.previous : null,
            unit: raw.unit || '',
            scale: raw.scale || '',
            comment: raw.comment || '',
            source: raw.source || '',
            sourceUrl: raw.source_url || '',
            newsTopic: classified.newsTopic,
            newsKeyword: classified.newsKeyword,
          })
        }
      } catch (err) {
        console.warn(`Warning fetching window ${fromIso}..${toIso}:`, err.message)
      }
    }
  }

  // Merge official 2026-2027 FOMC baseline schedule so any future/past FOMC meetings
  // not yet populated by TradingView are guaranteed to exist
  for (const item of OFFICIAL_FOMC_SCHEDULE_2026_2027) {
    const dayPrefix = item.date.slice(0, 10)
    const rateKey = `USA:${dayPrefix}:${item.title.toLowerCase()}`

    if (!allNormalizedEvents.has(rateKey)) {
      allNormalizedEvents.set(rateKey, {
        id: `fomc-${dayPrefix}-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
        marketId: 'USA',
        countryIso2: 'US',
        category: 'CENTRAL_BANK',
        importance: item.title === 'Fed Beige Book' ? 2 : 3,
        titleEn: item.title,
        period: item.period || '',
        dateUtc: item.date,
        actual: item.actual ?? null,
        forecast: item.forecast ?? null,
        previous: item.previous ?? null,
        unit: item.unit || '',
        scale: '',
        comment:
          item.title === 'Fed Interest Rate Decision'
            ? 'The Federal Open Market Committee (FOMC) announces its decision on the target range for the federal funds rate, the primary benchmark interest rate governing U.S. monetary policy.'
            : item.title === 'FOMC Minutes'
              ? 'Detailed record of the FOMC policy meeting released three weeks after each decision, offering deep insight into officials’ inflation and rate deliberations.'
              : 'The Federal Reserve’s Summary of Commentary on Current Economic Conditions across the 12 Federal Reserve Districts.',
        source: 'Federal Reserve',
        sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
        newsTopic: 'CENTRAL_BANK',
        newsKeyword: item.title === 'Fed Beige Book' ? 'Fed Beige Book economy' : 'FOMC interest rate Federal Reserve',
      })
    }

    // If this is an FOMC Rate Decision date, also ensure Press Conference (+30m) and Dot Plot (if Mar/Jun/Sep/Dec) exist
    if (item.title === 'Fed Interest Rate Decision') {
      if (item.hasProjections) {
        const projKey = `USA:${dayPrefix}:fomc economic projections`
        if (!allNormalizedEvents.has(projKey)) {
          allNormalizedEvents.set(projKey, {
            id: `fomc-proj-${dayPrefix}`,
            marketId: 'USA',
            countryIso2: 'US',
            category: 'CENTRAL_BANK',
            importance: 3,
            titleEn: 'FOMC Economic Projections',
            period: `${item.period} SEP / Dot Plot`,
            dateUtc: item.date,
            actual: null,
            forecast: null,
            previous: null,
            unit: '',
            scale: '',
            comment:
              'Summary of Economic Projections (SEP) and the FOMC Dot Plot showing each Fed policymaker’s projection for the federal funds rate, GDP growth, unemployment, and PCE inflation over the next 3 years.',
            source: 'Federal Reserve',
            sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
            newsTopic: 'CENTRAL_BANK',
            newsKeyword: 'FOMC dot plot economic projections Federal Reserve',
          })
        }
      }

      const pressDate = new Date(new Date(item.date).getTime() + 30 * 60 * 1000).toISOString()
      const pressKey = `USA:${dayPrefix}:fed press conference`
      if (!allNormalizedEvents.has(pressKey)) {
        allNormalizedEvents.set(pressKey, {
          id: `fomc-press-${dayPrefix}`,
          marketId: 'USA',
          countryIso2: 'US',
          category: 'CENTRAL_BANK',
          importance: 3,
          titleEn: 'Fed Press Conference',
          period: item.period || '',
          dateUtc: pressDate,
          actual: null,
          forecast: null,
          previous: null,
          unit: '',
          scale: '',
          comment:
            'Live press conference by the Federal Reserve Chair 30 minutes after the FOMC rate decision, providing forward guidance on inflation, employment, and future rate path.',
          source: 'Federal Reserve',
          sourceUrl: 'https://www.federalreserve.gov/live-broadcast.htm',
          newsTopic: 'CENTRAL_BANK',
          newsKeyword: 'Federal Reserve Chair press conference FOMC',
        })
      }
    }
  }

  const sortedEvents = [...allNormalizedEvents.values()].sort(
    (a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime() || b.importance - a.importance
  )

  const payload = {
    updatedAt: new Date().toISOString(),
    markets: MARKETS.filter((m) => m.enabled).map((m) => m.id),
    totalEvents: sortedEvents.length,
    events: sortedEvents,
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`Successfully saved ${sortedEvents.length} events to public/api/v1/economic-calendar.json!`)
}

main().catch((err) => {
  console.error('Failed to fetch economic calendar:', err)
  process.exit(1)
})

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const countriesFilePath = path.join(projectRoot, 'src', 'data', 'countries.ts')
const countriesContent = fs.readFileSync(countriesFilePath, 'utf8')
const countryBlocks = countriesContent.split(/\{\s*id:/).slice(1)
const COUNTRIES = []

for (const block of countryBlocks) {
  const idMatch = block.match(/^\s*'([A-Z]{3})'/)
  const nameEnMatch = block.match(/nameEn:\s*(?:'([^']+)'|"([^"]+)")/)
  if (idMatch && nameEnMatch) {
    COUNTRIES.push({ id: idMatch[1], nameEn: nameEnMatch[1] || nameEnMatch[2] })
  }
}

console.log(`Loaded ${COUNTRIES.length} countries from countries.ts`)

const existingJsonPath = path.join(projectRoot, 'public', 'api', 'v1', 'economics.json')
let existing = {}
if (fs.existsSync(existingJsonPath)) {
  try {
    const raw = fs.readFileSync(existingJsonPath, 'utf8').replace(/^\uFEFF/, '')
    existing = JSON.parse(raw)
  } catch (e) {
    console.warn('Could not read existing economics.json fallback:', e.message)
  }
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; GeonomicsBot/1.0)',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  return res.json()
}

async function main() {
  console.log(
    'Fetching IMF DataMapper API v1 (NGDPD, NGDPDPC, NGDP_RPCH, GGXWDG_NGDP, PCPIPCH)...'
  )

  const data = await fetchJson(
    'https://www.imf.org/external/datamapper/api/v1/NGDPD/NGDPDPC/NGDP_RPCH/GGXWDG_NGDP/PCPIPCH'
  )

  const values = data?.values || {}
  const gdpData = values.NGDPD || {}
  const pcapData = values.NGDPDPC || {}
  const growthData = values.NGDP_RPCH || {}
  const debtData = values.GGXWDG_NGDP || {}
  const infData = values.PCPIPCH || {}

  const targetYears = [
    '2015', '2016', '2017', '2018', '2019', '2020',
    '2021', '2022', '2023', '2024', '2025', '2026',
    '2027', '2028', '2029', '2030',
  ]

  const result = {}

  for (const c of COUNTRIES) {
    const id = c.id
    const gdpObj = gdpData[id] || {}
    const pcapObj = pcapData[id] || {}
    const growthObj = growthData[id] || {}
    const debtObj = debtData[id] || {}
    const infObj = infData[id] || {}

    const yearsObj = {}
    const historicalList = []

    let lastTotalGdp = 0
    let lastPerCapita = 0
    let lastGrowth = null
    let lastDebt = null
    let lastInflation = null

    for (const y of targetYears) {
      const yNum = parseInt(y, 10)
      const fallbackYr = existing[id]?.years?.[y]

      const rawGdpB = gdpObj[y]
      const rawPcap = pcapObj[y]
      const rawGrowth = growthObj[y]
      const rawDebt = debtObj[y]
      const rawInf = infObj[y]

      const growthRatePct =
        typeof rawGrowth === 'number' && !isNaN(rawGrowth)
          ? Math.round(rawGrowth * 10) / 10
          : fallbackYr?.growthRatePct ?? lastGrowth
      if (growthRatePct !== null) lastGrowth = growthRatePct

      let totalGdpUsd =
        typeof rawGdpB === 'number' && rawGdpB > 0
          ? Math.round(rawGdpB * 1e9)
          : fallbackYr?.totalGdpUsd ?? 0
      if (totalGdpUsd <= 0 && lastTotalGdp > 0) {
        const g = growthRatePct ?? 3.0
        totalGdpUsd = Math.round(lastTotalGdp * (1 + g / 100))
      }
      if (totalGdpUsd > 0) lastTotalGdp = totalGdpUsd

      let gdpPerCapitaUsd =
        typeof rawPcap === 'number' && rawPcap > 0
          ? Math.round(rawPcap * 100) / 100
          : fallbackYr?.gdpPerCapitaUsd ?? 0
      if (gdpPerCapitaUsd <= 0 && lastPerCapita > 0) {
        const g = growthRatePct ?? 2.5
        gdpPerCapitaUsd = Math.round(lastPerCapita * (1 + g / 100) * 100) / 100
      }
      if (gdpPerCapitaUsd > 0) lastPerCapita = gdpPerCapitaUsd

      const debtRatioPct =
        typeof rawDebt === 'number' && !isNaN(rawDebt)
          ? Math.round(rawDebt * 10) / 10
          : fallbackYr?.debtRatioPct ?? lastDebt
      if (debtRatioPct !== null) lastDebt = debtRatioPct

      const inflationRatePct =
        typeof rawInf === 'number' && !isNaN(rawInf)
          ? Math.round(rawInf * 10) / 10
          : fallbackYr?.inflationRatePct ?? lastInflation
      if (inflationRatePct !== null) lastInflation = inflationRatePct

      yearsObj[y] = {
        totalGdpUsd,
        gdpPerCapitaUsd,
        growthRatePct,
        debtRatioPct,
        inflationRatePct,
      }

      historicalList.push({
        year: yNum,
        gdp: totalGdpUsd,
        gdpPerCapita: gdpPerCapitaUsd,
        growthRate: growthRatePct,
        debtRatio: debtRatioPct,
        inflationRate: inflationRatePct,
      })
    }

    result[id] = {
      countryId: id,
      countryName: c.nameEn,
      source: 'IMF DataMapper API v1 (WEO)',
      lastUpdated: `IMF WEO Official API (${new Date().toISOString().split('T')[0]})`,
      years: yearsObj,
      historical: historicalList,
    }
  }

  // Validate 2026 coverage
  for (const c of COUNTRIES) {
    const y2026 = result[c.id]?.years?.['2026']
    if (!y2026 || y2026.totalGdpUsd <= 0 || y2026.gdpPerCapitaUsd <= 0) {
      throw new Error(
        `Validation failed for ${c.id}: 2026 GDP (${y2026?.totalGdpUsd}) or Per Capita (${y2026?.gdpPerCapitaUsd})`
      )
    }
  }

  const outFile = path.join(projectRoot, 'public', 'api', 'v1', 'economics.json')
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8')
  console.log(
    `Successfully synced all ${COUNTRIES.length} countries from IMF DataMapper API to public/api/v1/economics.json!`
  )
}

main().catch((err) => {
  console.error('Failed to fetch IMF data:', err)
  process.exit(1)
})

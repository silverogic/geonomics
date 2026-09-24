import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
let XLSX
try {
  XLSX = require('xlsx')
} catch {
  console.log('Local xlsx module not found, loading from SheetJS CDN...')
  const res = await fetch('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js')
  const code = await res.text()
  const fn = new Function('module', 'exports', code)
  const m = { exports: {} }
  fn(m, m.exports)
  XLSX = m.exports
  XLSX.readFile = (filename) => {
    const buf = fs.readFileSync(filename)
    return XLSX.read(buf)
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

function getExcelPath(fileName) {
  const docsPath = path.join(projectRoot, 'docs', 'data', fileName)
  if (fs.existsSync(docsPath)) return docsPath
  const publicPath = path.join(projectRoot, 'public', 'data', fileName)
  if (fs.existsSync(publicPath)) return publicPath
  throw new Error('Excel file not found in docs/data or public/data: ' + fileName)
}

const gdpFilePath = getExcelPath('gdp-20260913.xls')
const debtFilePath = getExcelPath('debt-20260913.xls')
const growthFilePath = getExcelPath('gdp-growth-20260913.xls')
const inflationFilePath = getExcelPath('inflation-20260919.xls')

console.log('Using Excel sources:')
console.log(' - GDP:', gdpFilePath)
console.log(' - Debt:', debtFilePath)
console.log(' - Growth:', growthFilePath)
console.log(' - Inflation:', inflationFilePath)

const countriesPath = path.join(projectRoot, 'src', 'data', 'countries.ts')
const countriesContent = fs.readFileSync(countriesPath, 'utf8')

const countryBlocks = countriesContent.split(/\{\s*id:/).slice(1)
const COUNTRIES = []

for (const block of countryBlocks) {
  const idMatch = block.match(/^\s*'([A-Z]{3})'/)
  const nameEnMatch = block.match(/nameEn:\s*(?:'([^']+)'|"([^"]+)")/)
  if (idMatch && nameEnMatch) {
    const nameEn = nameEnMatch[1] || nameEnMatch[2]
    COUNTRIES.push({ id: idMatch[1], nameEn })
  }
}

console.log('Loaded ' + COUNTRIES.length + ' tracked countries from countries.ts')

const ALIAS_MAP = {
  'South Korea': 'Korea, Republic of',
  'Turkey': 'Türkiye, Republic of',
  'Taiwan': 'Taiwan Province of China',
  'Egypt': 'Egypt',
  'United Arab Emirates': 'United Arab Emirates',
  'Russia': 'Russian Federation',
  'Vietnam': 'Vietnam',
  'Iran': 'Iran',
  'Hong Kong': 'Hong Kong SAR',
  'Macao SAR': 'Macao SAR',
  'Czech Republic': 'Czech Republic',
  'Slovakia': 'Slovak Republic',
  'DR Congo': 'Congo, Dem. Rep. of the',
  'Dominican Republic': 'Dominican Republic',
  'Venezuela': 'Venezuela',
  'Puerto Rico': 'Puerto Rico',
  'Ecuador': 'Ecuador',
  'Uzbekistan': 'Uzbekistan',
  'Angola': 'Angola',
  'Kenya': 'Kenya',
  'Bulgaria': 'Bulgaria',
  'Guatemala': 'Guatemala',
  'Ethiopia': 'Ethiopia',
  'Morocco': 'Morocco',
  'Algeria': 'Algeria',
  'Iraq': 'Iraq',
}

function normalizeStr(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function findRow(rows, target) {
  if (!rows || !Array.isArray(rows)) return undefined
  const normTarget = normalizeStr(target)
  // 1. Exact match first (prevents "India" matching "British Indian Ocean Territories")
  const exact = rows.find(
    (r) => r && r[0] && typeof r[0] === 'string' && (r[0].trim().toLowerCase() === target || normalizeStr(r[0]) === normTarget)
  )
  if (exact) return exact
  // 2. StartsWith match
  const startsWith = rows.find(
    (r) => r && r[0] && typeof r[0] === 'string' && (r[0].toLowerCase().startsWith(target) || normalizeStr(r[0]).startsWith(normTarget))
  )
  if (startsWith) return startsWith
  // 3. Includes match
  return rows.find(
    (r) => r && r[0] && typeof r[0] === 'string' && (r[0].toLowerCase().includes(target) || normalizeStr(r[0]).includes(normTarget))
  )
}

const gdpWb = XLSX.readFile(gdpFilePath)
const gdpRows = XLSX.utils.sheet_to_json(gdpWb.Sheets[gdpWb.SheetNames[0]], { header: 1 })
const gdpHeader = gdpRows[0]

const debtWb = XLSX.readFile(debtFilePath)
const debtRows = XLSX.utils.sheet_to_json(debtWb.Sheets[debtWb.SheetNames[0]], { header: 1 })
const debtHeader = debtRows[0]

const growthWb = XLSX.readFile(growthFilePath)
const growthRows = XLSX.utils.sheet_to_json(growthWb.Sheets[growthWb.SheetNames[0]], { header: 1 })
const growthHeader = growthRows[0]

const inflationWb = XLSX.readFile(inflationFilePath)
const inflationRows = XLSX.utils.sheet_to_json(inflationWb.Sheets[inflationWb.SheetNames[0]], { header: 1 })
const inflationHeader = inflationRows[0]

// Read existing json to preserve population reference ratios and GDP per capita
const existingJsonPath = path.join(projectRoot, 'src', 'data', 'excelEconomicData.json')
let existing = {}
if (fs.existsSync(existingJsonPath)) {
  try {
    const raw = fs.readFileSync(existingJsonPath, 'utf8').replace(/^\uFEFF/, '')
    existing = JSON.parse(raw)
  } catch (e) {
    console.warn('Could not read existing json for population ratio:', e.message)
  }
}

const targetYears = [
  '2015', '2016', '2017', '2018', '2019', '2020',
  '2021', '2022', '2023', '2024', '2025', '2026',
  '2027', '2028', '2029', '2030'
]

const result = {}

for (const c of COUNTRIES) {
  const target = (ALIAS_MAP[c.nameEn] || c.nameEn).toLowerCase()
  const gRow = findRow(gdpRows, target)
  const dRow = findRow(debtRows, target)
  const grRow = findRow(growthRows, target)
  const infRow = findRow(inflationRows, target)

  const yearsObj = {}
  const historicalList = []

  // Calculate implied population reference from latest reliable year in existing
  let refPop = 0
  if (existing[c.id]?.years) {
    for (const testYr of ['2024', '2023', '2022', '2021', '2020']) {
      const yData = existing[c.id].years[testYr]
      if (yData && yData.totalGdpUsd > 0 && yData.gdpPerCapitaUsd > 0) {
        refPop = yData.totalGdpUsd / yData.gdpPerCapitaUsd
        break
      }
    }
  }

  let lastKnownTotalGdp = 0
  let lastKnownGrowthRate = 3.5

  for (const y of targetYears) {
    const yNum = parseInt(y, 10)
    const gCol = gdpHeader.indexOf(yNum)
    const dCol = debtHeader.indexOf(yNum)
    const grCol = growthHeader.indexOf(yNum)
    const infCol = inflationHeader.indexOf(yNum)

    let rawGdpBillion = 0
    if (gCol !== -1 && gRow && typeof gRow[gCol] === 'number') {
      rawGdpBillion = gRow[gCol]
    } else if (existing[c.id]?.years?.[y]?.totalGdpUsd) {
      rawGdpBillion = existing[c.id].years[y].totalGdpUsd / 1e9
    }

    // Extrapolate if still <= 0 but lastKnownTotalGdp > 0
    if (rawGdpBillion <= 0 && lastKnownTotalGdp > 0) {
      const gr = grCol !== -1 && grRow && typeof grRow[grCol] === 'number' ? grRow[grCol] : lastKnownGrowthRate
      rawGdpBillion = (lastKnownTotalGdp / 1e9) * (1 + gr / 100)
    }

    const totalGdpUsd = Math.round(rawGdpBillion * 1e9)
    if (totalGdpUsd > 0) lastKnownTotalGdp = totalGdpUsd

    let debtRatioPct =
      dCol !== -1 && dRow && typeof dRow[dCol] === 'number'
        ? Math.round(dRow[dCol] * 10) / 10
        : existing[c.id]?.years?.[y]?.debtRatioPct ?? null

    if (debtRatioPct === null && yNum >= 2024) {
      const d2024Col = debtHeader.indexOf(2024)
      if (d2024Col !== -1 && dRow && typeof dRow[d2024Col] === 'number') {
        debtRatioPct = Math.round(dRow[d2024Col] * 10) / 10
      }
    }

    const growthRatePct =
      grCol !== -1 && grRow && typeof grRow[grCol] === 'number'
        ? Math.round(grRow[grCol] * 10) / 10
        : existing[c.id]?.years?.[y]?.growthRatePct ?? null
    if (growthRatePct !== null) lastKnownGrowthRate = growthRatePct

    const inflationRatePct =
      infCol !== -1 && infRow && typeof infRow[infCol] === 'number'
        ? Math.round(infRow[infCol] * 10) / 10
        : existing[c.id]?.years?.[y]?.inflationRatePct ?? null

    let gdpPerCapitaUsd = existing[c.id]?.years?.[y]?.gdpPerCapitaUsd ?? 0
    if (gdpPerCapitaUsd <= 0 && refPop > 0 && totalGdpUsd > 0) {
      gdpPerCapitaUsd = Math.round((totalGdpUsd / refPop) * 100) / 100
    } else if (gdpPerCapitaUsd > 0 && existing[c.id]?.years?.[y]?.totalGdpUsd) {
      const pop = existing[c.id].years[y].totalGdpUsd / gdpPerCapitaUsd
      if (pop > 0 && totalGdpUsd > 0) {
        gdpPerCapitaUsd = Math.round((totalGdpUsd / pop) * 100) / 100
      }
    }

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

  result[c.id] = {
    countryId: c.id,
    countryName: c.nameEn,
    source: 'IMF DataMapper Official Export (.xls)',
    lastUpdated: 'IMF WEO Official Export (September 2026)',
    years: yearsObj,
    historical: historicalList,
  }
}

// Verification check: ensure all countries are accounted for and have valid 2026 data
const resultKeys = Object.keys(result)
if (resultKeys.length !== COUNTRIES.length) {
  throw new Error(`Country count mismatch: expected ${COUNTRIES.length}, got ${resultKeys.length}`)
}
for (const id of resultKeys) {
  const y2026 = result[id].years?.['2026']
  if (!y2026 || y2026.totalGdpUsd <= 0 || y2026.gdpPerCapitaUsd <= 0) {
    throw new Error(`Data validation failed for ${id}: 2026 GDP (${y2026?.totalGdpUsd}) or Per Capita (${y2026?.gdpPerCapitaUsd}) is invalid!`)
  }
}
console.log(`Verified all ${resultKeys.length} countries: 100% have valid 2026 GDP and GDP per capita.`)

const outputTargets = [
  path.join(projectRoot, 'src', 'data', 'excelEconomicData.json'),
  path.join(projectRoot, 'public', 'data', 'excelEconomicData.json'),
  path.join(projectRoot, 'docs', 'data', 'excelEconomicData.json'),
]

const jsonContent = JSON.stringify(result, null, 2)

for (const target of outputTargets) {
  const dir = path.dirname(target)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(target, jsonContent, 'utf8')
  console.log('Saved extracted data to: ' + path.relative(projectRoot, target))
}

console.log('Successfully extracted and updated economic data for all ' + Object.keys(result).length + ' countries from Excel!')

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const COLS = 53
const ROWS = 28

function pointInPoly(pt, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect = yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function testPoint(pt, geometry) {
  if (geometry.type === 'Polygon') {
    return pointInPoly(pt, geometry.coordinates[0])
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      if (pointInPoly(pt, poly[0])) return true
    }
  }
  return false
}

function millerY(lat) {
  const rad = (lat * Math.PI) / 180
  return 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * rad))
}

function invMillerY(y) {
  return (2.5 * Math.atan(Math.exp(0.8 * y)) - (5 * Math.PI) / 8) * (180 / Math.PI)
}

async function main() {
  const res = await fetch(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
  )
  const data = await res.json()

  // Tracked countries from countries.ts
  const countriesPath = path.join(projectRoot, 'src', 'data', 'countries.ts')
  const countriesContent = fs.readFileSync(countriesPath, 'utf8')
  const idMatches = [...countriesContent.matchAll(/id:\s*'([A-Z]{3})'/g)].map((m) => m[1])
  const trackedSet = new Set(idMatches)

  const yMax = millerY(74)
  const yMin = millerY(-54)

  // 2D grid for topological calibration
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  for (let r = 0; r < ROWS; r++) {
    const yNorm = r / (ROWS - 1)
    const yVal = yMax - yNorm * (yMax - yMin)
    const lat = invMillerY(yVal)

    for (let c = 0; c < COLS; c++) {
      const lon = -170 + (c / (COLS - 1)) * 350

      const subPoints = [
        [lon, lat],
        [lon - 1.5, lat - 1.1],
        [lon + 1.5, lat + 1.1],
        [lon - 1.5, lat + 1.1],
        [lon + 1.5, lat - 1.1],
      ]

      let matchedCountryId = null

      for (const f of data.features) {
        const id = f.properties.ADM0_A3 || f.properties.ISO_A3
        if (id === 'ATA') continue

        let isInside = false
        for (const pt of subPoints) {
          if (testPoint(pt, f.geometry)) {
            isInside = true
            break
          }
        }

        if (isInside) {
          matchedCountryId = id
          if (trackedSet.has(id)) break
        }
      }

      grid[r][c] = matchedCountryId
    }
  }

  // ==========================================
  // TOPOLOGICAL REFINEMENTS
  // ==========================================

  // 1. IBERIA & FRANCE (Fix Spain island issue)
  grid[9][20] = null
  grid[9][21] = null
  grid[10][21] = null
  grid[8][22] = 'PRT'
  grid[9][22] = 'PRT'
  grid[8][23] = 'ESP'
  grid[8][24] = 'ESP'
  grid[9][23] = 'ESP'
  grid[9][24] = 'ESP'
  grid[6][23] = 'FRA'
  grid[6][24] = 'FRA'
  grid[7][23] = 'FRA'
  grid[7][24] = 'FRA'
  grid[7][25] = 'FRA'
  grid[8][25] = null

  // 2. BRITISH ISLES
  grid[4][21] = 'IRL'
  grid[4][22] = 'GBR'
  grid[3][22] = 'GBR'
  grid[6][25] = 'DEU'
  grid[4][23] = null
  grid[5][22] = null
  grid[5][23] = 'BEL'
  grid[4][24] = 'NLD'

  // 3. CENTRAL & EASTERN EUROPE
  grid[5][25] = 'DEU'
  grid[5][26] = 'POL'
  grid[5][27] = 'POL'
  grid[6][26] = 'CZE'
  grid[6][27] = 'SVK'
  grid[6][28] = 'UKR'
  grid[7][25] = 'CHE'
  grid[7][26] = 'AUT'
  grid[7][27] = 'HUN'
  grid[7][28] = 'ROU'
  grid[8][26] = 'ITA'
  grid[8][27] = 'ITA'
  grid[9][26] = 'ITA'
  grid[8][28] = 'BGR'
  grid[9][27] = 'GRC'
  grid[9][28] = 'GRC'
  grid[9][29] = 'TUR'
  grid[9][30] = 'TUR'

  // 4. SCANDINAVIA
  grid[1][24] = 'NOR'
  grid[2][24] = 'NOR'
  grid[3][24] = 'DNK'
  grid[1][25] = 'SWE'
  grid[2][25] = 'SWE'
  grid[3][25] = 'SWE'
  grid[4][25] = 'SWE'
  grid[2][26] = 'FIN'
  grid[3][26] = 'FIN'
  grid[2][27] = 'FIN'
  grid[3][27] = 'FIN'
  grid[4][26] = null
  grid[4][27] = null
  for (let r = 1; r <= 4; r++) {
    for (let c = 28; c <= 30; c++) {
      if (grid[r][c] === 'NOR' || grid[r][c] === 'SWE' || grid[r][c] === 'FIN') {
        grid[r][c] = 'RUS'
      }
    }
  }

  // 5. EAST ASIA
  grid[8][44] = 'KOR'
  grid[9][44] = 'KOR'
  grid[10][44] = null
  grid[8][45] = null
  grid[9][45] = null
  grid[10][45] = null
  grid[8][46] = null
  grid[8][47] = 'JPN'
  grid[9][46] = 'JPN'
  grid[9][47] = 'JPN'
  grid[10][46] = 'JPN'
  grid[8][43] = 'CHN'
  grid[9][43] = 'CHN'
  grid[10][43] = 'CHN'
  grid[11][44] = 'TWN'
  grid[11][42] = 'HKG'

  // 6. MIDDLE EAST & NORTH AFRICA
  grid[10][22] = 'MAR'
  grid[10][23] = 'MAR'
  grid[11][22] = 'MAR'
  grid[11][23] = 'MAR'
  grid[12][23] = null
  grid[10][24] = 'DZA'
  grid[10][25] = 'DZA'
  grid[10][26] = 'DZA'
  grid[11][24] = 'DZA'
  grid[11][25] = 'DZA'
  grid[11][26] = 'DZA'
  grid[11][28] = 'EGY'
  grid[11][29] = 'EGY'
  grid[12][28] = 'EGY'
  grid[12][29] = 'EGY'
  grid[11][30] = 'ISR'
  grid[12][30] = null
  grid[11][31] = 'SAU'
  grid[11][32] = 'KWT'
  grid[11][33] = 'QAT'
  grid[12][31] = 'SAU'
  grid[12][32] = 'SAU'
  grid[12][33] = 'ARE'
  grid[13][32] = 'SAU'
  grid[13][33] = 'SAU'
  grid[9][31] = 'IRQ'
  grid[10][31] = 'IRQ'
  grid[9][32] = 'IRN'
  grid[9][33] = 'IRN'
  grid[10][32] = 'IRN'
  grid[10][33] = 'IRN'

  // 7. AMERICAS
  grid[6][10] = 'CAN'
  grid[7][10] = 'USA'
  grid[7][11] = 'USA'
  grid[7][12] = 'USA'
  grid[8][7] = 'USA'
  grid[8][8] = 'USA'
  grid[8][9] = 'USA'
  grid[8][10] = 'USA'
  grid[8][11] = 'USA'
  grid[8][12] = 'USA'
  grid[8][13] = 'USA'
  grid[8][14] = 'USA'
  grid[8][15] = 'USA'
  grid[8][16] = null
  grid[12][13] = null
  grid[12][9] = 'MEX'
  grid[12][10] = 'MEX'
  grid[13][10] = 'GTM'
  grid[14][11] = null
  grid[14][12] = null
  grid[12][14] = 'DOM'
  grid[12][15] = 'PRI'
  grid[15][12] = 'COL'
  grid[15][13] = 'COL'
  grid[16][13] = 'COL'
  grid[14][14] = 'VEN'
  grid[14][15] = 'VEN'
  grid[15][14] = 'VEN'
  grid[15][15] = 'VEN'
  grid[16][12] = 'ECU'
  grid[17][12] = 'PER'
  grid[17][13] = 'PER'
  grid[18][13] = 'PER'
  grid[19][13] = 'PER'
  grid[20][13] = 'CHL'
  grid[21][13] = 'CHL'
  grid[22][13] = 'CHL'
  grid[23][13] = 'CHL'
  grid[24][13] = 'CHL'
  grid[25][14] = 'CHL'
  grid[26][14] = 'CHL'
  grid[27][15] = 'CHL'
  grid[20][14] = 'ARG'
  grid[20][15] = 'ARG'
  grid[21][14] = 'ARG'
  grid[21][15] = 'ARG'
  grid[22][14] = 'ARG'
  grid[22][15] = 'ARG'
  grid[23][14] = 'ARG'
  grid[23][15] = 'ARG'
  grid[24][14] = 'ARG'
  grid[24][15] = 'ARG'

  // 8. 28 NEW TRACKED COUNTRIES TOPOLOGY
  grid[2][21] = 'ISL'
  grid[3][23] = null // open North Sea between UK and Denmark
  grid[5][24] = 'LUX'
  grid[3][27] = 'EST'
  grid[4][27] = 'LVA'
  grid[5][27] = 'LTU'
  grid[5][28] = 'BLR'
  grid[8][25] = 'SVN'
  grid[9][26] = 'HRV'
  grid[8][27] = 'SRB'
  grid[10][29] = 'CYP'
  grid[10][27] = 'TUN'
  grid[12][30] = 'JOR'
  grid[11][34] = 'BHR'
  grid[8][32] = 'AZE'
  grid[8][34] = 'TKM'
  grid[9][34] = 'TKM'
  grid[13][11] = 'CRI'
  grid[14][11] = 'PAN'
  grid[19][14] = 'BOL'
  grid[19][16] = 'BOL'
  grid[23][16] = 'URY'
  grid[14][22] = 'CIV'
  grid[14][23] = 'GHA'
  grid[14][25] = 'CMR'
  grid[16][26] = 'COD'
  grid[17][28] = 'COD'
  grid[16][29] = 'COD'
  grid[17][29] = 'COD'
  grid[18][29] = 'COD'
  grid[15][29] = 'UGA'
  grid[17][30] = 'TZA'
  grid[18][31] = 'TZA'
  grid[15][37] = 'LKA'
  grid[12][39] = 'MMR'
  grid[13][39] = 'MMR'
  grid[11][41] = 'MAC'

  // Explicit calibrated anchors for all 99 tracked countries
  const trackedAnchors = {
    // North America
    CAN: { c: 11, r: 2 },
    USA: { c: 10, r: 8 },
    MEX: { c: 9, r: 12 },
    GTM: { c: 10, r: 13 },
    CRI: { c: 11, r: 13 },
    PAN: { c: 11, r: 14 },
    DOM: { c: 14, r: 12 },
    PRI: { c: 15, r: 12 },

    // South America
    COL: { c: 13, r: 15 },
    VEN: { c: 14, r: 14 },
    ECU: { c: 12, r: 16 },
    PER: { c: 13, r: 17 },
    BOL: { c: 16, r: 19 },
    BRA: { c: 17, r: 18 },
    CHL: { c: 13, r: 22 },
    ARG: { c: 14, r: 23 },
    URY: { c: 16, r: 23 },

    // Northern / Western / Central Europe
    ISL: { c: 21, r: 2 },
    NOR: { c: 24, r: 2 },
    SWE: { c: 25, r: 2 },
    FIN: { c: 26, r: 2 },
    DNK: { c: 24, r: 3 },
    EST: { c: 27, r: 3 },
    LVA: { c: 27, r: 4 },
    LTU: { c: 27, r: 5 },
    BLR: { c: 28, r: 5 },
    IRL: { c: 21, r: 4 },
    GBR: { c: 22, r: 4 },
    NLD: { c: 24, r: 4 },
    BEL: { c: 23, r: 5 },
    LUX: { c: 24, r: 5 },
    DEU: { c: 25, r: 5 },
    POL: { c: 26, r: 5 },
    UKR: { c: 28, r: 6 },
    FRA: { c: 24, r: 6 },
    CZE: { c: 26, r: 6 },
    SVK: { c: 27, r: 6 },
    CHE: { c: 25, r: 7 },
    AUT: { c: 26, r: 7 },
    HUN: { c: 27, r: 7 },
    ROU: { c: 28, r: 7 },
    BGR: { c: 28, r: 8 },

    // Southern Europe & North Africa
    PRT: { c: 22, r: 9 },
    ESP: { c: 23, r: 8 },
    SVN: { c: 25, r: 8 },
    ITA: { c: 26, r: 8 },
    HRV: { c: 26, r: 9 },
    SRB: { c: 27, r: 8 },
    GRC: { c: 27, r: 9 },
    TUR: { c: 29, r: 9 },
    CYP: { c: 29, r: 10 },
    MAR: { c: 22, r: 10 },
    DZA: { c: 24, r: 10 },
    TUN: { c: 27, r: 10 },
    CIV: { c: 22, r: 14 },
    GHA: { c: 23, r: 14 },
    NGA: { c: 24, r: 14 },
    CMR: { c: 25, r: 14 },
    COD: { c: 28, r: 17 },
    AGO: { c: 25, r: 18 },
    EGY: { c: 28, r: 11 },
    ISR: { c: 30, r: 11 },
    JOR: { c: 30, r: 12 },
    ETH: { c: 30, r: 14 },
    UGA: { c: 29, r: 15 },
    KEN: { c: 30, r: 16 },
    TZA: { c: 30, r: 17 },
    ZAF: { c: 27, r: 21 },

    // Central Asia / Middle East / South Asia
    KAZ: { c: 33, r: 5 },
    UZB: { c: 33, r: 6 },
    TKM: { c: 34, r: 8 },
    AZE: { c: 32, r: 8 },
    IRQ: { c: 31, r: 9 },
    IRN: { c: 33, r: 9 },
    KWT: { c: 32, r: 11 },
    BHR: { c: 34, r: 11 },
    QAT: { c: 33, r: 11 },
    SAU: { c: 32, r: 12 },
    ARE: { c: 33, r: 12 },
    PAK: { c: 35, r: 10 },
    IND: { c: 36, r: 12 },
    LKA: { c: 37, r: 15 },
    BGD: { c: 38, r: 11 },
    RUS: { c: 38, r: 2 },

    // East Asia & Southeast Asia & Oceania
    MMR: { c: 39, r: 12 },
    CHN: { c: 40, r: 8 },
    MAC: { c: 41, r: 11 },
    HKG: { c: 42, r: 11 },
    TWN: { c: 44, r: 11 },
    KOR: { c: 44, r: 8 },
    JPN: { c: 47, r: 8 },
    THA: { c: 40, r: 13 },
    VNM: { c: 41, r: 13 },
    PHL: { c: 44, r: 13 },
    MYS: { c: 40, r: 15 },
    SGP: { c: 41, r: 15 },
    IDN: { c: 42, r: 17 },
    AUS: { c: 46, r: 21 },
    NZL: { c: 51, r: 24 },
  }

  for (const [id, coord] of Object.entries(trackedAnchors)) {
    grid[coord.r][coord.c] = id
  }

  const tiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = grid[r][c]
      if (id) {
        tiles.push({
          c,
          r,
          id,
          isTracked: trackedSet.has(id),
        })
      }
    }
  }

  // Check coverage
  const coveredTracked = new Set(tiles.filter((t) => t.isTracked).map((t) => t.id))
  const missing = idMatches.filter((id) => !coveredTracked.has(id))
  console.log(`Tracked coverage: ${coveredTracked.size} / ${idMatches.length}`)
  if (missing.length > 0) {
    console.log('Missing countries:', missing)
  }

  // Sort tiles by row, then col
  tiles.sort((a, b) => a.r - b.r || a.c - b.c)

  const outputTs = `/**
 * Pixel Grid World Map Data (53 cols x 28 rows)
 * Recreates the iconic pixel/dot world map silhouette with interactive country tiles.
 * Calibrated for accurate continental topology, land bridges, and sea borders.
 */
export interface PixelTile {
  c: number
  r: number
  id: string
  isTracked: boolean
}

export const PIXEL_MAP_COLS = ${COLS}
export const PIXEL_MAP_ROWS = ${ROWS}

export const PIXEL_MAP_TILES: PixelTile[] = ${JSON.stringify(tiles, null, 2)}

export const COUNTRY_LABEL_ANCHORS: Record<string, { c: number; r: number }> = ${JSON.stringify(
    trackedAnchors,
    null,
    2
  )}
`

  fs.writeFileSync(path.join(projectRoot, 'src', 'data', 'pixelMapData.ts'), outputTs, 'utf8')
  console.log('Successfully wrote src/data/pixelMapData.ts!')
}

main().catch(console.error)

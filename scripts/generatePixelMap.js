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

  let tiles = []

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

      if (matchedCountryId) {
        tiles.push({
          c,
          r,
          id: matchedCountryId,
          isTracked: trackedSet.has(matchedCountryId),
        })
      }
    }
  }

  // Explicit anchors for all 71 tracked countries (53x28 grid)
  const trackedAnchors = {
    // North America
    CAN: { c: 11, r: 2 },
    USA: { c: 10, r: 6 },
    MEX: { c: 8, r: 11 },
    GTM: { c: 9, r: 12 },
    DOM: { c: 14, r: 12 },
    PRI: { c: 15, r: 12 },

    // South America (expanded eastward for Brazil)
    COL: { c: 12, r: 15 },
    VEN: { c: 14, r: 14 },
    ECU: { c: 11, r: 16 },
    PER: { c: 12, r: 17 },
    BRA: { c: 17, r: 18 },
    CHL: { c: 13, r: 22 },
    ARG: { c: 14, r: 23 },

    // Northern / Western / Central Europe
    NOR: { c: 24, r: 2 },
    SWE: { c: 25, r: 2 },
    FIN: { c: 27, r: 2 },
    DNK: { c: 24, r: 3 },
    IRL: { c: 21, r: 4 },
    GBR: { c: 22, r: 4 },
    NLD: { c: 24, r: 4 },
    BEL: { c: 23, r: 5 },
    DEU: { c: 25, r: 5 },
    POL: { c: 26, r: 5 },
    UKR: { c: 28, r: 5 },
    FRA: { c: 23, r: 6 },
    CZE: { c: 26, r: 6 },
    SVK: { c: 27, r: 6 },
    CHE: { c: 24, r: 7 },
    AUT: { c: 26, r: 7 },
    HUN: { c: 27, r: 7 },
    ROU: { c: 28, r: 7 },
    BGR: { c: 28, r: 8 },

    // Southern Europe & North Africa
    PRT: { c: 20, r: 9 },
    ESP: { c: 21, r: 9 },
    ITA: { c: 25, r: 9 },
    GRC: { c: 27, r: 9 },
    TUR: { c: 29, r: 9 },
    MAR: { c: 21, r: 10 },
    DZA: { c: 24, r: 10 },
    NGA: { c: 24, r: 14 },
    AGO: { c: 25, r: 18 },
    EGY: { c: 28, r: 11 },
    ISR: { c: 29, r: 11 },
    ETH: { c: 29, r: 14 },
    KEN: { c: 28, r: 16 },
    ZAF: { c: 27, r: 21 },

    // Central Asia / Middle East / South Asia
    KAZ: { c: 33, r: 5 },
    UZB: { c: 33, r: 6 },
    IRQ: { c: 31, r: 9 },
    IRN: { c: 33, r: 9 },
    KWT: { c: 32, r: 11 },
    QAT: { c: 33, r: 11 },
    SAU: { c: 32, r: 12 },
    ARE: { c: 33, r: 12 },
    PAK: { c: 35, r: 10 },
    IND: { c: 36, r: 12 },
    BGD: { c: 38, r: 11 },
    RUS: { c: 38, r: 2 },

    // East Asia & Southeast Asia & Oceania
    CHN: { c: 40, r: 8 },
    KOR: { c: 44, r: 8 },
    JPN: { c: 47, r: 8 },
    HKG: { c: 42, r: 11 },
    TWN: { c: 44, r: 11 },
    THA: { c: 40, r: 13 },
    VNM: { c: 42, r: 13 },
    PHL: { c: 45, r: 13 },
    MYS: { c: 40, r: 15 },
    SGP: { c: 41, r: 15 },
    IDN: { c: 42, r: 17 },
    AUS: { c: 46, r: 21 },
    NZL: { c: 51, r: 24 },
  }

  for (const [id, coord] of Object.entries(trackedAnchors)) {
    const existing = tiles.find((t) => t.c === coord.c && t.r === coord.r)
    if (existing) {
      existing.id = id
      existing.isTracked = true
    } else {
      tiles.push({ c: coord.c, r: coord.r, id, isTracked: true })
    }
  }

  // Dover Strait: c: 23, r: 4 should be ocean
  tiles = tiles.filter((t) => !(t.c === 23 && t.r === 4))

  // Sea of Japan: c: 45, r: 8 and c: 46, r: 8 should be ocean
  tiles = tiles.filter((t) => !((t.c === 45 || t.c === 46) && t.r === 8))

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

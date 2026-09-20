import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const COLS = 46
const ROWS = 23

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

  const tiles = []

  for (let r = 0; r < ROWS; r++) {
    const yNorm = r / (ROWS - 1)
    const yVal = yMax - yNorm * (yMax - yMin)
    const lat = invMillerY(yVal)

    for (let c = 0; c < COLS; c++) {
      const lon = -170 + (c / (COLS - 1)) * 350

      const subPoints = [
        [lon, lat],
        [lon - 1.8, lat - 1.2],
        [lon + 1.8, lat + 1.2],
        [lon - 1.8, lat + 1.2],
        [lon + 1.8, lat - 1.2],
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

  // Explicit anchors for all 56 tracked countries to ensure coverage
  const trackedAnchors = {
    USA: { c: 9, r: 5 },
    CHN: { c: 35, r: 7 },
    DEU: { c: 23, r: 5 },
    JPN: { c: 41, r: 6 },
    IND: { c: 31, r: 10 },
    GBR: { c: 21, r: 4 },
    FRA: { c: 22, r: 6 },
    ITA: { c: 23, r: 7 },
    BRA: { c: 15, r: 15 },
    CAN: { c: 10, r: 2 },
    RUS: { c: 33, r: 2 },
    MEX: { c: 7, r: 9 },
    AUS: { c: 40, r: 18 },
    KOR: { c: 38, r: 7 },
    ESP: { c: 20, r: 7 },
    IDN: { c: 37, r: 14 },
    TUR: { c: 27, r: 7 },
    NLD: { c: 22, r: 4 },
    SAU: { c: 29, r: 10 },
    CHE: { c: 22, r: 6 },
    POL: { c: 24, r: 4 },
    SWE: { c: 23, r: 2 },
    BEL: { c: 21, r: 5 },
    ARG: { c: 13, r: 19 },
    IRL: { c: 20, r: 4 },
    NOR: { c: 22, r: 2 },
    AUT: { c: 24, r: 6 },
    ISR: { c: 27, r: 9 },
    ARE: { c: 30, r: 10 },
    SGP: { c: 36, r: 13 },
    MYS: { c: 35, r: 13 },
    ZAF: { c: 25, r: 18 },
    PHL: { c: 39, r: 11 },
    DNK: { c: 22, r: 3 },
    EGY: { c: 26, r: 9 },
    BGD: { c: 33, r: 9 },
    VNM: { c: 36, r: 11 },
    NGA: { c: 22, r: 12 },
    THA: { c: 35, r: 11 },
    HKG: { c: 37, r: 9 },
    NZL: { c: 44, r: 20 },
    FIN: { c: 25, r: 2 },
    PRT: { c: 19, r: 7 },
    COL: { c: 11, r: 12 },
    CHL: { c: 12, r: 18 },
    CZE: { c: 24, r: 5 },
    ROU: { c: 26, r: 6 },
    PER: { c: 11, r: 14 },
    GRC: { c: 25, r: 7 },
    QAT: { c: 30, r: 9 },
    HUN: { c: 25, r: 6 },
    KWT: { c: 29, r: 9 },
    UKR: { c: 26, r: 5 },
    TWN: { c: 38, r: 9 },
    PAK: { c: 30, r: 8 },
    KAZ: { c: 30, r: 4 },
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
 * Pixel Grid World Map Data (46 cols x 23 rows)
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

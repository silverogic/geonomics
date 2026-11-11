import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

function pointInPoly(pt, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect =
      yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
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
  console.log('Fetching Natural Earth 50m GeoJSON for terrain-fitted globe dots...')
  const res = await fetch(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch ne_50m GeoJSON: ${res.status} ${res.statusText}`)
  }
  const geo = await res.json()

  const pmPath = path.join(projectRoot, 'src', 'data', 'pixelMapData.ts')
  const pmContent = fs.readFileSync(pmPath, 'utf8')
  const tilesMatch = pmContent.match(
    /PIXEL_MAP_TILES:\s*PixelTile\[\]\s*=\s*(\[[\s\S]*?\])\s*export const COUNTRY_LABEL_ANCHORS/
  )
  if (!tilesMatch) {
    throw new Error('Could not parse PIXEL_MAP_TILES from pixelMapData.ts')
  }

  const tiles = JSON.parse(tilesMatch[1])

  const tileMap = new Map()
  for (const t of tiles) {
    tileMap.set(`${t.c},${t.r}`, t.id)
  }

  const yMax = millerY(74)
  const yMin = millerY(-54)

  function colRowToLonLat(c, r) {
    const lon = -170 + (c / 52) * 350
    const yNorm = r / 27
    const yVal = yMax - yNorm * (yMax - yMin)
    const lat = invMillerY(yVal)
    return [lon, lat]
  }

  // Test if a [lon, lat] point (or slight coastal tolerance around it) is land in Natural Earth 50m
  function isGeoLand(lon, lat, radiusDeg = 0.55) {
    const samples = [
      [lon, lat],
      [lon - radiusDeg, lat],
      [lon + radiusDeg, lat],
      [lon, lat - radiusDeg * 0.8],
      [lon, lat + radiusDeg * 0.8],
    ]
    for (const f of geo.features) {
      const id = f.properties.ADM0_A3 || f.properties.ISO_A3
      if (id === 'ATA') continue
      for (const pt of samples) {
        if (testPoint(pt, f.geometry)) return true
      }
    }
    return false
  }

  // 3x3 sub-grid per tile with Natural Earth 50m coastline & peninsula sculpting
  const subOffsets = [-0.33, 0, 0.33]
  const terrainDots = []

  for (const t of tiles) {
    const { c, r, id } = t
    const leftId = tileMap.get(`${c - 1},${r}`)
    const rightId = tileMap.get(`${c + 1},${r}`)
    const upId = tileMap.get(`${c},${r - 1}`)
    const downId = tileMap.get(`${c},${r + 1}`)
    const orthogonalCount =
      (leftId ? 1 : 0) + (rightId ? 1 : 0) + (upId ? 1 : 0) + (downId ? 1 : 0)

    const tileDots = []

    for (const dr of subOffsets) {
      for (const dc of subOffsets) {
        const sc = Math.sign(dc)
        const sr = Math.sign(dr)

        const hasH = sc === 0 || tileMap.has(`${c + sc},${r}`)
        const hasV = sr === 0 || tileMap.has(`${c},${r + sr}`)
        const hasD = sc === 0 || sr === 0 || tileMap.has(`${c + sc},${r + sr}`)

        const [lon, lat] = colRowToLonLat(c + dc, r + dr)
        const inGeo = isGeoLand(lon, lat, 0.5)

        let keep = false
        if (sc === 0 && sr === 0) {
          // Center of every land tile is always preserved
          keep = true
        } else if (sc !== 0 && sr !== 0) {
          // Corner sub-dot:
          // - Keep if fully interior (hasH && hasV && hasD)
          // - Or if concave/coastal corner supported by Natural Earth 50m geometry
          if (hasH && hasV && (hasD || inGeo)) {
            keep = true
          } else if (inGeo && (hasH || hasV)) {
            keep = true
          }
        } else {
          // Orthogonal edge sub-dot:
          const neighborExists = sc !== 0 ? hasH : hasV
          if (neighborExists || inGeo) {
            keep = true
          } else if (orthogonalCount === 0 && sr === 0) {
            // Isolated 1-tile island (e.g. ISL, CYP, SGP, BHR, TWN, NZL): keep horizontal pair for crisp silhouette
            keep = true
          }
        }

        if (keep) {
          // Check if this sub-dot is on the outer boundary of its country (useful for 3D side-wall optimization)
          const sameH = sc === 0 || tileMap.get(`${c + sc},${r}`) === id
          const sameV = sr === 0 || tileMap.get(`${c},${r + sr}`) === id
          const sameD = sc === 0 || sr === 0 || tileMap.get(`${c + sc},${r + sr}`) === id
          const isEdge = !(sameH && sameV && sameD)

          tileDots.push({
            c: Number((c + dc).toFixed(2)),
            r: Number((r + dr).toFixed(2)),
            id,
            e: isEdge ? 1 : 0,
          })
        }
      }
    }

    // Guarantee at least 3 terrain dots for small island nations/peninsulas so they remain clearly visible
    if (tileDots.length < 3) {
      const fallbackOffsets = [
        [-0.25, 0],
        [0, 0],
        [0.25, 0],
        [0, -0.25],
      ]
      for (const [fdc, fdr] of fallbackOffsets) {
        if (tileDots.length >= 3) break
        const fc = Number((c + fdc).toFixed(2))
        const fr = Number((r + fdr).toFixed(2))
        if (!tileDots.some((d) => d.c === fc && d.r === fr)) {
          tileDots.push({ c: fc, r: fr, id, e: 1 })
        }
      }
    }

    terrainDots.push(...tileDots)
  }

  console.log(
    `Generated ${terrainDots.length} terrain-sculpted globe dots across ${tiles.length} tiles.`
  )

  const outPath = path.join(projectRoot, 'src', 'data', 'globeTerrainDots.ts')
  const fileContent = `/**
 * High-Precision Terrain-Sculpted Globe Dots
 * Generated from Natural Earth 50m coastline geometry + topological calibration.
 * Provides ~25% finer dot pitch and real coastline/peninsula contours for FinancialGlobeView.
 */
export interface GlobeTerrainDot {
  /** Fractional column in [0..52] grid space */
  c: number
  /** Fractional row in [0..27] grid space */
  r: number
  /** ISO-3166 alpha-3 country code */
  id: string
  /** 1 if on coastline or country border (needs full 3D side-wall extrusion), 0 if interior */
  e: 0 | 1
}

export const GLOBE_TERRAIN_DOTS: GlobeTerrainDot[] = ${JSON.stringify(terrainDots)}
`

  fs.writeFileSync(outPath, fileContent, 'utf8')
  console.log(`Wrote ${outPath} (${(fileContent.length / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

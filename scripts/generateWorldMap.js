import fs from 'fs'

async function generate() {
  console.log('Fetching Natural Earth 110m GeoJSON...')
  const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
  if (!res.ok) {
    throw new Error(`Failed to fetch geojson: ${res.statusText}`)
  }
  const data = await res.json()

  const width = 1000
  const height = 520

  function millerY(lat) {
    const rad = (lat * Math.PI) / 180
    return 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * rad))
  }

  function project(lon, lat) {
    const x = ((lon + 180) / 360) * width
    const clampedLat = Math.max(-58, Math.min(83.5, lat))
    const yVal = millerY(clampedLat)
    const y = 20 + (1.92 - yVal) * (475 / 3.05)
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
  }

  function coordsToPath(coords, type) {
    let d = ''
    const rings = type === 'Polygon' ? [coords] : coords
    for (const poly of rings) {
      for (const ring of poly) {
        for (let i = 0; i < ring.length; i++) {
          const pt = project(ring[i][0], ring[i][1])
          d += (i === 0 ? 'M' : 'L') + pt[0] + ' ' + pt[1]
        }
        d += 'Z'
      }
    }
    return d
  }

  // Key visual centroid positions
  const overrides = {
    USA: [285, 185],
    CAN: [270, 115],
    RUS: [680, 120],
    CHN: [770, 205],
    FRA: [495, 160],
    NOR: [515, 105],
    JPN: [865, 195],
    GBR: [480, 135],
    IDN: [820, 345],
    MYS: [785, 325],
    CHL: [305, 420],
    NZL: [965, 440],
    GRC: [550, 190],
    ITA: [520, 175],
    ESP: [470, 190],
    TUR: [580, 185],
    EGY: [585, 230],
    SAU: [625, 245],
    ZAF: [565, 420],
    BRA: [350, 360],
    ARG: [315, 430],
    IND: [725, 245],
    AUS: [875, 395],
    KOR: [842, 192],
    MEX: [225, 235],
    DEU: [510, 145],
    SGP: [788, 331],
    HKG: [817, 240],
    SWE: [530, 100],
    FIN: [565, 95],
    POL: [535, 140],
    UKR: [570, 150],
    KAZ: [675, 165],
    IRN: [640, 215],
    PAK: [695, 225],
    THA: [775, 265],
    VNM: [800, 260],
    PHL: [845, 275],
    TWN: [825, 230],
    NLD: [498, 140],
    BEL: [495, 146],
    CHE: [506, 162],
    AUT: [522, 158],
    IRL: [462, 136],
    PRT: [455, 195],
    COL: [290, 310],
    PER: [285, 360],
    NGA: [505, 290],
    KEN: [580, 330],
    ISR: [578, 222],
    ARE: [642, 238],
    QAT: [638, 235],
    KWT: [630, 226],
  }

  function calcCentroid(coords, type, countryId) {
    if (overrides[countryId]) return overrides[countryId]

    const rings = type === 'Polygon' ? [coords] : coords
    let maxArea = -1
    let bestRing = rings[0][0]
    for (const poly of rings) {
      const ring = poly[0]
      if (ring.length > maxArea) {
        maxArea = ring.length
        bestRing = ring
      }
    }
    let sumX = 0
    let sumY = 0
    for (const pt of bestRing) {
      const p = project(pt[0], pt[1])
      sumX += p[0]
      sumY += p[1]
    }
    return [Math.round(sumX / bestRing.length), Math.round(sumY / bestRing.length)]
  }

  const countries = []
  for (const f of data.features) {
    const p = f.properties
    const id = p.ADM0_A3 || p.ISO_A3
    if (!id || id === 'ATA') continue // Skip Antarctica
    const d = coordsToPath(f.geometry.coordinates, f.geometry.type)
    const centroid = calcCentroid(f.geometry.coordinates, f.geometry.type, id)
    countries.push({
      id,
      iso2: p.ISO_A2 || '',
      name: p.NAME || '',
      d,
      centroid,
    })
  }

  // Add SGP & HKG micro-markers
  countries.push({
    id: 'SGP',
    iso2: 'SG',
    name: 'Singapore',
    d: 'M785 328h7v7h-7Z',
    centroid: [788, 331],
  })
  countries.push({
    id: 'HKG',
    iso2: 'HK',
    name: 'Hong Kong',
    d: 'M814 237h7v7h-7Z',
    centroid: [817, 240],
  })

  const tsContent = `/**
 * Pre-projected World Map SVG paths (Miller cylindrical projection, 1000x520)
 * Sourced from Natural Earth 110m resolution boundary dataset.
 */
export interface MapCountryPath {
  id: string
  iso2: string
  name: string
  d: string
  centroid: [number, number]
}

export const WORLD_MAP_PATHS: MapCountryPath[] = ${JSON.stringify(countries, null, 2)}
`

  fs.writeFileSync('src/data/worldMapData.ts', tsContent, 'utf8')
  console.log(`Successfully generated src/data/worldMapData.ts with ${countries.length} countries.`)
}

generate().catch((err) => {
  console.error('Error generating map data:', err)
  process.exit(1)
})

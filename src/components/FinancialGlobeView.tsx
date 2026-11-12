import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Coins,
  BarChart3,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type {
  BaseCurrency,
  CountryMeta,
  ExchangeRates,
  InterestRateInfo,
  Language,
} from '../types/economics'
import type { CountryRowItem } from './RankingTable'
import { COUNTRIES } from '../data/countries'
import { getImfYearMap } from '../data/imfEconomic'
import {
  PIXEL_MAP_COLS,
  COUNTRY_LABEL_ANCHORS,
} from '../data/pixelMapData'
import { GLOBE_TERRAIN_DOTS } from '../data/globeTerrainDots'
import { getAllStockPrices, type StockPoint, type StockPriceInfo } from '../data/stockPrices'
import { fetchLiveStocks, isLiveStockEnabled } from '../services/liveStockApi'
import { fetchLiveFxQuotes, type LiveFxQuote } from '../services/liveFxApi'
import {
  getConversionRate,
  getFxChangePct,
} from '../services/exchangeApi'
import { getCountryInterestRate } from '../services/interestRateApi'
import { getCountryName } from '../utils/countryNames'
import { detectVisitorCountry } from '../utils/locale'
import {
  formatGdpCompact,
  formatPerCapita,
  formatFxChangeBadgeText,
  getFxBadgeColorClass,
} from '../utils/formatters'
import { CountryFlag } from './CountryFlag'
import { StockSparkline } from './StockSparkline'

interface FinancialGlobeViewProps {
  items?: CountryRowItem[]
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  refreshKey?: number
}

type GlobeDisplayMode = 'gdp' | 'stocks' | 'fx'
type RegionPreset = 'auto' | 'asia' | 'europe' | 'americas' | 'oceania'

interface HubDefinition {
  id: string
  offsetX: number
  offsetY: number
  desktopOnly?: boolean
}

const FLAGSHIP_HUBS: HubDefinition[] = [
  // Asia & Middle East (15)
  { id: 'KOR', offsetX: -18, offsetY: -26 },
  { id: 'JPN', offsetX: 34, offsetY: -16 },
  { id: 'CHN', offsetX: -36, offsetY: 6 },
  { id: 'TWN', offsetX: 34, offsetY: 16 },
  { id: 'HKG', offsetX: -28, offsetY: 32 },
  { id: 'SGP', offsetX: -24, offsetY: 22 },
  { id: 'IDN', offsetX: 26, offsetY: 28 },
  { id: 'IND', offsetX: -22, offsetY: 18 },
  { id: 'SAU', offsetX: -18, offsetY: 16 },
  { id: 'THA', offsetX: -30, offsetY: 14, desktopOnly: true },
  { id: 'VNM', offsetX: 30, offsetY: 8, desktopOnly: true },
  { id: 'MYS', offsetX: -28, offsetY: 28, desktopOnly: true },
  { id: 'PHL', offsetX: 36, offsetY: 22, desktopOnly: true },
  { id: 'ARE', offsetX: 28, offsetY: 20, desktopOnly: true },
  { id: 'ISR', offsetX: -26, offsetY: -14, desktopOnly: true },

  // Europe (13)
  { id: 'GBR', offsetX: -38, offsetY: -22 },
  { id: 'FRA', offsetX: -36, offsetY: 16 },
  { id: 'DEU', offsetX: 30, offsetY: -18 },
  { id: 'CHE', offsetX: 34, offsetY: 18 },
  { id: 'ESP', offsetX: -32, offsetY: 28 },
  { id: 'SWE', offsetX: 18, offsetY: -28 },
  { id: 'TUR', offsetX: 28, offsetY: 16 },
  { id: 'ITA', offsetX: 22, offsetY: 28, desktopOnly: true },
  { id: 'NLD', offsetX: -28, offsetY: -28, desktopOnly: true },
  { id: 'POL', offsetX: 34, offsetY: -10, desktopOnly: true },
  { id: 'NOR', offsetX: -20, offsetY: -32, desktopOnly: true },
  { id: 'BEL', offsetX: -34, offsetY: -6, desktopOnly: true },
  { id: 'AUT', offsetX: 32, offsetY: 8, desktopOnly: true },

  // Americas (7)
  { id: 'USA', offsetX: 24, offsetY: 14 },
  { id: 'CAN', offsetX: -24, offsetY: -26 },
  { id: 'MEX', offsetX: -26, offsetY: 20 },
  { id: 'BRA', offsetX: 26, offsetY: -12 },
  { id: 'ARG', offsetX: -22, offsetY: 24 },
  { id: 'CHL', offsetX: -30, offsetY: 16, desktopOnly: true },
  { id: 'COL', offsetX: -28, offsetY: -12, desktopOnly: true },

  // Oceania & Africa (5)
  { id: 'AUS', offsetX: -24, offsetY: -16 },
  { id: 'NZL', offsetX: 28, offsetY: 20 },
  { id: 'ZAF', offsetX: 20, offsetY: 20 },
  { id: 'EGY', offsetX: -22, offsetY: 22, desktopOnly: true },
  { id: 'NGA', offsetX: -26, offsetY: 18, desktopOnly: true },
]

const BASE_CURRENCY_HUB_ID: Record<BaseCurrency, string> = {
  KRW: 'KOR',
  USD: 'USA',
  EUR: 'DEU',
  JPY: 'JPN',
  GBP: 'GBR',
  CNY: 'CHN',
  CHF: 'CHE',
  AUD: 'AUS',
}

interface Vec3 {
  x: number
  y: number
  z: number
}

interface LandDot extends Vec3 {
  countryId: string
  isEdge: boolean
}

interface CountryGdpElevationInfo {
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  rank: number
  terrainElev: number
  layerCount: number
  tierIndex: 0 | 1 | 2 | 3 | 4
}

interface ProjectedCapsule {
  id: string
  country: CountryMeta
  surfaceX: number
  surfaceY: number
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  totalGdpUsd: number
  gdpPerCapitaUsd: number
  growthRatePct: number | null
  gdpRank: number
  stock?: StockPriceInfo
  stockChangePct: number
  indexName: string
  currency: string
  multiplier: number
  fxRate: number
  fxChangePct: number | null
  policyRatePct: number | null
}

// 5 GDP Choropleth Tiers for 3D Stacked Voxel Continents (side wall shading + top cap highlight)
const GDP_VOXEL_STYLES: Array<{
  sideWall: string
  topCapMid: string
  topCapFront: string
}> = [
  // Tier 0: Untracked / < $100B (flat lowland)
  {
    sideWall: 'rgba(6, 78, 59, 0.32)',
    topCapMid: 'rgba(16, 185, 129, 0.34)',
    topCapFront: 'rgba(52, 211, 153, 0.52)',
  },
  // Tier 1: $100B ~ $500B (low plateau)
  {
    sideWall: 'rgba(6, 95, 70, 0.55)',
    topCapMid: 'rgba(16, 185, 129, 0.52)',
    topCapFront: 'rgba(52, 211, 153, 0.72)',
  },
  // Tier 2: $500B ~ $2T (mid block: South Korea, Australia, Canada, Brazil, etc.)
  {
    sideWall: 'rgba(4, 120, 87, 0.68)',
    topCapMid: 'rgba(52, 211, 153, 0.68)',
    topCapFront: 'rgba(110, 231, 183, 0.88)',
  },
  // Tier 3: $2T ~ $10T (high block: Germany, Japan, India, UK, France, etc.)
  {
    sideWall: 'rgba(5, 150, 105, 0.78)',
    topCapMid: 'rgba(110, 231, 183, 0.80)',
    topCapFront: 'rgba(167, 243, 208, 0.95)',
  },
  // Tier 4: $10T+ Superpowers (tallest block: USA, China)
  {
    sideWall: 'rgba(16, 185, 129, 0.85)',
    topCapMid: 'rgba(167, 243, 208, 0.90)',
    topCapFront: 'rgba(209, 250, 229, 1.0)',
  },
]

// 8 Stock Change % Color Buckets for 'stocks' Display Mode (0 = untracked, 1..3 = down, 4 = flat, 5..7 = up)
const STOCK_DOT_STYLES: Array<{
  mid: string
  front: string
}> = [
  // 0: Untracked / No stock index
  {
    mid: 'rgba(71, 85, 105, 0.26)',
    front: 'rgba(100, 116, 139, 0.40)',
  },
  // 1: Strong Bear (<= -1.5%)
  {
    mid: 'rgba(225, 29, 72, 0.78)',
    front: 'rgba(251, 113, 133, 0.96)',
  },
  // 2: Moderate Bear (-1.5% < pct <= -0.5%)
  {
    mid: 'rgba(244, 63, 94, 0.62)',
    front: 'rgba(251, 113, 133, 0.82)',
  },
  // 3: Slight Bear (-0.5% < pct < -0.15%)
  {
    mid: 'rgba(244, 63, 94, 0.46)',
    front: 'rgba(253, 164, 175, 0.68)',
  },
  // 4: Flat / Neutral (-0.15% <= pct <= +0.15%)
  {
    mid: 'rgba(100, 116, 139, 0.46)',
    front: 'rgba(148, 163, 184, 0.68)',
  },
  // 5: Slight Bull (+0.15% < pct < +0.5%)
  {
    mid: 'rgba(16, 185, 129, 0.48)',
    front: 'rgba(110, 231, 183, 0.70)',
  },
  // 6: Moderate Bull (+0.5% <= pct < +1.5%)
  {
    mid: 'rgba(16, 185, 129, 0.65)',
    front: 'rgba(52, 211, 153, 0.86)',
  },
  // 7: Strong Bull (>= +1.5%)
  {
    mid: 'rgba(5, 150, 105, 0.82)',
    front: 'rgba(110, 231, 183, 0.98)',
  },
]

function getStockColorBucket(changePct: number): number {
  if (changePct <= -1.5) return 1
  if (changePct <= -0.5) return 2
  if (changePct < -0.15) return 3
  if (changePct <= 0.15) return 4
  if (changePct < 0.5) return 5
  if (changePct < 1.5) return 6
  return 7
}

function getFxColorBucket(changePct: number): number {
  if (changePct <= -0.6) return 1
  if (changePct <= -0.2) return 2
  if (changePct < -0.01) return 3
  if (changePct <= 0.01) return 4
  if (changePct < 0.2) return 5
  if (changePct < 0.6) return 6
  return 7
}

// Module-level cached 3D unit vectors for Dot-Matrix continents, graticule rings & Arctic Easter Egg
let cachedLandDots: LandDot[] | null = null
let cachedGraticuleLines: Vec3[][] | null = null
let cachedArcticShelfRing: Vec3[] | null = null
let cachedMiniIceFloes: Vec3[][] | null = null
let cachedArcticIceDots: Vec3[] | null = null
let cachedAntarcticShelfRing: Vec3[] | null = null
let cachedAntarcticMiniFloes: Vec3[][] | null = null
let cachedAntarcticIceDots: Vec3[] | null = null

function latLonToVec3(latDeg: number, lonDeg: number): Vec3 {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  const cosLat = Math.cos(lat)
  return {
    x: cosLat * Math.sin(lon),
    y: -Math.sin(lat),
    z: cosLat * Math.cos(lon),
  }
}

function getArcticEasterEggGeometry(): {
  shelfRing: Vec3[]
  miniFloes: Vec3[][]
  iceDots: Vec3[]
} {
  if (cachedArcticShelfRing && cachedMiniIceFloes && cachedArcticIceDots) {
    return {
      shelfRing: cachedArcticShelfRing,
      miniFloes: cachedMiniIceFloes,
      iceDots: cachedArcticIceDots,
    }
  }

  // 1. Main polar ice floe perimeter with organic scalloped coastline around 84.5°N ~ 86.2°N
  const shelfRing: Vec3[] = []
  for (let deg = 0; deg < 360; deg += 8) {
    const rad = (deg * Math.PI) / 180
    const latEdge =
      85.1 +
      0.65 * Math.sin(rad * 3 + 0.4) +
      0.45 * Math.cos(rad * 5 - 1.1) +
      0.25 * Math.sin(rad * 7 + 2.0)
    shelfRing.push(latLonToVec3(latEdge, deg))
  }

  // 2. Two smaller drifting satellite ice floes (유빙) nearby
  const miniCenters = [
    { lat: 82.8, lon: 38, rLat: 1.05, rLon: 9.5 },
    { lat: 83.2, lon: -125, rLat: 0.9, rLon: 8.5 },
    { lat: 82.5, lon: 145, rLat: 0.85, rLon: 7.5 },
  ]
  const miniFloes: Vec3[][] = miniCenters.map((mc) => {
    const pts: Vec3[] = []
    for (let a = 0; a < 360; a += 30) {
      const ar = (a * Math.PI) / 180
      const wobble = 1 + 0.16 * Math.sin(ar * 3 + mc.lon)
      const pLat = mc.lat + Math.cos(ar) * mc.rLat * wobble
      const pLon = mc.lon + Math.sin(ar) * mc.rLon * wobble
      pts.push(latLonToVec3(pLat, pLon))
    }
    return pts
  })

  // 3. Surrounding dot-matrix sea-ice crystals blending into the globe's dot aesthetic
  const iceDots: Vec3[] = []
  const ringSpecs = [
    { lat: 83.4, step: 18 },
    { lat: 84.6, step: 22 },
    { lat: 86.0, step: 30 },
    { lat: 87.5, step: 45 },
  ]
  for (const rs of ringSpecs) {
    for (let lon = -180; lon < 180; lon += rs.step) {
      const jitterLat = rs.lat + 0.25 * Math.sin(lon * 0.17)
      iceDots.push(latLonToVec3(jitterLat, lon))
    }
  }

  cachedArcticShelfRing = shelfRing
  cachedMiniIceFloes = miniFloes
  cachedArcticIceDots = iceDots
  return { shelfRing, miniFloes, iceDots }
}

function getAntarcticEasterEggGeometry(): {
  shelfRing: Vec3[]
  miniFloes: Vec3[][]
  iceDots: Vec3[]
} {
  if (cachedAntarcticShelfRing && cachedAntarcticMiniFloes && cachedAntarcticIceDots) {
    return {
      shelfRing: cachedAntarcticShelfRing,
      miniFloes: cachedAntarcticMiniFloes,
      iceDots: cachedAntarcticIceDots,
    }
  }

  // 1. Main Antarctic polar ice shelf perimeter with organic scalloped coastline around -84.6°S ~ -86.2°S
  const shelfRing: Vec3[] = []
  for (let deg = 0; deg < 360; deg += 8) {
    const rad = (deg * Math.PI) / 180
    const latEdge =
      -85.0 -
      0.65 * Math.cos(rad * 3 - 0.5) -
      0.45 * Math.sin(rad * 5 + 0.9) -
      0.25 * Math.cos(rad * 7 - 1.4)
    shelfRing.push(latLonToVec3(latEdge, deg))
  }

  // 2. Three drifting Southern Ocean mini ice floes (유빙) nearby
  const miniCenters = [
    { lat: -82.6, lon: -48, rLat: 1.0, rLon: 9.2 },
    { lat: -83.1, lon: 92, rLat: 0.95, rLon: 8.8 },
    { lat: -82.4, lon: -162, rLat: 0.88, rLon: 8.0 },
  ]
  const miniFloes: Vec3[][] = miniCenters.map((mc) => {
    const pts: Vec3[] = []
    for (let a = 0; a < 360; a += 30) {
      const ar = (a * Math.PI) / 180
      const wobble = 1 + 0.16 * Math.cos(ar * 3 - mc.lon)
      const pLat = mc.lat + Math.cos(ar) * mc.rLat * wobble
      const pLon = mc.lon + Math.sin(ar) * mc.rLon * wobble
      pts.push(latLonToVec3(pLat, pLon))
    }
    return pts
  })

  // 3. Surrounding dot-matrix sea-ice crystals blending into the globe's dot aesthetic
  const iceDots: Vec3[] = []
  const ringSpecs = [
    { lat: -83.2, step: 18 },
    { lat: -84.5, step: 22 },
    { lat: -85.9, step: 30 },
    { lat: -87.4, step: 45 },
  ]
  for (const rs of ringSpecs) {
    for (let lon = -180; lon < 180; lon += rs.step) {
      const jitterLat = rs.lat - 0.25 * Math.cos(lon * 0.17)
      iceDots.push(latLonToVec3(jitterLat, lon))
    }
  }

  cachedAntarcticShelfRing = shelfRing
  cachedAntarcticMiniFloes = miniFloes
  cachedAntarcticIceDots = iceDots
  return { shelfRing, miniFloes, iceDots }
}

function gridColRowToLatLon(col: number, row: number): { lat: number; lon: number } {
  const lon = ((col - 25.2) / PIXEL_MAP_COLS) * 360
  const lat = Math.max(-62, Math.min(74, (15.2 - row) * 4.35))
  return { lat, lon }
}

function getGlobeGeometry(): { landDots: LandDot[]; graticuleLines: Vec3[][] } {
  if (cachedLandDots && cachedGraticuleLines) {
    return { landDots: cachedLandDots, graticuleLines: cachedGraticuleLines }
  }

  // 1. Convert GLOBE_TERRAIN_DOTS (Natural Earth 50m coastline-sculpted 3x3 sub-grid) into spherical unit vectors
  const landDots: LandDot[] = []

  for (const dot of GLOBE_TERRAIN_DOTS) {
    const { lat, lon } = gridColRowToLatLon(dot.c, dot.r)
    const v = latLonToVec3(lat, lon)
    landDots.push({ ...v, countryId: dot.id, isEdge: dot.e === 1 })
  }

  // 2. Precompute subtle latitude & longitude graticule curves
  const graticuleLines: Vec3[][] = []
  const latitudes = [-45, -23.5, 0, 23.5, 45, 66.5]
  for (const lat of latitudes) {
    const ring: Vec3[] = []
    for (let lon = -180; lon <= 180; lon += 6) {
      ring.push(latLonToVec3(lat, lon))
    }
    graticuleLines.push(ring)
  }

  for (let lon = -180; lon < 180; lon += 30) {
    const meridian: Vec3[] = []
    for (let lat = -60; lat <= 75; lat += 5) {
      meridian.push(latLonToVec3(lat, lon))
    }
    graticuleLines.push(meridian)
  }

  cachedLandDots = landDots
  cachedGraticuleLines = graticuleLines
  return { landDots, graticuleLines }
}

function rotatePoint(p: Vec3, rotLonRad: number, rotLatRad: number): Vec3 {
  // 1. Rotate around Y-axis by rotLonRad
  const cosLon = Math.cos(rotLonRad)
  const sinLon = Math.sin(rotLonRad)
  const x1 = p.x * cosLon + p.z * sinLon
  const z1 = -p.x * sinLon + p.z * cosLon
  const y1 = p.y

  // 2. Rotate around X-axis by rotLatRad (tilt)
  const cosLat = Math.cos(rotLatRad)
  const sinLat = Math.sin(rotLatRad)
  const y2 = y1 * cosLat - z1 * sinLat
  const z2 = y1 * sinLat + z1 * cosLat

  return { x: x1, y: y2, z: z2 }
}

interface MeshQuad3D {
  v: [Vec3, Vec3, Vec3, Vec3]
  normal: Vec3
  rgb: [number, number, number]
  stroke?: string
  unlit?: boolean
  alpha?: number
}

function vAdd(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

function vScale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s }
}

function vDot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function vCross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

function vNorm(a: Vec3): Vec3 {
  const len = Math.hypot(a.x, a.y, a.z) || 1
  return { x: a.x / len, y: a.y / len, z: a.z / len }
}

function addLocalBoxQuads(
  quads: MeshQuad3D[],
  toWorld: (f: number, r: number, u: number) => Vec3,
  toWorldDir: (df: number, dr: number, du: number) => Vec3,
  f0: number,
  f1: number,
  r0: number,
  r1: number,
  u0: number,
  u1: number,
  rgb: [number, number, number],
  stroke?: string,
  topTaper = 1.0,
  frontTaper = 1.0
): void {
  const rMid = (r0 + r1) * 0.5
  const rHalf = (r1 - r0) * 0.5
  const uMid = (u0 + u1) * 0.5
  const uHalf = (u1 - u0) * 0.5

  const getPt = (f: number, rSign: number, uSign: number): Vec3 => {
    const isTop = uSign > 0
    const isFront = f > (f0 + f1) * 0.5
    const tScale = (isTop ? topTaper : 1.0) * (isFront ? frontTaper : 1.0)
    const r = rMid + rSign * rHalf * tScale
    const u = isFront && frontTaper < 1.0 ? uMid + uSign * uHalf * frontTaper : uSign > 0 ? u1 : u0
    return toWorld(f, r, u)
  }

  const p000 = getPt(f0, -1, -1)
  const p010 = getPt(f0, 1, -1)
  const p011 = getPt(f0, 1, 1)
  const p001 = getPt(f0, -1, 1)

  const p100 = getPt(f1, -1, -1)
  const p110 = getPt(f1, 1, -1)
  const p111 = getPt(f1, 1, 1)
  const p101 = getPt(f1, -1, 1)

  // Top (+U)
  quads.push({
    v: [p001, p011, p111, p101],
    normal: toWorldDir(0, 0, 1),
    rgb,
    stroke,
  })
  // Bottom (-U)
  quads.push({
    v: [p000, p100, p110, p010],
    normal: toWorldDir(0, 0, -1),
    rgb,
    stroke,
  })
  // Front (+F)
  quads.push({
    v: [p100, p110, p111, p101],
    normal: toWorldDir(1, 0, 0),
    rgb,
    stroke,
  })
  // Back (-F)
  quads.push({
    v: [p010, p000, p001, p011],
    normal: toWorldDir(-1, 0, 0),
    rgb,
    stroke,
  })
  // Right (+R)
  quads.push({
    v: [p010, p110, p111, p011],
    normal: toWorldDir(0, 1, 0),
    rgb,
    stroke,
  })
  // Left (-R)
  quads.push({
    v: [p100, p000, p001, p101],
    normal: toWorldDir(0, -1, 0),
    rgb,
    stroke,
  })
}

function drawArcticEasterEgg(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotLonRad: number,
  rotLatRad: number,
  pulsePhase: number
): void {
  // Check North Pole visibility first
  const northPoleRp = rotatePoint({ x: 0, y: -1, z: 0 }, rotLonRad, rotLatRad)
  if (northPoleRp.z < -0.12) return

  const { shelfRing, miniFloes, iceDots } = getArcticEasterEggGeometry()
  const polarVisibility = Math.min(1, Math.max(0, (northPoleRp.z + 0.08) / 0.35))
  if (polarVisibility <= 0.01) return

  ctx.save()

  // 1. Surrounding Sparkling Sea-Ice Dots (blends polar cap with dot-matrix globe)
  const iceDotR = Math.max(1.2, radius * 0.0068)
  ctx.fillStyle = `rgba(186, 230, 253, ${(0.52 * polarVisibility).toFixed(3)})`
  ctx.beginPath()
  for (let i = 0; i < iceDots.length; i++) {
    const rp = rotatePoint(iceDots[i], rotLonRad, rotLatRad)
    if (rp.z <= 0.04) continue
    const sx = cx + rp.x * radius * 1.003
    const sy = cy + rp.y * radius * 1.003
    ctx.moveTo(sx + iceDotR, sy)
    ctx.arc(sx, sy, iceDotR, 0, Math.PI * 2)
  }
  ctx.fill()

  // 2. Drifting Mini Satellite Ice Floes (유빙)
  for (const floe of miniFloes) {
    const projectedBase: Array<{ x: number; y: number; z: number }> = []
    const projectedTop: Array<{ x: number; y: number; z: number }> = []
    let visibleCount = 0
    for (let i = 0; i < floe.length; i++) {
      const rp = rotatePoint(floe[i], rotLonRad, rotLatRad)
      if (rp.z > 0.04) visibleCount++
      projectedBase.push({
        x: cx + rp.x * radius * 1.002,
        y: cy + rp.y * radius * 1.002,
        z: rp.z,
      })
      projectedTop.push({
        x: cx + rp.x * radius * 1.008,
        y: cy + rp.y * radius * 1.008,
        z: rp.z,
      })
    }
    if (visibleCount < floe.length * 0.6) continue

    // Cyan 3D ice wall base
    ctx.beginPath()
    for (let i = 0; i < projectedBase.length; i++) {
      if (i === 0) ctx.moveTo(projectedBase[i].x, projectedBase[i].y)
      else ctx.lineTo(projectedBase[i].x, projectedBase[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = `rgba(56, 189, 248, ${(0.42 * polarVisibility).toFixed(3)})`
    ctx.fill()

    // Crisp white snow cap top
    ctx.beginPath()
    for (let i = 0; i < projectedTop.length; i++) {
      if (i === 0) ctx.moveTo(projectedTop[i].x, projectedTop[i].y)
      else ctx.lineTo(projectedTop[i].x, projectedTop[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = `rgba(240, 249, 255, ${(0.86 * polarVisibility).toFixed(3)})`
    ctx.fill()
  }

  // 3. Main 3D Polar Ice Floe Shelf (북극 빙하)
  const shelfBasePts: Array<{ x: number; y: number }> = []
  const shelfTopPts: Array<{ x: number; y: number }> = []
  let shelfVisible = 0
  for (let i = 0; i < shelfRing.length; i++) {
    const rp = rotatePoint(shelfRing[i], rotLonRad, rotLatRad)
    const clampedZ = Math.max(0.01, rp.z)
    if (rp.z > 0.02) shelfVisible++
    shelfBasePts.push({
      x: cx + rp.x * radius * 1.002,
      y: cy + rp.y * radius * 1.002 + (1 - clampedZ) * 1.5,
    })
    shelfTopPts.push({
      x: cx + rp.x * radius * 1.012,
      y: cy + rp.y * radius * 1.012,
    })
  }

  if (shelfVisible < shelfRing.length * 0.45) {
    ctx.restore()
    return
  }

  // 3a. Submerged / Side Glacial Cliff Rim
  ctx.beginPath()
  for (let i = 0; i < shelfBasePts.length; i++) {
    if (i === 0) ctx.moveTo(shelfBasePts[i].x, shelfBasePts[i].y)
    else ctx.lineTo(shelfBasePts[i].x, shelfBasePts[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = `rgba(14, 165, 233, ${(0.46 * polarVisibility).toFixed(3)})`
  ctx.fill()
  ctx.strokeStyle = `rgba(56, 189, 248, ${(0.72 * polarVisibility).toFixed(3)})`
  ctx.lineWidth = 1.4
  ctx.stroke()

  // 3b. Snow-White Polar Ice Floe Top Surface
  const poleScreenX = cx + northPoleRp.x * radius * 1.012
  const poleScreenY = cy + northPoleRp.y * radius * 1.012
  const floeGradRadius = Math.max(16, radius * 0.11)
  const floeGrad = ctx.createRadialGradient(
    poleScreenX - floeGradRadius * 0.2,
    poleScreenY - floeGradRadius * 0.2,
    floeGradRadius * 0.08,
    poleScreenX,
    poleScreenY,
    floeGradRadius
  )
  floeGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.96 * polarVisibility).toFixed(3)})`)
  floeGrad.addColorStop(0.7, `rgba(224, 242, 254, ${(0.92 * polarVisibility).toFixed(3)})`)
  floeGrad.addColorStop(1, `rgba(186, 230, 253, ${(0.88 * polarVisibility).toFixed(3)})`)

  ctx.beginPath()
  for (let i = 0; i < shelfTopPts.length; i++) {
    if (i === 0) ctx.moveTo(shelfTopPts[i].x, shelfTopPts[i].y)
    else ctx.lineTo(shelfTopPts[i].x, shelfTopPts[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = floeGrad
  ctx.fill()
  ctx.strokeStyle = `rgba(255, 255, 255, ${(0.85 * polarVisibility).toFixed(3)})`
  ctx.lineWidth = 1.1
  ctx.stroke()

  // 4. Fox Orbit Path & Fading 3D Pawprints on the Snow
  const surfaceElev = 1.0125
  const rawCycle = pulsePhase * 0.55
  const cycleMod = rawCycle % (Math.PI * 2)
  const isHopping = cycleMod > 5.1 && cycleMod < 5.95
  const hopProgress = isHopping ? (cycleMod - 5.1) / 0.85 : 0

  const foxLonDeg = ((pulsePhase * 26) % 360) - 180
  const foxLatDeg = 86.15 + 0.3 * Math.sin((foxLonDeg * Math.PI) / 90)

  const pawStepDeg = 11
  for (let p = 1; p <= 6; p++) {
    const trailLon = foxLonDeg - p * pawStepDeg
    const trailLat = 86.15 + 0.3 * Math.sin((trailLon * Math.PI) / 90)
    const pawVec = latLonToVec3(trailLat, trailLon)
    const pawRp = rotatePoint(pawVec, rotLonRad, rotLatRad)
    if (pawRp.z <= 0.08) continue
    const px = cx + pawRp.x * radius * surfaceElev
    const py = cy + pawRp.y * radius * surfaceElev
    const pawAlpha = (1 - p / 7) * 0.42 * polarVisibility
    ctx.fillStyle = `rgba(100, 116, 139, ${pawAlpha.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(px - 1.2, py - 0.6, Math.max(0.8, radius * 0.003), 0, Math.PI * 2)
    ctx.arc(px + 1.2, py + 0.6, Math.max(0.8, radius * 0.003), 0, Math.PI * 2)
    ctx.fill()
  }

  // 5. Build True 3D Volumetric Mesh Quads for the Igloo & Articulated 3D Arctic Fox
  const quads: MeshQuad3D[] = []

  // --- 5A. 3D Faceted Ice-Block Igloo (positioned slightly further back on the polar floe, with compact entrance) ---
  const iglooCenterUnit = latLonToVec3(89.1, -160)
  const iglooOrigin = vScale(iglooCenterUnit, surfaceElev)
  const iglooN = vNorm(iglooCenterUnit)
  const iglooAimVec = latLonToVec3(80, 20)
  const iglooRawF = {
    x: iglooAimVec.x - iglooCenterUnit.x,
    y: iglooAimVec.y - iglooCenterUnit.y,
    z: iglooAimVec.z - iglooCenterUnit.z,
  }
  const iglooF = vNorm(
    vAdd(iglooRawF, vScale(iglooN, -vDot(iglooRawF, iglooN)))
  )
  const iglooR = vNorm(vCross(iglooF, iglooN))
  const iglooScale = 0.043
  const iglooBackOffset = -0.36

  const iglooToWorld = (f: number, r: number, u: number): Vec3 =>
    vAdd(
      iglooOrigin,
      vScale(
        vAdd(
          vAdd(vScale(iglooF, f + iglooBackOffset), vScale(iglooR, r)),
          vScale(iglooN, u)
        ),
        iglooScale
      )
    )

  const iglooToWorldDir = (df: number, dr: number, du: number): Vec3 =>
    vNorm(vAdd(vAdd(vScale(iglooF, df), vScale(iglooR, dr)), vScale(iglooN, du)))

  // Warm golden hearth light patch on the snow right outside the shortened 3D tunnel entrance
  const glowPulse = 0.85 + 0.15 * Math.sin(pulsePhase * 2.4)
  const hearthSnowCenter = rotatePoint(iglooToWorld(1.22, 0, 0.02), rotLonRad, rotLatRad)
  if (hearthSnowCenter.z > 0.06) {
    const hsx = cx + hearthSnowCenter.x * radius
    const hsy = cy + hearthSnowCenter.y * radius
    const hsr = Math.max(6, radius * 0.034)
    const hearthGrad = ctx.createRadialGradient(hsx, hsy, 0.5, hsx, hsy, hsr)
    hearthGrad.addColorStop(0, `rgba(251, 191, 36, ${(0.55 * glowPulse * polarVisibility).toFixed(3)})`)
    hearthGrad.addColorStop(0.55, `rgba(245, 158, 11, ${(0.22 * glowPulse * polarVisibility).toFixed(3)})`)
    hearthGrad.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = hearthGrad
    ctx.beginPath()
    ctx.arc(hsx, hsy, hsr, 0, Math.PI * 2)
    ctx.fill()
  }

  // 3D Igloo Dome Courses (4 latitude bands x 12 azimuth ice blocks)
  const domeRings = 4
  const domeSegs = 12
  const domeRadius = 1.0
  const domeHeight = 0.92
  for (let ring = 0; ring < domeRings; ring++) {
    const phi0 = (ring / domeRings) * (Math.PI * 0.5)
    const phi1 = ((ring + 1) / domeRings) * (Math.PI * 0.5)
    const cosP0 = Math.cos(phi0)
    const sinP0 = Math.sin(phi0)
    const cosP1 = Math.cos(phi1)
    const sinP1 = Math.sin(phi1)
    // Stagger alternate courses slightly for authentic ice-brick look
    const twist = (ring % 2) * (Math.PI / domeSegs) * 0.35

    for (let seg = 0; seg < domeSegs; seg++) {
      const th0 = (seg / domeSegs) * Math.PI * 2 + twist
      const th1 = ((seg + 1) / domeSegs) * Math.PI * 2 + twist
      const thMid = (th0 + th1) * 0.5
      const phiMid = (phi0 + phi1) * 0.5

      const v00 = iglooToWorld(
        cosP0 * Math.cos(th0) * domeRadius,
        cosP0 * Math.sin(th0) * domeRadius,
        sinP0 * domeHeight
      )
      const v10 = iglooToWorld(
        cosP0 * Math.cos(th1) * domeRadius,
        cosP0 * Math.sin(th1) * domeRadius,
        sinP0 * domeHeight
      )
      const v11 = iglooToWorld(
        cosP1 * Math.cos(th1) * domeRadius,
        cosP1 * Math.sin(th1) * domeRadius,
        sinP1 * domeHeight
      )
      const v01 = iglooToWorld(
        cosP1 * Math.cos(th0) * domeRadius,
        cosP1 * Math.sin(th0) * domeRadius,
        sinP1 * domeHeight
      )

      const nDir = iglooToWorldDir(
        Math.cos(phiMid) * Math.cos(thMid),
        Math.cos(phiMid) * Math.sin(thMid),
        Math.sin(phiMid)
      )

      quads.push({
        v: [v00, v10, v11, v01],
        normal: nDir,
        rgb: [238, 248, 255],
        stroke: `rgba(56, 189, 248, ${(0.46 * polarVisibility).toFixed(3)})`,
      })
    }
  }

  // Compact 3D Protruding Arched Entrance Tunnel along +F
  const tunSteps = 1
  const tunArchSegs = 6
  const tunW = 0.42
  const tunH = 0.48
  const tunStartF = 0.74
  const tunEndF = 1.14
  for (let ts = 0; ts < tunSteps; ts++) {
    const f0 = tunStartF + (ts / tunSteps) * (tunEndF - tunStartF)
    const f1 = tunStartF + ((ts + 1) / tunSteps) * (tunEndF - tunStartF)
    for (let a = 0; a < tunArchSegs; a++) {
      const a0 = -Math.PI * 0.5 + (a / tunArchSegs) * Math.PI
      const a1 = -Math.PI * 0.5 + ((a + 1) / tunArchSegs) * Math.PI
      const aMid = (a0 + a1) * 0.5

      const r0 = Math.sin(a0) * tunW
      const u0 = Math.cos(a0) * tunH
      const r1 = Math.sin(a1) * tunW
      const u1 = Math.cos(a1) * tunH

      quads.push({
        v: [
          iglooToWorld(f0, r0, u0),
          iglooToWorld(f1, r0, u0),
          iglooToWorld(f1, r1, u1),
          iglooToWorld(f0, r1, u1),
        ],
        normal: iglooToWorldDir(0.1, Math.sin(aMid), Math.cos(aMid)),
        rgb: [232, 245, 255],
        stroke: `rgba(56, 189, 248, ${(0.55 * polarVisibility).toFixed(3)})`,
      })
    }
  }

  // Warm Glowing 3D Entrance Portal Cap at the front of the tunnel (f = tunEndF)
  quads.push({
    v: [
      iglooToWorld(tunEndF, -tunW * 0.82, 0.02),
      iglooToWorld(tunEndF, tunW * 0.82, 0.02),
      iglooToWorld(tunEndF, tunW * 0.62, tunH * 0.82),
      iglooToWorld(tunEndF, -tunW * 0.62, tunH * 0.82),
    ],
    normal: iglooToWorldDir(1, 0, 0),
    rgb: [251, 191, 36],
    stroke: `rgba(254, 240, 138, ${(0.85 * polarVisibility).toFixed(3)})`,
    unlit: true,
  })

  // --- 5B. 3D Articulated Voxel/Low-Poly Arctic Fox ---
  const foxCenterUnit = latLonToVec3(foxLatDeg, foxLonDeg)
  const foxNextUnit = latLonToVec3(
    86.15 + 0.3 * Math.sin(((foxLonDeg + 3.5) * Math.PI) / 90),
    foxLonDeg + 3.5
  )
  const foxOrigin = vScale(foxCenterUnit, surfaceElev)
  const foxN = vNorm(foxCenterUnit)
  const foxRawF = {
    x: foxNextUnit.x - foxCenterUnit.x,
    y: foxNextUnit.y - foxCenterUnit.y,
    z: foxNextUnit.z - foxCenterUnit.z,
  }
  const foxF = vNorm(vAdd(foxRawF, vScale(foxN, -vDot(foxRawF, foxN))))
  const foxR = vNorm(vCross(foxF, foxN))
  const foxScale = 0.0235

  const trotPhase = pulsePhase * 8.2
  const trotBob = isHopping ? 0 : Math.abs(Math.sin(trotPhase)) * 0.16
  const hopLift = isHopping ? Math.sin(hopProgress * Math.PI) * 0.55 : 0
  const liftU = trotBob + hopLift
  const pitchAngle = isHopping
    ? -Math.cos(hopProgress * Math.PI) * 0.22
    : Math.sin(trotPhase) * 0.06
  const cosPitch = Math.cos(pitchAngle)
  const sinPitch = Math.sin(pitchAngle)

  // Ground shadow directly beneath the 3D fox on the snow
  const foxShadowRp = rotatePoint(foxOrigin, rotLonRad, rotLatRad)
  if (foxShadowRp.z > 0.06) {
    const fsx = cx + foxShadowRp.x * radius
    const fsy = cy + foxShadowRp.y * radius
    const shadowScale = isHopping ? 1 - Math.sin(hopProgress * Math.PI) * 0.35 : 1
    ctx.fillStyle = `rgba(14, 116, 144, ${(0.28 * polarVisibility).toFixed(3)})`
    ctx.beginPath()
    ctx.ellipse(
      fsx,
      fsy + 1.5,
      Math.max(3.5, radius * 0.021 * shadowScale),
      Math.max(1.8, radius * 0.011 * shadowScale),
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }

  const foxToWorld = (f: number, r: number, u: number): Vec3 => {
    const pf = f * cosPitch - (u - 0.5) * sinPitch
    const pu = f * sinPitch + (u - 0.5) * cosPitch + 0.5 + liftU
    return vAdd(
      foxOrigin,
      vScale(
        vAdd(vAdd(vScale(foxF, pf), vScale(foxR, r)), vScale(foxN, pu)),
        foxScale
      )
    )
  }

  const foxToWorldDir = (df: number, dr: number, du: number): Vec3 => {
    const pf = df * cosPitch - du * sinPitch
    const pu = df * sinPitch + du * cosPitch
    return vNorm(vAdd(vAdd(vScale(foxF, pf), vScale(foxR, dr)), vScale(foxN, pu)))
  }

  const foxStroke = `rgba(148, 163, 184, ${(0.45 * polarVisibility).toFixed(3)})`
  const legSwing = isHopping ? 0.32 : Math.sin(trotPhase) * 0.28

  // 1) 4 Articulated 3D Legs (Front-Left, Front-Right, Back-Left, Back-Right) with dark slate paws
  const addFoxLeg = (hipF: number, hipR: number, swingF: number) => {
    // Upper White Leg
    addLocalBoxQuads(
      quads,
      foxToWorld,
      foxToWorldDir,
      hipF + swingF * 0.5 - 0.13,
      hipF + swingF * 0.5 + 0.13,
      hipR - 0.12,
      hipR + 0.12,
      0.14,
      0.46,
      [245, 250, 255],
      foxStroke
    )
    // Dark Slate Paw Tip
    addLocalBoxQuads(
      quads,
      foxToWorld,
      foxToWorldDir,
      hipF + swingF - 0.13,
      hipF + swingF + 0.15,
      hipR - 0.12,
      hipR + 0.12,
      0.0,
      0.15,
      [51, 65, 85]
    )
  }

  addFoxLeg(0.42, -0.22, legSwing)
  addFoxLeg(0.42, 0.22, -legSwing)
  addFoxLeg(-0.42, -0.22, -legSwing)
  addFoxLeg(-0.42, 0.22, legSwing)

  // 2) 3D Plump Torso & Fluffy Chest Ruff
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    -0.62,
    0.56,
    -0.36,
    0.36,
    0.38,
    0.92,
    [252, 254, 255],
    foxStroke,
    0.9,
    0.95
  )
  // Chest / Neck ruff
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    0.26,
    0.72,
    -0.4,
    0.4,
    0.42,
    1.02,
    [255, 255, 255],
    foxStroke,
    0.88,
    0.9
  )

  // 3) 3D Head, Tapered Snout & Black Nose Cube
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    0.48,
    1.08,
    -0.38,
    0.38,
    0.82,
    1.38,
    [255, 255, 255],
    foxStroke,
    0.88,
    0.92
  )
  // Tapered 3D Muzzle / Snout
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    1.06,
    1.46,
    -0.2,
    0.2,
    0.84,
    1.1,
    [248, 252, 255],
    foxStroke,
    0.82,
    0.7
  )
  // Black 3D Button Nose at tip of snout
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    1.42,
    1.54,
    -0.09,
    0.09,
    0.96,
    1.11,
    [15, 23, 42]
  )
  // Left & Right 3D Dark Eyes on front-side of head
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    1.04,
    1.12,
    -0.32,
    -0.18,
    1.08,
    1.21,
    [15, 23, 42]
  )
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    1.04,
    1.12,
    0.18,
    0.32,
    1.08,
    1.21,
    [15, 23, 42]
  )

  // 4) 2 Pointed 3D Ears (Left & Right) with soft pink inner ear panels
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    0.62,
    0.88,
    -0.38,
    -0.12,
    1.35,
    1.76,
    [248, 252, 255],
    foxStroke,
    0.32,
    1.0
  )
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    0.62,
    0.88,
    0.12,
    0.38,
    1.35,
    1.76,
    [248, 252, 255],
    foxStroke,
    0.32,
    1.0
  )
  // Pink inner ear front quads
  quads.push({
    v: [
      foxToWorld(0.89, -0.33, 1.38),
      foxToWorld(0.89, -0.17, 1.38),
      foxToWorld(0.89, -0.22, 1.66),
      foxToWorld(0.89, -0.28, 1.66),
    ],
    normal: foxToWorldDir(1, 0, 0.1),
    rgb: [253, 164, 175],
  })
  quads.push({
    v: [
      foxToWorld(0.89, 0.17, 1.38),
      foxToWorld(0.89, 0.33, 1.38),
      foxToWorld(0.89, 0.28, 1.66),
      foxToWorld(0.89, 0.22, 1.66),
    ],
    normal: foxToWorldDir(1, 0, 0.1),
    rgb: [253, 164, 175],
  })

  // 5) 2-Segment Bushy 3D Wagging Tail
  const tailWagR1 = Math.sin(pulsePhase * 6.5) * 0.18
  const tailWagR2 = Math.sin(pulsePhase * 6.5 - 0.6) * 0.34
  // Mid Bushy Tail Segment
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    -1.15,
    -0.56,
    -0.28 + tailWagR1,
    0.28 + tailWagR1,
    0.52,
    0.98,
    [248, 252, 255],
    foxStroke,
    0.92,
    0.92
  )
  // Snow-White Fluffy Tail Tip Segment (curving slightly up)
  addLocalBoxQuads(
    quads,
    foxToWorld,
    foxToWorldDir,
    -1.56,
    -1.08,
    -0.22 + tailWagR2,
    0.22 + tailWagR2,
    0.66,
    1.1,
    [255, 255, 255],
    foxStroke,
    0.65,
    0.85
  )

  // 6. Project, Cull, Light & Depth-Sort All 3D Quads (Painter's Algorithm)
  const lightDir = vNorm({ x: -0.42, y: -0.64, z: 0.64 })
  const projectedQuads: Array<{
    pts: Array<{ x: number; y: number }>
    zAvg: number
    fill: string
    stroke?: string
  }> = []

  for (let i = 0; i < quads.length; i++) {
    const q = quads[i]
    const rv0 = rotatePoint(q.v[0], rotLonRad, rotLatRad)
    const rv1 = rotatePoint(q.v[1], rotLonRad, rotLatRad)
    const rv2 = rotatePoint(q.v[2], rotLonRad, rotLatRad)
    const rv3 = rotatePoint(q.v[3], rotLonRad, rotLatRad)

    const zAvg = (rv0.z + rv1.z + rv2.z + rv3.z) * 0.25
    if (zAvg <= 0.05) continue

    const rn = rotatePoint(q.normal, rotLonRad, rotLatRad)
    // Backface cull faces pointing away from camera
    if (rn.z < -0.18) continue

    let r = q.rgb[0]
    let g = q.rgb[1]
    let b = q.rgb[2]

    if (!q.unlit) {
      const ndotl = Math.max(0, rn.x * lightDir.x + rn.y * lightDir.y + rn.z * lightDir.z)
      // Blend between cool glacial shadow tint and bright sunlit snow highlight
      const shade = 0.62 + 0.42 * ndotl
      r = Math.min(255, Math.round(r * shade - (1 - ndotl) * 28))
      g = Math.min(255, Math.round(g * shade - (1 - ndotl) * 10))
      b = Math.min(255, Math.round(b * Math.min(1.04, shade + 0.08)))
    }

    const alpha = (q.alpha ?? 1) * polarVisibility
    projectedQuads.push({
      pts: [
        { x: cx + rv0.x * radius, y: cy + rv0.y * radius },
        { x: cx + rv1.x * radius, y: cy + rv1.y * radius },
        { x: cx + rv2.x * radius, y: cy + rv2.y * radius },
        { x: cx + rv3.x * radius, y: cy + rv3.y * radius },
      ],
      zAvg,
      fill: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
      stroke: q.stroke,
    })
  }

  projectedQuads.sort((a, b) => a.zAvg - b.zAvg)

  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(0.65, radius * 0.0028)
  for (let i = 0; i < projectedQuads.length; i++) {
    const pq = projectedQuads[i]
    ctx.beginPath()
    ctx.moveTo(pq.pts[0].x, pq.pts[0].y)
    ctx.lineTo(pq.pts[1].x, pq.pts[1].y)
    ctx.lineTo(pq.pts[2].x, pq.pts[2].y)
    ctx.lineTo(pq.pts[3].x, pq.pts[3].y)
    ctx.closePath()
    ctx.fillStyle = pq.fill
    ctx.fill()
    if (pq.stroke) {
      ctx.strokeStyle = pq.stroke
      ctx.stroke()
    }
  }

  ctx.restore()
}

function drawAntarcticEasterEgg(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotLonRad: number,
  rotLatRad: number,
  pulsePhase: number
): void {
  // Check South Pole visibility first (South Pole unit vector is { x: 0, y: 1, z: 0 })
  const southPoleRp = rotatePoint({ x: 0, y: 1, z: 0 }, rotLonRad, rotLatRad)
  if (southPoleRp.z < -0.12) return

  const { shelfRing, miniFloes, iceDots } = getAntarcticEasterEggGeometry()
  const polarVisibility = Math.min(1, Math.max(0, (southPoleRp.z + 0.08) / 0.35))
  if (polarVisibility <= 0.01) return

  ctx.save()

  // 1. Surrounding Sparkling Sea-Ice Dots
  const iceDotR = Math.max(1.2, radius * 0.0068)
  ctx.fillStyle = `rgba(186, 230, 253, ${(0.52 * polarVisibility).toFixed(3)})`
  ctx.beginPath()
  for (let i = 0; i < iceDots.length; i++) {
    const rp = rotatePoint(iceDots[i], rotLonRad, rotLatRad)
    if (rp.z <= 0.04) continue
    const sx = cx + rp.x * radius * 1.003
    const sy = cy + rp.y * radius * 1.003
    ctx.moveTo(sx + iceDotR, sy)
    ctx.arc(sx, sy, iceDotR, 0, Math.PI * 2)
  }
  ctx.fill()

  // 2. Drifting Southern Ocean Mini Ice Floes (유빙)
  for (const floe of miniFloes) {
    const projectedBase: Array<{ x: number; y: number; z: number }> = []
    const projectedTop: Array<{ x: number; y: number; z: number }> = []
    let visibleCount = 0
    for (let i = 0; i < floe.length; i++) {
      const rp = rotatePoint(floe[i], rotLonRad, rotLatRad)
      if (rp.z > 0.04) visibleCount++
      projectedBase.push({
        x: cx + rp.x * radius * 1.002,
        y: cy + rp.y * radius * 1.002,
        z: rp.z,
      })
      projectedTop.push({
        x: cx + rp.x * radius * 1.008,
        y: cy + rp.y * radius * 1.008,
        z: rp.z,
      })
    }
    if (visibleCount < floe.length * 0.6) continue

    ctx.beginPath()
    for (let i = 0; i < projectedBase.length; i++) {
      if (i === 0) ctx.moveTo(projectedBase[i].x, projectedBase[i].y)
      else ctx.lineTo(projectedBase[i].x, projectedBase[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = `rgba(56, 189, 248, ${(0.42 * polarVisibility).toFixed(3)})`
    ctx.fill()

    ctx.beginPath()
    for (let i = 0; i < projectedTop.length; i++) {
      if (i === 0) ctx.moveTo(projectedTop[i].x, projectedTop[i].y)
      else ctx.lineTo(projectedTop[i].x, projectedTop[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = `rgba(240, 249, 255, ${(0.86 * polarVisibility).toFixed(3)})`
    ctx.fill()
  }

  // 3. Main 3D Antarctic Polar Ice Shelf (남극 빙하)
  const shelfBasePts: Array<{ x: number; y: number }> = []
  const shelfTopPts: Array<{ x: number; y: number }> = []
  let shelfVisible = 0
  for (let i = 0; i < shelfRing.length; i++) {
    const rp = rotatePoint(shelfRing[i], rotLonRad, rotLatRad)
    const clampedZ = Math.max(0.01, rp.z)
    if (rp.z > 0.02) shelfVisible++
    shelfBasePts.push({
      x: cx + rp.x * radius * 1.002,
      y: cy + rp.y * radius * 1.002 - (1 - clampedZ) * 1.5,
    })
    shelfTopPts.push({
      x: cx + rp.x * radius * 1.012,
      y: cy + rp.y * radius * 1.012,
    })
  }

  if (shelfVisible < shelfRing.length * 0.45) {
    ctx.restore()
    return
  }

  // 3a. Submerged Glacial Cliff Rim
  ctx.beginPath()
  for (let i = 0; i < shelfBasePts.length; i++) {
    if (i === 0) ctx.moveTo(shelfBasePts[i].x, shelfBasePts[i].y)
    else ctx.lineTo(shelfBasePts[i].x, shelfBasePts[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = `rgba(14, 165, 233, ${(0.46 * polarVisibility).toFixed(3)})`
  ctx.fill()
  ctx.strokeStyle = `rgba(56, 189, 248, ${(0.72 * polarVisibility).toFixed(3)})`
  ctx.lineWidth = 1.4
  ctx.stroke()

  // 3b. Snow-White Polar Ice Shelf Top Surface
  const poleScreenX = cx + southPoleRp.x * radius * 1.012
  const poleScreenY = cy + southPoleRp.y * radius * 1.012
  const floeGradRadius = Math.max(16, radius * 0.11)
  const floeGrad = ctx.createRadialGradient(
    poleScreenX - floeGradRadius * 0.2,
    poleScreenY - floeGradRadius * 0.2,
    floeGradRadius * 0.08,
    poleScreenX,
    poleScreenY,
    floeGradRadius
  )
  floeGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.96 * polarVisibility).toFixed(3)})`)
  floeGrad.addColorStop(0.7, `rgba(224, 242, 254, ${(0.92 * polarVisibility).toFixed(3)})`)
  floeGrad.addColorStop(1, `rgba(186, 230, 253, ${(0.88 * polarVisibility).toFixed(3)})`)

  ctx.beginPath()
  for (let i = 0; i < shelfTopPts.length; i++) {
    if (i === 0) ctx.moveTo(shelfTopPts[i].x, shelfTopPts[i].y)
    else ctx.lineTo(shelfTopPts[i].x, shelfTopPts[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = floeGrad
  ctx.fill()
  ctx.strokeStyle = `rgba(255, 255, 255, ${(0.85 * polarVisibility).toFixed(3)})`
  ctx.lineWidth = 1.1
  ctx.stroke()

  const surfaceElev = 1.0125
  const quads: MeshQuad3D[] = []

  // 4. 3D South Pole Red Flag at the center of the Antarctic Ice Shelf (-89.85°S)
  const flagUnit = latLonToVec3(-89.85, 0)
  const flagOrigin = vScale(flagUnit, surfaceElev)
  const flagN = vNorm(flagUnit)
  const flagAim = latLonToVec3(-80, 90)
  const flagRawF = {
    x: flagAim.x - flagUnit.x,
    y: flagAim.y - flagUnit.y,
    z: flagAim.z - flagUnit.z,
  }
  const flagF = vNorm(vAdd(flagRawF, vScale(flagN, -vDot(flagRawF, flagN))))
  const flagR = vNorm(vCross(flagF, flagN))
  const flagScale = 0.032

  const flagToWorld = (f: number, r: number, u: number): Vec3 =>
    vAdd(
      flagOrigin,
      vScale(
        vAdd(vAdd(vScale(flagF, f), vScale(flagR, r)), vScale(flagN, u)),
        flagScale
      )
    )
  const flagToWorldDir = (df: number, dr: number, du: number): Vec3 =>
    vNorm(vAdd(vAdd(vScale(flagF, df), vScale(flagR, dr)), vScale(flagN, du)))

  // Soft ground shadow beneath the flagpole base
  const flagShadowRp = rotatePoint(flagOrigin, rotLonRad, rotLatRad)
  if (flagShadowRp.z > 0.06) {
    const fsx = cx + flagShadowRp.x * radius
    const fsy = cy + flagShadowRp.y * radius
    ctx.fillStyle = `rgba(14, 116, 144, ${(0.26 * polarVisibility).toFixed(3)})`
    ctx.beginPath()
    ctx.ellipse(
      fsx,
      fsy + 1.0,
      Math.max(3.5, radius * 0.022),
      Math.max(1.8, radius * 0.012),
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }

  // Snow/ice anchor mound at base of flagpole
  addLocalBoxQuads(
    quads,
    flagToWorld,
    flagToWorldDir,
    -0.28,
    0.28,
    -0.28,
    0.28,
    0.0,
    0.18,
    [224, 242, 254],
    `rgba(56, 189, 248, ${(0.5 * polarVisibility).toFixed(3)})`,
    0.65,
    1.0
  )

  // Slender 3D Vertical Flagpole
  addLocalBoxQuads(
    quads,
    flagToWorld,
    flagToWorldDir,
    -0.055,
    0.055,
    -0.055,
    0.055,
    0.15,
    1.86,
    [241, 245, 249],
    `rgba(100, 116, 139, ${(0.6 * polarVisibility).toFixed(3)})`
  )

  // Golden Finial Ball at the top of the flagpole
  addLocalBoxQuads(
    quads,
    flagToWorld,
    flagToWorldDir,
    -0.1,
    0.1,
    -0.1,
    0.1,
    1.86,
    2.04,
    [251, 191, 36]
  )

  // 3-Segment Fluttering 3D Red Flag waving in the polar wind
  const flagSegs = 3
  const flagStartF = 0.055
  const flagTotalLen = 1.18
  const flagSegLen = flagTotalLen / flagSegs
  const flagRedStroke = `rgba(185, 28, 28, ${(0.65 * polarVisibility).toFixed(3)})`

  for (let s = 0; s < flagSegs; s++) {
    const f0 = flagStartF + s * flagSegLen
    const f1 = flagStartF + (s + 1) * flagSegLen
    const waveR = Math.sin(pulsePhase * 5.2 - s * 1.15) * (0.04 + s * 0.07)
    const verticalFlutter = Math.cos(pulsePhase * 5.2 - s * 1.15) * (s * 0.025)
    // Slight taper toward the fly end of the flag
    const halfH = 0.31 - s * 0.025
    const uMid = 1.48 + verticalFlutter

    addLocalBoxQuads(
      quads,
      flagToWorld,
      flagToWorldDir,
      f0,
      f1,
      waveR - 0.045,
      waveR + 0.045,
      uMid - halfH,
      uMid + halfH,
      s % 2 === 0 ? [239, 68, 68] : [220, 38, 38],
      flagRedStroke
    )
  }

  // 5. Two Strolling 3D Penguins ("뒤뚱뒤뚱" waddling side-by-side / companion trail)
  const baseLonDeg = ((pulsePhase * 17) % 360) - 180
  const penguinSpecs = [
    // Penguin 1: Lead Adult Emperor Penguin
    {
      latDeg: -85.95 + 0.25 * Math.sin((baseLonDeg * Math.PI) / 90),
      lonDeg: baseLonDeg,
      scale: 0.025,
      waddlePhase: pulsePhase * 6.8,
      hasGoldenCollar: true,
    },
    // Penguin 2: Slightly Smaller Companion Penguin strolling alongside & slightly behind
    {
      latDeg: -86.65 + 0.25 * Math.cos(((baseLonDeg - 22) * Math.PI) / 90),
      lonDeg: baseLonDeg - 22,
      scale: 0.021,
      waddlePhase: pulsePhase * 7.6 + 1.9,
      hasGoldenCollar: true,
    },
  ]

  // Fading footprints on the snow behind both penguins
  for (const pSpec of penguinSpecs) {
    for (let step = 1; step <= 5; step++) {
      const trailLon = pSpec.lonDeg - step * 10
      const trailLat = pSpec.latDeg
      const pawVec = latLonToVec3(trailLat, trailLon)
      const pawRp = rotatePoint(pawVec, rotLonRad, rotLatRad)
      if (pawRp.z <= 0.08) continue
      const px = cx + pawRp.x * radius * surfaceElev
      const py = cy + pawRp.y * radius * surfaceElev
      const pawAlpha = (1 - step / 6) * 0.38 * polarVisibility
      ctx.fillStyle = `rgba(100, 116, 139, ${pawAlpha.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px - 1.1, py - 0.5, Math.max(0.8, radius * 0.0028), 0, Math.PI * 2)
      ctx.arc(px + 1.1, py + 0.5, Math.max(0.8, radius * 0.0028), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (const pSpec of penguinSpecs) {
    const pCenterUnit = latLonToVec3(pSpec.latDeg, pSpec.lonDeg)
    const pNextUnit = latLonToVec3(pSpec.latDeg, pSpec.lonDeg + 3.5)
    const pOrigin = vScale(pCenterUnit, surfaceElev)
    const pN = vNorm(pCenterUnit)
    const pRawF = {
      x: pNextUnit.x - pCenterUnit.x,
      y: pNextUnit.y - pCenterUnit.y,
      z: pNextUnit.z - pCenterUnit.z,
    }
    const pF = vNorm(vAdd(pRawF, vScale(pN, -vDot(pRawF, pN))))
    const pR = vNorm(vCross(pF, pN))

    // Soft ground shadow beneath each penguin
    const shadowRp = rotatePoint(pOrigin, rotLonRad, rotLatRad)
    if (shadowRp.z > 0.06) {
      const sx = cx + shadowRp.x * radius
      const sy = cy + shadowRp.y * radius
      ctx.fillStyle = `rgba(14, 116, 144, ${(0.28 * polarVisibility).toFixed(3)})`
      ctx.beginPath()
      ctx.ellipse(
        sx,
        sy + 1.2,
        Math.max(3.0, radius * (pSpec.scale * 0.72)),
        Math.max(1.6, radius * (pSpec.scale * 0.42)),
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // Authentic Penguin Waddle: 3D side-to-side roll around F axis + vertical bounce
    const rollAngle = Math.sin(pSpec.waddlePhase) * 0.17
    const cosRoll = Math.cos(rollAngle)
    const sinRoll = Math.sin(rollAngle)
    const waddleBob = Math.abs(Math.sin(pSpec.waddlePhase)) * 0.09
    const footSwing = Math.sin(pSpec.waddlePhase) * 0.22
    const wingFlare = 0.08 + Math.abs(Math.sin(pSpec.waddlePhase)) * 0.08

    const pToWorld = (f: number, r: number, u: number): Vec3 => {
      const pr = r * cosRoll - (u - 0.15) * sinRoll
      const pu = r * sinRoll + (u - 0.15) * cosRoll + 0.15 + waddleBob
      return vAdd(
        pOrigin,
        vScale(
          vAdd(vAdd(vScale(pF, f), vScale(pR, pr)), vScale(pN, pu)),
          pSpec.scale
        )
      )
    }

    const pToWorldDir = (df: number, dr: number, du: number): Vec3 => {
      const pr = dr * cosRoll - du * sinRoll
      const pu = dr * sinRoll + du * cosRoll
      return vNorm(vAdd(vAdd(vScale(pF, df), vScale(pR, pr)), vScale(pN, pu)))
    }

    const darkSuitStroke = `rgba(51, 65, 85, ${(0.55 * polarVisibility).toFixed(3)})`
    const whiteBellyStroke = `rgba(203, 213, 225, ${(0.5 * polarVisibility).toFixed(3)})`

    // 1) Left & Right Bright Orange 3D Webbed Feet (alternating steps)
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.06 + footSwing,
      0.38 + footSwing,
      -0.31,
      -0.06,
      0.0,
      0.14,
      [249, 115, 22]
    )
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.06 - footSwing,
      0.38 - footSwing,
      0.06,
      0.31,
      0.0,
      0.14,
      [249, 115, 22]
    )

    // 2) Plump 3D Tuxedo Body (Dark Navy-Slate Back & Sides)
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.34,
      0.26,
      -0.38,
      0.38,
      0.14,
      1.06,
      [30, 41, 59],
      darkSuitStroke,
      0.84,
      0.94
    )

    // Short 3D Tail Wedge at the lower back
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.48,
      -0.3,
      -0.16,
      0.16,
      0.14,
      0.3,
      [30, 41, 59],
      darkSuitStroke,
      0.6,
      1.0
    )

    // 3) Crisp Snow-White 3D Belly Panel + Golden-Yellow Emperor Chest Collar
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      0.16,
      0.35,
      -0.27,
      0.27,
      0.16,
      0.88,
      [248, 250, 252],
      whiteBellyStroke,
      0.88,
      0.94
    )
    if (pSpec.hasGoldenCollar) {
      addLocalBoxQuads(
        quads,
        pToWorld,
        pToWorldDir,
        0.15,
        0.34,
        -0.24,
        0.24,
        0.86,
        1.03,
        [253, 224, 71],
        undefined,
        0.88,
        0.92
      )
    }

    // 4) Left & Right 3D Side Flippers / Wings (flaring out slightly for waddle balance)
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.18,
      0.16,
      -0.48 - wingFlare,
      -0.35,
      0.34,
      0.94,
      [30, 41, 59],
      darkSuitStroke,
      0.75,
      0.9
    )
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.18,
      0.16,
      0.35,
      0.48 + wingFlare,
      0.34,
      0.94,
      [30, 41, 59],
      darkSuitStroke,
      0.75,
      0.9
    )

    // 5) 3D Round Head, White/Golden Cheek Patches, Eyes & Pointed Orange Beak
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.25,
      0.3,
      -0.31,
      0.31,
      1.03,
      1.48,
      [15, 23, 42],
      darkSuitStroke,
      0.86,
      0.92
    )
    // Cheek / Auricular patches on left & right sides of head
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      -0.02,
      0.24,
      -0.33,
      0.33,
      1.06,
      1.26,
      [254, 240, 138]
    )
    // Bright Pointed 3D Orange-Amber Beak protruding forward
    addLocalBoxQuads(
      quads,
      pToWorld,
      pToWorldDir,
      0.28,
      0.64,
      -0.11,
      0.11,
      1.15,
      1.31,
      [245, 158, 11],
      undefined,
      0.75,
      0.42
    )
  }

  // 6. Project, Cull, Light & Depth-Sort All 3D Quads (Painter's Algorithm)
  const lightDir = vNorm({ x: -0.42, y: -0.64, z: 0.64 })
  const projectedQuads: Array<{
    pts: Array<{ x: number; y: number }>
    zAvg: number
    fill: string
    stroke?: string
  }> = []

  for (let i = 0; i < quads.length; i++) {
    const q = quads[i]
    const rv0 = rotatePoint(q.v[0], rotLonRad, rotLatRad)
    const rv1 = rotatePoint(q.v[1], rotLonRad, rotLatRad)
    const rv2 = rotatePoint(q.v[2], rotLonRad, rotLatRad)
    const rv3 = rotatePoint(q.v[3], rotLonRad, rotLatRad)

    const zAvg = (rv0.z + rv1.z + rv2.z + rv3.z) * 0.25
    if (zAvg <= 0.05) continue

    const rn = rotatePoint(q.normal, rotLonRad, rotLatRad)
    if (rn.z < -0.18) continue

    let r = q.rgb[0]
    let g = q.rgb[1]
    let b = q.rgb[2]

    if (!q.unlit) {
      const ndotl = Math.max(0, rn.x * lightDir.x + rn.y * lightDir.y + rn.z * lightDir.z)
      const shade = 0.65 + 0.4 * ndotl
      r = Math.min(255, Math.round(r * shade))
      g = Math.min(255, Math.round(g * shade))
      b = Math.min(255, Math.round(b * Math.min(1.05, shade + 0.05)))
    }

    const alpha = (q.alpha ?? 1) * polarVisibility
    projectedQuads.push({
      pts: [
        { x: cx + rv0.x * radius, y: cy + rv0.y * radius },
        { x: cx + rv1.x * radius, y: cy + rv1.y * radius },
        { x: cx + rv2.x * radius, y: cy + rv2.y * radius },
        { x: cx + rv3.x * radius, y: cy + rv3.y * radius },
      ],
      zAvg,
      fill: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
      stroke: q.stroke,
    })
  }

  projectedQuads.sort((a, b) => a.zAvg - b.zAvg)

  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(0.65, radius * 0.0028)
  for (let i = 0; i < projectedQuads.length; i++) {
    const pq = projectedQuads[i]
    ctx.beginPath()
    ctx.moveTo(pq.pts[0].x, pq.pts[0].y)
    ctx.lineTo(pq.pts[1].x, pq.pts[1].y)
    ctx.lineTo(pq.pts[2].x, pq.pts[2].y)
    ctx.lineTo(pq.pts[3].x, pq.pts[3].y)
    ctx.closePath()
    ctx.fillStyle = pq.fill
    ctx.fill()
    if (pq.stroke) {
      ctx.strokeStyle = pq.stroke
      ctx.stroke()
    }
  }

  ctx.restore()
}

function computeGdpElevation(totalGdpUsd: number): {
  terrainElev: number
  layerCount: number
  tierIndex: 0 | 1 | 2 | 3 | 4
} {
  if (!totalGdpUsd || totalGdpUsd <= 0) {
    return { terrainElev: 1.004, layerCount: 1, tierIndex: 0 }
  }

  const gdpTrillions = totalGdpUsd / 1e12
  // Smooth root-power scaling so superpowers ($20T-$30T) and mid-powers ($500B-$4T) form distinct 3D block heights
  const norm = Math.pow(gdpTrillions, 0.38)
  const terrainElev = 1 + Math.min(0.115, Math.max(0.008, norm * 0.032))

  let tierIndex: 0 | 1 | 2 | 3 | 4 = 0
  let layerCount = 1
  if (totalGdpUsd >= 10_000_000_000_000) {
    tierIndex = 4
    layerCount = 7
  } else if (totalGdpUsd >= 2_000_000_000_000) {
    tierIndex = 3
    layerCount = 5
  } else if (totalGdpUsd >= 500_000_000_000) {
    tierIndex = 2
    layerCount = 4
  } else if (totalGdpUsd >= 100_000_000_000) {
    tierIndex = 1
    layerCount = 2
  }

  return { terrainElev, layerCount, tierIndex }
}

function formatCompactFxValue(
  rate: number,
  baseCurrency: BaseCurrency,
  lang: Language
): string {
  if (!rate || isNaN(rate)) return '-'
  const num = rate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (lang === 'ko') {
    switch (baseCurrency) {
      case 'KRW':
        return `${num}원`
      case 'USD':
        return `$${num}`
      case 'JPY':
        return `${num}엔`
      case 'EUR':
        return `€${num}`
      case 'CNY':
        return `¥${num}`
      case 'GBP':
        return `£${num}`
      default:
        return `${num} ${baseCurrency}`
    }
  }
  switch (baseCurrency) {
    case 'USD':
      return `$${num}`
    case 'EUR':
      return `€${num}`
    case 'GBP':
      return `£${num}`
    case 'JPY':
      return `¥${num}`
    case 'KRW':
      return `₩${num}`
    default:
      return `${num} ${baseCurrency}`
  }
}

function getCapsuleSparkline(cap: ProjectedCapsule): {
  points: StockPoint[]
  change30d: number
} {
  if (cap.stock?.points && cap.stock.points.length >= 2) {
    const pts = cap.stock.points
    const first = pts[0].close
    const last = pts[pts.length - 1].close
    const change30d =
      cap.stock.changePct30d ??
      (first > 0 ? Number((((last - first) / first) * 100).toFixed(2)) : cap.stockChangePct)
    return { points: pts, change30d }
  }

  // Deterministic 30-day fallback curve when stock points are unavailable
  const seed = cap.id.charCodeAt(0) * 13 + cap.id.charCodeAt(1) * 7 + cap.id.charCodeAt(2) * 3
  const trendPct = cap.fxChangePct ?? cap.growthRatePct ?? 0.5
  const pts: StockPoint[] = []
  for (let i = 0; i < 20; i++) {
    const t = i / 19
    const wave = Math.sin(t * Math.PI * 2.5 + seed) * 0.4 + Math.cos(t * Math.PI * 4 + seed) * 0.2
    const close = 100 + trendPct * t + wave
    pts.push({ date: `D-${20 - i}`, close: Number(close.toFixed(2)) })
  }
  return { points: pts, change30d: Number(trendPct.toFixed(2)) }
}

export const FinancialGlobeView: React.FC<FinancialGlobeViewProps> = ({
  items,
  baseCurrency,
  exchangeRates,
  interestRates,
  lang,
  onSelectCountry,
  refreshKey,
}) => {
  const [displayMode, setDisplayMode] = useState<GlobeDisplayMode>('gdp')
  const [activePreset, setActivePreset] = useState<RegionPreset>('auto')
  const [isSpinning, setIsSpinning] = useState(true)
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null)
  const [expandedHubId, setExpandedHubId] = useState<string | null>(null)
  const [liveStockTick, setLiveStockTick] = useState(0)
  const [liveFxQuotes, setLiveFxQuotes] = useState<Record<string, LiveFxQuote>>({})
  const [projectedCapsules, setProjectedCapsules] = useState<ProjectedCapsule[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Rotation state in degrees: start facing East Asia / Pacific (~126°E, 16°N)
  const rotationRef = useRef<{ lon: number; lat: number; velLon: number; velLat: number }>({
    lon: -115,
    lat: 16,
    velLon: 0,
    velLat: 0,
  })
  const targetRotationRef = useRef<{ lon: number; lat: number } | null>(null)
  const dragRef = useRef<{
    isDown: boolean
    startX: number
    startY: number
    lastX: number
    lastY: number
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  })
  const isSpinningRef = useRef(isSpinning)
  const hoveredHubIdRef = useRef<string | null>(null)
  const displayModeRef = useRef<GlobeDisplayMode>(displayMode)

  useEffect(() => {
    isSpinningRef.current = isSpinning
  }, [isSpinning])

  // Spacebar shortcut to toggle globe play / pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return

      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable ||
          target.closest('[role="listbox"]')
        ) {
          return
        }
      }

      e.preventDefault()
      targetRotationRef.current = null
      setIsSpinning((prev) => {
        const next = !prev
        if (next) setActivePreset('auto')
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    hoveredHubIdRef.current = hoveredHubId
    if (!hoveredHubId || displayMode !== 'stocks') {
      setExpandedHubId(null)
      return
    }
    const timer = window.setTimeout(() => {
      setExpandedHubId(hoveredHubId)
    }, 260)
    return () => window.clearTimeout(timer)
  }, [hoveredHubId, displayMode])

  useEffect(() => {
    displayModeRef.current = displayMode
  }, [displayMode])

  const usdToBase = exchangeRates ? getConversionRate(exchangeRates, 'USD', baseCurrency) : 1

  // Build per-country GDP elevation & rank lookup (uses items from App or immediate IMF 2026 fallback)
  const gdpLookup = useMemo(() => {
    const map = new Map<string, CountryGdpElevationInfo>()

    if (items && items.length > 0 && items[0].totalGdpUsd > 0) {
      for (const item of items) {
        const elev = computeGdpElevation(item.totalGdpUsd)
        map.set(item.country.id, {
          totalGdpUsd: item.totalGdpUsd,
          gdpPerCapitaUsd: item.gdpPerCapitaUsd,
          growthRatePct: item.growthRatePct,
          rank: item.rank,
          ...elev,
        })
      }
      return map
    }

    const imfFallback = getImfYearMap('2026')
    const sorted = Array.from(imfFallback.entries()).sort(
      (a, b) => b[1].totalGdpUsd - a[1].totalGdpUsd
    )
    sorted.forEach(([id, m], idx) => {
      const elev = computeGdpElevation(m.totalGdpUsd)
      map.set(id, {
        totalGdpUsd: m.totalGdpUsd,
        gdpPerCapitaUsd: m.gdpPerCapitaUsd,
        growthRatePct: m.growthRatePct,
        rank: idx + 1,
        ...elev,
      })
    })
    return map
  }, [items])

  const gdpLookupRef = useRef(gdpLookup)
  useEffect(() => {
    gdpLookupRef.current = gdpLookup
  }, [gdpLookup])

  // Build per-country Stock Change % color bucket lookup for all countries when in 'stocks' mode
  const stockBucketLookup = useMemo(() => {
    const allStocks = getAllStockPrices()
    const map = new Map<string, number>()

    for (const [countryId, stock] of Object.entries(allStocks)) {
      if (!stock || stock.isSupported === false || !(stock.currentPrice > 0)) continue
      let changePct = stock.changePct ?? 0
      if (stock.points && stock.points.length >= 2) {
        const prevClose = stock.points[stock.points.length - 2].close
        if (prevClose > 0) {
          changePct = Number((((stock.currentPrice - prevClose) / prevClose) * 100).toFixed(2))
        }
      }
      map.set(countryId, getStockColorBucket(changePct))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStockTick])

  const stockBucketLookupRef = useRef(stockBucketLookup)
  useEffect(() => {
    stockBucketLookupRef.current = stockBucketLookup
  }, [stockBucketLookup])

  // Build per-country FX Change % color bucket lookup for all countries when in 'fx' mode
  const fxBucketLookup = useMemo(() => {
    const map = new Map<string, number>()

    for (const country of COUNTRIES) {
      const curr = country.currencyCode
      if (!curr) continue
      if (curr === baseCurrency) {
        map.set(country.id, 4) // Flat / Base currency
        continue
      }
      const liveQuote = liveFxQuotes[curr]
      const fxChangePct =
        liveQuote?.changePct ??
        (exchangeRates ? getFxChangePct(exchangeRates, curr, baseCurrency) : null)

      if (fxChangePct != null && !isNaN(fxChangePct)) {
        map.set(country.id, getFxColorBucket(fxChangePct))
      }
    }
    return map
  }, [baseCurrency, exchangeRates, liveFxQuotes])

  const fxBucketLookupRef = useRef(fxBucketLookup)
  useEffect(() => {
    fxBucketLookupRef.current = fxBucketLookup
  }, [fxBucketLookup])

  // Build hubs list calibrated directly to COUNTRY_LABEL_ANCHORS so every pin sits on its landmass dot
  const hubItems = useMemo(() => {
    const countryMap = new Map(COUNTRIES.map((c) => [c.id, c]))
    const list: Array<
      HubDefinition & { lat: number; lon: number; country: CountryMeta; unitVec: Vec3 }
    > = []

    for (const h of FLAGSHIP_HUBS) {
      const c = countryMap.get(h.id)
      const anchor = COUNTRY_LABEL_ANCHORS[h.id]
      if (!c || !anchor) continue
      const { lat, lon } = gridColRowToLatLon(anchor.c, anchor.r)
      list.push({
        ...h,
        lat,
        lon,
        country: c,
        unitVec: latLonToVec3(lat, lon),
      })
    }

    const visitor = detectVisitorCountry()
    if (visitor && !list.some((h) => h.id === visitor.id)) {
      const anchor = COUNTRY_LABEL_ANCHORS[visitor.id]
      if (anchor) {
        const { lat, lon } = gridColRowToLatLon(anchor.c, anchor.r)
        list.push({
          id: visitor.id,
          lat,
          lon,
          offsetX: 22,
          offsetY: -18,
          country: visitor,
          unitVec: latLonToVec3(lat, lon),
        })
      }
    }

    return list
  }, [])

  // Fetch near-real-time stock & FX quotes
  useEffect(() => {
    let mounted = true
    if (isLiveStockEnabled()) {
      fetchLiveStocks(false).then((ok) => {
        if (ok && mounted) setLiveStockTick((v) => v + 1)
      })
    }

    const currencies = Array.from(new Set(hubItems.map((h) => h.country.currencyCode)))
    fetchLiveFxQuotes(baseCurrency, currencies, false).then((quotes) => {
      if (mounted && Object.keys(quotes).length > 0) {
        setLiveFxQuotes((prev) => ({ ...prev, ...quotes }))
      }
    })

    const timer = window.setInterval(() => {
      if (document.hidden) return
      if (isLiveStockEnabled()) {
        fetchLiveStocks(false).then((ok) => {
          if (ok && mounted) setLiveStockTick((v) => v + 1)
        })
      }
      fetchLiveFxQuotes(baseCurrency, currencies, true).then((quotes) => {
        if (mounted && Object.keys(quotes).length > 0) {
          setLiveFxQuotes((prev) => ({ ...prev, ...quotes }))
        }
      })
    }, 60 * 1000)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [baseCurrency, hubItems, refreshKey])

  // Enrich hub data with GDP, stock & FX metrics
  const enrichedHubs = useMemo(() => {
    const allStocks = getAllStockPrices()

    return hubItems.map((h) => {
      const gdpInfo = gdpLookup.get(h.id)
      const stock = allStocks[h.id]
      let stockChangePct = stock?.changePct ?? 0
      if (stock?.points && stock.points.length >= 2) {
        const prevClose = stock.points[stock.points.length - 2].close
        if (prevClose > 0) {
          stockChangePct = Number(
            (((stock.currentPrice - prevClose) / prevClose) * 100).toFixed(2)
          )
        }
      }

      const curr = h.country.currencyCode
      const usdPerUnit = exchangeRates?.rates[curr] || 1
      const multiplier =
        curr === 'JPY'
          ? 100
          : curr === 'KRW'
            ? 1000
            : usdPerUnit >= 500
              ? 1000
              : usdPerUnit >= 80
                ? 100
                : 1

      const liveQuote = liveFxQuotes[curr]
      const rawFxRate =
        curr === baseCurrency
          ? 1
          : liveQuote?.price && typeof liveQuote.price === 'number'
            ? liveQuote.price
            : exchangeRates
              ? getConversionRate(exchangeRates, curr, baseCurrency)
              : 0

      const fxRate = rawFxRate * multiplier
      const fxChangePct =
        curr === baseCurrency
          ? 0
          : liveQuote?.changePct ??
            (exchangeRates ? getFxChangePct(exchangeRates, curr, baseCurrency) : null)

      const cbInfo = getCountryInterestRate(interestRates ?? null, h.country)
      const indexName = stock
        ? lang === 'ko'
          ? stock.nameKo
          : stock.nameEn
        : h.country.id

      return {
        ...h,
        totalGdpUsd: gdpInfo?.totalGdpUsd ?? 0,
        gdpPerCapitaUsd: gdpInfo?.gdpPerCapitaUsd ?? 0,
        growthRatePct: gdpInfo?.growthRatePct ?? null,
        gdpRank: gdpInfo?.rank ?? 99,
        terrainElev: gdpInfo?.terrainElev ?? 1.01,
        tierIndex: gdpInfo?.tierIndex ?? 0,
        stock,
        stockChangePct,
        indexName,
        currency: curr,
        multiplier,
        fxRate,
        fxChangePct,
        policyRatePct: cbInfo?.ratePct ?? null,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hubItems,
    gdpLookup,
    exchangeRates,
    interestRates,
    baseCurrency,
    lang,
    liveStockTick,
    liveFxQuotes,
  ])

  const enrichedHubsRef = useRef(enrichedHubs)
  useEffect(() => {
    enrichedHubsRef.current = enrichedHubs
  }, [enrichedHubs])

  // Summary counts
  const hubSummary = useMemo(() => {
    let up = 0
    let down = 0
    for (const h of enrichedHubs) {
      if (h.stockChangePct > 0.15) up++
      else if (h.stockChangePct < -0.15) down++
    }
    return { up, down, total: enrichedHubs.length }
  }, [enrichedHubs])

  const handleSelectPreset = (preset: RegionPreset) => {
    setActivePreset(preset)
    if (preset === 'auto') {
      targetRotationRef.current = null
      setIsSpinning(true)
      return
    }
    setIsSpinning(false)
    if (preset === 'asia') {
      targetRotationRef.current = { lon: -120, lat: 18 }
    } else if (preset === 'europe') {
      // Center directly on Poland (POL: c=26, r=5 -> lon≈+5.4°, lat≈+44.4°)
      targetRotationRef.current = { lon: -5.5, lat: -44 }
    } else if (preset === 'americas') {
      targetRotationRef.current = { lon: 82, lat: 14 }
    } else if (preset === 'oceania') {
      // Center directly on Australia (AUS: c=46, r=21 -> lon≈+141.3°, lat≈-25.2°)
      targetRotationRef.current = { lon: -140, lat: 25 }
    }
  }

  // Main 60fps 3D Canvas & Capsule Projection Loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const { landDots, graticuleLines } = getGlobeGeometry()
    let rafId = 0
    let pulsePhase = 0

    const renderFrame = () => {
      pulsePhase += 0.035
      const rect = container.getBoundingClientRect()
      const width = Math.max(320, Math.round(rect.width))
      const height = Math.max(420, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      // Update rotation physics
      const rot = rotationRef.current
      if (!dragRef.current.isDown) {
        if (targetRotationRef.current) {
          const dLon = ((targetRotationRef.current.lon - rot.lon + 540) % 360) - 180
          const dLat = targetRotationRef.current.lat - rot.lat
          rot.lon += dLon * 0.09
          rot.lat += dLat * 0.09
          if (Math.abs(dLon) < 0.15 && Math.abs(dLat) < 0.15) {
            targetRotationRef.current = null
          }
        } else if (isSpinningRef.current && !hoveredHubIdRef.current) {
          // Smooth continuous West-to-East orbit (90% of 0.18 deg/frame)
          rot.lon -= 0.162
          rot.velLon *= 0.9
          rot.velLat *= 0.9
        } else {
          // Apply drag momentum decay
          rot.lon += rot.velLon
          rot.lat = Math.max(-68, Math.min(68, rot.lat + rot.velLat))
          rot.velLon *= 0.92
          rot.velLat *= 0.92
        }
      }

      const rotLonRad = (rot.lon * Math.PI) / 180
      const rotLatRad = (rot.lat * Math.PI) / 180

      const topSafe = 52
      const bottomSafe = 66
      const usableH = Math.max(300, height - topSafe - bottomSafe)
      const cx = width / 2
      const cy = topSafe + usableH / 2
      const radius = Math.min(width * (width < 640 ? 0.38 : 0.40), usableH * 0.45)

      // 1. Outer Atmospheric Halo Glow
      const outerHalo = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.72,
        cx,
        cy,
        radius * 1.34
      )
      outerHalo.addColorStop(0, 'rgba(16, 185, 129, 0.16)')
      outerHalo.addColorStop(0.45, 'rgba(79, 70, 229, 0.16)')
      outerHalo.addColorStop(1, 'rgba(2, 6, 23, 0)')
      ctx.fillStyle = outerHalo
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.34, 0, Math.PI * 2)
      ctx.fill()

      // 2. 3D Sphere Ocean Body with Specular Highlight
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.28,
        cy - radius * 0.28,
        radius * 0.08,
        cx,
        cy,
        radius
      )
      sphereGrad.addColorStop(0, '#132046')
      sphereGrad.addColorStop(0.65, '#091128')
      sphereGrad.addColorStop(1, '#040817')
      ctx.fillStyle = sphereGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()

      // 3. Subtle Graticule Wireframe Lines (Back & Front)
      ctx.lineWidth = 0.8
      for (const line of graticuleLines) {
        ctx.beginPath()
        let started = false
        for (let i = 0; i < line.length; i++) {
          const rp = rotatePoint(line[i], rotLonRad, rotLatRad)
          if (rp.z < -0.15) {
            started = false
            continue
          }
          const sx = cx + rp.x * radius
          const sy = cy + rp.y * radius
          if (!started) {
            ctx.moveTo(sx, sy)
            started = true
          } else {
            ctx.lineTo(sx, sy)
          }
        }
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.13)'
        ctx.stroke()
      }

      // Crisp Atmospheric Rim Ring on Base Sphere
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.30)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // 4. Mode-Specific Continent Rendering
      const dotSizeBack = Math.max(0.88, radius * 0.0052)
      const dotSizeFront = Math.max(1.38, radius * 0.0082)
      const currentGdpMap = gdpLookupRef.current
      const currentStockBucketMap = stockBucketLookupRef.current
      const currentFxBucketMap = fxBucketLookupRef.current
      const activeMode = displayModeRef.current
      const isGdpMode = activeMode === 'gdp'
      const elevMultiplier = 1.25

      // 4a. Back hemisphere dim hologram dots
      ctx.fillStyle = 'rgba(71, 85, 105, 0.14)'
      ctx.beginPath()
      for (let i = 0; i < landDots.length; i++) {
        const rp = rotatePoint(landDots[i], rotLonRad, rotLatRad)
        if (rp.z < 0) {
          const sx = cx + rp.x * radius
          const sy = cy + rp.y * radius
          ctx.moveTo(sx + dotSizeBack, sy)
          ctx.arc(sx, sy, dotSizeBack, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      // 4b. Front hemisphere continents based on active display mode:
      // - 'gdp': 3D Stacked Voxel Continent Blocks with GDP elevation
      // - 'stocks': Flat sphere surface (no elevation) with country dots colored by stock index change %
      // - 'fx': Flat sphere surface (no elevation) with country dots colored by FX 24h change %
      if (isGdpMode) {
        for (let tier = 0; tier <= 4; tier++) {
          const style = GDP_VOXEL_STYLES[tier]
          const maxLayers = tier === 4 ? 7 : tier === 3 ? 5 : tier === 2 ? 4 : tier === 1 ? 2 : 1

          // 1) Draw stacked intermediate 3D voxel slices (side wall body along coastlines, borders & oblique angles)
          if (maxLayers > 1) {
            ctx.fillStyle = style.sideWall
            ctx.beginPath()
            const rWall = dotSizeFront * 0.96
            for (let layer = 0; layer < maxLayers - 1; layer++) {
              const layerFrac = layer / (maxLayers - 1)
              for (let i = 0; i < landDots.length; i++) {
                const dot = landDots[i]
                const info = currentGdpMap.get(dot.countryId)
                const dotTier = info?.tierIndex ?? 0
                if (dotTier !== tier) continue

                const rp = rotatePoint(dot, rotLonRad, rotLatRad)
                if (rp.z < 0) continue
                if (!dot.isEdge && rp.z > 0.72) continue

                const rawDelta = (info?.terrainElev ?? 1.006) - 1.0
                const elev = 1.0 + rawDelta * elevMultiplier * layerFrac
                const vx = cx + rp.x * radius * elev
                const vy = cy + rp.y * radius * elev
                ctx.moveTo(vx + rWall, vy)
                ctx.arc(vx, vy, rWall, 0, Math.PI * 2)
              }
            }
            ctx.fill()
          }

          // 2) Draw Top Cap Voxel Plateau (Mid-depth band: 0 <= z < 0.5)
          ctx.fillStyle = style.topCapMid
          ctx.beginPath()
          for (let i = 0; i < landDots.length; i++) {
            const dot = landDots[i]
            const info = currentGdpMap.get(dot.countryId)
            const dotTier = info?.tierIndex ?? 0
            if (dotTier !== tier) continue

            const rp = rotatePoint(dot, rotLonRad, rotLatRad)
            if (rp.z >= 0 && rp.z < 0.5) {
              const rawDelta = (info?.terrainElev ?? 1.004) - 1.0
              const elev = 1.0 + rawDelta * elevMultiplier
              const ex = cx + rp.x * radius * elev
              const ey = cy + rp.y * radius * elev
              const rTop = dotSizeFront * (0.88 + tier * 0.025)
              ctx.moveTo(ex + rTop, ey)
              ctx.arc(ex, ey, rTop, 0, Math.PI * 2)
            }
          }
          ctx.fill()

          // 3) Draw Top Cap Voxel Plateau (Front-most band: z >= 0.5)
          ctx.fillStyle = style.topCapFront
          ctx.beginPath()
          for (let i = 0; i < landDots.length; i++) {
            const dot = landDots[i]
            const info = currentGdpMap.get(dot.countryId)
            const dotTier = info?.tierIndex ?? 0
            if (dotTier !== tier) continue

            const rp = rotatePoint(dot, rotLonRad, rotLatRad)
            if (rp.z >= 0.5) {
              const rawDelta = (info?.terrainElev ?? 1.004) - 1.0
              const elev = 1.0 + rawDelta * elevMultiplier
              const ex = cx + rp.x * radius * elev
              const ey = cy + rp.y * radius * elev
              const rTop = dotSizeFront * (0.94 + tier * 0.03)
              ctx.moveTo(ex + rTop, ey)
              ctx.arc(ex, ey, rTop, 0, Math.PI * 2)
            }
          }
          ctx.fill()
        }
      } else {
        // 'stocks' or 'fx': Flat sphere surface (elev = 1.0) colored by each country's daily change %
        const activeBucketMap = activeMode === 'stocks' ? currentStockBucketMap : currentFxBucketMap
        const rMid = dotSizeFront * 0.90
        const rFront = dotSizeFront * 0.98
        for (let bucket = 0; bucket < STOCK_DOT_STYLES.length; bucket++) {
          const style = STOCK_DOT_STYLES[bucket]

          // Mid-depth band (0 <= z < 0.5)
          ctx.fillStyle = style.mid
          ctx.beginPath()
          for (let i = 0; i < landDots.length; i++) {
            const dot = landDots[i]
            const dotBucket = activeBucketMap.get(dot.countryId) ?? 0
            if (dotBucket !== bucket) continue
            const rp = rotatePoint(dot, rotLonRad, rotLatRad)
            if (rp.z >= 0 && rp.z < 0.5) {
              const sx = cx + rp.x * radius
              const sy = cy + rp.y * radius
              ctx.moveTo(sx + rMid, sy)
              ctx.arc(sx, sy, rMid, 0, Math.PI * 2)
            }
          }
          ctx.fill()

          // Front-most band (z >= 0.5)
          ctx.fillStyle = style.front
          ctx.beginPath()
          for (let i = 0; i < landDots.length; i++) {
            const dot = landDots[i]
            const dotBucket = activeBucketMap.get(dot.countryId) ?? 0
            if (dotBucket !== bucket) continue
            const rp = rotatePoint(dot, rotLonRad, rotLatRad)
            if (rp.z >= 0.5) {
              const sx = cx + rp.x * radius
              const sy = cy + rp.y * radius
              ctx.moveTo(sx + rFront, sy)
              ctx.arc(sx, sy, rFront, 0, Math.PI * 2)
            }
          }
          ctx.fill()
        }
      }

      // 4c. North Pole Easter Egg: 3D Polar Ice Floe, Cozy Igloo & Trotting Arctic Fox ("총총총")
      drawArcticEasterEgg(ctx, cx, cy, radius, rotLonRad, rotLatRad, pulsePhase)

      // 4d. South Pole Easter Egg: 3D Antarctic Ice Shelf, Glacier Peak & Two Strolling Penguins ("뒤뚱뒤뚱")
      drawAntarcticEasterEgg(ctx, cx, cy, radius, rotLonRad, rotLatRad, pulsePhase)

      // 5. Project Hubs & Draw 3D Great-Circle Arcs from Base Currency Hub (Hidden in 'stocks' mode)
      const currentHubs = enrichedHubsRef.current
      const baseHubId = BASE_CURRENCY_HUB_ID[baseCurrency] || 'USA'
      const baseHub = currentHubs.find((h) => h.id === baseHubId)
      const isDesktopRatio = width >= 768 && width >= height * 0.95

      if (baseHub && activeMode !== 'stocks') {
        for (const target of currentHubs) {
          if (target.id === baseHub.id) continue
          if (!isDesktopRatio && target.desktopOnly) continue
          const rpTarget = rotatePoint(target.unitVec, rotLonRad, rotLatRad)
          const rpBase = rotatePoint(baseHub.unitVec, rotLonRad, rotLatRad)
          if (rpTarget.z < 0.05 && rpBase.z < 0.05) continue

          const isHighlighted =
            hoveredHubIdRef.current === target.id || hoveredHubIdRef.current === baseHub.id

          // Draw elevated 3D great-circle arc in 20 steps
          const steps = 20
          ctx.beginPath()
          let started = false
          for (let s = 0; s <= steps; s++) {
            const t = s / steps
            const ix = baseHub.unitVec.x * (1 - t) + target.unitVec.x * t
            const iy = baseHub.unitVec.y * (1 - t) + target.unitVec.y * t
            const iz = baseHub.unitVec.z * (1 - t) + target.unitVec.z * t
            const len = Math.hypot(ix, iy, iz) || 1
            const elev = 1.04 + Math.sin(Math.PI * t) * 0.14
            const p3d: Vec3 = {
              x: (ix / len) * elev,
              y: (iy / len) * elev,
              z: (iz / len) * elev,
            }
            const rp = rotatePoint(p3d, rotLonRad, rotLatRad)
            if (rp.z < -0.05) {
              started = false
              continue
            }
            const sx = cx + rp.x * radius
            const sy = cy + rp.y * radius
            if (!started) {
              ctx.moveTo(sx, sy)
              started = true
            } else {
              ctx.lineTo(sx, sy)
            }
          }
          if (activeMode === 'fx') {
            const fxChg = target.fxChangePct ?? 0
            if (fxChg > 0.01) {
              ctx.strokeStyle = isHighlighted
                ? 'rgba(52, 211, 153, 0.85)'
                : 'rgba(16, 185, 129, 0.38)'
            } else if (fxChg < -0.01) {
              ctx.strokeStyle = isHighlighted
                ? 'rgba(251, 113, 133, 0.85)'
                : 'rgba(244, 63, 94, 0.38)'
            } else {
              ctx.strokeStyle = isHighlighted
                ? 'rgba(148, 163, 184, 0.75)'
                : 'rgba(100, 116, 139, 0.25)'
            }
          } else {
            ctx.strokeStyle = isHighlighted
              ? 'rgba(52, 211, 153, 0.7)'
              : 'rgba(99, 102, 241, 0.20)'
          }
          ctx.lineWidth = isHighlighted ? 1.8 : 1.0
          ctx.stroke()
        }
      }

      // 6. Compute Visible Front-Hemisphere Capsules anchored flush on top of each country's 3D Voxel Block
      const rawCapsules: ProjectedCapsule[] = []
      const pulseScale = (Math.sin(pulsePhase) + 1) * 0.5

      for (const h of currentHubs) {
        if (!isDesktopRatio && h.desktopOnly) continue
        const rp = rotatePoint(h.unitVec, rotLonRad, rotLatRad)
        // Only show hubs on the front hemisphere (z > 0.08)
        if (rp.z <= 0.08) continue

        // Anchor point sits on the 3D voxel block top face ONLY in GDP mode; flat (1.0) in Stocks and FX modes
        const topSurfaceElev = isGdpMode ? 1.0 + (h.terrainElev - 1.0) * elevMultiplier : 1.0
        const surfaceX = cx + rp.x * radius * topSurfaceElev
        const surfaceY = cy + rp.y * radius * topSurfaceElev

        // Radial push outward from globe center + custom hub offset scaled to globe radius
        const radialScale = Math.max(0.65, radius / 250)
        const initX = surfaceX + h.offsetX * radialScale + rp.x * (radius * 0.065)
        const initY = surfaceY + h.offsetY * radialScale + rp.y * (radius * 0.065)

        const depthFactor = Math.min(1, Math.max(0, (rp.z - 0.08) / 0.65))
        const scale = 0.82 + depthFactor * 0.2
        const opacity = Math.min(1, Math.pow(depthFactor, 0.65))

        rawCapsules.push({
          id: h.id,
          country: h.country,
          surfaceX,
          surfaceY,
          x: initX,
          y: initY,
          z: rp.z,
          scale,
          opacity,
          totalGdpUsd: h.totalGdpUsd,
          gdpPerCapitaUsd: h.gdpPerCapitaUsd,
          growthRatePct: h.growthRatePct,
          gdpRank: h.gdpRank,
          stock: h.stock,
          stockChangePct: h.stockChangePct,
          indexName: h.indexName,
          currency: h.currency,
          multiplier: h.multiplier,
          fxRate: h.fxRate,
          fxChangePct: h.fxChangePct,
          policyRatePct: h.policyRatePct,
        })
      }

      // Sort by depth descending so front-most capsules win position priority
      rawCapsules.sort((a, b) => b.z - a.z)

      // On desktop aspect ratio screens, allow all 40 active countries; on compact screens limit to 9
      const maxVisible = isDesktopRatio ? 40 : width < 640 ? 9 : 14
      const activeCapsules = rawCapsules.slice(0, maxVisible)

      // 2D Collision Relaxation so capsules never overlap each other
      const boxW = width < 640 ? 116 : 132
      const boxH = width < 640 ? 44 : 46
      const relaxIters = isDesktopRatio ? 16 : 10
      for (let iter = 0; iter < relaxIters; iter++) {
        for (let i = 0; i < activeCapsules.length; i++) {
          for (let j = i + 1; j < activeCapsules.length; j++) {
            const a = activeCapsules[i]
            const b = activeCapsules[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const overlapX = boxW - Math.abs(dx)
            const overlapY = boxH - Math.abs(dy)
            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const push = overlapX * 0.35 * (dx >= 0 ? 1 : -1)
                a.x -= push * 0.35
                b.x += push * 0.65
              } else {
                const push = overlapY * 0.35 * (dy >= 0 ? 1 : -1)
                a.y -= push * 0.35
                b.y += push * 0.65
              }
            }
          }
        }
      }

      // Clamp capsules within safe viewport bounds
      const padX = boxW * 0.52
      const padY = boxH * 0.52
      for (const cap of activeCapsules) {
        cap.x = Math.max(padX, Math.min(width - padX, cap.x))
        cap.y = Math.max(topSafe + padY, Math.min(height - bottomSafe - padY, cap.y))
      }

      // 7. Draw Surface Pulse Beacons on top of the 3D Voxel Block & Leader Lines to Capsules
      for (const cap of activeCapsules) {
        const isHovered = hoveredHubIdRef.current === cap.id
        const isUp =
          displayModeRef.current === 'gdp'
            ? (cap.growthRatePct ?? 0) >= 0
            : displayModeRef.current === 'stocks'
              ? cap.stockChangePct > 0.15
              : (cap.fxChangePct ?? 0) > 0.01
        const isDown =
          displayModeRef.current === 'gdp'
            ? (cap.growthRatePct ?? 0) < 0
            : displayModeRef.current === 'stocks'
              ? cap.stockChangePct < -0.15
              : (cap.fxChangePct ?? 0) < -0.01

        const colorHex = isUp ? '#10b981' : isDown ? '#f43f5e' : '#818cf8'
        const colorRgba = isUp
          ? 'rgba(16, 185, 129,'
          : isDown
            ? 'rgba(244, 63, 94,'
            : 'rgba(129, 140, 248,'

        // Leader line from voxel block top surface to floating capsule
        ctx.beginPath()
        ctx.moveTo(cap.surfaceX, cap.surfaceY)
        ctx.lineTo(cap.x, cap.y)
        ctx.strokeStyle = `${colorRgba} ${0.45 * cap.opacity})`
        ctx.lineWidth = isHovered ? 1.8 : 1.1
        ctx.stroke()

        // Expanding pulse ring on voxel block top surface
        const ringR = 3.5 + pulseScale * 6.5
        ctx.beginPath()
        ctx.arc(cap.surfaceX, cap.surfaceY, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `${colorRgba} ${(1 - pulseScale) * 0.65 * cap.opacity})`
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Solid glowing beacon core on voxel block top surface
        ctx.beginPath()
        ctx.arc(cap.surfaceX, cap.surfaceY, 3.2, 0, Math.PI * 2)
        ctx.fillStyle = isHovered ? '#ffffff' : colorHex
        ctx.fill()
      }

      ctx.restore()
      setProjectedCapsules(activeCapsules)
      rafId = window.requestAnimationFrame(renderFrame)
    }

    rafId = window.requestAnimationFrame(renderFrame)
    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [baseCurrency])

  // Pointer drag handlers for interactive 3D rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-globe-ui="true"]')) return
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    }
    targetRotationRef.current = null
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDown) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY

    rotationRef.current.lon += dx * 0.35
    rotationRef.current.lat = Math.max(
      -68,
      Math.min(68, rotationRef.current.lat + dy * 0.35)
    )
    rotationRef.current.velLon = dx * 0.18
    rotationRef.current.velLat = dy * 0.18
  }

  const handlePointerUp = () => {
    dragRef.current.isDown = false
  }

  // Top 4 front-most hubs for the bottom live spotlight bar
  const spotlightHubs = useMemo(() => {
    return [...projectedCapsules].sort((a, b) => b.z - a.z).slice(0, 4)
  }, [projectedCapsules])

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-[calc(100dvh-136px)] md:h-[calc(100dvh-76px)] min-h-[540px] rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-2xl"
    >
      {/* Subtle Deep-Space Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(16, 185, 129, 0.12) 0%, rgba(30, 27, 75, 0.35) 38%, rgba(2, 6, 23, 0.96) 78%)',
        }}
      />

      {/* 3D Globe Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

      {/* Top Glassmorphic Control Bar */}
      <div
        data-globe-ui="true"
        className="absolute top-2.5 left-2.5 right-2.5 z-30 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 shadow-lg cursor-default"
      >
        {/* Left: Market Breadth Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {hubSummary.up}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              {hubSummary.down}
            </span>
          </div>
        </div>

        {/* Center: Display Mode Switcher (GDP / Stocks / FX) + Region Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
          {/* Display Mode Tabs */}
          <div className="flex items-center rounded-lg bg-slate-950/90 border border-slate-800 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setDisplayMode('gdp')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'gdp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>GDP</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('stocks')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'stocks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>
                {lang === 'ko'
                  ? '증시'
                  : lang === 'ja'
                    ? '株価'
                    : lang === 'zh'
                      ? '股市'
                      : lang === 'es'
                        ? 'Bolsa'
                        : 'Stocks'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('fx')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'fx'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3 h-3" />
              <span>
                {lang === 'ko'
                  ? '환율'
                  : lang === 'ja'
                    ? '為替'
                    : lang === 'zh'
                      ? '汇率'
                      : lang === 'es'
                        ? 'Divisas'
                        : 'FX'}
              </span>
            </button>
          </div>

          {/* Region Quick Jump Pills */}
          <div className="hidden md:flex items-center gap-1">
            {(
              [
                { id: 'auto', ko: '자동 회전', en: 'Auto Orbit' },
                { id: 'asia', ko: '아시아', en: 'Asia' },
                { id: 'europe', ko: '유럽', en: 'Europe' },
                { id: 'americas', ko: '미주', en: 'Americas' },
                { id: 'oceania', ko: '오세아니아', en: 'Oceania' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activePreset === p.id
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
                }`}
              >
                {lang === 'ko' ? p.ko : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Spin Toggle & Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            title={lang === 'ko' ? '일시정지 / 재생 (Space)' : 'Pause / Play (Space)'}
            onClick={() => {
              targetRotationRef.current = null
              setIsSpinning((s) => !s)
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isSpinning
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isSpinning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>
              {isSpinning
                ? lang === 'ko'
                  ? '회전 중'
                  : 'Orbiting'
                : lang === 'ko'
                  ? '일시정지'
                  : 'Paused'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('auto')}
            title={lang === 'ko' ? '기본 회전 초기화' : 'Reset orbit'}
            className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating 3D HUD Capsules Layer */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {projectedCapsules.map((cap) => {
          const isUp =
            displayMode === 'gdp'
              ? (cap.growthRatePct ?? 0) >= 0
              : displayMode === 'stocks'
                ? cap.stockChangePct > 0.15
                : (cap.fxChangePct ?? 0) > 0.01
          const isDown =
            displayMode === 'gdp'
              ? (cap.growthRatePct ?? 0) < 0
              : displayMode === 'stocks'
                ? cap.stockChangePct < -0.15
                : (cap.fxChangePct ?? 0) < -0.01
          const isHovered = hoveredHubId === cap.id
          const isExpanded = displayMode === 'stocks' && expandedHubId === cap.id
          const sparklineData =
            displayMode === 'stocks' && isHovered ? getCapsuleSparkline(cap) : null

          const borderClass = isHovered
            ? 'border-white ring-2 ring-emerald-400/50 bg-slate-900/95'
            : displayMode === 'gdp'
              ? 'border-emerald-500/45 bg-slate-900/85 hover:border-emerald-400'
              : isUp
                ? 'border-emerald-500/45 bg-slate-900/85 hover:border-emerald-400'
                : isDown
                  ? 'border-rose-500/45 bg-slate-900/85 hover:border-rose-400'
                  : 'border-indigo-500/35 bg-slate-900/85 hover:border-indigo-400'

          const unitLabel =
            cap.multiplier === 1000
              ? `1,000 ${cap.currency}`
              : cap.multiplier === 100
                ? `100 ${cap.currency}`
                : `1 ${cap.currency}`

          return (
            <button
              key={cap.id}
              type="button"
              data-globe-ui="true"
              onMouseEnter={() => setHoveredHubId(cap.id)}
              onMouseLeave={() => setHoveredHubId(null)}
              onClick={() => onSelectCountry(cap.country)}
              style={{
                transform: `translate3d(${Math.round(cap.x)}px, ${Math.round(cap.y - 22)}px, 0) translate(-50%, 0) scale(${cap.scale.toFixed(3)})`,
                transformOrigin: 'top center',
                opacity: isHovered ? 1 : cap.opacity,
                zIndex: isHovered ? 50 : Math.round(cap.z * 30),
              }}
              className={`pointer-events-auto absolute top-0 left-0 rounded-xl backdrop-blur-md border px-2 sm:px-2.5 py-1 sm:py-1.5 text-left shadow-xl transition-[border-color,background-color] duration-150 cursor-pointer w-[118px] sm:w-[140px] ${borderClass}`}
            >
              {/* Row 1: Flag, Country Name & Primary Mode Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 min-w-0">
                  <CountryFlag
                    iso2={cap.country.iso2}
                    className="w-3.5 h-2.5 rounded-[2px] shrink-0 shadow-sm"
                  />
                  <span className="text-[11px] sm:text-xs font-extrabold text-white truncate max-w-[64px] sm:max-w-[78px]">
                    {getCountryName(cap.country, lang)}
                  </span>
                </div>

                {displayMode === 'gdp' ? (
                  <span className="text-[10px] font-mono font-black px-1 py-0.2 rounded shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    #{cap.gdpRank}
                  </span>
                ) : displayMode === 'stocks' ? (
                  <span
                    className={`text-[10px] font-mono font-black px-1 py-0.2 rounded shrink-0 ${
                      isUp
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isDown
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cap.stockChangePct > 0
                      ? `+${cap.stockChangePct.toFixed(2)}%`
                      : `${cap.stockChangePct.toFixed(2)}%`}
                  </span>
                ) : cap.currency === baseCurrency ? (
                  <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 shrink-0">
                    BASE
                  </span>
                ) : cap.fxChangePct != null ? (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${getFxBadgeColorClass(
                      cap.fxChangePct
                    )}`}
                  >
                    {formatFxChangeBadgeText(cap.fxChangePct)}
                  </span>
                ) : null}
              </div>

              {/* Row 2: Contextual Secondary Metric based on Display Mode */}
              <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] font-mono">
                {displayMode === 'gdp' && (
                  <>
                    <span className="text-emerald-200 font-bold whitespace-nowrap">
                      {formatGdpCompact(cap.totalGdpUsd, baseCurrency, usdToBase, lang)}
                    </span>
                    {cap.growthRatePct !== null && (
                      <span
                        className={`font-bold whitespace-nowrap ${
                          cap.growthRatePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {cap.growthRatePct > 0
                          ? `+${cap.growthRatePct.toFixed(1)}%`
                          : `${cap.growthRatePct.toFixed(1)}%`}
                      </span>
                    )}
                  </>
                )}

                {displayMode === 'stocks' && (
                  <>
                    <span className="text-slate-400 truncate max-w-[66px]">{cap.indexName}</span>
                    <span className="text-slate-200 font-bold">
                      {cap.stock?.currentPrice ? cap.stock.currentPrice.toLocaleString() : '-'}
                    </span>
                  </>
                )}

                {displayMode === 'fx' && (
                  <>
                    <span className="text-slate-400 whitespace-nowrap">{unitLabel}</span>
                    <span className="text-indigo-200 font-bold whitespace-nowrap">
                      {cap.currency === baseCurrency
                        ? '1.00'
                        : formatCompactFxValue(cap.fxRate, baseCurrency, lang)}
                    </span>
                  </>
                )}
              </div>

              {/* Row 3: Delayed Hover Height Expansion for 30-Day Trend Sparkline inside the Same Box */}
              <div
                className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-200 ease-out ${
                  isExpanded
                    ? 'grid-rows-[1fr] opacity-100 mt-1.5 pt-1.5 border-t border-slate-700/80'
                    : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t border-transparent'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  {sparklineData && (
                    <>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                        <span className="truncate max-w-[72px]">
                          {cap.stock?.currency || cap.currency}
                        </span>
                        <span className="shrink-0">30D Trend</span>
                      </div>
                      <StockSparkline
                        points={sparklineData.points}
                        isPositive={cap.stockChangePct >= 0}
                        width={118}
                        height={28}
                        className="w-full block"
                      />
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Live Spotlight Strip (Front-Facing Hubs Currently in Focus) */}
      <div
        data-globe-ui="true"
        className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 shadow-lg cursor-default"
      >
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300 shrink-0 pr-2 border-r border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {lang === 'ko'
              ? '현재 정면 포커스 마켓'
              : lang === 'ja'
                ? '正面フォーカス市場'
                : 'Front-Facing Spotlight'}
          </span>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
          {spotlightHubs.map((hub) => {
            const isUp = hub.stockChangePct > 0.15
            const isDown = hub.stockChangePct < -0.15
            const unitLabel =
              hub.multiplier === 1000
                ? `1,000 ${hub.currency}`
                : hub.multiplier === 100
                  ? `100 ${hub.currency}`
                  : `1 ${hub.currency}`

            return (
              <button
                key={`spot-${hub.id}`}
                type="button"
                onMouseEnter={() => setHoveredHubId(hub.id)}
                onMouseLeave={() => setHoveredHubId(null)}
                onClick={() => onSelectCountry(hub.country)}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <CountryFlag iso2={hub.country.iso2} className="w-4 h-3 rounded-[2px] shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {getCountryName(hub.country, lang)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {displayMode === 'gdp'
                        ? `#${hub.gdpRank} · ${formatPerCapita(
                            hub.gdpPerCapitaUsd,
                            baseCurrency,
                            usdToBase,
                            lang
                          )}`
                        : displayMode === 'stocks'
                          ? hub.indexName
                          : unitLabel}
                    </div>
                  </div>
                </div>

                {displayMode === 'gdp' ? (
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs font-black text-emerald-300">
                      {formatGdpCompact(hub.totalGdpUsd, baseCurrency, usdToBase, lang)}
                    </div>
                    <div
                      className={`text-[9px] font-bold truncate max-w-[68px] ${
                        (hub.growthRatePct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {hub.growthRatePct !== null
                        ? `${hub.growthRatePct > 0 ? '+' : ''}${hub.growthRatePct.toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                ) : displayMode === 'stocks' ? (
                  <div className="text-right shrink-0 font-mono">
                    <div
                      className={`text-xs font-black ${
                        isUp
                          ? 'text-emerald-400'
                          : isDown
                            ? 'text-rose-400'
                            : 'text-slate-300'
                      }`}
                    >
                      {hub.stockChangePct > 0
                        ? `+${hub.stockChangePct.toFixed(2)}%`
                        : `${hub.stockChangePct.toFixed(2)}%`}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate max-w-[68px]">
                      {hub.stock?.currentPrice ? hub.stock.currentPrice.toLocaleString() : '-'}
                    </div>
                  </div>
                ) : (
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs font-black text-indigo-200">
                      {hub.currency === baseCurrency
                        ? '1.00'
                        : formatCompactFxValue(hub.fxRate, baseCurrency, lang)}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate max-w-[68px]">
                      {hub.currency === baseCurrency
                        ? 'BASE'
                        : hub.fxChangePct != null
                          ? formatFxChangeBadgeText(hub.fxChangePct)
                          : '-'}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

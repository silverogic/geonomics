import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Coins,
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
import { COUNTRIES } from '../data/countries'
import {
  PIXEL_MAP_TILES,
  PIXEL_MAP_COLS,
  COUNTRY_LABEL_ANCHORS,
} from '../data/pixelMapData'
import { getAllStockPrices, type StockPriceInfo } from '../data/stockPrices'
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
  formatFxChangeBadgeText,
  getFxBadgeColorClass,
} from '../utils/formatters'
import { CountryFlag } from './CountryFlag'

interface FinancialGlobeViewProps {
  baseCurrency: BaseCurrency
  exchangeRates: ExchangeRates | null
  interestRates?: Record<string, InterestRateInfo> | null
  lang: Language
  onSelectCountry: (country: CountryMeta) => void
  refreshKey?: number
}

type GlobeDisplayMode = 'stocks' | 'fx'
type RegionPreset = 'auto' | 'asia' | 'europe' | 'americas' | 'oceania'

interface HubDefinition {
  id: string
  offsetX: number
  offsetY: number
}

const FLAGSHIP_HUBS: HubDefinition[] = [
  // Asia & Middle East
  { id: 'KOR', offsetX: -18, offsetY: -26 },
  { id: 'JPN', offsetX: 34, offsetY: -16 },
  { id: 'CHN', offsetX: -36, offsetY: 6 },
  { id: 'TWN', offsetX: 34, offsetY: 16 },
  { id: 'HKG', offsetX: -28, offsetY: 32 },
  { id: 'SGP', offsetX: -24, offsetY: 22 },
  { id: 'IDN', offsetX: 26, offsetY: 28 },
  { id: 'IND', offsetX: -22, offsetY: 18 },
  { id: 'SAU', offsetX: -18, offsetY: 16 },

  // Europe
  { id: 'GBR', offsetX: -38, offsetY: -22 },
  { id: 'FRA', offsetX: -36, offsetY: 16 },
  { id: 'DEU', offsetX: 30, offsetY: -18 },
  { id: 'CHE', offsetX: 34, offsetY: 18 },
  { id: 'ESP', offsetX: -32, offsetY: 28 },
  { id: 'SWE', offsetX: 18, offsetY: -28 },
  { id: 'TUR', offsetX: 28, offsetY: 16 },

  // Americas
  { id: 'USA', offsetX: 24, offsetY: 14 },
  { id: 'CAN', offsetX: -24, offsetY: -26 },
  { id: 'MEX', offsetX: -26, offsetY: 20 },
  { id: 'BRA', offsetX: 26, offsetY: -12 },
  { id: 'ARG', offsetX: -22, offsetY: 24 },

  // Oceania & Africa
  { id: 'AUS', offsetX: -24, offsetY: -16 },
  { id: 'NZL', offsetX: 28, offsetY: 20 },
  { id: 'ZAF', offsetX: 20, offsetY: 20 },
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
  stock?: StockPriceInfo
  stockChangePct: number
  indexName: string
  currency: string
  multiplier: number
  fxRate: number
  fxChangePct: number | null
  policyRatePct: number | null
}

// Module-level cached 3D unit vectors for Dot-Matrix continents & graticule rings
let cachedLandDots: Vec3[] | null = null
let cachedGraticuleLines: Vec3[][] | null = null

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

function gridColRowToLatLon(col: number, row: number): { lat: number; lon: number } {
  const lon = ((col - 25.2) / PIXEL_MAP_COLS) * 360
  const lat = Math.max(-62, Math.min(74, (15.2 - row) * 4.35))
  return { lat, lon }
}

function getGlobeGeometry(): { landDots: Vec3[]; graticuleLines: Vec3[][] } {
  if (cachedLandDots && cachedGraticuleLines) {
    return { landDots: cachedLandDots, graticuleLines: cachedGraticuleLines }
  }

  // 1. Convert PIXEL_MAP_TILES into a refined 2x2 sub-dot spherical matrix (no country borders)
  const landDots: Vec3[] = []
  const subOffsets = [-0.24, 0.24]

  for (const tile of PIXEL_MAP_TILES) {
    for (const dc of subOffsets) {
      for (const dr of subOffsets) {
        const { lat, lon } = gridColRowToLatLon(tile.c + dc, tile.r + dr)
        landDots.push(latLonToVec3(lat, lon))
      }
    }
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

export const FinancialGlobeView: React.FC<FinancialGlobeViewProps> = ({
  baseCurrency,
  exchangeRates,
  interestRates,
  lang,
  onSelectCountry,
  refreshKey,
}) => {
  const [displayMode, setDisplayMode] = useState<GlobeDisplayMode>('stocks')
  const [activePreset, setActivePreset] = useState<RegionPreset>('auto')
  const [isSpinning, setIsSpinning] = useState(true)
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null)
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

  useEffect(() => {
    isSpinningRef.current = isSpinning
  }, [isSpinning])

  useEffect(() => {
    hoveredHubIdRef.current = hoveredHubId
  }, [hoveredHubId])

  // Build hubs list calibrated directly to COUNTRY_LABEL_ANCHORS so every pin sits on its landmass dot
  const hubItems = useMemo(() => {
    const countryMap = new Map(COUNTRIES.map((c) => [c.id, c]))
    const list: Array<HubDefinition & { lat: number; lon: number; country: CountryMeta; unitVec: Vec3 }> = []

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

  // Enrich hub data with stock & FX metrics
  const enrichedHubs = useMemo(() => {
    const allStocks = getAllStockPrices()

    return hubItems.map((h) => {
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
  }, [hubItems, exchangeRates, interestRates, baseCurrency, lang, liveStockTick, liveFxQuotes])

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
      targetRotationRef.current = { lon: -12, lat: 34 }
    } else if (preset === 'americas') {
      targetRotationRef.current = { lon: 82, lat: 14 }
    } else if (preset === 'oceania') {
      targetRotationRef.current = { lon: -138, lat: -18 }
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
          rot.lat = Math.max(-48, Math.min(52, rot.lat + rot.velLat))
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
      const radius = Math.min(width * (width < 640 ? 0.39 : 0.41), usableH * 0.46)

      // 1. Outer Atmospheric Halo Glow
      const outerHalo = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.72,
        cx,
        cy,
        radius * 1.32
      )
      outerHalo.addColorStop(0, 'rgba(79, 70, 229, 0.22)')
      outerHalo.addColorStop(0.55, 'rgba(56, 189, 248, 0.08)')
      outerHalo.addColorStop(1, 'rgba(2, 6, 23, 0)')
      ctx.fillStyle = outerHalo
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.32, 0, Math.PI * 2)
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

      // 4. Dot-Matrix Continents (Back hemisphere dim hologram + Front hemisphere bright dots)
      const dotSizeBack = Math.max(1.1, radius * 0.007)
      const dotSizeFront = Math.max(1.5, radius * 0.0095)

      ctx.fillStyle = 'rgba(71, 85, 105, 0.16)'
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

      // Front hemisphere dots grouped in 2 depth bands for fast batched rendering
      ctx.fillStyle = 'rgba(129, 140, 248, 0.45)'
      ctx.beginPath()
      for (let i = 0; i < landDots.length; i++) {
        const rp = rotatePoint(landDots[i], rotLonRad, rotLatRad)
        if (rp.z >= 0 && rp.z < 0.55) {
          const sx = cx + rp.x * radius
          const sy = cy + rp.y * radius
          ctx.moveTo(sx + dotSizeFront, sy)
          ctx.arc(sx, sy, dotSizeFront, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      ctx.fillStyle = 'rgba(165, 180, 252, 0.82)'
      ctx.beginPath()
      for (let i = 0; i < landDots.length; i++) {
        const rp = rotatePoint(landDots[i], rotLonRad, rotLatRad)
        if (rp.z >= 0.55) {
          const sx = cx + rp.x * radius
          const sy = cy + rp.y * radius
          ctx.moveTo(sx + dotSizeFront * 1.12, sy)
          ctx.arc(sx, sy, dotSizeFront * 1.12, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      // Crisp Atmospheric Rim Ring
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.42)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 5. Project Hubs & Draw 3D Great-Circle Arcs from Base Currency Hub
      const currentHubs = enrichedHubsRef.current
      const baseHubId = BASE_CURRENCY_HUB_ID[baseCurrency] || 'USA'
      const baseHub = currentHubs.find((h) => h.id === baseHubId)

      if (baseHub) {
        for (const target of currentHubs) {
          if (target.id === baseHub.id) continue
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
            const elev = 1 + Math.sin(Math.PI * t) * 0.14
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
          ctx.strokeStyle = isHighlighted
            ? 'rgba(56, 189, 248, 0.65)'
            : 'rgba(99, 102, 241, 0.22)'
          ctx.lineWidth = isHighlighted ? 1.8 : 1.0
          ctx.stroke()
        }
      }

      // 6. Compute Visible Front-Hemisphere Capsules & Apply 2D Screen-Space Repulsion
      const rawCapsules: ProjectedCapsule[] = []
      const pulseScale = (Math.sin(pulsePhase) + 1) * 0.5

      for (const h of currentHubs) {
        const rp = rotatePoint(h.unitVec, rotLonRad, rotLatRad)
        // Only show hubs on the front hemisphere (z > 0.08)
        if (rp.z <= 0.08) continue

        const surfaceX = cx + rp.x * radius
        const surfaceY = cy + rp.y * radius

        // Radial push outward from globe center + custom hub offset scaled to globe radius
        const radialScale = Math.max(0.65, radius / 250)
        const initX = surfaceX + h.offsetX * radialScale + rp.x * (radius * 0.075)
        const initY = surfaceY + h.offsetY * radialScale + rp.y * (radius * 0.075)

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

      // On compact screens, limit to top 9 front-most capsules for visual clarity
      const maxVisible = width < 640 ? 9 : 14
      const activeCapsules = rawCapsules.slice(0, maxVisible)

      // 2D Collision Relaxation so capsules never overlap each other
      const boxW = width < 640 ? 116 : 138
      const boxH = width < 640 ? 44 : 50
      for (let iter = 0; iter < 10; iter++) {
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

      // 7. Draw Surface Pulse Beacons & Leader Lines to Capsules
      for (const cap of activeCapsules) {
        const isUp = cap.stockChangePct > 0.15
        const isDown = cap.stockChangePct < -0.15
        const colorHex = isUp ? '#10b981' : isDown ? '#f43f5e' : '#818cf8'
        const colorRgba = isUp
          ? 'rgba(16, 185, 129,'
          : isDown
            ? 'rgba(244, 63, 94,'
            : 'rgba(129, 140, 248,'

        // Leader line from globe surface point to floating capsule
        ctx.beginPath()
        ctx.moveTo(cap.surfaceX, cap.surfaceY)
        ctx.lineTo(cap.x, cap.y)
        ctx.strokeStyle = `${colorRgba} ${0.45 * cap.opacity})`
        ctx.lineWidth = hoveredHubIdRef.current === cap.id ? 1.8 : 1.1
        ctx.stroke()

        // Expanding pulse ring on surface
        const ringR = 3.5 + pulseScale * 6.5
        ctx.beginPath()
        ctx.arc(cap.surfaceX, cap.surfaceY, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `${colorRgba} ${(1 - pulseScale) * 0.65 * cap.opacity})`
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Solid glowing beacon core on surface
        ctx.beginPath()
        ctx.arc(cap.surfaceX, cap.surfaceY, 3.2, 0, Math.PI * 2)
        ctx.fillStyle = colorHex
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
      -48,
      Math.min(52, rotationRef.current.lat + dy * 0.35)
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
            'radial-gradient(circle at 50% 46%, rgba(30, 27, 75, 0.45) 0%, rgba(2, 6, 23, 0.95) 75%)',
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

        {/* Center: Display Mode Switcher + Region Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
          {/* Display Mode Tabs (Stocks Only vs FX Only) */}
          <div className="flex items-center rounded-lg bg-slate-950/90 border border-slate-800 p-0.5 shrink-0">
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
          const isUp = cap.stockChangePct > 0.15
          const isDown = cap.stockChangePct < -0.15
          const isHovered = hoveredHubId === cap.id

          const borderClass = isHovered
            ? 'border-white ring-2 ring-indigo-400/50 bg-slate-900/95'
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
                transform: `translate3d(${Math.round(cap.x)}px, ${Math.round(cap.y)}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.08 : cap.scale.toFixed(3)})`,
                opacity: isHovered ? 1 : cap.opacity,
                zIndex: isHovered ? 50 : Math.round(cap.z * 30),
              }}
              className={`pointer-events-auto absolute top-0 left-0 rounded-xl backdrop-blur-md border px-2 sm:px-2.5 py-1 sm:py-1.5 text-left shadow-xl transition-[border-color,background-color] duration-150 cursor-pointer min-w-[112px] sm:min-w-[134px] ${borderClass}`}
            >
              {/* Row 1: Flag, Country Name & Primary Badge */}
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

                {displayMode === 'stocks' ? (
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
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <CountryFlag iso2={hub.country.iso2} className="w-4 h-3 rounded-[2px] shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {getCountryName(hub.country, lang)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {displayMode === 'stocks' ? hub.indexName : unitLabel}
                    </div>
                  </div>
                </div>

                {displayMode === 'stocks' ? (
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

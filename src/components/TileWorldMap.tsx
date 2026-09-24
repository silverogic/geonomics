import React, { useMemo, useRef, useCallback, useEffect } from 'react'
import {
  PIXEL_MAP_TILES,
  PIXEL_MAP_COLS,
  PIXEL_MAP_ROWS,
  COUNTRY_LABEL_ANCHORS,
  type PixelTile,
} from '../data/pixelMapData'
import type { CountryMeta, BaseCurrency, Region, Language } from '../types/economics'
import type { CountryRowItem } from './RankingTable'
import { formatGdpCompact, formatPerCapita } from '../utils/formatters'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import type { MapMetric } from './GdpWorldMap'
import { ChevronRight } from 'lucide-react'
import { translations } from '../i18n/translations'

interface TileWorldMapProps {
  items: CountryRowItem[]
  metric: MapMetric
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  selectedRegions?: Region[]
  selectedRegion?: Region | 'All'
  searchQuery: string
  hoveredCountryId: string | null
  pinnedCountryId: string | null
  getCountryFill: (countryId: string) => string
  onHoverCountry: (countryId: string | null) => void
  onSelectCountry: (country: CountryMeta) => void
}

export const TileWorldMap: React.FC<TileWorldMapProps> = ({
  items,
  metric,
  baseCurrency,
  usdToBase,
  lang,
  selectedRegions,
  selectedRegion,
  searchQuery,
  hoveredCountryId,
  pinnedCountryId,
  getCountryFill,
  onHoverCountry,
  onSelectCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  // Store tooltip position in a ref to avoid re-renders on mouse move
  const tooltipPosRef = useRef<{ x: number; y: number; containerWidth: number } | null>(null)
  const rafIdRef = useRef<number>(0)

  const t = translations[lang]

  // Fast country lookup
  const countryItemMap = useMemo(() => {
    const map = new Map<string, CountryRowItem>()
    for (const item of items) {
      map.set(item.country.id, item)
    }
    return map
  }, [items])

  // Map of anchor coordinates for quick label lookup: "c,r" => countryId
  const anchorMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const [id, coord] of Object.entries(COUNTRY_LABEL_ANCHORS)) {
      map.set(`${coord.c},${coord.r}`, id)
    }
    return map
  }, [])

  const searchLower = searchQuery.toLowerCase().trim()

  const activeRegions = useMemo(() => {
    if (selectedRegions && selectedRegions.length > 0) return selectedRegions
    if (selectedRegion && selectedRegion !== 'All') return [selectedRegion]
    return []
  }, [selectedRegions, selectedRegion])

  const isAllRegions = activeRegions.length === 0 || activeRegions.length === 5

  // Direct DOM update for tooltip position via rAF — zero React re-renders
  const updateTooltipDOM = useCallback(() => {
    const el = tooltipRef.current
    const pos = tooltipPosRef.current
    if (!el) return
    if (!pos) {
      el.style.display = 'none'
      return
    }
    el.style.display = ''
    el.style.left = `${pos.x}px`
    el.style.top = `${pos.y}px`
    // Clamp tooltip horizontally so it never exits the container boundary
    const ratio = pos.containerWidth > 0 ? pos.x / pos.containerWidth : 0.5
    const xShift = ratio < 0.2 ? '0%' : ratio > 0.8 ? '-100%' : '-50%'
    el.style.transform = `translateX(${xShift}) translateY(-100%)`
  }, [])

  const handleTileMouseMove = useCallback((e: React.MouseEvent, countryId: string) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    tooltipPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      containerWidth: rect.width,
    }
    // Schedule a single rAF for tooltip position update (no React state change)
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        updateTooltipDOM()
        rafIdRef.current = 0
      })
    }
    // Only trigger React re-render when the hovered country actually changes
    onHoverCountry(countryId)
  }, [onHoverCountry, updateTooltipDOM])

  const handleTileMouseLeave = useCallback(() => {
    tooltipPosRef.current = null
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }
    updateTooltipDOM()
    onHoverCountry(null)
  }, [onHoverCountry, updateTooltipDOM])

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [])

  // Sync tooltip visibility when hoveredCountryId changes externally
  useEffect(() => {
    if (!hoveredCountryId) {
      tooltipPosRef.current = null
      updateTooltipDOM()
    } else {
      // When tooltip mounts for the first time, apply stored position immediately
      updateTooltipDOM()
    }
  }, [hoveredCountryId, updateTooltipDOM])

  // Active hovered item for tooltip
  const activeHoveredItem = hoveredCountryId ? countryItemMap.get(hoveredCountryId) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl p-3 sm:p-6 select-none"
    >
      {/* Subtle Ocean Matrix Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-slate-950/50 pointer-events-none" />

      {/* Floating Region Watermark Labels */}
      <div className="hidden md:block pointer-events-none absolute inset-0 overflow-hidden text-slate-800/40 font-black tracking-widest text-[11px] uppercase">
        <span className="absolute top-5 left-12">Americas</span>
        <span className="absolute top-5 left-[42%]">Europe</span>
        <span className="absolute top-5 right-[24%]">Asia</span>
        <span className="absolute bottom-14 left-[46%]">Africa</span>
        <span className="absolute bottom-8 right-12">Oceania</span>
      </div>

      {/* Horizontal Scrollable Container for Mobile */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div
          className="min-w-[720px] md:min-w-0 w-full aspect-[53/28] grid gap-[2px] sm:gap-[3px] p-2"
          style={{
            gridTemplateColumns: `repeat(${PIXEL_MAP_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${PIXEL_MAP_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {PIXEL_MAP_TILES.map((tile: PixelTile, index: number) => {
            const countryId = tile.id
            const item = countryItemMap.get(countryId)
            const isTracked = tile.isTracked && !!item

            const isHovered = hoveredCountryId === countryId
            const isPinned = pinnedCountryId === countryId
            const isHighlighted = isHovered || isPinned

            // Region filter check
            const isRegionMatch = !item || isAllRegions || activeRegions.includes(item.country.region)

            // Search query check
            const isSearchMatch =
              item &&
              searchLower.length > 0 &&
              (item.country.id.toLowerCase().includes(searchLower) ||
                item.country.nameEn.toLowerCase().includes(searchLower) ||
                item.country.nameKo.toLowerCase().includes(searchLower) ||
                item.country.currencyCode.toLowerCase().includes(searchLower))

            const fillColor = isTracked ? getCountryFill(countryId) : '#1e293b'
            const isAnchor = anchorMap.get(`${tile.c},${tile.r}`) === countryId

            return (
              <div
                key={`${tile.c}-${tile.r}-${index}`}
                style={{
                  gridColumnStart: tile.c + 1,
                  gridRowStart: tile.r + 1,
                }}
                className="relative group/tile"
              >
                <div
                  onClick={() => {
                    if (isTracked && item) {
                      onSelectCountry(item.country)
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isTracked) handleTileMouseMove(e, countryId)
                  }}
                  onMouseLeave={handleTileMouseLeave}
                  style={{
                    backgroundColor: fillColor,
                  }}
                  className={`w-full h-full aspect-square rounded-[3px] sm:rounded-[4px] flex items-center justify-center relative transition-[transform,filter,opacity] duration-150 ${
                    isTracked
                      ? 'cursor-pointer'
                      : 'cursor-default opacity-40 pointer-events-none'
                  } ${
                    !isRegionMatch
                      ? 'opacity-15 grayscale scale-90'
                      : isSearchMatch
                        ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/50 scale-125 z-20'
                        : isHighlighted
                          ? 'ring-2 ring-white shadow-xl shadow-indigo-500/40 scale-125 z-20 brightness-125'
                          : 'hover:brightness-125 hover:scale-115'
                  }`}
                >
                  {/* Subtle top glare highlight for 3D pixel block feel */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[3px]" />

                  {/* Anchor Label (Flag / ISO2) on key centers */}
                  {isTracked && isAnchor && item && (
                    <div className="pointer-events-none z-10 flex items-center justify-center">
                      <span className="text-[7px] sm:text-[9px] font-black text-white/95 font-mono tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {item.country.iso2}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Dynamic Tooltip HUD — positioned via direct DOM control (no state re-render) */}
      {activeHoveredItem && (
        <div
          ref={tooltipRef}
          className="absolute z-30 pointer-events-none"
          style={{
            display: 'none',
            marginBottom: '0.75rem',
            willChange: 'transform',
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl min-w-[210px] max-w-[280px] text-xs space-y-2">
            {/* Header: Flag + Name + Rank */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CountryFlag iso2={activeHoveredItem.country.iso2} className="w-5 h-3.5 rounded-sm shadow-sm" />
                <span className="font-bold text-white text-sm">
                  {getCountryName(activeHoveredItem.country, lang)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({activeHoveredItem.country.id})</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                #{activeHoveredItem.rank}
              </span>
            </div>

            {/* Stats List */}
            <div className="space-y-1">
              <div
                className={`flex items-center justify-between ${
                  metric === 'gdp' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{t.metricTotalGdp}:</span>
                <span className={`font-mono font-bold ${metric === 'gdp' ? 'text-white' : 'text-slate-100'}`}>
                  {formatGdpCompact(activeHoveredItem.totalGdpUsd, baseCurrency, usdToBase, lang)}
                </span>
              </div>
              <div
                className={`flex items-center justify-between ${
                  metric === 'perCapita' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{t.metricPerCapita}:</span>
                <span className={`font-mono ${metric === 'perCapita' ? 'font-bold text-white' : 'text-slate-300'}`}>
                  {formatPerCapita(activeHoveredItem.gdpPerCapitaUsd, baseCurrency, usdToBase, lang)}
                </span>
              </div>
              {activeHoveredItem.growthRatePct !== null && (
                <div
                  className={`flex items-center justify-between ${
                    metric === 'growth' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span>{t.metricGrowth}:</span>
                  <span
                    className={`font-mono font-semibold ${
                      activeHoveredItem.growthRatePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {activeHoveredItem.growthRatePct > 0
                      ? `+${activeHoveredItem.growthRatePct.toFixed(1)}%`
                      : `${activeHoveredItem.growthRatePct.toFixed(1)}%`}
                  </span>
                </div>
              )}
              {activeHoveredItem.inflationRatePct !== null && (
                <div
                  className={`flex items-center justify-between ${
                    metric === 'inflation' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span>{t.metricInflation}:</span>
                  <span
                    className={`font-mono font-semibold ${
                      activeHoveredItem.inflationRatePct < 0
                        ? 'text-purple-400'
                        : activeHoveredItem.inflationRatePct <= 2.5
                        ? 'text-emerald-400'
                        : activeHoveredItem.inflationRatePct <= 4.0
                        ? 'text-cyan-400'
                        : activeHoveredItem.inflationRatePct <= 7.0
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activeHoveredItem.inflationRatePct.toFixed(1)}%
                  </span>
                </div>
              )}
              {metric === 'debt' && activeHoveredItem.debtRatioPct !== null && (
                <div className="flex items-center justify-between text-indigo-300 font-semibold">
                  <span>{t.metricDebt}:</span>
                  <span
                    className={`font-mono font-bold ${
                      activeHoveredItem.debtRatioPct < 60
                        ? 'text-emerald-400'
                        : activeHoveredItem.debtRatioPct < 90
                          ? 'text-amber-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {activeHoveredItem.debtRatioPct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="text-[10px] text-indigo-400 font-medium pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>{t.viewDetailsBtn}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-center text-[10px] text-slate-500 mt-2">
        {lang === 'ko'
          ? '← 좌우로 스크롤하여 세계 지도를 확인하세요 →'
          : lang === 'ja'
            ? '← 左右にスクロールして世界地図を確認できます →'
            : lang === 'es'
              ? '← Desplácese horizontalmente para explorar el mapa →'
              : lang === 'zh'
                ? '← 左右滑动以探索世界地图 →'
                : '← Scroll horizontally to explore the pixel world map →'}
      </div>
    </div>
  )
}


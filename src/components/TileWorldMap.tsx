import React, { useMemo } from 'react'
import { TILE_MAP_COORDS, TILE_GRID_ROWS, TILE_GRID_COLS } from '../data/tileMapData'
import type { CountryMeta, BaseCurrency, Region, Language } from '../types/economics'
import type { CountryRowItem } from './RankingTable'
import { formatGdpCompact, formatPerCapita } from '../utils/formatters'
import { CountryFlag } from './CountryFlag'
import { getCountryName } from '../utils/countryNames'
import type { MapMetric } from './GdpWorldMap'

interface TileWorldMapProps {
  items: CountryRowItem[]
  metric: MapMetric
  baseCurrency: BaseCurrency
  usdToBase: number
  lang: Language
  selectedRegion: Region | 'All'
  searchQuery: string
  hoveredCountryId: string | null
  pinnedCountryId: string | null
  getCountryFill: (countryId: string) => string
  onHoverCountry: (countryId: string | null, mouseEvent?: React.MouseEvent) => void
  onSelectCountry: (country: CountryMeta) => void
}

export const TileWorldMap: React.FC<TileWorldMapProps> = ({
  items,
  metric,
  baseCurrency,
  usdToBase,
  lang,
  selectedRegion,
  searchQuery,
  hoveredCountryId,
  pinnedCountryId,
  getCountryFill,
  onHoverCountry,
  onSelectCountry,
}) => {
  // Fast map lookup
  const itemMap = useMemo(() => {
    const map = new Map<string, CountryRowItem>()
    for (const item of items) {
      map.set(item.country.id, item)
    }
    return map
  }, [items])

  const searchLower = searchQuery.toLowerCase().trim()

  return (
    <div className="relative w-full bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl p-4 sm:p-6 select-none">
      {/* Decorative Ocean & Dot Matrix Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1.5px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Floating Region Labels */}
      <div className="hidden lg:block pointer-events-none absolute inset-0 overflow-hidden text-slate-700/30 font-black tracking-widest text-[13px] uppercase">
        <span className="absolute top-4 left-10">Americas</span>
        <span className="absolute top-4 left-[35%]">Europe</span>
        <span className="absolute top-4 right-[25%]">Asia</span>
        <span className="absolute bottom-16 left-[45%]">Africa</span>
        <span className="absolute bottom-6 right-8">Oceania</span>
      </div>

      {/* Responsive Horizontal Scroll Container for Mobile */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div
          className="min-w-[780px] xl:min-w-0 grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateRows: `repeat(${TILE_GRID_ROWS}, minmax(44px, 1fr))`,
            gridTemplateColumns: `repeat(${TILE_GRID_COLS}, minmax(0, 1fr))`,
          }}
        >
          {TILE_MAP_COORDS.map((coord) => {
            const item = itemMap.get(coord.id)
            if (!item) return null

            const { country, rank, totalGdpUsd, gdpPerCapitaUsd, growthRatePct, debtRatioPct } = item
            const isHovered = hoveredCountryId === country.id
            const isPinned = pinnedCountryId === country.id
            const isSelected = isHovered || isPinned

            // Region filter check
            const isRegionMatch = selectedRegion === 'All' || country.region === selectedRegion

            // Search query check
            const isSearchMatch =
              searchLower.length > 0 &&
              (country.id.toLowerCase().includes(searchLower) ||
                country.nameEn.toLowerCase().includes(searchLower) ||
                country.nameKo.toLowerCase().includes(searchLower) ||
                country.currencyCode.toLowerCase().includes(searchLower))

            const fillColor = getCountryFill(country.id)
            const displayName = getCountryName(country, lang)

            // Format metric label
            let metricDisplay = ''
            if (metric === 'gdp') {
              metricDisplay = formatGdpCompact(totalGdpUsd, baseCurrency, usdToBase, lang)
            } else if (metric === 'perCapita') {
              metricDisplay = formatPerCapita(gdpPerCapitaUsd, baseCurrency, usdToBase, lang)
            } else if (metric === 'growth') {
              metricDisplay =
                growthRatePct !== null ? `${growthRatePct > 0 ? '+' : ''}${growthRatePct.toFixed(1)}%` : 'N/A'
            } else if (metric === 'debt') {
              metricDisplay = debtRatioPct !== null ? `${debtRatioPct.toFixed(1)}%` : 'N/A'
            }

            return (
              <div
                key={country.id}
                style={{
                  gridRowStart: coord.row + 1,
                  gridColumnStart: coord.col + 1,
                }}
                className="relative group"
              >
                <button
                  type="button"
                  onClick={() => onSelectCountry(country)}
                  onMouseEnter={(e) => onHoverCountry(country.id, e)}
                  onMouseLeave={() => onHoverCountry(null)}
                  className={`w-full h-full min-h-[50px] sm:min-h-[56px] rounded-xl sm:rounded-2xl p-1.5 flex flex-col justify-between items-center text-center transition-all duration-200 cursor-pointer shadow-md relative overflow-hidden ${
                    !isRegionMatch ? 'opacity-20 grayscale scale-95' : 'hover:scale-110 hover:-translate-y-1'
                  } ${
                    isSearchMatch
                      ? 'ring-2 ring-cyan-400 shadow-cyan-500/50 scale-105 z-20'
                      : isSelected
                        ? 'ring-2 ring-white shadow-xl shadow-indigo-500/30 z-20'
                        : 'border border-white/10 hover:border-white/40'
                  }`}
                  style={{
                    backgroundColor: fillColor,
                  }}
                  title={`${displayName} (#${rank}) - ${metricDisplay}`}
                >
                  {/* Subtle top glare highlight for 3D tactile tile feel */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-xl" />

                  {/* Top Row: Flag & Rank */}
                  <div className="w-full flex items-center justify-between pointer-events-none z-10 px-0.5">
                    <CountryFlag iso2={country.iso2} className="w-4 h-3 sm:w-5 sm:h-3.5 rounded-sm shadow-sm" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1 py-0.2 rounded bg-black/40 text-white/90 backdrop-blur-xs">
                      #{rank}
                    </span>
                  </div>

                  {/* Center: Country Code */}
                  <div className="z-10 pointer-events-none my-0.5">
                    <span className="text-[11px] sm:text-xs font-black text-white tracking-wider drop-shadow-sm">
                      {country.id}
                    </span>
                  </div>

                  {/* Bottom: Active Metric Value */}
                  <div className="w-full z-10 pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-bold text-white/95 px-1 py-0.5 rounded bg-black/30 backdrop-blur-xs block truncate w-full">
                      {metricDisplay}
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-center text-[10px] text-slate-500 mt-2">
        {lang === 'ko'
          ? '← 좌우로 스크롤하여 세계 각국 타일을 확인하세요 →'
          : lang === 'ja'
            ? '← 左右にスクロールして各国のタイルを確認できます →'
            : '← Scroll horizontally to explore all country tiles →'}
      </div>
    </div>
  )
}

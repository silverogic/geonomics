export interface TileCountryCoord {
  id: string
  row: number
  col: number
}

/**
 * 8x20 Tile Grid cartogram coordinates for 56 global economies.
 * Preserves relative continental geography:
 * - Americas: Left (Cols 2-3)
 * - Europe: Upper-Center (Cols 5-10)
 * - Middle East & Africa: Lower-Center (Cols 9-14)
 * - Asia: Upper/Mid-Right (Cols 11-17)
 * - Oceania: Bottom-Right (Cols 18-19)
 */
export const TILE_MAP_COORDS: TileCountryCoord[] = [
  // Row 0
  { id: 'CAN', row: 0, col: 2 },
  { id: 'NOR', row: 0, col: 7 },
  { id: 'SWE', row: 0, col: 8 },
  { id: 'FIN', row: 0, col: 9 },
  { id: 'RUS', row: 0, col: 12 },

  // Row 1
  { id: 'USA', row: 1, col: 2 },
  { id: 'IRL', row: 1, col: 5 },
  { id: 'GBR', row: 1, col: 6 },
  { id: 'DNK', row: 1, col: 7 },
  { id: 'POL', row: 1, col: 8 },
  { id: 'UKR', row: 1, col: 9 },
  { id: 'KAZ', row: 1, col: 11 },

  // Row 2
  { id: 'MEX', row: 2, col: 2 },
  { id: 'NLD', row: 2, col: 6 },
  { id: 'DEU', row: 2, col: 7 },
  { id: 'CZE', row: 2, col: 8 },
  { id: 'PAK', row: 2, col: 12 },
  { id: 'CHN', row: 2, col: 14 },
  { id: 'KOR', row: 2, col: 16 },
  { id: 'JPN', row: 2, col: 17 },

  // Row 3
  { id: 'COL', row: 3, col: 2 },
  { id: 'BEL', row: 3, col: 5 },
  { id: 'FRA', row: 3, col: 6 },
  { id: 'AUT', row: 3, col: 7 },
  { id: 'HUN', row: 3, col: 8 },
  { id: 'ROU', row: 3, col: 9 },
  { id: 'IND', row: 3, col: 13 },
  { id: 'BGD', row: 3, col: 14 },
  { id: 'TWN', row: 3, col: 16 },

  // Row 4
  { id: 'PER', row: 4, col: 2 },
  { id: 'BRA', row: 4, col: 3 },
  { id: 'PRT', row: 4, col: 5 },
  { id: 'ESP', row: 4, col: 6 },
  { id: 'CHE', row: 4, col: 7 },
  { id: 'ITA', row: 4, col: 8 },
  { id: 'GRC', row: 4, col: 9 },
  { id: 'TUR', row: 4, col: 10 },
  { id: 'ISR', row: 4, col: 11 },
  { id: 'THA', row: 4, col: 14 },
  { id: 'VNM', row: 4, col: 15 },
  { id: 'HKG', row: 4, col: 16 },
  { id: 'PHL', row: 4, col: 17 },

  // Row 5
  { id: 'CHL', row: 5, col: 2 },
  { id: 'ARG', row: 5, col: 3 },
  { id: 'EGY', row: 5, col: 9 },
  { id: 'KWT', row: 5, col: 11 },
  { id: 'SAU', row: 5, col: 12 },
  { id: 'QAT', row: 5, col: 13 },
  { id: 'ARE', row: 5, col: 14 },
  { id: 'MYS', row: 5, col: 15 },

  // Row 6
  { id: 'NGA', row: 6, col: 9 },
  { id: 'SGP', row: 6, col: 15 },
  { id: 'IDN', row: 6, col: 16 },
  { id: 'AUS', row: 6, col: 18 },

  // Row 7
  { id: 'ZAF', row: 7, col: 9 },
  { id: 'NZL', row: 7, col: 19 },
]

export const TILE_GRID_ROWS = 8
export const TILE_GRID_COLS = 20

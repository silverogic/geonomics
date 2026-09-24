/**
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

export const PIXEL_MAP_COLS = 53
export const PIXEL_MAP_ROWS = 28

export const PIXEL_MAP_TILES: PixelTile[] = [
  {
    "c": 7,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 18,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 33,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 1,
    "r": 1,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 2,
    "r": 1,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 3,
    "r": 1,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 4,
    "r": 1,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 1,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 18,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 1,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 1,
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 0,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 1,
    "r": 2,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 2,
    "r": 2,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 3,
    "r": 2,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 4,
    "r": 2,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 5,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 2,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 2,
    "id": "ISL",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 2,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 2,
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 2,
    "id": "FIN",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 2,
    "id": "FIN",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 50,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 52,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 0,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 1,
    "r": 3,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 2,
    "r": 3,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 3,
    "r": 3,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 4,
    "r": 3,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 5,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 3,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 3,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 3,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 3,
    "id": "GBR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 3,
    "id": "DNK",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 3,
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 3,
    "id": "FIN",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 3,
    "id": "EST",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 50,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 52,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 1,
    "r": 4,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 2,
    "r": 4,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 3,
    "r": 4,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 4,
    "r": 4,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 5,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 4,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 4,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 4,
    "id": "IRL",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 4,
    "id": "GBR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 4,
    "id": "NLD",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 4,
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 4,
    "id": "LVA",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 50,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 1,
    "r": 5,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 2,
    "r": 5,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 5,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 5,
    "id": "BEL",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 5,
    "id": "LUX",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 5,
    "id": "DEU",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 5,
    "id": "POL",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 5,
    "id": "LTU",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 5,
    "id": "BLR",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 5,
    "id": "EST",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 5,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 6,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 6,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 6,
    "id": "DEU",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 6,
    "id": "CZE",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 6,
    "id": "SVK",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 6,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 6,
    "id": "LTU",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 6,
    "id": "UZB",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 49,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 7,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 7,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 7,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 7,
    "id": "CHE",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 7,
    "id": "AUT",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 7,
    "id": "HUN",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 7,
    "id": "ROU",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 7,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 7,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 7,
    "id": "MNG",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 7,
    "id": "MNG",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 7,
    "id": "MNG",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 8,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 8,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 8,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 8,
    "id": "SVN",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 8,
    "id": "ITA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 8,
    "id": "SRB",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 8,
    "id": "BGR",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 8,
    "id": "ROU",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 8,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 8,
    "id": "GEO",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 8,
    "id": "AZE",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 8,
    "id": "TKM",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 8,
    "id": "MNG",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 8,
    "id": "KOR",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 8,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 9,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 9,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 9,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 9,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 9,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 9,
    "id": "HRV",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 9,
    "id": "GRC",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 9,
    "id": "GRC",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 9,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 9,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 9,
    "id": "IRQ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 9,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 9,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 9,
    "id": "TKM",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 9,
    "id": "UZB",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 9,
    "id": "UZB",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 9,
    "id": "KOR",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 9,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 9,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 10,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 10,
    "id": "MAR",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 10,
    "id": "MAR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 10,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 10,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 10,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 10,
    "id": "TUN",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 10,
    "id": "CYP",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 10,
    "id": "IRQ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 10,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 10,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 10,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 10,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 10,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 10,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 10,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 11,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 11,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 11,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 11,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 11,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 11,
    "id": "MAR",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 11,
    "id": "MAR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 11,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 11,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 11,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 11,
    "id": "LBY",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 11,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 11,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 11,
    "id": "ISR",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 11,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 11,
    "id": "KWT",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 11,
    "id": "QAT",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 11,
    "id": "BHR",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 11,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 11,
    "id": "NPL",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 11,
    "id": "BGD",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 11,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 11,
    "id": "MAC",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 11,
    "id": "HKG",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 11,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 11,
    "id": "TWN",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 12,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 12,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 12,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 12,
    "id": "DOM",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 12,
    "id": "PRI",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 12,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 12,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 12,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 12,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 12,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 12,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 12,
    "id": "JOR",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 12,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 12,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 12,
    "id": "ARE",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 12,
    "id": "IRN",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 12,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 12,
    "id": "MMR",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 12,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 12,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 12,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 12,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 13,
    "id": "GTM",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 13,
    "id": "CRI",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 13,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 13,
    "id": "DOM",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 13,
    "id": "SEN",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 13,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 13,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 13,
    "id": "MLI",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 13,
    "id": "DZA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 13,
    "id": "NER",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 13,
    "id": "TCD",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 13,
    "id": "LBY",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 13,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 13,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 13,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 13,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 13,
    "id": "OMN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 13,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 13,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 13,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 13,
    "id": "MMR",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 13,
    "id": "THA",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 13,
    "id": "VNM",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 13,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 13,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 14,
    "id": "SLV",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 14,
    "id": "PAN",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 14,
    "id": "NIC",
    "isTracked": false
  },
  {
    "c": 14,
    "r": 14,
    "id": "VEN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 14,
    "id": "VEN",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 14,
    "id": "CIV",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 14,
    "id": "GHA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 14,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 14,
    "id": "CMR",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 14,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 14,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 14,
    "id": "TCD",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 14,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 30,
    "r": 14,
    "id": "ETH",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 14,
    "id": "ETH",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 14,
    "id": "YEM",
    "isTracked": false
  },
  {
    "c": 37,
    "r": 14,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 14,
    "id": "THA",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 14,
    "id": "KHM",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 14,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 14,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 15,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 15,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 15,
    "id": "VEN",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 15,
    "id": "VEN",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 15,
    "id": "GUY",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 15,
    "id": "LBR",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 15,
    "id": "CIV",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 15,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 15,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 15,
    "id": "CAF",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 15,
    "id": "UGA",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 15,
    "id": "SDS",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 15,
    "id": "ETH",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 15,
    "id": "ETH",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 15,
    "id": "LKA",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 15,
    "id": "MYS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 15,
    "id": "SGP",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 15,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 16,
    "id": "ECU",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 16,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 16,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 16,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 16,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 16,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 16,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 16,
    "id": "COD",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 16,
    "id": "GAB",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 16,
    "id": "COG",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 16,
    "id": "COD",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 16,
    "id": "KEN",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 16,
    "id": "KEN",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 16,
    "id": "SOM",
    "isTracked": false
  },
  {
    "c": 40,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 17,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 17,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 17,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 17,
    "id": "GAB",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 17,
    "id": "COD",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 17,
    "id": "COD",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 17,
    "id": "TZA",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 17,
    "id": "KEN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 17,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 17,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 17,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 17,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 17,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 17,
    "id": "PNG",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 18,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 20,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 18,
    "id": "AGO",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 18,
    "id": "AGO",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 18,
    "id": "AGO",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 18,
    "id": "COD",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 18,
    "id": "MWI",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 18,
    "id": "TZA",
    "isTracked": true
  },
  {
    "c": 42,
    "r": 18,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 18,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 18,
    "id": "PNG",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 19,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 19,
    "id": "BOL",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 19,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 19,
    "id": "BOL",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 19,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 19,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 19,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 19,
    "id": "AGO",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 19,
    "id": "AGO",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 19,
    "id": "ZMB",
    "isTracked": false
  },
  {
    "c": 30,
    "r": 19,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 19,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 19,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 44,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 20,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 20,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 20,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 20,
    "id": "PRY",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 20,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 20,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 20,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 20,
    "id": "NAM",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 20,
    "id": "NAM",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 20,
    "id": "BWA",
    "isTracked": false
  },
  {
    "c": 30,
    "r": 20,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 20,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 43,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 21,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 21,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 21,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 21,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 21,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 21,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 21,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 42,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 22,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 22,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 22,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 22,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 22,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 18,
    "r": 22,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 22,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 22,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 22,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 48,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 23,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 23,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 23,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 23,
    "id": "URY",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 23,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 23,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 43,
    "r": 23,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 46,
    "r": 23,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 23,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 23,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 24,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 24,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 24,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 24,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 47,
    "r": 24,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 51,
    "r": 24,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 25,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 25,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 26,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 26,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 27,
    "id": "CHL",
    "isTracked": true
  }
]

export const COUNTRY_LABEL_ANCHORS: Record<string, { c: number; r: number }> = {
  "CAN": { "c": 11, "r": 2 },
  "USA": { "c": 10, "r": 8 },
  "MEX": { "c": 9, "r": 12 },
  "GTM": { "c": 10, "r": 13 },
  "DOM": { "c": 14, "r": 12 },
  "PRI": { "c": 15, "r": 12 },
  "COL": { "c": 13, "r": 15 },
  "VEN": { "c": 14, "r": 14 },
  "ECU": { "c": 12, "r": 16 },
  "PER": { "c": 13, "r": 17 },
  "BRA": { "c": 17, "r": 18 },
  "CHL": { "c": 13, "r": 22 },
  "ARG": { "c": 14, "r": 23 },
  "NOR": { "c": 24, "r": 2 },
  "SWE": { "c": 25, "r": 2 },
  "FIN": { "c": 26, "r": 2 },
  "DNK": { "c": 24, "r": 3 },
  "IRL": { "c": 21, "r": 4 },
  "GBR": { "c": 22, "r": 4 },
  "NLD": { "c": 24, "r": 4 },
  "BEL": { "c": 23, "r": 5 },
  "DEU": { "c": 25, "r": 5 },
  "POL": { "c": 26, "r": 5 },
  "UKR": { "c": 28, "r": 6 },
  "FRA": { "c": 24, "r": 6 },
  "CZE": { "c": 26, "r": 6 },
  "SVK": { "c": 27, "r": 6 },
  "CHE": { "c": 25, "r": 7 },
  "AUT": { "c": 26, "r": 7 },
  "HUN": { "c": 27, "r": 7 },
  "ROU": { "c": 28, "r": 7 },
  "BGR": { "c": 28, "r": 8 },
  "PRT": { "c": 22, "r": 9 },
  "ESP": { "c": 23, "r": 8 },
  "ITA": { "c": 26, "r": 8 },
  "GRC": { "c": 27, "r": 9 },
  "TUR": { "c": 29, "r": 9 },
  "MAR": { "c": 22, "r": 10 },
  "DZA": { "c": 24, "r": 10 },
  "NGA": { "c": 24, "r": 14 },
  "AGO": { "c": 25, "r": 18 },
  "EGY": { "c": 28, "r": 11 },
  "ISR": { "c": 30, "r": 11 },
  "ETH": { "c": 30, "r": 14 },
  "KEN": { "c": 30, "r": 16 },
  "ZAF": { "c": 27, "r": 21 },
  "KAZ": { "c": 33, "r": 5 },
  "UZB": { "c": 33, "r": 6 },
  "IRQ": { "c": 31, "r": 9 },
  "IRN": { "c": 33, "r": 9 },
  "KWT": { "c": 32, "r": 11 },
  "QAT": { "c": 33, "r": 11 },
  "SAU": { "c": 32, "r": 12 },
  "ARE": { "c": 33, "r": 12 },
  "PAK": { "c": 35, "r": 10 },
  "IND": { "c": 36, "r": 12 },
  "BGD": { "c": 38, "r": 11 },
  "RUS": { "c": 38, "r": 2 },
  "CHN": { "c": 40, "r": 8 },
  "KOR": { "c": 44, "r": 8 },
  "JPN": { "c": 47, "r": 8 },
  "HKG": { "c": 42, "r": 11 },
  "TWN": { "c": 44, "r": 11 },
  "THA": { "c": 40, "r": 13 },
  "VNM": { "c": 41, "r": 13 },
  "PHL": { "c": 44, "r": 13 },
  "MYS": { "c": 40, "r": 15 },
  "SGP": { "c": 41, "r": 15 },
  "IDN": { "c": 42, "r": 17 },
  "AUS": { "c": 46, "r": 21 },
  "NZL": { "c": 51, "r": 24 },
  "ISL": { "c": 21, "r": 2 },
  "LUX": { "c": 24, "r": 5 },
  "EST": { "c": 27, "r": 3 },
  "LVA": { "c": 27, "r": 4 },
  "LTU": { "c": 27, "r": 5 },
  "BLR": { "c": 28, "r": 5 },
  "SVN": { "c": 25, "r": 8 },
  "HRV": { "c": 26, "r": 9 },
  "SRB": { "c": 27, "r": 8 },
  "CYP": { "c": 29, "r": 10 },
  "TUN": { "c": 27, "r": 10 },
  "JOR": { "c": 30, "r": 12 },
  "BHR": { "c": 34, "r": 11 },
  "AZE": { "c": 32, "r": 8 },
  "TKM": { "c": 34, "r": 8 },
  "CRI": { "c": 11, "r": 13 },
  "PAN": { "c": 11, "r": 14 },
  "BOL": { "c": 16, "r": 19 },
  "URY": { "c": 16, "r": 23 },
  "CIV": { "c": 22, "r": 14 },
  "GHA": { "c": 23, "r": 14 },
  "CMR": { "c": 25, "r": 14 },
  "COD": { "c": 28, "r": 17 },
  "UGA": { "c": 29, "r": 15 },
  "TZA": { "c": 30, "r": 17 },
  "LKA": { "c": 37, "r": 15 },
  "MMR": { "c": 39, "r": 12 },
  "MAC": { "c": 41, "r": 11 },
  "OMN": { "c": 34, "r": 13 },
  "PRY": { "c": 16, "r": 20 },
  "KHM": { "c": 41, "r": 14 },
  "NPL": { "c": 37, "r": 11 },
  "SEN": { "c": 22, "r": 13 },
  "GUY": { "c": 16, "r": 15 },
  "PNG": { "c": 47, "r": 17 },
  "GEO": { "c": 31, "r": 8 },
  "MNG": { "c": 40, "r": 7 },
  "SLV": { "c": 10, "r": 14 },
  "LBY": { "c": 27, "r": 11 }
}

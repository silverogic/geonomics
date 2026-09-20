/**
 * Pixel Grid World Map Data (46 cols x 23 rows)
 * Recreates the iconic pixel/dot world map silhouette with interactive country tiles.
 */
export interface PixelTile {
  c: number
  r: number
  id: string
  isTracked: boolean
}

export const PIXEL_MAP_COLS = 46
export const PIXEL_MAP_ROWS = 23

export const PIXEL_MAP_TILES: PixelTile[] = [
  {
    "c": 6,
    "r": 0,
    "id": "CAN",
    "isTracked": true
  },
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
    "c": 10,
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
    "c": 15,
    "r": 0,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 16,
    "r": 0,
    "id": "GRL",
    "isTracked": false
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
    "c": 29,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 0,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 0,
    "id": "RUS",
    "isTracked": true
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
    "c": 35,
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
    "c": 37,
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
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 5,
    "r": 1,
    "id": "CAN",
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
    "c": 15,
    "r": 1,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 16,
    "r": 1,
    "id": "GRL",
    "isTracked": false
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
    "c": 24,
    "r": 1,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 1,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 26,
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
    "c": 31,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 32,
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
    "c": 34,
    "r": 1,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
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
    "id": "CAN",
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
    "c": 15,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 16,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 17,
    "r": 2,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 2,
    "id": "ISL",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 2,
    "id": "ISL",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 2,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 2,
    "id": "SWE",
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
    "id": "FIN",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 2,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 2,
    "id": "RUS",
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
    "id": "CAN",
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
    "c": 16,
    "r": 3,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 3,
    "id": "DNK",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 3,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 3,
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 3,
    "id": "FIN",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 3,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 3,
    "id": "RUS",
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
    "c": 12,
    "r": 4,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 13,
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
    "c": 20,
    "r": 4,
    "id": "IRL",
    "isTracked": true
  },
  {
    "c": 21,
    "r": 4,
    "id": "GBR",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 4,
    "id": "NLD",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 4,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 4,
    "id": "POL",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 4,
    "id": "EST",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 4,
    "id": "RUS",
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
    "id": "KAZ",
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
    "c": 42,
    "r": 4,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 5,
    "r": 5,
    "id": "CAN",
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
    "id": "USA",
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
    "c": 13,
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
    "c": 21,
    "r": 5,
    "id": "BEL",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 5,
    "id": "BEL",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 5,
    "id": "DEU",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 5,
    "id": "CZE",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 5,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 5,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 5,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 5,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 5,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 5,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 5,
    "id": "RUS",
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
    "c": 42,
    "r": 5,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 6,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 6,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 6,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 6,
    "id": "USA",
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
    "c": 15,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 6,
    "id": "CHE",
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
    "id": "AUT",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 6,
    "id": "HUN",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 6,
    "id": "ROU",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 6,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 6,
    "id": "MNG",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 6,
    "id": "MNG",
    "isTracked": false
  },
  {
    "c": 36,
    "r": 6,
    "id": "MNG",
    "isTracked": false
  },
  {
    "c": 37,
    "r": 6,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 6,
    "id": "CHN",
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
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 7,
    "id": "USA",
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
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 7,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 7,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 20,
    "r": 7,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 21,
    "r": 7,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 7,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 7,
    "id": "ITA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 7,
    "id": "ITA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 7,
    "id": "GRC",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 7,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 7,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 7,
    "id": "TKM",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 7,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 7,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 7,
    "id": "KOR",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 7,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 8,
    "id": "USA",
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
    "c": 21,
    "r": 8,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 8,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 8,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 8,
    "id": "GRC",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 8,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 8,
    "id": "SYR",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 8,
    "id": "IRN",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 8,
    "id": "IRN",
    "isTracked": false
  },
  {
    "c": 30,
    "r": 8,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 8,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 8,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 8,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 8,
    "id": "KOR",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 8,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 8,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 9,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 9,
    "id": "MEX",
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
    "c": 20,
    "r": 9,
    "id": "MAR",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 9,
    "id": "MAR",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 9,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 9,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 9,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 9,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 9,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 9,
    "id": "ISR",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 9,
    "id": "KWT",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 9,
    "id": "KWT",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 9,
    "id": "QAT",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 9,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 9,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 9,
    "id": "BGD",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 9,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 9,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 9,
    "id": "HKG",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 9,
    "id": "TWN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 10,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 10,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 10,
    "id": "CUB",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 10,
    "id": "MAR",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 10,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 10,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 10,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 10,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 10,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 10,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 10,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 10,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 10,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 10,
    "id": "ARE",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 10,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 10,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 10,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 10,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 10,
    "id": "VNM",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 10,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 10,
    "id": "CHN",
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
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 11,
    "id": "HND",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 11,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 11,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 11,
    "id": "BFA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 11,
    "id": "NER",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 11,
    "id": "NER",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 11,
    "id": "TCD",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 11,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 11,
    "id": "ERI",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 11,
    "id": "YEM",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 11,
    "id": "OMN",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 11,
    "id": "MMR",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 11,
    "id": "THA",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 11,
    "id": "VNM",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 11,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 12,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 12,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 12,
    "id": "VEN",
    "isTracked": false
  },
  {
    "c": 14,
    "r": 12,
    "id": "GUY",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 12,
    "id": "SLE",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 12,
    "id": "BFA",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 12,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 12,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 12,
    "id": "CAF",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 12,
    "id": "SDS",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 12,
    "id": "SDS",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 12,
    "id": "ETH",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 12,
    "id": "SOL",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 12,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 13,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 13,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 13,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 13,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 13,
    "id": "GNQ",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 13,
    "id": "COG",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 13,
    "id": "COD",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 13,
    "id": "UGA",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 13,
    "id": "KEN",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 13,
    "id": "SOM",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 13,
    "id": "MYS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 13,
    "id": "SGP",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 13,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 14,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 14,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 14,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 14,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 14,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 14,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 14,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 14,
    "id": "GAB",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 14,
    "id": "COG",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 14,
    "id": "COD",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 14,
    "id": "BDI",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 14,
    "id": "KEN",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 14,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 14,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 14,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 14,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 14,
    "id": "PNG",
    "isTracked": false
  },
  {
    "c": 42,
    "r": 14,
    "id": "PNG",
    "isTracked": false
  },
  {
    "c": 12,
    "r": 15,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 15,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 15,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 15,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 15,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 17,
    "r": 15,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 15,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 15,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 15,
    "id": "MWI",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 15,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 15,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 38,
    "r": 15,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 15,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 15,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 15,
    "id": "PNG",
    "isTracked": false
  },
  {
    "c": 13,
    "r": 16,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 16,
    "id": "PRY",
    "isTracked": false
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
    "c": 24,
    "r": 16,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 16,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 16,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 16,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 16,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 38,
    "r": 16,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 16,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 16,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 16,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 17,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 17,
    "id": "ARG",
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
    "c": 24,
    "r": 17,
    "id": "NAM",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 17,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 17,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 17,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 37,
    "r": 17,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 17,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 17,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 17,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 17,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 18,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 18,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 18,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 15,
    "r": 18,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 18,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 18,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 18,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 18,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 18,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 18,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 18,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 18,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 19,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 19,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 19,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 19,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 20,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 20,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 21,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 21,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 22,
    "id": "CHL",
    "isTracked": true
  }
]

export const COUNTRY_LABEL_ANCHORS: Record<string, { c: number; r: number }> = {
  "USA": {
    "c": 9,
    "r": 5
  },
  "CHN": {
    "c": 35,
    "r": 7
  },
  "DEU": {
    "c": 23,
    "r": 5
  },
  "JPN": {
    "c": 41,
    "r": 6
  },
  "IND": {
    "c": 31,
    "r": 10
  },
  "GBR": {
    "c": 21,
    "r": 4
  },
  "FRA": {
    "c": 22,
    "r": 6
  },
  "ITA": {
    "c": 23,
    "r": 7
  },
  "BRA": {
    "c": 15,
    "r": 15
  },
  "CAN": {
    "c": 10,
    "r": 2
  },
  "RUS": {
    "c": 33,
    "r": 2
  },
  "MEX": {
    "c": 7,
    "r": 9
  },
  "AUS": {
    "c": 40,
    "r": 18
  },
  "KOR": {
    "c": 38,
    "r": 7
  },
  "ESP": {
    "c": 20,
    "r": 7
  },
  "IDN": {
    "c": 37,
    "r": 14
  },
  "TUR": {
    "c": 27,
    "r": 7
  },
  "NLD": {
    "c": 22,
    "r": 4
  },
  "SAU": {
    "c": 29,
    "r": 10
  },
  "CHE": {
    "c": 22,
    "r": 6
  },
  "POL": {
    "c": 24,
    "r": 4
  },
  "SWE": {
    "c": 23,
    "r": 2
  },
  "BEL": {
    "c": 21,
    "r": 5
  },
  "ARG": {
    "c": 13,
    "r": 19
  },
  "IRL": {
    "c": 20,
    "r": 4
  },
  "NOR": {
    "c": 22,
    "r": 2
  },
  "AUT": {
    "c": 24,
    "r": 6
  },
  "ISR": {
    "c": 27,
    "r": 9
  },
  "ARE": {
    "c": 30,
    "r": 10
  },
  "SGP": {
    "c": 36,
    "r": 13
  },
  "MYS": {
    "c": 35,
    "r": 13
  },
  "ZAF": {
    "c": 25,
    "r": 18
  },
  "PHL": {
    "c": 39,
    "r": 11
  },
  "DNK": {
    "c": 22,
    "r": 3
  },
  "EGY": {
    "c": 26,
    "r": 9
  },
  "BGD": {
    "c": 33,
    "r": 9
  },
  "VNM": {
    "c": 36,
    "r": 11
  },
  "NGA": {
    "c": 22,
    "r": 12
  },
  "THA": {
    "c": 35,
    "r": 11
  },
  "HKG": {
    "c": 37,
    "r": 9
  },
  "NZL": {
    "c": 44,
    "r": 20
  },
  "FIN": {
    "c": 25,
    "r": 2
  },
  "PRT": {
    "c": 19,
    "r": 7
  },
  "COL": {
    "c": 11,
    "r": 12
  },
  "CHL": {
    "c": 12,
    "r": 18
  },
  "CZE": {
    "c": 24,
    "r": 5
  },
  "ROU": {
    "c": 26,
    "r": 6
  },
  "PER": {
    "c": 11,
    "r": 14
  },
  "GRC": {
    "c": 25,
    "r": 7
  },
  "QAT": {
    "c": 30,
    "r": 9
  },
  "HUN": {
    "c": 25,
    "r": 6
  },
  "KWT": {
    "c": 29,
    "r": 9
  },
  "UKR": {
    "c": 26,
    "r": 5
  },
  "TWN": {
    "c": 38,
    "r": 9
  },
  "PAK": {
    "c": 30,
    "r": 8
  },
  "KAZ": {
    "c": 30,
    "r": 4
  }
}

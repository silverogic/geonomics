/**
 * Pixel Grid World Map Data (46 cols x 26 rows)
 * Recreates the iconic pixel/dot world map silhouette with interactive country tiles.
 */
export interface PixelTile {
  c: number
  r: number
  id: string
  isTracked: boolean
}

export const PIXEL_MAP_COLS = 46
export const PIXEL_MAP_ROWS = 26

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
    "c": 25,
    "r": 1,
    "id": "NOR",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 1,
    "id": "NOR",
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
    "c": 14,
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
    "c": 18,
    "r": 2,
    "id": "GRL",
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
    "c": 15,
    "r": 3,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 16,
    "r": 3,
    "id": "GRL",
    "isTracked": false
  },
  {
    "c": 19,
    "r": 3,
    "id": "ISL",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 3,
    "id": "ISL",
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
    "c": 3,
    "r": 4,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 4,
    "r": 4,
    "id": "CAN",
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
    "c": 16,
    "r": 4,
    "id": "GRL",
    "isTracked": false
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
    "id": "SWE",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 4,
    "id": "FIN",
    "isTracked": true
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
    "c": 1,
    "r": 5,
    "id": "USA",
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
    "id": "GBR",
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
    "id": "POL",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 5,
    "id": "POL",
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
    "id": "RUS",
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
    "id": "RUS",
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
    "c": 43,
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
    "c": 14,
    "r": 6,
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 21,
    "r": 6,
    "id": "IRL",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 6,
    "id": "FRA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 6,
    "id": "DEU",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 6,
    "id": "CZE",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 6,
    "id": "UKR",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 6,
    "id": "UKR",
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
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 6,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 6,
    "id": "RUS",
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
    "id": "CAN",
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
    "c": 22,
    "r": 7,
    "id": "CHE",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 7,
    "id": "AUT",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 7,
    "id": "AUT",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 7,
    "id": "HUN",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 7,
    "id": "ROU",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 7,
    "id": "KAZ",
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
    "id": "KAZ",
    "isTracked": true
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
    "id": "KAZ",
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
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 7,
    "id": "MNG",
    "isTracked": false
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
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 7,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 41,
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
    "id": "CAN",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 8,
    "id": "USA",
    "isTracked": true
  },
  {
    "c": 19,
    "r": 8,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 20,
    "r": 8,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 21,
    "r": 8,
    "id": "PRT",
    "isTracked": true
  },
  {
    "c": 22,
    "r": 8,
    "id": "ESP",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 8,
    "id": "ITA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 8,
    "id": "ITA",
    "isTracked": true
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
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 8,
    "id": "RUS",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 8,
    "id": "TKM",
    "isTracked": false
  },
  {
    "c": 31,
    "r": 8,
    "id": "KAZ",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 8,
    "id": "CHN",
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
    "c": 40,
    "r": 8,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 6,
    "r": 9,
    "id": "USA",
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
    "c": 21,
    "r": 9,
    "id": "PRT",
    "isTracked": true
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
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 9,
    "id": "ITA",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 9,
    "id": "GRC",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 9,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 9,
    "id": "TUR",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 9,
    "id": "IRN",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 9,
    "id": "IRN",
    "isTracked": false
  },
  {
    "c": 30,
    "r": 9,
    "id": "PAK",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 9,
    "id": "PAK",
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
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 9,
    "id": "CHN",
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
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 9,
    "id": "KOR",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 9,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 9,
    "id": "JPN",
    "isTracked": true
  },
  {
    "c": 7,
    "r": 10,
    "id": "MEX",
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
    "c": 21,
    "r": 10,
    "id": "MAR",
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
    "id": "LBY",
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
    "id": "ISR",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 10,
    "id": "IRN",
    "isTracked": false
  },
  {
    "c": 29,
    "r": 10,
    "id": "KWT",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 10,
    "id": "QAT",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 10,
    "id": "PAK",
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
    "id": "BGD",
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
    "id": "CHN",
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
    "id": "HKG",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 10,
    "id": "TWN",
    "isTracked": true
  },
  {
    "c": 8,
    "r": 11,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 9,
    "r": 11,
    "id": "MEX",
    "isTracked": true
  },
  {
    "c": 20,
    "r": 11,
    "id": "MAR",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 11,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 11,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 11,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 11,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 11,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 11,
    "id": "EGY",
    "isTracked": true
  },
  {
    "c": 27,
    "r": 11,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 11,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 11,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 30,
    "r": 11,
    "id": "ARE",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 11,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 11,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 11,
    "id": "CHN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 11,
    "id": "CHN",
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
    "c": 12,
    "r": 12,
    "id": "CUB",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 12,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 12,
    "id": "MRT",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 12,
    "id": "DZA",
    "isTracked": false
  },
  {
    "c": 23,
    "r": 12,
    "id": "NER",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 12,
    "id": "NER",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 12,
    "id": "LBY",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 12,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 12,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 12,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 29,
    "r": 12,
    "id": "SAU",
    "isTracked": true
  },
  {
    "c": 31,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 32,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 33,
    "r": 12,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 34,
    "r": 12,
    "id": "MMR",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 12,
    "id": "THA",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 12,
    "id": "VNM",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 12,
    "id": "PHL",
    "isTracked": true
  },
  {
    "c": 10,
    "r": 13,
    "id": "GTM",
    "isTracked": false
  },
  {
    "c": 11,
    "r": 13,
    "id": "HND",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 13,
    "id": "GNB",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 13,
    "id": "BFA",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 13,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 13,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 13,
    "id": "CMR",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 13,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 13,
    "id": "SDN",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 13,
    "id": "ETH",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 13,
    "id": "YEM",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 13,
    "id": "IND",
    "isTracked": true
  },
  {
    "c": 35,
    "r": 13,
    "id": "THA",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 13,
    "id": "VNM",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 14,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 14,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 14,
    "id": "COL",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 14,
    "id": "GUY",
    "isTracked": false
  },
  {
    "c": 15,
    "r": 14,
    "id": "SUR",
    "isTracked": false
  },
  {
    "c": 20,
    "r": 14,
    "id": "SLE",
    "isTracked": false
  },
  {
    "c": 21,
    "r": 14,
    "id": "LBR",
    "isTracked": false
  },
  {
    "c": 22,
    "r": 14,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 23,
    "r": 14,
    "id": "NGA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 14,
    "id": "CAF",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 14,
    "id": "SDS",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 14,
    "id": "SDS",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 14,
    "id": "ETH",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 14,
    "id": "ETH",
    "isTracked": false
  },
  {
    "c": 32,
    "r": 14,
    "id": "LKA",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 14,
    "id": "MYS",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 14,
    "id": "SGP",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 14,
    "id": "MYS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 14,
    "id": "PHL",
    "isTracked": true
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
    "id": "BRA",
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
    "c": 23,
    "r": 15,
    "id": "GNQ",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 15,
    "id": "COG",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 15,
    "id": "COD",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 15,
    "id": "UGA",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 15,
    "id": "KEN",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 15,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 36,
    "r": 15,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 15,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 11,
    "r": 16,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 16,
    "id": "PER",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 16,
    "id": "BRA",
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
    "c": 24,
    "r": 16,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 16,
    "id": "COD",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 16,
    "id": "TZA",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 16,
    "id": "KEN",
    "isTracked": false
  },
  {
    "c": 35,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 16,
    "id": "IDN",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 16,
    "id": "PNG",
    "isTracked": false
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
    "id": "BRA",
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
    "c": 24,
    "r": 17,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 17,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 17,
    "id": "MWI",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 17,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 38,
    "r": 17,
    "id": "IDN",
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
    "c": 24,
    "r": 18,
    "id": "AGO",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 18,
    "id": "ZMB",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 18,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 27,
    "r": 18,
    "id": "MOZ",
    "isTracked": false
  },
  {
    "c": 28,
    "r": 18,
    "id": "MDG",
    "isTracked": false
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
    "c": 15,
    "r": 19,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 16,
    "r": 19,
    "id": "BRA",
    "isTracked": true
  },
  {
    "c": 24,
    "r": 19,
    "id": "NAM",
    "isTracked": false
  },
  {
    "c": 25,
    "r": 19,
    "id": "BWA",
    "isTracked": false
  },
  {
    "c": 26,
    "r": 19,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 28,
    "r": 19,
    "id": "MDG",
    "isTracked": false
  },
  {
    "c": 37,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 19,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 19,
    "id": "AUS",
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
    "c": 43,
    "r": 19,
    "id": "NCL",
    "isTracked": false
  },
  {
    "c": 12,
    "r": 20,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 20,
    "id": "ARG",
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
    "c": 24,
    "r": 20,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 20,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 26,
    "r": 20,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 20,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 21,
    "id": "ARG",
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
    "id": "URY",
    "isTracked": false
  },
  {
    "c": 24,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 25,
    "r": 21,
    "id": "ZAF",
    "isTracked": true
  },
  {
    "c": 37,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 38,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 39,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 21,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 21,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 22,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 14,
    "r": 22,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 40,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 22,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 22,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 45,
    "r": 22,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 23,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 41,
    "r": 23,
    "id": "AUS",
    "isTracked": true
  },
  {
    "c": 44,
    "r": 23,
    "id": "NZL",
    "isTracked": true
  },
  {
    "c": 12,
    "r": 24,
    "id": "CHL",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 24,
    "id": "ARG",
    "isTracked": true
  },
  {
    "c": 13,
    "r": 25,
    "id": "CHL",
    "isTracked": true
  }
]

export const COUNTRY_LABEL_ANCHORS: Record<string, { c: number; r: number }> = {
  "CAN": { "c": 10, "r": 2 },
  "NOR": { "c": 22, "r": 2 },
  "SWE": { "c": 23, "r": 2 },
  "FIN": { "c": 25, "r": 2 },
  "RUS": { "c": 33, "r": 2 },
  "DNK": { "c": 22, "r": 3 },
  "IRL": { "c": 20, "r": 4 },
  "GBR": { "c": 21, "r": 4 },
  "NLD": { "c": 22, "r": 4 },
  "BEL": { "c": 21, "r": 5 },
  "DEU": { "c": 23, "r": 5 },
  "POL": { "c": 24, "r": 5 },
  "UKR": { "c": 26, "r": 5 },
  "KAZ": { "c": 30, "r": 5 },
  "USA": { "c": 9, "r": 6 },
  "FRA": { "c": 22, "r": 6 },
  "CZE": { "c": 24, "r": 6 },
  "CHE": { "c": 22, "r": 7 },
  "AUT": { "c": 24, "r": 7 },
  "HUN": { "c": 25, "r": 7 },
  "ROU": { "c": 26, "r": 7 },
  "JPN": { "c": 41, "r": 7 },
  "PRT": { "c": 19, "r": 8 },
  "ESP": { "c": 20, "r": 8 },
  "ITA": { "c": 23, "r": 8 },
  "GRC": { "c": 25, "r": 8 },
  "TUR": { "c": 27, "r": 8 },
  "CHN": { "c": 35, "r": 8 },
  "KOR": { "c": 38, "r": 8 },
  "PAK": { "c": 30, "r": 9 },
  "MEX": { "c": 7, "r": 10 },
  "EGY": { "c": 26, "r": 10 },
  "ISR": { "c": 27, "r": 10 },
  "KWT": { "c": 29, "r": 10 },
  "QAT": { "c": 30, "r": 10 },
  "BGD": { "c": 33, "r": 10 },
  "HKG": { "c": 37, "r": 10 },
  "TWN": { "c": 38, "r": 10 },
  "SAU": { "c": 29, "r": 11 },
  "ARE": { "c": 30, "r": 11 },
  "IND": { "c": 31, "r": 11 },
  "THA": { "c": 35, "r": 12 },
  "VNM": { "c": 36, "r": 12 },
  "PHL": { "c": 39, "r": 12 },
  "NGA": { "c": 22, "r": 13 },
  "COL": { "c": 11, "r": 14 },
  "MYS": { "c": 35, "r": 14 },
  "SGP": { "c": 36, "r": 14 },
  "PER": { "c": 11, "r": 16 },
  "IDN": { "c": 37, "r": 16 },
  "BRA": { "c": 15, "r": 17 },
  "CHL": { "c": 12, "r": 20 },
  "ZAF": { "c": 25, "r": 20 },
  "AUS": { "c": 40, "r": 20 },
  "ARG": { "c": 13, "r": 21 },
  "NZL": { "c": 44, "r": 22 }
}

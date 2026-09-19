import stockPricesDataJson from './stockPricesData.json'

export interface StockPoint {
  date: string
  close: number
}

export interface StockPriceInfo {
  countryId: string
  nameEn: string
  nameKo: string
  ticker: string
  isSupported: boolean
  fallbackReasonEn?: string
  fallbackReasonKo?: string
  currency: string
  currentPrice: number
  changePct: number
  points: StockPoint[]
}

let STOCK_DATA: Record<string, StockPriceInfo> = stockPricesDataJson as unknown as Record<string, StockPriceInfo>

export const getStockPriceData = (countryId: string): StockPriceInfo | undefined => {
  return STOCK_DATA[countryId] || STOCK_DATA[countryId.toUpperCase()]
}

export const getAllStockPrices = (): Record<string, StockPriceInfo> => {
  return STOCK_DATA
}

export const updateStockPriceData = (newData: Record<string, StockPriceInfo>) => {
  STOCK_DATA = { ...STOCK_DATA, ...newData }
}

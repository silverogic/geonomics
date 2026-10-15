import stockPricesDataJson from '../../public/api/v1/stocks.json'

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
  changePct: number // 1-Day daily change percentage (전일 대비 등락률)
  changePct30d?: number // 30-Day cumulative change percentage (30일 누적 등락률)
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

export const CURRENT_YEAR_NUM = new Date().getFullYear()
export const CURRENT_YEAR_STR = String(CURRENT_YEAR_NUM)

export const CURRENT_MINUS_1_NUM = CURRENT_YEAR_NUM - 1
export const CURRENT_MINUS_1_STR = String(CURRENT_MINUS_1_NUM)

export const CURRENT_MINUS_2_NUM = CURRENT_YEAR_NUM - 2
export const CURRENT_MINUS_2_STR = String(CURRENT_MINUS_2_NUM)

export const DEFAULT_ECONOMIC_YEAR = CURRENT_YEAR_STR // e.g. "2026"

export interface EconomicYearOption {
  year: string
  yearNum: number
  offset: number
  labelKey: 'yearActual' | 'yearEstimate' | 'yearProjection'
}

/**
 * Chronological order: [2024 실적 | 2025 추정 | 2026 전망]
 * Dynamically anchored to: [Current-2 | Current-1 | Current]
 */
export const ECONOMIC_YEAR_OPTIONS: EconomicYearOption[] = [
  {
    year: CURRENT_MINUS_2_STR,
    yearNum: CURRENT_MINUS_2_NUM,
    offset: -2,
    labelKey: 'yearActual',
  },
  {
    year: CURRENT_MINUS_1_STR,
    yearNum: CURRENT_MINUS_1_NUM,
    offset: -1,
    labelKey: 'yearEstimate',
  },
  {
    year: CURRENT_YEAR_STR,
    yearNum: CURRENT_YEAR_NUM,
    offset: 0,
    labelKey: 'yearProjection',
  },
]

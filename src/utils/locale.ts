import type { Language, BaseCurrency } from '../types/economics'

const STORAGE_LANG_KEY = 'geonomics_lang'
const STORAGE_CURRENCY_KEY = 'geonomics_base_currency'

/**
 * Detects initial language based on explicit user preference (localStorage)
 * or browser navigator language settings.
 */
export function detectBrowserLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_LANG_KEY)
    if (saved === 'ko' || saved === 'en' || saved === 'ja' || saved === 'es' || saved === 'zh') {
      return saved
    }

    if (typeof navigator !== 'undefined') {
      const candidates = [
        navigator.language,
        ...(navigator.languages || []),
      ].filter(Boolean)

      for (const cand of candidates) {
        const lower = cand.toLowerCase()
        if (lower.startsWith('ko')) {
          return 'ko'
        }
        if (lower.startsWith('ja')) {
          return 'ja'
        }
        if (lower.startsWith('zh')) {
          return 'zh'
        }
        if (lower.startsWith('es')) {
          return 'es'
        }
      }

      // TimeZone & geographic hints for automatic language selection
      const timeZone = (Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || '').toLowerCase()
      if (timeZone.includes('seoul')) return 'ko'
      if (timeZone.includes('tokyo')) return 'ja'
      if (timeZone.includes('shanghai') || timeZone.includes('beijing') || timeZone.includes('taipei') || timeZone.includes('hong_kong')) return 'zh'
      if (
        timeZone.includes('madrid') ||
        timeZone.includes('mexico') ||
        timeZone.includes('buenos_aires') ||
        timeZone.includes('bogota') ||
        timeZone.includes('santiago') ||
        timeZone.includes('lima') ||
        timeZone.includes('caracas')
      ) {
        return 'es'
      }
    }
  }

  return 'en'
}

/**
 * Detects appropriate base currency based on explicit user preference
 * or browser locale and geographic hints.
 */
export function detectBrowserBaseCurrency(): BaseCurrency {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY)
    if (saved && ['USD', 'EUR', 'KRW', 'JPY', 'GBP', 'CNY'].includes(saved)) {
      return saved as BaseCurrency
    }

    if (typeof navigator !== 'undefined') {
      const locale = (navigator.language || '').toLowerCase()
      const timeZone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || ''

      // Korea detection
      if (locale.includes('kr') || locale.startsWith('ko') || timeZone.includes('Seoul')) {
        return 'KRW'
      }

      // Japan detection
      if (locale.includes('jp') || locale.startsWith('ja') || timeZone.includes('Tokyo')) {
        return 'JPY'
      }

      // United Kingdom detection
      if (locale.includes('gb') || locale === 'en-gb' || timeZone.includes('London')) {
        return 'GBP'
      }

      // China detection
      if (locale.includes('cn') || locale.startsWith('zh') || timeZone.includes('Shanghai')) {
        return 'CNY'
      }

      // Eurozone countries detection
      const eurozoneHints = ['de', 'fr', 'es', 'it', 'nl', 'be', 'at', 'ie', 'fi', 'pt', 'gr', 'paris', 'berlin', 'rome', 'madrid', 'amsterdam', 'brussels']
      if (eurozoneHints.some((hint) => locale.includes(hint) || timeZone.toLowerCase().includes(hint))) {
        return 'EUR'
      }
    }
  }

  return 'USD'
}

/**
 * Persists user-selected language to localStorage and updates HTML element.
 */
export function saveLanguagePreference(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LANG_KEY, lang)
    document.documentElement.lang = lang
  }
}

/**
 * Persists user-selected base currency to localStorage.
 */
export function saveBaseCurrencyPreference(currency: BaseCurrency): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CURRENCY_KEY, currency)
  }
}

/**
 * Detects the user's localized home country code (ISO-3) from browser locale and timezone hints.
 * Returns matching country ID (e.g. 'KOR', 'JPN', 'USA', 'DEU', 'GBR') or defaults to 'KOR'.
 */
export function detectLocalCountryId(): string {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const locale = (navigator.language || '').toLowerCase()
    const timeZone = (Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || '').toLowerCase()

    // Check exact regional tag (e.g., 'en-US' -> 'US', 'ko-KR' -> 'KR')
    const match = locale.match(/[-_]([a-z]{2})\b/i)
    const regionIso2 = match ? match[1].toUpperCase() : ''

    const regionToId: Record<string, string> = {
      KR: 'KOR',
      US: 'USA',
      JP: 'JPN',
      CN: 'CHN',
      GB: 'GBR',
      DE: 'DEU',
      FR: 'FRA',
      IT: 'ITA',
      CA: 'CAN',
      AU: 'AUS',
      BR: 'BRA',
      IN: 'IND',
      ES: 'ESP',
      MX: 'MEX',
      RU: 'RUS',
      ID: 'IDN',
      NL: 'NLD',
      CH: 'CHE',
      SA: 'SAU',
      TR: 'TUR',
      TW: 'TWN',
      SG: 'SGP',
      VN: 'VNM',
      TH: 'THA',
      ZA: 'ZAF',
      NZ: 'NZL',
    }

    if (regionIso2 && regionToId[regionIso2]) {
      return regionToId[regionIso2]
    }

    // Timezone hints
    if (timeZone.includes('seoul')) return 'KOR'
    if (timeZone.includes('tokyo')) return 'JPN'
    if (timeZone.includes('london')) return 'GBR'
    if (timeZone.includes('berlin')) return 'DEU'
    if (timeZone.includes('paris')) return 'FRA'
    if (timeZone.includes('shanghai') || timeZone.includes('beijing') || timeZone.includes('hong_kong')) return 'CHN'
    if (timeZone.includes('sydney') || timeZone.includes('melbourne')) return 'AUS'
    if (timeZone.includes('toronto') || timeZone.includes('vancouver')) return 'CAN'
    if (timeZone.includes('new_york') || timeZone.includes('chicago') || timeZone.includes('los_angeles')) return 'USA'
    if (timeZone.includes('sao_paulo')) return 'BRA'
    if (timeZone.includes('kolkata')) return 'IND'

    if (timeZone.includes('madrid')) return 'ESP'
    if (timeZone.includes('mexico')) return 'MEX'
    if (timeZone.includes('buenos_aires')) return 'ARG'
    if (timeZone.includes('bogota')) return 'COL'
    if (timeZone.includes('santiago')) return 'CHL'
    if (timeZone.includes('lima')) return 'PER'

    // Language prefix hints
    if (locale.startsWith('ko')) return 'KOR'
    if (locale.startsWith('ja')) return 'JPN'
    if (locale.startsWith('zh')) return 'CHN'
    if (locale.startsWith('es')) return 'ESP'
    if (locale.startsWith('de')) return 'DEU'
    if (locale.startsWith('fr')) return 'FRA'
  }

  return 'KOR'
}


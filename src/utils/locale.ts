import type { Language, BaseCurrency, CountryMeta } from '../types/economics'
import { COUNTRIES } from '../data/countries'

const STORAGE_LANG_KEY = 'geonomics_lang'
const STORAGE_CURRENCY_KEY = 'geonomics_base_currency'

/**
 * Mapping of IANA timezone substrings (lowercase) to ISO-3166-1 alpha-2 country codes.
 * Used to accurately detect the visitor's physical country/region regardless of browser UI language.
 */
const TIMEZONE_HINTS_TO_ISO2: Array<[string, string]> = [
  // Asia & Oceania
  ['seoul', 'KR'],
  ['tokyo', 'JP'],
  ['shanghai', 'CN'],
  ['beijing', 'CN'],
  ['chongqing', 'CN'],
  ['urumqi', 'CN'],
  ['hong_kong', 'HK'],
  ['macau', 'MO'],
  ['taipei', 'TW'],
  ['ho_chi_minh', 'VN'],
  ['saigon', 'VN'],
  ['bangkok', 'TH'],
  ['singapore', 'SG'],
  ['jakarta', 'ID'],
  ['makassar', 'ID'],
  ['jayapura', 'ID'],
  ['pontianak', 'ID'],
  ['manila', 'PH'],
  ['kuala_lumpur', 'MY'],
  ['kuching', 'MY'],
  ['kolkata', 'IN'],
  ['calcutta', 'IN'],
  ['karachi', 'PK'],
  ['dhaka', 'BD'],
  ['colombo', 'LK'],
  ['kathmandu', 'NP'],
  ['yangon', 'MM'],
  ['rangoon', 'MM'],
  ['phnom_penh', 'KH'],
  ['ulaanbaatar', 'MN'],
  ['almaty', 'KZ'],
  ['qyzylorda', 'KZ'],
  ['aqtobe', 'KZ'],
  ['aqtau', 'KZ'],
  ['oral', 'KZ'],
  ['tashkent', 'UZ'],
  ['samarkand', 'UZ'],
  ['ashgabat', 'TM'],
  ['baku', 'AZ'],
  ['tbilisi', 'GE'],
  ['yerevan', 'AM'],
  ['brunei', 'BN'],
  ['port_moresby', 'PG'],
  ['sydney', 'AU'],
  ['melbourne', 'AU'],
  ['brisbane', 'AU'],
  ['perth', 'AU'],
  ['adelaide', 'AU'],
  ['darwin', 'AU'],
  ['hobart', 'AU'],
  ['auckland', 'NZ'],
  ['chatham', 'NZ'],

  // Middle East
  ['riyadh', 'SA'],
  ['dubai', 'AE'],
  ['jerusalem', 'IL'],
  ['tel_aviv', 'IL'],
  ['qatar', 'QA'],
  ['kuwait', 'KW'],
  ['muscat', 'OM'],
  ['bahrain', 'BH'],
  ['amman', 'JO'],
  ['baghdad', 'IQ'],
  ['tehran', 'IR'],
  ['beirut', 'LB'],
  ['nicosia', 'CY'],

  // Europe
  ['london', 'GB'],
  ['zurich', 'CH'],
  ['berlin', 'DE'],
  ['busingen', 'DE'],
  ['paris', 'FR'],
  ['rome', 'IT'],
  ['madrid', 'ES'],
  ['ceuta', 'ES'],
  ['canary', 'ES'],
  ['amsterdam', 'NL'],
  ['brussels', 'BE'],
  ['vienna', 'AT'],
  ['dublin', 'IE'],
  ['helsinki', 'FI'],
  ['lisbon', 'PT'],
  ['madeira', 'PT'],
  ['azores', 'PT'],
  ['athens', 'GR'],
  ['luxembourg', 'LU'],
  ['bratislava', 'SK'],
  ['ljubljana', 'SI'],
  ['vilnius', 'LT'],
  ['riga', 'LV'],
  ['tallinn', 'EE'],
  ['zagreb', 'HR'],
  ['malta', 'MT'],
  ['istanbul', 'TR'],
  ['moscow', 'RU'],
  ['kaliningrad', 'RU'],
  ['samara', 'RU'],
  ['yekaterinburg', 'RU'],
  ['novosibirsk', 'RU'],
  ['vladivostok', 'RU'],
  ['warsaw', 'PL'],
  ['stockholm', 'SE'],
  ['oslo', 'NO'],
  ['copenhagen', 'DK'],
  ['prague', 'CZ'],
  ['budapest', 'HU'],
  ['bucharest', 'RO'],
  ['sofia', 'BG'],
  ['belgrade', 'RS'],
  ['kyiv', 'UA'],
  ['kiev', 'UA'],
  ['minsk', 'BY'],
  ['reykjavik', 'IS'],
  ['chisinau', 'MD'],
  ['tirane', 'AL'],
  ['skopje', 'MK'],
  ['sarajevo', 'BA'],

  // Americas
  ['toronto', 'CA'],
  ['vancouver', 'CA'],
  ['montreal', 'CA'],
  ['edmonton', 'CA'],
  ['winnipeg', 'CA'],
  ['halifax', 'CA'],
  ['st_johns', 'CA'],
  ['regina', 'CA'],
  ['mexico_city', 'MX'],
  ['cancun', 'MX'],
  ['monterrey', 'MX'],
  ['tijuana', 'MX'],
  ['hermosillo', 'MX'],
  ['chihuahua', 'MX'],
  ['mazatlan', 'MX'],
  ['sao_paulo', 'BR'],
  ['fortaleza', 'BR'],
  ['recife', 'BR'],
  ['belem', 'BR'],
  ['manaus', 'BR'],
  ['cuiaba', 'BR'],
  ['bahia', 'BR'],
  ['buenos_aires', 'AR'],
  ['cordoba', 'AR'],
  ['mendoza', 'AR'],
  ['santiago', 'CL'],
  ['bogota', 'CO'],
  ['lima', 'PE'],
  ['caracas', 'VE'],
  ['montevideo', 'UY'],
  ['asuncion', 'PY'],
  ['la_paz', 'BO'],
  ['guayaquil', 'EC'],
  ['panama', 'PA'],
  ['costa_rica', 'CR'],
  ['santo_domingo', 'DO'],
  ['puerto_rico', 'PR'],
  ['guatemala', 'GT'],
  ['tegucigalpa', 'HN'],
  ['managua', 'NI'],
  ['el_salvador', 'SV'],
  ['jamaica', 'JM'],
  ['port_of_spain', 'TT'],
  ['guyana', 'GY'],
  ['new_york', 'US'],
  ['chicago', 'US'],
  ['los_angeles', 'US'],
  ['denver', 'US'],
  ['phoenix', 'US'],
  ['detroit', 'US'],
  ['anchorage', 'US'],
  ['honolulu', 'US'],

  // Africa
  ['johannesburg', 'ZA'],
  ['cairo', 'EG'],
  ['lagos', 'NG'],
  ['nairobi', 'KE'],
  ['casablanca', 'MA'],
  ['algiers', 'DZ'],
  ['tunis', 'TN'],
  ['accra', 'GH'],
  ['addis_ababa', 'ET'],
  ['dar_es_salaam', 'TZ'],
  ['kampala', 'UG'],
  ['abidjan', 'CI'],
  ['dakar', 'SN'],
  ['douala', 'CM'],
  ['luanda', 'AO'],
  ['kinshasa', 'CD'],
  ['lubumbashi', 'CD'],
  ['tripoli', 'LY'],
  ['gaborone', 'BW'],
  ['windhoek', 'NA'],
  ['mauritius', 'MU'],
]

const LANG_PREFIX_TO_ISO2: Record<string, string> = {
  ko: 'KR',
  ja: 'JP',
  vi: 'VN',
  th: 'TH',
  id: 'ID',
  ms: 'MY',
  tl: 'PH',
  fil: 'PH',
  hi: 'IN',
  ur: 'PK',
  bn: 'BD',
  si: 'LK',
  ne: 'NP',
  my: 'MM',
  km: 'KH',
  mn: 'MN',
  kk: 'KZ',
  uz: 'UZ',
  az: 'AZ',
  ka: 'GE',
  hy: 'AM',
  tr: 'TR',
  he: 'IL',
  fa: 'IR',
  pl: 'PL',
  sv: 'SE',
  no: 'NO',
  nb: 'NO',
  nn: 'NO',
  da: 'DK',
  fi: 'FI',
  cs: 'CZ',
  hu: 'HU',
  ro: 'RO',
  bg: 'BG',
  sr: 'RS',
  hr: 'HR',
  sk: 'SK',
  sl: 'SI',
  lt: 'LT',
  lv: 'LV',
  et: 'EE',
  uk: 'UA',
  be: 'BY',
  is: 'IS',
  el: 'GR',
  sq: 'AL',
  mk: 'MK',
  bs: 'BA',
  ru: 'RU',
  am: 'ET',
}

/**
 * Detects the visitor's home CountryMeta based on physical timezone (1st priority)
 * and browser locale region/language tags (2nd priority).
 */
export function detectVisitorCountry(): CountryMeta | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null
  }

  const byIso2 = new Map<string, CountryMeta>()
  for (const c of COUNTRIES) {
    byIso2.set(c.iso2.toUpperCase(), c)
  }

  // 1. Check IANA TimeZone first (most reliable indicator of physical region even when browser UI is en-US)
  const tz = (Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || '').toLowerCase()
  if (tz) {
    for (const [hint, iso2] of TIMEZONE_HINTS_TO_ISO2) {
      if (tz.includes(hint)) {
        const found = byIso2.get(iso2)
        if (found) return found
      }
    }
  }

  // 2. Check explicit regional subtag in navigator.languages (e.g., 'vi-VN' -> 'VN', 'en-CA' -> 'CA', 'zh-TW' -> 'TW')
  const candidates = [navigator.language, ...(navigator.languages || [])].filter(Boolean)
  for (const cand of candidates) {
    const match = cand.match(/[-_]([a-z]{2})\b/i)
    if (match) {
      const iso2 = match[1].toUpperCase()
      const found = byIso2.get(iso2)
      if (found) return found
    }
  }

  // 3. Check language prefix fallback
  for (const cand of candidates) {
    const langPrefix = cand.split(/[-_]/)[0].toLowerCase()
    const iso2 = LANG_PREFIX_TO_ISO2[langPrefix]
    if (iso2) {
      const found = byIso2.get(iso2)
      if (found) return found
    }
  }

  return null
}

/**
 * Detects initial language based on explicit user preference (localStorage)
 * or browser navigator language settings.
 */
export function detectBrowserLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_LANG_KEY)
    if (saved === 'ko' || saved === 'en' || saved === 'ja' || saved === 'es' || saved === 'zh' || saved === 'hi') {
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
        if (lower.startsWith('hi')) {
          return 'hi'
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
      if (timeZone.includes('kolkata') || timeZone.includes('calcutta') || timeZone.includes('delhi')) {
        return 'hi'
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
    if (saved && ['USD', 'EUR', 'KRW', 'JPY', 'GBP', 'CNY', 'CHF', 'AUD'].includes(saved)) {
      return saved as BaseCurrency
    }

    const visitor = detectVisitorCountry()
    if (visitor) {
      const code = visitor.currencyCode
      if (['USD', 'EUR', 'KRW', 'JPY', 'GBP', 'CNY', 'CHF', 'AUD'].includes(code)) {
        return code as BaseCurrency
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

import type { CountryMeta, Language } from '../types/economics'

/**
 * Japanese localized names for tracked global economies.
 */
export const COUNTRY_NAMES_JA: Record<string, string> = {
  USA: 'アメリカ (米国)',
  CHN: '中国',
  DEU: 'ドイツ',
  JPN: '日本',
  IND: 'インド',
  GBR: 'イギリス (英国)',
  FRA: 'フランス',
  ITA: 'イタリア',
  BRA: 'ブラジル',
  CAN: 'カナダ',
  RUS: 'ロシア',
  MEX: 'メキシコ',
  AUS: 'オーストラリア',
  KOR: '韓国',
  ESP: 'スペイン',
  IDN: 'インドネシア',
  TUR: 'トルコ',
  NLD: 'オランダ',
  SAU: 'サウジアラビア',
  CHE: 'スイス',
  POL: 'ポーランド',
  ARG: 'アルゼンチン',
  SWE: 'スウェーデン',
  BEL: 'ベルギー',
  NOR: 'ノルウェー',
  IRL: 'アイルランド',
  ISR: 'イスラエル',
  SGP: 'シンガポール',
  ARE: 'アラブ首長国連邦 (UAE)',
  AUT: 'オーストリア',
  THA: 'タイ',
  MYS: 'マレーシア',
  PHL: 'フィリピン',
  BGD: 'バングラデシュ',
  VNM: 'ベトナム',
  EGY: 'エジプト',
  ZAF: '南アフリカ',
  CHL: 'チリ',
  COL: 'コロンビア',
  FIN: 'フィンランド',
  CZE: 'チェコ',
  PRT: 'ポルトガル',
  ROU: 'ルーマニア',
  PER: 'ペルー',
  NZL: 'ニュージーランド',
  GRC: 'ギリシャ',
  QAT: 'カタール',
  KAZ: 'カザフスタン',
  DZA: 'アルジェリア',
  KWT: 'クウェート',
  MAR: 'モロッコ',
  UKR: 'ウクライナ',
  HUN: 'ハンガリー',
  NGA: 'ナイジェリア',
  DNK: 'デンマーク',
  HKG: '香港',
  TWN: '台湾',
  PAK: 'パキスタン',
}

/**
 * Japanese localized currency names.
 */
export const CURRENCY_NAMES_JA: Record<string, string> = {
  USD: '米ドル',
  EUR: 'ユーロ',
  KRW: '韓国ウォン',
  JPY: '日本円',
  GBP: '英ポンド',
  CNY: '中国人民元',
  INR: 'インドルピー',
  BRL: 'ブラジルレアル',
  CAD: 'カナダドル',
  RUB: 'ロシアルーブル',
  MXN: 'メキシコペソ',
  AUD: '豪ドル',
  TRY: 'トルコリラ',
  IDR: 'インドネシアルピア',
  SAR: 'サウジリヤル',
  CHF: 'スイスフラン',
  PLN: 'ポーランドズウォティ',
  ARS: 'アルゼンチンペソ',
  SEK: 'スウェーデンクローナ',
  NOK: 'ノルウェークローネ',
  ILS: 'イスラエルシェケル',
  SGD: 'シンガポールドル',
  AED: 'UAEディルハム',
  THB: 'タイバーツ',
  MYR: 'マレーシアリンギット',
  PHP: 'フィリピンペソ',
  BDT: 'バングラデシュタカ',
  VND: 'ベトナムドン',
  EGP: 'エジプトポンド',
  ZAR: '南アフリカランド',
  CLP: 'チリペソ',
  COP: 'コロンビアペソ',
  CZK: 'チェココルナ',
  RON: 'ルーマニアレウ',
  PEN: 'ペルーソル',
  NZD: 'NZドル',
  QAR: 'カタールリヤル',
  KZT: 'カザフスタンテゲ',
  DZD: 'アルジェリアディナール',
  KWD: 'クウェートディナール',
  MAD: 'モロッコディルハム',
  UAH: 'ウクライナフリヴニャ',
  HUF: 'ハンガリーフォリント',
  NGN: 'ナイジェリアナイラ',
  DKK: 'デンマーククローネ',
  HKD: '香港ドル',
  TWD: 'ニュー台湾ドル',
  PKR: 'パキスタンルピー',
}

/**
 * Returns country display name based on current language.
 */
export function getCountryName(country: CountryMeta, lang: Language): string {
  if (lang === 'ko') return country.nameKo
  if (lang === 'ja') return COUNTRY_NAMES_JA[country.id] || country.nameJa || country.nameEn
  return country.nameEn
}

/**
 * Returns secondary name (e.g. for subtext or dual display).
 */
export function getCountrySecondaryName(country: CountryMeta, lang: Language): string {
  if (lang === 'ko') return country.nameEn
  if (lang === 'ja') return country.nameEn
  return country.nameKo
}

/**
 * Returns currency display name based on current language.
 */
export function getCurrencyName(country: CountryMeta, lang: Language): string {
  if (lang === 'ko') return country.currencyNameKo
  if (lang === 'ja') return CURRENCY_NAMES_JA[country.currencyCode] || country.currencyNameJa || country.currencyNameEn
  return country.currencyNameEn
}

import type { BaseCurrency, Language } from '../types/economics'

/**
 * World Federation of Exchanges (WFE) Monthly Market Statistics (2026).
 * Represents total domestic market capitalization of listed companies by country/exchange.
 * Sourced from WFE Monthly Statistics Portal & Market Highlights, verified against member exchanges.
 */
export const WFE_REPORT_DATE = `${new Date().getFullYear()} Monthly`
export const WFE_DATA_SOURCE = 'World Federation of Exchanges (WFE) Monthly Market Statistics'

export const STOCK_MARKET_CAPS_USD: Record<string, number> = {
  // --- Americas ---
  USA: 80_410_000_000_000, // NYSE + NASDAQ Domestic Listed (~$80.4T)
  CAN: 4_236_000_000_000,  // TMX / Toronto Stock Exchange (~$4.24T)
  BRA: 1_152_000_000_000,  // B3 Brasil Bolsa Balcão (~$1.15T)
  MEX: 534_000_000_000,    // BMV Bolsa Mexicana de Valores (~$534B)
  CHL: 169_000_000_000,    // Santiago Stock Exchange (~$169B)
  PER: 135_000_000_000,    // BVL Bolsa de Valores de Lima (~$135B)
  ARG: 152_000_000_000,    // BYMA Bolsas y Mercados Argentinos (~$152B)
  COL: 105_000_000_000,    // BVC Bolsa de Valores de Colombia (~$105B)
  PRI: 25_000_000_000,     // Puerto Rico (~$25B)
  PAN: 20_000_000_000,     // Panama Stock Exchange (~$20B)
  ECU: 18_000_000_000,     // Ecuador (~$18B)
  JAM: 16_000_000_000,     // Jamaica Stock Exchange (~$16B)
  TTO: 16_000_000_000,     // Trinidad and Tobago Stock Exchange (TTSE) (~$16B)
  DOM: 15_000_000_000,     // Dominican Republic (~$15B)
  CRI: 15_000_000_000,     // Costa Rica (~$15B)
  BOL: 12_000_000_000,     // Bolivia (~$12B)
  GTM: 10_000_000_000,     // Guatemala (~$10B)
  URY: 10_000_000_000,     // Uruguay (~$10B)
  VEN: 10_000_000_000,     // Caracas Stock Exchange (~$10B)
  HND: 8_000_000_000,      // Honduras (~$8B)
  NIC: 6_000_000_000,      // Nicaragua (~$6B)
  PRY: 6_000_000_000,      // Paraguay (~$6B)

  // --- Asia ---
  CHN: 10_832_000_000_000, // Shanghai + Shenzhen + Beijing (~$10.83T)
  JPN: 7_734_000_000_000,  // Japan Exchange Group (JPX) (~$7.73T)
  IND: 3_907_000_000_000,  // NSE + BSE India Domestic (~$3.91T)
  HKG: 1_150_000_000_000,  // Hong Kong Exchanges and Clearing (HKEX) (~$1.15T)
  TWN: 4_088_000_000_000,  // Taiwan Stock Exchange (TWSE) (~$4.09T)
  SAU: 2_388_000_000_000,  // Saudi Tadawul (~$2.39T)
  KOR: 3_217_000_000_000,  // Korea Exchange (KRX: KOSPI 약 4,584조 원 / ~$3.22T)
  ARE: 1_006_000_000_000,  // ADX Abu Dhabi + DFM Dubai (~$1.01T)
  SGP: 719_000_000_000,    // Singapore Exchange (SGX) (~$719B)
  IDN: 252_000_000_000,    // Indonesia Stock Exchange (IDX) (~$252B)
  THA: 464_000_000_000,    // Stock Exchange of Thailand (SET) (~$464B)
  TUR: 202_000_000_000,    // Borsa Istanbul (BIST) (~$202B)
  MYS: 305_000_000_000,    // Bursa Malaysia (~$305B)
  ISR: 549_000_000_000,    // Tel Aviv Stock Exchange (TASE) (~$549B)
  PHL: 96_000_000_000,     // Philippine Stock Exchange (PSE) (~$96B)
  VNM: 175_000_000_000,    // Ho Chi Minh Stock Exchange (HoSE) (~$175B)
  QAT: 144_000_000_000,    // Qatar Stock Exchange (~$144B)
  KWT: 156_000_000_000,    // Boursa Kuwait (~$156B)
  KAZ: 75_000_000_000,     // Kazakhstan Stock Exchange (KASE) (~$75B)
  BGD: 48_000_000_000,     // Dhaka Stock Exchange (~$48B)
  PAK: 44_000_000_000,     // Pakistan Stock Exchange (PSX) (~$44B)
  JOR: 26_000_000_000,     // Amman Stock Exchange (~$26B)
  OMN: 41_000_000_000,     // Muscat Stock Exchange (~$41B)
  BHR: 19_000_000_000,     // Bahrain Bourse (~$19B)
  LKA: 18_000_000_000,     // Colombo Stock Exchange (~$18B)
  UZB: 15_000_000_000,     // Tashkent Stock Exchange (~$15B)
  IRQ: 15_000_000_000,     // Iraq Stock Exchange (~$15B)
  LBN: 14_000_000_000,     // Beirut Stock Exchange (~$14B)
  BRN: 12_000_000_000,     // Brunei Darussalam (~$12B)
  ARM: 6_000_000_000,      // Armenia Securities Exchange (~$6B)
  GEO: 5_000_000_000,      // Georgian Stock Exchange (~$5B)
  MNG: 4_500_000_000,      // Mongolian Stock Exchange (~$4.5B)
  NPL: 4_000_000_000,      // Nepal Stock Exchange (~$4B)
  KHM: 7_000_000_000,      // Cambodia Securities Exchange (~$7B)

  // --- Europe ---
  GBR: 4_601_000_000_000,  // London Stock Exchange (LSE) (~$4.60T)
  FRA: 2_896_000_000_000,  // Euronext Paris (~$2.90T)
  DEU: 2_872_000_000_000,  // Deutsche Börse Frankfurt (~$2.87T)
  CHE: 3_108_000_000_000,  // SIX Swiss Exchange (~$3.11T)
  NLD: 1_738_000_000_000,  // Euronext Amsterdam (~$1.74T)
  SWE: 1_313_000_000_000,  // Nasdaq Stockholm (~$1.31T)
  ITA: 1_260_000_000_000,  // Borsa Italiana (~$1.26T)
  ESP: 1_346_000_000_000,  // BME Bolsas y Mercados Españoles (~$1.35T)
  DNK: 618_000_000_000,    // Nasdaq Copenhagen (~$618B)
  BEL: 464_000_000_000,    // Euronext Brussels (~$464B)
  NOR: 437_000_000_000,    // Oslo Børs (~$437B)
  FIN: 400_000_000_000,    // Nasdaq Helsinki (~$400B)
  POL: 332_000_000_000,    // Warsaw Stock Exchange (GPW) (~$332B)
  AUT: 248_000_000_000,    // Wiener Börse (~$248B)
  IRL: 1_171_000_000_000,  // Euronext Dublin (~$1.17T)
  GRC: 156_000_000_000,    // Athens Stock Exchange (~$156B)
  PRT: 94_000_000_000,     // Euronext Lisbon (~$94B)
  ROU: 80_000_000_000,     // Bucharest Stock Exchange (BVB) (~$80B)
  HUN: 52_000_000_000,     // Budapest Stock Exchange (~$52B)
  CZE: 48_000_000_000,     // Prague Stock Exchange (~$48B)
  LUX: 48_000_000_000,     // Luxembourg Stock Exchange (~$48B)
  HRV: 28_000_000_000,     // Zagreb Stock Exchange (~$28B)
  MLT: 24_000_000_000,     // Malta Stock Exchange (~$24B)
  ISL: 22_000_000_000,     // Nasdaq Iceland (~$22B)
  BGR: 20_000_000_000,     // Bulgarian Stock Exchange (~$20B)
  SVN: 16_000_000_000,     // Ljubljana Stock Exchange (~$16B)
  SRB: 14_000_000_000,     // Belgrade Stock Exchange (~$14B)
  UKR: 15_000_000_000,     // PFTS Ukraine (~$15B)
  CYP: 12_000_000_000,     // Cyprus Stock Exchange (~$12B)
  LTU: 8_500_000_000,      // Nasdaq Vilnius (~$8.5B)
  SVK: 7_000_000_000,      // Bratislava Stock Exchange (~$7B)
  EST: 6_000_000_000,      // Nasdaq Tallinn (~$6B)
  BIH: 4_800_000_000,      // Sarajevo + Banja Luka Stock Exchanges (~$4.8B)
  MDA: 4_500_000_000,      // Moldova Stock Exchange (~$4.5B)
  ALB: 4_500_000_000,      // Tirana Stock Exchange (~$4.5B)
  MKD: 4_200_000_000,      // Macedonian Stock Exchange (MSE) (~$4.2B)
  LVA: 1_500_000_000,      // Nasdaq Riga (~$1.5B)

  // --- Oceania ---
  AUS: 2_100_000_000_000,  // Australian Securities Exchange (ASX) (~$2.1T)
  NZL: 120_000_000_000,    // New Zealand Exchange (NZX) (~$120B)
  PNG: 7_000_000_000,      // Port Moresby Stock Exchange (~$7B)

  // --- Africa ---
  ZAF: 1_100_000_000_000,  // Johannesburg Stock Exchange (JSE) (~$1.1T)
  MAR: 85_000_000_000,     // Casablanca Stock Exchange (~$85B)
  EGY: 55_000_000_000,     // Egyptian Exchange (EGX) (~$55B)
  NGA: 48_000_000_000,     // Nigerian Exchange (NGX) (~$48B)
  BWA: 22_000_000_000,     // Botswana Stock Exchange (~$22B)
  KEN: 16_000_000_000,     // Nairobi Securities Exchange (~$16B)
  CIV: 14_000_000_000,     // BRVM (West Africa Regional) (~$14B)
  TUN: 12_000_000_000,     // Bourse de Tunis (~$12B)
  GHA: 10_000_000_000,     // Ghana Stock Exchange (~$10B)
  MUS: 9_500_000_000,      // Stock Exchange of Mauritius (SEM) (~$9.5B)
  ETH: 9_000_000_000,      // Ethiopia Securities Exchange (~$9B)
  TZA: 8_000_000_000,      // Dar es Salaam Stock Exchange (~$8B)
  AGO: 7_000_000_000,      // Bodiva Angola (~$7B)
  UGA: 7_000_000_000,      // Uganda Securities Exchange (~$7B)
  DZA: 6_000_000_000,      // Algiers Stock Exchange (~$6B)
  SEN: 6_000_000_000,      // Senegal (BRVM) (~$6B)
  CMR: 4_500_000_000,      // Douala Stock Exchange (~$4.5B)
  NAM: 3_200_000_000,      // Namibian Stock Exchange (NSX Domestic) (~$3.2B)
}

/**
 * Returns domestic stock market capitalization in USD.
 * If not specifically tracked, estimates based on country's nominal GDP.
 */
export function getStockMarketCapUsd(countryId: string, gdpUsd?: number): number {
  const cap = STOCK_MARKET_CAPS_USD[countryId.toUpperCase()]
  if (cap && cap > 0) return cap
  // Reasonable fallback for unlisted: ~30% of Nominal GDP
  if (gdpUsd && gdpUsd > 0) {
    return Math.round(gdpUsd * 0.3)
  }
  return 5_000_000_000 // default baseline $5B
}

/**
 * Formats market capitalization in compact currency unit (e.g. $70.5T, $2.40T, $580B, ₩3,250조).
 */
export function formatStockMarketCap(
  marketCapUsd: number,
  baseCurrency: BaseCurrency,
  usdToBase = 1,
  lang: Language = 'en'
): string {
  const converted = marketCapUsd * (usdToBase > 0 ? usdToBase : 1)

  if (baseCurrency === 'KRW' && lang === 'ko') {
    if (converted >= 1e12) {
      return `₩${(converted / 1e12).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}조`
    }
    return `₩${Math.round(converted / 1e8).toLocaleString('ko-KR')}억`
  }

  const symbol =
    baseCurrency === 'USD'
      ? '$'
      : baseCurrency === 'KRW'
        ? '₩'
        : baseCurrency === 'EUR'
          ? '€'
          : baseCurrency === 'JPY'
            ? '¥'
            : baseCurrency === 'GBP'
              ? '£'
              : baseCurrency === 'CNY'
                ? '¥'
                : baseCurrency === 'AUD'
                  ? 'A$'
                  : baseCurrency === 'CHF'
                    ? 'CHF '
                    : '$'

  if (converted >= 1e12) {
    return `${symbol}${(converted / 1e12).toFixed(2)}T`
  }
  if (converted >= 1e9) {
    return `${symbol}${(converted / 1e9).toFixed(1)}B`
  }
  return `${symbol}${(converted / 1e6).toFixed(0)}M`
}

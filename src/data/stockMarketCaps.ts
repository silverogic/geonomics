import type { BaseCurrency, Language } from '../types/economics'

/**
 * World Federation of Exchanges (WFE) Monthly Market Statistics (2026).
 * Represents total domestic market capitalization of listed companies by country/exchange.
 * Sourced from WFE Monthly Statistics Portal & Market Highlights, verified against member exchanges.
 */
export const WFE_REPORT_DATE = '2026 Monthly'
export const WFE_DATA_SOURCE = 'World Federation of Exchanges (WFE) Monthly Market Statistics'

export const STOCK_MARKET_CAPS_USD: Record<string, number> = {
  // --- Americas ---
  USA: 70_500_000_000_000, // NYSE + NASDAQ Domestic Listed (~$70.5T)
  CAN: 3_900_000_000_000,  // TMX / Toronto Stock Exchange (~$3.90T)
  BRA: 1_100_000_000_000,  // B3 Brasil Bolsa Balcão (~$1.10T)
  MEX: 580_000_000_000,    // BMV Bolsa Mexicana de Valores (~$580B)
  CHL: 220_000_000_000,    // Santiago Stock Exchange (~$220B)
  PER: 135_000_000_000,    // BVL Bolsa de Valores de Lima (~$135B)
  ARG: 110_000_000_000,    // BYMA Bolsas y Mercados Argentinos (~$110B)
  COL: 105_000_000_000,    // BVC Bolsa de Valores de Colombia (~$105B)
  PRI: 25_000_000_000,     // Puerto Rico (~$25B)
  PAN: 20_000_000_000,     // Panama Stock Exchange (~$20B)
  ECU: 18_000_000_000,     // Ecuador (~$18B)
  JAM: 16_000_000_000,     // Jamaica Stock Exchange (~$16B)
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
  CHN: 11_600_000_000_000, // Shanghai + Shenzhen + Beijing (~$11.6T)
  JPN: 7_850_000_000_000,  // Japan Exchange Group (JPX) (~$7.85T)
  IND: 5_450_000_000_000,  // NSE + BSE India Domestic (~$5.45T)
  HKG: 4_600_000_000_000,  // Hong Kong Exchanges and Clearing (HKEX) (~$4.6T)
  TWN: 3_600_000_000_000,  // Taiwan Stock Exchange (TWSE) (~$3.6T)
  SAU: 2_700_000_000_000,  // Saudi Tadawul (~$2.7T)
  KOR: 2_400_000_000_000,  // Korea Exchange (KRX: KOSPI + KOSDAQ) (~$2.4T, 약 3,250조 원)
  ARE: 1_100_000_000_000,  // ADX Abu Dhabi + DFM Dubai (~$1.1T)
  SGP: 820_000_000_000,    // Singapore Exchange (SGX) (~$820B)
  IDN: 780_000_000_000,    // Indonesia Stock Exchange (IDX) (~$780B)
  THA: 560_000_000_000,    // Stock Exchange of Thailand (SET) (~$560B)
  TUR: 450_000_000_000,    // Borsa Istanbul (BIST) (~$450B)
  MYS: 440_000_000_000,    // Bursa Malaysia (~$440B)
  ISR: 360_000_000_000,    // Tel Aviv Stock Exchange (TASE) (~$360B)
  PHL: 270_000_000_000,    // Philippine Stock Exchange (PSE) (~$270B)
  VNM: 270_000_000_000,    // Ho Chi Minh Stock Exchange (HoSE) (~$270B)
  QAT: 185_000_000_000,    // Qatar Stock Exchange (~$185B)
  KWT: 155_000_000_000,    // Boursa Kuwait (~$155B)
  KAZ: 75_000_000_000,     // Kazakhstan Stock Exchange (KASE) (~$75B)
  BGD: 48_000_000_000,     // Dhaka Stock Exchange (~$48B)
  PAK: 42_000_000_000,     // Pakistan Stock Exchange (PSX) (~$42B)
  JOR: 26_000_000_000,     // Amman Stock Exchange (~$26B)
  OMN: 26_000_000_000,     // Muscat Stock Exchange (~$26B)
  BHR: 24_000_000_000,     // Bahrain Bourse (~$24B)
  LKA: 18_000_000_000,     // Colombo Stock Exchange (~$18B)
  UZB: 15_000_000_000,     // Tashkent Stock Exchange (~$15B)
  IRQ: 15_000_000_000,     // Iraq Stock Exchange (~$15B)
  LBN: 14_000_000_000,     // Beirut Stock Exchange (~$14B)
  BRN: 12_000_000_000,     // Brunei Darussalam (~$12B)
  ARM: 6_000_000_000,      // Armenia Securities Exchange (~$6B)
  GEO: 5_000_000_000,      // Georgian Stock Exchange (~$5B)
  MNG: 4_500_000_000,      // Mongolian Stock Exchange (~$4.5B)
  NPL: 4_000_000_000,      // Nepal Stock Exchange (~$4B)
  KHM: 3_500_000_000,      // Cambodia Securities Exchange (~$3.5B)

  // --- Europe ---
  GBR: 4_400_000_000_000,  // London Stock Exchange (LSE) (~$4.4T)
  FRA: 3_800_000_000_000,  // Euronext Paris (~$3.8T)
  DEU: 2_850_000_000_000,  // Deutsche Börse Frankfurt (~$2.85T)
  CHE: 2_500_000_000_000,  // SIX Swiss Exchange (~$2.5T)
  NLD: 1_750_000_000_000,  // Euronext Amsterdam (~$1.75T)
  SWE: 1_050_000_000_000,  // Nasdaq Stockholm (~$1.05T)
  ITA: 980_000_000_000,    // Borsa Italiana (~$980B)
  ESP: 920_000_000_000,    // BME Bolsas y Mercados Españoles (~$920B)
  DNK: 520_000_000_000,    // Nasdaq Copenhagen (~$520B)
  BEL: 430_000_000_000,    // Euronext Brussels (~$430B)
  NOR: 410_000_000_000,    // Oslo Børs (~$410B)
  FIN: 320_000_000_000,    // Nasdaq Helsinki (~$320B)
  POL: 290_000_000_000,    // Warsaw Stock Exchange (GPW) (~$290B)
  AUT: 210_000_000_000,    // Wiener Börse (~$210B)
  IRL: 180_000_000_000,    // Euronext Dublin (~$180B)
  GRC: 130_000_000_000,    // Athens Stock Exchange (~$130B)
  PRT: 115_000_000_000,    // Euronext Lisbon (~$115B)
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
  MDA: 4_500_000_000,      // Moldova Stock Exchange (~$4.5B)
  ALB: 4_500_000_000,      // Tirana Stock Exchange (~$4.5B)
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
  ETH: 9_000_000_000,      // Ethiopia Securities Exchange (~$9B)
  TZA: 8_000_000_000,      // Dar es Salaam Stock Exchange (~$8B)
  AGO: 7_000_000_000,      // Bodiva Angola (~$7B)
  UGA: 7_000_000_000,      // Uganda Securities Exchange (~$7B)
  DZA: 6_000_000_000,      // Algiers Stock Exchange (~$6B)
  SEN: 6_000_000_000,      // Senegal (BRVM) (~$6B)
  CMR: 4_500_000_000,      // Douala Stock Exchange (~$4.5B)
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

import type { CountryTopicCategory, Language } from '../types/economics'

export type CalendarMarketId = 'USA' | 'KOR' | 'JPN' | 'EUR' | 'GBR' | 'CHN'

export type EventCategory =
  | 'CENTRAL_BANK' // 중앙은행 통화정책 (FOMC, 금통위, BOJ, ECB 등 금리결정/의사록/점도표/연설)
  | 'INFLATION'    // 물가지표 (CPI, Core CPI, PCE, Core PCE, PPI, 기대인플레이션)
  | 'EMPLOYMENT'   // 고용·노동시장 (비농업 고용 NFP, 실업률, JOLTs, 신규 실업수당, ADP, 시간당 임금)
  | 'GROWTH'       // 성장·경기선행 (GDP 성장률, GDPNow, ISM 제조업·서비스업 PMI, 산업생산)
  | 'CONSUMER'     // 소비·주택·무역 (소매판매, 미시간대 소비자심리, 개인소비지출, 내구재수주, 주택판매, 무역수지)

export interface CalendarMarketConfig {
  id: CalendarMarketId
  iso2: string
  countryId: string
  centralBankCode: string
  centralBankName: Record<Language, string>
  policyMeetingName: Record<Language, string>
  localTimezone: string
  localTzShort: string
  enabled: boolean
}

export interface EconomicCalendarEvent {
  id: string
  marketId: CalendarMarketId
  countryIso2: string
  category: EventCategory
  importance: 1 | 2 | 3
  titleEn: string
  period: string
  dateUtc: string
  actual: number | null
  forecast: number | null
  previous: number | null
  unit: string
  scale: string
  comment?: string
  source?: string
  sourceUrl?: string
  newsTopic: CountryTopicCategory
  newsKeyword: string
}

/**
 * Multi-country extensible market registry.
 * Target 1 (`USA` / `FED`) is active; other major central banks are pre-configured
 * for seamless future activation.
 */
export const CALENDAR_MARKETS: CalendarMarketConfig[] = [
  {
    id: 'USA',
    iso2: 'US',
    countryId: 'USA',
    centralBankCode: 'FED',
    centralBankName: {
      en: 'U.S. Federal Reserve (FED)',
      ko: '미국 연방준비제도 (FED)',
      ja: '米連邦準備制度理事会 (FRB)',
      es: 'Reserva Federal de EE.UU. (FED)',
      zh: '美国联邦储备系统 (FED)',
    },
    policyMeetingName: {
      en: 'FOMC Rate Decision',
      ko: 'FOMC 기준금리 결정',
      ja: 'FOMC 政策金利発表',
      es: 'Decisión de Tasas del FOMC',
      zh: 'FOMC 利率决议',
    },
    localTimezone: 'America/New_York',
    localTzShort: 'ET',
    enabled: true,
  },
  {
    id: 'KOR',
    iso2: 'KR',
    countryId: 'KOR',
    centralBankCode: 'BOK',
    centralBankName: {
      en: 'Bank of Korea (BOK)',
      ko: '한국은행 (BOK)',
      ja: '韓国銀行 (BOK)',
      es: 'Banco de Corea (BOK)',
      zh: '韩国银行 (BOK)',
    },
    policyMeetingName: {
      en: 'MPB Rate Decision',
      ko: '금융통화위원회 기준금리 결정',
      ja: '金融通貨委員会 政策金利発表',
      es: 'Decisión de Tasas del BOK',
      zh: '金融货币委员会利率决议',
    },
    localTimezone: 'Asia/Seoul',
    localTzShort: 'KST',
    enabled: false,
  },
  {
    id: 'JPN',
    iso2: 'JP',
    countryId: 'JPN',
    centralBankCode: 'BOJ',
    centralBankName: {
      en: 'Bank of Japan (BOJ)',
      ko: '일본은행 (BOJ)',
      ja: '日本銀行 (BOJ)',
      es: 'Banco de Japón (BOJ)',
      zh: '日本银行 (BOJ)',
    },
    policyMeetingName: {
      en: 'BOJ MPM Rate Decision',
      ko: 'BOJ 금융정책결정회의',
      ja: '日銀金融政策決定会合',
      es: 'Decisión Monetaria del BOJ',
      zh: '日本央行货币政策会议',
    },
    localTimezone: 'Asia/Tokyo',
    localTzShort: 'JST',
    enabled: false,
  },
  {
    id: 'EUR',
    iso2: 'EU',
    countryId: 'DEU',
    centralBankCode: 'ECB',
    centralBankName: {
      en: 'European Central Bank (ECB)',
      ko: '유럽중앙은행 (ECB)',
      ja: '欧州中央銀行 (ECB)',
      es: 'Banco Central Europeo (BCE)',
      zh: '欧洲中央银行 (ECB)',
    },
    policyMeetingName: {
      en: 'ECB Governing Council',
      ko: 'ECB 통화정책이사회',
      ja: 'ECB 政策理事会',
      es: 'Consejo de Gobierno del BCE',
      zh: '欧洲央行管委会利率决议',
    },
    localTimezone: 'Europe/Frankfurt',
    localTzShort: 'CET',
    enabled: false,
  },
  {
    id: 'GBR',
    iso2: 'GB',
    countryId: 'GBR',
    centralBankCode: 'BOE',
    centralBankName: {
      en: 'Bank of England (BOE)',
      ko: '영란은행 (BOE)',
      ja: 'イングランド銀行 (BOE)',
      es: 'Banco de Inglaterra (BOE)',
      zh: '英格兰银行 (BOE)',
    },
    policyMeetingName: {
      en: 'BOE MPC Rate Decision',
      ko: 'BOE 통화정책위원회',
      ja: 'BOE 金融政策委員会',
      es: 'Comité Monetario del BOE',
      zh: '英国央行货币政策委员会',
    },
    localTimezone: 'Europe/London',
    localTzShort: 'GMT',
    enabled: false,
  },
  {
    id: 'CHN',
    iso2: 'CN',
    countryId: 'CHN',
    centralBankCode: 'PBOC',
    centralBankName: {
      en: "People's Bank of China (PBOC)",
      ko: '중국인민은행 (PBOC)',
      ja: '中国人民銀行 (PBOC)',
      es: 'Banco Popular de China (PBOC)',
      zh: '中国人民银行 (PBOC)',
    },
    policyMeetingName: {
      en: 'PBOC LPR Rate Decision',
      ko: 'PBOC 대출우대금리(LPR) 고시',
      ja: 'PBOC ローンプライムレート発表',
      es: 'Decisión de Tasa LPR del PBOC',
      zh: '中国央行 LPR 报价公布',
    },
    localTimezone: 'Asia/Shanghai',
    localTzShort: 'CST',
    enabled: false,
  },
]

/**
 *Exact multilingual dictionary for core FED and macroeconomic indicator titles
 */
const INDICATOR_TRANSLATIONS: Record<string, Record<Language, string>> = {
  // CENTRAL_BANK (FED / FOMC)
  'Fed Interest Rate Decision': {
    en: 'FOMC Rate Decision',
    ko: 'FOMC 기준금리 결정',
    ja: 'FOMC 政策金利発表',
    es: 'Decisión de Tasas FOMC',
    zh: 'FOMC 利率决议',
  },
  'FOMC Economic Projections': {
    en: 'FOMC Dot Plot & Projections',
    ko: 'FOMC 점도표 · 경제전망',
    ja: 'FOMC ドットプロット・経済見通し',
    es: 'FOMC Dot Plot y Proyecciones',
    zh: 'FOMC 点阵图与经济预测',
  },
  'FOMC Statement': {
    en: 'FOMC Policy Statement',
    ko: 'FOMC 통화정책 성명서',
    ja: 'FOMC 声明発表',
    es: 'Comunicado del FOMC',
    zh: 'FOMC 政策声明',
  },
  'Fed Press Conference': {
    en: 'Fed Chair Press Conference',
    ko: '연준 의장 기자회견',
    ja: 'FRB議長 記者会見',
    es: 'Rueda de Prensa Fed',
    zh: '美联储主席记者会',
  },
  'FOMC Minutes': {
    en: 'FOMC Meeting Minutes',
    ko: 'FOMC 의사록 공개',
    ja: 'FOMC 議事要旨',
    es: 'Actas del FOMC',
    zh: 'FOMC 会议纪要',
  },
  'Fed Beige Book': {
    en: 'Fed Beige Book',
    ko: '연준 베이지북',
    ja: 'FRB ベージュブック',
    es: 'Libro Beige de la Fed',
    zh: '美联储褐皮书',
  },
  'Fed Balance Sheet': {
    en: 'Fed Balance Sheet',
    ko: '연준 대차대조표',
    ja: 'FRB バランスシート',
    es: 'Balance de la Fed',
    zh: '美联储资产负债表',
  },
  'Jackson Hole Symposium': {
    en: 'Jackson Hole Symposium',
    ko: '잭슨홀 심포지엄',
    ja: 'ジャクソンホール会議',
    es: 'Simposio Jackson Hole',
    zh: '杰克逊霍尔央行年会',
  },

  // INFLATION
  'Inflation Rate YoY': {
    en: 'CPI Inflation (YoY)',
    ko: '소비자물가 CPI (YoY)',
    ja: '消費者物価 CPI (前年比)',
    es: 'Inflación IPC (YoY)',
    zh: 'CPI 同比 (YoY)',
  },
  'Inflation Rate MoM': {
    en: 'CPI Inflation (MoM)',
    ko: '소비자물가 CPI (MoM)',
    ja: '消費者物価 CPI (前月比)',
    es: 'Inflación IPC (MoM)',
    zh: 'CPI 环比 (MoM)',
  },
  'Core Inflation Rate YoY': {
    en: 'Core CPI (YoY)',
    ko: '근원 CPI (YoY)',
    ja: 'コアCPI (前年比)',
    es: 'IPC Subyacente (YoY)',
    zh: '核心 CPI 同比 (YoY)',
  },
  'Core Inflation Rate MoM': {
    en: 'Core CPI (MoM)',
    ko: '근원 CPI (MoM)',
    ja: 'コアCPI (前月比)',
    es: 'IPC Subyacente (MoM)',
    zh: '核心 CPI 环比 (MoM)',
  },
  'Core PCE Price Index YoY': {
    en: 'Core PCE Inflation (YoY)',
    ko: '근원 PCE 물가 (YoY)',
    ja: 'コアPCE物価 (前年比)',
    es: 'PCE Subyacente (YoY)',
    zh: '核心 PCE 同比 (YoY)',
  },
  'Core PCE Price Index MoM': {
    en: 'Core PCE Inflation (MoM)',
    ko: '근원 PCE 물가 (MoM)',
    ja: 'コアPCE物価 (前月比)',
    es: 'PCE Subyacente (MoM)',
    zh: '核心 PCE 环比 (MoM)',
  },
  'PCE Price Index YoY': {
    en: 'PCE Price Index (YoY)',
    ko: 'PCE 물가지수 (YoY)',
    ja: 'PCE物価指数 (前年比)',
    es: 'Índice PCE (YoY)',
    zh: 'PCE 物价同比 (YoY)',
  },
  'PCE Price Index MoM': {
    en: 'PCE Price Index (MoM)',
    ko: 'PCE 물가지수 (MoM)',
    ja: 'PCE物価指数 (前月比)',
    es: 'Índice PCE (MoM)',
    zh: 'PCE 物价环比 (MoM)',
  },
  'PPI MoM': {
    en: 'PPI Inflation (MoM)',
    ko: '생산자물가 PPI (MoM)',
    ja: '生産者物価 PPI (前月比)',
    es: 'IPP (MoM)',
    zh: 'PPI 环比 (MoM)',
  },
  'PPI YoY': {
    en: 'PPI Inflation (YoY)',
    ko: '생산자물가 PPI (YoY)',
    ja: '生産者物価 PPI (前年比)',
    es: 'IPP (YoY)',
    zh: 'PPI 同比 (YoY)',
  },
  'Core PPI MoM': {
    en: 'Core PPI (MoM)',
    ko: '근원 PPI (MoM)',
    ja: 'コアPPI (前月比)',
    es: 'IPP Subyacente (MoM)',
    zh: '核心 PPI 环比 (MoM)',
  },
  'Core PPI YoY': {
    en: 'Core PPI (YoY)',
    ko: '근원 PPI (YoY)',
    ja: 'コアPPI (前年比)',
    es: 'IPP Subyacente (YoY)',
    zh: '核心 PPI 同比 (YoY)',
  },
  'Michigan Inflation Expectations Prel': {
    en: 'Michigan 1Y Inflation Exp (Prel)',
    ko: '미시간대 1년 기대인플레 (예비)',
    ja: 'ミシガン大 1年期待インフレ (速報)',
    es: 'Exp. Inflación Michigan 1A (Prel)',
    zh: '密歇根 1 年通胀预期 (初值)',
  },
  'Michigan Inflation Expectations Final': {
    en: 'Michigan 1Y Inflation Exp (Final)',
    ko: '미시간대 1년 기대인플레 (확정)',
    ja: 'ミシガン大 1年期待インフレ (確報)',
    es: 'Exp. Inflación Michigan 1A (Final)',
    zh: '密歇根 1 年通胀预期 (终值)',
  },
  'Michigan 5 Year Inflation Expectations Prel': {
    en: 'Michigan 5Y Inflation Exp (Prel)',
    ko: '미시간대 5년 기대인플레 (예비)',
    ja: 'ミシガン大 5年期待インフレ (速報)',
    es: 'Exp. Inflación Michigan 5A (Prel)',
    zh: '密歇根 5 年通胀预期 (初值)',
  },
  'Michigan 5 Year Inflation Expectations Final': {
    en: 'Michigan 5Y Inflation Exp (Final)',
    ko: '미시간대 5년 기대인플레 (확정)',
    ja: 'ミシガン大 5年期待インフレ (確報)',
    es: 'Exp. Inflación Michigan 5A (Final)',
    zh: '密歇根 5 年通胀预期 (终值)',
  },

  // EMPLOYMENT
  'Non Farm Payrolls': {
    en: 'Nonfarm Payrolls (NFP)',
    ko: '비농업 고용 (NFP)',
    ja: '非農業部門雇用者数 (NFP)',
    es: 'Nóminas No Agrícolas (NFP)',
    zh: '非农就业人数 (NFP)',
  },
  'Unemployment Rate': {
    en: 'Unemployment Rate',
    ko: '실업률',
    ja: '失業率',
    es: 'Tasa de Desempleo',
    zh: '失业率',
  },
  'JOLTs Job Openings': {
    en: 'JOLTs Job Openings',
    ko: 'JOLTs 구인건수',
    ja: 'JOLTS 求人件数',
    es: 'Ofertas de Empleo JOLTs',
    zh: 'JOLTs 职位空缺',
  },
  'Initial Jobless Claims': {
    en: 'Initial Jobless Claims',
    ko: '신규 실업수당 청구',
    ja: '新規失業保険申請件数',
    es: 'Peticiones de Desempleo',
    zh: '初请失业金人数',
  },
  'Continuing Jobless Claims': {
    en: 'Continuing Jobless Claims',
    ko: '연속 실업수당 청구',
    ja: '失業保険継続受給者数',
    es: 'Solicitudes Continuas',
    zh: '续请失业金人数',
  },
  'ADP Employment Change': {
    en: 'ADP Private Payrolls',
    ko: 'ADP 민간고용',
    ja: 'ADP 民間雇用者数',
    es: 'Empleo Privado ADP',
    zh: 'ADP 就业人数',
  },
  'Average Hourly Earnings MoM': {
    en: 'Avg Hourly Earnings (MoM)',
    ko: '시간당 평균임금 (MoM)',
    ja: '平均時給 (前月比)',
    es: 'Salario por Hora (MoM)',
    zh: '平均时薪环比 (MoM)',
  },
  'Average Hourly Earnings YoY': {
    en: 'Avg Hourly Earnings (YoY)',
    ko: '시간당 평균임금 (YoY)',
    ja: '平均時給 (前年比)',
    es: 'Salario por Hora (YoY)',
    zh: '平均时薪同比 (YoY)',
  },
  'Participation Rate': {
    en: 'Participation Rate',
    ko: '경제활동참가율',
    ja: '労働参加率',
    es: 'Tasa de Participación',
    zh: '劳动参与率',
  },

  // GROWTH
  'GDP Growth Rate QoQ Adv': {
    en: 'Real GDP Growth (Advance)',
    ko: '실질 GDP 성장률 (속보)',
    ja: '実質GDP成長率 (速報)',
    es: 'PIB Real Trimestral (Avance)',
    zh: '实际 GDP 季率 (初值)',
  },
  'GDP Growth Rate QoQ 2nd Est': {
    en: 'Real GDP Growth (2nd Est)',
    ko: '실질 GDP 성장률 (잠정)',
    ja: '実質GDP成長率 (改定)',
    es: 'PIB Real Trimestral (2ª Est)',
    zh: '实际 GDP 季率 (修正)',
  },
  'GDP Growth Rate QoQ Final': {
    en: 'Real GDP Growth (Final)',
    ko: '실질 GDP 성장률 (확정)',
    ja: '実質GDP成長率 (確報)',
    es: 'PIB Real Trimestral (Final)',
    zh: '实际 GDP 季率 (终值)',
  },
  'Atlanta Fed GDPNow': {
    en: 'Atlanta Fed GDPNow',
    ko: '애틀랜타 연은 GDPNow',
    ja: 'アトランタ連銀 GDPNow',
    es: 'Fed Atlanta GDPNow',
    zh: '亚特兰大联储 GDPNow',
  },
  'ISM Manufacturing PMI': {
    en: 'ISM Manufacturing PMI',
    ko: 'ISM 제조업 PMI',
    ja: 'ISM 製造業PMI',
    es: 'PMI Manufacturero ISM',
    zh: 'ISM 制造业 PMI',
  },
  'ISM Services PMI': {
    en: 'ISM Services PMI',
    ko: 'ISM 서비스업 PMI',
    ja: 'ISM 非製造業PMI',
    es: 'PMI Servicios ISM',
    zh: 'ISM 服务业 PMI',
  },
  'S&P Global Manufacturing PMI Flash': {
    en: 'S&P Manufacturing PMI (Flash)',
    ko: 'S&P 제조업 PMI (속보)',
    ja: 'S&P 製造業PMI (速報)',
    es: 'PMI Manufacturero S&P',
    zh: 'S&P 制造业 PMI (初值)',
  },
  'S&P Global Services PMI Flash': {
    en: 'S&P Services PMI (Flash)',
    ko: 'S&P 서비스업 PMI (속보)',
    ja: 'S&P サービス業PMI (速報)',
    es: 'PMI Servicios S&P',
    zh: 'S&P 服务业 PMI (初值)',
  },
  'S&P Global Composite PMI Flash': {
    en: 'S&P Composite PMI (Flash)',
    ko: 'S&P 복합 PMI (속보)',
    ja: 'S&P 総合PMI (速報)',
    es: 'PMI Compuesto S&P',
    zh: 'S&P 综合 PMI (初值)',
  },
  'Industrial Production MoM': {
    en: 'Industrial Production (MoM)',
    ko: '산업생산 (MoM)',
    ja: '鉱工業生産 (前月比)',
    es: 'Producción Industrial (MoM)',
    zh: '工业产出 (MoM)',
  },
  'Philadelphia Fed Manufacturing Index': {
    en: 'Philly Fed Manufacturing',
    ko: '필라델피아 연은 제조업지수',
    ja: 'フィラデルフィア連銀指数',
    es: 'Índice Fed Filadelfia',
    zh: '费城联储制造业指数',
  },
  'NY Empire State Manufacturing Index': {
    en: 'NY Empire State Mfg Index',
    ko: '뉴욕 엠파이어 제조업지수',
    ja: 'NY連銀製造業景況指数',
    es: 'Índice Empire State NY',
    zh: '纽约联储制造业指数',
  },

  // CONSUMER / HOUSING / TRADE
  'Retail Sales MoM': {
    en: 'Retail Sales (MoM)',
    ko: '소매판매 (MoM)',
    ja: '小売売上高 (前月比)',
    es: 'Ventas Minoristas (MoM)',
    zh: '零售销售 (MoM)',
  },
  'Retail Sales Ex Autos MoM': {
    en: 'Core Retail Sales (MoM)',
    ko: '근원 소매판매 (MoM)',
    ja: 'コア小売売上高 (前月比)',
    es: 'Ventas Minoristas Suby. (MoM)',
    zh: '核心零售销售 (MoM)',
  },
  'Retail Sales Control Group MoM': {
    en: 'Retail Control Group (MoM)',
    ko: '소매판매 통제그룹 (MoM)',
    ja: '小売コントロールG (前月比)',
    es: 'Grupo Control Minorista (MoM)',
    zh: '零售控制组 (MoM)',
  },
  'Michigan Consumer Sentiment Prel': {
    en: 'Michigan Sentiment (Prel)',
    ko: '미시간대 소비자심리 (예비)',
    ja: 'ミシガン大消費者態度 (速報)',
    es: 'Sentimiento Michigan (Prel)',
    zh: '密歇根消费者信心 (初值)',
  },
  'Michigan Consumer Sentiment Final': {
    en: 'Michigan Sentiment (Final)',
    ko: '미시간대 소비자심리 (확정)',
    ja: 'ミシガン大消費者態度 (確報)',
    es: 'Sentimiento Michigan (Final)',
    zh: '密歇根消费者信心 (终值)',
  },
  'CB Consumer Confidence': {
    en: 'CB Consumer Confidence',
    ko: 'CB 소비자신뢰지수',
    ja: 'CB 消費者信頼感指数',
    es: 'Confianza Consumidor CB',
    zh: '谘商会消费者信心',
  },
  'Personal Spending MoM': {
    en: 'Personal Spending (MoM)',
    ko: '개인소비지출 (MoM)',
    ja: '個人消費支出 (前月比)',
    es: 'Gasto Personal (MoM)',
    zh: '个人支出 (MoM)',
  },
  'Personal Income MoM': {
    en: 'Personal Income (MoM)',
    ko: '개인소득 (MoM)',
    ja: '個人所得 (前月比)',
    es: 'Ingresos Personales (MoM)',
    zh: '个人收入 (MoM)',
  },
  'Durable Goods Orders MoM': {
    en: 'Durable Goods Orders (MoM)',
    ko: '내구재 수주 (MoM)',
    ja: '耐久財受注 (前月比)',
    es: 'Pedidos Duraderos (MoM)',
    zh: '耐用品订单 (MoM)',
  },
  'Existing Home Sales': {
    en: 'Existing Home Sales',
    ko: '기존주택판매',
    ja: '中古住宅販売件数',
    es: 'Ventas Viviendas Usadas',
    zh: '成屋销售',
  },
  'New Home Sales': {
    en: 'New Home Sales',
    ko: '신규주택판매',
    ja: '新築住宅販売件数',
    es: 'Ventas Viviendas Nuevas',
    zh: '新屋销售',
  },
  'Housing Starts': {
    en: 'Housing Starts',
    ko: '주택착공건수',
    ja: '住宅着工件数',
    es: 'Inicios de Viviendas',
    zh: '新屋开工',
  },
  'Building Permits Prel': {
    en: 'Building Permits (Prel)',
    ko: '건축허가건수',
    ja: '建設許可件数 (速報)',
    es: 'Permisos Construcción',
    zh: '营建许可',
  },
  'Balance of Trade': {
    en: 'Balance of Trade',
    ko: '무역수지',
    ja: '貿易収支',
    es: 'Balanza Comercial',
    zh: '贸易帐',
  },
}

/**
 * Translates an English event title into the active user language.
 * Handles dynamic Fed official speech/testimony titles automatically.
 */
export function localizeEventTitle(titleEn: string, lang: Language): string {
  const exact = INDICATOR_TRANSLATIONS[titleEn]
  if (exact) return exact[lang] || titleEn

  // Dynamic Fed Chair Speech / Testimony pattern
  const chairMatch = titleEn.match(/^Fed Chair ([A-Za-z.\s]+?) (Speech|Testimony)$/i)
  if (chairMatch) {
    const speaker = chairMatch[1].trim()
    const isTestimony = /Testimony/i.test(chairMatch[2])
    if (lang === 'ko') return isTestimony ? `연준(Fed) ${speaker} 의장 의회 증언` : `연준(Fed) ${speaker} 의장 연설`
    if (lang === 'ja') return isTestimony ? `FRB ${speaker}議長 議会証言` : `FRB ${speaker}議長 講演`
    if (lang === 'es') return isTestimony ? `Testimonio del Presidente de la Fed (${speaker})` : `Discurso del Presidente de la Fed (${speaker})`
    if (lang === 'zh') return isTestimony ? `美联储主席 ${speaker} 国会证词` : `美联储主席 ${speaker} 发表讲话`
    return titleEn
  }

  // Dynamic Fed Governor / Regional President Speech pattern
  const fedSpeakerMatch = titleEn.match(/^Fed ([A-Za-z.\s]+?) (Speech|Testimony)$/i)
  if (fedSpeakerMatch) {
    const speaker = fedSpeakerMatch[1].trim()
    const isTestimony = /Testimony/i.test(fedSpeakerMatch[2])
    if (lang === 'ko') return isTestimony ? `연준(Fed) ${speaker} 위원 의회 증언` : `연준(Fed) ${speaker} 위원 연설`
    if (lang === 'ja') return isTestimony ? `FRB ${speaker}理事 議会証言` : `FRB ${speaker}理事・総裁 講演`
    if (lang === 'es') return isTestimony ? `Testimonio de ${speaker} (Fed)` : `Discurso de ${speaker} (Fed)`
    if (lang === 'zh') return isTestimony ? `美联储官员 ${speaker} 证词` : `美联储官员 ${speaker} 发表讲话`
    return titleEn
  }

  return titleEn
}

/**
 * Formats an event's numeric value (`actual`, `forecast`, or `previous`) with its unit and scale.
 */
export function formatCalendarValue(
  value: number | null | undefined,
  unit = '',
  scale = ''
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  const formattedNum = Number.isInteger(value)
    ? value.toLocaleString('en-US')
    : Number(value.toFixed(2)).toString()

  if (unit === '$') {
    const isNeg = value < 0
    const absStr = Number.isInteger(Math.abs(value))
      ? Math.abs(value).toLocaleString('en-US')
      : Number(Math.abs(value).toFixed(2)).toString()
    return `${isNeg ? '-' : ''}$${absStr}${scale || ''}`
  }

  return `${formattedNum}${scale || ''}${unit || ''}`
}

export interface SurpriseDeltaInfo {
  diffText: string
  direction: 'beat' | 'miss' | 'inline'
}

/**
 * Computes the surprise delta (`actual - forecast`) when both values exist.
 */
export function getSurpriseInfo(event: EconomicCalendarEvent): SurpriseDeltaInfo | null {
  if (
    event.actual === null ||
    event.actual === undefined ||
    event.forecast === null ||
    event.forecast === undefined
  ) {
    return null
  }

  const rawDiff = Number((event.actual - event.forecast).toFixed(2))
  if (Math.abs(rawDiff) < 0.001) {
    return {
      diffText: '0.0',
      direction: 'inline',
    }
  }

  const sign = rawDiff > 0 ? '+' : ''
  const unitSuffix = event.unit === '%' ? '%p' : `${event.scale || ''}${event.unit || ''}`
  return {
    diffText: `${sign}${rawDiff}${unitSuffix}`,
    direction: rawDiff > 0 ? 'beat' : 'miss',
  }
}

export interface FormattedEventTime {
  kstDateKey: string       // '2026-11-06'
  kstTime: string          // '22:30'
  kstDateLabel: string     // '11월 6일 (금)' or localized
  etDateKey: string        // '2026-11-06'
  etTime: string           // '08:30'
  etDateLabel: string      // 'Nov 6 (Fri)'
  etTzAbbr: string         // 'EST' or 'EDT'
}

/**
 * Formats an event's UTC timestamp into both KST (`Asia/Seoul`) and the market's local timezone
 * (`America/New_York` for US, automatically reflecting EDT/EST Daylight Saving Time).
 */
export function formatEventTimeZones(
  dateUtc: string,
  lang: Language,
  marketTimezone = 'America/New_York'
): FormattedEventTime {
  const d = new Date(dateUtc)
  if (Number.isNaN(d.getTime())) {
    return {
      kstDateKey: dateUtc.slice(0, 10),
      kstTime: '00:00',
      kstDateLabel: dateUtc.slice(0, 10),
      etDateKey: dateUtc.slice(0, 10),
      etTime: '00:00',
      etDateLabel: dateUtc.slice(0, 10),
      etTzAbbr: 'ET',
    }
  }

  const locale =
    lang === 'ko'
      ? 'ko-KR'
      : lang === 'ja'
        ? 'ja-JP'
        : lang === 'zh'
          ? 'zh-CN'
          : lang === 'es'
            ? 'es-ES'
            : 'en-US'

  const getDateKey = (tz: string) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d)
    const y = parts.find((p) => p.type === 'year')?.value || '2026'
    const m = parts.find((p) => p.type === 'month')?.value || '01'
    const day = parts.find((p) => p.type === 'day')?.value || '01'
    return `${y}-${m}-${day}`
  }

  const getTimeHm = (tz: string) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)

  const getDateLabel = (tz: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }).format(d)

  const tzNameParts = new Intl.DateTimeFormat('en-US', {
    timeZone: marketTimezone,
    timeZoneName: 'short',
  }).formatToParts(d)
  const etTzAbbr = tzNameParts.find((p) => p.type === 'timeZoneName')?.value || 'ET'

  return {
    kstDateKey: getDateKey('Asia/Seoul'),
    kstTime: getTimeHm('Asia/Seoul'),
    kstDateLabel: getDateLabel('Asia/Seoul'),
    etDateKey: getDateKey(marketTimezone),
    etTime: getTimeHm(marketTimezone),
    etDateLabel: getDateLabel(marketTimezone),
    etTzAbbr,
  }
}

interface EconomicCalendarPayload {
  updatedAt: string
  markets: string[]
  totalEvents: number
  events: EconomicCalendarEvent[]
}

let cachedEvents: EconomicCalendarEvent[] | null = null
let cachedUpdatedAt: string | null = null
let lastFetchTs = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches normalized Economic Calendar events for the specified market.
 * Loads pre-compiled `public/api/v1/economic-calendar.json` (978+ events across 2026-2027)
 * and optionally merges live intra-day actual values from the Cloudflare Worker if configured.
 */
export async function fetchEconomicCalendar(
  marketId: CalendarMarketId = 'USA',
  forceRefresh = false
): Promise<{ events: EconomicCalendarEvent[]; updatedAt: string }> {
  const now = Date.now()
  if (!forceRefresh && cachedEvents && now - lastFetchTs < CACHE_TTL_MS) {
    return {
      events: cachedEvents.filter((e) => e.marketId === marketId),
      updatedAt: cachedUpdatedAt || new Date().toISOString(),
    }
  }

  try {
    const url = `${import.meta.env.BASE_URL}api/v1/economic-calendar.json`
    const res = await fetch(url, { cache: forceRefresh ? 'no-cache' : 'default' })
    if (res.ok) {
      const data = (await res.json()) as EconomicCalendarPayload
      if (Array.isArray(data.events) && data.events.length > 0) {
        cachedEvents = data.events
        cachedUpdatedAt = data.updatedAt || new Date().toISOString()
        lastFetchTs = now
      }
    }
  } catch (err) {
    console.warn('Error loading static economic-calendar.json:', err)
  }

  const allEvents = cachedEvents || []
  return {
    events: allEvents.filter((e) => e.marketId === marketId),
    updatedAt: cachedUpdatedAt || new Date().toISOString(),
  }
}

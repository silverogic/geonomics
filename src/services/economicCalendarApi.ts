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
    en: 'FOMC Fed Interest Rate Decision',
    ko: 'FOMC 연준 기준금리 결정',
    ja: 'FOMC FRB政策金利発表',
    es: 'Decisión de Tipos de Interés de la Fed (FOMC)',
    zh: '美联储 FOMC 利率决议',
  },
  'FOMC Economic Projections': {
    en: 'FOMC Economic Projections (Dot Plot / SEP)',
    ko: 'FOMC 경제전망 요약 및 점도표 (Dot Plot)',
    ja: 'FOMC 経済見通し・ドットプロット (SEP)',
    es: 'Proyecciones Económicas del FOMC (Dot Plot)',
    zh: 'FOMC 经济预测摘要与点阵图 (Dot Plot)',
  },
  'FOMC Statement': {
    en: 'FOMC Monetary Policy Statement',
    ko: 'FOMC 통화정책 성명서 발표',
    ja: 'FOMC 声明発表',
    es: 'Comunicado del FOMC sobre Política Monetaria',
    zh: 'FOMC 货币政策声明',
  },
  'Fed Press Conference': {
    en: 'Fed Chair FOMC Press Conference',
    ko: '연준(Fed) 의장 FOMC 기자회견',
    ja: 'FRB議長 FOMC記者会見',
    es: 'Rueda de Prensa del Presidente de la Fed',
    zh: '美联储主席 FOMC 新闻发布会',
  },
  'FOMC Minutes': {
    en: 'FOMC Meeting Minutes Release',
    ko: 'FOMC 정례회의 의사록 공개',
    ja: 'FOMC 議事要旨公表',
    es: 'Actas de la Reunión del FOMC',
    zh: '美联储 FOMC 会议纪要公布',
  },
  'Fed Beige Book': {
    en: 'Federal Reserve Beige Book',
    ko: '연준 경기동향 보고서 (베이지북)',
    ja: 'FRB ベージュブック（地区連銀経済報告）',
    es: 'Libro Beige de la Reserva Federal',
    zh: '美联储经济状况褐皮书 (Beige Book)',
  },
  'Fed Balance Sheet': {
    en: 'Federal Reserve Balance Sheet (H.4.1)',
    ko: '연준 대차대조표 자산 규모 (QT 추이)',
    ja: 'FRB バランスシート総資産残高',
    es: 'Balance General de la Reserva Federal',
    zh: '美联储资产负债表规模',
  },
  'Jackson Hole Symposium': {
    en: 'Jackson Hole Economic Policy Symposium',
    ko: '잭슨홀 경제정책 심포지엄',
    ja: 'ジャクソンホール経済シンポジウム',
    es: 'Simposio Económico de Jackson Hole',
    zh: '杰克逊霍尔全球央行年会',
  },

  // INFLATION
  'Inflation Rate YoY': {
    en: 'CPI Inflation Rate (YoY)',
    ko: '소비자물가지수 CPI (전년비 YoY)',
    ja: '消費者物価指数 CPI (前年比 YoY)',
    es: 'Tasa de Inflación IPC (Anual YoY)',
    zh: '消费者物价指数 CPI (同比 YoY)',
  },
  'Inflation Rate MoM': {
    en: 'CPI Inflation Rate (MoM)',
    ko: '소비자물가지수 CPI (전월비 MoM)',
    ja: '消費者物価指数 CPI (前月比 MoM)',
    es: 'Tasa de Inflación IPC (Mensual MoM)',
    zh: '消费者物价指数 CPI (环比 MoM)',
  },
  'Core Inflation Rate YoY': {
    en: 'Core CPI Inflation Rate (YoY)',
    ko: '근원 소비자물가지수 Core CPI (전년비 YoY)',
    ja: 'コア消費者物価指数 Core CPI (前年比 YoY)',
    es: 'IPC Subyacente Core CPI (Anual YoY)',
    zh: '核心消费者物价指数 Core CPI (同比 YoY)',
  },
  'Core Inflation Rate MoM': {
    en: 'Core CPI Inflation Rate (MoM)',
    ko: '근원 소비자물가지수 Core CPI (전월비 MoM)',
    ja: 'コア消費者物価指数 Core CPI (前月比 MoM)',
    es: 'IPC Subyacente Core CPI (Mensual MoM)',
    zh: '核心消费者物价指数 Core CPI (环比 MoM)',
  },
  'Core PCE Price Index YoY': {
    en: 'Core PCE Price Index (YoY)',
    ko: '근원 개인소비지출 물가 Core PCE (전년비 YoY)',
    ja: 'コアPCEデフレーター (前年比 YoY)',
    es: 'Índice de Precios PCE Subyacente (Anual YoY)',
    zh: '核心 PCE 物价指数 (同比 YoY)',
  },
  'Core PCE Price Index MoM': {
    en: 'Core PCE Price Index (MoM)',
    ko: '근원 개인소비지출 물가 Core PCE (전월비 MoM)',
    ja: 'コアPCEデフレーター (前月比 MoM)',
    es: 'Índice de Precios PCE Subyacente (Mensual MoM)',
    zh: '核心 PCE 物价指数 (环比 MoM)',
  },
  'PCE Price Index YoY': {
    en: 'PCE Price Index (YoY)',
    ko: '개인소비지출 물가지수 PCE (전년비 YoY)',
    ja: 'PCEデフレーター (前年比 YoY)',
    es: 'Índice de Precios PCE (Anual YoY)',
    zh: 'PCE 物价指数 (同比 YoY)',
  },
  'PCE Price Index MoM': {
    en: 'PCE Price Index (MoM)',
    ko: '개인소비지출 물가지수 PCE (전월비 MoM)',
    ja: 'PCEデフレーター (前月比 MoM)',
    es: 'Índice de Precios PCE (Mensual MoM)',
    zh: 'PCE 物价指数 (环比 MoM)',
  },
  'PPI MoM': {
    en: 'Producer Price Index PPI (MoM)',
    ko: '생산자물가지수 PPI (전월비 MoM)',
    ja: '生産者物価指数 PPI (前月比 MoM)',
    es: 'Índice de Precios al Productor IPP (MoM)',
    zh: '生产者物价指数 PPI (环比 MoM)',
  },
  'PPI YoY': {
    en: 'Producer Price Index PPI (YoY)',
    ko: '생산자물가지수 PPI (전년비 YoY)',
    ja: '生産者物価指数 PPI (前年比 YoY)',
    es: 'Índice de Precios al Productor IPP (YoY)',
    zh: '生产者物价指数 PPI (同比 YoY)',
  },
  'Core PPI MoM': {
    en: 'Core Producer Price Index PPI (MoM)',
    ko: '근원 생산자물가지수 Core PPI (전월비 MoM)',
    ja: 'コア生産者物価指数 Core PPI (前月比 MoM)',
    es: 'IPP Subyacente Core PPI (MoM)',
    zh: '核心生产者物价指数 Core PPI (环比 MoM)',
  },
  'Core PPI YoY': {
    en: 'Core Producer Price Index PPI (YoY)',
    ko: '근원 생산자물가지수 Core PPI (전년비 YoY)',
    ja: 'コア生産者物価指数 Core PPI (前年比 YoY)',
    es: 'IPP Subyacente Core PPI (YoY)',
    zh: '核心生产者物价指数 Core PPI (同比 YoY)',
  },
  'Michigan Inflation Expectations Prel': {
    en: 'Michigan 1-Yr Inflation Expectations (Prelim)',
    ko: '미시간대 1년 기대인플레이션 (예비치)',
    ja: 'ミシガン大 1年先期待インフレ率 (速報値)',
    es: 'Expectativas de Inflación Michigan 1 Año (Prelim)',
    zh: '密歇根大学 1 年期通胀预期 (初值)',
  },
  'Michigan Inflation Expectations Final': {
    en: 'Michigan 1-Yr Inflation Expectations (Final)',
    ko: '미시간대 1년 기대인플레이션 (확정치)',
    ja: 'ミシガン大 1年先期待インフレ率 (確報値)',
    es: 'Expectativas de Inflación Michigan 1 Año (Final)',
    zh: '密歇根大学 1 年期通胀预期 (终值)',
  },
  'Michigan 5 Year Inflation Expectations Prel': {
    en: 'Michigan 5-Yr Inflation Expectations (Prelim)',
    ko: '미시간대 5년 장기 기대인플레이션 (예비치)',
    ja: 'ミシガン大 5年先期待インフレ率 (速報値)',
    es: 'Expectativas de Inflación Michigan 5 Años (Prelim)',
    zh: '密歇根大学 5 年期通胀预期 (初值)',
  },
  'Michigan 5 Year Inflation Expectations Final': {
    en: 'Michigan 5-Yr Inflation Expectations (Final)',
    ko: '미시간대 5년 장기 기대인플레이션 (확정치)',
    ja: 'ミシガン大 5年先期待インフレ率 (確報値)',
    es: 'Expectativas de Inflación Michigan 5 Años (Final)',
    zh: '密歇根大学 5 年期通胀预期 (终值)',
  },

  // EMPLOYMENT
  'Non Farm Payrolls': {
    en: 'Nonfarm Payrolls (NFP)',
    ko: '비농업 고용지수 (Nonfarm Payrolls)',
    ja: '非農業部門雇用者数 (NFP)',
    es: 'Nóminas No Agrícolas (NFP)',
    zh: '非农就业人数变动 (NFP)',
  },
  'Unemployment Rate': {
    en: 'Unemployment Rate',
    ko: '실업률 (Unemployment Rate)',
    ja: '失業率 (Unemployment Rate)',
    es: 'Tasa de Desempleo',
    zh: '失业率 (Unemployment Rate)',
  },
  'JOLTs Job Openings': {
    en: 'JOLTs Job Openings',
    ko: 'JOLTs 구인·이직 보고서 (구인건수)',
    ja: 'JOLTS 求人件数',
    es: 'Ofertas de Empleo JOLTs',
    zh: 'JOLTs 职位空缺数',
  },
  'Initial Jobless Claims': {
    en: 'Initial Jobless Claims',
    ko: '주간 신규 실업수당 청구건수',
    ja: '新規失業保険申請件数',
    es: 'Nuevas Peticiones de Subsidio por Desempleo',
    zh: '初请失业金人数',
  },
  'Continuing Jobless Claims': {
    en: 'Continuing Jobless Claims',
    ko: '연속 실업수당 청구건수',
    ja: '失業保険継続受給者数',
    es: 'Solicitudes Continuas de Desempleo',
    zh: '续请失业金人数',
  },
  'ADP Employment Change': {
    en: 'ADP Nonfarm Private Employment Change',
    ko: 'ADP 민간 비농업 고용변화',
    ja: 'ADP 全国雇用者数',
    es: 'Cambio de Empleo Privado ADP',
    zh: 'ADP 就业人数变动 (“小非农”)',
  },
  'Average Hourly Earnings MoM': {
    en: 'Average Hourly Earnings (MoM)',
    ko: '시간당 평균임금 상승률 (전월비 MoM)',
    ja: '平均時給 (前月比 MoM)',
    es: 'Ingresos Medios por Hora (MoM)',
    zh: '平均每小时工资 (环比 MoM)',
  },
  'Average Hourly Earnings YoY': {
    en: 'Average Hourly Earnings (YoY)',
    ko: '시간당 평균임금 상승률 (전년비 YoY)',
    ja: '平均時給 (前年比 YoY)',
    es: 'Ingresos Medios por Hora (YoY)',
    zh: '平均每小时工资 (同比 YoY)',
  },
  'Participation Rate': {
    en: 'Labor Force Participation Rate',
    ko: '경제활동참가율',
    ja: '労働参加率',
    es: 'Tasa de Participación Laboral',
    zh: '劳动参与率',
  },

  // GROWTH
  'GDP Growth Rate QoQ Adv': {
    en: 'Real GDP Growth Rate QoQ (Advance)',
    ko: '실질 GDP 성장률 연율 (속보치 Adv)',
    ja: '実質GDP成長率 前期比年率 (速報値)',
    es: 'Crecimiento del PIB Real Trimestral (Avance)',
    zh: '实际 GDP 年化季率 (初值)',
  },
  'GDP Growth Rate QoQ 2nd Est': {
    en: 'Real GDP Growth Rate QoQ (2nd Estimate)',
    ko: '실질 GDP 성장률 연율 (잠정치 2nd Est)',
    ja: '実質GDP成長率 前期比年率 (改定値)',
    es: 'Crecimiento del PIB Real Trimestral (2ª Est.)',
    zh: '实际 GDP 年化季率 (修正值)',
  },
  'GDP Growth Rate QoQ Final': {
    en: 'Real GDP Growth Rate QoQ (Final)',
    ko: '실질 GDP 성장률 연율 (확정치 Final)',
    ja: '実質GDP成長率 前期比年率 (確報値)',
    es: 'Crecimiento del PIB Real Trimestral (Final)',
    zh: '实际 GDP 年化季率 (终值)',
  },
  'Atlanta Fed GDPNow': {
    en: 'Atlanta Fed GDPNow Estimate',
    ko: '애틀랜타 연은 GDPNow 실시간 성장률 전망',
    ja: 'アトランタ連銀 GDPNow 予測',
    es: 'Estimación GDPNow de la Fed de Atlanta',
    zh: '亚特兰大联储 GDPNow 增长预测',
  },
  'ISM Manufacturing PMI': {
    en: 'ISM Manufacturing PMI',
    ko: 'ISM 제조업 구매관리자지수 (PMI)',
    ja: 'ISM 製造業景況指数 (PMI)',
    es: 'PMI Manufacturero del ISM',
    zh: 'ISM 制造业采购经理人指数 (PMI)',
  },
  'ISM Services PMI': {
    en: 'ISM Services (Non-Manufacturing) PMI',
    ko: 'ISM 서비스업(비제조업) 구매관리자지수 (PMI)',
    ja: 'ISM 非製造業（サービス業）景況指数 (PMI)',
    es: 'PMI de Servicios del ISM',
    zh: 'ISM 非制造业 (服务业) PMI',
  },
  'S&P Global Manufacturing PMI Flash': {
    en: 'S&P Global Manufacturing PMI (Flash)',
    ko: 'S&P 글로벌 제조업 PMI (속보치)',
    ja: 'S&Pグローバル 製造業PMI (速報値)',
    es: 'PMI Manufacturero S&P Global (Flash)',
    zh: 'S&P Global 制造业 PMI (初值)',
  },
  'S&P Global Services PMI Flash': {
    en: 'S&P Global Services PMI (Flash)',
    ko: 'S&P 글로벌 서비스업 PMI (속보치)',
    ja: 'S&Pグローバル サービス業PMI (速報値)',
    es: 'PMI de Servicios S&P Global (Flash)',
    zh: 'S&P Global 服务业 PMI (初值)',
  },
  'S&P Global Composite PMI Flash': {
    en: 'S&P Global Composite PMI (Flash)',
    ko: 'S&P 글로벌 복합 PMI (속보치)',
    ja: 'S&Pグローバル 総合PMI (速報値)',
    es: 'PMI Compuesto S&P Global (Flash)',
    zh: 'S&P Global 综合 PMI (初值)',
  },
  'Industrial Production MoM': {
    en: 'Industrial Production (MoM)',
    ko: '산업생산 (전월비 MoM)',
    ja: '鉱工業生産指数 (前月比 MoM)',
    es: 'Producción Industrial (MoM)',
    zh: '工业产出率 (环比 MoM)',
  },
  'Philadelphia Fed Manufacturing Index': {
    en: 'Philadelphia Fed Manufacturing Index',
    ko: '필라델피아 연은 제조업지수',
    ja: 'フィラデルフィア連銀製造業景황指数',
    es: 'Índice Manufacturero de la Fed de Filadelfia',
    zh: '费城联储制造业指数',
  },
  'NY Empire State Manufacturing Index': {
    en: 'NY Empire State Manufacturing Index',
    ko: '뉴욕 엠파이어스테이트 제조업지수',
    ja: 'NY連銀製造業景況指数',
    es: 'Índice Manufacturero Empire State de NY',
    zh: '纽约联储制造业指数',
  },

  // CONSUMER / HOUSING / TRADE
  'Retail Sales MoM': {
    en: 'Retail Sales (MoM)',
    ko: '소매판매 (전월비 MoM)',
    ja: '小売売上高 (前月比 MoM)',
    es: 'Ventas Minoristas (MoM)',
    zh: '零售销售月率 (MoM)',
  },
  'Retail Sales Ex Autos MoM': {
    en: 'Core Retail Sales Ex-Autos (MoM)',
    ko: '근원 소매판매 (자동차 제외, 전월비 MoM)',
    ja: 'コア小売売上高 (除自動車, 前月比 MoM)',
    es: 'Ventas Minoristas Subyacentes Ex-Autos (MoM)',
    zh: '核心零售销售月率 (除汽车 MoM)',
  },
  'Retail Sales Control Group MoM': {
    en: 'Retail Sales Control Group (MoM)',
    ko: '소매판매 통제그룹 (GDP 반영 핵심소비, MoM)',
    ja: '小売売上高 コントロールグループ (MoM)',
    es: 'Ventas Minoristas Grupo de Control (MoM)',
    zh: '零售销售控制组月率 (MoM)',
  },
  'Michigan Consumer Sentiment Prel': {
    en: 'Michigan Consumer Sentiment Index (Prelim)',
    ko: '미시간대 소비자심리지수 (예비치)',
    ja: 'ミシガン大学消費者態度指数 (速報値)',
    es: 'Sentimiento del Consumidor de Michigan (Prelim)',
    zh: '密歇根大学消费者信心指数 (初值)',
  },
  'Michigan Consumer Sentiment Final': {
    en: 'Michigan Consumer Sentiment Index (Final)',
    ko: '미시간대 소비자심리지수 (확정치)',
    ja: 'ミシガン大学消費者態度指数 (確報値)',
    es: 'Sentimiento del Consumidor de Michigan (Final)',
    zh: '密歇根大学消费者信心指数 (终值)',
  },
  'CB Consumer Confidence': {
    en: 'CB Consumer Confidence Index',
    ko: '컨퍼런스보드 소비자신뢰지수',
    ja: 'コンファレンスボード消費者信頼感指数',
    es: 'Confianza del Consumidor de The Conference Board',
    zh: '谘商会消费者信心指数',
  },
  'Personal Spending MoM': {
    en: 'Personal Spending (MoM)',
    ko: '개인소비지출 (전월비 MoM)',
    ja: '個人消費支出 (前月比 MoM)',
    es: 'Gasto Personal (MoM)',
    zh: '个人支出月率 (MoM)',
  },
  'Personal Income MoM': {
    en: 'Personal Income (MoM)',
    ko: '개인소득 (전월비 MoM)',
    ja: '個人所得 (前月比 MoM)',
    es: 'Ingresos Personales (MoM)',
    zh: '个人收入月率 (MoM)',
  },
  'Durable Goods Orders MoM': {
    en: 'Durable Goods Orders (MoM)',
    ko: '내구재 수주 (전월비 MoM)',
    ja: '耐久財受注 (前月比 MoM)',
    es: 'Pedidos de Bienes Duraderos (MoM)',
    zh: '耐用品订单月率 (MoM)',
  },
  'Existing Home Sales': {
    en: 'Existing Home Sales',
    ko: '기존주택판매',
    ja: '中古住宅販売件数',
    es: 'Ventas de Viviendas de Segunda Mano',
    zh: '成屋销售年化总数',
  },
  'New Home Sales': {
    en: 'New Home Sales',
    ko: '신규주택판매',
    ja: '新築住宅販売件数',
    es: 'Ventas de Viviendas Nuevas',
    zh: '新屋销售年化总数',
  },
  'Housing Starts': {
    en: 'Housing Starts',
    ko: '주택착공건수',
    ja: '住宅着工件数',
    es: 'Inicios de Construcción de Viviendas',
    zh: '新屋开工年化总数',
  },
  'Building Permits Prel': {
    en: 'Building Permits (Prelim)',
    ko: '건축허가건수 (예비치)',
    ja: '建設許可件数 (速報値)',
    es: 'Permisos de Construcción (Prelim)',
    zh: '营建许可年化总数 (初值)',
  },
  'Balance of Trade': {
    en: 'Balance of Trade',
    ko: '무역수지 (Balance of Trade)',
    ja: '貿易収支',
    es: 'Balanza Comercial',
    zh: '贸易帐 (进出口贸易差额)',
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

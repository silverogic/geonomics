export type Language = 'en' | 'ko' | 'ja' | 'es' | 'zh'

export const translations = {
  en: {
    // Header & Nav
    appTitle: 'Geonomics',
    appSubtitle: 'Real-time Exchange Rates & World Bank · IMF Official Statistics',
    liveBadge: 'LIVE',
    navExplorer: 'Country Explorer',
    navCompare: '1:1 Comparison',
    baseCurrencyLabel: 'Base Currency:',
    refreshBtn: 'Refresh',
    refreshTooltip: 'Refresh on-demand data',

    // Ticker
    tickerTitle: 'Key Real-time Exchange Rates',
    asOf: 'Updated:',

    // Hero Section
    heroBadge: 'Official World Bank & IMF Data × Real-time Forex Feed',
    heroTitle: 'Real-time Global Forex & GDP Analysis',
    heroDescription:
      'A zero-database, on-demand economic intelligence platform. Directly queries authoritative international public APIs (World Bank Open Data, IMF World Economic Outlook, and European Central Bank) to deliver accurate macroeconomic indicators and real-time exchange rates.',
    statCountriesTracked: 'Countries Tracked',
    statBaseCurrency: 'Current Base Currency',
    statTopEconomy: 'World #1 Economy',
    statLocalEconomy: 'Local Economy ({country})',

    // Filters & Search
    searchPlaceholder: 'Search by country, code, or currency...',
    filterAll: 'All',
    filterAsia: 'Asia',
    filterEurope: 'Europe',
    filterAmericas: 'Americas',
    filterAfrica: 'Africa',
    filterOceania: 'Oceania',
    viewCards: 'Card View',
    viewTable: 'Table View',

    // Map View
    mapTitle: 'Global GDP Map Explorer',
    mapSubtitle: 'Real-time Forex & Official World Bank · IMF Macroeconomic Intelligence',
    mapMetricLabel: 'Indicator',
    metricTotalGdp: 'Total GDP',
    metricPerCapita: 'GDP Per Capita',
    metricGrowth: 'Real Growth',
    metricDebt: 'Gov Debt %',
    metricInflation: 'Inflation Rate',
    mapResetZoom: 'Reset',
    mapZoomIn: 'Zoom In',
    mapZoomOut: 'Zoom Out',
    top10Title: 'World Top 10 Economies',
    legendTitle: 'Indicator Scale',
    clickCountryHint: 'Click any country for 10-year historical trajectory & forex',
    selectedCountryBadge: 'Selected Economy',
    viewDetailsBtn: 'Deep Dive & 10-Yr Chart',
    viewMap: 'World Map View',
    mapStyleLabel: 'Map Style',
    mapStyleTile: 'Tile Map',
    mapStyleVector: 'Detailed Map',

    // Year Switcher
    yearLabel: 'Economic Horizon',
    yearActual: '{year} Actual',
    yearEstimate: '{year} Est.',
    yearProjection: '{year} Proj.',

    // Country Card
    cardTotalGdp: 'Total GDP',
    cardPerCapita: 'GDP Per Capita',
    cardStockIndex: 'Stock Benchmark',
    cardInterestRate: 'Policy Rate',
    cardFxRate: 'Live FX Rate',
    cardGrowthRate: 'Growth Rate',
    cardDebtRatio: 'Gov Debt',
    cardInflationRate: 'Inflation Rate',
    cardViewDetails: 'Detailed Metrics & 10-Yr Chart',
    loadingData: 'Loading data...',
    noCountriesFound: 'No countries match your search criteria.',

    // Modal
    modalContinent: 'Region',
    modalCurrency: 'Currency',
    modalTotalGdpTitle: 'Total GDP',
    modalPerCapitaTitle: 'GDP Per Capita',
    modalGrowthTitle: 'Annual GDP Growth',
    modalRealGrowth: 'Real GDP Growth',
    modalDebtTitle: 'National Debt Ratio',
    modalDebtSub: 'General Government Gross Debt (% of GDP, IMF WEO)',
    modalInflationTitle: 'Inflation Rate',
    modalInflationSub: 'Avg. Consumer Prices (Annual % Change, IMF WEO)',
    modalRankTitle: 'Global Rank',
    modalRankValue: 'World #{rank}',
    modalRankSub: 'by Total GDP',
    modalInterestRateTitle: 'Central Bank Policy Rate',
    modalInterestRateSub: 'Official benchmark interest rate (BIS SDMX / Central Bank)',
    modalFxSectionTitle: 'Official Live Exchange Rate',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: 'Forex Market Timestamp',
    modalStockIndexTitle: 'National Stock Market Benchmark',
    modalStockIndexSub: 'Official exchange live feed & interactive chart',
    modalChartTitle: '10-Year GDP Trajectory ({startYear} - {year})',
    modalChartUnit: 'Unit: converted in {base}',
    modalChartLoading: 'Loading World Bank time-series data...',
    modalAccuracyTitle: 'Data Integrity & Authoritative Sources',
    modalAccuracyGdp:
      'GDP Statistics: Sourced directly from World Bank Open Data (Indicators: Total GDP NY.GDP.MKTP.CD, GDP Per Capita NY.GDP.PCAP.CD) and IMF World Economic Outlook (WEO).',
    modalAccuracyDebt:
      'Government Debt Statistics: Sourced from International Monetary Fund (IMF) World Economic Outlook (WEO) General Government Gross Debt indicator (GGXWDG_NGDP).',
    modalAccuracyInflation:
      'Inflation Rate Statistics: Sourced from International Monetary Fund (IMF) World Economic Outlook (WEO) Inflation rate, average consumer prices indicator (PCPIPCH).',
    modalAccuracyFx:
      'Exchange Rates: Collected on-demand from European Central Bank (ECB) reference rates and global live forex feeds.',
    modalWorldBankLink: 'Visit World Bank Country Data Portal',
    modalImfLink: 'Visit IMF Data Portal',
    modalClose: 'Close',

    // Currency Converter
    converterTitle: 'Real-time Currency Converter',
    converterSending: 'Amount',
    converterConverted: 'Estimated Value',
    swapCurrencies: 'Swap currencies',

    // 1:1 Compare View
    compareTitle: '1:1 Country Scale & Forex Comparison',
    compareDescription:
      'Compare World Bank & IMF official macroeconomic trends and real-time exchange rates side by side.',
    compareRecommended: 'Popular Comparisons:',
    compareBaseCountry: 'Base Country (A)',
    compareTargetCountry: 'Comparison Country (B)',
    compareInsightTitle: 'Comparative Summary:',
    compareInsightText:
      '{countryA}\'s Total GDP is {gdpRatio}x that of {countryB}, and its GDP per capita is {perCapitaRatio}x.',
    compareDebtRatio: 'Gov Debt (% GDP, IMF)',
    compareInflationRate: 'Inflation Rate (Avg. CPI, IMF)',
    compareInterestRate: 'Policy Rate',
    compareSpread: 'Policy Rate Spread (A - B)',
    compareChartTitle: '10-Year GDP Trajectory Overlay',
    compareChartLoading: 'Aggregating comparative data...',

    // Ranking Table
    tableTitle: 'Global GDP & Exchange Rate Rankings',
    tableSubtitle: 'Official World Bank & IMF macroeconomic statistics covering {count} major economies',
    colRank: 'Rank',
    colCountry: 'Country',
    colCurrency: 'Currency',
    colFxRate: 'Live FX Rate ({base})',
    colStockIndex: 'Stock Benchmark',
    colInterestRate: 'Policy Rate',
    colTotalGdp: 'Total GDP',
    colPerCapita: 'GDP Per Capita',
    colGrowth: 'Growth Rate',
    colDebt: 'Gov Debt',
    colInflation: 'Inflation',

    // Footer
    footerZeroStorageTitle: 'Zero-Storage On-Demand Architecture',
    footerZeroStorageDesc:
      'This website operates with zero persistent backend storage or databases. Data is retrieved on-demand directly by your browser from official international endpoints (World Bank Open Data, IMF WEO, and ECB).',
    footerDisclaimer:
      'Macroeconomic statistics and exchange rates are provided for informational and analytical purposes. Financial and investment decisions are the sole responsibility of the user.',
    footerWorldBank: 'World Bank Open Data',
    footerImf: 'IMF DataMapper (WEO)',
    footerEcb: 'European Central Bank (ECB) Reference Rates',
    footerBis: 'Bank for International Settlements (BIS) Policy Rates',
    footerGithub: 'Hosted on GitHub Pages',
  },
  ko: {
    // Header & Nav
    appTitle: 'Geonomics',
    appSubtitle: '실시간 환율 & 세계은행(World Bank) · 국제통화기금(IMF) 공식 통계',
    liveBadge: 'LIVE',
    navExplorer: '국가 탐색',
    navCompare: '1:1 비교',
    baseCurrencyLabel: '기준 통화:',
    refreshBtn: '새로고침',
    refreshTooltip: '실시간 데이터 새로고침',

    // Ticker
    tickerTitle: '주요 실시간 환율',
    asOf: '업데이트:',

    // Hero Section
    heroBadge: '세계은행(World Bank) · IMF WEO 공식 통계 × 실시간 환율 연동',
    heroTitle: '전 세계 국가별 환율 & GDP 실시간 분석',
    heroDescription:
      '별도의 데이터베이스 없이 세계은행(World Bank), 국제통화기금(IMF WEO), 유럽중앙은행(ECB) 등 권위 있는 국제 공공기관의 공식 데이터를 온디맨드로 직접 연동하여 가장 신뢰도 높은 거시경제 지표와 실시간 환율을 제공합니다.',
    statCountriesTracked: '추적 국가 수',
    statBaseCurrency: '현재 기준 통화',
    statTopEconomy: '세계 1위 경제대국',
    statLocalEconomy: '접속 지역 경제 규모 ({country})',

    // Filters & Search
    searchPlaceholder: '국가명, 영문, 통화코드 검색...',
    filterAll: '전체',
    filterAsia: '아시아',
    filterEurope: '유럽',
    filterAmericas: '아메리카',
    filterAfrica: '아프리카',
    filterOceania: '오세아니아',
    viewCards: '카드 뷰',
    viewTable: '리스트 테이블 뷰',

    // Map View
    mapTitle: '세계 GDP 시각화 지도',
    mapSubtitle: '실시간 환율 및 세계은행(World Bank) · IMF 공식 데이터 기반 경제 지도',
    mapMetricLabel: '분석 지표',
    metricTotalGdp: '총 GDP',
    metricPerCapita: '1인당 GDP',
    metricGrowth: '실질 성장률',
    metricDebt: '국가 부채 비율',
    metricInflation: '인플레이션율',
    mapResetZoom: '초기화',
    mapZoomIn: '확대',
    mapZoomOut: '축소',
    top10Title: '글로벌 TOP 10 경제 대국',
    legendTitle: '지표 규모별 범례',
    clickCountryHint: '국가를 클릭하면 10개년 GDP 추이와 상세 통계를 볼 수 있습니다',
    selectedCountryBadge: '선택된 국가',
    viewDetailsBtn: '상세 지표 및 10개년 차트',
    viewMap: '세계 지도 뷰',
    mapStyleLabel: '지도 형태',
    mapStyleTile: '타일맵',
    mapStyleVector: '정밀 지도',

    // Year Switcher
    yearLabel: '기준 연도',
    yearActual: '{year}년 실적',
    yearEstimate: '{year}년 추정',
    yearProjection: '{year}년 전망',

    // Country Card
    cardTotalGdp: '총 GDP',
    cardPerCapita: '1인당 GDP',
    cardStockIndex: '대표 주식 지수',
    cardInterestRate: '기준금리',
    cardFxRate: '실시간 환율',
    cardGrowthRate: '성장률',
    cardDebtRatio: '국가 부채',
    cardInflationRate: '인플레이션',
    cardViewDetails: '상세 지표 및 10개년 차트',
    loadingData: '데이터 로딩 중...',
    noCountriesFound: '검색 조건에 맞는 국가가 없습니다.',

    // Modal
    modalContinent: '대륙',
    modalCurrency: '통화',
    modalTotalGdpTitle: '총 GDP',
    modalPerCapitaTitle: '1인당 GDP',
    modalGrowthTitle: '연간 경제성장률',
    modalRealGrowth: '실질 GDP 성장률',
    modalDebtTitle: '국가 부채 비율',
    modalDebtSub: '일반정부 총 부채 비율 (GDP 대비 %, IMF WEO 공식)',
    modalInflationTitle: '소비자물가 인플레이션율',
    modalInflationSub: '연평균 소비자물가 변동률 (전년 대비 %, IMF WEO PCPIPCH)',
    modalRankTitle: '전 세계 순위',
    modalRankValue: '세계 {rank}위',
    modalRankSub: '총 GDP 기준',
    modalInterestRateTitle: '중앙은행 기준금리',
    modalInterestRateSub: '국제결제은행(BIS SDMX) 및 중앙은행 공식 정책금리',
    modalFxSectionTitle: '실시간 공식 환율 정보',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: '외환 시장 기준 시각',
    modalStockIndexTitle: '대표 증시 지수 실시간 차트',
    modalStockIndexSub: '공식 거래소 실시간 시세 및 기간별 인터랙티브 차트',
    modalChartTitle: '10개년 GDP 변화 추이 ({startYear} ~ {year})',
    modalChartUnit: '단위: {base} 환산치',
    modalChartLoading: '세계은행 시계열 데이터를 불러오는 중...',
    modalAccuracyTitle: '데이터 신뢰도 및 공식 출처 검증',
    modalAccuracyGdp:
      'GDP 통계: 세계은행 Open Data API(총 GDP NY.GDP.MKTP.CD, 1인당 GDP NY.GDP.PCAP.CD) 및 국제통화기금(IMF WEO) 공식 집계치 기준.',
    modalAccuracyDebt:
      '국가 부채 비율: 국제통화기금(IMF) World Economic Outlook (WEO) 공식 일반정부 총부채(GGXWDG_NGDP, % of GDP) 통계 기준.',
    modalAccuracyInflation:
      '인플레이션 통계: 국제통화기금(IMF) World Economic Outlook (WEO) 연평균 소비자물가 변동률(PCPIPCH, Annual % Change) 공식 지표 기준.',
    modalAccuracyFx:
      '환율 데이터: 유럽중앙은행(ECB) 공식 고시 기준 환율 및 글로벌 외환 시장 실시간 피드 기준.',
    modalWorldBankLink: '세계은행 공식 데이터 포털 바로가기',
    modalImfLink: 'IMF DataMapper 포털 바로가기',
    modalClose: '닫기',

    // Currency Converter
    converterTitle: '실시간 환율 계산기',
    converterSending: '보내는 금액',
    converterConverted: '환전 예상 금액',
    swapCurrencies: '통화 맞바꾸기',

    // 1:1 Compare View
    compareTitle: '국가 간 1:1 경제 규모 & 환율 비교',
    compareDescription:
      '두 국가의 세계은행 및 IMF 공식 거시경제 추이와 실시간 환율을 직관적으로 나란히 대조합니다.',
    compareRecommended: '추천 비교:',
    compareBaseCountry: '기준 국가 (A)',
    compareTargetCountry: '비교 국가 (B)',
    compareInsightTitle: '비교 요약:',
    compareInsightText:
      '{countryA}의 총 GDP는 {countryB}의 {gdpRatio}배이며, 1인당 GDP는 {perCapitaRatio}배 수준입니다.',
    compareDebtRatio: '국가 부채 비율 (% GDP, IMF)',
    compareInflationRate: '인플레이션율 (평균 CPI, IMF)',
    compareInterestRate: '기준금리',
    compareSpread: '금리 스프레드 (A - B)',
    compareChartTitle: '10개년 GDP 궤적 동시 비교',
    compareChartLoading: '비교 데이터를 집계 중입니다...',

    // Ranking Table
    tableTitle: '전 세계 GDP & 환율 순위표',
    tableSubtitle: '세계은행 및 IMF WEO 공식 거시경제 통계 기준 (총 {count}개 주요국 수록)',
    colRank: '순위',
    colCountry: '국가',
    colCurrency: '통화',
    colFxRate: '실시간 환율 ({base})',
    colStockIndex: '주요 증시',
    colInterestRate: '기준금리',
    colTotalGdp: '총 GDP',
    colPerCapita: '1인당 GDP',
    colGrowth: '성장률',
    colDebt: '부채비율',
    colInflation: '인플레이션',

    // Footer
    footerZeroStorageTitle: '무보관 온디맨드(Zero-Storage On-Demand) 시스템',
    footerZeroStorageDesc:
      '본 웹사이트는 별도의 서버나 데이터베이스 없이 사용자의 웹 브라우저에서 공식 API(세계은행, IMF WEO, 유럽중앙은행)로 직접 연결되어 최신 데이터를 실시간으로 온디맨드 렌더링합니다.',
    footerDisclaimer:
      '제공되는 환율 및 거시경제 통계는 공공 공식 데이터를 기반으로 집계되며, 금융 거래 및 투자의 법적 최종 책임은 사용자에게 있습니다.',
    footerWorldBank: '세계은행(World Bank) Open Data',
    footerImf: '국제통화기금(IMF) DataMapper',
    footerEcb: '유럽중앙은행(ECB) 공식 환율',
    footerBis: '국제결제은행(BIS) 정책금리 통계',
    footerGithub: 'GitHub Pages 호스팅',
  },
  ja: {
    // Header & Nav
    appTitle: 'Geonomics',
    appSubtitle: 'リアルタイム為替レート & 世界銀行・IMF公式マクロ経済統計',
    liveBadge: 'LIVE',
    navExplorer: '国別探索',
    navCompare: '1:1 比較',
    baseCurrencyLabel: '基準通貨:',
    refreshBtn: '更新',
    refreshTooltip: '最新データを再取得',

    // Ticker
    tickerTitle: '主要リアルタイム為替レート',
    asOf: '更新:',

    // Hero Section
    heroBadge: '世界銀行(World Bank) · IMF WEO 公式統計 × リアルタイム為替連動',
    heroTitle: '世界各国の為替レート & GDPリアルタイム分析',
    heroDescription:
      'データベース不要のオンデマンド経済情報プラットフォーム。世界銀行(World Bank)、国際通貨基金(IMF WEO)、欧州中央銀行(ECB)などの公式APIから直接データを取得し、高精度なマクロ経済指標とリアルタイム為替レートを提供します。',
    statCountriesTracked: '追跡対象国数',
    statBaseCurrency: '現在の基準通貨',
    statTopEconomy: '世界第1位の経済大国',
    statLocalEconomy: '現在地の経済規模 ({country})',

    // Filters & Search
    searchPlaceholder: '国名、コード、通貨で検索...',
    filterAll: 'すべて',
    filterAsia: 'アジア',
    filterEurope: 'ヨーロッパ',
    filterAmericas: 'アメリカ',
    filterAfrica: 'アフリカ',
    filterOceania: 'オセアニア',
    viewCards: 'カードビュー',
    viewTable: 'テーブルビュー',

    // Map View
    mapTitle: '世界GDP可視化マップ',
    mapSubtitle: 'リアルタイム為替レートおよび世界銀行・IMF公式統計による世界各国の経済規模マップ',
    mapMetricLabel: '分析指標',
    metricTotalGdp: '名目GDP',
    metricPerCapita: '1人当たりGDP',
    metricGrowth: '実質成長率',
    metricDebt: '政府債務比率',
    metricInflation: 'インフレ率',
    mapResetZoom: 'リセット',
    mapZoomIn: '拡大',
    mapZoomOut: '縮小',
    top10Title: '世界トップ10経済大国',
    legendTitle: '指標規模の凡例',
    clickCountryHint: '国をクリックすると10年間の推移と詳細指標を表示します',
    selectedCountryBadge: '選択された国',
    viewDetailsBtn: '詳細指標と10年チャートを見る',
    viewMap: '世界地図ビュー',
    mapStyleLabel: 'マップ形式',
    mapStyleTile: 'タイルマップ',
    mapStyleVector: '詳細地図',

    // Year Switcher
    yearLabel: '対象年度',
    yearActual: '{year}年 実績',
    yearEstimate: '{year}年 推計',
    yearProjection: '{year}年 予測',

    // Country Card
    cardTotalGdp: '名目GDP',
    cardPerCapita: '1人当たりGDP',
    cardStockIndex: '主要株価指数',
    cardInterestRate: '政策金利',
    cardFxRate: 'リアルタイム為替',
    cardGrowthRate: '成長率',
    cardDebtRatio: '政府債務',
    cardInflationRate: 'インフレ率',
    cardViewDetails: '詳細指標 & 10年チャート',
    loadingData: 'データを読み込み中...',
    noCountriesFound: '検索条件に一致する国が見つかりません。',

    // Modal
    modalContinent: '地域',
    modalCurrency: '通貨',
    modalTotalGdpTitle: '名目GDP',
    modalPerCapitaTitle: '1人当たりGDP',
    modalGrowthTitle: '年間実質GDP成長率',
    modalRealGrowth: '実質GDP成長率',
    modalDebtTitle: '政府総債務残高比率',
    modalDebtSub: '一般政府総債務 (対GDP比 %, IMF WEO)',
    modalInflationTitle: '消費者物価インフレ率',
    modalInflationSub: '平均消費者物価上昇率 (前年比 %, IMF WEO PCPIPCH)',
    modalRankTitle: '世界順位',
    modalRankValue: '世界第{rank}位',
    modalRankSub: '名目GDP基準',
    modalInterestRateTitle: '中央銀行 政策金利',
    modalInterestRateSub: '公式政策金利（国際決済銀行 BIS SDMX / 各国中央銀行）',
    modalFxSectionTitle: '公式リアルタイム為替レート',
    modalOnDemandBadge: 'オンデマンド',
    modalForexTimestamp: '為替市場タイムスタンプ',
    modalStockIndexTitle: '国の代表的株価指数',
    modalStockIndexSub: '公式証券取引所ライブデータ & インタラクティブチャート',
    modalChartTitle: '過去10年間のGDP推移 ({startYear} - {year})',
    modalChartUnit: '単位: {base} 換算',
    modalChartLoading: '世界銀行の時系列データを読み込み中...',
    modalAccuracyTitle: 'データの信頼性と公的情報源',
    modalAccuracyGdp:
      'GDP統計: 世界銀行オープンデータ (NY.GDP.MKTP.CD, NY.GDP.PCAP.CD) およびIMF世界経済見通し (WEO) から直接取得。',
    modalAccuracyDebt:
      '政府債務統計: 国際通貨基金 (IMF) 世界経済見通し (WEO) 一般政府総債務指標 (GGXWDG_NGDP) より取得。',
    modalAccuracyInflation:
      'インフレ率統計：国際通貨基金 (IMF) 世界経済見通し (WEO) 平均消費者物価上昇率指標 (PCPIPCH) より取得。',
    modalAccuracyFx:
      '為替レート: 欧州中央銀行 (ECB) 基準金利およびグローバル為替フィードからオンデマンドで直接取得。',
    modalWorldBankLink: '世界銀行 国別データポータルへ移動',
    modalImfLink: 'IMF データポータルへ移動',
    modalClose: '閉じる',

    // Currency Converter
    converterTitle: 'リアルタイム為替計算機',
    converterSending: '換算元の金額',
    converterConverted: '換算予想金額',
    swapCurrencies: '通貨を入れ替える',

    // 1:1 Compare View
    compareTitle: '国別 1:1 経済規模 & 為替比較',
    compareDescription:
      '2か国の世界銀行・IMF公式マクロ経済推移とリアルタイム為替レートを直感的に横並びで比較します。',
    compareRecommended: '人気の比較:',
    compareBaseCountry: '基準国 (A)',
    compareTargetCountry: '比較対象国 (B)',
    compareInsightTitle: '比較サマリー:',
    compareInsightText:
      '{countryA}の名目GDPは{countryB}の{gdpRatio}倍、1人当たりGDPは{perCapitaRatio}倍の水準です。',
    compareDebtRatio: '政府債務比率 (% GDP, IMF)',
    compareInflationRate: 'インフレ率 (平均CPI, IMF)',
    compareInterestRate: '政策金利',
    compareSpread: '金利スプレッド (A - B)',
    compareChartTitle: '10年間GDP推移の同時比較',
    compareChartLoading: '比較データを集計中...',

    // Ranking Table
    tableTitle: '世界GDP & 為替レート ランキング',
    tableSubtitle: '世界銀行およびIMF WEO公式マクロ経済統計基準 (主要{count}か国収録)',
    colRank: '順位',
    colCountry: '国・地域',
    colCurrency: '通貨',
    colFxRate: 'リアルタイム為替 ({base})',
    colStockIndex: '主要株価',
    colInterestRate: '政策金利',
    colTotalGdp: '名目GDP',
    colPerCapita: '1人当たりGDP',
    colGrowth: '成長率',
    colDebt: '債務比率',
    colInflation: 'インフレ率',

    // Footer
    footerZeroStorageTitle: 'ゼロストレージ・オンデマンドシステム',
    footerZeroStorageDesc:
      '当サイトはサーバーやデータベースを一切保持せず、ユーザーのブラウザから公的機関の公式API（世界銀行、IMF WEO、ECB）へ直接接続し、最新のデータをリアルタイムでオンデマンド描画します。',
    footerDisclaimer:
      '提供される為替レートおよびマクロ経済統計は公的データを基に集計された参考情報です。投資判断および金融取引の最終責任は利用者に帰属します。',
    footerWorldBank: '世界銀行 (World Bank) Open Data',
    footerImf: '国際通貨基金 (IMF) DataMapper',
    footerEcb: '欧州中央銀行 (ECB) 公式為替レート',
    footerBis: '国際決済銀行 (BIS) 政策金利',
    footerGithub: 'GitHub Pages でホスティング中',
  },
  es: {
    // Header & Nav
    appTitle: 'Geonomics',
    appSubtitle: 'Tipos de cambio en tiempo real y estadísticas oficiales del Banco Mundial y el FMI',
    liveBadge: 'LIVE',
    navExplorer: 'Explorador de países',
    navCompare: 'Comparación 1:1',
    baseCurrencyLabel: 'Moneda base:',
    refreshBtn: 'Actualizar',
    refreshTooltip: 'Actualizar datos en tiempo real',

    // Ticker
    tickerTitle: 'Principales tipos de cambio en tiempo real',
    asOf: 'Actualizado:',

    // Hero Section
    heroBadge: 'Estadísticas oficiales Banco Mundial · FMI WEO × Tipos de cambio en vivo',
    heroTitle: 'Análisis global de tipos de cambio y PIB en tiempo real',
    heroDescription:
      'Plataforma de inteligencia económica bajo demanda y sin base de datos. Consulta directamente las APIs oficiales de instituciones públicas internacionales (Banco Mundial, FMI WEO y Banco Central Europeo) para ofrecer indicadores macroeconómicos de alta precisión y tipos de cambio en tiempo real.',
    statCountriesTracked: 'Países monitorizados',
    statBaseCurrency: 'Moneda base actual',
    statTopEconomy: 'Primera economía mundial',
    statLocalEconomy: 'Economía local ({country})',

    // Filters & Search
    searchPlaceholder: 'Buscar por país, código o moneda...',
    filterAll: 'Todos',
    filterAsia: 'Asia',
    filterEurope: 'Europa',
    filterAmericas: 'América',
    filterAfrica: 'África',
    filterOceania: 'Oceanía',
    viewCards: 'Vista de tarjetas',
    viewTable: 'Vista de tabla',

    // Map View
    mapTitle: 'Explorador del mapa mundial de PIB',
    mapSubtitle: 'Inteligencia macroeconómica oficial del Banco Mundial y el FMI con divisas en vivo',
    mapMetricLabel: 'Indicador',
    metricTotalGdp: 'PIB total',
    metricPerCapita: 'PIB per cápita',
    metricGrowth: 'Crecimiento real',
    metricDebt: '% Deuda pública',
    metricInflation: 'Tasa de inflación',
    mapResetZoom: 'Restablecer',
    mapZoomIn: 'Acercar',
    mapZoomOut: 'Alejar',
    top10Title: 'Top 10 economías mundiales',
    legendTitle: 'Escala del indicador',
    clickCountryHint: 'Haz clic en cualquier país para ver su trayectoria de 10 años y divisas',
    selectedCountryBadge: 'Economía seleccionada',
    viewDetailsBtn: 'Análisis detallado y gráfico de 10 años',
    viewMap: 'Vista de mapa mundial',
    mapStyleLabel: 'Estilo de mapa',
    mapStyleTile: 'Mapa de cuadrícula',
    mapStyleVector: 'Mapa detallado',

    // Year Switcher
    yearLabel: 'Horizonte económico',
    yearActual: 'Real {year}',
    yearEstimate: 'Est. {year}',
    yearProjection: 'Proy. {year}',

    // Country Card
    cardTotalGdp: 'PIB total',
    cardPerCapita: 'PIB per cápita',
    cardStockIndex: 'Índice bursátil',
    cardInterestRate: 'Tasa de Política',
    cardFxRate: 'Tipo de cambio en vivo',
    cardGrowthRate: 'Tasa de crecimiento',
    cardDebtRatio: 'Deuda pública',
    cardInflationRate: 'Tasa de inflación',
    cardViewDetails: 'Métricas detalladas y gráfico de 10 años',
    loadingData: 'Cargando datos...',
    noCountriesFound: 'No se encontraron países que coincidan con la búsqueda.',

    // Modal
    modalContinent: 'Región',
    modalCurrency: 'Moneda',
    modalTotalGdpTitle: 'PIB total',
    modalPerCapitaTitle: 'PIB per cápita',
    modalGrowthTitle: 'Crecimiento anual del PIB',
    modalRealGrowth: 'Crecimiento real del PIB',
    modalDebtTitle: 'Ratio de deuda pública',
    modalDebtSub: 'Deuda bruta del gobierno general (% del PIB, FMI WEO)',
    modalInflationTitle: 'Tasa de inflación',
    modalInflationSub: 'Precios al consumidor promedio (Variación anual %, FMI WEO)',
    modalRankTitle: 'Posición global',
    modalRankValue: 'Mundial #{rank}',
    modalRankSub: 'por PIB total',
    modalInterestRateTitle: 'Tasa de Política Monetaria',
    modalInterestRateSub: 'Tasa de interés de referencia oficial (BPI BIS SDMX / Banco Central)',
    modalFxSectionTitle: 'Tipo de cambio oficial en vivo',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: 'Marca de tiempo del mercado de divisas',
    modalStockIndexTitle: 'Índice de referencia del mercado bursátil nacional',
    modalStockIndexSub: 'Datos en vivo de la bolsa oficial y gráfico interactivo',
    modalChartTitle: 'Trayectoria del PIB en 10 años ({startYear} - {year})',
    modalChartUnit: 'Unidad: convertida a {base}',
    modalChartLoading: 'Cargando datos temporales del Banco Mundial...',
    modalAccuracyTitle: 'Integridad de los datos y fuentes oficiales',
    modalAccuracyGdp:
      'Estadísticas del PIB: obtenidas directamente de Open Data del Banco Mundial (NY.GDP.MKTP.CD, NY.GDP.PCAP.CD) y de Perspectivas de la economía mundial del FMI (WEO).',
    modalAccuracyDebt:
      'Estadísticas de deuda pública: obtenidas del indicador de deuda bruta del gobierno general de Perspectivas de la economía mundial del FMI (WEO) (GGXWDG_NGDP).',
    modalAccuracyInflation:
      'Estadísticas de inflación: obtenidas del indicador de inflación de precios al consumidor promedio de Perspectivas de la economía mundial del FMI (WEO) (PCPIPCH).',
    modalAccuracyFx:
      'Tipos de cambio: recopilados bajo demanda a partir de los tipos de referencia del Banco Central Europeo (BCE) y feeds de divisas globales en vivo.',
    modalWorldBankLink: 'Visitar el portal de datos del Banco Mundial',
    modalImfLink: 'Visitar el portal de datos del FMI',
    modalClose: 'Cerrar',

    // Currency Converter
    converterTitle: 'Conversor de divisas en tiempo real',
    converterSending: 'Cantidad',
    converterConverted: 'Valor estimado',
    swapCurrencies: 'Intercambiar monedas',

    // 1:1 Compare View
    compareTitle: 'Comparación 1:1 de escala económica y divisas',
    compareDescription:
      'Compare las tendencias macroeconómicas oficiales del Banco Mundial y el FMI y los tipos de cambio en tiempo real cara a cara.',
    compareRecommended: 'Comparaciones populares:',
    compareBaseCountry: 'País base (A)',
    compareTargetCountry: 'País de comparación (B)',
    compareInsightTitle: 'Resumen comparativo:',
    compareInsightText:
      'El PIB total de {countryA} es {gdpRatio} veces el de {countryB}, y su PIB per cápita es {perCapitaRatio} veces mayor.',
    compareDebtRatio: 'Deuda pública (% PIB, FMI)',
    compareInflationRate: 'Tasa de inflación (IPC medio, FMI)',
    compareInterestRate: 'Tasa de Política',
    compareSpread: 'Diferencial de Tasas (A - B)',
    compareChartTitle: 'Superposición de trayectoria del PIB en 10 años',
    compareChartLoading: 'Agregando datos comparativos...',

    // Ranking Table
    tableTitle: 'Clasificación mundial de PIB y tipos de cambio',
    tableSubtitle: 'Estadísticas macroeconómicas oficiales del Banco Mundial y el FMI que cubren {count} economías principales',
    colRank: 'Puesto',
    colCountry: 'País',
    colCurrency: 'Moneda',
    colFxRate: 'Tipo de cambio ({base})',
    colStockIndex: 'Índice Bursátil',
    colInterestRate: 'Tasa de Política',
    colTotalGdp: 'PIB total',
    colPerCapita: 'PIB per cápita',
    colGrowth: 'Crecimiento',
    colDebt: 'Deuda pública',
    colInflation: 'Inflación',

    // Footer
    footerZeroStorageTitle: 'Arquitectura bajo demanda sin almacenamiento',
    footerZeroStorageDesc:
      'Este sitio web funciona sin almacenamiento persistente ni bases de datos en el servidor. Los datos son obtenidos directamente por su navegador desde las APIs públicas oficiales internacionales (Banco Mundial, FMI WEO y BCE).',
    footerDisclaimer:
      'Las estadísticas macroeconómicas y los tipos de cambio se proporcionan con fines informativos y analíticos. Las decisiones financieras y de inversión son responsabilidad exclusiva del usuario.',
    footerWorldBank: 'World Bank Open Data',
    footerImf: 'IMF DataMapper (WEO)',
    footerEcb: 'Banco Central Europeo (ECB)',
    footerBis: 'Banco de Pagos Internacionales (BPI)',
    footerGithub: 'Alojado en GitHub Pages',
  },
  zh: {
    // Header & Nav
    appTitle: 'Geonomics',
    appSubtitle: '实时汇率与世界银行 · 国际货币基金组织 (IMF) 官方宏观经济统计',
    liveBadge: 'LIVE',
    navExplorer: '国家探索',
    navCompare: '1:1 对比',
    baseCurrencyLabel: '基准货币:',
    refreshBtn: '刷新',
    refreshTooltip: '重新获取实时数据',

    // Ticker
    tickerTitle: '主要实时汇率行情',
    asOf: '更新时间:',

    // Hero Section
    heroBadge: '世界银行 · IMF 官方权威统计 × 实时外汇行情联动',
    heroTitle: '全球各国实时汇率与 GDP 宏观经济分析',
    heroDescription:
      '无需数据库的纯即时请求 (On-Demand) 宏观经济数据平台。直接连通世界银行 (World Bank)、国际货币基金组织 (IMF WEO) 及欧洲中央银行 (ECB) 官方接口，呈现高精度的宏观经济指标与全球实时外汇数据。',
    statCountriesTracked: '追踪国家/地区',
    statBaseCurrency: '当前基准货币',
    statTopEconomy: '全球第一大经济体',
    statLocalEconomy: '访问地区经济规模 ({country})',

    // Filters & Search
    searchPlaceholder: '搜索国家名称、英文代码或货币...',
    filterAll: '全部',
    filterAsia: '亚洲',
    filterEurope: '欧洲',
    filterAmericas: '美洲',
    filterAfrica: '非洲',
    filterOceania: '大洋洲',
    viewCards: '卡片视图',
    viewTable: '表格视图',

    // Map View
    mapTitle: '全球 GDP 可视化地图',
    mapSubtitle: '基于世界银行 · IMF 官方宏观经济统计与实时汇率的全球经济地图',
    mapMetricLabel: '分析指标',
    metricTotalGdp: '名义 GDP',
    metricPerCapita: '人均 GDP',
    metricGrowth: '实际增长率',
    metricDebt: '政府负债率',
    metricInflation: '通胀率',
    mapResetZoom: '重置',
    mapZoomIn: '放大',
    mapZoomOut: '缩小',
    top10Title: '全球 TOP 10 经济大国',
    legendTitle: '指标规模图例',
    clickCountryHint: '点击任意国家即可查看10年历史走势与外汇详情',
    selectedCountryBadge: '已选国家/地区',
    viewDetailsBtn: '详细指标与10年图表',
    viewMap: '世界地图视图',
    mapStyleLabel: '地图样式',
    mapStyleTile: '点阵瓦片地图',
    mapStyleVector: '矢量精细地图',

    // Year Switcher
    yearLabel: '基准年份',
    yearActual: '{year}年 实际',
    yearEstimate: '{year}年 估算',
    yearProjection: '{year}年 预测',

    // Country Card
    cardTotalGdp: '名义 GDP',
    cardPerCapita: '人均 GDP',
    cardStockIndex: '主要股指',
    cardInterestRate: '基准利率',
    cardFxRate: '实时汇率',
    cardGrowthRate: '经济增长率',
    cardDebtRatio: '政府负债率',
    cardInflationRate: '通胀率',
    cardViewDetails: '详细指标与10年走势',
    loadingData: '正在加载数据...',
    noCountriesFound: '没有找到符合搜索条件的国家。',

    // Modal
    modalContinent: '大洲/地区',
    modalCurrency: '法定货币',
    modalTotalGdpTitle: '名义 GDP 总量',
    modalPerCapitaTitle: '人均 GDP',
    modalGrowthTitle: '年实际 GDP 增长率',
    modalRealGrowth: '实际 GDP 增长率',
    modalDebtTitle: '国家负债率',
    modalDebtSub: '广义政府总债务占 GDP 比重 (%, IMF WEO 官方数据)',
    modalInflationTitle: '居民消费价格通胀率',
    modalInflationSub: '年均消费者物价指数变动率 (同比 %, IMF WEO PCPIPCH)',
    modalRankTitle: '全球排名',
    modalRankValue: '全球第 {rank} 位',
    modalRankSub: '按名义 GDP 统计',
    modalInterestRateTitle: '中央银行基准利率',
    modalInterestRateSub: '官方基准利率（国际清算银行 BIS SDMX / 各国中央银行）',
    modalFxSectionTitle: '官方实时汇率数据',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: '外汇市场时间戳',
    modalStockIndexTitle: '国家代表性股票市场基准指数',
    modalStockIndexSub: '官方交易所实时行情与交互式走势图',
    modalChartTitle: '过去10年 GDP 走势轨迹 ({startYear} - {year})',
    modalChartUnit: '单位: 折合 {base}',
    modalChartLoading: '正在加载世界银行时间序列数据...',
    modalAccuracyTitle: '数据权威性与官方来源验证',
    modalAccuracyGdp:
      'GDP 统计: 直接来源于世界银行 Open Data (NY.GDP.MKTP.CD, NY.GDP.PCAP.CD) 及国际货币基金组织 (IMF WEO) 官方统计。',
    modalAccuracyDebt:
      '政府债务统计: 来源于国际货币基金组织 (IMF) 世界经济展望 (WEO) 广义政府总债务指标 (GGXWDG_NGDP)。',
    modalAccuracyInflation:
      '通胀率统计: 来源于国际货币基金组织 (IMF) 世界经济展望 (WEO) 平均消费者物价上涨率指标 (PCPIPCH)。',
    modalAccuracyFx:
      '外汇汇率: 实时直连欧洲中央银行 (ECB) 官方基准汇率及全球外汇市场实时数据流。',
    modalWorldBankLink: '访问世界银行国家数据门户',
    modalImfLink: '访问 IMF 数据门户',
    modalClose: '关闭',

    // Currency Converter
    converterTitle: '实时汇率换算计算器',
    converterSending: '兑换金额',
    converterConverted: '换算结果',
    swapCurrencies: '对调货币',

    // 1:1 Compare View
    compareTitle: '国别 1:1 经济规模与外汇对比',
    compareDescription:
      '直观并排对比两国世界银行与 IMF 官方宏观经济走势及实时汇率数据。',
    compareRecommended: '热门对比:',
    compareBaseCountry: '基准国家 (A)',
    compareTargetCountry: '对比国家 (B)',
    compareInsightTitle: '对比结论:',
    compareInsightText:
      '{countryA} 的名义 GDP 总量是 {countryB} 的 {gdpRatio} 倍，人均 GDP 为其 {perCapitaRatio} 倍。',
    compareDebtRatio: '政府负债率 (% GDP, IMF)',
    compareInflationRate: '通胀率 (年均 CPI, IMF)',
    compareInterestRate: '基准利率',
    compareSpread: '利差 (A - B)',
    compareChartTitle: '10年 GDP 走势轨迹并排对比',
    compareChartLoading: '正在汇总对比数据...',

    // Ranking Table
    tableTitle: '全球 GDP 与实时汇率排行榜',
    tableSubtitle: '基于世界银行及 IMF WEO 官方宏观经济数据 (收录全球主要 {count} 个经济体)',
    colRank: '排名',
    colCountry: '国家/地区',
    colCurrency: '货币',
    colFxRate: '实时汇率 ({base})',
    colStockIndex: '主要股市',
    colInterestRate: '基准利率',
    colTotalGdp: '名义 GDP',
    colPerCapita: '人均 GDP',
    colGrowth: '增长率',
    colDebt: '负债率',
    colInflation: '通胀率',

    // Footer
    footerZeroStorageTitle: '零持久化存储 · 纯即时响应架构',
    footerZeroStorageDesc:
      '本站不设立任何持久化后端数据库或缓存服务器，所有数据均由用户浏览器端直接连通国际公法机构 (世界银行、IMF WEO、欧洲央行) 官方接口进行即时渲染。',
    footerDisclaimer:
      '所展示的汇率与宏观经济数据仅供信息参考与学术分析之用。用户基于本平台数据作出的各项金融交易与投资决策，其法律后果自负。',
    footerWorldBank: '世界银行 (World Bank) Open Data',
    footerImf: '国际货币基金组织 (IMF) DataMapper',
    footerEcb: '欧洲中央银行 (ECB) 官方汇率',
    footerBis: '国际清算银行 (BIS) 政策利率',
    footerGithub: 'GitHub Pages 托管运行',
  },
} as const


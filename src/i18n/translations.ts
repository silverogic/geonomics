export type Language = 'en' | 'ko' | 'ja'

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
    modalFxSectionTitle: 'Official Live Exchange Rate',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: 'Forex Market Timestamp',
    modalStockIndexTitle: 'National Stock Market Benchmark',
    modalStockIndexSub: 'Official exchange live feed & interactive chart',
    modalChartTitle: '10-Year GDP Trajectory (2015 - {year})',
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
    compareChartTitle: '10-Year GDP Trajectory Overlay',
    compareChartLoading: 'Aggregating comparative data...',

    // Ranking Table
    tableTitle: 'Global GDP & Exchange Rate Rankings',
    tableSubtitle: 'Official World Bank & IMF macroeconomic statistics covering {count} major economies',
    colRank: 'Rank',
    colCountry: 'Country',
    colCurrency: 'Currency',
    colFxRate: 'Live FX Rate ({base})',
    colTotalGdp: 'Total GDP ({base})',
    colPerCapita: 'GDP Per Capita',
    colGrowth: 'Growth Rate',
    colDebt: 'Gov Debt (% GDP, IMF)',
    colInflation: 'Inflation (IMF)',

    // Footer
    footerZeroStorageTitle: 'Zero-Storage On-Demand Architecture',
    footerZeroStorageDesc:
      'This website operates with zero persistent backend storage or databases. Data is retrieved on-demand directly by your browser from official international endpoints (World Bank Open Data, IMF WEO, and ECB).',
    footerDisclaimer:
      'Macroeconomic statistics and exchange rates are provided for informational and analytical purposes. Financial and investment decisions are the sole responsibility of the user.',
    footerWorldBank: 'World Bank Open Data',
    footerImf: 'IMF DataMapper (WEO)',
    footerEcb: 'European Central Bank (ECB) Reference Rates',
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
    modalFxSectionTitle: '실시간 공식 환율 정보',
    modalOnDemandBadge: 'ON-DEMAND',
    modalForexTimestamp: '외환 시장 기준 시각',
    modalStockIndexTitle: '대표 증시 지수 실시간 차트',
    modalStockIndexSub: '공식 거래소 실시간 시세 및 기간별 인터랙티브 차트',
    modalChartTitle: '10개년 GDP 변화 추이 (2015 ~ {year})',
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
    compareChartTitle: '10개년 GDP 궤적 동시 비교',
    compareChartLoading: '비교 데이터를 집계 중입니다...',

    // Ranking Table
    tableTitle: '전 세계 GDP & 환율 순위표',
    tableSubtitle: '세계은행 및 IMF WEO 공식 거시경제 통계 기준 (총 {count}개 주요국 수록)',
    colRank: '순위',
    colCountry: '국가',
    colCurrency: '통화',
    colFxRate: '실시간 환율 ({base})',
    colTotalGdp: '총 GDP ({base})',
    colPerCapita: '1인당 GDP',
    colGrowth: '성장률',
    colDebt: '부채 비율 (% GDP, IMF)',
    colInflation: '인플레이션 (IMF)',

    // Footer
    footerZeroStorageTitle: '무보관 온디맨드(Zero-Storage On-Demand) 시스템',
    footerZeroStorageDesc:
      '본 웹사이트는 별도의 서버나 데이터베이스 없이 사용자의 웹 브라우저에서 공식 API(세계은행, IMF WEO, 유럽중앙은행)로 직접 연결되어 최신 데이터를 실시간으로 온디맨드 렌더링합니다.',
    footerDisclaimer:
      '제공되는 환율 및 거시경제 통계는 공공 공식 데이터를 기반으로 집계되며, 금융 거래 및 투자의 법적 최종 책임은 사용자에게 있습니다.',
    footerWorldBank: '세계은행(World Bank) Open Data',
    footerImf: '국제통화기금(IMF) DataMapper',
    footerEcb: '유럽중앙은행(ECB) 공식 환율',
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
    modalFxSectionTitle: '公式リアルタイム為替レート',
    modalOnDemandBadge: 'オンデマンド',
    modalForexTimestamp: '為替市場タイムスタンプ',
    modalStockIndexTitle: '国の代表的株価指数',
    modalStockIndexSub: '公式証券取引所ライブデータ & インタラクティブチャート',
    modalChartTitle: '過去10年間のGDP推移 (2015 - {year})',
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
    compareChartTitle: '10年間GDP推移の同時比較',
    compareChartLoading: '比較データを集計中...',

    // Ranking Table
    tableTitle: '世界GDP & 為替レート ランキング',
    tableSubtitle: '世界銀行およびIMF WEO公式マクロ経済統計基準 (主要{count}か国収録)',
    colRank: '順位',
    colCountry: '国・地域',
    colCurrency: '通貨',
    colFxRate: 'リアルタイム為替 ({base})',
    colTotalGdp: '名目GDP ({base})',
    colPerCapita: '1人当たりGDP',
    colGrowth: '成長率',
    colDebt: '債務比率 (% GDP, IMF)',
    colInflation: 'インフレ率 (IMF)',

    // Footer
    footerZeroStorageTitle: 'ゼロストレージ・オンデマンドシステム',
    footerZeroStorageDesc:
      '当サイトはサーバーやデータベースを一切保持せず、ユーザーのブラウザから公的機関の公式API（世界銀行、IMF WEO、ECB）へ直接接続し、最新のデータをリアルタイムでオンデマンド描画します。',
    footerDisclaimer:
      '提供される為替レートおよびマクロ経済統計は公的データを基に集計された参考情報です。投資判断および金融取引の最終責任は利用者に帰属します。',
    footerWorldBank: '世界銀行 (World Bank) Open Data',
    footerImf: '国際通貨基金 (IMF) DataMapper',
    footerEcb: '欧州中央銀行 (ECB) 公式為替レート',
    footerGithub: 'GitHub Pages でホスティング中',
  },
} as const

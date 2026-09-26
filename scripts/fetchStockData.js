import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COUNTRY_TICKERS = [
  { id: 'USA', nameEn: 'S&P 500', nameKo: 'S&P 500', ticker: '^GSPC', isSupported: true },
  { id: 'CHN', nameEn: 'SSE Composite', nameKo: '상하이 종합지수', ticker: '000001.SS', isSupported: true },
  { id: 'DEU', nameEn: 'DAX 40', nameKo: 'DAX', ticker: '^GDAXI', isSupported: true },
  { id: 'JPN', nameEn: 'Nikkei 225', nameKo: '닛케이 225', ticker: '^N225', isSupported: true },
  { id: 'IND', nameEn: 'NIFTY 50', nameKo: 'NIFTY 50', ticker: '^NSEI', isSupported: true },
  { id: 'GBR', nameEn: 'FTSE 100', nameKo: 'FTSE 100', ticker: '^FTSE', isSupported: true },
  { id: 'FRA', nameEn: 'CAC 40', nameKo: 'CAC 40', ticker: '^FCHI', isSupported: true },
  { id: 'ITA', nameEn: 'FTSE MIB', nameKo: 'FTSE MIB', ticker: 'FTSEMIB.MI', isSupported: true },
  { id: 'BRA', nameEn: 'Bovespa', nameKo: '보베스파', ticker: '^BVSP', isSupported: true },
  { id: 'CAN', nameEn: 'S&P/TSX Composite', nameKo: 'S&P/TSX 종합', ticker: '^GSPTSE', isSupported: true },
  {
    id: 'RUS',
    nameEn: 'MOEX Russia',
    nameKo: 'MOEX 러시아',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Market data is restricted due to international financial sanctions.',
    fallbackReasonKo: '국제 금융 제재 및 거래소 규제로 인해 데이터 조회가 제한됩니다.'
  },
  { id: 'MEX', nameEn: 'S&P/BMV IPC', nameKo: 'S&P/BMV IPC', ticker: '^MXX', isSupported: true },
  { id: 'AUS', nameEn: 'S&P/ASX 200', nameKo: 'S&P/ASX 200', ticker: '^AXJO', isSupported: true },
  { id: 'KOR', nameEn: 'KOSPI', nameKo: 'KOSPI (코스피)', ticker: '^KS11', isSupported: true },
  { id: 'ESP', nameEn: 'IBEX 35', nameKo: 'IBEX 35', ticker: '^IBEX', isSupported: true },
  { id: 'IDN', nameEn: 'Jakarta Composite (IHSG)', nameKo: 'IDX 종합 (IHSG)', ticker: '^JKSE', isSupported: true },
  { id: 'TUR', nameEn: 'BIST 100', nameKo: 'BIST 100', ticker: 'XU100.IS', isSupported: true },
  { id: 'NLD', nameEn: 'AEX Index', nameKo: 'AEX 지수', ticker: '^AEX', isSupported: true },
  { id: 'SAU', nameEn: 'iShares MSCI Saudi Arabia (TASI Proxy)', nameKo: 'iShares 사우디 (타다울 대표 ETF)', ticker: 'KSA', isSupported: true },
  { id: 'CHE', nameEn: 'Swiss Market Index (SMI)', nameKo: 'SMI 지수', ticker: '^SSMI', isSupported: true },
  { id: 'POL', nameEn: 'iShares MSCI Poland (WIG20 Proxy)', nameKo: 'iShares 폴란드 (WIG20 대표 ETF)', ticker: 'EPOL', isSupported: true },
  { id: 'SWE', nameEn: 'OMX Stockholm 30', nameKo: 'OMXS30', ticker: '^OMX', isSupported: true },
  { id: 'BEL', nameEn: 'BEL 20', nameKo: 'BEL 20', ticker: '^BFX', isSupported: true },
  { id: 'ARG', nameEn: 'S&P Merval', nameKo: 'S&P 메르발', ticker: '^MERV', isSupported: true },
  { id: 'IRL', nameEn: 'ISEQ 20', nameKo: 'ISEQ 20', ticker: '^ISEQ', isSupported: true },
  { id: 'NOR', nameEn: 'iShares MSCI Norway (OBX Proxy)', nameKo: 'iShares 노르웨이 (OBX 대표 ETF)', ticker: 'ENOR', isSupported: true },
  { id: 'AUT', nameEn: 'ATX Index', nameKo: 'ATX 지수', ticker: '^ATX', isSupported: true },
  { id: 'ISR', nameEn: 'TA-125', nameKo: 'TA-125', ticker: '^TA125.TA', isSupported: true },
  { id: 'ARE', nameEn: 'iShares MSCI UAE (DFM Proxy)', nameKo: 'iShares UAE (두바이 대표 ETF)', ticker: 'UAE', isSupported: true },
  { id: 'SGP', nameEn: 'Straits Times Index (STI)', nameKo: '스트레이츠 타임스 (STI)', ticker: '^STI', isSupported: true },
  { id: 'MYS', nameEn: 'FTSE Bursa Malaysia KLCI', nameKo: 'FTSE 버사 KLCI', ticker: '^KLSE', isSupported: true },
  { id: 'ZAF', nameEn: 'FTSE/JSE Top 40', nameKo: 'FTSE/JSE Top 40', ticker: '^J200.JO', isSupported: true },
  { id: 'PHL', nameEn: 'iShares MSCI Philippines (PSEi Proxy)', nameKo: 'iShares 필리핀 (PSEi 대표 ETF)', ticker: 'EPHE', isSupported: true },
  { id: 'DNK', nameEn: 'OMX Copenhagen 25', nameKo: 'OMXC25', ticker: '^OMXC25', isSupported: true },
  { id: 'EGY', nameEn: 'Commercial Intl Bank (EGX 30 Proxy)', nameKo: '상업국제은행 CIB (EGX30 대표주)', ticker: 'COMI.CA', isSupported: true },
  { id: 'BGD', nameEn: 'Dhaka DSEX (MSCI Frontier)', nameKo: '다카 DSEX (MSCI 프론티어)', ticker: 'EEM', isSupported: true },
  { id: 'VNM', nameEn: 'VN-Index (VanEck Vietnam)', nameKo: 'VN 지수 (VanEck 베트남)', ticker: 'VNM', isSupported: true },
  { id: 'NGA', nameEn: 'NGX ASI (VanEck Africa)', nameKo: 'NGX ASI (VanEck 아프리카)', ticker: 'AFK', isSupported: true },
  { id: 'THA', nameEn: 'iShares MSCI Thailand (SET Proxy)', nameKo: 'iShares 태국 (SET 대표 ETF)', ticker: 'THD', isSupported: true },
  { id: 'HKG', nameEn: 'Hang Seng Index (HSI)', nameKo: '항셍 지수 (HSI)', ticker: '^HSI', isSupported: true },
  { id: 'NZL', nameEn: 'S&P/NZX 50', nameKo: 'S&P/NZX 50', ticker: '^NZ50', isSupported: true },
  { id: 'FIN', nameEn: 'OMX Helsinki 25', nameKo: 'OMXH25', ticker: '^OMXH25', isSupported: true },
  { id: 'PRT', nameEn: 'PSI (EDP Portugal Proxy)', nameKo: 'PSI 지수 (EDP 포르투갈)', ticker: 'EDP.LS', isSupported: true },
  { id: 'COL', nameEn: 'MSCI COLCAP (Ecopetrol)', nameKo: 'MSCI COLCAP (에코페트롤)', ticker: 'EC', isSupported: true },
  { id: 'CHL', nameEn: 'S&P/CLX IPSA (iShares Chile)', nameKo: 'S&P IPSA (iShares 칠레)', ticker: 'ECH', isSupported: true },
  { id: 'CZE', nameEn: 'Prague PX (CEZ Proxy)', nameKo: '프라하 PX (CEZ 대표주)', ticker: 'CEZ.PR', isSupported: true },
  { id: 'ROU', nameEn: 'Bucharest BVB Index', nameKo: '부쿠레슈티 BVB 지수', ticker: 'BVB.RO', isSupported: true },
  { id: 'PER', nameEn: 'MSCI Peru (iShares Peru)', nameKo: 'MSCI 페루 (iShares 페루)', ticker: 'EPU', isSupported: true },
  { id: 'GRC', nameEn: 'ATHEX Composite', nameKo: 'ATHEX 종합지수', ticker: 'GD.AT', isSupported: true },
  { id: 'QAT', nameEn: 'QE Index (iShares Qatar)', nameKo: 'QE 지수 (iShares 카타르)', ticker: 'QAT', isSupported: true },
  { id: 'HUN', nameEn: 'Budapest BUX (OTP Proxy)', nameKo: '부다페스트 BUX (OTP 대표주)', ticker: 'OTP.BD', isSupported: true },
  { id: 'KWT', nameEn: 'Boursa Kuwait (iShares Kuwait)', nameKo: '쿠웨이트 (iShares 쿠웨이트)', ticker: 'KWT', isSupported: true },
  {
    id: 'UKR',
    nameEn: 'Ukraine UX',
    nameKo: '우크라이나 UX',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Local exchange operations are restricted due to regional conflict.',
    fallbackReasonKo: '전쟁 및 금융시장 제한으로 인해 실시간 데이터 조회가 불가합니다.'
  },
  { id: 'TWN', nameEn: 'Taiwan TAIEX', nameKo: '대만 가권지수 (TAIEX)', ticker: '^TWII', isSupported: true },
  { id: 'PAK', nameEn: 'Karachi KSE (OGDC Proxy)', nameKo: '카라치 KSE (OGDC 대표주)', ticker: 'OGDC.KA', isSupported: true },
  { id: 'KAZ', nameEn: 'Kaspi.kz (Kazakhstan Tech Index)', nameKo: '카스피.kz (카자흐스탄 대표주)', ticker: 'KSPI', isSupported: true },
  {
    id: 'IRN',
    nameEn: 'Tehran TEDPIX',
    nameKo: '테헤란 TEDPIX',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Market data is restricted due to international financial sanctions.',
    fallbackReasonKo: '국제 금융 제재 및 거래소 규제로 인해 데이터 조회가 제한됩니다.'
  },
  {
    id: 'IRQ',
    nameEn: 'Iraq ISX',
    nameKo: '이라크 ISX',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Local exchange data is restricted.',
    fallbackReasonKo: '이라크 증권거래소(ISX) 데이터 조회가 제한됩니다.'
  },
  {
    id: 'DZA',
    nameEn: 'Algeria SGBV',
    nameKo: '알제리 SGBV',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Algiers Stock Exchange data is not publicly accessible.',
    fallbackReasonKo: '알제 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'MAR',
    nameEn: 'MASI Index (Morocco)',
    nameKo: 'MASI 지수 (모로코)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Casablanca Stock Exchange live feed is restricted.',
    fallbackReasonKo: '카사블랑카 증권거래소 실시간 데이터 조회가 제한됩니다.'
  },
  {
    id: 'ETH',
    nameEn: 'Ethiopia ESX',
    nameKo: '에티오피아 ESX',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Ethiopian Securities Exchange is establishing live data feeds.',
    fallbackReasonKo: '에티오피아 증권거래소 데이터 연동 준비 중입니다.'
  },
  {
    id: 'SVK',
    nameEn: 'SAX Index (Slovakia)',
    nameKo: 'SAX 지수 (슬로바키아)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Bratislava Stock Exchange live feed is restricted.',
    fallbackReasonKo: '브라티슬라바 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'PRI',
    nameEn: 'Popular Inc (Puerto Rico Proxy)',
    nameKo: '포퓰러 (푸에르토리코 대표주)',
    ticker: 'BPOP',
    isSupported: true
  },
  {
    id: 'DOM',
    nameEn: 'BVRD (Dominican Republic)',
    nameKo: 'BVRD (도미니카 공화국)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Dominican Republic Stock Exchange live feed is restricted.',
    fallbackReasonKo: '도미니카 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'ECU',
    nameEn: 'Bolsa de Valores de Quito',
    nameKo: '키토 증권거래소 (에콰도르)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Quito Stock Exchange live feed is restricted.',
    fallbackReasonKo: '에콰도르 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'UZB',
    nameEn: 'Tashkent Stock Exchange',
    nameKo: '타슈켄트 증권거래소',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Tashkent Stock Exchange live feed is restricted.',
    fallbackReasonKo: '타슈켄트 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'VEN',
    nameEn: 'Caracas Stock Exchange (IBC)',
    nameKo: '카라카스 증권거래소 (IBC)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Market data is restricted due to international sanctions.',
    fallbackReasonKo: '국제 금융 제재로 인해 실시간 데이터 조회가 불가합니다.'
  },
  {
    id: 'AGO',
    nameEn: 'BODIVA (Angola)',
    nameKo: 'BODIVA (앙골라)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'BODIVA Angola live feed is restricted.',
    fallbackReasonKo: '앙골라 증권거래소(BODIVA) 데이터 조회가 제한됩니다.'
  },
  {
    id: 'KEN',
    nameEn: 'NSE 20 (Kenya)',
    nameKo: 'NSE 20 (케냐)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Nairobi Securities Exchange live feed is restricted.',
    fallbackReasonKo: '나이로비 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'BGR',
    nameEn: 'SOFIX Index (Bulgaria)',
    nameKo: 'SOFIX 지수 (불가리아)',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Bulgarian Stock Exchange live feed is restricted.',
    fallbackReasonKo: '불가리아 증권거래소 데이터 조회가 제한됩니다.'
  },
  {
    id: 'GTM',
    nameEn: 'Bolsa Nacional de Valores',
    nameKo: '과테말라 증권거래소',
    ticker: '',
    isSupported: false,
    fallbackReasonEn: 'Guatemala Stock Exchange live feed is restricted.',
    fallbackReasonKo: '과테말라 증권거래소 데이터 조회가 제한됩니다.'
  },
  { id: 'EST', nameEn: 'LHV Group (Tallinn Proxy)', nameKo: 'LHV 그룹 (탈린 대표 금융주)', ticker: 'LHV1T.TL', isSupported: true },
  { id: 'LVA', nameEn: 'SAF Tehnika (Riga Proxy)', nameKo: 'SAF 테크니카 (리가 대표 기술주)', ticker: 'SAF1R.RG', isSupported: true },
  { id: 'LTU', nameEn: 'Ignitis Group (Vilnius Proxy)', nameKo: '이그니티스 (빌뉴스 대표 에너지주)', ticker: 'IGN1L.VS', isSupported: true },
]

async function fetchTicker(item) {
  if (!item.isSupported || !item.ticker) {
    return {
      countryId: item.id,
      nameEn: item.nameEn,
      nameKo: item.nameKo,
      ticker: '',
      isSupported: false,
      fallbackReasonEn: item.fallbackReasonEn,
      fallbackReasonKo: item.fallbackReasonKo,
      currency: 'USD',
      currentPrice: 0,
      changePct: 0,
      points: []
    }
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.ticker)}?range=3mo&interval=1d`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    const data = await res.json()
    const result = data.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const timestamps = result.timestamp || []
    const closes = result.indicators?.quote?.[0]?.close || []

    const validPoints = []
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i]
      if (close !== null && close !== undefined && !isNaN(close)) {
        const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
        validPoints.push({
          date: dateStr,
          close: Number(close.toFixed(2))
        })
      }
    }

    if (validPoints.length === 0) return null

    // Extract the most recent 30 trading days
    const recent30Points = validPoints.slice(-30)

    const currentPrice = meta.regularMarketPrice || recent30Points[recent30Points.length - 1].close
    const firstPrice = recent30Points[0].close
    const changePct = Number((((currentPrice - firstPrice) / firstPrice) * 100).toFixed(2))

    return {
      countryId: item.id,
      nameEn: item.nameEn,
      nameKo: item.nameKo,
      ticker: item.ticker,
      isSupported: true,
      currency: meta.currency || 'USD',
      currentPrice: Number(currentPrice.toFixed(2)),
      changePct,
      points: recent30Points
    }
  } catch (err) {
    console.error(`Error fetching ${item.id} (${item.ticker}):`, err.message)
    return null
  }
}

async function main() {
  console.log(`Fetching Yahoo Finance stock data for ${COUNTRY_TICKERS.length} countries...`)
  const outDirSrc = path.resolve(__dirname, '../src/data')
  const outDirPub = path.resolve(__dirname, '../public/data')
  const outDirDocs = path.resolve(__dirname, '../docs/data')

  if (!fs.existsSync(outDirSrc)) fs.mkdirSync(outDirSrc, { recursive: true })
  if (!fs.existsSync(outDirPub)) fs.mkdirSync(outDirPub, { recursive: true })
  if (!fs.existsSync(outDirDocs)) fs.mkdirSync(outDirDocs, { recursive: true })

  // Retain existing cache if network fails on any ticker
  let results = {}
  try {
    const existingFile = path.join(outDirSrc, 'stockPricesData.json')
    if (fs.existsSync(existingFile)) {
      results = JSON.parse(fs.readFileSync(existingFile, 'utf8'))
    }
  } catch (e) {
    // ignore
  }

  for (const item of COUNTRY_TICKERS) {
    try {
      const stockData = await fetchTicker(item)
      if (stockData) {
        results[item.id] = stockData
        if (stockData.isSupported) {
          console.log(`✓ ${item.id} (${item.ticker}): ${stockData.currentPrice} ${stockData.currency} (${stockData.changePct > 0 ? '+' : ''}${stockData.changePct}%)`)
        } else {
          console.log(`- ${item.id} (Restricted region graceful fallback)`)
        }
      } else if (results[item.id]) {
        console.warn(`⚠ Network issue for ${item.id} (${item.ticker}), using cached data`)
      } else {
        console.warn(`✗ Failed: ${item.id} (${item.ticker})`)
      }
    } catch (err) {
      if (results[item.id]) {
        console.warn(`⚠ Error fetching ${item.id}, using cached data:`, err.message)
      } else {
        console.warn(`✗ Failed ${item.id}:`, err.message)
      }
    }
  }

  fs.writeFileSync(path.join(outDirSrc, 'stockPricesData.json'), JSON.stringify(results, null, 2), 'utf8')
  fs.writeFileSync(path.join(outDirPub, 'stockPricesData.json'), JSON.stringify(results, null, 2), 'utf8')
  fs.writeFileSync(path.join(outDirDocs, 'stockPricesData.json'), JSON.stringify(results, null, 2), 'utf8')

  console.log(`\nSuccessfully saved ${Object.keys(results).length} / ${COUNTRY_TICKERS.length} countries to stockPricesData.json!`)
}

main()

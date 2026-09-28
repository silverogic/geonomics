# Geonomics - Real-time Global Exchange Rates & GDP Dashboard

A high-performance client-side macroeconomic intelligence dashboard hosted on GitHub Pages. It visualizes official IMF/World Bank economic projections, real-time forex rates, benchmark stock indices, and retail fuel prices worldwide with zero persistent database overhead.

Geonomics also publishes **free, open static REST API v1 endpoints** with global CDN caching.

---

## 🚀 Key Features

1. **IMF WEO & World Bank Macroeconomic Intelligence (110 Economies)**
   - Official statistics and projections for **2024 (Actual)**, **2025 (Estimate)**, and **2026 (Projection)**.
   - Core metrics: **Total GDP**, **GDP per Capita**, **Real Growth Rate (%)**, **General Gov Debt (% of GDP)**, and **Inflation Rate (%)**.
   - 10-year historical trajectory trend charts powered by Chart.js.

2. **Real-time Global Financial & Market Benchmarks**
   - **Forex Rates**: Live feeds supporting 160+ fiat currencies with base switching (USD, EUR, KRW, JPY, GBP, CNY).
   - **Stock Benchmark Indices**: 74 national flagship indices (S&P 500, KOSPI, Nikkei 225, DAX, etc.) with 24h change % and interactive 30-day sparklines.
   - **Retail Gasoline Prices**: National average retail gasoline prices (RON 95, USD/L) for 170 countries.
   - **Central Bank Policy Rates**: Official interest rates from major central banks (Fed, BOK, ECB, BOJ, etc.).

3. **Interactive Visualizations & World Map**
   - **Tile Grid & High-precision Vector World Maps**: Dynamic metric color gradients with pan & zoom.
   - **Mobile-Optimized Ranking Table**: Full-bleed edge-to-edge layout, slimmed sticky rank & country columns, and Category Switcher (Macroeconomic vs. Market & Finance).
   - **1:1 Country Comparison Tool**: Side-by-side comparative analysis with economic scale multiples.

4. **Zero-Database Architecture & Global CDN**
   - Operates with zero backend database maintenance.
   - Client-side in-memory caching (10-minute TTL) ensures real-time accuracy and rate-limit safety.
   - Automated offline fallback data for resilient continuous availability.

5. **Multi-language Localization (i18n)**
   - Supports Korean (`ko`), English (`en`), Japanese (`ja`), Spanish (`es`), and Chinese (`zh`).
   - Automatic browser language and regional currency detection.

---

## 📡 Open REST API v1

Geonomics publishes clean, standardized JSON REST API endpoints on GitHub Pages. Anyone can fetch these endpoints with zero API keys and zero rate limits.

### Endpoints Overview

| # | Dataset | Endpoint (GET) | Description |
| :-: | :--- | :--- | :--- |
| **1** | **Macroeconomic Indicators** | `/api/v1/economics.json` | 110 countries: GDP, per capita, growth, debt, inflation (2024–2026) |
| **2** | **Stock Benchmark Indices** | `/api/v1/stocks.json` | 74 countries: Ticker, price, 24h change %, and 30-day sparkline points |
| **3** | **Gasoline Retail Prices** | `/api/v1/fuel.json` | 170 countries: National average RON 95 gasoline prices in USD/L |
| **4** | **Big Mac Index (PPP)** | `/api/v1/bigmac.json` | 70 countries: The Economist Big Mac Index, USD prices & currency valuation % |

### cURL CLI Usage

```bash
# 1. Macroeconomic data (GDP, debt, inflation, growth)
curl -s https://silverogic.github.io/geonomics/api/v1/economics.json

# 2. Global stock benchmarks and 30-day sparklines
curl -s https://silverogic.github.io/geonomics/api/v1/stocks.json

# 3. National gasoline prices (USD/L)
curl -s https://silverogic.github.io/geonomics/api/v1/fuel.json

# 4. The Economist Big Mac Index (PPP currency valuation)
curl -s https://silverogic.github.io/geonomics/api/v1/bigmac.json
```

### TypeScript / JavaScript SDK (`src/services/geonomicsApi.ts`)

Geonomics provides built-in client functions to interact with the API:

```typescript
import {
  getEconomics,
  getStockPrices,
  getFuelPrices,
  getBigMacIndex,
  getAllData,
} from './services/geonomicsApi'

// 1. Fetch macroeconomic statistics
const economics = await getEconomics()
console.log(economics['KOR'].years['2026'].totalGdpUsd)

// 2. Fetch stock benchmark index data
const stocks = await getStockPrices()
console.log(stocks['USA'].currentPrice, stocks['USA'].changePct)

// 3. Fetch retail gasoline prices
const fuel = await getFuelPrices()
console.log(fuel.prices['KOR'].priceUsd) // USD/L

// 4. Fetch Big Mac Index
const bigMac = await getBigMacIndex()
console.log(bigMac.items['KOR'].dollarPrice, bigMac.items['KOR'].valuationRawPct)

// 5. Fetch all datasets concurrently
const allData = await getAllData()
```

---

## 🛠️ Technical Stack

- **Framework**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js, react-chartjs-2
- **Icons**: Lucide React, country-flag-icons
- **Data Pipelines**: Node.js automated extractors (Excel, Yahoo Finance, Global Petrol Prices)
- **Deployment**: GitHub Pages, GitHub Actions

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Re-sync open API v1 endpoints
npm run sync:api

# 3. Start local development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Build & Data Pipeline Commands

```bash
# Fetch latest Yahoo Finance stock indices
npm run fetch:stocks

# Fetch latest retail gasoline prices
npm run fetch:fuel

# Extract macroeconomic metrics from IMF/World Bank Excel sources
npm run extract:excel

# Sync API v1 endpoints to public/api/v1/
npm run sync:api

# Production build
npm run build
```

---

## 📊 Data Sources & Attribution

- **Macroeconomic Projections & Statistics**: [International Monetary Fund (IMF WEO)](https://www.imf.org/en/Publications/WEO) and [World Bank Open Data](https://data.worldbank.org/)
- **Live Foreign Exchange**: [European Central Bank (ECB)](https://www.ecb.europa.eu/) & [Open Exchange Rates API](https://open.er-api.com/)
- **Stock Market Benchmarks**: National Stock Exchanges via Yahoo Finance
- **Gasoline Retail Prices**: [Global Petrol Prices](https://www.globalpetrolprices.com/) & National Energy Ministries
- **Central Bank Interest Rates**: [Bank for International Settlements (BIS)](https://www.bis.org/) & Central Bank Open Feeds

---

## 📄 License

MIT License. Open for educational, analytical, and commercial use.

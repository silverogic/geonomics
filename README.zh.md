# Geonomics — 实时全球宏观经济与金融情报仪表盘

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/silverogic/geonomics)

**语言**: [English](./README.md) | [한국어 (Korean)](./README.ko.md) | **中文**

**Geonomics** 是一个托管在 GitHub Pages 上的无服务器（serverless）、纯客户端宏观经济与金融市场情报平台。它整合了 **IMF 世界经济展望（WEO）** 与 **世界银行** 官方指标、实时汇率、全球股市市值、基准股指、央行政策利率、零售汽油价格以及 **《经济学人》巨无霸指数（PPP）**，覆盖 **125 个经济体**——无需任何后端数据库。

Geonomics 还提供**免费开放的静态 REST API v1 接口**，通过每日 GitHub Actions 流水线自动更新。

---

## 主要功能

### 1. 交互式 3D 金融与经济地球仪（`FinancialGlobeView`）
- **三大核心分析模式**：
  - **GDP 模式**：6 级地形挤出高度并支持 **Top 5 琥珀色（Amber）阶梯**（第 1–2 名黄金色 `#fbbf24`，第 3–5 名淡琥珀色 `#fde68a`），底部实时焦点行情条，延迟悬停时卡片平滑展开，配合可视化进度条显示国家**政府债务率**。
  - **股市模式**：3D 信标线与代表性基准股指行情，悬停时展开显示 **30 日走势迷你图（Sparkline）**。
  - **汇率模式**：相对于选定基准货币的实时汇率，悬停时展开显示国家**央行基准利率**与央行缩写徽章（Fed、BOK、ECB、BOJ、PBOC 等）。
- **流畅交互与物理控制**：
  - **自动旋转与空格键控制**：平滑持续旋转，支持通过键盘快捷键（`Space`）即时暂停/恢复。
  - **大洲快捷跳转预设**：一键平滑飞行动画聚焦 `Asia`、`Europe`、`Americas`、`Oceania` 或恢复 `Auto Orbit`。
  - **2D 防重叠碰撞松弛（Collision Relaxation）**：无论地球仪视角或缩放比例如何，确保悬浮国家卡片互不遮挡。
  - **3D 极地彩蛋**：北极 3D 雪屋与南极飘扬的 3D 红旗。

### 2. 全球经济地图与宏观经济浏览器（`GdpWorldMap`）
- **两种可视化模式**：
  - **Squarified 宏观经济热力图（`GdpTreemap`，默认）**：使用 Bruls–Huizing–van Wijk squarified treemap 算法，按比例划分全球经济规模（GDP 总量或政府债务规模），以同比增速/变化率着色，并显示世界占比（%）及适配移动端的自适应字体。
  - **53×28 像素块世界地图（`TileWorldMap`）**：交互式网格世界地图，支持 7 种配色指标模式（**GDP 总量**、**人均 GDP**、**实际增长率**、**政府债务比率**、**通胀率**、**汽油价格**、**巨无霸 PPP 指数**），悬浮提示框基于 `requestAnimationFrame`，无需重新渲染。
- **多大洲筛选与长按隔离**：可任意组合大洲（`Asia`、`Europe`、`Americas`、`Africa`、`Oceania`）进行筛选，或**长按（0.7 秒）**某个大洲标签以立即单独显示。
- **多时间维度穿梭**：可在**实际值（$Y-2$）**、**估计值（$Y-1$）**、**预测值（$Y$）**之间无缝切换（例如 2024 实际 / 2025 估计 / 2026 预测）。
- **响应式体验**：桌面/平板端提供实时经济检查器 HUD 侧边栏（在移动端 `< 640px` 自动隐藏，以降低认知负担）。

### 3. 全球股市热力图（`StockHeatmap`）
- **约 144 万亿美元以上的全球股市规模**：使用响应式 squarified treemap，可视化 125 个国家的本国股市市值。
- **TradingView 代表性主板交易所实测市值引擎**：通过 **TradingView Global Scanner API** 汇总全球 72 个主要国家代表性主板交易所（`NASDAQ/NYSE`、`SSE`、`TSE`、`NSE`、`TWSE`、`KRX:KOSPI`、`HKEX` 等）上市普通股总市值（小型经济体采用精选基准值），并结合 **Yahoo Finance 实时指数行情**动态更新。
- **统一视图与五大洲分栏模式**：可在单一全球画布与五大洲对比网格（`Americas`、`Asia`、`Europe`、`Oceania`、`Africa`）之间切换。
- **Zen 全屏沉浸与悬浮毛玻璃 HUD**：单行控制栏、一键全屏模式，悬停 HUD 显示 30 日指数迷你图（`StockSparkline`）、实时指数价格、最新总市值及**实时市值前五强企业（企业图标、名称、市值、日涨跌幅 %）**。
- **近实时行情（Cloudflare Worker 代理）**：当配置 `VITE_STOCK_PROXY_URL` 时，每 60 秒拉取一次盘中报价，并显示 `LIVE` 标识；代理不可用时自动回退到预构建的静态数据。

### 4. 交互式排名表（`RankingTable`）
- **类别切换**：可按**宏观经济**（GDP 总量、人均 GDP、实际增长、通胀、政府债务）、**市场与金融**（汇率、股指及 30 日迷你图、央行政策利率、零售燃油价格、巨无霸指数）或**全部指标**（12 个可排序列）筛选列。
- **浮动吸顶 Dock**：滚动时自动将搜索栏和表头吸附在导航栏下方，横向滚动时冻结排名和国家列。

### 5. 一对一经济体对比（`CompareView`）
- **并排基准对比**：一键切换对抗预设（`USA vs CHN`、`KOR vs JPN`、`DEU vs GBR`、`IND vs JPN` 等），任意两国均可对比。
- **规模倍数与利差**：自动计算 GDP 规模倍数、人均 GDP 比率、央行利率差、双边汇率交叉汇率、巨无霸 PPP 估值，以及双 10 年历史走势图（`GdpChart`）。
- **移动端优化**：提供 1:1 对称矩阵视图，滚动时国家对比头部（如“美国 vs 中国”）吸顶显示。
- **两国市值前五强企业并排对比**：直接对比两国市值前五强龙头企业（官方图标、代码、本地化行业分类、按所选基准货币折算的实时市值、24 小时涨跌幅 %，以及 100% 股市占比堆叠横条）。

### 6. 国家与行业定制经济新闻（`EconomicNewsView`）
- **实时全球新闻聚合 (`newsApi.ts`)**: 聚合 **路透社/彭博社/CNBC/FT 实时 RSS 池** (`laapy/reuters-bloomberg-news-rss-pool`，800 多条去重专业电讯新闻)，配合非阻塞超时保护，实现国家与行业维度的实时筛选。
- **国家 × 行业与自定义关键词搜索**：可针对任意国家，在 **6 大行业/宏观主题**（**经济与商业综合**、**半导体与 AI**、**利率、汇率与通胀**、**能源、电动车与电池**、**贸易、关税与供应链**、**股票与企业**）下浏览定向经济文章，或以任意受支持语言输入自定义关键词（自动翻译为英文进行全球查询）。
- **金融领域实时翻译管线**：通过全大写标题规范化、60 多条华尔街习语预词表以及自然的金融术语后处理，将英文通讯稿标题与摘要即时翻译为韩语、日语、西班牙语和中文，并支持**查看原文（EN）/ 自动翻译**即时切换及英文原文悬停提示。

### 7. 国家深度详情弹窗（`CountryModal`）
- **一站式国家档案**：展示 10 年历史宏观经济走势图（`GdpChart`）、30 日股指表现图（`StockChart`，含 `LIVE`/`CLOSED` 状态标识）、交互式双向**货币转换器（`CurrencyConverter`）**、央行政策利率、燃油价格以及巨无霸 PPP 估值。
- **100% 动态运行时市值前五强企业查询（`topCompaniesApi.ts`）**：零静态 JSON 存储，浏览器运行时按需直连 **TradingView Global Scanner API**（2 分钟内存缓存），展示无边框官方企业图标（`CompanyLogo`）、股票代码、本地化行业、实时市值、日涨跌幅 %，以及**占本国股市 100% 堆叠横条（`TopCompaniesStackedBar`，前 1–5 强 + 其他上市企业）**。
- **72 个本土交易所白名单与基准指数校验**：内置 72 国本土证券交易所映射（`COUNTRY_DOMESTIC_EXCHANGES`）与指数成分校验（例如韩国 `KOR` 严格限定 `KRX:KOSPI` 并排除 `KOSDAQ`，美国 `USA` 校验 `SP:SPX`，中国大陆 `CHN` 限定 `SSE`/`SZSE` A 股，中国香港 `HKG` 限定 `HKEX`，中国台湾 `TWN` 限定 `TWSE` 主板），并按规范化公司名称去重以完整保留同集团独立上市子公司（如三星电子与三星生物制剂）。

### 8. 多币种与现代化多语言（i18n）架构
- **8 种基准货币**：`USD ($)`、`EUR (€)`、`KRW (₩)`、`JPY (¥)`、`GBP (£)`、`CNY (¥)`、`CHF` 和 `AUD (A$)`，采用本地单位格式（`조/억/만`、`兆/億/万円`、`万亿/亿/万元`、`T/B/M`）。
- **5 种受支持语言**：英语（`en`）、韩语（`ko`）、日语（`ja`）、西班牙语（`es`）和中文（`zh`），自动检测浏览器语言与地区货币（`src/utils/locale.ts`）。
- **标准化 i18n 架构**：
  - 基于行业标准 **`i18next` & `react-i18next`** 实现响应式语言同步。
  - 全面借助浏览器原生 **`Intl.DisplayNames`** 与 **`Intl.RelativeTimeFormat`** API，实现零打包体积开销的全语种国家名、货币名和相对时间本地化。
- **极简顶栏与 777 汇率轮盘（`Navbar`, `TickerBar`）**：无边框开放式导航栏设计，统一切换控件高度为 `36px (h-9)`，移动端整合语言与货币选择器（`[ KO · ₩ ▾ ]`）。

---

## 开放 REST API v1

Geonomics 通过 GitHub Pages CDN 提供静态 JSON REST API v1 接口，无需 API 密钥或身份验证。

### 接口概览

| # | 数据集 | 接口（`GET`） | 说明 |
| :-: | :--- | :--- | :--- |
| **1** | **宏观经济指标** | `/api/v1/economics.json` | 125 个经济体：GDP 总量、人均 GDP、实际增长、政府债务占比、通胀率及 10 年历史 |
| **2** | **基准股指** | `/api/v1/stocks.json` | 84 个经济体：旗舰指数代码、当前价格、日涨跌幅及 30 日迷你图数据点 |
| **3** | **股市市值** | `/api/v1/stock-market-caps.json` | 124 个经济体：TradingView 各国代表性主板交易所汇总市值（USD） |
| **4** | **零售汽油价格** | `/api/v1/fuel.json` | 170 个经济体：全国平均 RON 95 零售汽油价格（美元/升） |
| **5** | **巨无霸指数（PPP）** | `/api/v1/bigmac.json` | 70+ 个经济体：本地价格、美元价格、原始 PPP 估值 % 及 GDP 调整后估值 % |

### cURL 示例

```bash
# 1. 宏观经济指标（GDP 总量、人均 GDP、增长、债务、通胀）
curl -s https://silverogic.github.io/geonomics/api/v1/economics.json

# 2. 全球基准股指与 30 日迷你走势图
curl -s https://silverogic.github.io/geonomics/api/v1/stocks.json

# 3. 各国股市总市值（TradingView 主板交易所汇总）
curl -s https://silverogic.github.io/geonomics/api/v1/stock-market-caps.json

# 4. 零售汽油价格（RON 95，美元/升）
curl -s https://silverogic.github.io/geonomics/api/v1/fuel.json

# 5. 巨无霸指数（PPP 汇率估值）
curl -s https://silverogic.github.io/geonomics/api/v1/bigmac.json
```

### TypeScript / JavaScript 客户端示例（`src/services/geonomicsApi.ts`）

```typescript
import {
  getEconomics,
  getStockPrices,
  getFuelPrices,
  getBigMacIndex,
  getAllData,
} from './services/geonomicsApi'
import { fetchStockMarketCaps } from './services/stockMarketCapApi'

// 并行获取所有核心数据
const { economics, stocks, fuel, bigmac } = await getAllData()

// 获取最新联动的股市总市值
const marketCaps = await fetchStockMarketCaps()
console.log(economics['KOR'].years['2026'].totalGdpUsd)
console.log(marketCaps.caps['USA'])
```

---

## 系统架构概览

静态数据由 GitHub Actions 构建并由 GitHub Pages 分发。前端浏览器端直接拉取实时汇率与外信电讯，并通过轻量 Cloudflare Worker 代理获取近实时股指行情（Yahoo Finance 限制跨域请求 CORS，代理不可用时自动回退至预构建静态数据）。

```mermaid
flowchart LR
  subgraph SRC["数据源 (Data Sources)"]
    S1["IMF WEO / 世界银行<br/>Excel 源数据 (.xls)"]
    S2["Yahoo Finance<br/>30 日指数行情历史"]
    S3["TradingView Scanner API<br/>主板交易所市值数据"]
    S4["零售油价 / 巨无霸指数"]
    S5["Coinbase / open.er-api<br/>实时汇率行情"]
    S6["全球外电 RSS 聚合池<br/>经济新闻电讯"]
    S7["TradingView Scanner API<br/>实时市值前 5 强企业"]
  end

  subgraph CI["GitHub Actions (每日构建流水线)"]
    P1["scripts/*.js<br/>提取与转换数据"]
    P2["public/api/v1/*.json"]
    P3["vite build<br/>docs/"]
  end

  subgraph HOST["GitHub Pages (CDN 分发)"]
    WEB["React SPA 前端<br/>(TypeScript + Tailwind)"]
    API["开放 REST API v1<br/>静态 JSON 托管"]
  end

  W["Cloudflare Worker<br/>stock-proxy<br/>(CORS + 60 秒边缘缓存)"]
  U(["用户浏览器"])

  S1 --> P1
  S2 --> P1
  S3 --> P1
  S4 --> P1
  P1 --> P2 --> P3 --> WEB
  P2 --> API

  U --> WEB
  WEB -. "近实时股指 (60 秒)" .-> W
  W --> S2
  WEB -. "实时汇率" .-> S5
  WEB -. "新闻" .-> S6
  WEB -. "实时市值前 5 强" .-> S7
```

## 项目架构

```text
geonomics/
├── public/
│   ├── api/v1/                  # 开放 REST API v1 静态 JSON 端点
│   └── data/                    # IMF 与世界银行官方统计源数据 Excel (.xls)
├── scripts/
│   ├── extractFromExcel.js      # 解析 IMF/WB 电子表格并生成 src/data/imfEconomic.ts 与 api/v1/economics.json
│   ├── fetchStockData.js        # 抓取 Yahoo Finance 指数历史生成 src/data/stockPrices.ts 与 api/v1/stocks.json
│   ├── fetchStockMarketCaps.js  # 汇总 TradingView 主板市值生成 api/v1/stock-market-caps.json
│   ├── fetchFuelPrices.js       # 更新零售汽油价格生成 src/data/fuelPrices.ts 与 api/v1/fuel.json
│   ├── fetchBigMacData.js       # 更新巨无霸指数生成 src/data/bigMac.ts 与 api/v1/bigmac.json
│   └── generatePixelMap.js      # 生成 53x28 像素块世界地图坐标
├── workers/
│   └── stock-proxy/             # Cloudflare Worker: 跨域代理（CORS + 60 秒边缘缓存）
└── src/
    ├── components/              # 核心 UI 组件（FinancialGlobeView, GdpWorldMap, GdpTreemap, TileWorldMap, StockHeatmap, RankingTable, CompareView, EconomicNewsView, CountryModal, TopCompaniesStackedBar, CompanyLogo, Navbar, TickerBar 等）
    ├── data/                    # 类型化静态回退与构建期同步数据集
    ├── i18n/                    # i18next 配置与多语言翻译字典
    ├── services/                # 带内存 TTL 缓存的 API 客户端（worldBankApi, exchangeApi, interestRateApi, stockMarketCapApi, topCompaniesApi, liveStockApi, newsApi, geonomicsApi）
    ├── types/                   # 核心 TypeScript 类型接口定义（economics.ts）
    └── utils/                   # 树状图算法、货币/数字格式化器、本地化与动态年份工具
```

---

## 技术栈

- **前端框架**：React 19, TypeScript 6, Vite 8
- **样式**：Tailwind CSS v4 (`@tailwindcss/vite`)
- **国际化**：`i18next`, `react-i18next`, 原生 `Intl` API
- **数据可视化**：3D Canvas 体素引擎、自定义 SVG Squarified Treemap 引擎、53×28 CSS Grid 像素地图、Chart.js 4 (`react-chartjs-2`)
- **图标与旗帜**：`lucide-react`, `country-flag-icons`
- **代码检查**：`oxlint`
- **数据流水线与 CI/CD**：Node.js ESM 脚本、`xlsx`、GitHub Actions（每日定时更新 + push 自动部署至 GitHub Pages）
- **实时行情代理**：Cloudflare Workers（`workers/stock-proxy`，免费层）

---

## 本地开发运行

### 环境准备
- **Node.js**：v20+（推荐 v22）
- **npm**：v9+

### 安装与启动

```bash
# 1. 安装依赖项
npm install

# 2. 启动 Vite 本地开发服务器
npm run dev
```

在浏览器中打开 `http://localhost:5173`。

### 近实时股票行情代理设置（可选）

部署 Cloudflare Worker 并配置环境变量：

```bash
cd workers/stock-proxy
npx wrangler login
npx wrangler deploy
```

```bash
# .env.local（本地开发）或 GitHub Actions Secret（生产构建）
VITE_STOCK_PROXY_URL=https://<your-worker>.workers.dev
```

### 数据流水线与构建脚本

```bash
# 解析 IMF/世界银行 Excel 数据
npm run extract:excel

# 抓取 Yahoo Finance 基准股指数据
npm run fetch:stocks

# 汇总各主要交易所有效市值
npm run fetch:caps

# 抓取全球零售汽油价格
npm run fetch:fuel

# 抓取巨无霸指数
npm run fetch:bigmac

# 运行完整数据流水线 + TypeScript 类型检查 + Vite 生产构建
npm run build

# 运行代码规范检查
npm run lint
```

---

## 数据来源与授权声明

- **宏观经济指标**：[IMF 世界经济展望 (WEO)](https://www.imf.org/en/Publications/WEO) 与 [世界银行开放数据 (World Bank Open Data)](https://data.worldbank.org/)
- **实时汇率**：[欧洲央行 (ECB)](https://www.ecb.europa.eu/) 与 [Open Exchange Rates API](https://open.er-api.com/)
- **股票总市值及前五强企业**：[TradingView Global Scanner API](https://www.tradingview.com/)（代表性交易所汇总）
- **基准股指**：Yahoo Finance 与各国证券交易所官方行情
- **央行基准利率**：[国际清算银行 (BIS)](https://www.bis.org/) 与各国中央银行
- **零售汽油价格**：[Global Petrol Prices](https://www.globalpetrolprices.com/) 与各国能源部门
- **巨无霸指数 (PPP)**：[《经济学人》巨无霸指数开源数据集](https://github.com/TheEconomist/big-mac-data)
- **全球经济新闻**：[路透社与彭博社外电 RSS 聚合池 (`laapy/reuters-bloomberg-news-rss-pool`)](https://github.com/laapy/reuters-bloomberg-news-rss-pool)；标题翻译基于 Google Translate 接口与 MyMemory

---

## 许可证

MIT License. 免费用于教育、分析与商业用途。

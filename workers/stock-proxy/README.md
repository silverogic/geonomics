# Geonomics Stock Proxy (Cloudflare Worker)

Near-real-time Yahoo Finance quote proxy with CORS + 60s edge cache.

## Deploy

```bash
cd workers/stock-proxy
npx wrangler login     # once
npx wrangler deploy
```

Copy the printed `https://geonomics-stock-proxy.<account>.workers.dev` URL and set it as
`VITE_STOCK_PROXY_URL` (local `.env.local` and the GitHub repo Actions **Variable**).

Edit `ALLOWED_ORIGINS` in `wrangler.toml` if the site is served from a different origin.

## Optional: Real-time Visitor Counter (Cloudflare D1)

To enable real daily & total unique visitor counting (`/?visit=1`) in the Footer:

```bash
cd workers/stock-proxy
npx wrangler d1 create geonomics-visitors
```

Copy the printed `database_id` into `wrangler.toml` under `[[d1_databases]]` (`binding = "VISITOR_DB"`), then redeploy with `npx wrangler deploy`. Tables are auto-created on the first request.

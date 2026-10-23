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

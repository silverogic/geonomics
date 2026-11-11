import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  server: {
    proxy: {
      '/api/imf-weo': {
        target: 'https://www.imf.org',
        changeOrigin: true,
        rewrite: () =>
          '/external/datamapper/api/v1/NGDPD/NGDPDPC/NGDP_RPCH/GGXWDG_NGDP/PCPIPCH',
      },
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})

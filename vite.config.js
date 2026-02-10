import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    server: {
      proxy: {
        '/api/cmc': {
          target: 'https://pro-api.coinmarketcap.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cmc/, ''),
          headers: {
            'X-CMC_PRO_API_KEY': env.VITE_CMC_API_KEY || '',
          },
        },
        '/api/gecko': {
          target: 'https://api.coingecko.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gecko/, ''),
        },
        '/api/1inch': {
          target: 'https://api.1inch.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/1inch/, ''),
          headers: {
            'Authorization': `Bearer ${env.VITE_1INCH_API_KEY || ''}`,
          },
        },
        '/api/jupiter': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jupiter/, ''),
          headers: {
            'x-api-key': 'bfda7f2b-652c-4a12-a752-0bef22f9cbae',
          },
        },
      },
    },
  }
})

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
        '/api/kyberswap': {
          target: 'https://aggregator-api.kyberswap.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kyberswap/, ''),
          headers: {
            ...(env.VITE_KYBERSWAP_CLIENT_ID && { 'x-client-id': env.VITE_KYBERSWAP_CLIENT_ID }),
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
        '/api/solana-rpc': {
          target: env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
          changeOrigin: true,
          rewrite: () => '/',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin')
              proxyReq.removeHeader('referer')
            })
          },
        },
      },
    },
  }
})

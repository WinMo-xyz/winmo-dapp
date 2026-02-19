const assetsData = require('./data/assets.json')
const yieldData = require('./data/yield.json')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function json(body, status = 200) {
  return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

// Flatten all assets into a single array
const allAssets = [
  ...assetsData.stocks,
  ...assetsData.crypto,
  ...assetsData.commodities,
  ...assetsData.bonds,
]

// CoinGecko symbol -> id mapping for live prices
const SYMBOL_TO_GECKO_ID = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  XRP: 'ripple', AVAX: 'avalanche-2', LINK: 'chainlink', DOT: 'polkadot',
  POL: 'matic-network', UNI: 'uniswap', PENDLE: 'pendle', GMX: 'gmx',
  RDNT: 'radiant-capital', JOE: 'joe', JUP: 'jupiter-exchange-solana',
  RAY: 'raydium', ORCA: 'orca', BONK: 'bonk', PYTH: 'pyth-network',
  WIF: 'dogwifcoin', USDT: 'tether', USDC: 'usd-coin', DAI: 'dai',
  USDS: 'usds', MNT: 'mantle', TRX: 'tron', TON: 'the-open-network',
  SHIB: 'shiba-inu', PEPE: 'pepe', CRO: 'crypto-com-chain', LEO: 'leo-token',
  AAVE: 'aave', OKB: 'okb', NEAR: 'near', RENDER: 'render-token',
  ARB: 'arbitrum', ONDO: 'ondo-finance', WLD: 'worldcoin-wld', ENA: 'ethena',
  QNT: 'quant-network', NEXO: 'nexo', MORPHO: 'morpho', EDGEN: 'edgen',
  PAXG: 'pax-gold',
}

// Pyth FX feed IDs
const FX_FEED_IDS = {
  'EUR/USD': '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
  'USD/JPY': '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52',
  'GBP/USD': '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
  'USD/CHF': '0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8',
  'AUD/USD': '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80',
  'USD/CAD': '0x3112b03a41c910ed446852aacf67118cb1bec67b2cd0b9a214c58cc0eaa2ecca',
  'NZD/USD': '0x92eea8ba1b00078cdc2ef6f64f091f262e8c7d0576ee4677572f314ebfafa4c7',
  'EUR/JPY': '0xd8c874fa511b9838d094109f996890642421e462c3b29501a2560cecf82c2eb4',
  'EUR/GBP': '0xc349ff6087acab1c0c5442a9de0ea804239cc9fd09be8b1a93ffa0ed7f366d9c',
  'EUR/CHF': '0x6194ee9b4ae25932ae69e6574871801f0f30b4a3317877c55301a45902aa0c1a',
  'EUR/AUD': '0xf51e4e46f00cb9153ddb379ea26672084c0263126c56102af148402b7a6d11d3',
  'EUR/CAD': '0xfec44951e54a606cbbca6fc7fb721c33bb54e4ae641a8a12d5df94313d635a12',
  'EUR/NZD': '0x589174519ec8e38c11af84436f230bcf600fdb2c9c211303d0d578fda839ea60',
  'GBP/JPY': '0xcfa65905787703c692c3cac2b8a009a1db51ce68b54f5b206ce6a55bfa2c3cd1',
  'GBP/AUD': '0xbbcf32c739841d1170ae2dfaf7c1bd2483df5cf241e2ecf5bce5d14cf09982b1',
  'GBP/CAD': '0xff940d31a543df4485af8f08e81c638cab5af80e399d9928d34f73838a8a106b',
  'GBP/NZD': '0xb02ec3a90ad50a1e46006dd78a06b1ed70f38322c2cd2010c11f6a8c83c8eb33',
  'GBP/CHF': '0xae95ee182ff568100d09257956a01d6bd663072e62fe108bae42ecca4400f527',
  'AUD/JPY': '0x8dbbb66dff44114f0bfc34a1d19f0fe6fc3906dcc72f7668d3ea936e1d6544ce',
  'AUD/NZD': '0x67f98d83d2a5ae486d99bd2ab9da74b09f167fdd4928d4e1189f2360e6943522',
  'AUD/CAD': '0x95330ad1bcac1bd79179fe59000bfe199ba3fe7f03254220548ef2d034bdf4d6',
  'CAD/JPY': '0x9e19cbf0b363b3ce3fa8533e171f449f605a7ca5bb272a9b80df4264591c4cbb',
  'CHF/JPY': '0xe9f0f24d8828dc49e1d7aa6b82373dfaf671f8e28cbf9600b14008670c82a462',
  'NZD/JPY': '0x40f3b8fa7d81f3087ebbe2fd2ad56cd9fa10327e262ca98f3cefdcbf92f94f2f',
  'USD/SGD': '0x396a969a9c1480fa15ed50bc59149e2c0075a72fe8f458ed941ddec48bdb4918',
  'USD/BRL': '0xd2db4dbf1aea74e0f666b0e8f73b9580d407f5e5cf931940b06dc633d7a95906',
  'USD/MXN': '0xe13b1c1ffb32f34e1be9545583f01ef385fde7f42ee66049d30570dc866b77ca',
  'USD/TRY': '0x032a2eba1c2635bf973e95fb62b2c0705c1be2603b9572cc8d5edeaf8744e058',
  'USD/ZAR': '0x389d889017db82bf42141f23b61b8de938a4e2d156e36312175bebf797f493f1',
  'USD/HKD': '0x19d75fde7fee50fe67753fdc825e583594eb2f51ae84e114a5246c4ab23aff4c',
  'USD/NOK': '0x235ddea9f40e9af5814dbcc83a418b98e3ee8df1e34e1ae4d45cf5de596023a3',
  'USD/SEK': '0x8ccb376aa871517e807358d4e3cf0bc7fe4950474dbe6c9ffc21ef64e43fc676',
}

// Payment token metadata for quote resolution
const SOLANA_PAYMENT_META = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
}

const ETH_PAYMENT_META = {
  USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  ETH:  { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
}

function toSmallestUnit(amount, decimals) {
  const [whole = '0', frac = ''] = amount.toString().split('.')
  const padded = frac.padEnd(decimals, '0').slice(0, decimals)
  return (BigInt(whole + padded)).toString()
}

function getAssetChains(asset) {
  const chains = []
  if (asset.providers) {
    for (const p of asset.providers) {
      if (p.address && !chains.includes(p.chain)) chains.push(p.chain)
    }
    return chains
  }
  if (asset.ethereumAddress) chains.push('ethereum')
  return chains
}

// Resolve a token symbol to its on-chain address for a given chain
function resolveAddress(symbol, chain) {
  const upper = symbol.toUpperCase()

  if (chain === 'solana') {
    if (SOLANA_PAYMENT_META[upper]) return { address: SOLANA_PAYMENT_META[upper].mint, decimals: SOLANA_PAYMENT_META[upper].decimals }
    // Search assets for Solana providers
    for (const a of allAssets) {
      if (a.providers) {
        const p = a.providers.find(p => p.chain === 'solana' && (a.symbol.toUpperCase() === upper || p.symbol.toUpperCase() === upper))
        if (p) return { address: p.address, decimals: p.decimals }
      }
    }
  }

  if (chain === 'ethereum') {
    if (ETH_PAYMENT_META[upper]) return { address: ETH_PAYMENT_META[upper].address, decimals: ETH_PAYMENT_META[upper].decimals }
    // Search assets for ethereum address or providers
    for (const a of allAssets) {
      if (a.symbol.toUpperCase() === upper) {
        if (a.providers) {
          const p = a.providers.find(p => p.chain === 'ethereum')
          if (p) return { address: p.address, decimals: p.decimals }
        }
        if (a.ethereumAddress) return { address: a.ethereumAddress, decimals: 18 }
      }
      if (a.providers) {
        const p = a.providers.find(p => p.chain === 'ethereum' && p.symbol.toUpperCase() === upper)
        if (p) return { address: p.address, decimals: p.decimals }
      }
    }
  }

  return null
}

// ─── Route handlers ─────────────────────────────────────

async function handleAssets(params) {
  const { category, subcategory } = params
  let list = allAssets
  if (category) list = list.filter(a => a.category === category)
  if (subcategory) list = list.filter(a => a.subcategory === subcategory)
  return json(list)
}

async function handleAsset(id) {
  const asset = allAssets.find(a => a.id === id)
  if (!asset) return json({ error: 'Asset not found' }, 404)

  const defaultDetail = assetsData.details._default || {}
  const detail = assetsData.details[id] || defaultDetail
  const chains = getAssetChains(asset)

  return json({ ...asset, ...detail, chains })
}

async function handlePrices() {
  try {
    const ids = Object.values(SYMBOL_TO_GECKO_ID).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    )
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`)

    const data = await res.json()
    const geckoIdToSymbol = {}
    for (const [sym, gid] of Object.entries(SYMBOL_TO_GECKO_ID)) {
      geckoIdToSymbol[gid] = sym
    }

    const priceMap = {}
    for (const [geckoId, info] of Object.entries(data)) {
      const symbol = geckoIdToSymbol[geckoId]
      if (symbol && info.usd != null) {
        priceMap[symbol] = { price: info.usd, change24h: info.usd_24h_change || 0 }
      }
    }

    // Merge static prices for non-crypto assets
    for (const a of allAssets) {
      if (!priceMap[a.symbol]) {
        priceMap[a.symbol] = { price: a.price, change24h: a.change24h }
      }
    }

    return json(priceMap)
  } catch (err) {
    // Fallback to static prices
    const priceMap = {}
    for (const a of allAssets) {
      priceMap[a.symbol] = { price: a.price, change24h: a.change24h }
    }
    return json(priceMap)
  }
}

async function handleYield(params) {
  let protocols = yieldData
  if (params.riskLevel) {
    protocols = protocols.filter(p => p.riskLevel === params.riskLevel)
  }

  // Optionally enrich with DeFi Llama live APY
  try {
    const poolIds = protocols.filter(p => p.llamaPoolId).map(p => p.llamaPoolId)
    if (poolIds.length > 0) {
      const res = await fetch('https://yields.llama.fi/pools')
      if (res.ok) {
        const { data } = await res.json()
        const llamaMap = {}
        for (const pool of data) {
          if (poolIds.includes(pool.pool)) {
            llamaMap[pool.pool] = { apy: pool.apy, tvlUsd: pool.tvlUsd }
          }
        }
        protocols = protocols.map(p => {
          const live = llamaMap[p.llamaPoolId]
          if (live) return { ...p, liveApy: live.apy, liveTvl: live.tvlUsd }
          return p
        })
      }
    }
  } catch (_) {
    // Return static data on failure
  }

  return json(protocols)
}

async function handleQuote(params) {
  const { from, to, amount, chain } = params
  if (!from || !to || !amount || !chain) {
    return json({ error: 'Missing required parameters: from, to, amount, chain' }, 400)
  }

  const fromToken = resolveAddress(from, chain)
  const toToken = resolveAddress(to, chain)

  if (!fromToken) return json({ error: `Cannot resolve token "${from}" on ${chain}` }, 400)
  if (!toToken) return json({ error: `Cannot resolve token "${to}" on ${chain}` }, 400)

  const amountRaw = toSmallestUnit(amount, fromToken.decimals)

  if (chain === 'solana') {
    try {
      const url = `https://api.jup.ag/swap/v1/quote?inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountRaw}&slippageBps=50`
      const res = await fetch(url, {
        headers: { 'x-api-key': process.env.JUPITER_API_KEY || '' },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Jupiter error ${res.status}`)
      }
      const quote = await res.json()
      return json({ chain: 'solana', from, to, amount, fromAddress: fromToken.address, toAddress: toToken.address, quote })
    } catch (err) {
      return json({ error: `Jupiter quote failed: ${err.message}` }, 502)
    }
  }

  if (chain === 'ethereum') {
    try {
      const params = new URLSearchParams({
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        amountIn: amountRaw,
        gasInclude: 'true',
      })
      const clientId = process.env.VITE_KYBERSWAP_CLIENT_ID || ''
      const headers = { Accept: 'application/json' }
      if (clientId) headers['x-client-id'] = clientId

      const res = await fetch(`https://aggregator-api.kyberswap.com/ethereum/api/v1/routes?${params}`, { headers })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || body.error || `KyberSwap error ${res.status}`)
      }
      const data = await res.json()
      if (!data.data?.routeSummary) throw new Error('No route found')
      return json({ chain: 'ethereum', from, to, amount, fromAddress: fromToken.address, toAddress: toToken.address, quote: data.data })
    } catch (err) {
      return json({ error: `KyberSwap quote failed: ${err.message}` }, 502)
    }
  }

  return json({ error: `Unsupported chain: ${chain}` }, 400)
}

async function handleSearch(params) {
  const q = (params.q || '').toLowerCase()
  if (!q) return json({ error: 'Missing query parameter: q' }, 400)

  const results = allAssets.filter(
    a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
  )
  return json(results)
}

async function handleForex() {
  try {
    const feedIds = Object.values(FX_FEED_IDS)
    const params = feedIds.map(id => `ids[]=${id}`).join('&')
    const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params}`)
    if (!res.ok) throw new Error(`Pyth error: ${res.status}`)

    const data = await res.json()
    const idToPair = {}
    for (const [pair, id] of Object.entries(FX_FEED_IDS)) {
      idToPair[id.replace('0x', '')] = pair
    }

    const priceMap = {}
    for (const item of (data.parsed || [])) {
      const pair = idToPair[item.id]
      if (pair && item.price) {
        const rawPrice = Number(item.price.price)
        const expo = item.price.expo
        const rawConf = Number(item.price.conf)
        priceMap[pair] = {
          price: rawPrice * Math.pow(10, expo),
          confidence: rawConf * Math.pow(10, expo),
          publishTime: item.price.publish_time,
        }
      }
    }
    return json(priceMap)
  } catch (err) {
    return json({ error: `Forex fetch failed: ${err.message}` }, 502)
  }
}

async function handleTokens(params) {
  const { category, chain } = params
  const list = category
    ? allAssets.filter(a => a.category === category)
    : allAssets

  const tokens = []
  const seen = new Set()

  for (const asset of list) {
    if (asset.providers) {
      for (const p of asset.providers) {
        if ((!chain || p.chain === chain) && p.address && !seen.has(p.address)) {
          seen.add(p.address)
          tokens.push({
            id: `${asset.id}-${p.provider}`,
            name: asset.name,
            symbol: p.symbol,
            address: p.address,
            decimals: p.decimals,
            chain: p.chain,
            logo: asset.logo,
          })
        }
      }
    } else if (!chain || chain === 'ethereum') {
      if (asset.ethereumAddress && !seen.has(asset.ethereumAddress)) {
        seen.add(asset.ethereumAddress)
        tokens.push({
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          address: asset.ethereumAddress,
          decimals: 18,
          chain: 'ethereum',
          logo: asset.logo,
        })
      }
    }
  }

  return json(tokens)
}

// ─── Main handler ─────────────────────────────────────────

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  // Parse path: strip netlify function prefix and /api/agent prefix
  const rawPath = event.path
    .replace(/^\/.netlify\/functions\/agent-api/, '')
    .replace(/^\/api\/agent/, '') || '/'

  // Parse query params
  const params = event.queryStringParameters || {}

  try {
    // Route matching
    if (rawPath === '/assets' || rawPath === '/assets/') {
      return await handleAssets(params)
    }

    const assetMatch = rawPath.match(/^\/asset\/(.+)$/)
    if (assetMatch) {
      return await handleAsset(assetMatch[1])
    }

    if (rawPath === '/prices' || rawPath === '/prices/') {
      return await handlePrices()
    }

    if (rawPath === '/yield' || rawPath === '/yield/') {
      return await handleYield(params)
    }

    if (rawPath === '/quote' || rawPath === '/quote/') {
      return await handleQuote(params)
    }

    if (rawPath === '/search' || rawPath === '/search/') {
      return await handleSearch(params)
    }

    if (rawPath === '/forex' || rawPath === '/forex/') {
      return await handleForex()
    }

    if (rawPath === '/tokens' || rawPath === '/tokens/') {
      return await handleTokens(params)
    }

    // Root: endpoint directory
    if (rawPath === '/' || rawPath === '') {
      return json({
        name: 'WinMo Agent API',
        version: '1.0.0',
        endpoints: {
          assets: 'GET /api/agent/assets?category=&subcategory=',
          asset: 'GET /api/agent/asset/:id',
          prices: 'GET /api/agent/prices',
          yield: 'GET /api/agent/yield?riskLevel=',
          quote: 'GET /api/agent/quote?from=&to=&amount=&chain=',
          search: 'GET /api/agent/search?q=',
          forex: 'GET /api/agent/forex',
          tokens: 'GET /api/agent/tokens?category=&chain=',
        },
        discovery: {
          llms: '/llms.txt',
          agents: '/.well-known/agents.json',
        },
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
}

const CACHE_TTL = 60_000 // 60 seconds
let cache = { data: null, timestamp: 0 }

// Map of symbol -> CoinGecko ID
const SYMBOL_TO_GECKO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  DOT: 'polkadot',
  POL: 'matic-network',
  UNI: 'uniswap',
  PENDLE: 'pendle',
  GMX: 'gmx',
  RDNT: 'radiant-capital',
  JOE: 'joe',
  JUP: 'jupiter-exchange-solana',
  RAY: 'raydium',
  ORCA: 'orca',
  BONK: 'bonk',
  PYTH: 'pyth-network',
  WIF: 'dogwifcoin',
}

const GECKO_ID_TO_SYMBOL = Object.fromEntries(
  Object.entries(SYMBOL_TO_GECKO_ID).map(([sym, id]) => [id, sym])
)

/**
 * Fetches latest crypto quotes from CoinGecko (free, CORS-enabled).
 * Returns a map of symbol -> { price, change24h } or null on failure.
 */
export async function fetchCryptoPrices() {
  const now = Date.now()

  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data
  }

  try {
    const ids = Object.values(SYMBOL_TO_GECKO_ID).join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const json = await response.json()
    const priceMap = {}

    for (const [geckoId, data] of Object.entries(json)) {
      const symbol = GECKO_ID_TO_SYMBOL[geckoId]
      if (symbol && data.usd != null) {
        priceMap[symbol] = {
          price: data.usd,
          change24h: data.usd_24h_change || 0,
        }
      }
    }

    cache = { data: priceMap, timestamp: now }
    return priceMap
  } catch (err) {
    console.error('[prices] Failed to fetch prices:', err)
    return cache.data || null
  }
}

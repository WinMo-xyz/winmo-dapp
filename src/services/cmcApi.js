const CACHE_TTL = 60_000 // 60 seconds
let cache = { data: null, timestamp: 0 }

const CRYPTO_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP',
  'AVAX', 'LINK', 'DOT', 'POL', 'UNI',
  'PENDLE', 'GMX', 'RDNT', 'JOE',
  'JUP', 'RAY', 'ORCA', 'BONK', 'PYTH', 'WIF',
]

/**
 * Fetches latest crypto quotes from CoinMarketCap via Vite proxy.
 * Returns a map of symbol -> { price, change24h } or null on failure.
 */
export async function fetchCryptoPrices() {
  const now = Date.now()

  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data
  }

  try {
    const symbols = CRYPTO_SYMBOLS.join(',')
    const response = await fetch(
      `/api/cmc/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`
    )

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status}`)
    }

    const json = await response.json()
    const priceMap = {}

    for (const [symbol, entry] of Object.entries(json.data || {})) {
      const quote = entry.quote?.USD
      if (quote) {
        priceMap[symbol] = {
          price: quote.price,
          change24h: quote.percent_change_24h,
        }
      }
    }

    cache = { data: priceMap, timestamp: now }
    return priceMap
  } catch (err) {
    console.error('[cmcApi] Failed to fetch prices:', err)
    return cache.data || null
  }
}

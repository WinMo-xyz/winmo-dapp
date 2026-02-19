const COINGECKO_IDS = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  bnb: 'binancecoin',
  uni: 'uniswap',
  mnt: 'mantle',
  jup: 'jupiter-exchange-solana',
  ray: 'raydium',
  'orca-token': 'orca',
  bonk: 'bonk',
  pyth: 'pyth-network',
}

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function isCryptoAsset(assetId) {
  return assetId in COINGECKO_IDS
}

export async function fetchPriceHistory(assetId, days = 7) {
  const geckoId = COINGECKO_IDS[assetId]
  if (!geckoId) return null

  const cacheKey = `${assetId}:${days}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(
      `/api/gecko/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}`
    )
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)

    const json = await res.json()
    const data = json.prices.map(([time, price]) => ({ time, price }))

    cache.set(cacheKey, { data, ts: Date.now() })
    return data
  } catch (err) {
    console.error('CoinGecko fetch failed:', err)
    return null
  }
}

/**
 * Seeded pseudo-random number generator for deterministic chart data.
 * Produces consistent charts per asset across page loads.
 */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// Daily volatility by asset category
const VOLATILITY = {
  'stocks:pre-ipo': 0.025,
  'stocks:large-cap': 0.012,
  'stocks:mid-cap': 0.015,
  'stocks:small-cap': 0.018,
  commodities: 0.008,
  bonds: 0.003,
}

/**
 * Generates deterministic synthetic price history for non-crypto assets.
 * Uses a random walk anchored to the asset's current price.
 */
export function generatePriceHistory(assetId, currentPrice, category, subcategory, days = 7) {
  const cacheKey = `gen:${assetId}:${days}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  const volKey = subcategory ? `${category}:${subcategory}` : category
  const dailyVol = VOLATILITY[volKey] || 0.012

  const rand = seededRandom(hashString(assetId + days))
  const now = Date.now()
  const msPerDay = 86400000

  // Number of data points scales with time range
  let points
  if (days <= 1) points = 96        // every 15 min
  else if (days <= 7) points = 168   // hourly
  else if (days <= 30) points = 180  // every 4h
  else points = 365                  // daily

  const interval = (days * msPerDay) / points
  // Scale volatility per step (daily vol * sqrt of fraction of day per step)
  const stepVol = dailyVol * Math.sqrt(interval / msPerDay)

  // Build price path backwards from current price
  const prices = new Array(points + 1)
  prices[points] = currentPrice

  for (let i = points - 1; i >= 0; i--) {
    // Box-Muller for normal distribution
    const u1 = rand() || 0.001
    const u2 = rand()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const change = stepVol * z
    prices[i] = prices[i + 1] * (1 - change)
    if (prices[i] <= 0) prices[i] = prices[i + 1] * 0.99
  }

  const data = prices.map((price, i) => ({
    time: now - (points - i) * interval,
    price,
  }))

  cache.set(cacheKey, { data, ts: Date.now() })
  return data
}

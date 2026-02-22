const CACHE_TTL = 60_000 // 60 seconds
let cache = { data: null, timestamp: 0 }
let rankCache = { data: null, timestamp: 0 }

// Map of symbol -> CoinGecko ID
export const SYMBOL_TO_GECKO_ID = {
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
  // Stablecoins
  USDT: 'tether',
  USDC: 'usd-coin',
  DAI: 'dai',
  // Additional crypto
  USDS: 'usds',
  MNT: 'mantle',
  TRX: 'tron',
  TON: 'the-open-network',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  CRO: 'crypto-com-chain',
  LEO: 'leo-token',
  AAVE: 'aave',
  OKB: 'okb',
  NEAR: 'near',
  RENDER: 'render-token',
  ARB: 'arbitrum',
  ONDO: 'ondo-finance',
  WLD: 'worldcoin-wld',
  ENA: 'ethena',
  QNT: 'quant-network',
  NEXO: 'nexo',
  MORPHO: 'morpho',
  EDGEN: 'edgen',
  PAXG: 'pax-gold',
}

const GECKO_ID_TO_SYMBOL = Object.fromEntries(
  Object.entries(SYMBOL_TO_GECKO_ID).map(([sym, id]) => [id, sym])
)

/**
 * Fetches latest crypto quotes + market_cap_rank from CoinGecko /coins/markets.
 * Single call serves both live prices and ratings — avoids rate-limit collisions.
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
      `/api/gecko/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h`
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const coins = await response.json()
    if (!Array.isArray(coins)) throw new Error('Unexpected response format')

    const priceMap = {}
    const ranks = {}

    for (const coin of coins) {
      const symbol = GECKO_ID_TO_SYMBOL[coin.id]
      if (!symbol) continue
      priceMap[symbol] = {
        price: coin.current_price ?? 0,
        change24h: coin.price_change_percentage_24h ?? 0,
      }
      ranks[symbol] = coin.market_cap_rank ?? null
    }

    cache = { data: priceMap, timestamp: now }
    rankCache = { data: ranks, timestamp: now }
    return priceMap
  } catch (err) {
    // Mark rankCache as fetched-but-empty so useRatings can distinguish
    // "never fetched" (null) from "fetch failed" (empty object)
    if (!rankCache.data) rankCache = { data: {}, timestamp: Date.now() }
    return cache.data || null
  }
}

/**
 * Returns cached market_cap_rank data from the last fetchCryptoPrices() call.
 * No extra API call — piggybacks off the price fetch.
 */
export function getCachedRanks() {
  return rankCache.data
}

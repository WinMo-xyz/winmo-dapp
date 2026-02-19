import { useState, useEffect, useRef } from 'react'

/**
 * Map token symbols to CoinGecko IDs for historical price fetching.
 * Covers all tokens from cmcApi + coingeckoApi mappings.
 */
const SYMBOL_TO_GECKO = {
  BTC: 'bitcoin',
  WBTC: 'bitcoin',
  ETH: 'ethereum',
  WETH: 'ethereum',
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
  MNT: 'mantle',
}

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

async function fetchGeckoHistory(geckoId, days) {
  const key = `${geckoId}:${days}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  try {
    const res = await fetch(
      `/api/gecko/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}`
    )
    if (!res.ok) return null
    const json = await res.json()
    const data = json.prices // [[timestamp, price], ...]
    cache.set(key, { data, ts: Date.now() })
    return data
  } catch {
    return null
  }
}

/**
 * Generate synthetic price history for tokens without CoinGecko data.
 * Uses a seeded random walk anchored to the current price.
 */
function syntheticHistory(currentPrice, days, seed) {
  const points = days <= 1 ? 96 : days <= 7 ? 168 : Math.min(days, 365)
  const now = Date.now()
  const interval = (days * 86400000) / points
  const vol = days <= 1 ? 0.005 : days <= 30 ? 0.012 : 0.02

  let s = seed
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return (s % 10000) / 10000 }

  const prices = new Array(points + 1)
  prices[points] = currentPrice
  for (let i = points - 1; i >= 0; i--) {
    const change = (rand() - 0.5) * vol * 2
    prices[i] = prices[i + 1] * (1 - change)
    if (prices[i] <= 0) prices[i] = prices[i + 1] * 0.99
  }

  return prices.map((price, i) => [now - (points - i) * interval, price])
}

function hashStr(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Given an array of holdings, fetches historical prices for each token
 * and computes the portfolio value over time.
 *
 * @param {Array} holdings - [{symbol, balance, price, ...}]
 * @param {number} days - time range in days
 * @returns {{ history: Array<{time, value}>, isLoading: boolean }}
 */
export function usePortfolioHistory(holdings, days) {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef(0)

  useEffect(() => {
    if (!holdings || holdings.length === 0) {
      setHistory([])
      return
    }

    const id = ++abortRef.current
    setIsLoading(true)

    async function build() {
      // Dedupe tokens by symbol, sum balances
      const tokenMap = {}
      for (const h of holdings) {
        const sym = h.symbol
        // Strip commas from formatted balance strings (e.g. "2,400.00" → "2400.00")
        const balStr = typeof h.balance === 'string' ? h.balance.replace(/,/g, '') : String(h.balance)
        const bal = parseFloat(balStr) || 0
        if (bal <= 0) continue
        if (tokenMap[sym]) {
          tokenMap[sym].balance += bal
          tokenMap[sym].value += h.value || 0
        } else {
          tokenMap[sym] = { symbol: sym, balance: bal, price: h.price, value: h.value || 0 }
        }
      }

      const tokens = Object.values(tokenMap)
      if (tokens.length === 0) {
        if (id === abortRef.current) { setHistory([]); setIsLoading(false) }
        return
      }

      // Fetch historical prices for each unique token
      const priceHistories = await Promise.all(
        tokens.map(async (tok) => {
          const geckoId = SYMBOL_TO_GECKO[tok.symbol.toUpperCase()]
          let prices = null
          if (geckoId) {
            prices = await fetchGeckoHistory(geckoId, days)
          }
          if (!prices) {
            // Fall back to synthetic history
            prices = syntheticHistory(tok.price, days, hashStr(tok.symbol))
          }
          return { symbol: tok.symbol, balance: tok.balance, prices }
        })
      )

      if (id !== abortRef.current) return

      // Find common time range: use the token with the most data points as the time axis
      // Interpolate other tokens' prices at those timestamps
      const primary = priceHistories.reduce(
        (best, ph) => (ph.prices.length > best.prices.length ? ph : best),
        priceHistories[0]
      )
      const timestamps = primary.prices.map(p => p[0])

      // For each token, build a price-at-timestamp lookup via linear interpolation
      const interpolated = priceHistories.map(ph => {
        const pts = ph.prices
        if (pts.length === 0) return { balance: ph.balance, values: [] }

        const values = new Array(timestamps.length)
        let j = 0
        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i]
          // Advance j to find surrounding points
          while (j < pts.length - 1 && pts[j + 1][0] < t) j++

          if (j >= pts.length - 1) {
            values[i] = pts[pts.length - 1][1]
          } else if (pts[j][0] >= t) {
            values[i] = pts[j][1]
          } else {
            // Linear interpolation
            const t0 = pts[j][0], t1 = pts[j + 1][0]
            const p0 = pts[j][1], p1 = pts[j + 1][1]
            const ratio = (t - t0) / (t1 - t0)
            values[i] = p0 + (p1 - p0) * ratio
          }
        }
        return { balance: ph.balance, values }
      })

      // Sum portfolio value at each timestamp
      const portfolioHistory = timestamps.map((time, i) => {
        let value = 0
        for (const tok of interpolated) {
          if (tok.values[i] != null) {
            value += tok.balance * tok.values[i]
          }
        }
        return { time, value }
      })

      if (id === abortRef.current) {
        setHistory(portfolioHistory)
        setIsLoading(false)
      }
    }

    build()
  }, [holdings, days])

  return { history, isLoading }
}

// ─── Ratings Service (piggybacks off cmcApi price fetch) ─────────────
// No extra API calls — reads market_cap_rank from the shared CoinGecko
// /coins/markets response that fetchCryptoPrices() already fetches.

import { getCachedRanks } from './cmcApi'

/**
 * Builds rating data from the cached rank map.
 * Returns { [symbol]: { symbol, compositeScore, coingecko, sources, updatedAt } }
 */
export function fetchRatings(symbols) {
  if (!symbols || symbols.length === 0) return {}

  const ranks = getCachedRanks()
  const result = {}

  for (const sym of symbols) {
    const rank = ranks?.[sym] ?? null
    if (rank) {
      const score = Math.round(Math.min(100, Math.max(0, 100 - rank * 0.5)))
      result[sym] = {
        symbol: sym,
        compositeScore: score,
        coingecko: { marketCapRank: rank, score },
        sources: ['CoinGecko'],
        updatedAt: Date.now(),
      }
    } else {
      result[sym] = {
        symbol: sym,
        compositeScore: null,
        coingecko: null,
        sources: [],
        updatedAt: Date.now(),
      }
    }
  }

  return result
}

export function getRatingLabel(score) {
  if (score == null) return null
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 20) return 'Caution'
  return 'Poor'
}

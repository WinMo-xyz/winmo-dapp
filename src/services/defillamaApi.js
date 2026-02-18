const CACHE_TTL = 5 * 60_000 // 5 minutes
let cache = { data: null, timestamp: 0 }

/**
 * Fetches yield pool data from DeFi Llama.
 * Returns a map of poolId -> { apy, tvl } for the requested pool IDs.
 */
export async function fetchYieldPools(poolIds) {
  const now = Date.now()

  // Return cached data if fresh
  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return filterPools(cache.data, poolIds)
  }

  try {
    const response = await fetch('https://yields.llama.fi/pools')
    if (!response.ok) throw new Error(`DeFi Llama API error: ${response.status}`)

    const json = await response.json()
    const poolMap = {}

    for (const pool of json.data) {
      poolMap[pool.pool] = {
        apy: pool.apy ?? pool.apyBase ?? 0,
        tvl: pool.tvlUsd ?? 0,
      }
    }

    cache = { data: poolMap, timestamp: now }
    return filterPools(poolMap, poolIds)
  } catch (err) {
    console.error('[defiLlama] Failed to fetch yield pools:', err)
    return cache.data ? filterPools(cache.data, poolIds) : {}
  }
}

function filterPools(poolMap, poolIds) {
  const result = {}
  for (const id of poolIds) {
    if (poolMap[id]) result[id] = poolMap[id]
  }
  return result
}

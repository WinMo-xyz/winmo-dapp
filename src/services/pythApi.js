const HERMES_URL = '/api/pyth/v2/updates/price/latest'
const CACHE_TTL = 10_000 // 10 seconds
let cache = { data: null, timestamp: 0 }

/**
 * Fetch latest FX prices from Pyth Hermes API.
 * @param {Record<string, string>} feedIdMap - pairName -> hex feed ID
 * @returns {Record<string, { price, confidence, publishTime }>}
 */
export async function fetchPythPrices(feedIdMap) {
  const now = Date.now()
  if (cache.data && (now - cache.timestamp) < CACHE_TTL) return cache.data

  try {
    const feedIds = Object.values(feedIdMap)
    const params = feedIds.map(id => `ids[]=${id}`).join('&')
    const response = await fetch(`${HERMES_URL}?${params}`)
    if (!response.ok) throw new Error(`Pyth API error: ${response.status}`)

    const json = await response.json()
    const priceMap = {}

    // Reverse map: hex id (no 0x) -> pair name
    const idToPair = {}
    for (const [pair, id] of Object.entries(feedIdMap)) {
      idToPair[id.replace('0x', '')] = pair
    }

    for (const item of (json.parsed || [])) {
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

    cache = { data: priceMap, timestamp: now }
    return priceMap
  } catch (err) {
    return cache.data || {}
  }
}

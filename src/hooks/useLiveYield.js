import { useState, useEffect, useMemo } from 'react'
import { getYieldProtocols } from '../services/yield'
import { fetchYieldPools } from '../services/defillamaApi'

/**
 * Fetches live APY/TVL from DeFi Llama and merges with static protocol data.
 * Protocols without a llamaPoolId keep their static values.
 */
export function useLiveYield() {
  const [liveData, setLiveData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const staticProtocols = useMemo(() => getYieldProtocols(), [])

  // Collect all pool IDs that need fetching
  const poolIds = useMemo(
    () => staticProtocols.filter(p => p.llamaPoolId).map(p => p.llamaPoolId),
    [staticProtocols]
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const pools = await fetchYieldPools(poolIds)
      if (!cancelled) {
        setLiveData(pools)
        setIsLoading(false)
      }
    }

    load()

    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [poolIds])

  // Merge live data into protocols
  const protocols = useMemo(() => {
    return staticProtocols.map(p => {
      if (!p.llamaPoolId || !liveData?.[p.llamaPoolId]) return p

      const live = liveData[p.llamaPoolId]
      return {
        ...p,
        apy: parseFloat(live.apy.toFixed(2)),
        totalDeposits: formatTvl(live.tvl),
      }
    })
  }, [staticProtocols, liveData])

  return { protocols, isLoading }
}

function formatTvl(tvl) {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(0)}M`
  if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(0)}K`
  return `$${tvl.toFixed(0)}`
}

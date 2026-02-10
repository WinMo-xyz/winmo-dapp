import { useState, useEffect, useCallback } from 'react'
import { refreshCryptoPrices } from '../services/assets'

/**
 * Hook that fetches live crypto prices on mount and every intervalMs.
 * Returns { loading, version, refresh }.
 * `version` increments on each successful refresh — use it to trigger re-renders.
 */
export function useLivePrices(intervalMs = 60_000) {
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const updated = await refreshCryptoPrices()
      if (updated) {
        setVersion(v => v + 1)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return { loading, version, refresh }
}

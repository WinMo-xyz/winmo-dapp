import { useMemo } from 'react'
import { fetchRatings } from '../services/ratingsApi'
import { getCachedRanks } from '../services/cmcApi'

export function useRatings(symbols, priceVersion) {
  const symbolKey = useMemo(
    () => (symbols && symbols.length > 0) ? [...symbols].sort().join(',') : '',
    [symbols]
  )

  const ranksReady = getCachedRanks() !== null

  const ratings = useMemo(() => {
    if (!symbolKey) return {}
    return fetchRatings(symbolKey.split(','))
  }, [symbolKey, priceVersion])

  const hasSymbols = Object.keys(ratings).length > 0
  const hasData = Object.values(ratings).some(r => r.compositeScore !== null)

  return {
    ratings,
    isLoading: hasSymbols && !ranksReady,
    hasError: hasSymbols && ranksReady && !hasData,
  }
}

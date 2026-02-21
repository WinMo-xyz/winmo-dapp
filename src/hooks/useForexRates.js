import { useState, useEffect, useCallback, useMemo } from 'react'
import { FX_FEED_IDS, FX_MARKETS, CURRENCY_TO_USD } from '../config/forex'
import { fetchPythPrices } from '../services/pythApi'

/**
 * Provides live FX rates from Pyth Network oracle.
 * Auto-refreshes every 10 seconds.
 */
export function useForexRates() {
  const [rates, setRates] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchRates = useCallback(async () => {
    const data = await fetchPythPrices(FX_FEED_IDS)
    if (Object.keys(data).length > 0) {
      setRates(data)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 30_000)
    return () => clearInterval(interval)
  }, [fetchRates])

  // Direct Pyth rate for a named pair (e.g. "EUR/USD")
  const getDirectRate = useCallback((pair) => {
    return rates[pair]?.price ?? null
  }, [rates])

  // Cross rate: 1 FROM = ? TO, computed by chaining through USD
  const getCrossRate = useCallback((from, to) => {
    if (from === to) return 1.0

    // Try direct feed
    const direct = `${from}/${to}`
    if (rates[direct]) return rates[direct].price

    // Try inverse feed
    const inverse = `${to}/${from}`
    if (rates[inverse]) return 1 / rates[inverse].price

    // Chain through USD: rate = (FROM in USD) / (TO in USD)
    const fromDef = CURRENCY_TO_USD[from]
    const toDef = CURRENCY_TO_USD[to]
    if (!fromDef || !toDef) return null

    let fromInUsd = 1
    if (fromDef.feed) {
      const r = rates[fromDef.feed]?.price
      if (!r) return null
      fromInUsd = fromDef.inverse ? (1 / r) : r
    }

    let toInUsd = 1
    if (toDef.feed) {
      const r = rates[toDef.feed]?.price
      if (!r) return null
      toInUsd = toDef.inverse ? (1 / r) : r
    }

    return fromInUsd / toInUsd
  }, [rates])

  // Enrich markets with live rates
  const markets = useMemo(() => {
    return FX_MARKETS.map(m => ({
      ...m,
      rate: getDirectRate(m.pair),
      tradeable: !!(m.inputToken && m.outputToken),
    }))
  }, [getDirectRate])

  return { rates, markets, isLoading, getDirectRate, getCrossRate }
}

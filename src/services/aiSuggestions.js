// ─── AI Suggestions Engine ─────────────────────────────────────────────
// Pure heuristic-based suggestion generators — no external AI API.
// Every suggestion targets a specific tradeable asset with an executable action.

/**
 * @typedef {Object} Suggestion
 * @property {string} id
 * @property {string} type     - momentum | value | risk | yield | arbitrage | rebalance
 * @property {string} action   - Buy | Sell | Deposit | Swap
 * @property {string} title
 * @property {string} reason
 * @property {string} asset    - specific tradeable symbol
 * @property {string} confidence - high | medium | low
 */

// ─── Asset Suggestions (Stocks, Crypto, Commodities, Bonds) ─────────

export function generateAssetSuggestions(assets, livePrices, category) {
  if (!assets || assets.length === 0) return []
  const suggestions = []

  // Merge live prices into assets
  const enriched = assets.map(a => {
    const livePrice = livePrices?.[a.symbol?.toUpperCase()] ?? livePrices?.[a.symbol]
    const price = livePrice ?? a.price
    const change = a.change24h ?? 0
    return { ...a, price, change24h: change }
  })

  // Sort by change24h to find relative top/bottom movers
  const sorted = [...enriched].sort((a, b) => b.change24h - a.change24h)

  // Top gainer — always show the #1 performer
  if (sorted.length > 0 && sorted[0].change24h > 0) {
    const top = sorted[0]
    suggestions.push({
      id: `top-gainer-${top.symbol}`,
      type: 'momentum',
      action: 'Buy',
      title: `${top.symbol} Top Gainer`,
      reason: `Leading ${category.toLowerCase()} at +${top.change24h.toFixed(2)}% today. ${top.name} is outperforming its peers.`,
      asset: top.symbol,
      confidence: top.change24h > 3 ? 'high' : 'medium',
    })
  }

  // Biggest loser — dip buy opportunity
  if (sorted.length > 1) {
    const bottom = sorted[sorted.length - 1]
    if (bottom.change24h < 0) {
      suggestions.push({
        id: `dip-${bottom.symbol}`,
        type: 'value',
        action: 'Buy',
        title: `${bottom.symbol} Dip Opportunity`,
        reason: `Down ${Math.abs(bottom.change24h).toFixed(2)}% today — the biggest pullback in ${category.toLowerCase()}. Could be a buying opportunity.`,
        asset: bottom.symbol,
        confidence: bottom.change24h > -3 ? 'medium' : 'low',
      })
    }
  }

  // Second-best gainer if above 3%
  if (sorted.length > 1 && sorted[1].change24h > 3) {
    const asset = sorted[1]
    suggestions.push({
      id: `momentum-${asset.symbol}`,
      type: 'momentum',
      action: 'Buy',
      title: `${asset.symbol} Strong Momentum`,
      reason: `Up ${asset.change24h.toFixed(1)}% in the last 24h. ${asset.name} is showing strong upward momentum.`,
      asset: asset.symbol,
      confidence: asset.change24h > 5 ? 'high' : 'medium',
    })
  }

  // Multi-provider arbitrage — targets a specific asset
  const multiProvider = enriched.filter(a => a.providers && a.providers.length >= 2)
  if (multiProvider.length > 0) {
    const pick = multiProvider[0]
    const providerNames = [...new Set(pick.providers.map(p => p.provider))]
    if (providerNames.length >= 2) {
      suggestions.push({
        id: `arb-${pick.symbol}`,
        type: 'arbitrage',
        action: 'Buy',
        title: `${pick.symbol} Multi-Provider`,
        reason: `Available from ${providerNames.join(' & ')}. Compare prices across providers — buy from the cheapest.`,
        asset: pick.symbol,
        confidence: 'medium',
      })
    }
  }

  // Second cheapest asset — budget pick
  const byPrice = [...enriched].sort((a, b) => a.price - b.price)
  if (byPrice.length > 1 && byPrice[0].price < byPrice[byPrice.length - 1].price * 0.1) {
    const cheap = byPrice[0]
    suggestions.push({
      id: `budget-${cheap.symbol}`,
      type: 'value',
      action: 'Buy',
      title: `${cheap.symbol} Budget Pick`,
      reason: `At $${cheap.price < 0.01 ? cheap.price.toFixed(6) : cheap.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${cheap.name} is the lowest-priced asset here. Small entry, high upside potential.`,
      asset: cheap.symbol,
      confidence: 'low',
    })
  }

  return suggestions
}

// ─── Yield Suggestions ──────────────────────────────────────────────

export function generateYieldSuggestions(protocols) {
  if (!protocols || protocols.length === 0) return []
  const suggestions = []

  // Group by risk level
  const byRisk = {}
  for (const p of protocols) {
    if (!byRisk[p.riskLevel]) byRisk[p.riskLevel] = []
    byRisk[p.riskLevel].push(p)
  }

  // Best in each risk tier — each targets a specific depositable protocol
  for (const [risk, group] of Object.entries(byRisk)) {
    const best = group.reduce((a, b) => a.apy > b.apy ? a : b)
    const riskLabel = risk === 'high-yield' ? 'High Yield' : risk.charAt(0).toUpperCase() + risk.slice(1)
    suggestions.push({
      id: `best-${risk}`,
      type: 'yield',
      action: 'Deposit',
      title: `Top ${riskLabel}: ${best.name}`,
      reason: `${best.name} offers ${best.apy}% APY — the highest in the ${riskLabel.toLowerCase()} tier. ${best.protocol} on ${best.network}.`,
      asset: best.name,
      confidence: risk === 'safe' ? 'high' : risk === 'low' ? 'medium' : 'low',
    })
  }

  // APY anomalies — targets a specific protocol to deposit into cautiously
  for (const [risk, group] of Object.entries(byRisk)) {
    if (group.length < 2) continue
    const avg = group.reduce((sum, p) => sum + p.apy, 0) / group.length
    for (const p of group) {
      if (p.apy > avg * 1.8) {
        suggestions.push({
          id: `anomaly-${p.id}`,
          type: 'risk',
          action: 'Deposit',
          title: `${p.name} High APY — Verify Risk`,
          reason: `${p.apy}% APY is well above the ${risk} tier average of ${avg.toFixed(1)}%. Deposit with caution — verify the risk profile first.`,
          asset: p.name,
          confidence: 'low',
        })
      }
    }
  }

  // Network comparison — recommend the best protocol on the winning chain
  const ethSafe = protocols.filter(p => p.network === 'Ethereum' && p.riskLevel === 'safe')
  const solSafe = protocols.filter(p => p.network === 'Solana' && p.riskLevel === 'safe')
  if (ethSafe.length > 0 && solSafe.length > 0) {
    const avgEth = ethSafe.reduce((s, p) => s + p.apy, 0) / ethSafe.length
    const avgSol = solSafe.reduce((s, p) => s + p.apy, 0) / solSafe.length
    if (avgSol > avgEth + 1) {
      const best = solSafe.reduce((a, b) => a.apy > b.apy ? a : b)
      suggestions.push({
        id: 'network-sol-wins',
        type: 'yield',
        action: 'Deposit',
        title: `${best.name} — Solana Yields Lead`,
        reason: `Safe Solana yields average ${avgSol.toFixed(1)}% vs Ethereum's ${avgEth.toFixed(1)}%. ${best.name} at ${best.apy}% is the top pick.`,
        asset: best.name,
        confidence: 'medium',
      })
    } else if (avgEth > avgSol + 1) {
      const best = ethSafe.reduce((a, b) => a.apy > b.apy ? a : b)
      suggestions.push({
        id: 'network-eth-wins',
        type: 'yield',
        action: 'Deposit',
        title: `${best.name} — Ethereum Yields Lead`,
        reason: `Safe Ethereum yields average ${avgEth.toFixed(1)}% vs Solana's ${avgSol.toFixed(1)}%. ${best.name} at ${best.apy}% is the top pick.`,
        asset: best.name,
        confidence: 'medium',
      })
    }
  }

  return suggestions
}

// ─── Forex Suggestions ──────────────────────────────────────────────

export function generateForexSuggestions(rates, markets) {
  const suggestions = []
  if (!markets || markets.length === 0) return suggestions

  const tradeable = markets.filter(m => m.tradeable && m.rate != null)

  // ── 1. Cross-rate triangular arbitrage detection ──────────────────
  // Look for mispricing between direct and cross rates.
  // If A/B direct differs from (A/USD) / (B/USD) by > 0.1%, that's a signal.
  if (rates && Object.keys(rates).length >= 3) {
    let bestArbSpread = 0
    let bestArbPair = null

    for (const m of tradeable) {
      if (!m.rate) continue
      const directRate = m.rate

      // Compute cross rate via USD
      const baseFeed = rates[`${m.base}/USD`]
      const quoteFeed = rates[`${m.quote}/USD`]
      const baseInUsd = baseFeed ? baseFeed.price
        : m.base === 'USD' ? 1
        : rates[`USD/${m.base}`] ? (1 / rates[`USD/${m.base}`].price) : null
      const quoteInUsd = quoteFeed ? quoteFeed.price
        : m.quote === 'USD' ? 1
        : rates[`USD/${m.quote}`] ? (1 / rates[`USD/${m.quote}`].price) : null

      if (baseInUsd != null && quoteInUsd != null) {
        const crossRate = baseInUsd / quoteInUsd
        const deviation = Math.abs((directRate - crossRate) / crossRate) * 100
        if (deviation > bestArbSpread && deviation > 0.1) {
          bestArbSpread = deviation
          bestArbPair = { ...m, crossRate, deviation }
        }
      }
    }

    if (bestArbPair) {
      suggestions.push({
        id: `arb-cross-${bestArbPair.pair}`,
        type: 'arbitrage',
        action: 'Swap',
        title: `${bestArbPair.pair} Rate Deviation`,
        reason: `Oracle price deviates ${bestArbPair.deviation.toFixed(2)}% from cross rate (${bestArbPair.rate.toFixed(4)} vs ${bestArbPair.crossRate.toFixed(4)}). Potential arbitrage via on-chain swap.`,
        asset: bestArbPair.pair,
        confidence: bestArbPair.deviation > 0.5 ? 'high' : 'medium',
      })
    }
  }

  // ── 2. Extreme rate — pair far from round number (mean reversion) ──
  // Currencies near psychological levels (e.g. USD/JPY near 150) tend to revert.
  const ROUND_LEVELS = {
    'USD/JPY': [140, 145, 150, 155, 160],
    'EUR/USD': [1.00, 1.05, 1.10, 1.15, 1.20],
    'GBP/USD': [1.20, 1.25, 1.30, 1.35],
    'USD/CHF': [0.85, 0.90, 0.95, 1.00],
  }
  let bestProximity = null
  for (const m of tradeable) {
    const levels = ROUND_LEVELS[m.pair]
    if (!levels || !m.rate) continue
    for (const level of levels) {
      const dist = Math.abs(m.rate - level)
      const pctDist = (dist / level) * 100
      if (pctDist < 0.5) { // within 0.5% of a key level
        if (!bestProximity || pctDist < bestProximity.pctDist) {
          bestProximity = { pair: m.pair, rate: m.rate, level, pctDist }
        }
      }
    }
  }
  if (bestProximity) {
    const direction = bestProximity.rate > bestProximity.level ? 'above' : 'below'
    suggestions.push({
      id: `level-${bestProximity.pair}`,
      type: 'momentum',
      action: 'Swap',
      title: `${bestProximity.pair} Near ${bestProximity.level}`,
      reason: `Trading at ${bestProximity.rate.toFixed(4)}, just ${direction} the key ${bestProximity.level} level. Expect increased volatility — profit from the breakout or reversion.`,
      asset: bestProximity.pair,
      confidence: bestProximity.pctDist < 0.2 ? 'high' : 'medium',
    })
  }

  // ── 3. High-yield EM carry trade opportunity ──────────────────────
  // EM currencies with high implied carry (TRY, BRL, MXN, ZAR) offer
  // yield differential vs USD stablecoins.
  const EM_CARRY = { TRY: 45, BRL: 12.25, MXN: 10.5, ZAR: 8.0, IDR: 6.25, NGN: 18.0 }
  const USD_YIELD = 4.5 // approx stablecoin lending rate
  let bestCarry = null

  const emTradeable = tradeable.filter(m =>
    EM_CARRY[m.base] || EM_CARRY[m.quote]
  )
  for (const m of emTradeable) {
    const emCurrency = EM_CARRY[m.base] ? m.base : m.quote
    const carry = EM_CARRY[emCurrency] - USD_YIELD
    if (!bestCarry || carry > bestCarry.carry) {
      bestCarry = { pair: m.pair, emCurrency, carry, rate: m.rate }
    }
  }
  if (bestCarry && bestCarry.carry > 3) {
    suggestions.push({
      id: `carry-${bestCarry.pair}`,
      type: 'value',
      action: 'Swap',
      title: `${bestCarry.emCurrency} Carry Trade`,
      reason: `${bestCarry.emCurrency} offers ~${bestCarry.carry.toFixed(1)}% implied carry over USD. Swap into ${bestCarry.pair} to capture the rate differential — but watch for depreciation risk.`,
      asset: bestCarry.pair,
      confidence: bestCarry.carry > 10 ? 'high' : 'medium',
    })
  }

  // ── 4. Best liquid pair for low-risk execution ────────────────────
  // Only if we have fewer than 3 suggestions so far — keep the list useful.
  if (suggestions.length < 3) {
    const byVolume = [...tradeable].sort((a, b) => (b.volume || 0) - (a.volume || 0))
    if (byVolume.length > 0 && byVolume[0].volume > 0 && byVolume[0].rate) {
      const top = byVolume[0]
      suggestions.push({
        id: `liquid-${top.pair}`,
        type: 'momentum',
        action: 'Swap',
        title: `${top.pair} — Lowest Slippage`,
        reason: `Highest volume pair on-chain. Best execution with minimal slippage — ideal for larger trades.`,
        asset: top.pair,
        confidence: 'high',
      })
    }
  }

  return suggestions
}

// ─── Portfolio Suggestions ──────────────────────────────────────────

export function generatePortfolioSuggestions(holdings, totalValue) {
  if (!holdings || holdings.length === 0 || !totalValue) return []
  const suggestions = []

  // Concentration risk — sell the specific overweight asset
  for (const h of holdings) {
    const pct = (h.value / totalValue) * 100
    if (pct > 25) {
      suggestions.push({
        id: `conc-${h.symbol}`,
        type: 'risk',
        action: 'Sell',
        title: `Trim ${h.symbol} Position`,
        reason: `${h.symbol} is ${pct.toFixed(0)}% of your portfolio. Consider selling some to reduce single-asset risk.`,
        asset: h.symbol,
        confidence: pct > 50 ? 'high' : 'medium',
      })
    }
  }

  // Buy more of a well-performing smaller holding
  if (holdings.length >= 3) {
    const mid = holdings[Math.floor(holdings.length / 2)]
    const pct = (mid.value / totalValue) * 100
    if (pct < 15) {
      suggestions.push({
        id: `grow-${mid.symbol}`,
        type: 'value',
        action: 'Buy',
        title: `Add More ${mid.symbol}`,
        reason: `${mid.symbol} is only ${pct.toFixed(0)}% of your portfolio at $${mid.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Consider increasing this position.`,
        asset: mid.symbol,
        confidence: 'medium',
      })
    }
  }

  // Top holding — buy more if not concentrated
  if (holdings.length >= 2) {
    const top = holdings[0]
    const pct = (top.value / totalValue) * 100
    if (pct <= 25) {
      suggestions.push({
        id: `top-${top.symbol}`,
        type: 'momentum',
        action: 'Buy',
        title: `${top.symbol} — Your Strongest`,
        reason: `Your largest position at $${top.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${pct.toFixed(0)}%). Double down on your winner.`,
        asset: top.symbol,
        confidence: 'medium',
      })
    }
  }

  // Smallest holding — swap dust into something bigger
  const nonDust = holdings.filter(h => h.value > 0)
  if (nonDust.length >= 2) {
    const smallest = nonDust[nonDust.length - 1]
    if (smallest.value < 50) {
      suggestions.push({
        id: `swap-dust-${smallest.symbol}`,
        type: 'rebalance',
        action: 'Sell',
        title: `Consolidate ${smallest.symbol}`,
        reason: `${smallest.symbol} is your smallest position at $${smallest.value.toFixed(2)}. Sell and consolidate into a larger holding.`,
        asset: smallest.symbol,
        confidence: 'low',
      })
    }
  }

  return suggestions
}

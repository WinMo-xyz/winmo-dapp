import { useState, useEffect, useMemo } from 'react'
import DappNavbar from '../components/DappNavbar'
import AssetLogo from '../components/AssetLogo'
import { useWallet } from '../context/WalletContext'
import { getAIInsights, getPortfolio } from '../services/portfolio'
import { getStaticPriceMap } from '../services/assets'
import { usePortfolio } from '../hooks/usePortfolio'
import { useSolanaPortfolio } from '../hooks/useSolanaPortfolio'
import { useLivePrices } from '../hooks/useLivePrices'
import { fetchCryptoPrices } from '../services/cmcApi'
import './Portfolio.css'

export default function Portfolio() {
  const { displayName, isEvmConnected, isSolanaConnected, evmAddress, solanaAddress, ensName } = useWallet()
  const { version } = useLivePrices()
  const [livePrices, setLivePrices] = useState(null)
  const insights = getAIInsights()

  // Static prices for stocks, bonds, commodities (fallback)
  const staticPrices = useMemo(() => getStaticPriceMap(), [])

  useEffect(() => {
    fetchCryptoPrices().then(setLivePrices)
  }, [version])

  // Merge: live CoinGecko prices override static asset prices
  const priceMap = useMemo(() => ({
    ...staticPrices,
    ...(livePrices || {}),
  }), [staticPrices, livePrices])

  const { holdings: evmHoldings, totalValue: evmTotal, isLoading: evmLoading } = usePortfolio(priceMap)
  const { holdings: solHoldings, totalValue: solTotal, isLoading: solLoading } = useSolanaPortfolio(priceMap)

  // Use actual address presence — more reliable than connection flags
  const hasEvm = isEvmConnected && !!evmAddress
  const hasSol = isSolanaConnected && !!solanaAddress

  // Only include holdings from wallets that actually have an address
  const realHoldings = useMemo(() => {
    const result = []
    if (hasSol) result.push(...solHoldings)
    if (hasEvm) result.push(...evmHoldings)
    return result.sort((a, b) => b.value - a.value)
  }, [evmHoldings, solHoldings, hasEvm, hasSol])

  const realTotal = (hasEvm ? evmTotal : 0) + (hasSol ? solTotal : 0)

  // Only loading if a wallet with an address is still fetching
  const isLoading = (hasEvm && evmLoading) || (hasSol && solLoading)

  // Fall back to demo holdings only when no wallet address is present
  const isDemo = !isLoading && realHoldings.length === 0 && !hasEvm && !hasSol
  const demoPortfolio = useMemo(() => isDemo ? getPortfolio() : null, [isDemo])
  const holdings = isDemo ? demoPortfolio.holdings : realHoldings
  const totalValue = isDemo ? demoPortfolio.totalValue : realTotal

  const chainName = hasEvm && hasSol
    ? 'Solana + Ethereum'
    : hasSol
      ? 'Solana'
      : hasEvm
        ? 'Ethereum'
        : ''

  // Build greeting name from wallets that actually have an address
  const greetingName = (() => {
    if (hasEvm && hasSol) {
      const solLabel = `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
      const evmLabel = ensName || `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
      return `${solLabel} + ${evmLabel}`
    }
    if (hasSol) {
      return `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
    }
    if (hasEvm) {
      return ensName || `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
    }
    return ''
  })()

  return (
    <>
      <DappNavbar />
      <main className="portfolio-page">
        <div className="container">
          {/* Greeting Card */}
          <div className="portfolio-greeting glass-card gradient-border">
            <div className="portfolio-greeting-content">
              <h1 className="portfolio-gm">
                GM <span className="gradient-text">{greetingName}</span>
              </h1>
              <p className="portfolio-total">
                <span className="portfolio-total-value">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </p>
              <p className="portfolio-meta">
                {isDemo ? <span className="demo-badge">Demo Portfolio</span> : `on ${chainName}`}
              </p>
            </div>
          </div>

          <div className="gradient-line" />

          {/* AI Insights - Blurred with Coming Soon */}
          <section className="portfolio-insights">
            <h2 className="portfolio-section-title">AI Insights</h2>
            <div className="portfolio-insights-wrapper">
              <div className="portfolio-insights-blur">
                <div className="portfolio-insights-grid">
                  {/* Allocation Cards */}
                  <div className="insight-card glass-card">
                    <h4 className="insight-card-title">Portfolio Allocation</h4>
                    <div className="insight-donut-placeholder">
                      <div className="donut-ring">
                        <svg viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--light-10)" strokeWidth="12" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="12"
                            strokeDasharray="314" strokeDashoffset="172" strokeLinecap="round" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-cool)" strokeWidth="12"
                            strokeDasharray="314" strokeDashoffset="234" strokeLinecap="round"
                            transform="rotate(163 60 60)" />
                        </svg>
                      </div>
                      <div className="donut-labels">
                        <span><span className="dot" style={{ background: 'var(--accent)' }} /> Stocks {insights.allocation.stocks}%</span>
                        <span><span className="dot" style={{ background: 'var(--purple)' }} /> Crypto {insights.allocation.crypto}%</span>
                        <span><span className="dot" style={{ background: 'var(--accent-cool)' }} /> Bonds {insights.allocation.bonds}%</span>
                        <span><span className="dot" style={{ background: '#d4a853' }} /> Commodities {insights.allocation.commodities}%</span>
                        <span><span className="dot" style={{ background: 'var(--color-light-secondary)' }} /> Cash {insights.allocation.cash}%</span>
                        <span><span className="dot" style={{ background: 'var(--success)' }} /> Yield {insights.allocation.yield}%</span>
                        <span><span className="dot" style={{ background: '#e87848' }} /> Forex {insights.allocation.forex}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="insight-card glass-card">
                    <h4 className="insight-card-title">Action Required</h4>
                    <p className="insight-action-text">3 rebalancing opportunities</p>
                    <div className="insight-recommendations">
                      {insights.recommendations.map((rec, i) => (
                        <div key={i} className="insight-rec">
                          <span className={`insight-rec-action ${rec.action.toLowerCase()}`}>{rec.action}</span>
                          <span className="insight-rec-asset">{rec.asset}</span>
                          <span className="insight-rec-reason">{rec.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="portfolio-coming-soon">
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          </section>

          <div className="gradient-line" />

          {/* Holdings Table */}
          <section className="portfolio-holdings">
            <h2 className="portfolio-section-title">Holdings</h2>

            {isLoading && (
              <div className="portfolio-loading glass-card">
                <p>Fetching your balances...</p>
              </div>
            )}

            {!isLoading && holdings.length === 0 && !isDemo && (
              <div className="portfolio-empty glass-card">
                <p>No tokens found{chainName ? ` on ${chainName}` : ''}.</p>
                <p>Switch networks or add tokens to your wallet.</p>
              </div>
            )}

            {!isLoading && holdings.length > 0 && (
              <div className="holdings-table-wrap glass-card">
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Balance</th>
                      <th>Price</th>
                      <th>Value</th>
                      <th>Chain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.filter(h => parseFloat(h.balance) > 0).map((h, i) => (
                      <tr key={i}>
                        <td className="holding-asset">
                          <AssetLogo logo={h.logo} name={h.asset} size={32} />
                          <span>
                            <span className="holding-name">{h.asset}</span>
                            <span className="holding-symbol">{h.symbol}</span>
                          </span>
                        </td>
                        <td>{h.balance}</td>
                        <td>${h.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="holding-value">${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td><span className="holding-chain">{h.chain}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}

import React, { useState, useMemo, useCallback } from 'react'
import DappNavbar from '../components/DappNavbar'
import AssetLogo from '../components/AssetLogo'
import BuyModal from '../components/BuyModal'
import AISuggestions from '../components/AISuggestions'
import { generateYieldSuggestions } from '../services/aiSuggestions'
import { useLiveYield } from '../hooks/useLiveYield'
import { useRatings } from '../hooks/useRatings'
import { useLivePrices } from '../hooks/useLivePrices'
import { SYMBOL_TO_GECKO_ID } from '../services/cmcApi'
import './Yield.css'

const RISK_LEVELS = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'low', label: 'Low Risk' },
  { key: 'high-yield', label: 'High Yield' },
  { key: 'speculative', label: 'Speculative' },
]

function DetailPanel({ selected, apyLoading, onDeposit, onWithdraw, className }) {
  return (
    <div className={`yield-detail glass-card gradient-border ${className || ''}`}>
      <div className="yield-detail-header">
        <AssetLogo logo={selected.logo} name={selected.protocol} size={40} />
        <div>
          <h2 className="yield-detail-name">{selected.name}</h2>
          <div className="yield-detail-badges">
            <span className="yield-badge">{selected.network}</span>
            <span className="yield-badge">{selected.protocol}</span>
            <span className={`yield-badge risk-${selected.riskLevel}`}>
              {selected.riskLevel === 'high-yield' ? 'HIGH YIELD' : selected.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <p className="yield-detail-strategy">{selected.strategy}</p>

      <div className="yield-detail-stats">
        <div className="yield-stat">
          <span className="yield-stat-label">Current APY {selected.llamaPoolId && <span className="yield-live-dot" />}</span>
          <span className={`yield-stat-value gradient-text ${apyLoading && selected.llamaPoolId ? 'apy-loading' : ''}`}>{selected.apy}%</span>
        </div>
        <div className="yield-stat">
          <span className="yield-stat-label">Total Deposits {selected.llamaPoolId && <span className="yield-live-dot" />}</span>
          <span className={`yield-stat-value ${apyLoading && selected.llamaPoolId ? 'apy-loading' : ''}`}>{selected.totalDeposits}</span>
        </div>
      </div>

      <div className="yield-detail-action">
        <div className="yield-asset-select">
          <label className="yield-select-label">Asset</label>
          <div className="yield-select-display">
            <AssetLogo logo={selected.logo} name={selected.protocol} size={20} />
            <span>{selected.asset}</span>
          </div>
        </div>
        <div className="yield-action-buttons">
          <button className="btn btn-accent yield-deposit-btn" onClick={onDeposit}>
            Deposit
          </button>
          <button className="btn btn-outline yield-withdraw-btn" onClick={onWithdraw}>
            Withdraw
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Yield() {
  const [selectedId, setSelectedId] = useState('jitosol')
  const [riskFilter, setRiskFilter] = useState('all')
  const [modalId, setModalId] = useState(null)
  const [modalMode, setModalMode] = useState('buy')

  const { version } = useLivePrices()
  const { protocols: allProtocols, isLoading: apyLoading } = useLiveYield()
  const selected = allProtocols.find(p => p.id === selectedId) || allProtocols[0]
  const modalProtocol = modalId ? allProtocols.find(p => p.id === modalId) : null

  const filteredProtocols = useMemo(() => {
    if (riskFilter === 'all') return allProtocols
    return allProtocols.filter(p => p.riskLevel === riskFilter)
  }, [allProtocols, riskFilter])

  const colCount = 5

  const modalAsset = useMemo(() => {
    if (!modalProtocol) return null
    return {
      name: modalProtocol.name,
      symbol: modalProtocol.tokenSymbol,
      price: 0,
      logo: modalProtocol.logo,
      ethereumAddress: modalProtocol.ethereumAddress || undefined,
    }
  }, [modalProtocol])

  const yieldRatingSymbols = useMemo(
    () => [...new Set(filteredProtocols.map(p => p.asset).filter(s => s && SYMBOL_TO_GECKO_ID[s]))],
    [filteredProtocols]
  )
  const { ratings, isLoading: ratingsLoading, hasError: ratingsError } = useRatings(yieldRatingSymbols, version)

  const yieldSuggestions = useMemo(() => generateYieldSuggestions(filteredProtocols, ratings), [filteredProtocols, ratings])

  const openDeposit = (id) => { setModalId(id); setModalMode('buy') }
  const openWithdraw = (id) => { setModalId(id); setModalMode('sell') }

  const handleSuggestionAction = useCallback((s) => {
    // Find matching protocol by name
    const match = allProtocols.find(p => p.name === s.asset)
    if (match) {
      setSelectedId(match.id)
      if (s.action === 'Deposit') {
        openDeposit(match.id)
      } else if (s.action === 'Sell') {
        openWithdraw(match.id)
      }
      // For Watch/Hold, just select the protocol row
    }
  }, [allProtocols])

  const riskColor = (level) => {
    switch (level) {
      case 'safe': return 'var(--success)'
      case 'low': return '#5b9cf5'
      case 'high-yield': return '#f0a030'
      case 'speculative': return 'var(--red)'
      default: return 'var(--color-light-secondary)'
    }
  }

  return (
    <>
      <DappNavbar />
      <main className="yield-page">
        <div className="container">
          <h1 className="yield-title"><span className="gradient-text">Yield</span> Farming</h1>
          <p className="yield-subtitle">Put idle assets to work. Pick a pool, deposit, earn.</p>

          {/* Risk filter tabs */}
          <div className="yield-tabs">
            {RISK_LEVELS.map((r) => (
              <button
                key={r.key}
                className={`yield-tab ${riskFilter === r.key ? 'active' : ''}`}
                onClick={() => setRiskFilter(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <AISuggestions suggestions={yieldSuggestions} onAction={handleSuggestionAction} ratingsLoading={ratingsLoading} ratingsError={ratingsError} />

          <div className="yield-layout">
            {/* Protocol table */}
            <div className="yield-table-wrap glass-card">
              <table className="yield-table">
                <thead>
                  <tr>
                    <th>Protocol</th>
                    <th>Asset</th>
                    <th>Network</th>
                    <th>APY</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProtocols.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr
                        className={selectedId === p.id ? 'active' : ''}
                        onClick={() => setSelectedId(p.id)}
                      >
                        <td className="yield-protocol-cell">
                          <AssetLogo logo={p.logo} name={p.protocol} size={28} />
                          <span className="yield-protocol-name">{p.name}</span>
                        </td>
                        <td className="yield-asset-col">{p.asset}</td>
                        <td><span className="yield-network-badge">{p.network}</span></td>
                        <td className={`yield-apy-col ${apyLoading && p.llamaPoolId ? 'apy-loading' : ''}`}>{p.apy}%</td>
                        <td>
                          <span className="yield-risk-pill" style={{ color: riskColor(p.riskLevel), borderColor: riskColor(p.riskLevel) }}>
                            {p.riskLevel === 'high-yield' ? 'HIGH' : p.riskLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                      {/* Inline detail — visible only on mobile when this row is selected */}
                      {selectedId === p.id && (
                        <tr className="yield-inline-detail-row">
                          <td colSpan={colCount}>
                            <DetailPanel
                              selected={selected}
                              apyLoading={apyLoading}
                              onDeposit={() => openDeposit(selected.id)}
                              onWithdraw={() => openWithdraw(selected.id)}
                              className="yield-detail-inline"
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Side detail panel — visible only on desktop */}
            <DetailPanel
              selected={selected}
              apyLoading={apyLoading}
              onDeposit={() => openDeposit(selected.id)}
              onWithdraw={() => openWithdraw(selected.id)}
              className="yield-detail-side"
            />
          </div>
        </div>
      </main>

      {modalAsset && (
        <BuyModal asset={modalAsset} mode={modalMode} onClose={() => setModalId(null)} />
      )}
    </>
  )
}

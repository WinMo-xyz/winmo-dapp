import { useState, useMemo } from 'react'
import DappNavbar from '../components/DappNavbar'
import AssetLogo from '../components/AssetLogo'
import BuyModal from '../components/BuyModal'
import { useLiveYield } from '../hooks/useLiveYield'
import './Yield.css'

const RISK_LEVELS = [
  { key: 'safe', label: 'SAFE', color: 'var(--success)' },
  { key: 'low', label: 'LOW RISK', color: '#5b9cf5' },
  { key: 'high-yield', label: 'HIGH YIELD', color: '#f0a030' },
  { key: 'speculative', label: 'SPECULATIVE', color: 'var(--red)' },
]

export default function Yield() {
  const [selectedId, setSelectedId] = useState('jitosol')
  const [modalId, setModalId] = useState(null)
  const [modalMode, setModalMode] = useState('buy') // 'buy' = deposit, 'sell' = withdraw

  const { protocols: allProtocols, isLoading: apyLoading } = useLiveYield()
  const selected = allProtocols.find(p => p.id === selectedId) || allProtocols[0]
  const modalProtocol = modalId ? allProtocols.find(p => p.id === modalId) : null

  // Build a synthetic asset object compatible with BuyModal
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

  const openDeposit = (id) => { setModalId(id); setModalMode('buy') }
  const openWithdraw = (id) => { setModalId(id); setModalMode('sell') }

  return (
    <>
      <DappNavbar />
      <main className="yield-page">
        <div className="container">
          <h1 className="yield-title"><span className="gradient-text">Yield</span> Farming</h1>
          <p className="yield-subtitle">Put idle assets to work. Pick a pool, deposit, earn.</p>

          <div className="yield-wrapper">
              <div className="yield-layout">
                {/* Left sidebar: risk categories */}
                <div className="yield-sidebar">
                  {RISK_LEVELS.map((risk) => {
                    const protocols = allProtocols.filter(p => p.riskLevel === risk.key)
                    return (
                      <div key={risk.key} className="yield-risk-group">
                        <div className="yield-risk-header">
                          <span className="yield-risk-dot" style={{ background: risk.color }} />
                          <span className="yield-risk-label">{risk.label}</span>
                        </div>
                        <div className="yield-risk-list">
                          {protocols.map((p) => (
                            <button
                              key={p.id}
                              className={`yield-item ${selectedId === p.id ? 'active' : ''}`}
                              onClick={() => setSelectedId(p.id)}
                            >
                              <AssetLogo logo={p.logo} name={p.protocol} size={20} />
                              <span className="yield-item-name">{p.name}</span>
                              <span className={`yield-item-apy ${apyLoading && p.llamaPoolId ? 'apy-loading' : ''}`}>{p.apy}%</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Right panel: selected protocol detail */}
                <div className="yield-detail glass-card">
                  <div className="yield-detail-header">
                    <AssetLogo logo={selected.logo} name={selected.protocol} size={40} />
                    <div>
                      <h2 className="yield-detail-name">{selected.protocol} {selected.network} {selected.asset}</h2>
                      <div className="yield-detail-badges">
                        <span className="yield-badge">{selected.network}</span>
                        <span className="yield-badge">{selected.protocol}</span>
                        <span className={`yield-badge risk-${selected.riskLevel}`}>
                          {selected.riskLevel.toUpperCase()}
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
                      <button
                        className="btn btn-accent yield-deposit-btn"
                        onClick={() => openDeposit(selected.id)}
                      >
                        Deposit
                      </button>
                      <button
                        className="btn btn-outline yield-withdraw-btn"
                        onClick={() => openWithdraw(selected.id)}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </main>

      {modalAsset && (
        <BuyModal asset={modalAsset} mode={modalMode} onClose={() => setModalId(null)} />
      )}
    </>
  )
}

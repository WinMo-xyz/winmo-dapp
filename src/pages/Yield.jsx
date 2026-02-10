import { useState } from 'react'
import DappNavbar from '../components/DappNavbar'
import AssetLogo from '../components/AssetLogo'
import { getYieldProtocols } from '../services/yield'
import './Yield.css'

const RISK_LEVELS = [
  { key: 'safe', label: 'SAFE', color: 'var(--success)' },
  { key: 'medium', label: 'MEDIUM', color: 'var(--accent)' },
  { key: 'high', label: 'HIGH', color: 'var(--red)' },
]

export default function Yield() {
  const [selectedId, setSelectedId] = useState('aave-weth')

  const allProtocols = getYieldProtocols()
  const selected = allProtocols.find(p => p.id === selectedId) || allProtocols[0]

  return (
    <>
      <DappNavbar />
      <main className="yield-page">
        <div className="container">
          <h1 className="yield-title"><span className="gradient-text">Yield</span> Farming</h1>
          <p className="yield-subtitle">Put idle assets to work. Pick a pool, deposit, earn.</p>

          <div className="yield-wrapper">
            <div className="yield-blur">
              <div className="yield-layout">
                {/* Left sidebar: risk categories */}
                <div className="yield-sidebar">
                  {RISK_LEVELS.map((risk) => {
                    const protocols = getYieldProtocols(risk.key)
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
                              <span className="yield-item-apy">{p.apy}%</span>
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
                      <span className="yield-stat-label">Current APY</span>
                      <span className="yield-stat-value gradient-text">{selected.apy}%</span>
                    </div>
                    <div className="yield-stat">
                      <span className="yield-stat-label">Total Deposits</span>
                      <span className="yield-stat-value">{selected.totalDeposits}</span>
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
                    <button className="btn btn-accent yield-deposit-btn">
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="yield-coming-soon">
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

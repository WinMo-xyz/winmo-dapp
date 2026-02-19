import { useState, useCallback } from 'react'
import DappNavbar from '../components/DappNavbar'
import './AIAgent.css'

const SKILL_URL = 'https://winmo.xyz/skill.md'
const PROMPT_TEXT = `Open ${SKILL_URL} and follow the instructions to integrate with WinMo`

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button className={`agent-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V3" stroke="currentColor" strokeWidth="1.5"/></svg>
          {label || 'Copy'}
        </>
      )}
    </button>
  )
}

const HEARTBEAT_ENDPOINTS = [
  { path: '/api/agent/prices', label: 'Live Prices' },
  { path: '/api/agent/assets', label: 'Asset Directory' },
  { path: '/api/agent/quote', label: 'Swap Quotes' },
  { path: '/api/agent/forex', label: 'Forex Rates' },
  { path: '/api/agent/yield', label: 'Yield Protocols' },
  { path: '/api/agent/search', label: 'Search' },
  { path: '/api/agent/tokens', label: 'Token Addresses' },
]

export default function AIAgent() {
  return (
    <>
      <DappNavbar />
      <main className="ai-agent-page">
        <div className="container">
          {/* Hero */}
          <div className="agent-hero">
            <h1 className="agent-hero-title">
              Connect AI Agent to <span className="gradient-text">WinMo</span>
            </h1>
            <p className="agent-hero-subtitle">
              Give your agent access to 100+ tradeable assets across stocks, crypto, commodities, bonds, and forex. No API key. No registration.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="agent-columns">
            {/* Left: Onboard + Heartbeat */}
            <div className="agent-col-left">
              {/* Onboard Your Agent */}
              <section className="agent-onboard glass-card gradient-border animate-in">
                <div className="agent-onboard-header">
                  <div className="agent-onboard-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="agent-onboard-title">Onboard Your Agent</h2>
                    <p className="agent-onboard-desc">Three steps to connect any AI agent to WinMo's full API</p>
                  </div>
                </div>

                {/* Step 1: Prompt */}
                <div className="agent-step">
                  <div className="agent-step-header">
                    <span className="agent-step-num">1</span>
                    <span className="agent-step-label">Prompt</span>
                  </div>
                  <div className="agent-code-block">
                    <code>{PROMPT_TEXT}</code>
                    <CopyButton text={PROMPT_TEXT} />
                  </div>
                  <p className="agent-step-hint">Paste this into any AI agent like ChatGPT, Claude, or custom bots to connect with WinMo.</p>
                </div>

                {/* Step 2: skill.md */}
                <div className="agent-step">
                  <div className="agent-step-header">
                    <span className="agent-step-num">2</span>
                    <span className="agent-step-label">skill.md</span>
                  </div>
                  <div className="agent-code-block">
                    <code>{SKILL_URL}</code>
                    <CopyButton text={SKILL_URL} />
                  </div>
                  <p className="agent-step-hint">Self-contained API reference. Your agent reads this single file to learn every endpoint, parameter, and response format.</p>
                </div>

                {/* Step 3: Heartbeat */}
                <div className="agent-step">
                  <div className="agent-step-header">
                    <span className="agent-step-num">3</span>
                    <span className="agent-step-label">Heartbeat</span>
                  </div>
                  <div className="agent-heartbeat">
                    {HEARTBEAT_ENDPOINTS.map(({ path, label }) => (
                      <div className="heartbeat-row" key={path}>
                        <span className="heartbeat-dot live" />
                        <span className="heartbeat-endpoint">{path}</span>
                        <span className="heartbeat-label">{label}</span>
                        <span className="heartbeat-status ok">Live</span>
                      </div>
                    ))}
                  </div>
                  <p className="agent-step-hint">All endpoints operational. No API key required. No rate limits on WinMo endpoints.</p>
                </div>
              </section>
            </div>

            {/* Right: Launch AiFi Agent + Custom Agents */}
            <div className="agent-col-right">
              {/* Launch Winmo AiFi Agent */}
              <div className="agent-launch glass-card animate-in animate-in-delay-1">
                <div className="agent-launch-glow" />
                <div className="agent-launch-content">
                  <div className="agent-launch-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="agent-launch-title">Launch Winmo AiFi Agent</h3>
                  <p className="agent-launch-desc">Autonomous portfolio management powered by AI. Rebalances, yield farming, and cross-chain execution on autopilot.</p>

                  <div className="agent-launch-features">
                    <div className="agent-launch-feature">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Auto-rebalance across 5 asset classes
                    </div>
                    <div className="agent-launch-feature">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Cross-chain execution (Ethereum + Solana)
                    </div>
                    <div className="agent-launch-feature">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Yield optimization across 11 protocols
                    </div>
                    <div className="agent-launch-feature">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Non-custodial. Your wallet, your keys
                    </div>
                  </div>

                  <button className="agent-launch-btn" disabled>
                    Launch Agent
                    <span className="agent-launch-soon">Coming Soon</span>
                  </button>
                </div>
              </div>

              {/* Custom Financial Agents — Blurred */}
              <div className="agent-custom-wrapper animate-in animate-in-delay-2">
                <div className="agent-custom-blur">
                  <div className="agent-custom-card glass-card">
                    <h4 className="agent-custom-title">Custom Financial Agents</h4>
                    <p className="agent-custom-desc">Deploy personalized agents tailored to your strategy.</p>
                    <div className="agent-custom-grid">
                      <div className="agent-template">
                        <div className="agent-template-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 20v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                        <span className="agent-template-name">Yield Maximizer</span>
                        <small>Auto-rotate across 11 protocols for optimal APY</small>
                      </div>
                      <div className="agent-template">
                        <div className="agent-template-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                        <span className="agent-template-name">DCA Bot</span>
                        <small>Dollar-cost average into any asset on schedule</small>
                      </div>
                      <div className="agent-template">
                        <div className="agent-template-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 20h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 20V8l5-4 5 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M19 20V12l-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </div>
                        <span className="agent-template-name">Portfolio Rebalancer</span>
                        <small>Maintain target allocations across chains</small>
                      </div>
                      <div className="agent-template">
                        <div className="agent-template-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span className="agent-template-name">Arbitrage Scanner</span>
                        <small>Detect cross-chain price discrepancies</small>
                      </div>
                    </div>
                    <button className="agent-custom-deploy-btn" disabled>Deploy Custom Agent</button>
                  </div>
                </div>
                <div className="agent-custom-overlay">
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

import { useState } from 'react'
import DappNavbar from '../components/DappNavbar'
import './Money.css'

const FIAT_CURRENCIES = ['usd', 'eur', 'gbp', 'sgd', 'brl', 'mxn']
const CRYPTO_CURRENCIES = ['usdc', 'usdt']
const CHAINS = ['solana', 'ethereum', 'base', 'polygon']

export default function Money() {
  const [view, setView] = useState('home')
  const goHome = () => setView('home')

  return (
    <>
      <DappNavbar />
      <main className="money-page">
        <div className="money-container">
          {view === 'home' && <MoneyHome onAction={setView} />}
          {view === 'kyc' && <KycView onBack={goHome} />}
          {view === 'onramp' && <OnRampView onBack={goHome} />}
          {view === 'offramp' && <OffRampView onBack={goHome} />}
          {view === 'card' && <CardView onBack={goHome} />}
        </div>
      </main>
    </>
  )
}

// ── Shared ────────────────────────────────────────────────────────────

function BackButton({ onClick, label = 'Back' }) {
  return (
    <button className="m-back" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  )
}

function ComingSoonWrap({ children }) {
  return (
    <div className="m-cs-wrap">
      <div className="m-cs-blur">{children}</div>
      <div className="m-cs-overlay">
        <span className="m-cs-label">Coming Soon</span>
      </div>
    </div>
  )
}

// ── Home Hub ─────────────────────────────────────────────────────────

function MoneyHome({ onAction }) {
  return (
    <div className="m-home">
      <div className="m-home-hero">
        <div className="m-hero-glow" />
        <span className="m-home-label">WinMo Money</span>
        <h1 className="m-home-title">$0.00</h1>
        <span className="m-coming-soon-badge">Coming Soon</span>
      </div>

      <div className="m-actions">
        <button className="m-action-tile" onClick={() => onAction('onramp')}>
          <span className="m-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="m-action-label">Add Money</span>
        </button>

        <button className="m-action-tile" onClick={() => onAction('offramp')}>
          <span className="m-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12L12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="m-action-label">Cash Out</span>
        </button>

        <button className="m-action-tile" onClick={() => onAction('card')}>
          <span className="m-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          <span className="m-action-label">Card</span>
        </button>
      </div>

      <button className="m-verify-banner" onClick={() => onAction('kyc')}>
        <div className="m-verify-banner-left">
          <div className="m-verify-banner-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="m-verify-banner-title">Verify your identity</span>
          </div>
          <span className="m-verify-banner-desc">Unlock deposits, withdrawals, and card</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="m-home-card-preview">
        <div className="m-minicard">
          <div className="m-minicard-shimmer" />
          <div className="m-minicard-top">
            <span className="m-minicard-brand">WinMo</span>
            <span className="m-minicard-visa">VISA</span>
          </div>
          <div className="m-minicard-middle">
            <svg className="m-minicard-chip" width="30" height="22" viewBox="0 0 30 22" fill="none">
              <rect x="1" y="1" width="28" height="20" rx="3.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <line x1="1" y1="8" x2="29" y2="8" stroke="rgba(255,255,255,0.15)"/>
              <line x1="1" y1="14" x2="29" y2="14" stroke="rgba(255,255,255,0.15)"/>
              <line x1="10" y1="1" x2="10" y2="21" stroke="rgba(255,255,255,0.1)"/>
              <line x1="20" y1="1" x2="20" y2="21" stroke="rgba(255,255,255,0.1)"/>
            </svg>
            <span className="m-minicard-num">**** ****</span>
          </div>
        </div>
      </div>

      <div className="m-home-activity">
        <span className="m-section-label">Activity</span>
        <div className="m-empty-activity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="m-empty-icon">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="m-empty-text">No recent activity</span>
        </div>
      </div>
    </div>
  )
}

// ── KYC View ─────────────────────────────────────────────────────────

function KycView({ onBack }) {
  return (
    <div className="m-view">
      <BackButton onClick={onBack} />
      <div className="m-centered">
        <h2 className="m-view-title">Verify your identity</h2>
        <p className="m-view-desc">One-time verification to unlock all Money features.</p>

        <ComingSoonWrap>
          <div className="m-form">
            <div className="m-field">
              <label className="m-field-label">Full legal name</label>
              <input type="text" className="m-input" placeholder="John Doe" disabled />
            </div>
            <div className="m-field">
              <label className="m-field-label">Email</label>
              <input type="email" className="m-input" placeholder="john@example.com" disabled />
            </div>
            <button type="button" className="m-btn m-btn-primary" disabled>Continue</button>
          </div>
        </ComingSoonWrap>

        <div className="m-kyc-steps">
          <div className="m-kyc-step">
            <span className="m-kyc-step-dot active" />
            <span>Enter your details</span>
          </div>
          <div className="m-kyc-step">
            <span className="m-kyc-step-dot" />
            <span>Verify identity</span>
          </div>
          <div className="m-kyc-step">
            <span className="m-kyc-step-dot" />
            <span>Access unlocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── On-Ramp View ─────────────────────────────────────────────────────

function OnRampView({ onBack }) {
  const PRESETS = ['100', '250', '500', '1000']

  return (
    <div className="m-view">
      <BackButton onClick={onBack} />
      <div className="m-centered">
        <span className="m-view-label">Add Money</span>

        <ComingSoonWrap>
          <div className="m-amount-hero">
            <span className="m-amount-currency">$</span>
            <input type="text" className="m-amount-input" placeholder="0" disabled />
          </div>

          <div className="m-presets">
            {PRESETS.map(p => (
              <button key={p} className="m-preset" disabled>${p}</button>
            ))}
          </div>

          <div className="m-options-row">
            <div className="m-option">
              <span className="m-option-label">From</span>
              <select className="m-option-select" defaultValue="usd" disabled>
                {FIAT_CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="m-option-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="m-option">
              <span className="m-option-label">To</span>
              <select className="m-option-select" defaultValue="usdc" disabled>
                {CRYPTO_CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="m-option" style={{ marginBottom: 24 }}>
            <span className="m-option-label">Chain</span>
            <select className="m-option-select" defaultValue="solana" disabled>
              {CHAINS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <button type="button" className="m-btn m-btn-primary" disabled>Continue</button>
        </ComingSoonWrap>
      </div>
    </div>
  )
}

// ── Off-Ramp View ────────────────────────────────────────────────────

function OffRampView({ onBack }) {
  return (
    <div className="m-view">
      <BackButton onClick={onBack} />
      <div className="m-centered">
        <h2 className="m-view-title">Cash Out</h2>
        <p className="m-view-desc">Link your bank account to withdraw crypto as fiat.</p>

        <ComingSoonWrap>
          <div className="m-form">
            <div className="m-field">
              <label className="m-field-label">Account holder</label>
              <input type="text" className="m-input" placeholder="John Doe" disabled />
            </div>
            <div className="m-field-row">
              <div className="m-field m-field-half">
                <label className="m-field-label">Account #</label>
                <input type="text" className="m-input" placeholder="123456789" disabled />
              </div>
              <div className="m-field m-field-half">
                <label className="m-field-label">Routing #</label>
                <input type="text" className="m-input" placeholder="021000021" disabled />
              </div>
            </div>
            <div className="m-field-row">
              <div className="m-field m-field-half">
                <label className="m-field-label">Type</label>
                <select className="m-select" defaultValue="checking" disabled>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="m-field m-field-half">
                <label className="m-field-label">Chain</label>
                <select className="m-select" defaultValue="solana" disabled>
                  {CHAINS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="m-field">
              <label className="m-field-label">Currency</label>
              <select className="m-select" defaultValue="usdc" disabled>
                {CRYPTO_CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <button type="button" className="m-btn m-btn-primary" disabled>Continue</button>
          </div>
        </ComingSoonWrap>
      </div>
    </div>
  )
}

// ── Card View ────────────────────────────────────────────────────────

function CardView({ onBack }) {
  return (
    <div className="m-view">
      <BackButton onClick={onBack} />
      <div className="m-centered">
        <div className="m-card-hero">
          <div className="m-card-visual m-card-ghost">
            <div className="m-card-shimmer" />
            <div className="m-card-top">
              <span className="m-card-brand">WinMo</span>
              <span className="m-card-visa">VISA</span>
            </div>
            <div className="m-card-number">**** **** **** ****</div>
            <div className="m-card-bottom">
              <span>YOUR NAME</span>
              <span>--/--</span>
            </div>
          </div>
        </div>

        <h2 className="m-view-title">Winmo Card</h2>
        <p className="m-view-desc">
          A virtual and physical Visa powered by USDC. Spend anywhere Visa is accepted.
        </p>

        <div className="m-card-features">
          <div className="m-card-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C17 10.76 14.76 13 12 13S7 10.76 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 5C19 8.87 15.87 12 12 12S5 8.87 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <path d="M21 2C21 7 16.97 11 12 11S3 7 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>
            </svg>
            <span>Contactless</span>
          </div>
          <div className="m-card-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 12H22M12 2C14.5 4.5 16 8 16 12S14.5 19.5 12 22M12 2C9.5 4.5 8 8 8 12S9.5 19.5 12 22" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Works globally</span>
          </div>
          <div className="m-card-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>Instant funding</span>
          </div>
        </div>

        <ComingSoonWrap>
          <button type="button" className="m-btn m-btn-primary" disabled>Get Card</button>
        </ComingSoonWrap>
      </div>
    </div>
  )
}

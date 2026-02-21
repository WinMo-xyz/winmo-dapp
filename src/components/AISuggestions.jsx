import { useState, memo } from 'react'
import './AISuggestions.css'

const ACTION_COLORS = {
  Buy: 'ai-action-buy',
  Sell: 'ai-action-sell',
  Hold: 'ai-action-hold',
  Deposit: 'ai-action-deposit',
  Swap: 'ai-action-swap',
  Watch: 'ai-action-watch',
}

const ACTION_BTN_LABELS = {
  Buy: 'Buy Now',
  Sell: 'Sell Now',
  Hold: 'View Asset',
  Deposit: 'Deposit',
  Swap: 'Swap Now',
  Watch: 'View Details',
}

const CONFIDENCE_LABELS = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}

export default memo(function AISuggestions({ suggestions = [], title = 'AI Suggestions', onAction }) {
  const [isOpen, setIsOpen] = useState(true)
  const [dismissed, setDismissed] = useState(new Set())

  const visible = suggestions.filter(s => !dismissed.has(s.id))

  if (suggestions.length === 0) return null

  const handleDismiss = (e, id) => {
    e.stopPropagation()
    setDismissed(prev => new Set(prev).add(id))
  }

  const handleAction = (e, suggestion) => {
    e.stopPropagation()
    if (onAction) onAction(suggestion)
  }

  return (
    <section className="ai-suggestions">
      <button
        className="ai-suggestions-header"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <div className="ai-suggestions-header-left">
          <span className="ai-suggestions-icon">&#9670;</span>
          <h3 className="ai-suggestions-title">{title}</h3>
          <span className="ai-suggestions-count">{visible.length}</span>
        </div>
        <span className={`ai-suggestions-chevron ${isOpen ? 'open' : ''}`}>&#9662;</span>
      </button>

      {isOpen && visible.length > 0 && (
        <div className="ai-suggestions-grid">
          {visible.map(s => (
            <div key={s.id} className="ai-card glass-card">
              <div className="ai-card-top">
                <span className={`ai-card-action ${ACTION_COLORS[s.action] || ''}`}>
                  {s.action}
                </span>
                <span className={`ai-card-confidence conf-${s.confidence}`}>
                  {CONFIDENCE_LABELS[s.confidence] || s.confidence}
                </span>
                <button
                  className="ai-card-dismiss"
                  onClick={(e) => handleDismiss(e, s.id)}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
              <h4 className="ai-card-title">{s.title}</h4>
              <p className="ai-card-reason">{s.reason}</p>
              <div className="ai-card-bottom">
                <span className="ai-card-asset">{s.asset}</span>
                {onAction && (
                  <button
                    className={`ai-card-execute ${ACTION_COLORS[s.action] || ''}`}
                    onClick={(e) => handleAction(e, s)}
                  >
                    {ACTION_BTN_LABELS[s.action] || s.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && visible.length === 0 && suggestions.length > 0 && (
        <p className="ai-suggestions-empty">All suggestions dismissed.</p>
      )}
    </section>
  )
})

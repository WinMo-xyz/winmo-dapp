import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import DappNavbar from '../components/DappNavbar'
import ForexSwap from '../components/forex/ForexSwap'
import { useForexRates } from '../hooks/useForexRates'
import {
  FOREX_TOKENS, CURRENCY_META, MATRIX_CURRENCIES,
  formatVolume, formatRate,
} from '../config/forex'
import { getQuote, getSwapTransaction, toSmallestUnit, fromSmallestUnit } from '../services/jupiterApi'
import './Forex.css'

const TABS = [
  { key: 'markets', label: 'Markets' },
  { key: 'matrix', label: 'Matrix' },
  { key: 'arbitrage', label: 'Arbitrage' },
  { key: 'swap', label: 'Swap' },
]

export default function Forex() {
  const [activeTab, setActiveTab] = useState('markets')
  const navigate = useNavigate()
  const { rates, markets, isLoading, getDirectRate, getCrossRate } = useForexRates()

  const handleTrade = (pair) => {
    navigate(`/forex/${pair.replace('/', '')}`)
  }

  return (
    <>
      <DappNavbar />
      <main className="forex-page">
        <div className="container">
          <h1 className="forex-title">
            <span className="gradient-text">Forex</span> Trading
          </h1>
          <p className="forex-subtitle">
            Trade foreign currencies on Solana. Live rates from Pyth Network oracles.
          </p>

          <div className="forex-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`forex-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="forex-content">
            {activeTab === 'markets' && <MarketsTab markets={markets} isLoading={isLoading} onTrade={handleTrade} />}
            {activeTab === 'matrix' && <MatrixTab getCrossRate={getCrossRate} rates={rates} isLoading={isLoading} />}
            {activeTab === 'arbitrage' && <ArbitrageTab />}
            {activeTab === 'swap' && <ForexSwap getCrossRate={getCrossRate} />}
          </div>
        </div>
      </main>
    </>
  )
}

// ── Markets Tab ──────────────────────────────────────────────────────────

function MarketsTab({ markets, isLoading, onTrade }) {
  if (isLoading) return <div className="forex-loading"><p className="forex-loading-text">Loading FX rates...</p></div>

  return (
    <div>
      <div className="forex-table-wrap glass-card">
        <table className="forex-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Rate</th>
              <th>Category</th>
              <th>Volume (24h)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {markets.map(m => (
              <tr key={m.pair}>
                <td>
                  <div className="forex-pair-cell">
                    <span className="forex-pair-flags">
                      {CURRENCY_META[m.base]?.flag}{CURRENCY_META[m.quote]?.flag}
                    </span>
                    <span className="forex-pair-name forex-pair-link" onClick={() => onTrade(m.pair)}>{m.pair}</span>
                  </div>
                </td>
                <td className="forex-rate-cell">{formatRate(m.rate)}</td>
                <td><span className={`forex-category ${m.category}`}>{m.category}</span></td>
                <td className="forex-volume-cell">{formatVolume(m.volume)}</td>
                <td>
                  <button className="forex-trade-btn" onClick={() => onTrade(m.pair)}>Trade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="forex-table-footer">
        {markets.length} pairs &middot; {markets.filter(m => m.tradeable).length} tradeable on Solana &middot; Volume data from BIS Triennial Survey
      </p>
    </div>
  )
}

// ── Cross Rates Matrix Tab ───────────────────────────────────────────────

function MatrixTab({ getCrossRate, rates, isLoading }) {
  if (isLoading) return <div className="forex-loading"><p className="forex-loading-text">Loading Pyth oracle rates...</p></div>

  // Latest publish time from any feed
  const lastUpdate = useMemo(() => {
    let latest = 0
    for (const r of Object.values(rates)) {
      if (r.publishTime > latest) latest = r.publishTime
    }
    return latest
  }, [rates])

  // Count active feeds
  const feedCount = Object.keys(rates).length

  return (
    <div>
      <div className="forex-matrix-header">
        <div>
          <p className="forex-matrix-subtitle">
            Cross rates for {MATRIX_CURRENCIES.length} currencies via Pyth Network oracle
          </p>
          <span className="forex-matrix-meta">
            {feedCount} feeds active
            {lastUpdate > 0 && (
              <> &middot; Updated {new Date(lastUpdate * 1000).toLocaleTimeString()}</>
            )}
          </span>
        </div>
        <span className="forex-matrix-pyth-badge">
          <span className="pyth-dot" /> Pyth Network
        </span>
      </div>

      <div className="forex-matrix-wrap glass-card">
        <table className="forex-matrix">
          <thead>
            <tr>
              <th></th>
              {MATRIX_CURRENCIES.map(c => (
                <th key={c}>{CURRENCY_META[c]?.flag} {c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_CURRENCIES.map(row => (
              <tr key={row}>
                <td className="matrix-header-cell">{CURRENCY_META[row]?.flag} {row}</td>
                {MATRIX_CURRENCIES.map(col => {
                  if (row === col) {
                    return <td key={col} className="matrix-diagonal">1.0000</td>
                  }
                  const rate = getCrossRate(row, col)
                  return (
                    <td key={col} className="matrix-rate-cell" title={`1 ${row} = ${rate != null ? rate.toFixed(8) : '?'} ${col}`}>
                      {rate != null ? formatRate(rate) : '--'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Arbitrage Tab (same-currency stablecoin pairs) ──────────────────────

const ARB_REFS = { USD: 'USDC', EUR: 'EURC' }

function buildArbPairs() {
  const byCurrency = {}
  for (const [symbol, token] of Object.entries(FOREX_TOKENS)) {
    if (!byCurrency[token.currency]) byCurrency[token.currency] = []
    byCurrency[token.currency].push(symbol)
  }
  const pairs = []
  for (const [currency, symbols] of Object.entries(byCurrency)) {
    if (symbols.length < 2) continue
    const ref = ARB_REFS[currency] || symbols[0]
    for (const sym of symbols) {
      if (sym === ref) continue
      pairs.push({ from: sym, to: ref, currency })
    }
  }
  return pairs
}

const ARB_PAIRS = buildArbPairs()

function ArbitrageTab() {
  const [arbData, setArbData] = useState({})
  const [arbLoading, setArbLoading] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [expandedKey, setExpandedKey] = useState(null)

  const currencies = useMemo(() => {
    const set = new Set(ARB_PAIRS.map(p => p.currency))
    return ['all', ...Array.from(set)]
  }, [])

  const filteredPairs = useMemo(() => {
    if (currencyFilter === 'all') return ARB_PAIRS
    return ARB_PAIRS.filter(p => p.currency === currencyFilter)
  }, [currencyFilter])

  useEffect(() => {
    let cancelled = false

    async function fetchOne(p) {
      const fromToken = FOREX_TOKENS[p.from]
      const toToken = FOREX_TOKENS[p.to]
      if (!fromToken || !toToken) return null
      const key = `${p.from}>${p.to}`
      try {
        const amount = toSmallestUnit('100', fromToken.decimals)
        const q = await getQuote(fromToken.mint, toToken.mint, amount)
        const outNum = Number(fromSmallestUnit(q.outAmount, toToken.decimals))
        return { key, rate: outNum / 100 }
      } catch {
        return { key, rate: null }
      }
    }

    async function scan() {
      if (cancelled) return
      setArbLoading(true)

      // Process in parallel batches of 4
      const BATCH = 4
      for (let i = 0; i < ARB_PAIRS.length; i += BATCH) {
        if (cancelled) break
        const batch = ARB_PAIRS.slice(i, i + BATCH)
        const results = await Promise.all(batch.map(fetchOne))
        if (cancelled) break
        // Stream each batch into state immediately
        setArbData(prev => {
          const next = { ...prev }
          for (const r of results) {
            if (r) next[r.key] = { rate: r.rate }
          }
          return next
        })
      }

      if (!cancelled) {
        setArbLoading(false)
        setLastScan(Date.now())
        setCountdown(60)
      }
    }

    scan()
    const interval = setInterval(scan, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Countdown
  useEffect(() => {
    if (!lastScan) return
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastScan) / 1000)
      setCountdown(Math.max(0, 60 - elapsed))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastScan])

  // Sort: biggest spread magnitude first
  const sorted = useMemo(() => {
    return [...filteredPairs].sort((a, b) => {
      const rA = arbData[`${a.from}>${a.to}`]?.rate
      const rB = arbData[`${b.from}>${b.to}`]?.rate
      const sA = rA != null ? Math.abs(rA - 1) : 0
      const sB = rB != null ? Math.abs(rB - 1) : 0
      return sB - sA
    })
  }, [filteredPairs, arbData])

  const opportunityCount = sorted.filter(p => {
    const r = arbData[`${p.from}>${p.to}`]?.rate
    return r != null && Math.abs(r - 1) >= 0.001
  }).length

  return (
    <div>
      <div className="forex-arb-header">
        <div>
          <p className="forex-arb-subtitle">
            Same-currency stablecoin arbitrage via Jupiter DEX
          </p>
          <span className="forex-arb-count">
            {sorted.length} pairs &middot; <strong>{opportunityCount} opportunities</strong>
          </span>
        </div>
        <div className="forex-arb-timer">
          {arbLoading ? (
            <span className="forex-arb-scanning">Scanning...</span>
          ) : (
            <span className="forex-arb-next">Next scan in <strong>{countdown}s</strong></span>
          )}
          <div className="forex-arb-progress">
            <div className="forex-arb-progress-bar" style={{ width: `${((60 - countdown) / 60) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="forex-markets-filters" style={{ marginBottom: 16 }}>
        {currencies.map(c => (
          <button
            key={c}
            className={`forex-filter-btn ${currencyFilter === c ? 'active' : ''}`}
            onClick={() => setCurrencyFilter(c)}
          >
            {c === 'all' ? `All (${ARB_PAIRS.length})` : `${CURRENCY_META[c]?.flag || ''} ${c}`}
          </button>
        ))}
      </div>

      <div className="forex-table-wrap glass-card">
        <table className="forex-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Currency</th>
              <th>DEX Rate</th>
              <th>Spread</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => {
              const key = `${p.from}>${p.to}`
              const r = arbData[key]?.rate
              const spread = r != null ? (r - 1) * 100 : null
              const dir = spread == null ? 'par'
                : Math.abs(spread) < 0.01 ? 'par'
                : spread > 0 ? 'premium' : 'discount'
              const isExpanded = expandedKey === key
              return (
                <ArbRow
                  key={key}
                  pairKey={key}
                  p={p}
                  r={r}
                  spread={spread}
                  dir={dir}
                  arbLoading={arbLoading}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedKey(isExpanded ? null : key)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {arbLoading && <p className="forex-arb-loading-text">Scanning {ARB_PAIRS.length} stablecoin pairs...</p>}
    </div>
  )
}

// ── Inline Arb Swap Row ──────────────────────────────────────────────────

function ArbRow({ pairKey, p, r, spread, dir, arbLoading, isExpanded, onToggle }) {
  return (
    <>
      <tr className={isExpanded ? 'arb-row-active' : ''}>
        <td>
          <div className="forex-pair-cell">
            <span className="forex-pair-name">
              {p.from} <span className="forex-arb-arrow">&rarr;</span> {p.to}
            </span>
          </div>
        </td>
        <td>
          <span className="forex-arb-ccy">{CURRENCY_META[p.currency]?.flag} {p.currency}</span>
        </td>
        <td className="forex-rate-cell">
          {arbLoading && r == null ? <span className="forex-loading-dot">...</span> : r != null ? r.toFixed(6) : '--'}
        </td>
        <td>
          {spread != null ? (
            <span className={`forex-spread ${dir}`}>
              {spread >= 0 ? '+' : ''}{spread.toFixed(3)}%
            </span>
          ) : '--'}
        </td>
        <td>
          <button
            className={`forex-trade-btn ${isExpanded ? 'active' : ''}`}
            onClick={onToggle}
          >
            {isExpanded ? 'Close' : 'Trade'}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="arb-swap-row">
          <td colSpan={5} style={{ padding: 0, border: 'none' }}>
            <ArbInlineSwap from={p.from} to={p.to} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  )
}

const PRESET_AMOUNTS = ['100', '500', '1000', '5000']
const PRESET_LABELS = ['100', '500', '1k', '5k']

function ArbInlineSwap({ from: initFrom, to: initTo, onClose }) {
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const { setVisible: openWalletModal } = useWalletModal()

  const [reversed, setReversed] = useState(false)
  const [amount, setAmount] = useState('')
  const [outAmount, setOutAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(null)

  const from = reversed ? initTo : initFrom
  const to = reversed ? initFrom : initTo
  const fromToken = FOREX_TOKENS[from]
  const toToken = FOREX_TOKENS[to]

  const handleFlip = () => {
    setReversed(r => !r)
    setAmount('')
    setOutAmount('')
    setQuote(null)
    setError(null)
    if (status !== 'idle') setStatus('idle')
  }

  // Fetch balance
  useEffect(() => {
    if (!publicKey || !fromToken) { setBalance(null); return }
    let cancelled = false
    async function fetchBal() {
      try {
        const mint = new PublicKey(fromToken.mint)
        const ata = await getAssociatedTokenAddress(mint, publicKey)
        const info = await connection.getTokenAccountBalance(ata)
        if (!cancelled) setBalance(parseFloat(info.value.uiAmountString))
      } catch {
        if (!cancelled) setBalance(0)
      }
    }
    fetchBal()
    return () => { cancelled = true }
  }, [publicKey, fromToken, connection])

  // Fetch Jupiter quote with debounce
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || !fromToken || !toToken) {
      setQuote(null)
      setOutAmount('')
      return
    }
    setQuoteLoading(true)
    const timer = setTimeout(async () => {
      try {
        const raw = toSmallestUnit(amount, fromToken.decimals)
        const q = await getQuote(fromToken.mint, toToken.mint, raw)
        setQuote(q)
        setOutAmount(fromSmallestUnit(q.outAmount, toToken.decimals))
      } catch {
        setQuote(null)
        setOutAmount('')
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [amount, from, to])

  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey) { openWalletModal(true); return }
    if (!quote || !amount || parseFloat(amount) <= 0) return

    setStatus('swapping')
    setError(null)
    try {
      const raw = toSmallestUnit(amount, fromToken.decimals)
      const quoteRes = await getQuote(fromToken.mint, toToken.mint, raw)
      const { swapTransaction } = await getSwapTransaction(quoteRes, publicKey)
      const txBuf = Buffer.from(swapTransaction, 'base64')
      const tx = VersionedTransaction.deserialize(txBuf)
      const signedTx = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false, maxRetries: 2,
      })
      await connection.confirmTransaction(sig, 'confirmed')

      const history = JSON.parse(localStorage.getItem('forexHistory') || '[]')
      history.unshift({ from, to, fromAmount: amount, toAmount: outAmount, sig, time: Date.now() })
      localStorage.setItem('forexHistory', JSON.stringify(history.slice(0, 50)))

      setStatus('success')
      setTimeout(() => { setStatus('idle'); setAmount(''); setOutAmount(''); setQuote(null) }, 3000)
    } catch (err) {
      setError(err.message || 'Trade failed')
      setStatus('error')
    }
  }, [connected, publicKey, quote, amount, fromToken, toToken, from, to, outAmount, signTransaction, connection, openWalletModal])

  const isSwapping = status === 'swapping'

  return (
    <div className="arb-inline-swap">
      <div className="arb-inline-swap-header">
        <div className="arb-inline-swap-title-row">
          <span className="arb-inline-swap-title">
            {from} <span className="forex-arb-arrow">&rarr;</span> {to}
          </span>
          <button
            className="arb-flip-btn"
            onClick={handleFlip}
            disabled={isSwapping}
            title="Reverse direction"
          >
            &#8597;
          </button>
        </div>
        <button className="arb-inline-close" onClick={onClose}>&times;</button>
      </div>

      <div className="arb-inline-swap-body">
        <div className="arb-inline-field">
          <div className="arb-inline-input-row">
            <input
              type="number"
              className="arb-inline-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); if (status !== 'idle') setStatus('idle') }}
              min="0"
              step="any"
              disabled={isSwapping}
            />
            <span className="arb-inline-token">{from}</span>
          </div>
          <div className="arb-inline-presets">
            {PRESET_AMOUNTS.map((val, i) => (
              <button
                key={val}
                className={`arb-preset-btn ${amount === val ? 'active' : ''}`}
                onClick={() => setAmount(val)}
                disabled={isSwapping}
              >
                {PRESET_LABELS[i]}
              </button>
            ))}
            {connected && balance != null && balance > 0 && (
              <button
                className="arb-preset-btn"
                onClick={() => setAmount(String(balance))}
                disabled={isSwapping}
              >
                Max
              </button>
            )}
          </div>
          {connected && balance != null && (
            <span className="arb-inline-balance">Balance: {balance >= 1 ? balance.toFixed(4) : balance.toFixed(6)} {from}</span>
          )}
        </div>

        <div className="arb-inline-field">
          <div className="arb-inline-input-row">
            <input
              type="text"
              className="arb-inline-input"
              placeholder="0.00"
              value={outAmount}
              readOnly
            />
            <span className="arb-inline-token">{to}</span>
          </div>
          {quoteLoading && <span className="arb-inline-quoting">Fetching quote...</span>}
        </div>

        {error && <p className="arb-inline-error">{error}</p>}

        <button
          className={`btn btn-accent arb-inline-swap-btn ${status === 'success' ? 'swap-success' : ''}`}
          onClick={handleSwap}
          disabled={isSwapping || quoteLoading || (connected && (!quote || !amount || parseFloat(amount) <= 0))}
        >
          {!connected ? 'Connect Wallet'
            : isSwapping ? 'Trading...'
            : status === 'success' ? 'Done!'
            : status === 'error' ? 'Retry'
            : quoteLoading ? 'Getting Quote...'
            : `Trade ${from} → ${to}`}
        </button>
      </div>
    </div>
  )
}


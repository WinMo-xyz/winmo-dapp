import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { VersionedTransaction } from '@solana/web3.js'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { getRwaArbPairs, PROVIDERS } from '../services/assets'
import { getQuote, getSwapTransaction, toSmallestUnit, fromSmallestUnit } from '../services/jupiterApi'
import { getRouteRaw, toSmallestUnit as evmToSmallest, fromSmallestUnit as evmFromSmallest } from '../services/kyberswapApi'
import AssetLogo from './AssetLogo'
import './RwaArbitrage.css'

// ── Main ArbitrageTab ──────────────────────────────────────────────────

export default function RwaArbitrageTab({ category }) {
  const pairs = useMemo(() => getRwaArbPairs(category), [category])

  const [arbData, setArbData] = useState({})
  const [arbLoading, setArbLoading] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [chainFilter, setChainFilter] = useState('all')
  const [expandedKey, setExpandedKey] = useState(null)

  const chains = useMemo(() => {
    const set = new Set(pairs.map(p => p.chain))
    return ['all', ...Array.from(set)]
  }, [pairs])

  const filteredPairs = useMemo(() => {
    if (chainFilter === 'all') return pairs
    return pairs.filter(p => p.chain === chainFilter)
  }, [chainFilter, pairs])

  // Scan rates
  useEffect(() => {
    if (pairs.length === 0) return
    let cancelled = false

    async function fetchOne(p) {
      const key = `${p.from.symbol}>${p.to.symbol}`
      try {
        let rate
        if (p.chain === 'solana') {
          const amount = toSmallestUnit('1', p.from.decimals)
          const q = await getQuote(p.from.address, p.to.address, amount)
          rate = Number(fromSmallestUnit(q.outAmount, p.to.decimals))
        } else {
          const amount = evmToSmallest('1', p.from.decimals)
          const data = await getRouteRaw(p.from.address, p.to.address, amount)
          rate = Number(evmFromSmallest(data.routeSummary.amountOut, p.to.decimals))
        }
        return { key, rate }
      } catch (err) {
        console.warn(`[RWA-ARB] ${key} quote failed:`, err.message || err)
        return { key, rate: null }
      }
    }

    const delay = (ms) => new Promise(r => setTimeout(r, ms))

    async function scan() {
      if (cancelled) return
      setArbLoading(true)

      const BATCH = 2
      for (let i = 0; i < pairs.length; i += BATCH) {
        if (cancelled) break
        if (i > 0) await delay(400)
        const batch = pairs.slice(i, i + BATCH)
        const results = await Promise.all(batch.map(fetchOne))
        if (cancelled) break
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
  }, [pairs])

  // Countdown timer
  useEffect(() => {
    if (!lastScan) return
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastScan) / 1000)
      setCountdown(Math.max(0, 60 - elapsed))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastScan])

  // Sort by biggest spread magnitude
  const sorted = useMemo(() => {
    return [...filteredPairs].sort((a, b) => {
      const rA = arbData[`${a.from.symbol}>${a.to.symbol}`]?.rate
      const rB = arbData[`${b.from.symbol}>${b.to.symbol}`]?.rate
      const sA = rA != null ? Math.abs(rA - 1) : 0
      const sB = rB != null ? Math.abs(rB - 1) : 0
      return sB - sA
    })
  }, [filteredPairs, arbData])

  const opportunityCount = sorted.filter(p => {
    const r = arbData[`${p.from.symbol}>${p.to.symbol}`]?.rate
    return r != null && Math.abs(r - 1) >= 0.001
  }).length

  if (pairs.length === 0) {
    return (
      <div className="rwa-arb-empty glass-card">
        <p>No arbitrage pairs found for {category}.</p>
        <span>Arbitrage requires the same asset tokenized by multiple providers on the same chain.</span>
      </div>
    )
  }

  return (
    <div>
      <div className="rwa-arb-header">
        <div>
          <p className="rwa-arb-subtitle">
            Same-asset cross-provider arbitrage via DEX
          </p>
          <span className="rwa-arb-count">
            {sorted.length} pairs &middot; <strong>{opportunityCount} opportunities</strong>
          </span>
        </div>
        <div className="rwa-arb-timer">
          {arbLoading ? (
            <span className="rwa-arb-scanning">Scanning...</span>
          ) : (
            <span className="rwa-arb-next">Next scan in <strong>{countdown}s</strong></span>
          )}
          <div className="rwa-arb-progress">
            <div className="rwa-arb-progress-bar" style={{ width: `${((60 - countdown) / 60) * 100}%` }} />
          </div>
        </div>
      </div>

      {chains.length > 2 && (
        <div className="rwa-arb-filters">
          {chains.map(c => (
            <button
              key={c}
              className={`rwa-arb-filter-btn ${chainFilter === c ? 'active' : ''}`}
              onClick={() => setChainFilter(c)}
            >
              {c === 'all' ? `All (${pairs.length})` : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="rwa-arb-table-wrap glass-card">
        <table className="rwa-arb-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Chain</th>
              <th>Pair</th>
              <th>DEX Rate</th>
              <th>Spread</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => {
              const key = `${p.from.symbol}>${p.to.symbol}`
              const r = arbData[key]?.rate
              const spread = r != null ? (r - 1) * 100 : null
              const dir = spread == null ? 'par'
                : Math.abs(spread) < 0.01 ? 'par'
                : spread > 0 ? 'premium' : 'discount'
              const isExpanded = expandedKey === key
              return (
                <RwaArbRow
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

      {arbLoading && <p className="rwa-arb-loading-text">Scanning {pairs.length} provider pairs...</p>}
    </div>
  )
}

// ── ArbRow ──────────────────────────────────────────────────────────────

function RwaArbRow({ pairKey, p, r, spread, dir, arbLoading, isExpanded, onToggle }) {
  const chainLabel = p.chain.charAt(0).toUpperCase() + p.chain.slice(1)

  return (
    <>
      <tr className={isExpanded ? 'rwa-arb-row-active' : ''}>
        <td>
          <div className="rwa-arb-asset-cell">
            <AssetLogo logo={p.asset.logo} name={p.asset.name} size={24} />
            <span className="rwa-arb-asset-name">{p.asset.symbol}</span>
          </div>
        </td>
        <td>
          <span className={`rwa-arb-chain-badge rwa-arb-chain-${p.chain}`}>{chainLabel}</span>
        </td>
        <td>
          <span className="rwa-arb-pair-name">
            {p.from.symbol} <span className="rwa-arb-arrow">&rarr;</span> {p.to.symbol}
          </span>
        </td>
        <td className="rwa-arb-rate-cell">
          {arbLoading && r == null ? <span className="rwa-arb-loading-dot">...</span> : r != null ? r.toFixed(6) : '--'}
        </td>
        <td>
          {spread != null ? (
            <span className={`rwa-arb-spread ${dir}`}>
              {spread >= 0 ? '+' : ''}{spread.toFixed(3)}%
            </span>
          ) : '--'}
        </td>
        <td>
          <button
            className={`rwa-arb-trade-btn ${isExpanded ? 'active' : ''}`}
            onClick={onToggle}
          >
            {isExpanded ? 'Close' : 'Trade'}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="rwa-arb-swap-row">
          <td colSpan={6} style={{ padding: 0, border: 'none' }}>
            <RwaArbInlineSwap pair={p} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Inline Swap ─────────────────────────────────────────────────────────

const PRESET_AMOUNTS = ['0.1', '0.5', '1', '5']
const PRESET_LABELS = ['0.1', '0.5', '1', '5']

function RwaArbInlineSwap({ pair, onClose }) {
  const isSolana = pair.chain === 'solana'

  // Solana wallet
  const { publicKey, signTransaction, connected: solConnected } = useWallet()
  const { connection } = useConnection()
  const { setVisible: openSolanaModal } = useWalletModal()

  // EVM wallet
  const { address: evmAddress, isConnected: evmConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const connected = isSolana ? solConnected : evmConnected

  const [reversed, setReversed] = useState(false)
  const [amount, setAmount] = useState('')
  const [outAmount, setOutAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(null)

  const from = reversed ? pair.to : pair.from
  const to = reversed ? pair.from : pair.to

  const handleFlip = () => {
    setReversed(r => !r)
    setAmount('')
    setOutAmount('')
    setQuote(null)
    setError(null)
    if (status !== 'idle') setStatus('idle')
  }

  // Fetch balance (Solana)
  useEffect(() => {
    if (!isSolana || !publicKey || !from) { setBalance(null); return }
    let cancelled = false
    async function fetchBal() {
      try {
        const mint = new PublicKey(from.address)
        const ata = await getAssociatedTokenAddress(mint, publicKey)
        const info = await connection.getTokenAccountBalance(ata)
        if (!cancelled) setBalance(parseFloat(info.value.uiAmountString))
      } catch {
        if (!cancelled) setBalance(0)
      }
    }
    fetchBal()
    return () => { cancelled = true }
  }, [isSolana, publicKey, from, connection])

  // Fetch quote with debounce
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || !from || !to) {
      setQuote(null)
      setOutAmount('')
      return
    }
    setQuoteLoading(true)
    const timer = setTimeout(async () => {
      try {
        if (isSolana) {
          const raw = toSmallestUnit(amount, from.decimals)
          const q = await getQuote(from.address, to.address, raw)
          setQuote(q)
          setOutAmount(fromSmallestUnit(q.outAmount, to.decimals))
        } else {
          const raw = evmToSmallest(amount, from.decimals)
          const data = await getRouteRaw(from.address, to.address, raw)
          setQuote(data)
          setOutAmount(evmFromSmallest(data.routeSummary.amountOut, to.decimals))
        }
      } catch {
        setQuote(null)
        setOutAmount('')
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [amount, from, to, isSolana])

  // Handle swap
  const handleSwap = useCallback(async () => {
    if (!connected) {
      if (isSolana) openSolanaModal(true)
      else openConnectModal()
      return
    }
    if (!quote || !amount || parseFloat(amount) <= 0) return

    setStatus('swapping')
    setError(null)
    try {
      if (isSolana) {
        const raw = toSmallestUnit(amount, from.decimals)
        const quoteRes = await getQuote(from.address, to.address, raw)
        const { swapTransaction } = await getSwapTransaction(quoteRes, publicKey)
        const txBuf = Buffer.from(swapTransaction, 'base64')
        const tx = VersionedTransaction.deserialize(txBuf)
        const signedTx = await signTransaction(tx)
        const sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false, maxRetries: 2,
        })
        await connection.confirmTransaction(sig, 'confirmed')
      }
      // EVM swap would use buildRoute + sendTransaction (not implemented inline yet)

      setStatus('success')
      setTimeout(() => { setStatus('idle'); setAmount(''); setOutAmount(''); setQuote(null) }, 3000)
    } catch (err) {
      setError(err.message || 'Trade failed')
      setStatus('error')
    }
  }, [connected, isSolana, publicKey, quote, amount, from, to, signTransaction, connection, openSolanaModal, openConnectModal])

  const isSwapping = status === 'swapping'
  const fromProvider = PROVIDERS[from.provider]?.name || from.provider
  const toProvider = PROVIDERS[to.provider]?.name || to.provider

  return (
    <div className="rwa-arb-inline-swap">
      <div className="rwa-arb-inline-swap-header">
        <div className="rwa-arb-inline-swap-title-row">
          <span className="rwa-arb-inline-swap-title">
            {from.symbol} <span className="rwa-arb-arrow">&rarr;</span> {to.symbol}
          </span>
          <span className="rwa-arb-inline-swap-providers">
            {fromProvider} &rarr; {toProvider}
          </span>
          <button
            className="rwa-arb-flip-btn"
            onClick={handleFlip}
            disabled={isSwapping}
            title="Reverse direction"
          >
            &#8597;
          </button>
        </div>
        <button className="rwa-arb-inline-close" onClick={onClose}>&times;</button>
      </div>

      <div className="rwa-arb-inline-swap-body">
        <div className="rwa-arb-inline-field">
          <div className="rwa-arb-inline-input-row">
            <input
              type="number"
              className="rwa-arb-inline-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); if (status !== 'idle') setStatus('idle') }}
              min="0"
              step="any"
              disabled={isSwapping}
            />
            <span className="rwa-arb-inline-token">{from.symbol}</span>
          </div>
          <div className="rwa-arb-inline-presets">
            {PRESET_AMOUNTS.map((val, i) => (
              <button
                key={val}
                className={`rwa-arb-preset-btn ${amount === val ? 'active' : ''}`}
                onClick={() => setAmount(val)}
                disabled={isSwapping}
              >
                {PRESET_LABELS[i]}
              </button>
            ))}
            {connected && balance != null && balance > 0 && (
              <button
                className="rwa-arb-preset-btn"
                onClick={() => setAmount(String(balance))}
                disabled={isSwapping}
              >
                Max
              </button>
            )}
          </div>
          {connected && isSolana && balance != null && (
            <span className="rwa-arb-inline-balance">
              Balance: {balance >= 1 ? balance.toFixed(4) : balance.toFixed(6)} {from.symbol}
            </span>
          )}
        </div>

        <div className="rwa-arb-inline-field">
          <div className="rwa-arb-inline-input-row">
            <input
              type="text"
              className="rwa-arb-inline-input"
              placeholder="0.00"
              value={outAmount}
              readOnly
            />
            <span className="rwa-arb-inline-token">{to.symbol}</span>
          </div>
          {quoteLoading && <span className="rwa-arb-inline-quoting">Fetching quote...</span>}
        </div>

        {error && <p className="rwa-arb-inline-error">{error}</p>}

        <button
          className={`btn btn-accent rwa-arb-inline-swap-btn ${status === 'success' ? 'swap-success' : ''}`}
          onClick={handleSwap}
          disabled={isSwapping || quoteLoading || (connected && (!quote || !amount || parseFloat(amount) <= 0))}
        >
          {!connected ? 'Connect Wallet'
            : isSwapping ? 'Trading...'
            : status === 'success' ? 'Done!'
            : status === 'error' ? 'Retry'
            : quoteLoading ? 'Getting Quote...'
            : `Trade ${from.symbol} → ${to.symbol}`}
        </button>
      </div>
    </div>
  )
}

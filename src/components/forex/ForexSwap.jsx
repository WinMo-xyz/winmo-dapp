import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { FOREX_TOKENS, FOREX_TOKEN_LIST, CURRENCY_META, formatRate } from '../../config/forex'
import { getQuote, getSwapTransaction, toSmallestUnit, fromSmallestUnit } from '../../services/jupiterApi'

export default function ForexSwap({ getCrossRate, initialFrom, initialTo }) {
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const { setVisible: openWalletModal } = useWalletModal()

  const [fromSymbol, setFromSymbol] = useState('USDC')
  const [toSymbol, setToSymbol] = useState('EURC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(null)

  // Respond to pair pre-selection from Markets/Arbitrage tabs
  useEffect(() => {
    if (initialFrom && FOREX_TOKENS[initialFrom]) {
      setFromSymbol(initialFrom)
      setFromAmount('')
      setQuote(null)
      setError(null)
    }
    if (initialTo && FOREX_TOKENS[initialTo]) {
      setToSymbol(initialTo)
      setToAmount('')
      setQuote(null)
    }
  }, [initialFrom, initialTo])

  const fromToken = FOREX_TOKENS[fromSymbol]
  const toToken = FOREX_TOKENS[toSymbol]

  // Oracle rate
  const oracleRate = useMemo(() => {
    if (!fromToken || !toToken) return null
    return getCrossRate(fromToken.currency, toToken.currency)
  }, [fromToken, toToken, getCrossRate])

  // DEX rate from Jupiter quote
  const dexRate = useMemo(() => {
    if (!quote || !fromAmount || parseFloat(fromAmount) <= 0) return null
    const outNum = Number(fromSmallestUnit(quote.outAmount, toToken.decimals))
    return outNum / parseFloat(fromAmount)
  }, [quote, fromAmount, toToken])

  // Spread percentage
  const spread = useMemo(() => {
    if (!dexRate || !oracleRate) return null
    return ((dexRate - oracleRate) / oracleRate) * 100
  }, [dexRate, oracleRate])

  // Fetch balance for "from" token
  useEffect(() => {
    if (!publicKey || !fromToken) { setBalance(null); return }
    let cancelled = false

    async function fetchBalance() {
      try {
        const mint = new PublicKey(fromToken.mint)
        const ata = await getAssociatedTokenAddress(mint, publicKey)
        const info = await connection.getTokenAccountBalance(ata)
        if (!cancelled) setBalance(parseFloat(info.value.uiAmountString))
      } catch {
        if (!cancelled) setBalance(0)
      }
    }

    fetchBalance()
    return () => { cancelled = true }
  }, [publicKey, fromSymbol, fromToken, connection])

  // Fetch Jupiter quote with debounce
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
      setQuote(null)
      setToAmount('')
      return
    }

    setQuoteLoading(true)
    const timer = setTimeout(async () => {
      try {
        const amountRaw = toSmallestUnit(fromAmount, fromToken.decimals)
        const q = await getQuote(fromToken.mint, toToken.mint, amountRaw)
        setQuote(q)
        setToAmount(fromSmallestUnit(q.outAmount, toToken.decimals))
      } catch {
        setQuote(null)
        setToAmount('')
      } finally {
        setQuoteLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [fromAmount, fromSymbol, toSymbol])

  const handleFlip = () => {
    setFromSymbol(toSymbol)
    setToSymbol(fromSymbol)
    setFromAmount('')
    setToAmount('')
    setQuote(null)
    setError(null)
  }

  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey) { openWalletModal(true); return }
    if (!quote || !fromAmount || parseFloat(fromAmount) <= 0) return

    setStatus('swapping')
    setError(null)

    try {
      const amountRaw = toSmallestUnit(fromAmount, fromToken.decimals)
      const quoteResponse = await getQuote(fromToken.mint, toToken.mint, amountRaw)
      const { swapTransaction } = await getSwapTransaction(quoteResponse, publicKey)

      const txBuf = Buffer.from(swapTransaction, 'base64')
      const tx = VersionedTransaction.deserialize(txBuf)
      const signedTx = await signTransaction(tx)

      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false, maxRetries: 2,
      })
      await connection.confirmTransaction(sig, 'confirmed')

      // Save to local history
      const history = JSON.parse(localStorage.getItem('forexHistory') || '[]')
      history.unshift({
        from: fromSymbol, to: toSymbol,
        fromAmount, toAmount,
        sig, time: Date.now(),
      })
      localStorage.setItem('forexHistory', JSON.stringify(history.slice(0, 50)))

      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
        setFromAmount('')
        setToAmount('')
        setQuote(null)
      }, 3000)
    } catch (err) {
      setError(err.message || 'Swap failed')
      setStatus('error')
    }
  }, [connected, publicKey, quote, fromAmount, fromToken, toToken, fromSymbol, toSymbol, toAmount, signTransaction, connection, openWalletModal])

  // Transaction history
  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('forexHistory') || '[]') }
    catch { return [] }
  }, [status])

  const isSwapping = status === 'swapping'
  const formatBal = (b) => b == null ? '...' : b === 0 ? '0' : b >= 1 ? b.toFixed(4) : b.toFixed(6)

  return (
    <div className="forex-swap-wrap">
      <div className="forex-swap-card glass-card">
        <div className="forex-swap-field">
          <label className="forex-swap-label">From</label>
          <div className="forex-swap-input-row">
            <select
              className="forex-swap-select"
              value={fromSymbol}
              onChange={(e) => { setFromSymbol(e.target.value); setFromAmount(''); setQuote(null); setError(null) }}
              disabled={isSwapping}
            >
              {FOREX_TOKEN_LIST.map(t => (
                <option key={t.symbol} value={t.symbol}>
                  {CURRENCY_META[t.currency]?.flag} {t.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="forex-swap-input"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => { setFromAmount(e.target.value); if (status !== 'idle') setStatus('idle') }}
              min="0"
              step="any"
              disabled={isSwapping}
            />
          </div>
          {connected && (
            <div className="forex-swap-balance">
              Balance: {formatBal(balance)} {fromSymbol}
              {balance > 0 && (
                <button className="forex-max-btn" onClick={() => setFromAmount(String(balance))} disabled={isSwapping}>
                  Max
                </button>
              )}
            </div>
          )}
        </div>

        <div className="forex-swap-flip">
          <button className="forex-swap-flip-btn" onClick={handleFlip} disabled={isSwapping}>
            &#8597;
          </button>
        </div>

        <div className="forex-swap-field">
          <label className="forex-swap-label">To</label>
          <div className="forex-swap-input-row">
            <select
              className="forex-swap-select"
              value={toSymbol}
              onChange={(e) => { setToSymbol(e.target.value); setToAmount(''); setQuote(null); setError(null) }}
              disabled={isSwapping}
            >
              {FOREX_TOKEN_LIST.map(t => (
                <option key={t.symbol} value={t.symbol}>
                  {CURRENCY_META[t.currency]?.flag} {t.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="forex-swap-input"
              placeholder="0.00"
              value={toAmount}
              readOnly
            />
          </div>
        </div>

        {/* Rate comparison */}
        {(oracleRate || dexRate) && (
          <div className="forex-swap-rates">
            {oracleRate && (
              <div className="forex-swap-rate-row">
                <span className="forex-swap-rate-label">Oracle Rate (Pyth)</span>
                <span className="forex-swap-rate-value">{formatRate(oracleRate)}</span>
              </div>
            )}
            {dexRate && (
              <div className="forex-swap-rate-row">
                <span className="forex-swap-rate-label">DEX Rate (Jupiter)</span>
                <span className="forex-swap-rate-value">{formatRate(dexRate)}</span>
              </div>
            )}
            {spread != null && (
              <div className="forex-swap-rate-row">
                <span className="forex-swap-rate-label">Spread</span>
                <span className={`forex-swap-rate-value ${spread > 0 ? 'spread-premium' : spread < -0.5 ? 'spread-discount' : ''}`}>
                  {spread > 0 ? '+' : ''}{spread.toFixed(3)}%
                </span>
              </div>
            )}
          </div>
        )}

        {quoteLoading && <p className="forex-swap-quoting">Fetching quote...</p>}

        {error && <p className="forex-swap-error">{error}</p>}

        <button
          className={`btn btn-accent forex-swap-btn ${status === 'success' ? 'swap-success' : ''}`}
          onClick={handleSwap}
          disabled={isSwapping || quoteLoading || (!connected && false) || (!quote && connected) || (connected && (!fromAmount || parseFloat(fromAmount) <= 0))}
        >
          {!connected ? 'Connect Solana Wallet'
            : isSwapping ? 'Swapping...'
            : status === 'success' ? 'Done!'
            : status === 'error' ? 'Retry'
            : quoteLoading ? 'Getting Quote...'
            : `Swap ${fromSymbol} to ${toSymbol}`}
        </button>

        <p className="forex-swap-powered">Swaps via Jupiter on Solana</p>
      </div>

      {/* Transaction History */}
      {history.length > 0 && (
        <div className="forex-swap-history">
          <h3>Recent Trades</h3>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} className="forex-history-item">
              <span>{h.fromAmount} {h.from} &rarr; {h.toAmount} {h.to}</span>
              <a
                className="forex-history-link"
                href={`https://solscan.io/tx/${h.sig}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

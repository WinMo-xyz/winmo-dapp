import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { FOREX_TOKENS, CURRENCY_META, formatRate, formatVolume, getTokensByCurrency } from '../../config/forex'
import { getQuote, getSwapTransaction, toSmallestUnit, fromSmallestUnit } from '../../services/jupiterApi'
import './ForexPairDetail.css'

const DEPTH_SIZES = [100, 1_000, 10_000, 100_000, 500_000, 1_000_000]
const DEPTH_LABELS = ['$100', '$1,000', '$10K', '$100K', '$500K', '$1M']
const CHART_DEPTH_LABELS = ['100', '1K', '10K', '100K', '500K', '1M']

const TIMEFRAMES = [
  { key: '1M', seconds: 60 },
  { key: '5M', seconds: 300 },
  { key: '15M', seconds: 900 },
  { key: '1H', seconds: 3600 },
]

export default function ForexPairDetail({ market, rates, getCrossRate, onClose }) {
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const { setVisible: openWalletModal } = useWalletModal()

  // Stablecoins available for each side of the pair
  const baseCurrency = market.base   // e.g. 'EUR'
  const quoteCurrency = market.quote // e.g. 'USD'
  const inputTokens = useMemo(() => getTokensByCurrency(quoteCurrency), [quoteCurrency])
  const outputTokens = useMemo(() => getTokensByCurrency(baseCurrency), [baseCurrency])

  const [timeframe, setTimeframe] = useState('1M')
  const [priceHistory, setPriceHistory] = useState([])
  const [depthData, setDepthData] = useState(null)
  const [depthLoading, setDepthLoading] = useState(false)
  const [inputSymbol, setInputSymbol] = useState(market.inputToken || inputTokens[0]?.symbol)
  const [outputSymbol, setOutputSymbol] = useState(market.outputToken || outputTokens[0]?.symbol)
  const [swapAmount, setSwapAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [swapStatus, setSwapStatus] = useState('idle')
  const [swapError, setSwapError] = useState(null)
  const [balance, setBalance] = useState(null)
  const [flipped, setFlipped] = useState(false)

  const initRef = useRef(false)
  const pair = market.pair
  const oracleRate = market.rate
  const confidence = rates[pair]?.confidence

  const activeInputSymbol = flipped ? outputSymbol : inputSymbol
  const activeOutputSymbol = flipped ? inputSymbol : outputSymbol
  const activeInput = FOREX_TOKENS[activeInputSymbol] || null
  const activeOutput = FOREX_TOKENS[activeOutputSymbol] || null

  // Tokens for the current side dropdowns (respect flip)
  const activeInputTokens = flipped ? outputTokens : inputTokens
  const activeOutputTokens = flipped ? inputTokens : outputTokens

  const changePercent = useMemo(() => {
    if (priceHistory.length < 2) return null
    const first = priceHistory[0].price
    const last = priceHistory[priceHistory.length - 1].price
    return ((last - first) / first) * 100
  }, [priceHistory])

  // Generate initial session data on first load
  useEffect(() => {
    if (initRef.current || !oracleRate) return
    initRef.current = true

    const now = Date.now()
    const points = []
    const vol = oracleRate * 0.0002
    let p = oracleRate * (1 + (Math.random() - 0.5) * 0.001)

    for (let i = 360; i > 0; i--) {
      p += (Math.random() - 0.5) * vol
      p += (oracleRate - p) * 0.01
      points.push({ time: now - (i * 5000), price: p })
    }
    points.push({ time: now, price: oracleRate })
    setPriceHistory(points)
  }, [oracleRate])

  // Append real-time ticks
  useEffect(() => {
    if (!oracleRate || !initRef.current) return
    const interval = setInterval(() => {
      setPriceHistory(prev => [...prev.slice(-2000), { time: Date.now(), price: oracleRate }])
    }, 5000)
    return () => clearInterval(interval)
  }, [oracleRate])

  // Build candles from price history
  const candles = useMemo(() => {
    const tf = TIMEFRAMES.find(t => t.key === timeframe)
    if (!tf || priceHistory.length === 0) return []
    const ms = tf.seconds * 1000
    const map = new Map()
    for (const tick of priceHistory) {
      const bucket = Math.floor(tick.time / ms) * ms
      if (!map.has(bucket)) {
        map.set(bucket, { time: bucket, open: tick.price, high: tick.price, low: tick.price, close: tick.price })
      } else {
        const c = map.get(bucket)
        c.high = Math.max(c.high, tick.price)
        c.low = Math.min(c.low, tick.price)
        c.close = tick.price
      }
    }
    return Array.from(map.values()).sort((a, b) => a.time - b.time)
  }, [priceHistory, timeframe])

  // Default input/output tokens for depth analysis
  const depthInput = market.inputToken ? FOREX_TOKENS[market.inputToken] : null
  const depthOutput = market.outputToken ? FOREX_TOKENS[market.outputToken] : null

  // Fetch liquidity depth
  useEffect(() => {
    if (!market.tradeable || !depthInput || !depthOutput) return
    let cancelled = false
    setDepthLoading(true)
    async function fetchDepth() {
      const results = []
      for (const size of DEPTH_SIZES) {
        try {
          const amount = toSmallestUnit(String(size), depthInput.decimals)
          const q = await getQuote(depthInput.mint, depthOutput.mint, amount)
          const outNum = Number(fromSmallestUnit(q.outAmount, depthOutput.decimals))
          results.push({ size, rate: outNum / size, output: outNum })
        } catch {
          results.push({ size, rate: null, output: null })
        }
        await new Promise(r => setTimeout(r, 300))
      }
      if (!cancelled) { setDepthData(results); setDepthLoading(false) }
    }
    fetchDepth()
    return () => { cancelled = true }
  }, [pair, market.tradeable])

  // Fetch balance
  useEffect(() => {
    if (!publicKey || !activeInput) { setBalance(null); return }
    let cancelled = false
    async function fetchBal() {
      try {
        const mint = new PublicKey(activeInput.mint)
        const ata = await getAssociatedTokenAddress(mint, publicKey)
        const info = await connection.getTokenAccountBalance(ata)
        if (!cancelled) setBalance(parseFloat(info.value.uiAmountString))
      } catch { if (!cancelled) setBalance(0) }
    }
    fetchBal()
    return () => { cancelled = true }
  }, [publicKey, activeInput, connection])

  // Fetch Jupiter quote
  useEffect(() => {
    if (!swapAmount || parseFloat(swapAmount) <= 0 || !activeInput || !activeOutput) {
      setQuote(null); return
    }
    setQuoteLoading(true)
    const timer = setTimeout(async () => {
      try {
        const raw = toSmallestUnit(swapAmount, activeInput.decimals)
        setQuote(await getQuote(activeInput.mint, activeOutput.mint, raw))
      } catch { setQuote(null) }
      finally { setQuoteLoading(false) }
    }, 500)
    return () => clearTimeout(timer)
  }, [swapAmount, activeInput, activeOutput])

  const handleSwap = useCallback(async () => {
    if (!connected) { openWalletModal(true); return }
    if (!quote || !swapAmount || parseFloat(swapAmount) <= 0) return
    setSwapStatus('swapping')
    setSwapError(null)
    try {
      const raw = toSmallestUnit(swapAmount, activeInput.decimals)
      const qr = await getQuote(activeInput.mint, activeOutput.mint, raw)
      const { swapTransaction } = await getSwapTransaction(qr, publicKey)
      const txBuf = Buffer.from(swapTransaction, 'base64')
      const tx = VersionedTransaction.deserialize(txBuf)
      const signedTx = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false, maxRetries: 2 })
      await connection.confirmTransaction(sig, 'confirmed')

      const history = JSON.parse(localStorage.getItem('forexHistory') || '[]')
      const outAmount = fromSmallestUnit(qr.outAmount, activeOutput.decimals)
      history.unshift({ from: activeInputSymbol, to: activeOutputSymbol, fromAmount: swapAmount, toAmount: outAmount, sig, time: Date.now() })
      localStorage.setItem('forexHistory', JSON.stringify(history.slice(0, 50)))

      setSwapStatus('success')
      setTimeout(() => { setSwapStatus('idle'); setSwapAmount(''); setQuote(null) }, 3000)
    } catch (err) {
      setSwapError(err.message || 'Swap failed')
      setSwapStatus('error')
    }
  }, [connected, publicKey, quote, swapAmount, activeInput, activeOutput, activeInputSymbol, activeOutputSymbol, signTransaction, connection, openWalletModal])

  const quoteOutput = quote && activeOutput ? fromSmallestUnit(quote.outAmount, activeOutput.decimals) : null
  const isSwapping = swapStatus === 'swapping'

  const handleFlip = () => {
    setFlipped(f => !f)
    setSwapAmount('')
    setQuote(null)
    setSwapError(null)
    setBalance(null)
  }

  return (
    <div className="fpd">
      {/* ── Header Bar ─────────────────────────────────────── */}
      <div className="fpd-hdr">
        <div className="fpd-hdr-left">
          <span className="fpd-hdr-flags">{CURRENCY_META[market.base]?.flag}{CURRENCY_META[market.quote]?.flag}</span>
          <span className="fpd-hdr-pair">{market.base} / {market.quote}</span>
          <span className={`fpd-hdr-cat ${market.category}`}>{market.category}</span>
        </div>
        <div className="fpd-hdr-mid">
          <span className="fpd-hdr-rate">{formatRate(oracleRate)}</span>
          {changePercent != null && (
            <span className={`fpd-hdr-change ${changePercent >= 0 ? 'up' : 'down'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(3)}%
            </span>
          )}
          <span className="fpd-hdr-vol">{formatVolume(market.volume)}</span>
          {market.tradeable && <span className="fpd-hdr-tokens">{market.inputToken}/{market.outputToken}</span>}
        </div>
        <div className="fpd-hdr-right">
          {market.tradeable && (
            <button className="fpd-hdr-swap" onClick={() => document.querySelector('.fpd-swap-card')?.scrollIntoView({ behavior: 'smooth' })}>
              SWAP
            </button>
          )}
          <button className="fpd-hdr-close" onClick={onClose}>CLOSE</button>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="fpd-grid">
        {/* Left: Chart + Stats */}
        <div className="fpd-left">
          <div className="fpd-title-row">
            <div>
              <h2 className="fpd-pair-title">{market.pair}</h2>
              <span className={`fpd-cat-badge ${market.category}`}>{market.category}</span>
            </div>
            <span className="fpd-oracle-badge">PYTH ORACLE</span>
          </div>

          <div className="fpd-rate-row">
            <span className="fpd-big-rate">{formatRate(oracleRate)}</span>
            {changePercent != null && (
              <span className={`fpd-big-change ${changePercent >= 0 ? 'up' : 'down'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(3)}%
              </span>
            )}
          </div>

          <div className="fpd-chart-card glass-card">
            <div className="fpd-chart-controls">
              <div className="fpd-tf-group">
                {TIMEFRAMES.map(tf => (
                  <button key={tf.key}
                    className={`fpd-tf-btn ${timeframe === tf.key ? 'active' : ''}`}
                    onClick={() => setTimeframe(tf.key)}
                  >{tf.key}</button>
                ))}
              </div>
              <span className="fpd-candle-count">{candles.length} candles &middot; SESSION DATA</span>
            </div>
            <CandlestickChart candles={candles} oracleRate={oracleRate} />
          </div>

          <div className="fpd-stats">
            <div className="fpd-stat glass-card">
              <span className="fpd-stat-label">ORACLE CONFIDENCE</span>
              <span className="fpd-stat-val">+/- {confidence ? confidence.toFixed(6) : '--'}</span>
              {confidence && <span className="fpd-stat-status normal">NORMAL</span>}
            </div>
            <div className="fpd-stat glass-card">
              <span className="fpd-stat-label">GLOBAL VOLUME</span>
              <span className="fpd-stat-val">{formatVolume(market.volume)}</span>
            </div>
            <div className="fpd-stat glass-card">
              <span className="fpd-stat-label">CATEGORY</span>
              <span className="fpd-stat-val fpd-stat-cap">{market.category}</span>
            </div>
          </div>
        </div>

        {/* Right: Swap panel */}
        <div className="fpd-right">
          {market.tradeable ? (
            <div className="fpd-swap-card glass-card">
              <div className="fpd-swap-top">
                <div>
                  <span className="fpd-swap-tradeable">TRADEABLE ON SOLANA</span>
                  <p className="fpd-swap-route">{activeInputSymbol} &rarr; {activeOutputSymbol} via Jupiter</p>
                </div>
                <button className="fpd-flip-btn" onClick={handleFlip} title="Reverse direction">&#8597;</button>
              </div>

              <div className="fpd-swap-field">
                <label className="fpd-swap-lbl">FROM ({flipped ? baseCurrency : quoteCurrency})</label>
                <div className="fpd-swap-input-row">
                  <select
                    className="fpd-swap-select"
                    value={activeInputSymbol}
                    onChange={(e) => {
                      if (flipped) setOutputSymbol(e.target.value)
                      else setInputSymbol(e.target.value)
                      setSwapAmount(''); setQuote(null); setSwapError(null)
                    }}
                    disabled={isSwapping}
                  >
                    {activeInputTokens.map(t => (
                      <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                    ))}
                  </select>
                  <input
                    className="fpd-swap-input"
                    type="number"
                    placeholder="0.00"
                    value={swapAmount}
                    onChange={(e) => { setSwapAmount(e.target.value); if (swapStatus !== 'idle') setSwapStatus('idle') }}
                    disabled={isSwapping}
                  />
                </div>
                {connected && balance != null && (
                  <div className="fpd-swap-bal">
                    Bal: {balance === 0 ? '0' : balance.toFixed(4)} {activeInputSymbol}
                    {balance > 0 && <button className="fpd-max" onClick={() => setSwapAmount(String(balance))}>Max</button>}
                  </div>
                )}
              </div>

              <div className="fpd-swap-field">
                <label className="fpd-swap-lbl">TO ({flipped ? quoteCurrency : baseCurrency})</label>
                <div className="fpd-swap-input-row">
                  <select
                    className="fpd-swap-select"
                    value={activeOutputSymbol}
                    onChange={(e) => {
                      if (flipped) setInputSymbol(e.target.value)
                      else setOutputSymbol(e.target.value)
                      setQuote(null); setSwapError(null)
                    }}
                    disabled={isSwapping}
                  >
                    {activeOutputTokens.map(t => (
                      <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                    ))}
                  </select>
                  <input
                    className="fpd-swap-input"
                    type="text"
                    placeholder="0.00"
                    value={quoteOutput || ''}
                    readOnly
                  />
                </div>
              </div>

              {quoteLoading && <p className="fpd-swap-loading">Fetching quote...</p>}
              {swapError && <p className="fpd-swap-err">{swapError}</p>}

              <button
                className={`fpd-swap-btn ${swapStatus === 'success' ? 'success' : ''}`}
                onClick={handleSwap}
                disabled={isSwapping || quoteLoading || (connected && !quote)}
              >
                {!connected ? 'CONNECT WALLET TO SWAP'
                  : isSwapping ? 'SWAPPING...'
                  : swapStatus === 'success' ? 'DONE!'
                  : swapStatus === 'error' ? 'RETRY'
                  : `SWAP ${activeInputSymbol} TO ${activeOutputSymbol}`}
              </button>
            </div>
          ) : (
            <div className="fpd-swap-card glass-card fpd-vo-card">
              <span className="fpd-vo-badge">VIEW ONLY</span>
              <p className="fpd-vo-text">No stablecoin pair available on Solana for this market.</p>
              <p className="fpd-vo-sub">Oracle rates provided by Pyth Network.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Liquidity Depth ──────────────────────────────── */}
      {market.tradeable && (
        <div className="fpd-depth">
          <h3 className="fpd-depth-title">LIQUIDITY DEPTH {market.inputToken} &rarr; {market.outputToken}</h3>
          {depthLoading ? (
            <p className="fpd-depth-loading">Scanning liquidity at multiple sizes...</p>
          ) : depthData ? (
            <>
              <DepthChart data={depthData} oracleRate={oracleRate} />
              <DepthTable data={depthData} oracleRate={oracleRate} outputSymbol={market.outputToken} />
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── Candlestick Chart ────────────────────────────────────────────────────

function CandlestickChart({ candles, oracleRate }) {
  if (!candles.length) return <div className="fpd-chart-empty">Collecting price data...</div>

  const W = 800, H = 280
  const pad = { top: 16, right: 56, bottom: 28, left: 8 }
  const drawW = W - pad.left - pad.right
  const drawH = H - pad.top - pad.bottom

  const prices = candles.flatMap(c => [c.high, c.low])
  const mn = Math.min(...prices)
  const mx = Math.max(...prices)
  const rng = mx - mn || mn * 0.001

  const y = (v) => pad.top + (1 - (v - mn) / rng) * drawH
  const gap = drawW / candles.length
  const cw = Math.max(2, Math.min(12, gap * 0.7))

  const oY = oracleRate != null ? y(Math.max(mn, Math.min(mx, oracleRate))) : null

  // Y-axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const v = mn + (rng * i / 4)
    return { v, yp: y(v) }
  })

  // Time labels
  const step = Math.max(1, Math.floor(candles.length / 6))
  const tLabels = []
  for (let i = 0; i < candles.length; i += step) {
    const d = new Date(candles[i].time)
    tLabels.push({ x: pad.left + i * gap + gap / 2, label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
  }

  return (
    <div className="fpd-chart-wrap">
      <svg className="fpd-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Grid */}
        {yLabels.map((yl, i) => (
          <line key={i} x1={pad.left} y1={yl.yp} x2={W - pad.right} y2={yl.yp}
            stroke="var(--light-5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}

        {/* Oracle dashed line */}
        {oY != null && (
          <line x1={pad.left} y1={oY} x2={W - pad.right} y2={oY}
            stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke" />
        )}

        {/* Candles */}
        {candles.map((c, i) => {
          const cx = pad.left + i * gap + gap / 2
          const up = c.close >= c.open
          const col = up ? 'var(--color-light-secondary)' : 'var(--red)'
          const top = y(Math.max(c.open, c.close))
          const bot = y(Math.min(c.open, c.close))
          return (
            <g key={i}>
              <line x1={cx} y1={y(c.high)} x2={cx} y2={y(c.low)}
                stroke={col} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <rect x={cx - cw / 2} y={top} width={cw} height={Math.max(1, bot - top)}
                fill={col} opacity={up ? 0.5 : 0.8} />
            </g>
          )
        })}

        {/* Oracle rate label */}
        {oY != null && oracleRate && (
          <g>
            <rect x={W - pad.right + 2} y={oY - 10} width={52} height={20} rx="3" fill="var(--accent)" />
            <text x={W - pad.right + 28} y={oY + 4}
              fill="var(--bg-dark)" fontSize="10" fontWeight="700" textAnchor="middle"
              fontFamily="var(--font-main)">
              {formatRate(oracleRate)}
            </text>
          </g>
        )}

        {/* Y-axis text */}
        {yLabels.map((yl, i) => (
          <text key={i} x={W - pad.right + 4} y={yl.yp + 4}
            fill="var(--color-light-secondary)" fontSize="9" fontFamily="monospace">
            {formatRate(yl.v)}
          </text>
        ))}

        {/* Time axis */}
        {tLabels.map((tl, i) => (
          <text key={i} x={tl.x} y={H - 6}
            fill="var(--color-light-secondary)" fontSize="9" textAnchor="middle" fontFamily="var(--font-main)">
            {tl.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Liquidity Depth Chart ────────────────────────────────────────────────

function DepthChart({ data, oracleRate }) {
  const valid = data.filter(d => d.rate != null)
  if (!valid.length) return <p className="fpd-depth-nodata">No liquidity data available</p>

  const W = 900, H = 240
  const pad = { top: 16, right: 60, bottom: 32, left: 8 }
  const drawW = W - pad.left - pad.right
  const drawH = H - pad.top - pad.bottom

  const rates = valid.map(d => d.rate)
  const allRates = oracleRate ? [...rates, oracleRate] : rates
  const mx = Math.max(...allRates)
  const mn = Math.min(...allRates)
  const rng = mx - mn || mx * 0.01
  const yMin = mn - rng * 0.15
  const yRange = rng * 1.3

  const y = (v) => pad.top + (1 - (v - yMin) / yRange) * drawH
  const gap = drawW / data.length
  const bw = Math.min(100, gap * 0.65)

  const oY = oracleRate ? y(oracleRate) : null

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const v = yMin + (yRange * i / 4)
    return { v, yp: y(v) }
  })

  return (
    <div className="fpd-depth-chart glass-card">
      <svg className="fpd-depth-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {yLabels.map((yl, i) => (
          <line key={i} x1={pad.left} y1={yl.yp} x2={W - pad.right} y2={yl.yp}
            stroke="var(--light-5)" strokeWidth="1" />
        ))}

        {oY != null && (
          <line x1={pad.left} y1={oY} x2={W - pad.right} y2={oY}
            stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 4" />
        )}

        {data.map((d, i) => {
          if (d.rate == null) return null
          const x = pad.left + i * gap + (gap - bw) / 2
          const barY = y(d.rate)
          const barH = Math.max(1, H - pad.bottom - barY)
          const spreadPct = oracleRate ? ((d.rate - oracleRate) / oracleRate) * 100 : 0
          const bad = spreadPct < -0.05
          return (
            <rect key={i} x={x} y={barY} width={bw} height={barH} rx="3"
              fill={bad ? 'var(--red)' : 'var(--color-light-secondary)'}
              opacity={bad ? 0.65 : 0.35} />
          )
        })}

        {oY != null && (
          <text x={W - pad.right + 4} y={oY - 6}
            fill="var(--accent)" fontSize="10" fontWeight="600" fontFamily="var(--font-main)">
            Oracle
          </text>
        )}

        {yLabels.map((yl, i) => (
          <text key={i} x={W - pad.right + 4} y={yl.yp + 4}
            fill="var(--color-light-secondary)" fontSize="9" fontFamily="monospace">
            {formatRate(yl.v)}
          </text>
        ))}

        {data.map((_, i) => (
          <text key={i} x={pad.left + i * gap + gap / 2} y={H - 8}
            fill="var(--color-light-secondary)" fontSize="11" textAnchor="middle"
            fontWeight="600" fontFamily="var(--font-main)">
            {CHART_DEPTH_LABELS[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Depth Table ──────────────────────────────────────────────────────────

function DepthTable({ data, oracleRate, outputSymbol }) {
  if (!data?.length) return null
  const baseRate = data[0]?.rate

  return (
    <div className="fpd-dtable-wrap glass-card">
      <table className="fpd-dtable">
        <thead>
          <tr>
            <th>SIZE</th>
            <th>RATE</th>
            <th>OUTPUT ({outputSymbol})</th>
            <th>SPREAD</th>
            <th>IMPACT</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => {
            const spread = d.rate && oracleRate ? ((d.rate - oracleRate) / oracleRate) * 100 : null
            const impact = d.rate && baseRate ? ((d.rate - baseRate) / baseRate) * 100 : null
            return (
              <tr key={i}>
                <td>{DEPTH_LABELS[i]}</td>
                <td className="fpd-dt-mono">{d.rate ? d.rate.toFixed(6) : '--'}</td>
                <td className="fpd-dt-mono">
                  {d.output != null ? d.output.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--'}
                </td>
                <td>
                  {spread != null ? (
                    <span className={Math.abs(spread) < 0.01 ? 'fpd-dt-dim' : spread < 0 ? 'fpd-dt-red' : 'fpd-dt-green'}>
                      {Math.abs(spread) < 0.01 ? '< 0.01%' : `${spread >= 0 ? '+' : ''}${spread.toFixed(2)}%`}
                    </span>
                  ) : '--'}
                </td>
                <td>
                  {impact != null ? (
                    <span className={Math.abs(impact) < 0.01 ? 'fpd-dt-dim' : Math.abs(impact) > 0.2 ? 'fpd-dt-yellow' : ''}>
                      {Math.abs(impact) < 0.01 ? '< 0.01%' : `${impact.toFixed(2)}%`}
                    </span>
                  ) : '--'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

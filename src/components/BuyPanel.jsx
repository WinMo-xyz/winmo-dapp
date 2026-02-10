import { useState, useEffect } from 'react'
import AssetLogo from './AssetLogo'
import { useSwap } from '../hooks/useSwap'
import { useWallet } from '../context/WalletContext'
import './BuyPanel.css'

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

const PAYMENT_TOKENS = [
  { symbol: 'USDC', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', logo: CI + 'usdt.svg' },
  { symbol: 'ETH', logo: CI + 'eth.svg' },
  { symbol: 'SOL', logo: CI + 'sol.svg' },
]

export default function BuyPanel({ asset }) {
  const [payToken, setPayToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const { isEvmConnected } = useWallet()
  const {
    quote, quoteLoading, quoteError,
    swapStatus, swapError,
    fetchQuote, executeSwap, reset, dstAddress,
  } = useSwap(asset)

  // Fetch 1inch quote on input change
  useEffect(() => {
    if (payToken !== 'SOL') fetchQuote(payToken, amount)
  }, [payToken, amount, fetchQuote])

  if (!asset) return null

  const isSol = payToken === 'SOL'
  const noRoute = !dstAddress
  const isSwapping = swapStatus === 'approving' || swapStatus === 'swapping'

  // Use 1inch quote when available, otherwise price-based estimate
  const outputAmount = quote?.outputHuman
    || (amount && asset.price > 0 ? (parseFloat(amount) / asset.price).toFixed(6) : '0.000000')

  const handleBuy = () => {
    if (swapStatus === 'error') reset()
    if (swapStatus === 'success') { reset(); setAmount(''); return }
    executeSwap(payToken, amount)
  }

  const buttonLabel = () => {
    if (swapStatus === 'approving') return 'Approving...'
    if (swapStatus === 'swapping') return 'Swapping...'
    if (swapStatus === 'success') return 'Swap Successful!'
    if (swapStatus === 'error') return 'Retry'
    if (isSol) return 'SOL swaps coming soon'
    if (!isEvmConnected) return 'Connect EVM wallet'
    if (noRoute) return 'No swap route'
    return `Buy ${asset.symbol}`
  }

  const isDisabled =
    !amount || parseFloat(amount) <= 0 ||
    isSwapping || isSol ||
    (!isEvmConnected && !isSol) ||
    (noRoute && isEvmConnected)

  // Auto-clear success after 3 s
  useEffect(() => {
    if (swapStatus === 'success') {
      const t = setTimeout(() => { reset(); setAmount('') }, 3000)
      return () => clearTimeout(t)
    }
  }, [swapStatus, reset])

  return (
    <div className="buy-panel glass-card">
      <h3 className="buy-panel-title">
        Buy {asset.name}
        <span className="buy-panel-symbol">{asset.symbol}</span>
      </h3>

      <div className="buy-panel-field">
        <label className="buy-panel-label">Pay with</label>
        <div className="buy-panel-token-select">
          {PAYMENT_TOKENS.map((t) => (
            <button
              key={t.symbol}
              className={`buy-panel-token-btn ${payToken === t.symbol ? 'active' : ''}`}
              onClick={() => { setPayToken(t.symbol); reset() }}
            >
              <AssetLogo logo={t.logo} name={t.symbol} size={18} />
              <span>{t.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="buy-panel-field">
        <label className="buy-panel-label">Amount ({payToken})</label>
        <input
          type="number"
          className="buy-panel-input"
          placeholder="0.00"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); if (swapStatus !== 'idle') reset() }}
          min="0"
          step="any"
          disabled={isSwapping}
        />
      </div>

      <div className="buy-panel-output">
        <span className="buy-panel-output-label">
          {quoteLoading ? 'Fetching quote...' : 'You receive'}
        </span>
        <span className="buy-panel-output-value">
          {outputAmount} <span className="buy-panel-output-symbol">{asset.symbol}</span>
        </span>
      </div>

      <div className="buy-panel-price-info">
        <span>Price</span>
        <span>${asset.price.toLocaleString()}</span>
      </div>

      {(swapError || quoteError) && (
        <p className="buy-panel-error">{swapError || quoteError}</p>
      )}

      <button
        className={`btn btn-accent buy-panel-buy-btn ${swapStatus === 'success' ? 'swap-success' : ''}`}
        onClick={handleBuy}
        disabled={isDisabled && swapStatus !== 'success'}
      >
        {buttonLabel()}
      </button>
    </div>
  )
}

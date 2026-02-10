import { useState, useEffect } from 'react'
import AssetLogo from './AssetLogo'
import { useSwap } from '../hooks/useSwap'
import { useWallet } from '../context/WalletContext'
import './BuyModal.css'

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

const PAYMENT_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', name: 'Tether', logo: CI + 'usdt.svg' },
  { symbol: 'ETH', name: 'Ethereum', logo: CI + 'eth.svg' },
  { symbol: 'SOL', name: 'Solana', logo: CI + 'sol.svg' },
]

export default function BuyModal({ asset, onClose }) {
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

  const outputAmount = quote?.outputHuman
    || (amount && asset.price > 0 ? (parseFloat(amount) / asset.price).toFixed(6) : '0.000000')

  const handleBuy = () => {
    if (swapStatus === 'error') reset()
    if (swapStatus === 'success') { onClose(); return }
    executeSwap(payToken, amount)
  }

  const buttonLabel = () => {
    if (swapStatus === 'approving') return 'Approving...'
    if (swapStatus === 'swapping') return 'Swapping...'
    if (swapStatus === 'success') return 'Done!'
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

  // Auto-close on success after 2 s
  useEffect(() => {
    if (swapStatus === 'success') {
      const t = setTimeout(onClose, 2000)
      return () => clearTimeout(t)
    }
  }, [swapStatus, onClose])

  return (
    <div className="modal-overlay" onClick={isSwapping ? undefined : onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        {!isSwapping && (
          <button className="modal-close" onClick={onClose}>&times;</button>
        )}

        <h3 className="modal-title">
          Buy {asset.name}
          <span className="modal-symbol">{asset.symbol}</span>
        </h3>

        <div className="modal-field">
          <label className="modal-label">Pay with</label>
          <div className="modal-token-select">
            {PAYMENT_TOKENS.map((t) => (
              <button
                key={t.symbol}
                className={`modal-token-btn ${payToken === t.symbol ? 'active' : ''}`}
                onClick={() => { setPayToken(t.symbol); reset() }}
                disabled={isSwapping}
              >
                <AssetLogo logo={t.logo} name={t.symbol} size={18} />
                <span>{t.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label">Amount ({payToken})</label>
          <input
            type="number"
            className="modal-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); if (swapStatus !== 'idle') reset() }}
            min="0"
            step="any"
            disabled={isSwapping}
          />
        </div>

        <div className="modal-output">
          <span className="modal-output-label">
            {quoteLoading ? 'Fetching quote...' : 'You receive'}
          </span>
          <span className="modal-output-value">
            {outputAmount} <span className="modal-output-symbol">{asset.symbol}</span>
          </span>
        </div>

        <div className="modal-price-info">
          <span>Price</span>
          <span>${asset.price.toLocaleString()}</span>
        </div>

        {(swapError || quoteError) && (
          <p className="modal-error">{swapError || quoteError}</p>
        )}

        <button
          className={`btn btn-accent modal-buy-btn ${swapStatus === 'success' ? 'swap-success' : ''}`}
          onClick={handleBuy}
          disabled={isDisabled && swapStatus !== 'success'}
        >
          {buttonLabel()}
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import AssetLogo from './AssetLogo'
import { useSwap } from '../hooks/useSwap'
import { useSolanaSwap } from '../hooks/useSolanaSwap'
import { useWallet } from '../context/WalletContext'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { getAssetChains } from '../services/assets'
import './BuyModal.css'

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

const EVM_PAYMENT_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', name: 'Tether', logo: CI + 'usdt.svg' },
  { symbol: 'ETH', name: 'Ethereum', logo: CI + 'eth.svg' },
  { symbol: 'SOL', name: 'Solana', logo: CI + 'sol.svg' },
]

const SOLANA_PAYMENT_TOKENS = [
  { symbol: 'SOL', name: 'Solana', logo: CI + 'sol.svg' },
  { symbol: 'USDC', name: 'USD Coin', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', name: 'Tether', logo: CI + 'usdt.svg' },
]

export default function BuyModal({ asset, onClose }) {
  const { isEvmConnected, isSolanaConnected } = useWallet()
  const { setVisible: openSolanaModal } = useWalletModal()
  const { openConnectModal } = useConnectModal()

  // EVM swap hook (KyberSwap)
  const evmSwap = useSwap(asset)

  // Solana swap hook (Jupiter)
  const solSwap = useSolanaSwap(asset)

  const chains = asset ? getAssetChains(asset) : []
  const hasSolanaRoute = chains.includes('solana')
  const hasEvmRoute = chains.includes('ethereum')

  // Manual override when user clicks "Try on ..." after a swap error
  const [chainOverride, setChainOverride] = useState(null)

  // Prefer Solana (primary), fall back to EVM based on wallet connectivity
  const autoChain =
    (hasSolanaRoute && isSolanaConnected) ? 'solana'
    : (hasEvmRoute && isEvmConnected) ? 'ethereum'
    : hasSolanaRoute ? 'solana'
    : hasEvmRoute ? 'ethereum'
    : null
  const activeChain = chainOverride || autoChain
  const useSolana = activeChain === 'solana'

  // Pick the right swap context
  const swap = useSolana ? solSwap : evmSwap
  const { quote, quoteLoading, quoteError, swapStatus, swapError, fetchQuote, executeSwap, reset } = swap
  const paymentTokens = useSolana ? SOLANA_PAYMENT_TOKENS : EVM_PAYMENT_TOKENS

  // Alternate chain available for fallback
  const alternateChain = useSolana && hasEvmRoute ? 'ethereum'
    : !useSolana && hasSolanaRoute ? 'solana'
    : null

  const [payToken, setPayToken] = useState(paymentTokens[0].symbol)
  const [amount, setAmount] = useState('')

  // Reset override + payToken when asset changes
  useEffect(() => { setChainOverride(null) }, [asset?.id])

  // Reset payToken when chain switches
  useEffect(() => {
    setPayToken(useSolana ? SOLANA_PAYMENT_TOKENS[0].symbol : EVM_PAYMENT_TOKENS[0].symbol)
  }, [useSolana])

  // Fetch quote on input change
  useEffect(() => {
    if (useSolana) {
      fetchQuote(payToken, amount)
    } else if (payToken !== 'SOL') {
      fetchQuote(payToken, amount)
    }
  }, [payToken, amount, fetchQuote, useSolana])

  // Auto-close on success after 2 s
  useEffect(() => {
    if (swapStatus === 'success') {
      const t = setTimeout(onClose, 2000)
      return () => clearTimeout(t)
    }
  }, [swapStatus, onClose])

  if (!asset) return null

  // Not connected to the required chain: show connect prompt
  const needsConnect = (useSolana && !isSolanaConnected) || (!useSolana && !isEvmConnected)
  if (needsConnect) {
    const chainLabel = useSolana ? 'Solana' : 'Ethereum'
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>&times;</button>

          <h3 className="modal-title">
            Buy {asset.name}
            <span className="modal-symbol">{asset.symbol}</span>
          </h3>

          <div className="modal-chain-info">
            <span className="modal-chain-badge">{chainLabel}</span>
            This asset is available on {chainLabel}.
          </div>

          <div className="modal-price-info">
            <span>Price</span>
            <span>${asset.price.toLocaleString()}</span>
          </div>

          <button
            className="btn btn-accent modal-buy-btn"
            onClick={() => useSolana ? openSolanaModal(true) : openConnectModal()}
          >
            Connect {chainLabel} Wallet
          </button>
        </div>
      </div>
    )
  }

  // Shared logic for both chains
  const isSwapping = swapStatus === 'swapping' || swapStatus === 'approving'
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
    if (useSolana) {
      if (!isSolanaConnected) return 'Connect Solana wallet'
      if (!solSwap.outputMint) return 'No swap route'
      return `Buy ${asset.symbol}`
    }
    // EVM
    const isSol = payToken === 'SOL'
    if (isSol) return 'SOL swaps coming soon'
    if (!isEvmConnected) return 'Connect EVM wallet'
    if (!evmSwap.dstAddress) return 'No swap route'
    return `Buy ${asset.symbol}`
  }

  const isDisabled = (() => {
    if (!amount || parseFloat(amount) <= 0 || isSwapping || quoteLoading) return true
    if (useSolana) return !isSolanaConnected || !solSwap.outputMint
    const isSol = payToken === 'SOL'
    if (isSol) return true
    if (!isEvmConnected) return true
    if (!evmSwap.dstAddress && isEvmConnected) return true
    return false
  })()

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
            {paymentTokens.map((t) => (
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

        {(swapError || quoteError) && alternateChain && (
          <button
            className="btn btn-outline modal-buy-btn"
            onClick={() => { setChainOverride(alternateChain); reset() }}
          >
            Try on {alternateChain === 'solana' ? 'Solana' : 'Ethereum'}
          </button>
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

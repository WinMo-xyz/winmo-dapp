import { useState, useEffect } from 'react'
import AssetLogo from './AssetLogo'
import { useSwap } from '../hooks/useSwap'
import { useSolanaSwap } from '../hooks/useSolanaSwap'
import { useEvmAssetBalance, useSolanaAssetBalance, useEvmPaymentBalance, useSolanaPaymentBalance } from '../hooks/useAssetBalance'
import { useWallet } from '../context/WalletContext'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { getAssetChains, getAssetProviders, PROVIDERS } from '../services/assets'
import './BuyPanel.css'

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'
const SOL_LOGO = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'

const EVM_PAYMENT_TOKENS = [
  { symbol: 'USDC', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', logo: CI + 'usdt.svg' },
  { symbol: 'ETH', logo: CI + 'eth.svg' },
  { symbol: 'SOL', logo: SOL_LOGO },
]

const SOLANA_PAYMENT_TOKENS = [
  { symbol: 'SOL', logo: SOL_LOGO },
  { symbol: 'USDC', logo: CI + 'usdc.svg' },
  { symbol: 'USDT', logo: CI + 'usdt.svg' },
]

function estimateReceive(amount, price, isSell) {
  if (!amount || !price || price <= 0) return ''
  const v = parseFloat(amount)
  if (!v || v <= 0) return ''
  return isSell ? (v * price).toFixed(2) : (v / price).toFixed(6)
}

function reverseEstimate(receive, price, isSell) {
  if (!receive || !price || price <= 0) return ''
  const v = parseFloat(receive)
  if (!v || v <= 0) return ''
  return isSell ? (v / price).toString() : (v * price).toString()
}

export default function BuyPanel({ asset }) {
  const [mode, setMode] = useState('buy')
  const isSell = mode === 'sell'

  const { isEvmConnected, isSolanaConnected } = useWallet()
  const { setVisible: openSolanaModal } = useWalletModal()
  const { openConnectModal } = useConnectModal()

  // Provider selection for stocks with multiple RWA providers
  const availableProviders = asset ? getAssetProviders(asset) : []
  const hasProviders = availableProviders.length > 0
  const [selectedProvider, setSelectedProvider] = useState(availableProviders[0] || null)

  // EVM swap hook (KyberSwap)
  const evmProvider = selectedProvider?.chain === 'ethereum' ? selectedProvider : undefined
  const evmSwap = useSwap(asset, mode, evmProvider)

  // Solana swap hook (Jupiter)
  const solProvider = selectedProvider?.chain === 'solana' ? selectedProvider : undefined
  const solSwap = useSolanaSwap(asset, mode, solProvider)

  // Asset balance (for sell mode)
  const evmAssetBal = useEvmAssetBalance(asset)
  const solAssetBal = useSolanaAssetBalance(asset)

  const chains = asset ? getAssetChains(asset) : []
  const hasSolanaRoute = chains.includes('solana')
  const hasEvmRoute = chains.includes('ethereum')

  // Manual override when user clicks "Try on ..." after a swap error
  const [chainOverride, setChainOverride] = useState(null)

  // When provider is selected, its chain determines the active chain
  const providerChain = selectedProvider?.chain || null

  // Prefer Solana (primary), fall back to EVM based on wallet connectivity
  const autoChain =
    (hasSolanaRoute && isSolanaConnected) ? 'solana'
    : (hasEvmRoute && isEvmConnected) ? 'ethereum'
    : hasSolanaRoute ? 'solana'
    : hasEvmRoute ? 'ethereum'
    : null
  const activeChain = hasProviders ? (providerChain || autoChain) : (chainOverride || autoChain)
  const useSolana = activeChain === 'solana'

  // Pick the right swap context
  const swap = useSolana ? solSwap : evmSwap
  const { quote, quoteLoading, quoteError, swapStatus, swapError, fetchQuote, executeSwap, reset } = swap
  const paymentTokens = useSolana ? SOLANA_PAYMENT_TOKENS : EVM_PAYMENT_TOKENS

  // Alternate chain available for fallback (only for non-provider assets)
  const alternateChain = !hasProviders
    ? (useSolana && hasEvmRoute ? 'ethereum' : !useSolana && hasSolanaRoute ? 'solana' : null)
    : null

  const [payToken, setPayToken] = useState(paymentTokens[0].symbol)
  const [amount, setAmount] = useState('')
  const [receive, setReceive] = useState('')

  // Payment token balance (for buy mode) — hooks must be called unconditionally
  const evmPayBal = useEvmPaymentBalance(payToken)
  const solPayBal = useSolanaPaymentBalance(payToken)

  // Active balance: sell mode → asset balance, buy mode → payment token balance
  const activeBalance = isSell
    ? (useSolana ? solAssetBal : evmAssetBal)
    : (useSolana ? solPayBal : evmPayBal)

  // Reset override + provider when asset changes
  useEffect(() => {
    setChainOverride(null)
    const providers = asset ? getAssetProviders(asset) : []
    setSelectedProvider(providers[0] || null)
  }, [asset?.id])

  // Reset payToken when chain switches
  useEffect(() => {
    setPayToken(useSolana ? SOLANA_PAYMENT_TOKENS[0].symbol : EVM_PAYMENT_TOKENS[0].symbol)
  }, [useSolana])

  // Reset state when mode changes
  useEffect(() => {
    setAmount('')
    setReceive('')
    reset()
  }, [mode, reset])

  // Fetch quote on input change
  useEffect(() => {
    if (useSolana) {
      fetchQuote(payToken, amount)
    } else if (payToken !== 'SOL') {
      fetchQuote(payToken, amount)
    }
  }, [payToken, amount, fetchQuote, useSolana])

  // Sync receive from quote
  useEffect(() => {
    if (quote?.outputHuman) {
      setReceive(quote.outputHuman)
    }
  }, [quote?.outputHuman])

  // Auto-clear success after 3 s
  useEffect(() => {
    if (swapStatus === 'success') {
      const t = setTimeout(() => { reset(); setAmount(''); setReceive('') }, 3000)
      return () => clearTimeout(t)
    }
  }, [swapStatus, reset])

  if (!asset) return null

  const actionLabel = isSell ? 'Sell' : 'Buy'
  const outputSymbol = isSell ? payToken : asset.symbol

  // Clamp amount to balance
  const handleAmountChange = (val) => {
    let finalVal = val
    if (activeBalance != null && parseFloat(val) > activeBalance) {
      finalVal = String(activeBalance)
    }
    setAmount(finalVal)
    setReceive(estimateReceive(finalVal, asset.price, isSell))
    if (swapStatus !== 'idle') reset()
  }

  const handleReceiveChange = (val) => {
    setReceive(val)
    let reverseAmt = reverseEstimate(val, asset.price, isSell)
    // Clamp to balance
    if (reverseAmt && activeBalance != null && parseFloat(reverseAmt) > activeBalance) {
      reverseAmt = String(activeBalance)
      setReceive(estimateReceive(reverseAmt, asset.price, isSell))
    }
    setAmount(reverseAmt)
    if (swapStatus !== 'idle') reset()
  }

  const handlePercent = (pct) => {
    if (activeBalance != null && activeBalance > 0) {
      const newAmt = String(activeBalance * pct)
      setAmount(newAmt)
      setReceive(estimateReceive(newAmt, asset.price, isSell))
      if (swapStatus !== 'idle') reset()
    }
  }

  const handleProviderSelect = (p) => {
    setSelectedProvider(p)
    setAmount('')
    setReceive('')
    reset()
  }

  // Format balance for display
  const formatBalance = (bal) => {
    if (bal == null) return '...'
    if (bal === 0) return '0'
    if (bal >= 1) return bal.toLocaleString(undefined, { maximumFractionDigits: 4 })
    return bal.toFixed(6)
  }

  const balanceTokenLabel = isSell ? asset.symbol : payToken

  // Not connected to the required chain: show connect prompt
  const needsConnect = (useSolana && !isSolanaConnected) || (!useSolana && !isEvmConnected)
  if (needsConnect) {
    const chainLabel = useSolana ? 'Solana' : 'Ethereum'
    return (
      <div className="buy-panel glass-card">
        <div className="buy-panel-mode-toggle">
          <button
            className={`buy-panel-mode-btn buy-panel-mode-buy ${mode === 'buy' ? 'active' : ''}`}
            onClick={() => setMode('buy')}
          >
            Buy
          </button>
          <button
            className={`buy-panel-mode-btn buy-panel-mode-sell ${mode === 'sell' ? 'active' : ''}`}
            onClick={() => setMode('sell')}
          >
            Sell
          </button>
        </div>

        <h3 className="buy-panel-title">
          {actionLabel} {asset.name}
          <span className="buy-panel-symbol">{asset.symbol}</span>
        </h3>

        {hasProviders && (
          <div className="buy-panel-field">
            <label className="buy-panel-label">Provider</label>
            <div className="buy-panel-provider-select">
              {availableProviders.map(p => (
                <button
                  key={`${p.provider}-${p.chain}`}
                  className={`buy-panel-provider-btn ${selectedProvider?.provider === p.provider && selectedProvider?.chain === p.chain ? 'active' : ''}`}
                  onClick={() => handleProviderSelect(p)}
                >
                  <img src={PROVIDERS[p.provider].logo} alt={PROVIDERS[p.provider].name} width={20} height={20} />
                  <div className="buy-panel-provider-info">
                    <span className="buy-panel-provider-name">{PROVIDERS[p.provider].name}</span>
                    <span className="buy-panel-provider-chain">{p.chain}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="buy-panel-chain-info">
          <span className="buy-panel-chain-badge">{chainLabel}</span>
          This asset is available on {chainLabel}.
        </div>

        <div className="buy-panel-price-info">
          <span>Price</span>
          <span>${asset.price.toLocaleString()}</span>
        </div>

        <button
          className="btn btn-accent buy-panel-buy-btn"
          onClick={() => useSolana ? openSolanaModal(true) : openConnectModal()}
        >
          Connect {chainLabel} Wallet
        </button>
      </div>
    )
  }

  // Shared logic for both chains
  const isSwapping = swapStatus === 'swapping' || swapStatus === 'approving'

  const handleAction = () => {
    if (swapStatus === 'error') reset()
    if (swapStatus === 'success') { reset(); setAmount(''); setReceive(''); return }
    executeSwap(payToken, amount)
  }

  const buttonLabel = () => {
    if (swapStatus === 'approving') return 'Approving...'
    if (swapStatus === 'swapping') return 'Swapping...'
    if (swapStatus === 'success') return 'Swap Successful!'
    if (swapStatus === 'error') return 'Retry'
    if (activeBalance != null && activeBalance <= 0) return 'No balance'
    if (useSolana) {
      if (!isSolanaConnected) return 'Connect Solana wallet'
      if (!solSwap.outputMint) return 'No swap route'
      return `${actionLabel} ${asset.symbol}`
    }
    // EVM
    const isSol = payToken === 'SOL'
    if (isSol) return 'SOL swaps coming soon'
    if (!isEvmConnected) return 'Connect EVM wallet'
    if (!evmSwap.dstAddress) return 'No swap route'
    return `${actionLabel} ${asset.symbol}`
  }

  const isDisabled = (() => {
    if (!amount || parseFloat(amount) <= 0 || isSwapping || quoteLoading) return true
    if (activeBalance != null && parseFloat(amount) > activeBalance) return true
    if (activeBalance != null && activeBalance <= 0) return true
    if (useSolana) return !isSolanaConnected || !solSwap.outputMint
    const isSol = payToken === 'SOL'
    if (isSol) return true
    if (!isEvmConnected) return true
    if (!evmSwap.dstAddress && isEvmConnected) return true
    return false
  })()

  return (
    <div className="buy-panel glass-card">
      <div className="buy-panel-mode-toggle">
        <button
          className={`buy-panel-mode-btn buy-panel-mode-buy ${mode === 'buy' ? 'active' : ''}`}
          onClick={() => setMode('buy')}
          disabled={isSwapping}
        >
          Buy
        </button>
        <button
          className={`buy-panel-mode-btn buy-panel-mode-sell ${mode === 'sell' ? 'active' : ''}`}
          onClick={() => setMode('sell')}
          disabled={isSwapping}
        >
          Sell
        </button>
      </div>

      <h3 className="buy-panel-title">
        {actionLabel} {asset.name}
        <span className="buy-panel-symbol">{asset.symbol}</span>
      </h3>

      {hasProviders && (
        <div className="buy-panel-field">
          <label className="buy-panel-label">Provider</label>
          <div className="buy-panel-provider-select">
            {availableProviders.map(p => (
              <button
                key={p.provider}
                className={`buy-panel-provider-btn ${selectedProvider?.provider === p.provider ? 'active' : ''}`}
                onClick={() => handleProviderSelect(p)}
                disabled={isSwapping}
              >
                <img src={PROVIDERS[p.provider].logo} alt={PROVIDERS[p.provider].name} width={20} height={20} />
                <div className="buy-panel-provider-info">
                  <span className="buy-panel-provider-name">{PROVIDERS[p.provider].name}</span>
                  <span className="buy-panel-provider-chain">{p.chain}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="buy-panel-field">
        <label className="buy-panel-label">{isSell ? 'Receive in' : 'Pay with'}</label>
        <div className="buy-panel-token-select">
          {paymentTokens.map((t) => (
            <button
              key={t.symbol}
              className={`buy-panel-token-btn ${payToken === t.symbol ? 'active' : ''}`}
              onClick={() => { setPayToken(t.symbol); reset() }}
              disabled={isSwapping}
            >
              <AssetLogo logo={t.logo} name={t.symbol} size={18} />
              <span>{t.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="buy-panel-field">
        <div className="buy-panel-label-row">
          <label className="buy-panel-label">
            Amount ({isSell ? asset.symbol : payToken})
          </label>
          <span className="buy-panel-balance">
            Bal: {formatBalance(activeBalance)} {balanceTokenLabel}
          </span>
        </div>
        <input
          type="number"
          className="buy-panel-input"
          placeholder="0.00"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          min="0"
          max={activeBalance != null ? activeBalance : undefined}
          step="any"
          disabled={isSwapping}
        />
        <div className="buy-panel-pct-row">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              className="buy-panel-pct-btn"
              onClick={() => handlePercent(pct)}
              disabled={isSwapping || !activeBalance}
            >
              {pct === 1 ? 'Max' : `${pct * 100}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="buy-panel-output">
        <span className="buy-panel-output-label">
          {quoteLoading ? 'Fetching quote...' : 'You receive'}
        </span>
        <div className="buy-panel-output-input-wrap">
          <input
            type="number"
            className="buy-panel-output-input"
            placeholder="0.00"
            value={receive}
            onChange={(e) => handleReceiveChange(e.target.value)}
            min="0"
            step="any"
            disabled={isSwapping}
          />
          <span className="buy-panel-output-symbol">{outputSymbol}</span>
        </div>
      </div>

      <div className="buy-panel-price-info">
        <span>Price</span>
        <span>${asset.price.toLocaleString()}</span>
      </div>

      {(swapError || quoteError) && (
        <p className="buy-panel-error">{swapError || quoteError}</p>
      )}

      {(swapError || quoteError) && alternateChain && (
        <button
          className="btn btn-outline buy-panel-buy-btn"
          onClick={() => { setChainOverride(alternateChain); reset() }}
        >
          Try on {alternateChain === 'solana' ? 'Solana' : 'Ethereum'}
        </button>
      )}

      <button
        className={`btn ${isSell ? 'btn-sell' : 'btn-buy'} buy-panel-buy-btn ${swapStatus === 'success' ? 'swap-success' : ''}`}
        onClick={handleAction}
        disabled={isDisabled && swapStatus !== 'success'}
      >
        {buttonLabel()}
      </button>
    </div>
  )
}

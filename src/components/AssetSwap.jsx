import { useState, useEffect, useMemo, useCallback } from 'react'
// Solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
// Ethereum
import { useAccount, useSendTransaction } from 'wagmi'
import { readContract, waitForTransactionReceipt, getBalance } from '@wagmi/core'
import { encodeFunctionData, maxUint256 } from 'viem'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { config } from '../config/wagmi'
// Services
import {
  getQuote, getSwapTransaction,
  toSmallestUnit, fromSmallestUnit,
  SOLANA_PAYMENT_META,
} from '../services/jupiterApi'
import {
  getRouteRaw, buildRoute,
  toSmallestUnit as evmToSmallest, fromSmallestUnit as evmFromSmallest,
  NATIVE_ETH,
} from '../services/kyberswapApi'
import { getSwappableTokens } from '../services/assets'
import './AssetSwap.css'

const approveAbi = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
]

const balanceOfAbi = [{
  name: 'balanceOf',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}]

function saveHistory(entry) {
  try {
    const history = JSON.parse(localStorage.getItem('assetSwapHistory') || '[]')
    history.unshift(entry)
    localStorage.setItem('assetSwapHistory', JSON.stringify(history.slice(0, 50)))
  } catch { /* ignore */ }
}

export default function AssetSwap({ category }) {
  const [chain, setChain] = useState('solana')
  const [fromAddr, setFromAddr] = useState('')
  const [toAddr, setToAddr] = useState('')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(null)

  // Solana wallet
  const { publicKey, signTransaction, connected: solConnected } = useWallet()
  const { connection } = useConnection()
  const { setVisible: openSolanaModal } = useWalletModal()

  // EVM wallet
  const { address: evmAddress, isConnected: evmConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const { openConnectModal } = useConnectModal()

  // Token lists
  const tokens = useMemo(() => getSwappableTokens(category, chain), [category, chain])
  const hasSolana = useMemo(() => getSwappableTokens(category, 'solana').length > 0, [category])
  const hasEthereum = useMemo(() => getSwappableTokens(category, 'ethereum').length > 0, [category])

  // Reset selections on chain/category change
  useEffect(() => {
    const tkns = getSwappableTokens(category, chain)
    setFromAddr(tkns.length >= 1 ? tkns[0].address : '')
    setToAddr(tkns.length >= 2 ? tkns[1].address : '')
    setFromAmount('')
    setToAmount('')
    setQuote(null)
    setError(null)
    setStatus('idle')
    setBalance(null)
  }, [chain, category])

  // Default to a chain that has tokens
  useEffect(() => {
    const solTkns = getSwappableTokens(category, 'solana')
    setChain(solTkns.length > 0 ? 'solana' : 'ethereum')
  }, [category])

  const fromToken = useMemo(() => tokens.find(t => t.address === fromAddr), [tokens, fromAddr])
  const toToken = useMemo(() => tokens.find(t => t.address === toAddr), [tokens, toAddr])

  const isConnected = chain === 'solana' ? solConnected : evmConnected
  const isSwapping = status === 'swapping' || status === 'approving'

  // DEX rate
  const dexRate = useMemo(() => {
    if (!toAmount || !fromAmount || parseFloat(fromAmount) <= 0) return null
    return parseFloat(toAmount) / parseFloat(fromAmount)
  }, [toAmount, fromAmount])

  // ── Fetch quote (debounced 500ms) ──
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
      setQuote(null)
      setToAmount('')
      return
    }

    setQuoteLoading(true)
    const timer = setTimeout(async () => {
      try {
        if (chain === 'solana') {
          const amountRaw = toSmallestUnit(fromAmount, fromToken.decimals)
          const q = await getQuote(fromToken.address, toToken.address, amountRaw)
          setQuote(q)
          setToAmount(fromSmallestUnit(q.outAmount, toToken.decimals))
        } else {
          const amountRaw = evmToSmallest(fromAmount, fromToken.decimals)
          const data = await getRouteRaw(fromToken.address, toToken.address, amountRaw)
          setQuote(data)
          setToAmount(evmFromSmallest(data.routeSummary.amountOut, toToken.decimals))
        }
      } catch {
        setQuote(null)
        setToAmount('')
      } finally {
        setQuoteLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [fromAmount, fromAddr, toAddr, chain])

  // ── Fetch balance ──
  useEffect(() => {
    if (!fromToken) { setBalance(null); return }

    if (chain === 'solana') {
      if (!publicKey) { setBalance(null); return }
      let cancelled = false
      ;(async () => {
        try {
          if (fromToken.address === SOLANA_PAYMENT_META.SOL.mint) {
            const bal = await connection.getBalance(publicKey)
            if (!cancelled) setBalance(bal / 1e9)
          } else {
            const mint = new PublicKey(fromToken.address)
            const ata = await getAssociatedTokenAddress(mint, publicKey)
            const info = await connection.getTokenAccountBalance(ata)
            if (!cancelled) setBalance(parseFloat(info.value.uiAmountString))
          }
        } catch {
          if (!cancelled) setBalance(0)
        }
      })()
      return () => { cancelled = true }
    } else {
      if (!evmAddress) { setBalance(null); return }
      let cancelled = false
      ;(async () => {
        try {
          if (fromToken.address.toLowerCase() === NATIVE_ETH.toLowerCase()) {
            const bal = await getBalance(config, { address: evmAddress })
            if (!cancelled) setBalance(Number(bal.formatted))
          } else {
            const raw = await readContract(config, {
              address: fromToken.address,
              abi: balanceOfAbi,
              functionName: 'balanceOf',
              args: [evmAddress],
            })
            if (!cancelled) setBalance(Number(evmFromSmallest(raw.toString(), fromToken.decimals)))
          }
        } catch {
          if (!cancelled) setBalance(0)
        }
      })()
      return () => { cancelled = true }
    }
  }, [chain, fromAddr, publicKey, evmAddress, connection])

  // ── Flip ──
  const handleFlip = () => {
    setFromAddr(toAddr)
    setToAddr(fromAddr)
    setFromAmount('')
    setToAmount('')
    setQuote(null)
    setError(null)
  }

  // ── Swap execution ──
  const handleSwap = useCallback(async () => {
    if (chain === 'solana') {
      if (!solConnected || !publicKey) { openSolanaModal(true); return }
      if (!quote || !fromAmount || parseFloat(fromAmount) <= 0) return

      setStatus('swapping')
      setError(null)

      try {
        const amountRaw = toSmallestUnit(fromAmount, fromToken.decimals)
        const quoteResponse = await getQuote(fromToken.address, toToken.address, amountRaw)
        const { swapTransaction } = await getSwapTransaction(quoteResponse, publicKey)

        const txBuf = Buffer.from(swapTransaction, 'base64')
        const tx = VersionedTransaction.deserialize(txBuf)
        const signedTx = await signTransaction(tx)

        const sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false, maxRetries: 2,
        })
        await connection.confirmTransaction(sig, 'confirmed')

        saveHistory({
          from: fromToken.symbol, to: toToken.symbol,
          fromAmount, toAmount, chain: 'solana', sig, time: Date.now(),
        })

        setStatus('success')
        setTimeout(() => { setStatus('idle'); setFromAmount(''); setToAmount(''); setQuote(null) }, 3000)
      } catch (err) {
        setError(err.message || 'Swap failed')
        setStatus('error')
      }
    } else {
      // Ethereum via KyberSwap
      if (!evmConnected || !evmAddress) { openConnectModal?.(); return }
      if (!quote || !fromAmount || parseFloat(fromAmount) <= 0) return

      setStatus('approving')
      setError(null)

      try {
        const isNativeEth = fromToken.address.toLowerCase() === NATIVE_ETH.toLowerCase()
        const { routerAddress } = quote

        // 1. Approve ERC-20 (skip for native ETH)
        if (!isNativeEth) {
          const needed = BigInt(evmToSmallest(fromAmount, fromToken.decimals))
          let allowance = 0n
          try {
            allowance = await readContract(config, {
              address: fromToken.address,
              abi: approveAbi,
              functionName: 'allowance',
              args: [evmAddress, routerAddress],
            })
          } catch { /* treat as 0 */ }

          if (allowance < needed) {
            const data = encodeFunctionData({
              abi: approveAbi,
              functionName: 'approve',
              args: [routerAddress, maxUint256],
            })
            const appHash = await sendTransactionAsync({ to: fromToken.address, data })
            await waitForTransactionReceipt(config, { hash: appHash })
          }
        }

        // 2. Fresh route
        setStatus('swapping')
        const amountRaw = evmToSmallest(fromAmount, fromToken.decimals)
        const freshRoute = await getRouteRaw(fromToken.address, toToken.address, amountRaw)
        const freshSummary = freshRoute.routeSummary

        // 3. Build & execute swap
        const built = await buildRoute(freshSummary, evmAddress, 100)
        const gasLimit = built.gas ? BigInt(Math.ceil(Number(built.gas) * 1.2)) : undefined

        const swapHash = await sendTransactionAsync({
          to: built.routerAddress,
          data: built.data,
          value: BigInt(built.transactionValue || '0'),
          gas: gasLimit,
        })
        await waitForTransactionReceipt(config, { hash: swapHash })

        saveHistory({
          from: fromToken.symbol, to: toToken.symbol,
          fromAmount, toAmount, chain: 'ethereum', hash: swapHash, time: Date.now(),
        })

        setStatus('success')
        setTimeout(() => { setStatus('idle'); setFromAmount(''); setToAmount(''); setQuote(null) }, 3000)
      } catch (err) {
        const msg = err.shortMessage || err.message || 'Swap failed'
        setError(msg.includes('Missing or invalid parameters')
          ? 'Swap transaction reverted — insufficient balance' : msg)
        setStatus('error')
      }
    }
  }, [chain, solConnected, publicKey, evmConnected, evmAddress, quote, fromAmount,
    fromToken, toToken, toAmount, signTransaction, connection, openSolanaModal,
    openConnectModal, sendTransactionAsync])

  // ── History ──
  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('assetSwapHistory') || '[]') }
    catch { return [] }
  }, [status])

  const formatBal = (b) => b == null ? '...' : b === 0 ? '0' : b >= 1 ? b.toFixed(4) : b.toFixed(6)

  return (
    <div className="asset-swap-wrap">
      {/* Chain toggle */}
      {hasSolana && hasEthereum && (
        <div className="asset-swap-chain-toggle">
          <button
            className={`asset-swap-chain-btn ${chain === 'solana' ? 'active solana' : ''}`}
            onClick={() => setChain('solana')}
            disabled={isSwapping}
          >
            Solana
          </button>
          <button
            className={`asset-swap-chain-btn ${chain === 'ethereum' ? 'active ethereum' : ''}`}
            onClick={() => setChain('ethereum')}
            disabled={isSwapping}
          >
            Ethereum
          </button>
        </div>
      )}

      <div className="asset-swap-card glass-card">
        {/* From */}
        <div className="asset-swap-field">
          <label className="asset-swap-label">From</label>
          <div className="asset-swap-input-row">
            <select
              className="asset-swap-select"
              value={fromAddr}
              onChange={(e) => { setFromAddr(e.target.value); setFromAmount(''); setQuote(null); setError(null) }}
              disabled={isSwapping}
            >
              {tokens.map(t => (
                <option key={t.address} value={t.address}>{t.symbol}</option>
              ))}
            </select>
            <input
              type="number"
              className="asset-swap-input"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => { setFromAmount(e.target.value); if (status !== 'idle') setStatus('idle') }}
              min="0"
              step="any"
              disabled={isSwapping}
            />
          </div>
          {isConnected && (
            <div className="asset-swap-balance">
              Balance: {formatBal(balance)} {fromToken?.symbol}
              {balance > 0 && (
                <button className="asset-swap-max-btn" onClick={() => setFromAmount(String(balance))} disabled={isSwapping}>
                  Max
                </button>
              )}
            </div>
          )}
          {isConnected && balance != null && fromAmount && parseFloat(fromAmount) > balance && (
            <p className="asset-swap-error">Insufficient balance. Value must be less than {formatBal(balance)} {fromToken?.symbol}.</p>
          )}
        </div>

        {/* Flip */}
        <div className="asset-swap-flip">
          <button className="asset-swap-flip-btn" onClick={handleFlip} disabled={isSwapping}>
            &#8597;
          </button>
        </div>

        {/* To */}
        <div className="asset-swap-field">
          <label className="asset-swap-label">To</label>
          <div className="asset-swap-input-row">
            <select
              className="asset-swap-select"
              value={toAddr}
              onChange={(e) => { setToAddr(e.target.value); setToAmount(''); setQuote(null); setError(null) }}
              disabled={isSwapping}
            >
              {tokens.map(t => (
                <option key={t.address} value={t.address}>{t.symbol}</option>
              ))}
            </select>
            <input
              type="number"
              className="asset-swap-input"
              placeholder="0.00"
              value={toAmount}
              readOnly
            />
          </div>
        </div>

        {/* Rate */}
        {dexRate != null && (
          <div className="asset-swap-rates">
            <div className="asset-swap-rate-row">
              <span className="asset-swap-rate-label">DEX Rate</span>
              <span className="asset-swap-rate-value">
                1 {fromToken?.symbol} = {dexRate >= 1 ? dexRate.toFixed(4) : dexRate.toFixed(6)} {toToken?.symbol}
              </span>
            </div>
          </div>
        )}

        {quoteLoading && <p className="asset-swap-quoting">Fetching quote...</p>}
        {error && <p className="asset-swap-error">{error}</p>}

        {/* Swap button */}
        <button
          className={`btn btn-accent asset-swap-btn ${status === 'success' ? 'swap-success' : ''}`}
          onClick={handleSwap}
          disabled={isSwapping || quoteLoading || (isConnected && (!quote || !fromAmount || parseFloat(fromAmount) <= 0))}
        >
          {chain === 'solana' && !solConnected ? 'Connect Solana Wallet'
            : chain === 'ethereum' && !evmConnected ? 'Connect Ethereum Wallet'
            : status === 'approving' ? 'Approving...'
            : isSwapping ? 'Swapping...'
            : status === 'success' ? 'Done!'
            : status === 'error' ? 'Retry'
            : quoteLoading ? 'Getting Quote...'
            : `Swap ${fromToken?.symbol || ''} \u2192 ${toToken?.symbol || ''}`}
        </button>

        <p className="asset-swap-powered">
          {chain === 'solana' ? 'Powered by Jupiter' : 'Powered by KyberSwap'}
        </p>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="asset-swap-history">
          <h3>Recent Trades</h3>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} className="asset-swap-history-item">
              <span>{h.fromAmount} {h.from} &rarr; {h.toAmount} {h.to}</span>
              <a
                className="asset-swap-history-link"
                href={h.chain === 'solana'
                  ? `https://solscan.io/tx/${h.sig}`
                  : `https://etherscan.io/tx/${h.hash}`}
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

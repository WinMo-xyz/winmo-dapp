import { useState, useCallback, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import {
  getQuote,
  getSwapTransaction,
  resolveSolanaMint,
  getSplDecimals,
  toSmallestUnit,
  fromSmallestUnit,
  SOLANA_PAYMENT_META,
} from '../services/jupiterApi'

/**
 * Hook that manages Jupiter swap lifecycle: quotes and execution on Solana.
 * Mirrors the useSwap hook interface for consistency.
 */
export function useSolanaSwap(asset) {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const [swapStatus, setSwapStatus] = useState('idle') // idle | swapping | success | error
  const [swapError, setSwapError] = useState(null)
  const debounceRef = useRef(null)

  const outputMint = resolveSolanaMint(asset)

  // ── Quote ──────────────────────────────────────────────

  const fetchQuote = useCallback((srcSymbol, amount) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const payMeta = SOLANA_PAYMENT_META[srcSymbol]
    if (!amount || parseFloat(amount) <= 0 || !payMeta || !outputMint) {
      setQuote(null)
      setQuoteError(null)
      setQuoteLoading(false)
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    const amountRaw = toSmallestUnit(amount, payMeta.decimals)

    debounceRef.current = setTimeout(async () => {
      try {
        const q = await getQuote(payMeta.mint, outputMint, amountRaw)
        const outDecimals = getSplDecimals(outputMint)
        setQuote({
          ...q,
          outputHuman: fromSmallestUnit(q.outAmount, outDecimals),
        })
      } catch (e) {
        setQuote(null)
        setQuoteError(e.message)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
  }, [outputMint])

  // ── Swap execution ─────────────────────────────────────

  const executeSwap = useCallback(async (srcSymbol, amount) => {
    if (!publicKey) {
      setSwapError('Connect a Solana wallet first')
      setSwapStatus('error')
      return
    }
    if (!outputMint) {
      setSwapError('No Solana swap route for this asset')
      setSwapStatus('error')
      return
    }

    setSwapError(null)
    setSwapStatus('swapping')

    try {
      const payMeta = SOLANA_PAYMENT_META[srcSymbol]
      const amountRaw = toSmallestUnit(amount, payMeta.decimals)

      // 1. Get fresh quote
      const quoteResponse = await getQuote(payMeta.mint, outputMint, amountRaw)

      // 2. Get serialized swap transaction
      const { swapTransaction } = await getSwapTransaction(quoteResponse, publicKey)

      // 3. Deserialize & sign
      const txBuf = Buffer.from(swapTransaction, 'base64')
      const tx = VersionedTransaction.deserialize(txBuf)
      const signedTx = await signTransaction(tx)

      // 4. Send
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 2,
      })

      // 5. Confirm
      await connection.confirmTransaction(sig, 'confirmed')

      setSwapStatus('success')
    } catch (e) {
      setSwapError(e.message || 'Swap failed')
      setSwapStatus('error')
    }
  }, [publicKey, outputMint, signTransaction, connection])

  // ── Reset ──────────────────────────────────────────────

  const reset = useCallback(() => {
    setSwapStatus('idle')
    setSwapError(null)
  }, [])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return {
    quote,
    quoteLoading,
    quoteError,
    swapStatus,
    swapError,
    fetchQuote,
    executeSwap,
    reset,
    outputMint,
  }
}

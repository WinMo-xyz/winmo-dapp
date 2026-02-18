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
 * @param {object} asset — the target asset (from assets.js)
 * @param {'buy'|'sell'} mode — 'buy' swaps payment→asset, 'sell' swaps asset→payment
 */
export function useSolanaSwap(asset, mode = 'buy', provider) {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const [swapStatus, setSwapStatus] = useState('idle') // idle | swapping | success | error
  const [swapError, setSwapError] = useState(null)
  const debounceRef = useRef(null)

  const isSell = mode === 'sell'
  const assetMint = resolveSolanaMint(asset, provider)
  const assetDecimals = provider?.decimals ?? (assetMint ? getSplDecimals(assetMint) : 6)

  // ── Quote ──────────────────────────────────────────────

  const fetchQuote = useCallback((tokenSymbol, amount) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const payMeta = SOLANA_PAYMENT_META[tokenSymbol]
    if (!amount || parseFloat(amount) <= 0 || !payMeta || !assetMint) {
      setQuote(null)
      setQuoteError(null)
      setQuoteLoading(false)
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        let q
        if (isSell) {
          // Sell: asset → payment token
          const amountRaw = toSmallestUnit(amount, assetDecimals)
          q = await getQuote(assetMint, payMeta.mint, amountRaw)
          const outDecimals = payMeta.decimals
          setQuote({
            ...q,
            outputHuman: fromSmallestUnit(q.outAmount, outDecimals),
          })
        } else {
          // Buy: payment token → asset
          const amountRaw = toSmallestUnit(amount, payMeta.decimals)
          q = await getQuote(payMeta.mint, assetMint, amountRaw)
          const outDecimals = assetDecimals
          setQuote({
            ...q,
            outputHuman: fromSmallestUnit(q.outAmount, outDecimals),
          })
        }
      } catch (e) {
        setQuote(null)
        setQuoteError(e.message)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
  }, [assetMint, assetDecimals, isSell])

  // ── Swap execution ─────────────────────────────────────

  const executeSwap = useCallback(async (tokenSymbol, amount) => {
    if (!publicKey) {
      setSwapError('Connect a Solana wallet first')
      setSwapStatus('error')
      return
    }
    if (!assetMint) {
      setSwapError('No Solana swap route for this asset')
      setSwapStatus('error')
      return
    }

    setSwapError(null)
    setSwapStatus('swapping')

    try {
      const payMeta = SOLANA_PAYMENT_META[tokenSymbol]
      let quoteResponse

      if (isSell) {
        // Sell: asset → payment token
        const amountRaw = toSmallestUnit(amount, assetDecimals)
        quoteResponse = await getQuote(assetMint, payMeta.mint, amountRaw)
      } else {
        // Buy: payment token → asset
        const amountRaw = toSmallestUnit(amount, payMeta.decimals)
        quoteResponse = await getQuote(payMeta.mint, assetMint, amountRaw)
      }

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
  }, [publicKey, assetMint, assetDecimals, isSell, signTransaction, connection])

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
    outputMint: assetMint,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSendTransaction } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../config/wagmi'
import { useWallet } from '../context/WalletContext'
import {
  getQuote,
  getSwapTx,
  getAllowance,
  getApprovalTx,
  resolveTokenAddress,
  fromSmallestUnit,
  toSmallestUnit,
  PAYMENT_TOKEN_META,
} from '../services/oneInchApi'

/**
 * Hook that manages 1inch swap lifecycle: quotes, approvals, and execution.
 * @param {object} asset — the destination asset (from assets.js)
 */
export function useSwap(asset) {
  const { evmAddress } = useWallet()
  const { sendTransactionAsync } = useSendTransaction()

  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const [swapStatus, setSwapStatus] = useState('idle') // idle | approving | swapping | success | error
  const [swapError, setSwapError] = useState(null)
  const debounceRef = useRef(null)

  const dstAddress = resolveTokenAddress(asset)

  // ── Quote ──────────────────────────────────────────────

  const fetchQuote = useCallback((srcSymbol, amount) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!amount || parseFloat(amount) <= 0 || !dstAddress || !PAYMENT_TOKEN_META[srcSymbol]) {
      setQuote(null)
      setQuoteError(null)
      setQuoteLoading(false)
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const q = await getQuote(srcSymbol, dstAddress, amount)
        const decimals = q.dstToken?.decimals ?? 18
        setQuote({
          ...q,
          outputHuman: fromSmallestUnit(q.dstAmount, decimals),
        })
      } catch (e) {
        setQuote(null)
        setQuoteError(e.message)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
  }, [dstAddress])

  // ── Swap execution ─────────────────────────────────────

  const executeSwap = useCallback(async (srcSymbol, amount, slippage = 1) => {
    if (!evmAddress) {
      setSwapError('Connect an EVM wallet first')
      setSwapStatus('error')
      return
    }
    if (!dstAddress) {
      setSwapError('This asset has no on-chain swap route')
      setSwapStatus('error')
      return
    }

    setSwapError(null)
    setSwapStatus('approving')

    try {
      const meta = PAYMENT_TOKEN_META[srcSymbol]

      // 1. Approve (ERC-20 only, skip for native ETH)
      if (srcSymbol !== 'ETH') {
        const { allowance } = await getAllowance(meta.address, evmAddress)
        const needed = toSmallestUnit(amount, meta.decimals)

        if (BigInt(allowance) < BigInt(needed)) {
          const appTx = await getApprovalTx(meta.address)
          const appHash = await sendTransactionAsync({
            to: appTx.to,
            data: appTx.data,
            value: BigInt(appTx.value || 0),
          })
          await waitForTransactionReceipt(config, { hash: appHash })
        }
      }

      // 2. Swap
      setSwapStatus('swapping')
      const swap = await getSwapTx(srcSymbol, dstAddress, amount, evmAddress, slippage)
      const swapHash = await sendTransactionAsync({
        to: swap.tx.to,
        data: swap.tx.data,
        value: BigInt(swap.tx.value || 0),
        gas: swap.tx.gas ? BigInt(swap.tx.gas) : undefined,
      })
      await waitForTransactionReceipt(config, { hash: swapHash })

      setSwapStatus('success')
    } catch (e) {
      setSwapError(e.shortMessage || e.message || 'Swap failed')
      setSwapStatus('error')
    }
  }, [evmAddress, dstAddress, sendTransactionAsync])

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
    dstAddress,
  }
}

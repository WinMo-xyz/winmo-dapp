import { useState, useEffect, useCallback, useRef } from 'react'
import { useSendTransaction } from 'wagmi'
import { readContract, waitForTransactionReceipt } from '@wagmi/core'
import { encodeFunctionData, maxUint256 } from 'viem'
import { config } from '../config/wagmi'
import { useWallet } from '../context/WalletContext'
import {
  getRoute,
  buildRoute,
  resolveTokenAddress,
  getTokenDecimals,
  fromSmallestUnit,
  toSmallestUnit,
  PAYMENT_TOKEN_META,
} from '../services/kyberswapApi'

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

/**
 * Hook that manages KyberSwap swap lifecycle: quotes, approvals, and execution.
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
  const routeRef = useRef(null) // stores routeSummary + routerAddress for executeSwap

  const dstAddress = resolveTokenAddress(asset)
  const dstDecimals = getTokenDecimals(dstAddress)

  // ── Quote ──────────────────────────────────────────────

  const fetchQuote = useCallback((srcSymbol, amount) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!amount || parseFloat(amount) <= 0 || !dstAddress || !PAYMENT_TOKEN_META[srcSymbol]) {
      setQuote(null)
      setQuoteError(null)
      setQuoteLoading(false)
      routeRef.current = null
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const route = await getRoute(srcSymbol, dstAddress, amount)
        const { routeSummary, routerAddress } = route
        routeRef.current = { routeSummary, routerAddress }

        setQuote({
          routeSummary,
          routerAddress,
          dstAmount: routeSummary.amountOut,
          outputHuman: fromSmallestUnit(routeSummary.amountOut, dstDecimals),
        })
      } catch (e) {
        setQuote(null)
        routeRef.current = null
        setQuoteError(e.message)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
  }, [dstAddress, dstDecimals])

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
    if (!routeRef.current) {
      setSwapError('Fetch a quote first')
      setSwapStatus('error')
      return
    }

    setSwapError(null)
    setSwapStatus('approving')

    try {
      const { routerAddress } = routeRef.current
      const meta = PAYMENT_TOKEN_META[srcSymbol]

      // 1. Approve (ERC-20 only, skip for native ETH)
      if (srcSymbol !== 'ETH') {
        const needed = BigInt(toSmallestUnit(amount, meta.decimals))

        // Check existing allowance; if the RPC call fails, assume zero and approve
        let allowance = 0n
        try {
          allowance = await readContract(config, {
            address: meta.address,
            abi: approveAbi,
            functionName: 'allowance',
            args: [evmAddress, routerAddress],
          })
        } catch {
          // RPC error — proceed with approval to be safe
        }

        if (allowance < needed) {
          const data = encodeFunctionData({
            abi: approveAbi,
            functionName: 'approve',
            args: [routerAddress, maxUint256],
          })
          const appHash = await sendTransactionAsync({
            to: meta.address,
            data,
          })
          await waitForTransactionReceipt(config, { hash: appHash })
        }
      }

      // 2. Re-fetch a fresh route (the original route expires in ~10s and
      //    the approval step above may have taken much longer)
      setSwapStatus('swapping')
      const freshRoute = await getRoute(srcSymbol, dstAddress, amount)
      const freshSummary = freshRoute.routeSummary

      // 3. Build & execute swap
      const slippageBps = Math.round(slippage * 100) // convert percentage to bps
      const built = await buildRoute(freshSummary, evmAddress, slippageBps)

      // Use KyberSwap's gas estimate + 20% buffer for complex routes
      const gasLimit = built.gas ? BigInt(Math.ceil(Number(built.gas) * 1.2)) : undefined

      const swapHash = await sendTransactionAsync({
        to: built.routerAddress,
        data: built.data,
        value: BigInt(built.transactionValue || '0'),
        gas: gasLimit,
      })
      await waitForTransactionReceipt(config, { hash: swapHash })

      setSwapStatus('success')
    } catch (e) {
      // Provide a friendlier message for common RPC errors
      const msg = e.shortMessage || e.message || 'Swap failed'
      if (msg.includes('Missing or invalid parameters')) {
        setSwapError('Swap transaction reverted — you may have insufficient token balance')
      } else {
        setSwapError(msg)
      }
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

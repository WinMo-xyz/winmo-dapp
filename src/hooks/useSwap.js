import { useState, useEffect, useCallback, useRef } from 'react'
import { useSendTransaction } from 'wagmi'
import { readContract, waitForTransactionReceipt } from '@wagmi/core'
import { encodeFunctionData, maxUint256 } from 'viem'
import { config } from '../config/wagmi'
import { useWallet } from '../context/WalletContext'
import {
  getRoute,
  getRouteRaw,
  buildRoute,
  resolveTokenAddress,
  getTokenDecimals,
  fromSmallestUnit,
  toSmallestUnit,
  PAYMENT_TOKEN_META,
  NATIVE_ETH,
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
 * @param {object} asset — the target asset (from assets.js)
 * @param {'buy'|'sell'} mode — 'buy' swaps payment→asset, 'sell' swaps asset→payment
 */
export function useSwap(asset, mode = 'buy', provider) {
  const { evmAddress } = useWallet()
  const { sendTransactionAsync } = useSendTransaction()

  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const [swapStatus, setSwapStatus] = useState('idle') // idle | approving | swapping | success | error
  const [swapError, setSwapError] = useState(null)
  const debounceRef = useRef(null)
  const routeRef = useRef(null) // stores routeSummary + routerAddress for executeSwap

  const isSell = mode === 'sell'
  const assetAddress = resolveTokenAddress(asset, provider)
  const assetDecimals = provider?.decimals ?? getTokenDecimals(assetAddress)

  // For sell: use native ETH address when selling ETH
  const assetSwapAddress = asset?.symbol === 'ETH' ? NATIVE_ETH : assetAddress

  // ── Quote ──────────────────────────────────────────────

  const fetchQuote = useCallback((tokenSymbol, amount) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!amount || parseFloat(amount) <= 0 || !assetAddress || !PAYMENT_TOKEN_META[tokenSymbol]) {
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
        let route
        if (isSell) {
          // Sell: asset → payment token
          const payMeta = PAYMENT_TOKEN_META[tokenSymbol]
          const amountInRaw = toSmallestUnit(amount, assetDecimals)
          route = await getRouteRaw(assetSwapAddress, payMeta.address, amountInRaw)
        } else {
          // Buy: payment token → asset
          route = await getRoute(tokenSymbol, assetAddress, amount)
        }

        const { routeSummary, routerAddress } = route
        routeRef.current = { routeSummary, routerAddress }

        const outDecimals = isSell ? PAYMENT_TOKEN_META[tokenSymbol].decimals : assetDecimals
        setQuote({
          routeSummary,
          routerAddress,
          dstAmount: routeSummary.amountOut,
          outputHuman: fromSmallestUnit(routeSummary.amountOut, outDecimals),
        })
      } catch (e) {
        setQuote(null)
        routeRef.current = null
        setQuoteError(e.message)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)
  }, [assetAddress, assetSwapAddress, assetDecimals, isSell])

  // ── Swap execution ─────────────────────────────────────

  const executeSwap = useCallback(async (tokenSymbol, amount, slippage = 1) => {
    if (!evmAddress) {
      setSwapError('Connect an EVM wallet first')
      setSwapStatus('error')
      return
    }
    if (!assetAddress) {
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

      if (isSell) {
        // ── Sell: asset → payment token ──
        const isNativeEth = asset?.symbol === 'ETH'

        // 1. Approve asset token (skip for native ETH)
        if (!isNativeEth) {
          const needed = BigInt(toSmallestUnit(amount, assetDecimals))
          let allowance = 0n
          try {
            allowance = await readContract(config, {
              address: assetAddress,
              abi: approveAbi,
              functionName: 'allowance',
              args: [evmAddress, routerAddress],
            })
          } catch {}

          if (allowance < needed) {
            const data = encodeFunctionData({
              abi: approveAbi,
              functionName: 'approve',
              args: [routerAddress, maxUint256],
            })
            const appHash = await sendTransactionAsync({ to: assetAddress, data })
            await waitForTransactionReceipt(config, { hash: appHash })
          }
        }

        // 2. Re-fetch fresh route
        setSwapStatus('swapping')
        const payMeta = PAYMENT_TOKEN_META[tokenSymbol]
        const amountInRaw = toSmallestUnit(amount, assetDecimals)
        const freshRoute = await getRouteRaw(assetSwapAddress, payMeta.address, amountInRaw)
        const freshSummary = freshRoute.routeSummary

        // 3. Build & execute swap
        const slippageBps = Math.round(slippage * 100)
        const built = await buildRoute(freshSummary, evmAddress, slippageBps)
        const gasLimit = built.gas ? BigInt(Math.ceil(Number(built.gas) * 1.2)) : undefined

        const swapHash = await sendTransactionAsync({
          to: built.routerAddress,
          data: built.data,
          value: BigInt(built.transactionValue || '0'),
          gas: gasLimit,
        })
        await waitForTransactionReceipt(config, { hash: swapHash })
      } else {
        // ── Buy: payment token → asset ──
        const meta = PAYMENT_TOKEN_META[tokenSymbol]

        // 1. Approve (ERC-20 only, skip for native ETH)
        if (tokenSymbol !== 'ETH') {
          const needed = BigInt(toSmallestUnit(amount, meta.decimals))

          let allowance = 0n
          try {
            allowance = await readContract(config, {
              address: meta.address,
              abi: approveAbi,
              functionName: 'allowance',
              args: [evmAddress, routerAddress],
            })
          } catch {}

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

        // 2. Re-fetch a fresh route
        setSwapStatus('swapping')
        const freshRoute = await getRoute(tokenSymbol, assetAddress, amount)
        const freshSummary = freshRoute.routeSummary

        // 3. Build & execute swap
        const slippageBps = Math.round(slippage * 100)
        const built = await buildRoute(freshSummary, evmAddress, slippageBps)
        const gasLimit = built.gas ? BigInt(Math.ceil(Number(built.gas) * 1.2)) : undefined

        const swapHash = await sendTransactionAsync({
          to: built.routerAddress,
          data: built.data,
          value: BigInt(built.transactionValue || '0'),
          gas: gasLimit,
        })
        await waitForTransactionReceipt(config, { hash: swapHash })
      }

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
  }, [evmAddress, assetAddress, assetSwapAddress, assetDecimals, isSell, asset?.symbol, sendTransactionAsync])

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
    dstAddress: assetAddress,
  }
}

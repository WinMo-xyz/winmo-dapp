import { useMemo } from 'react'
import { useAccount, useBalance, useReadContracts, useChainId } from 'wagmi'
import { formatUnits } from 'viem'
import { getTokensForChain, erc20Abi } from '../config/tokens'

// Map token symbols to their price lookup symbol
const PRICE_SYMBOL_MAP = {
  WETH: 'ETH',
  WBTC: 'BTC',
}

const CHAIN_NAMES = {
  1: 'Ethereum',
}

/**
 * Reads real on-chain balances for the connected wallet.
 * @param {Object|null} priceMap - symbol -> { price } from CMC
 */
export function usePortfolio(priceMap) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    query: { enabled: isConnected },
  })

  const tokens = useMemo(() => getTokensForChain(chainId), [chainId])

  const contracts = useMemo(() => {
    if (!address || !tokens.length) return []
    return tokens.map(token => ({
      address: token.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    }))
  }, [address, tokens])

  const { data: tokenBalances, isLoading: tokensLoading } = useReadContracts({
    contracts,
    query: { enabled: isConnected && contracts.length > 0 },
  })

  const { holdings, totalValue } = useMemo(() => {
    const result = []
    let total = 0
    const chain = CHAIN_NAMES[chainId] || `Chain ${chainId}`

    // Native ETH
    {
      const balance = nativeBalance ? parseFloat(nativeBalance.formatted) : 0
      const price = priceMap?.ETH?.price ?? 0
      const value = balance * price
      total += value
      result.push({
        asset: 'Ethereum',
        symbol: 'ETH',
        balance: balance.toFixed(6),
        price,
        value,
        chain,
        logo: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/eth.svg',
      })
    }

    // All ERC-20 tokens (show all registered tokens)
    tokens.forEach((token, i) => {
      let balance = 0
      if (tokenBalances) {
        const raw = tokenBalances[i]
        if (raw && raw.status !== 'failure') {
          balance = parseFloat(formatUnits(raw.result, token.decimals))
        }
      }

      const lookupSymbol = PRICE_SYMBOL_MAP[token.symbol] || token.symbol
      const price = priceMap?.[lookupSymbol]?.price ?? 0
      const value = balance * price
      total += value

      result.push({
        asset: token.name,
        symbol: token.symbol,
        balance: balance.toFixed(token.decimals <= 6 ? 2 : 6),
        price,
        value,
        chain,
        logo: token.logo,
      })
    })

    result.sort((a, b) => b.value - a.value)
    return { holdings: result, totalValue: total }
  }, [nativeBalance, tokenBalances, tokens, chainId, priceMap])

  return {
    holdings,
    totalValue,
    isLoading: nativeLoading || tokensLoading,
    chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
  }
}

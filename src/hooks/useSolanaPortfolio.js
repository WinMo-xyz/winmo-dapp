import { useState, useEffect, useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { SPL_TOKEN_LIST } from '../config/solanaTokens'

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

/**
 * Reads Solana native + SPL token balances for the connected wallet.
 * Returns the same shape as usePortfolio for easy merging.
 * @param {Object|null} priceMap - symbol -> { price } from CMC
 */
export function useSolanaPortfolio(priceMap) {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()

  const [solBalance, setSolBalance] = useState(null)
  const [tokenBalances, setTokenBalances] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!connected || !publicKey) {
      setSolBalance(null)
      setTokenBalances([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function fetchBalances() {
      try {
        // Native SOL balance
        const lamports = await connection.getBalance(publicKey)
        if (!cancelled) setSolBalance(lamports / 1e9)

        // SPL token balances
        const results = []
        for (const token of SPL_TOKEN_LIST) {
          try {
            const ata = await getAssociatedTokenAddress(token.mint, publicKey)
            const account = await getAccount(connection, ata)
            const balance = Number(account.amount) / Math.pow(10, token.decimals)
            if (balance > 0) {
              results.push({ ...token, balance })
            }
          } catch {
            // Token account doesn't exist — user holds 0
          }
        }
        if (!cancelled) setTokenBalances(results)
      } catch (err) {
        console.error('[useSolanaPortfolio] fetch error:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchBalances()
    return () => { cancelled = true }
  }, [connected, publicKey, connection])

  const { holdings, totalValue } = useMemo(() => {
    const result = []
    let total = 0

    // Native SOL
    if (solBalance != null && solBalance > 0) {
      const price = priceMap?.SOL?.price ?? 0
      const value = solBalance * price
      total += value
      result.push({
        asset: 'Solana',
        symbol: 'SOL',
        balance: solBalance.toFixed(6),
        price,
        value,
        chain: 'Solana',
        logo: CI + 'sol.svg',
      })
    }

    // SPL tokens
    for (const tok of tokenBalances) {
      const price = priceMap?.[tok.symbol]?.price ?? 0
      const value = tok.balance * price
      total += value
      result.push({
        asset: tok.name,
        symbol: tok.symbol,
        balance: tok.balance.toFixed(tok.decimals <= 6 ? 2 : 6),
        price,
        value,
        chain: 'Solana',
        logo: tok.logo,
      })
    }

    result.sort((a, b) => b.value - a.value)
    return { holdings: result, totalValue: total }
  }, [solBalance, tokenBalances, priceMap])

  return {
    holdings,
    totalValue,
    isLoading,
    chainName: 'Solana',
  }
}

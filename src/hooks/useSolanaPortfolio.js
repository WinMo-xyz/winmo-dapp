import { useState, useEffect, useMemo, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SPL_TOKEN_LIST } from '../config/solanaTokens'

const SOL_LOGO = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'

// Build a mint -> token metadata lookup from SPL_TOKEN_LIST
const MINT_MAP = new Map()
for (const token of SPL_TOKEN_LIST) {
  MINT_MAP.set(token.mint.toBase58(), token)
}

async function withRetry(fn, retries = 3, delay = 1200) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
}

/**
 * Reads Solana native + SPL token balances for the connected wallet.
 * Uses a single getParsedTokenAccountsByOwner RPC call with retry logic.
 * @param {Object|null} priceMap - symbol -> { price } from CMC
 */
export function useSolanaPortfolio(priceMap) {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()

  const [solBalance, setSolBalance] = useState(null)
  const [tokenBalances, setTokenBalances] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Stable key so the effect only re-fires when the actual address changes
  const walletKey = publicKey?.toBase58() || null

  const fetchBalances = useCallback(async (conn, pk, signal) => {
    // Native SOL balance
    const lamports = await withRetry(() =>
      conn.getBalance(pk, 'confirmed')
    )
    if (signal.cancelled) return
    setSolBalance(lamports / 1e9)

    // All SPL token accounts in a single RPC call
    const response = await withRetry(() =>
      conn.getParsedTokenAccountsByOwner(
        pk,
        { programId: TOKEN_PROGRAM_ID },
        'confirmed',
      )
    )
    if (signal.cancelled) return

    const results = []
    for (const { account } of response.value) {
      const parsed = account.data.parsed?.info
      if (!parsed) continue

      const mintAddr = parsed.mint
      const token = MINT_MAP.get(mintAddr)
      if (!token) continue // not a token we track

      const uiAmount = parsed.tokenAmount?.uiAmount ?? 0
      results.push({ ...token, balance: uiAmount })
    }

    if (!signal.cancelled) setTokenBalances(results)
  }, [])

  useEffect(() => {
    if (!connected || !walletKey) {
      setSolBalance(null)
      setTokenBalances([])
      return
    }

    const signal = { cancelled: false }
    setIsLoading(true)

    fetchBalances(connection, publicKey, signal)
      .catch(() => {})
      .finally(() => { if (!signal.cancelled) setIsLoading(false) })

    return () => { signal.cancelled = true }
  }, [connected, walletKey, connection, fetchBalances, publicKey])

  const { holdings, totalValue } = useMemo(() => {
    const result = []
    let total = 0

    // Native SOL
    {
      const bal = solBalance != null ? solBalance : 0
      const price = priceMap?.SOL?.price ?? 0
      const value = bal * price
      total += value
      result.push({
        asset: 'Solana',
        symbol: 'SOL',
        balance: bal.toFixed(6),
        price,
        value,
        chain: 'Solana',
        logo: SOL_LOGO,
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

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { erc20Abi } from '../config/tokens'
import { resolveTokenAddress, getTokenDecimals, PAYMENT_TOKEN_META } from '../services/kyberswapApi'
import { resolveSolanaMint, getSplDecimals, SOLANA_PAYMENT_META } from '../services/jupiterApi'
import { SPL_TOKEN_LIST } from '../config/solanaTokens'

/**
 * Returns the EVM balance for a single asset (native ETH or ERC-20).
 */
export function useEvmAssetBalance(asset) {
  const { address, isConnected } = useAccount()
  const isNativeEth = asset?.symbol === 'ETH'
  const tokenAddress = resolveTokenAddress(asset)
  const decimals = getTokenDecimals(tokenAddress)

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: isConnected && isNativeEth },
  })

  const { data: tokenRaw } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !isNativeEth && !!tokenAddress && !!address },
  })

  if (!isConnected || !asset) return null

  if (isNativeEth) {
    return ethBalance ? parseFloat(ethBalance.formatted) : null
  }

  if (tokenRaw != null) {
    return parseFloat(formatUnits(tokenRaw, decimals))
  }

  return null
}

/**
 * Returns the Solana balance for a single asset (native SOL or SPL token).
 */
export function useSolanaAssetBalance(asset) {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)

  const isNativeSol = asset?.symbol === 'SOL'
  const mintAddress = resolveSolanaMint(asset)

  useEffect(() => {
    if (!connected || !publicKey || !asset) {
      setBalance(null)
      return
    }

    let cancelled = false

    async function fetch() {
      try {
        if (isNativeSol) {
          const lamports = await connection.getBalance(publicKey)
          if (!cancelled) setBalance(lamports / 1e9)
        } else if (mintAddress) {
          const mintPk = SPL_TOKEN_LIST.find(t => t.mint?.toBase58() === mintAddress)?.mint
          if (!mintPk) { setBalance(null); return }
          const ata = await getAssociatedTokenAddress(mintPk, publicKey)
          const account = await getAccount(connection, ata)
          const decimals = getSplDecimals(mintAddress)
          if (!cancelled) setBalance(Number(account.amount) / Math.pow(10, decimals))
        } else {
          setBalance(null)
        }
      } catch {
        // Token account doesn't exist — balance is 0
        if (!cancelled) setBalance(0)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [connected, publicKey, connection, asset?.symbol, mintAddress, isNativeSol])

  return balance
}

/**
 * Returns the EVM balance for a payment token (ETH, USDC, USDT).
 */
export function useEvmPaymentBalance(symbol) {
  const { address, isConnected } = useAccount()
  const meta = PAYMENT_TOKEN_META[symbol]
  const isNative = symbol === 'ETH'

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: isConnected && isNative },
  })

  const { data: tokenRaw } = useReadContract({
    address: meta?.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !isNative && !!meta?.address && !!address },
  })

  if (!isConnected || !meta) return null

  if (isNative) {
    return ethBalance ? parseFloat(ethBalance.formatted) : null
  }

  if (tokenRaw != null) {
    return parseFloat(formatUnits(tokenRaw, meta.decimals))
  }

  return null
}

/**
 * Returns the Solana balance for a payment token (SOL, USDC, USDT).
 */
export function useSolanaPaymentBalance(symbol) {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)

  const meta = SOLANA_PAYMENT_META[symbol]
  const isNative = symbol === 'SOL'

  useEffect(() => {
    if (!connected || !publicKey || !meta) {
      setBalance(null)
      return
    }

    let cancelled = false

    async function fetch() {
      try {
        if (isNative) {
          const lamports = await connection.getBalance(publicKey)
          if (!cancelled) setBalance(lamports / 1e9)
        } else {
          const mintPk = new PublicKey(meta.mint)
          const ata = await getAssociatedTokenAddress(mintPk, publicKey)
          const account = await getAccount(connection, ata)
          if (!cancelled) setBalance(Number(account.amount) / Math.pow(10, meta.decimals))
        }
      } catch {
        if (!cancelled) setBalance(0)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [connected, publicKey, connection, symbol, meta, isNative])

  return balance
}

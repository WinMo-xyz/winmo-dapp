import { clusterApiUrl } from '@solana/web3.js'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-wallets'

export const SOLANA_RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC || clusterApiUrl('mainnet-beta')

// Phantom, Solflare, and Coinbase are auto-detected via the Wallet Standard.
// Only list adapters for wallets that don't support auto-detection.
export const SOLANA_WALLETS = [
  new LedgerWalletAdapter(),
]

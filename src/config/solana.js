import { LedgerWalletAdapter } from '@solana/wallet-adapter-wallets'

// In dev, Vite proxies /api/solana-rpc → mainnet-beta RPC (bypasses 403).
// In production, a Netlify function handles the proxy.
// If VITE_SOLANA_RPC is set, use it directly (e.g. Helius/QuickNode private RPC).
export const SOLANA_RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC || `${window.location.origin}/api/solana-rpc`

// Phantom, Solflare, and Coinbase are auto-detected via the Wallet Standard.
// Only list adapters for wallets that don't support auto-detection.
export const SOLANA_WALLETS = [
  new LedgerWalletAdapter(),
]

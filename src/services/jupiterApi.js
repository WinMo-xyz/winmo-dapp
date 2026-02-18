import { SPL_TOKEN_LIST } from '../config/solanaTokens.js'

const BASE = 'https://api.jup.ag/swap/v1'
const JUP_KEY = 'bfda7f2b-652c-4a12-a752-0bef22f9cbae'

// Wrapped SOL mint (Jupiter uses this for native SOL)
const WSOL_MINT = 'So11111111111111111111111111111111111111112'

// Payment token mints on Solana mainnet
export const SOLANA_PAYMENT_META = {
  SOL:  { mint: WSOL_MINT, decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
}

// ─── Helpers ──────────────────────────────────────────────

export function toSmallestUnit(amount, decimals) {
  const [whole = '0', frac = ''] = amount.toString().split('.')
  const padded = frac.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + padded).toString()
}

export function fromSmallestUnit(raw, decimals) {
  const str = raw.toString().padStart(decimals + 1, '0')
  const whole = str.slice(0, str.length - decimals)
  const frac = str.slice(str.length - decimals).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole
}

/**
 * Resolve an asset to its Solana SPL mint address string.
 * Returns null when no SPL token exists.
 */
export function resolveSolanaMint(asset, provider) {
  if (!asset) return null
  if (provider?.chain === 'solana' && provider.address) return provider.address
  const match = SPL_TOKEN_LIST.find(t => t.symbol === asset.symbol)
  return match?.mint?.toBase58() || null
}

/**
 * Look up SPL decimals for a given mint address string.
 */
export function getSplDecimals(mintAddress) {
  const match = SPL_TOKEN_LIST.find(t => t.mint?.toBase58() === mintAddress)
  return match?.decimals ?? 6
}

// ─── API calls ────────────────────────────────────────────

export async function getQuote(inputMint, outputMint, amount, slippageBps = 50) {
  const url = `${BASE}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
  const res = await fetch(url, {
    headers: { 'x-api-key': JUP_KEY },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Jupiter quote error ${res.status}`)
  }
  return res.json()
}

export async function getSwapTransaction(quoteResponse, userPublicKey) {
  const res = await fetch(`${BASE}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': JUP_KEY },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: userPublicKey.toString(),
      wrapAndUnwrapSol: true,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Jupiter swap error ${res.status}`)
  }
  return res.json()
}

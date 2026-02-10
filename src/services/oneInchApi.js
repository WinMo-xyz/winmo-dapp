import { getTokensForChain } from '../config/tokens'

const CHAIN_ID = 1 // Ethereum mainnet
const ONEINCH_KEY = '' // TODO: add your 1inch API key
const BASE = 'https://api.1inch.dev/swap/v6.0/' + CHAIN_ID

// Native ETH placeholder used by 1inch
const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

// Source (payment) tokens on Ethereum mainnet
export const PAYMENT_TOKEN_META = {
  USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  ETH:  { address: NATIVE_ETH, decimals: 18 },
}

// Edge-case symbol overrides (asset symbol → Ethereum address)
const SYMBOL_OVERRIDES = {
  XAU: '0x45804880De22913dAFE09f4980848ECE6EcbAf78', // PAXG
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
 * Resolve an asset object to its Ethereum mainnet token address.
 * Returns null when no on-chain representation exists (e.g. SOL-native tokens).
 */
export function resolveTokenAddress(asset) {
  if (!asset) return null
  if (asset.ethereumAddress) return asset.ethereumAddress
  if (SYMBOL_OVERRIDES[asset.symbol]) return SYMBOL_OVERRIDES[asset.symbol]
  const chain = getTokensForChain(CHAIN_ID)
  const match = chain.find(
    t => t.symbol === asset.symbol || t.symbol === 'W' + asset.symbol,
  )
  return match?.address || null
}

// ─── API calls ────────────────────────────────────────────

async function api(endpoint, params) {
  const url = new URL(`${BASE}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${ONEINCH_KEY}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.description || body.error || `1inch error ${res.status}`)
  }
  return res.json()
}

export async function getQuote(srcSymbol, dstAddress, amount) {
  const src = PAYMENT_TOKEN_META[srcSymbol]
  if (!src) throw new Error(`Unsupported payment token: ${srcSymbol}`)
  return api('/quote', {
    src: src.address,
    dst: dstAddress,
    amount: toSmallestUnit(amount, src.decimals),
  })
}

export async function getSwapTx(srcSymbol, dstAddress, amount, from, slippage = 1) {
  const src = PAYMENT_TOKEN_META[srcSymbol]
  if (!src) throw new Error(`Unsupported payment token: ${srcSymbol}`)
  return api('/swap', {
    src: src.address,
    dst: dstAddress,
    amount: toSmallestUnit(amount, src.decimals),
    from,
    slippage,
  })
}

export async function getAllowance(tokenAddress, wallet) {
  return api('/approve/allowance', { tokenAddress, walletAddress: wallet })
}

export async function getApprovalTx(tokenAddress, amount) {
  const params = { tokenAddress }
  if (amount) params.amount = amount
  return api('/approve/transaction', params)
}

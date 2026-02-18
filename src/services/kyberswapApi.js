import { getTokensForChain } from '../config/tokens'

const CHAIN = 'ethereum'
const CHAIN_ID = 1
// Route through Vite dev proxy (dev) / Netlify function (prod) to avoid CORS
const BASE = `/api/kyberswap/${CHAIN}/api/v1`

// Native ETH placeholder (same as 1inch convention)
export const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

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
export function resolveTokenAddress(asset, provider) {
  if (!asset) return null
  if (provider?.chain === 'ethereum' && provider.address) return provider.address
  if (asset.ethereumAddress) return asset.ethereumAddress
  if (SYMBOL_OVERRIDES[asset.symbol]) return SYMBOL_OVERRIDES[asset.symbol]
  const chain = getTokensForChain(CHAIN_ID)
  const match = chain.find(
    t => t.symbol === asset.symbol || t.symbol === 'W' + asset.symbol,
  )
  return match?.address || null
}

/**
 * Look up the decimals for a token by its Ethereum address.
 */
export function getTokenDecimals(address) {
  if (!address) return 18
  const lower = address.toLowerCase()
  // Check payment tokens first
  for (const meta of Object.values(PAYMENT_TOKEN_META)) {
    if (meta.address.toLowerCase() === lower) return meta.decimals
  }
  // Check token list
  const chain = getTokensForChain(CHAIN_ID)
  const match = chain.find(t => t.address.toLowerCase() === lower)
  return match?.decimals ?? 18
}

// ─── API calls ────────────────────────────────────────────

const headers = {
  'Accept': 'application/json',
}

/**
 * GET /routes — fetch best swap route (quote).
 * Returns { routeSummary, routerAddress }.
 */
export async function getRoute(srcSymbol, dstAddress, amount) {
  const src = PAYMENT_TOKEN_META[srcSymbol]
  if (!src) throw new Error(`Unsupported payment token: ${srcSymbol}`)

  const params = new URLSearchParams({
    tokenIn: src.address,
    tokenOut: dstAddress,
    amountIn: toSmallestUnit(amount, src.decimals),
    gasInclude: 'true',
    excludedSources: 'pmm',
  })

  const res = await fetch(`${BASE}/routes?${params}`, { headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `KyberSwap error ${res.status}`)
  }

  const json = await res.json()
  const data = json.data
  if (!data?.routeSummary) throw new Error('No route found')
  return data // { routeSummary, routerAddress }
}

/**
 * GET /routes — generic route fetch with raw token addresses and raw amount.
 * Used for sell operations where the input token is an asset (not a payment token).
 */
export async function getRouteRaw(tokenIn, tokenOut, amountInRaw) {
  const params = new URLSearchParams({
    tokenIn,
    tokenOut,
    amountIn: amountInRaw,
    gasInclude: 'true',
    excludedSources: 'pmm',
  })

  const res = await fetch(`${BASE}/routes?${params}`, { headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `KyberSwap error ${res.status}`)
  }

  const json = await res.json()
  const data = json.data
  if (!data?.routeSummary) throw new Error('No route found')
  return data
}

/**
 * POST /route/build — encode swap calldata from a previously fetched route.
 * Returns { data, routerAddress, transactionValue, ... }.
 */
export async function buildRoute(routeSummary, sender, slippage = 100) {
  const res = await fetch(`${BASE}/route/build`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routeSummary,
      sender,
      recipient: sender,
      slippageTolerance: slippage, // basis points (100 = 1%)
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `KyberSwap build error ${res.status}`)
  }

  const json = await res.json()
  return json.data // { data, routerAddress, transactionValue, ... }
}

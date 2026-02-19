# AI Agent Integration Guide

This guide explains how to integrate your AI agent with WinMo to access financial data, get swap quotes, and execute trades across Ethereum and Solana.

---

## Table of Contents

- [Overview](#overview)
- [Discovery](#discovery)
- [REST API](#rest-api)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
  - [List Assets](#1-list-assets)
  - [Get Asset Detail](#2-get-asset-detail)
  - [Get Live Prices](#3-get-live-prices)
  - [Get Yield Protocols](#4-get-yield-protocols)
  - [Get Swap Quote](#5-get-swap-quote)
  - [Search Assets](#6-search-assets)
  - [Get Forex Rates](#7-get-forex-rates)
  - [Get Swappable Tokens](#8-get-swappable-tokens)
- [Browser API](#browser-api)
  - [Getting Started](#getting-started)
  - [Read-Only Methods](#read-only-methods)
  - [Quote Methods](#quote-methods)
  - [Wallet Methods](#wallet-methods)
  - [Transaction Methods](#transaction-methods)
- [Use Cases](#use-cases)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

---

## Overview

WinMo exposes its full functionality through three layers:

| Layer | URL | Use Case |
|-------|-----|----------|
| **Discovery** | `/llms.txt`, `/.well-known/agents.json` | Agent discovers WinMo capabilities |
| **REST API** | `/api/agent/*` | Server-side agents, chatbots, scripts |
| **Browser API** | `window.winmo` | Browser-based agents, extensions, bookmarklets |

All REST endpoints return JSON with CORS headers enabled. No authentication required.

---

## Discovery

### LLM Discovery File

```
GET /llms.txt
```

Returns a markdown document describing WinMo's capabilities, API endpoints, and supported asset categories. Follows the [llmstxt.org](https://llmstxt.org) specification.

### Agent Schema

```
GET /.well-known/agents.json
```

Returns a machine-readable JSON schema describing:
- All available skills (endpoints) with parameters and return types
- Browser API methods with argument signatures
- Metadata (name, version, description)

**Example usage for agent bootstrapping:**

```python
import requests

# Discover WinMo capabilities
schema = requests.get("https://your-app.netlify.app/.well-known/agents.json").json()

for skill in schema["skills"]:
    print(f"{skill['id']}: {skill['method']} {skill['endpoint']}")
    print(f"  {skill['description']}")
```

---

## REST API

### Base URL

```
Production: https://your-app.netlify.app/api/agent
Development: http://localhost:5173/api/agent (proxied to Netlify CLI)
```

### Authentication

No API key required. All endpoints are public and read-only (except swap quotes which call upstream aggregators).

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/` | GET | Endpoint directory |
| `/api/agent/assets` | GET | List assets by category |
| `/api/agent/asset/:id` | GET | Get asset detail |
| `/api/agent/prices` | GET | Live crypto prices |
| `/api/agent/yield` | GET | Yield protocols |
| `/api/agent/quote` | GET | Swap quote |
| `/api/agent/search` | GET | Search assets |
| `/api/agent/forex` | GET | Live forex rates |
| `/api/agent/tokens` | GET | Swappable token addresses |

---

### 1. List Assets

```
GET /api/agent/assets?category=&subcategory=
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | `stocks`, `crypto`, `commodities`, or `bonds` |
| `subcategory` | string | No | Category-specific filter (see below) |

**Subcategories by category:**

| Category | Subcategories |
|----------|---------------|
| stocks | `pre-ipo`, `large-cap`, `mid-cap`, `small-cap`, `etf` |
| crypto | `large-cap`, `mid-cap`, `small-cap` |
| commodities | `precious-metals`, `energy`, `industrial`, `broad` |
| bonds | `treasury`, `corporate`, `clo` |

**Example:**

```bash
# All assets
curl /api/agent/assets

# Only crypto
curl /api/agent/assets?category=crypto

# Only large-cap stocks
curl /api/agent/assets?category=stocks&subcategory=large-cap
```

**Response:**

```json
[
  {
    "id": "nvda",
    "name": "NVIDIA",
    "symbol": "NVDA",
    "price": 140.11,
    "change24h": 2.15,
    "category": "stocks",
    "subcategory": "large-cap",
    "logo": "https://companiesmarketcap.com/img/company-logos/64/NVDA.png",
    "providers": [
      {
        "provider": "ondo",
        "symbol": "NVDAon",
        "address": "0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee",
        "chain": "ethereum",
        "decimals": 18
      },
      {
        "provider": "ondo",
        "symbol": "NVDAon",
        "address": "gEGtLTPNQ7jcg25zTetkbmF7teoDLcrfTnQfmn2ondo",
        "chain": "solana",
        "decimals": 9
      }
    ]
  }
]
```

---

### 2. Get Asset Detail

```
GET /api/agent/asset/:id
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Asset ID (e.g., `btc`, `nvda`, `gold`, `tlt`) |

**Example:**

```bash
curl /api/agent/asset/btc
```

**Response:**

```json
{
  "id": "btc",
  "name": "Bitcoin",
  "symbol": "BTC",
  "price": 104250.00,
  "change24h": 1.45,
  "category": "crypto",
  "subcategory": "large-cap",
  "logo": "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/btc.svg",
  "ethereumAddress": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "description": "The original crypto. Launched in 2009 by the pseudonymous Satoshi Nakamoto...",
  "news": [
    { "title": "Bitcoin Spot ETFs Cross $120B in Total AUM", "date": "2026-02-07", "source": "CoinDesk" }
  ],
  "chains": ["ethereum"]
}
```

---

### 3. Get Live Prices

```
GET /api/agent/prices
```

No parameters. Returns live prices from CoinGecko for 50+ crypto tokens, merged with static prices for stocks, commodities, and bonds.

**Example:**

```bash
curl /api/agent/prices
```

**Response:**

```json
{
  "BTC": { "price": 104250.00, "change24h": 1.45 },
  "ETH": { "price": 3890.50, "change24h": 2.78 },
  "SOL": { "price": 248.30, "change24h": 5.12 },
  "NVDA": { "price": 140.11, "change24h": 2.15 },
  "USDC": { "price": 1.0, "change24h": 0.01 }
}
```

---

### 4. Get Yield Protocols

```
GET /api/agent/yield?riskLevel=
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `riskLevel` | string | No | `safe`, `low`, `high-yield`, or `speculative` |

**Example:**

```bash
# All protocols
curl /api/agent/yield

# Only safe protocols
curl /api/agent/yield?riskLevel=safe
```

**Response:**

```json
[
  {
    "id": "wsteth",
    "name": "wstETH",
    "tokenSymbol": "wstETH",
    "protocol": "Lido",
    "network": "Ethereum",
    "asset": "ETH",
    "apy": 2.5,
    "totalDeposits": "$18.7B",
    "strategy": "Stake ETH via Lido, wrap it as wstETH...",
    "riskLevel": "safe",
    "logo": "https://icon.horse/icon/lido.fi",
    "ethereumAddress": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    "llamaPoolId": "747c1d2a-c668-4682-b9f9-296708a3dd90",
    "liveApy": 2.8,
    "liveTvl": 18500000000
  }
]
```

When DeFi Llama data is available, `liveApy` and `liveTvl` fields are added with real-time values.

---

### 5. Get Swap Quote

```
GET /api/agent/quote?from=&to=&amount=&chain=
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string | Yes | Source token symbol (e.g., `USDC`, `ETH`, `SOL`) |
| `to` | string | Yes | Destination token symbol (e.g., `ETH`, `BTC`, `NVDA`) |
| `amount` | string | Yes | Amount of source token |
| `chain` | string | Yes | `solana` or `ethereum` |

**Example:**

```bash
# Quote for buying ETH with 100 USDC on Ethereum
curl "/api/agent/quote?from=USDC&to=ETH&amount=100&chain=ethereum"

# Quote for buying SOL with 50 USDC on Solana
curl "/api/agent/quote?from=USDC&to=SOL&amount=50&chain=solana"
```

**Response (Ethereum via KyberSwap):**

```json
{
  "chain": "ethereum",
  "from": "USDC",
  "to": "ETH",
  "amount": "100",
  "fromAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "toAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "quote": {
    "routeSummary": { "...KyberSwap route details..." },
    "routerAddress": "0x..."
  }
}
```

**Response (Solana via Jupiter):**

```json
{
  "chain": "solana",
  "from": "USDC",
  "to": "SOL",
  "amount": "50",
  "fromAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "toAddress": "So11111111111111111111111111111111111111112",
  "quote": {
    "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "outputMint": "So11111111111111111111111111111111111111112",
    "inAmount": "50000000",
    "outAmount": "...",
    "priceImpactPct": "...",
    "routePlan": [ "...Jupiter route details..." ]
  }
}
```

---

### 6. Search Assets

```
GET /api/agent/search?q=
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query (name or symbol) |

**Example:**

```bash
curl "/api/agent/search?q=bitcoin"
curl "/api/agent/search?q=nvidia"
curl "/api/agent/search?q=gold"
```

**Response:**

```json
[
  {
    "id": "btc",
    "name": "Bitcoin",
    "symbol": "BTC",
    "price": 104250.00,
    "change24h": 1.45,
    "category": "crypto",
    "subcategory": "large-cap"
  }
]
```

---

### 7. Get Forex Rates

```
GET /api/agent/forex
```

No parameters. Returns live rates from Pyth Network oracles for 25+ FX pairs.

**Example:**

```bash
curl /api/agent/forex
```

**Response:**

```json
{
  "EUR/USD": { "price": 1.0842, "confidence": 0.0001, "publishTime": 1708300800 },
  "USD/JPY": { "price": 149.85, "confidence": 0.02, "publishTime": 1708300800 },
  "GBP/USD": { "price": 1.2631, "confidence": 0.0002, "publishTime": 1708300800 }
}
```

---

### 8. Get Swappable Tokens

```
GET /api/agent/tokens?category=&chain=
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | `stocks`, `crypto`, `commodities`, or `bonds` |
| `chain` | string | No | `solana` or `ethereum` |

Returns token addresses needed for building swap transactions.

**Example:**

```bash
curl "/api/agent/tokens?category=stocks&chain=ethereum"
```

**Response:**

```json
[
  {
    "id": "nvda-ondo",
    "name": "NVIDIA",
    "symbol": "NVDAon",
    "address": "0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee",
    "decimals": 18,
    "chain": "ethereum",
    "logo": "https://companiesmarketcap.com/img/company-logos/64/NVDA.png"
  }
]
```

---

## Browser API

The `window.winmo` API is available when running inside the WinMo DApp. It provides direct access to all functionality with wallet integration.

### Getting Started

```javascript
// Wait for WinMo to be ready
if (window.winmo) {
  // Already available
  start()
} else {
  window.addEventListener('winmo:ready', start)
}

async function start() {
  console.log('WinMo version:', window.winmo.version)  // "1.0.0"

  // Or use the ready promise
  await window.winmo.ready
}
```

### Read-Only Methods

These methods work without a wallet connection.

#### `getAssets(category?, subcategory?)`

```javascript
// All assets
const all = await window.winmo.getAssets()

// Crypto only
const crypto = await window.winmo.getAssets('crypto')

// Large-cap stocks only
const largeStocks = await window.winmo.getAssets('stocks', 'large-cap')
```

#### `getAsset(id)`

```javascript
const btc = await window.winmo.getAsset('btc')
console.log(btc.description)  // "The original crypto..."
console.log(btc.news)         // Latest news array
```

#### `searchAssets(query)`

```javascript
const results = await window.winmo.searchAssets('nvidia')
// Returns matching assets + forex pairs
```

#### `getPrices()`

```javascript
const prices = await window.winmo.getPrices()
console.log(prices.BTC.price)      // 104250.00
console.log(prices.ETH.change24h)  // 2.78
```

#### `getForexRates()`

```javascript
const rates = await window.winmo.getForexRates()
console.log(rates['EUR/USD'].price)  // 1.0842
```

#### `getYieldProtocols(riskLevel?)`

```javascript
// All protocols
const all = await window.winmo.getYieldProtocols()

// Safe only
const safe = await window.winmo.getYieldProtocols('safe')
```

### Quote Methods

#### `getQuote({ from, to, amount, chain })`

```javascript
// Ethereum quote via KyberSwap
const ethQuote = await window.winmo.getQuote({
  from: 'USDC',
  to: 'ETH',
  amount: '100',
  chain: 'ethereum'
})

// Solana quote via Jupiter
const solQuote = await window.winmo.getQuote({
  from: 'USDC',
  to: 'SOL',
  amount: '50',
  chain: 'solana'
})
```

### Wallet Methods

These require a connected wallet.

#### `getWalletState()`

```javascript
const state = window.winmo.getWalletState()
// {
//   isConnected: true,
//   isEvmConnected: true,
//   isSolanaConnected: false,
//   evmAddress: "0x1234...abcd",
//   solanaAddress: null,
//   displayName: "0x12...abcd",
//   ensName: "vitalik.eth"
// }
```

#### `getPortfolio()`

```javascript
const holdings = await window.winmo.getPortfolio()
// [
//   { symbol: "ETH", chain: "ethereum", balance: "1.5" },
//   { symbol: "USDC", chain: "ethereum", balance: "500.0" },
//   { symbol: "SOL", chain: "solana", balance: "10.0" }
// ]
```

#### `getBalance(symbol, chain)`

```javascript
const ethBalance = await window.winmo.getBalance('ETH', 'ethereum')
// "1.5"
```

### Transaction Methods

These require a connected wallet and will prompt for signing.

#### `executeSwap({ from, to, amount, chain, slippage? })`

```javascript
try {
  const result = await window.winmo.executeSwap({
    from: 'USDC',
    to: 'ETH',
    amount: '100',
    chain: 'ethereum',
    slippage: 100  // 1% in basis points (optional, default 100)
  })
  console.log('TX hash:', result.txHash)
  // { chain: "ethereum", txHash: "0xabc..." }
} catch (err) {
  console.error('Swap failed:', err.message)
}
```

---

## Use Cases

### Portfolio Tracker Bot

```python
import requests

BASE = "https://your-app.netlify.app/api/agent"

# Get all prices
prices = requests.get(f"{BASE}/prices").json()

# Find top gainers
gainers = sorted(prices.items(), key=lambda x: x[1]['change24h'], reverse=True)[:5]
for symbol, data in gainers:
    print(f"{symbol}: ${data['price']:.2f} ({data['change24h']:+.1f}%)")
```

### Yield Farming Advisor

```python
# Get safe yield opportunities
safe = requests.get(f"{BASE}/yield?riskLevel=safe").json()

for protocol in safe:
    apy = protocol.get('liveApy', protocol['apy'])
    print(f"{protocol['name']} ({protocol['protocol']}): {apy:.1f}% APY on {protocol['network']}")
```

### Trade Execution Agent (Browser)

```javascript
// Check wallet, get quote, execute
const state = window.winmo.getWalletState()
if (!state.isConnected) throw new Error('Connect wallet first')

// Get current price
const prices = await window.winmo.getPrices()
const ethPrice = prices.ETH.price

// If ETH is under $4000, buy $500 worth
if (ethPrice < 4000) {
  const quote = await window.winmo.getQuote({
    from: 'USDC', to: 'ETH', amount: '500', chain: 'ethereum'
  })

  // Execute the swap (user signs in wallet)
  const result = await window.winmo.executeSwap({
    from: 'USDC', to: 'ETH', amount: '500', chain: 'ethereum'
  })

  console.log('Bought ETH! TX:', result.txHash)
}
```

### Multi-Asset Research Agent

```python
# Search for anything
results = requests.get(f"{BASE}/search?q=artificial intelligence").json()
for r in results:
    detail = requests.get(f"{BASE}/asset/{r['id']}").json()
    print(f"{detail['name']} ({detail['symbol']}): {detail.get('description', '')[:100]}...")
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing/invalid parameters) |
| 404 | Asset or endpoint not found |
| 502 | Upstream API error (Jupiter, KyberSwap, Pyth, CoinGecko) |
| 500 | Internal server error |

**Browser API errors** are thrown as standard JavaScript errors:

```javascript
try {
  await window.winmo.executeSwap({ ... })
} catch (err) {
  if (err.message.includes('No wallet connected')) {
    // Prompt user to connect
  } else if (err.message.includes('No route found')) {
    // Pair not available on this chain
  }
}
```

---

## Rate Limits

- **REST API:** No rate limits on the WinMo layer. Upstream services (CoinGecko, Jupiter, KyberSwap) may throttle.
- **Browser API:** No limits. Calls go directly to service functions or proxied APIs.
- **Prices:** CoinGecko has a 60-second cache TTL. Pyth forex data has a 10-second cache.
- **Quotes:** Each quote makes a real-time call to Jupiter or KyberSwap. Avoid polling faster than once per second.

---

## Supported Payment Tokens by Chain

### Solana

| Token | Mint Address |
|-------|-------------|
| SOL | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |

### Ethereum

| Token | Address |
|-------|---------|
| ETH | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (native) |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |

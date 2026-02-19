---
name: winmo
version: 1.0.0
description: Multi-chain DeFi portfolio. Trade stocks, crypto, commodities, bonds, and forex onchain. Ethereum + Solana.
homepage: https://app.winmo.xyz
---

# WinMo: Trade Everything Onchain

100+ tradeable assets across stocks, crypto, commodities, bonds, and forex. Multi-chain (Ethereum + Solana). AI-agent native.

> **Base URL:** `https://app.winmo.xyz`

---

## Quick Start

```bash
# Search for any asset
curl https://app.winmo.xyz/api/agent/search?q=bitcoin

# Get live crypto prices
curl https://app.winmo.xyz/api/agent/prices

# Get a swap quote (buy ETH with 100 USDC on Ethereum)
curl "https://app.winmo.xyz/api/agent/quote?from=USDC&to=ETH&amount=100&chain=ethereum"
```

No API key needed. No registration. No authentication. Just call the endpoints.

---

## What You Can Do

| Action | Endpoint | Example |
|--------|----------|---------|
| List assets | `GET /api/agent/assets` | `?category=stocks&subcategory=large-cap` |
| Get asset detail | `GET /api/agent/asset/:id` | `/api/agent/asset/btc` |
| Live crypto prices | `GET /api/agent/prices` | 50+ tokens from CoinGecko |
| Yield protocols | `GET /api/agent/yield` | `?riskLevel=safe` |
| Swap quote | `GET /api/agent/quote` | `?from=USDC&to=ETH&amount=100&chain=ethereum` |
| Search anything | `GET /api/agent/search` | `?q=nvidia` |
| Forex rates | `GET /api/agent/forex` | 25+ pairs from Pyth oracles |
| Token addresses | `GET /api/agent/tokens` | `?category=crypto&chain=solana` |

---

## Asset Categories

| Category | Count | Examples |
|----------|-------|---------|
| **Stocks** | 47 | NVDA, TSLA, AAPL, MSFT, SPY, OpenAI, Anthropic |
| **Crypto** | 33 | BTC, ETH, SOL, JUP, UNI, AAVE, BONK |
| **Commodities** | 12 | Gold (PAXG), Silver, Oil, Copper |
| **Bonds** | 10 | TLT, SGOV, HYG, AGG |
| **Forex** | 25+ pairs | EUR/USD, USD/JPY, GBP/USD, USD/BRL |

Stocks, commodities, and bonds are tokenized onchain via **Ondo Finance**, **Backed Finance**, **Paxos**, and **Tether**.

---

## List Assets

```bash
# All assets (100+)
curl https://app.winmo.xyz/api/agent/assets

# Only crypto
curl https://app.winmo.xyz/api/agent/assets?category=crypto

# Only large-cap stocks
curl "https://app.winmo.xyz/api/agent/assets?category=stocks&subcategory=large-cap"

# Only ETFs
curl "https://app.winmo.xyz/api/agent/assets?category=stocks&subcategory=etf"
```

**Subcategories:**
- Stocks: `pre-ipo`, `large-cap`, `mid-cap`, `small-cap`, `etf`
- Crypto: `large-cap`, `mid-cap`, `small-cap`
- Commodities: `precious-metals`, `energy`, `industrial`, `broad`
- Bonds: `treasury`, `corporate`, `clo`

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
      { "provider": "ondo", "symbol": "NVDAon", "address": "0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee", "chain": "ethereum", "decimals": 18 },
      { "provider": "ondo", "symbol": "NVDAon", "address": "gEGtLTPNQ7jcg25zTetkbmF7teoDLcrfTnQfmn2ondo", "chain": "solana", "decimals": 9 }
    ]
  }
]
```

---

## Get Asset Detail

```bash
curl https://app.winmo.xyz/api/agent/asset/btc
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
  "description": "The original crypto. Launched in 2009 by the pseudonymous Satoshi Nakamoto...",
  "news": [
    { "title": "Bitcoin Spot ETFs Cross $120B in Total AUM", "date": "2026-02-07", "source": "CoinDesk" }
  ],
  "chains": ["ethereum"]
}
```

---

## Live Prices

```bash
curl https://app.winmo.xyz/api/agent/prices
```

Returns live CoinGecko prices for 50+ crypto tokens merged with static prices for stocks, commodities, and bonds.

**Response:**
```json
{
  "BTC": { "price": 104250.00, "change24h": 1.45 },
  "ETH": { "price": 3890.50, "change24h": 2.78 },
  "SOL": { "price": 248.30, "change24h": 5.12 },
  "NVDA": { "price": 140.11, "change24h": 2.15 }
}
```

---

## Yield Protocols

```bash
# All protocols (11 total)
curl https://app.winmo.xyz/api/agent/yield

# Safe protocols only
curl https://app.winmo.xyz/api/agent/yield?riskLevel=safe
```

Risk levels: `safe`, `low`, `high-yield`, `speculative`

**Response:**
```json
[
  {
    "id": "wsteth",
    "name": "wstETH",
    "protocol": "Lido",
    "network": "Ethereum",
    "asset": "ETH",
    "apy": 2.5,
    "totalDeposits": "$18.7B",
    "riskLevel": "safe",
    "strategy": "Stake ETH via Lido, wrap it as wstETH. Earns Ethereum staking rewards while staying liquid.",
    "liveApy": 2.8,
    "liveTvl": 18500000000
  }
]
```

`liveApy` and `liveTvl` are enriched from DeFi Llama when available.

---

## Swap Quotes

Get real-time swap quotes from **Jupiter** (Solana) or **KyberSwap** (Ethereum).

```bash
# Buy ETH with 100 USDC on Ethereum
curl "https://app.winmo.xyz/api/agent/quote?from=USDC&to=ETH&amount=100&chain=ethereum"

# Buy SOL with 50 USDC on Solana
curl "https://app.winmo.xyz/api/agent/quote?from=USDC&to=SOL&amount=50&chain=solana"

# Buy tokenized NVIDIA with USDC on Solana
curl "https://app.winmo.xyz/api/agent/quote?from=USDC&to=NVDA&amount=200&chain=solana"

# Buy gold (PAXG) with ETH on Ethereum
curl "https://app.winmo.xyz/api/agent/quote?from=ETH&to=XAU&amount=0.5&chain=ethereum"
```

**Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `from` | Yes | Source token symbol (USDC, ETH, SOL, USDT) |
| `to` | Yes | Destination token symbol (any asset) |
| `amount` | Yes | Amount of source token |
| `chain` | Yes | `solana` or `ethereum` |

**Response:**
```json
{
  "chain": "ethereum",
  "from": "USDC",
  "to": "ETH",
  "amount": "100",
  "fromAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "toAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "quote": { "routeSummary": {}, "routerAddress": "0x..." }
}
```

### Payment Tokens

| Token | Ethereum Address | Solana Mint |
|-------|-----------------|-------------|
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| ETH | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` | — |
| SOL | — | `So11111111111111111111111111111111111111112` |

---

## Search

```bash
curl "https://app.winmo.xyz/api/agent/search?q=nvidia"
curl "https://app.winmo.xyz/api/agent/search?q=bitcoin"
curl "https://app.winmo.xyz/api/agent/search?q=gold"
curl "https://app.winmo.xyz/api/agent/search?q=eur"
```

Fuzzy matches on name and symbol across all assets and forex pairs.

---

## Forex Rates

```bash
curl https://app.winmo.xyz/api/agent/forex
```

Live rates from **Pyth Network** oracles for 25+ FX pairs.

**Response:**
```json
{
  "EUR/USD": { "price": 1.0842, "confidence": 0.0001, "publishTime": 1708300800 },
  "USD/JPY": { "price": 149.85, "confidence": 0.02, "publishTime": 1708300800 },
  "GBP/USD": { "price": 1.2631, "confidence": 0.0002, "publishTime": 1708300800 }
}
```

**Available pairs:** EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD, NZD/USD, EUR/JPY, EUR/GBP, EUR/CHF, EUR/AUD, EUR/CAD, EUR/NZD, GBP/JPY, GBP/AUD, GBP/CAD, GBP/NZD, GBP/CHF, AUD/JPY, AUD/NZD, AUD/CAD, CAD/JPY, CHF/JPY, NZD/JPY, USD/SGD, USD/BRL, USD/MXN, USD/TRY, USD/ZAR, USD/HKD, USD/NOK, USD/SEK

---

## Token Addresses

Get on-chain token addresses for building swap transactions.

```bash
# All stock tokens on Ethereum
curl "https://app.winmo.xyz/api/agent/tokens?category=stocks&chain=ethereum"

# All crypto tokens on Solana
curl "https://app.winmo.xyz/api/agent/tokens?category=crypto&chain=solana"
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

When running inside the WinMo DApp, `window.winmo` provides full programmatic access including wallet operations.

```javascript
// Wait for WinMo
await window.winmo.ready

// Read data (no wallet needed)
const assets = await window.winmo.getAssets('crypto')
const prices = await window.winmo.getPrices()
const rates  = await window.winmo.getForexRates()
const yields = await window.winmo.getYieldProtocols('safe')
const results = await window.winmo.searchAssets('nvidia')
const detail = await window.winmo.getAsset('btc')

// Get quote (no wallet needed)
const quote = await window.winmo.getQuote({
  from: 'USDC', to: 'ETH', amount: '100', chain: 'ethereum'
})

// Wallet state (sync, no await)
const state = window.winmo.getWalletState()
// { isConnected, evmAddress, solanaAddress, displayName, ensName }

// Portfolio (wallet required)
const holdings = await window.winmo.getPortfolio()
// [{ symbol: "ETH", chain: "ethereum", balance: "1.5" }, ...]

const balance = await window.winmo.getBalance('ETH', 'ethereum')
// "1.5"

// Execute swap (wallet required, prompts for signature)
const tx = await window.winmo.executeSwap({
  from: 'USDC', to: 'ETH', amount: '100', chain: 'ethereum'
})
// { chain: "ethereum", txHash: "0xabc..." }
```

---

## Supported Chains

| Chain | Swaps Via | Tokens | Wallets |
|-------|----------|--------|---------|
| **Ethereum** | KyberSwap | 27 ERC-20 + all Ondo/Backed tokens | MetaMask, Coinbase, WalletConnect |
| **Solana** | Jupiter | 20+ SPL + all Ondo tokens | Phantom, Solflare, Coinbase, Ledger |

---

## Error Format

All errors return:
```json
{ "error": "Human-readable message" }
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Missing or invalid parameters |
| 404 | Asset or endpoint not found |
| 502 | Upstream API error (Jupiter, KyberSwap, CoinGecko, Pyth) |

---

## Rate Limits

No rate limits on WinMo endpoints. Upstream caches:
- Prices: 60s (CoinGecko)
- Forex: 10s (Pyth)
- Quotes: Real-time (avoid polling faster than 1/sec)

---

## Discovery

| File | URL | Format |
|------|-----|--------|
| This skill file | `/skill.md` | Markdown with frontmatter |
| LLM discovery | `/llms.txt` | Markdown (llmstxt.org spec) |
| Agent schema | `/.well-known/agents.json` | JSON capability schema |
| OpenAPI spec | `/openapi.json` | OpenAPI 3.1 |
| Endpoint directory | `/api/agent/` | JSON |

---

**No API key. No registration. No authentication. Just fetch and trade.**

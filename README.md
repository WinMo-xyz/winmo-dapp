# WinMo

**Stocks, crypto, commodities, bonds, forex. One portfolio, fully onchain. Buy anything from anywhere.**

WinMo is a multi-chain DeFi portfolio DApp that unifies Ethereum and Solana into a single interface. Connect any wallet, view combined holdings, browse 100+ tradeable assets across every major asset class, get live swap quotes, and explore yield farming — all without leaving the app.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Solana](https://img.shields.io/badge/Solana-Mainnet-green) ![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-blue)

---

## Table of Contents

- [Features](#features)
- [Asset Coverage](#asset-coverage)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Pages & Routes](#pages--routes)
- [Multi-Chain Integration](#multi-chain-integration)
- [Swap Engine](#swap-engine)
- [Yield Farming](#yield-farming)
- [Forex Trading](#forex-trading)
- [AI Agent API](#ai-agent-api)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Tech Stack](#tech-stack)

---

## Features

### Multi-Chain Portfolio
- Connect Ethereum wallets via RainbowKit (MetaMask, Coinbase, WalletConnect, and more)
- Connect Solana wallets via Wallet Adapter (Phantom, Solflare, Coinbase, Ledger)
- View combined portfolio holdings from both chains in a single dashboard
- Real-time portfolio valuation with live price feeds

### Universal Asset Directory
- Browse 100+ tradeable assets across 5 categories
- Filter by subcategory (large-cap, mid-cap, small-cap, ETF, etc.)
- Search by name or symbol across all asset classes and forex pairs
- Detailed asset pages with descriptions, news, provider info, and chain availability

### Swap & Trade
- Get instant swap quotes from Jupiter (Solana) and KyberSwap (Ethereum)
- Execute trades directly through the DApp with wallet signing
- Support for tokenized real-world assets via Ondo and Backed Finance
- Buy stocks, commodities, and bonds onchain using USDC, USDT, ETH, or SOL

### Yield Farming
- Curated yield protocols across 4 risk tiers (Safe, Low, High-Yield, Speculative)
- Live APY data from DeFi Llama integration
- Detailed strategy descriptions for each protocol
- Direct deposit links and token addresses

### Forex Trading
- 25+ currency pairs including majors, crosses, and exotics
- Live rates from Pyth Network oracles (sub-second updates)
- Cross-rate matrix for 9 major currencies
- Stablecoin swap execution on Solana (USDC, EURC, GYEN, etc.)

### AI Agent Compatible
- `window.winmo` browser API for in-page automation
- REST API at `/api/agent/*` for remote agents
- Discovery files at `/llms.txt` and `/.well-known/agents.json`
- See [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) for full documentation

---

## Asset Coverage

| Category | Count | Subcategories | Examples |
|----------|-------|---------------|----------|
| **Stocks** | 47 | Pre-IPO, Large Cap, Mid Cap, Small Cap, ETF | NVDA, TSLA, AAPL, SPY, OpenAI, Anthropic |
| **Crypto** | 33 | Large Cap, Mid Cap, Small Cap | BTC, ETH, SOL, JUP, UNI, BONK |
| **Commodities** | 12 | Precious Metals, Energy, Industrial, Broad | Gold/PAXG, Silver, Oil, Copper |
| **Bonds** | 10 | Treasury, Corporate, CLO | TLT, SGOV, HYG, CLOA |
| **Forex** | 25+ pairs | Major, Cross, Exotic | EUR/USD, USD/JPY, GBP/USD |

### Tokenization Providers

Real-world assets (stocks, commodities, bonds) are tradeable onchain through tokenization providers:

| Provider | Assets | Chains |
|----------|--------|--------|
| **Ondo Finance** | 40+ stocks, ETFs, bonds, commodities | Ethereum, Solana |
| **Backed Finance** | Select large-cap stocks | Solana |
| **Paxos** | Gold (PAXG) | Ethereum, Solana |
| **Tether** | Gold (XAUT) | Ethereum |

---

## Architecture

### Provider Stack

```
ThemeProvider
  WagmiProvider
    QueryClientProvider
      RainbowKitProvider
        ConnectionProvider (Solana RPC)
          SolanaWalletProvider
            WalletModalProvider
              BrowserRouter
                WalletProvider (unified context)
                  WinmoAgentProvider (window.winmo API)
                    App
```

### Key Layers

| Layer | Directory | Purpose |
|-------|-----------|---------|
| **Context** | `src/context/` | `WalletContext` unifies EVM + Solana wallet state. `ThemeContext` handles dark/light mode. |
| **Services** | `src/services/` | API integrations — CoinGecko prices, Jupiter swaps, KyberSwap swaps, Pyth forex, asset data. |
| **Config** | `src/config/` | Chain configs, token lists, wallet adapters, forex feed IDs. |
| **Pages** | `src/pages/` | Route-level components with lazy loading. |
| **Components** | `src/components/` | Shared UI components (Navbar, ProtectedRoute, charts, cards). |
| **Agent** | `src/agent/` | `WinmoAgentProvider` exposes `window.winmo` browser API. |
| **Functions** | `functions/` | Netlify serverless functions for API proxying and the Agent REST API. |

### Styling

- Pure CSS with CSS custom properties for theming (dark/light mode)
- Glassmorphism design system (`.glass-card`, gradient borders, blur effects)
- Fonts: "Clash Display" (headings) + "Satoshi" (body) from Fontshare
- Responsive breakpoints at 768px and 480px
- No Tailwind or CSS-in-JS — each component has a co-located `.css` file

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/AyushGupta45/winmo-dapp.git
cd winmo-dapp
npm install
```

### Development

```bash
npm run dev
```

The dev server starts with API proxies configured for CoinGecko, CoinMarketCap, KyberSwap, Jupiter, Pyth, and DeFi Llama. No API keys are required for basic development — prices fall back to static data.

For live crypto prices, set your CoinMarketCap API key:

```bash
VITE_CMC_API_KEY=your_key_here npm run dev
```

### Production Build

```bash
npm run build
npm run preview  # Preview locally
```

---

## Pages & Routes

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Home | Public | Landing page with chain/wallet selector |
| `/portfolio` | Portfolio | Wallet required | Combined EVM + Solana holdings with live valuation |
| `/stocks` | Assets | Wallet required | Stock directory (Pre-IPO, Large Cap, Mid Cap, Small Cap, ETF) |
| `/crypto` | Assets | Wallet required | Crypto directory (Large Cap, Mid Cap, Small Cap) |
| `/commodities` | Assets | Wallet required | Commodities directory (Precious Metals, Energy, Industrial) |
| `/bonds` | Assets | Wallet required | Bonds directory (Treasury, Corporate, CLO) |
| `/assets/:id` | AssetDetail | Wallet required | Full asset detail with description, news, buy/sell, providers |
| `/yield` | Yield | Wallet required | Yield farming protocols by risk tier |
| `/forex` | Forex | Wallet required | Forex pairs with live Pyth rates and cross-rate matrix |
| `/forex/:pair` | ForexPair | Wallet required | Individual pair detail with chart and swap |

All protected routes redirect to Home if no wallet is connected.

---

## Multi-Chain Integration

### Ethereum (EVM)

- **Library:** wagmi + viem + RainbowKit
- **Network:** Ethereum Mainnet
- **Wallets:** MetaMask, Coinbase Wallet, WalletConnect, Rainbow, and more
- **Tokens:** 27 ERC-20 tokens configured with contract addresses
- **Swaps:** KyberSwap Aggregator API (best route across all Ethereum DEXs)

### Solana

- **Library:** @solana/web3.js + Wallet Adapter
- **Network:** Solana Mainnet-Beta
- **Wallets:** Phantom, Solflare, Coinbase, Ledger
- **Tokens:** 20+ SPL tokens configured with mint addresses
- **Swaps:** Jupiter Aggregator API (best route across all Solana DEXs)

### Unified Wallet Context

The `WalletContext` provides a single API regardless of which chain is connected:

```js
const { isConnected, evmAddress, solanaAddress, displayName, ensName } = useWallet()
```

---

## Swap Engine

WinMo supports buying and selling any tokenized asset using payment tokens:

### Payment Tokens

| Token | Ethereum | Solana |
|-------|----------|--------|
| USDC | `0xA0b8...eB48` | `EPjFW...Dt1v` |
| USDT | `0xdAC1...1ec7` | `Es9vM...wNYB` |
| ETH | Native | — |
| SOL | — | Native |

### Flow

1. User selects an asset and payment token
2. DApp resolves the on-chain address via providers (Ondo, Backed) or token lists
3. Fetches a quote from Jupiter (Solana) or KyberSwap (Ethereum)
4. User reviews the quote (price impact, output amount, route)
5. User signs the transaction via their wallet
6. DApp submits and confirms the transaction on-chain

---

## Yield Farming

11 curated protocols across 4 risk tiers:

| Risk Level | Protocols | APY Range | Example |
|------------|-----------|-----------|---------|
| **Safe** | 4 | 2.5% – 7.2% | wstETH (Lido), JitoSOL (Jito), sUSDS (Sky) |
| **Low** | 2 | 6.5% – 10.5% | sUSDe (Ethena), wstUSR (Resolv) |
| **High-Yield** | 2 | 7.5% – 40% | SYRUPUSDC (Maple), RLP (Resolv) |
| **Speculative** | 3 | 15% – 38% | JLP (Jupiter), ONyc (Onyx), PRIME (Echelon) |

Live APY data is enriched from DeFi Llama when available.

---

## Forex Trading

WinMo integrates Pyth Network oracles for institutional-grade forex pricing:

- **25+ pairs** across majors (EUR/USD, USD/JPY), crosses (EUR/GBP, GBP/CHF), and exotics (USD/BRL, USD/TRY)
- **Sub-second price updates** from 90+ institutional data providers
- **Cross-rate matrix** for 9 currencies (USD, EUR, JPY, GBP, CHF, BRL, MXN, TRY, ZAR)
- **On-chain settlement** via stablecoin swaps on Solana (USDC to EURC, GYEN, etc.)
- **20+ forex stablecoins** mapped to their Solana SPL mint addresses

---

## AI Agent API

WinMo is fully AI-agent compatible. See [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) for complete documentation.

**Quick overview:**

- **Discovery:** `/llms.txt` and `/.well-known/agents.json`
- **Browser API:** `window.winmo` with 11 methods
- **REST API:** 8 endpoints at `/api/agent/*`

```js
// Browser example
const prices = await window.winmo.getPrices()
const assets = await window.winmo.getAssets('crypto')
const quote = await window.winmo.getQuote({ from: 'USDC', to: 'ETH', amount: '100', chain: 'ethereum' })
```

```bash
# REST example
curl https://your-app.netlify.app/api/agent/assets?category=stocks
curl https://your-app.netlify.app/api/agent/prices
curl https://your-app.netlify.app/api/agent/quote?from=USDC&to=ETH&amount=100&chain=ethereum
```

---

## Deployment

### Netlify (configured)

The project includes `netlify.toml` with:
- Build command: `npm run build`
- Publish directory: `dist`
- Serverless functions in `functions/`
- API proxy redirects for all external services
- SPA fallback routing
- Cache headers for assets

### Serverless Functions

| Function | Route | Purpose |
|----------|-------|---------|
| `cmc-proxy` | `/api/cmc/*` | CoinMarketCap price proxy |
| `gecko-proxy` | `/api/gecko/*` | CoinGecko price proxy |
| `kyberswap-proxy` | `/api/kyberswap/*` | KyberSwap swap route proxy |
| `jupiter-proxy` | `/api/jupiter/*` | Jupiter swap quote proxy |
| `solana-rpc-proxy` | `/api/solana-rpc` | Solana RPC proxy |
| `defillama-proxy` | `/api/defillama/*` | DeFi Llama yield data proxy |
| `pyth-proxy` | `/api/pyth/*` | Pyth Network forex proxy |
| `agent-api` | `/api/agent/*` | AI Agent REST API |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CMC_API_KEY` | Optional | CoinMarketCap API key for live crypto prices |
| `VITE_KYBERSWAP_CLIENT_ID` | Optional | KyberSwap client ID for rate-limit priority |
| `VITE_SOLANA_RPC` | Optional | Custom Solana RPC endpoint (defaults to mainnet-beta) |
| `JUPITER_API_KEY` | Optional | Jupiter API key for the agent REST API quote endpoint |

API keys are injected via Vite dev proxy headers or Netlify function environment — they are never exposed to the browser.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router 7 |
| **State** | React Context + TanStack Query 5 |
| **Ethereum** | wagmi 2 + viem 2 + RainbowKit 2 |
| **Solana** | @solana/web3.js + Wallet Adapter |
| **Styling** | Pure CSS + CSS Custom Properties |
| **Fonts** | Clash Display + Satoshi (Fontshare) |
| **Deployment** | Netlify + Serverless Functions |
| **Prices** | CoinGecko + CoinMarketCap + Pyth Network |
| **Swaps** | Jupiter (Solana) + KyberSwap (Ethereum) |
| **Yield** | DeFi Llama |
| **Tokenization** | Ondo Finance + Backed Finance + Paxos |

---

## License

This project is proprietary software. All rights reserved.

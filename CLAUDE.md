# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WinMo is a multi-chain DeFi portfolio DApp supporting both Ethereum (EVM) and Solana. Built with React 19 + Vite, it lets users connect wallets from either chain, view combined portfolio holdings, browse tradeable assets, and explore yield farming opportunities.

## Commands

```bash
npm run dev       # Start Vite dev server (with API proxies for CMC, CoinGecko, 1inch)
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

### Provider Stack (main.jsx)
`QueryClientProvider` → `WagmiProvider` → `RainbowKitProvider` → `SolanaWalletProvider` → `WalletProvider` → `ThemeProvider` → `App`

### Routing (App.jsx)
- `/` — Home (landing page, chain/wallet selector)
- `/portfolio` — Portfolio (protected, requires wallet)
- `/assets` — Asset directory (protected)
- `/assets/:id` — Asset detail (protected)
- `/yield` — Yield farming (protected)

All routes except `/` are wrapped in `<ProtectedRoute>`, which checks wallet connection via `WalletContext`.

### Key Layers

**Context (`src/context/`)**: `WalletContext` unifies EVM (wagmi) and Solana wallet state into a single API. `ThemeContext` handles dark/light mode with localStorage persistence.

**Hooks (`src/hooks/`)**: `usePortfolio` reads EVM ERC-20 balances via wagmi. `useSolanaPortfolio` reads SPL token balances via @solana/spl-token. `useLivePrices` polls CoinMarketCap API every 60s with a TTL cache.

**Services (`src/services/`)**: `cmcApi.js` fetches live crypto prices through the Vite dev proxy (`/api/cmc`). `portfolio.js` provides demo/fallback data. `assets.js` contains static asset metadata (crypto, stocks, commodities, bonds). `yield.js` has yield protocol details.

**Config (`src/config/`)**: `wagmi.js` configures RainbowKit for Ethereum mainnet. `solana.js` sets up Solana RPC + wallet adapters (Phantom, Solflare, Coinbase, Ledger). `tokens.js` and `solanaTokens.js` define supported token lists with contract addresses/mints and a minimal ERC-20 ABI.

### Chain Integration
- **Ethereum**: wagmi + viem + RainbowKit. Mainnet only. 27 ERC-20 tokens configured.
- **Solana**: @solana/web3.js + wallet-adapter. Mainnet-beta. 20+ SPL tokens configured.
- Portfolio page merges holdings from both chains into a single view.

### Styling
Pure CSS with CSS custom properties for theming. No Tailwind or CSS-in-JS. Each component has a co-located `.css` file. Design system defined in `src/styles/global.css` with glassmorphism (`.glass-card`), gradient borders, and animation keyframes. Fonts: "Clash Display" (headings) + "Satoshi" (body) from Fontshare. Breakpoints at 768px and 480px.

## Environment Variables

```
VITE_CMC_API_KEY       # CoinMarketCap API key (required for live prices)
VITE_1INCH_API_KEY     # 1inch DEX aggregator key
VITE_SOLANA_RPC        # Custom Solana RPC (defaults to mainnet-beta)
```

API keys are injected via Vite dev proxy headers in `vite.config.js` — they are NOT sent from the browser directly.

## Deployment

Configured for Netlify (`netlify.toml`). Serverless functions in `netlify/functions/` proxy API calls in production (replacing Vite dev proxy).

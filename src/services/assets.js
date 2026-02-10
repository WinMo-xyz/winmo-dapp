import { fetchCryptoPrices } from './cmcApi.js'
import { SPL_TOKEN_LIST } from '../config/solanaTokens.js'

const CB = 'https://logo.clearbit.com/'
const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

const stocks = [
  // Pre-IPO
  { id: 'openai', name: 'OpenAI', symbol: 'OPENAI', price: 245.00, change24h: 3.45, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'openai.com' },
  { id: 'anthropic', name: 'Anthropic', symbol: 'ANTH', price: 185.50, change24h: 2.78, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'anthropic.com' },
  { id: 'xai', name: 'xAI', symbol: 'XAI', price: 120.75, change24h: 4.12, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'x.ai' },
  { id: 'spacex', name: 'SpaceX', symbol: 'SPACEX', price: 350.00, change24h: 1.95, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'spacex.com' },
  { id: 'polymarket', name: 'Polymarket', symbol: 'POLY', price: 42.30, change24h: 5.67, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'polymarket.com' },
  // Large Cap
  { id: 'spy', name: 'S&P 500 ETF', symbol: 'SPY', price: 605.20, change24h: 0.45, category: 'stocks', subcategory: 'large-cap', logo: CB + 'ssga.com' },
  { id: 'aapl', name: 'Apple', symbol: 'AAPL', price: 198.45, change24h: 0.67, category: 'stocks', subcategory: 'large-cap', logo: CB + 'apple.com' },
  { id: 'googl', name: 'Alphabet', symbol: 'GOOGL', price: 175.80, change24h: -0.45, category: 'stocks', subcategory: 'large-cap', logo: CB + 'abc.xyz' },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', price: 445.20, change24h: 1.12, category: 'stocks', subcategory: 'large-cap', logo: CB + 'microsoft.com' },
  { id: 'meta', name: 'Meta', symbol: 'META', price: 585.30, change24h: 1.89, category: 'stocks', subcategory: 'large-cap', logo: CB + 'meta.com' },
  { id: 'tsla', name: 'Tesla', symbol: 'TSLA', price: 248.50, change24h: -2.34, category: 'stocks', subcategory: 'large-cap', logo: CB + 'tesla.com' },
  { id: 'jpm', name: 'JPMorgan Chase & Co', symbol: 'JPM', price: 242.80, change24h: 0.78, category: 'stocks', subcategory: 'large-cap', logo: CB + 'jpmorganchase.com' },
  // Mid Cap
  { id: 'mcd', name: "McDonald's Corp", symbol: 'MCD', price: 295.60, change24h: 0.34, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'mcdonalds.com' },
  { id: 'pep', name: 'PepsiCo', symbol: 'PEP', price: 168.90, change24h: -0.56, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'pepsico.com' },
  { id: 'c', name: 'Citigroup', symbol: 'C', price: 65.40, change24h: 1.23, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'citigroup.com' },
  { id: 'ba', name: 'Boeing', symbol: 'BA', price: 178.20, change24h: -1.45, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'boeing.com' },
  // Small Cap
  { id: 'sbux', name: 'Starbucks', symbol: 'SBUX', price: 98.75, change24h: 0.89, category: 'stocks', subcategory: 'small-cap', logo: CB + 'starbucks.com' },
  { id: 'adbe', name: 'Adobe', symbol: 'ADBE', price: 485.30, change24h: 2.12, category: 'stocks', subcategory: 'small-cap', logo: CB + 'adobe.com' },
  { id: 'intu', name: 'Intuit', symbol: 'INTU', price: 625.40, change24h: 1.56, category: 'stocks', subcategory: 'small-cap', logo: CB + 'intuit.com' },
]

const crypto = [
  // Large Cap
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 248.30, change24h: 5.12, category: 'crypto', subcategory: 'large-cap', logo: CI + 'sol.svg' },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 104250.00, change24h: 1.45, category: 'crypto', subcategory: 'large-cap', logo: CI + 'btc.svg', ethereumAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3890.50, change24h: 2.78, category: 'crypto', subcategory: 'large-cap', logo: CI + 'eth.svg', ethereumAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 715.40, change24h: 0.89, category: 'crypto', subcategory: 'large-cap', logo: CI + 'bnb.svg', ethereumAddress: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605' },
  // Mid Cap
  { id: 'jup', name: 'Jupiter', symbol: 'JUP', price: 1.24, change24h: 4.56, category: 'crypto', subcategory: 'mid-cap', logo: 'https://static.jup.ag/jup/icon.png' },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', price: 14.20, change24h: 4.56, category: 'crypto', subcategory: 'mid-cap', logo: CI + 'uni.svg', ethereumAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  { id: 'mnt', name: 'Mantle', symbol: 'MNT', price: 1.08, change24h: 2.34, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'mantle.xyz', ethereumAddress: '0x3c3a81e81dc49a522a592e7622a7e711c06bf354' },
  // Small Cap
  { id: 'ray', name: 'Raydium', symbol: 'RAY', price: 5.85, change24h: 3.12, category: 'crypto', subcategory: 'small-cap', logo: CI + 'ray.svg' },
  { id: 'orca-token', name: 'Orca', symbol: 'ORCA', price: 4.20, change24h: 2.45, category: 'crypto', subcategory: 'small-cap', logo: CI + 'orca.svg' },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.0000234, change24h: 7.89, category: 'crypto', subcategory: 'small-cap', logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
  { id: 'pyth', name: 'Pyth Network', symbol: 'PYTH', price: 0.42, change24h: 1.67, category: 'crypto', subcategory: 'small-cap', logo: 'https://pyth.network/token.png' },
]

const commodities = [
  { id: 'gold', name: 'Gold', symbol: 'XAU', price: 2685.40, change24h: 0.34, category: 'commodities', logo: CB + 'gold.org' },
]

const bonds = [
  { id: 'tlt', name: 'iShares 20+ Year Treasury Bond ETF', symbol: 'TLT', price: 91.50, change24h: -0.22, category: 'bonds', logo: CB + 'ishares.com', ethereumAddress: '0x992651BFeB9A0DCC4457610E284ba66D86489d4d' },
  { id: 'hyg', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', symbol: 'HYG', price: 78.60, change24h: 0.15, category: 'bonds', logo: CB + 'ishares.com', ethereumAddress: '0xeD3618Bb8778F8eBBe2f241Da532227591771D04' },
  { id: 'sgov', name: 'iShares 0-3 Month Treasury Bond ETF', symbol: 'SGOV', price: 100.12, change24h: 0.01, category: 'bonds', logo: CB + 'ishares.com', ethereumAddress: '0x8de5d49725550f7b318b2fa0f1b1f118e98e8d0f' },
  { id: 'agg', name: 'iShares Core US Aggregate Bond ETF', symbol: 'AGG', price: 97.85, change24h: -0.08, category: 'bonds', logo: CB + 'ishares.com', ethereumAddress: '0xfF7CF16aA2fFc463b996DB2f7B7cf0130336899D' },
]

const assetDetails = {
  btc: {
    description: 'The original crypto. Launched in 2009 by the pseudonymous Satoshi Nakamoto, BTC runs on a global peer-to-peer network with no central authority.',
    news: [
      { title: 'Bitcoin Spot ETFs Cross $120B in Total AUM', date: '2026-02-07', source: 'CoinDesk' },
      { title: 'Bitcoin Hash Rate Hits 800 EH/s as Mining Expands', date: '2026-02-02', source: 'The Block' },
      { title: 'El Salvador Launches Bitcoin-Backed Sovereign Bond', date: '2026-01-27', source: 'Financial Times' },
    ],
  },
  eth: {
    description: 'The programmable blockchain. Ethereum lets anyone deploy smart contracts and apps without middlemen. Most of DeFi runs on it.',
    news: [
      { title: 'Ethereum Pectra Upgrade Goes Live, Cuts L2 Fees 80%', date: '2026-02-08', source: 'The Block' },
      { title: 'Ethereum L2 TVL Surpasses $85B Across All Rollups', date: '2026-02-03', source: 'DeFi Llama' },
      { title: 'BlackRock Ethereum ETF Sees Record Weekly Inflows', date: '2026-01-28', source: 'Bloomberg' },
    ],
  },
  sol: {
    description: 'Fast and cheap. Solana settles transactions in under a second for fractions of a cent. Big DeFi and NFT scene, powered by its Proof of History consensus.',
    news: [
      { title: 'Solana Processes 100K TPS During Firedancer Stress Test', date: '2026-02-06', source: 'The Block' },
      { title: 'Solana DeFi TVL Breaks $25B as New Protocols Launch', date: '2026-02-01', source: 'DeFi Llama' },
      { title: 'Visa Expands Stablecoin Settlement to Solana Network', date: '2026-01-26', source: 'CoinDesk' },
    ],
  },
  jup: {
    description: 'Solana\'s go-to DEX aggregator. Jupiter finds the best price across every liquidity source on the chain. Also does limit orders, DCA, and perps.',
    news: [
      { title: 'Jupiter V8 Aggregator Launches with Cross-Chain Routing', date: '2026-02-05', source: 'The Block' },
      { title: 'JUP Staking Hits $1.5B as Governance Activity Surges', date: '2026-01-30', source: 'DeFi Llama' },
      { title: 'Jupiter Perps Volume Tops $2B in Single Day', date: '2026-01-24', source: 'CoinDesk' },
    ],
  },
  gold: {
    description: 'The oldest store of value around. People have been hoarding gold for thousands of years, and central banks still do.',
    news: [
      { title: 'Gold Crosses $2,800 as Central Banks Accelerate Buying', date: '2026-02-07', source: 'Bloomberg' },
      { title: 'Tokenized Gold Market Hits $5B TVL on Ethereum', date: '2026-02-01', source: 'DeFi Pulse' },
      { title: 'China Adds 30 Tonnes of Gold to Reserves in January', date: '2026-01-28', source: 'World Gold Council' },
    ],
  },
  aapl: {
    description: 'iPhones, Macs, iPads, wearables. Apple makes the hardware and runs the ecosystem that a few billion people use daily.',
    news: [
      { title: 'Apple Reports Record Q1 Revenue Driven by AI Features', date: '2026-02-06', source: 'CNBC' },
      { title: 'Apple Intelligence Expands to 30 Languages in iOS 19.3', date: '2026-01-31', source: 'TechCrunch' },
      { title: 'Apple Vision Pro 2 Announced at Reduced Price Point', date: '2026-01-25', source: 'Bloomberg' },
    ],
  },
  tsla: {
    description: 'EVs, batteries, solar. Tesla makes electric cars and energy storage, and ships more EVs than anyone else in the US.',
    news: [
      { title: 'Tesla Robotaxi Service Launches in Austin and LA', date: '2026-02-08', source: 'Reuters' },
      { title: 'Tesla Q4 Deliveries Beat Estimates at 620K Vehicles', date: '2026-02-02', source: 'Electrek' },
      { title: 'Tesla Megapack Factory Reaches 100 GWh Annual Capacity', date: '2026-01-27', source: 'Bloomberg' },
    ],
  },
  openai: {
    description: 'The company behind ChatGPT and GPT-5. OpenAI builds frontier AI models and is one of the most valuable private tech companies in the world.',
    news: [
      { title: 'OpenAI Valued at $300B in Latest Secondary Sale', date: '2026-02-07', source: 'The Information' },
      { title: 'GPT-5 Enterprise Adoption Drives $15B ARR Milestone', date: '2026-02-01', source: 'Bloomberg' },
      { title: 'OpenAI Restructures to For-Profit as IPO Rumors Grow', date: '2026-01-26', source: 'Financial Times' },
    ],
  },
  anthropic: {
    description: 'AI safety company behind Claude. Anthropic focuses on building reliable and interpretable AI systems, backed by Google and major VCs.',
    news: [
      { title: 'Anthropic Raises $5B Series E at $90B Valuation', date: '2026-02-06', source: 'TechCrunch' },
      { title: 'Claude Enterprise Crosses 500K Business Customers', date: '2026-01-30', source: 'The Information' },
      { title: 'Anthropic Partners with AWS on Custom AI Chip Program', date: '2026-01-25', source: 'Bloomberg' },
    ],
  },
  spacex: {
    description: 'Elon Musk\'s rocket company. SpaceX builds Falcon 9, Starship, and runs Starlink — the world\'s largest satellite internet constellation.',
    news: [
      { title: 'Starship Completes First Orbital Refueling Mission', date: '2026-02-08', source: 'Reuters' },
      { title: 'Starlink Surpasses 10 Million Subscribers Globally', date: '2026-02-02', source: 'Bloomberg' },
      { title: 'SpaceX Valued at $350B in Latest Tender Offer', date: '2026-01-27', source: 'Financial Times' },
    ],
  },
  msft: {
    description: 'Cloud, Office, Windows, Xbox, LinkedIn. Microsoft is the world\'s most valuable company and a dominant force in enterprise AI through its OpenAI partnership.',
    news: [
      { title: 'Microsoft Azure AI Revenue Grows 80% Year over Year', date: '2026-02-05', source: 'CNBC' },
      { title: 'Microsoft Copilot Reaches 100M Monthly Active Users', date: '2026-01-31', source: 'TechCrunch' },
      { title: 'Microsoft Reports Record Q2 Cloud Revenue at $40B', date: '2026-01-26', source: 'Bloomberg' },
    ],
  },
  meta: {
    description: 'Social media giant behind Facebook, Instagram, WhatsApp, and Threads. Meta is also investing heavily in AR/VR and open-source AI models.',
    news: [
      { title: 'Meta Llama 4 Tops Benchmarks, Open-Source AI Surges', date: '2026-02-07', source: 'The Verge' },
      { title: 'Instagram Reaches 3 Billion Monthly Active Users', date: '2026-02-01', source: 'TechCrunch' },
      { title: 'Meta Quest 4 Pre-Orders Sell Out in 24 Hours', date: '2026-01-28', source: 'Bloomberg' },
    ],
  },
  spy: {
    description: 'The SPDR S&P 500 ETF. Tracks the 500 largest US public companies — the most traded ETF in the world and a benchmark for the US stock market.',
    news: [
      { title: 'S&P 500 Hits Record High as AI Rally Broadens', date: '2026-02-06', source: 'Bloomberg' },
      { title: 'SPY ETF Inflows Top $50B in January 2026', date: '2026-02-02', source: 'CNBC' },
      { title: 'US Q4 GDP Growth Beats Expectations at 3.2%', date: '2026-01-27', source: 'Reuters' },
    ],
  },
  uni: {
    description: 'The leading DEX protocol. Uniswap pioneered automated market makers and handles billions in daily volume across Ethereum and L2s.',
    news: [
      { title: 'Uniswap V4 Hooks Drive 40% Volume Increase', date: '2026-02-05', source: 'The Block' },
      { title: 'Uniswap Labs Launches Cross-Chain Swap Feature', date: '2026-01-30', source: 'CoinDesk' },
      { title: 'UNI Governance Approves Fee Switch for Token Holders', date: '2026-01-25', source: 'DeFi Llama' },
    ],
  },
  bnb: {
    description: 'Binance\'s native token. BNB powers the BNB Chain ecosystem, covers trading fees on Binance, and is used in launchpad token sales.',
    news: [
      { title: 'BNB Chain Hits 2M Daily Active Addresses Record', date: '2026-02-06', source: 'The Block' },
      { title: 'Binance Launches Regulated Exchange in Japan and UAE', date: '2026-01-31', source: 'CoinDesk' },
      { title: 'BNB Quarterly Burn Removes $900M Worth of Tokens', date: '2026-01-26', source: 'Bloomberg' },
    ],
  },
}

// Default detail for assets without specific details
const defaultDetail = {
  description: 'Tokenized and tradable onchain through WinMo. Check the chart, read the news, and buy when you are ready.',
  news: [
    { title: 'WinMo Lists Another Tokenized Asset for Onchain Trading', date: '2026-02-05', source: 'WinMo Blog' },
    { title: 'Institutions Are Pouring Into Tokenized Assets in 2026', date: '2026-01-30', source: 'CoinDesk' },
  ],
}

const allAssets = [...stocks, ...crypto, ...commodities, ...bonds]

// Build set of symbols available on Solana from SPL token list
const _solanaSymbols = new Set(SPL_TOKEN_LIST.map(t => t.symbol))
_solanaSymbols.add('SOL') // Native SOL (WSOL is the wrapped SPL version)

// Asset symbols that differ from their SPL symbol
const _solanaAliases = { XAU: 'PAXG' }

export function getAssetChains(asset) {
  const chains = []
  if (_solanaSymbols.has(asset.symbol) || _solanaSymbols.has(_solanaAliases[asset.symbol])) {
    chains.push('solana')
  }
  if (asset.ethereumAddress) chains.push('ethereum')
  return chains
}

export function getStocks(subcategory) {
  if (!subcategory) return stocks
  return stocks.filter(s => s.subcategory === subcategory)
}

export function getCrypto(subcategory) {
  if (!subcategory) return crypto
  return crypto.filter(c => c.subcategory === subcategory)
}

export function getCommodities() {
  return commodities
}

export function getBonds() {
  return bonds
}

export function getAssetById(id) {
  const asset = allAssets.find(a => a.id === id)
  if (!asset) return null
  const detail = assetDetails[id] || defaultDetail
  return { ...asset, ...detail }
}

export function searchAssets(query) {
  const q = query.toLowerCase()
  return allAssets.filter(
    a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
  )
}

/**
 * Fetches live crypto prices from CMC and updates crypto array in-place.
 * Returns true if prices were updated, false if fallback was used.
 */
export async function refreshCryptoPrices() {
  const priceMap = await fetchCryptoPrices()
  if (!priceMap) return false

  for (const asset of crypto) {
    const live = priceMap[asset.symbol]
    if (live) {
      asset.price = live.price
      asset.change24h = live.change24h
    }
  }
  return true
}

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'
const CB = 'https://logo.clearbit.com/'

export function getPortfolio() {
  const holdings = [
    // Stablecoins
    { asset: 'USDC', symbol: 'USDC', balance: '2,400.00', price: 1.00, value: 2400.00, chain: 'Ethereum', logo: CI + 'usdc.svg' },
    { asset: 'Tether', symbol: 'USDT', balance: '1,850.00', price: 1.00, value: 1850.00, chain: 'Ethereum', logo: CI + 'usdt.svg' },
    { asset: 'Dai', symbol: 'DAI', balance: '720.00', price: 1.00, value: 720.00, chain: 'Ethereum', logo: CI + 'dai.svg' },
    // Crypto large cap
    { asset: 'Ethereum', symbol: 'ETH', balance: '0.45', price: 3890.50, value: 1750.73, chain: 'Ethereum', logo: CI + 'eth.svg' },
    { asset: 'Bitcoin', symbol: 'BTC', balance: '0.012', price: 104250.00, value: 1251.00, chain: 'Bitcoin', logo: CI + 'btc.svg' },
    { asset: 'Solana', symbol: 'SOL', balance: '4.5', price: 248.30, value: 1117.35, chain: 'Solana', logo: CI + 'sol.svg' },
    { asset: 'BNB', symbol: 'BNB', balance: '1.2', price: 715.40, value: 858.48, chain: 'BNB Chain', logo: CI + 'bnb.svg' },
    // Crypto mid/small cap
    { asset: 'Uniswap', symbol: 'UNI', balance: '25', price: 14.20, value: 355.00, chain: 'Ethereum', logo: CI + 'uni.svg' },
    { asset: 'Jupiter', symbol: 'JUP', balance: '180', price: 1.24, value: 223.20, chain: 'Solana', logo: 'https://static.jup.ag/jup/icon.png' },
    { asset: 'Mantle', symbol: 'MNT', balance: '320', price: 1.08, value: 345.60, chain: 'Ethereum', logo: CB + 'mantle.xyz' },
    { asset: 'Raydium', symbol: 'RAY', balance: '40', price: 5.85, value: 234.00, chain: 'Solana', logo: CI + 'ray.svg' },
    { asset: 'Bonk', symbol: 'BONK', balance: '5,000,000', price: 0.0000234, value: 117.00, chain: 'Solana', logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
    { asset: 'Pyth Network', symbol: 'PYTH', balance: '200', price: 0.42, value: 84.00, chain: 'Solana', logo: 'https://pyth.network/token.png' },
    // Stocks large cap
    { asset: 'Apple', symbol: 'AAPL', balance: '3', price: 198.45, value: 595.35, chain: 'Ethereum', logo: CB + 'apple.com' },
    { asset: 'Alphabet', symbol: 'GOOGL', balance: '2', price: 175.80, value: 351.60, chain: 'Ethereum', logo: CB + 'abc.xyz' },
    { asset: 'Microsoft', symbol: 'MSFT', balance: '1.5', price: 445.20, value: 667.80, chain: 'Ethereum', logo: CB + 'microsoft.com' },
    { asset: 'Meta', symbol: 'META', balance: '1', price: 585.30, value: 585.30, chain: 'Ethereum', logo: CB + 'meta.com' },
    { asset: 'Tesla', symbol: 'TSLA', balance: '2', price: 248.50, value: 497.00, chain: 'Ethereum', logo: CB + 'tesla.com' },
    { asset: 'S&P 500 ETF', symbol: 'SPY', balance: '0.8', price: 605.20, value: 484.16, chain: 'Ethereum', logo: CB + 'ssga.com' },
    { asset: 'JPMorgan Chase', symbol: 'JPM', balance: '1.5', price: 242.80, value: 364.20, chain: 'Ethereum', logo: CB + 'jpmorganchase.com' },
    // Pre-IPO
    { asset: 'OpenAI', symbol: 'OPENAI', balance: '5', price: 245.00, value: 1225.00, chain: 'Ethereum', logo: CB + 'openai.com' },
    { asset: 'Anthropic', symbol: 'ANTH', balance: '4', price: 185.50, value: 742.00, chain: 'Ethereum', logo: CB + 'anthropic.com' },
    { asset: 'SpaceX', symbol: 'SPACEX', balance: '2', price: 350.00, value: 700.00, chain: 'Ethereum', logo: CB + 'spacex.com' },
    // Commodities
    { asset: 'Gold (PAXG)', symbol: 'PAXG', balance: '0.15', price: 2685.40, value: 402.81, chain: 'Ethereum', logo: CB + 'gold.org' },
    // Bonds
    { asset: 'iShares 20+ Year Treasury', symbol: 'TLT', balance: '4', price: 91.50, value: 366.00, chain: 'Ethereum', logo: CB + 'ishares.com' },
    { asset: 'iShares 0-3M Treasury', symbol: 'SGOV', balance: '8', price: 100.12, value: 800.96, chain: 'Ethereum', logo: CB + 'ishares.com' },
  ]

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

  return {
    totalValue,
    walletCount: 2,
    networkCount: 20,
    holdings: holdings.sort((a, b) => b.value - a.value),
  }
}

export function getAIInsights() {
  return {
    allocation: {
      bad: 12,
      stocks: 45,
      commodities: 18,
      crypto: 25,
    },
    recommendations: [
      { action: 'Buy', asset: 'AAPL', reason: 'You have almost no tech exposure' },
      { action: 'Buy', asset: 'XAU', reason: 'Less than 10% in gold is risky right now' },
      { action: 'Sell', asset: 'SOUN', reason: 'Volatile small-cap, momentum is fading' },
    ],
  }
}

const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'
const CB = 'https://icon.horse/icon/'

export function getPortfolio() {
  const holdings = [
    // ─── Cash & Stablecoins (~7%) ───
    { asset: 'USDC', symbol: 'USDC', balance: '4,200.00', price: 1.00, value: 4200.00, chain: 'Ethereum', logo: CI + 'usdc.svg' },
    { asset: 'Tether', symbol: 'USDT', balance: '2,500.00', price: 1.00, value: 2500.00, chain: 'Ethereum', logo: CI + 'usdt.svg' },
    { asset: 'Dai', symbol: 'DAI', balance: '1,300.00', price: 1.00, value: 1300.00, chain: 'Ethereum', logo: CI + 'dai.svg' },

    // ─── Equities / Stocks (~37%) — broad market core + growth + value ───
    { asset: 'S&P 500 ETF', symbol: 'SPY', balance: '40', price: 605.20, value: 24208.00, chain: 'Ethereum', logo: CB + 'ssga.com' },
    { asset: 'Microsoft', symbol: 'MSFT', balance: '12', price: 445.20, value: 5342.40, chain: 'Ethereum', logo: CB + 'microsoft.com' },
    { asset: 'Apple', symbol: 'AAPL', balance: '20', price: 198.45, value: 3969.00, chain: 'Ethereum', logo: CB + 'apple.com' },
    { asset: 'Meta', symbol: 'META', balance: '5', price: 585.30, value: 2926.50, chain: 'Ethereum', logo: CB + 'meta.com' },
    { asset: 'Alphabet', symbol: 'GOOGL', balance: '15', price: 175.80, value: 2637.00, chain: 'Ethereum', logo: CB + 'abc.xyz' },
    { asset: 'JPMorgan Chase', symbol: 'JPM', balance: '10', price: 242.80, value: 2428.00, chain: 'Ethereum', logo: CB + 'jpmorganchase.com' },
    { asset: 'Tesla', symbol: 'TSLA', balance: '8', price: 248.50, value: 1988.00, chain: 'Ethereum', logo: CB + 'tesla.com' },
    // Pre-IPO satellite
    { asset: 'OpenAI', symbol: 'OPENAI', balance: '3', price: 245.00, value: 735.00, chain: 'Ethereum', logo: CB + 'openai.com' },
    { asset: 'SpaceX', symbol: 'SPACEX', balance: '2', price: 350.00, value: 700.00, chain: 'Ethereum', logo: CB + 'spacex.com' },
    { asset: 'Anthropic', symbol: 'ANTH', balance: '3', price: 185.50, value: 556.50, chain: 'Ethereum', logo: CB + 'anthropic.com' },

    // ─── Fixed Income / Bonds (~18%) — duration-balanced ───
    { asset: 'iShares 0-3M Treasury', symbol: 'SGOV', balance: '120', price: 100.12, value: 12014.40, chain: 'Ethereum', logo: CB + 'ishares.com' },
    { asset: 'iShares 20+ Year Treasury', symbol: 'TLT', balance: '115', price: 91.50, value: 10522.50, chain: 'Ethereum', logo: CB + 'ishares.com' },

    // ─── Crypto (~20%) — large-cap core + altcoin satellite ───
    { asset: 'Bitcoin', symbol: 'BTC', balance: '0.12', price: 104250.00, value: 12510.00, chain: 'Bitcoin', logo: CI + 'btc.svg' },
    { asset: 'Ethereum', symbol: 'ETH', balance: '1.8', price: 3890.50, value: 7002.90, chain: 'Ethereum', logo: CI + 'eth.svg' },
    { asset: 'Solana', symbol: 'SOL', balance: '8.5', price: 248.30, value: 2110.55, chain: 'Solana', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    { asset: 'BNB', symbol: 'BNB', balance: '1.5', price: 715.40, value: 1073.10, chain: 'Ethereum', logo: CI + 'bnb.svg' },
    { asset: 'Uniswap', symbol: 'UNI', balance: '40', price: 14.20, value: 568.00, chain: 'Ethereum', logo: CI + 'uni.svg' },
    { asset: 'Mantle', symbol: 'MNT', balance: '400', price: 1.08, value: 432.00, chain: 'Ethereum', logo: CB + 'mantle.xyz' },
    { asset: 'Jupiter', symbol: 'JUP', balance: '300', price: 1.24, value: 372.00, chain: 'Solana', logo: 'https://static.jup.ag/jup/icon.png' },
    { asset: 'Raydium', symbol: 'RAY', balance: '60', price: 5.85, value: 351.00, chain: 'Solana', logo: CI + 'ray.svg' },
    { asset: 'Pyth Network', symbol: 'PYTH', balance: '350', price: 0.42, value: 147.00, chain: 'Solana', logo: 'https://pyth.network/token.png' },

    // ─── Commodities (~8%) — inflation hedge ───
    { asset: 'Gold (PAXG)', symbol: 'PAXG', balance: '3.8', price: 2685.40, value: 10204.52, chain: 'Ethereum', logo: CB + 'gold.org' },

    // ─── Forex (~5%) — currency diversification via stablecoins ───
    { asset: 'Euro Stablecoin', symbol: 'EURS', balance: '2,800', price: 1.08, value: 3024.00, chain: 'Ethereum', logo: CI + 'eurs.svg' },
    { asset: 'Singapore Dollar', symbol: 'XSGD', balance: '2,200', price: 0.75, value: 1650.00, chain: 'Ethereum', logo: CB + 'straitsx.com' },
    { asset: 'Brazilian Digital Token', symbol: 'BRZ', balance: '8,500', price: 0.18, value: 1530.00, chain: 'Ethereum', logo: CB + 'brztoken.io' },

    // ─── Yield / Staked Assets (~5%) — passive income ───
    { asset: 'Lido Staked ETH', symbol: 'stETH', balance: '0.9', price: 3890.50, value: 3501.45, chain: 'Ethereum', logo: CB + 'lido.fi' },
    { asset: 'Marinade Staked SOL', symbol: 'mSOL', balance: '6', price: 252.40, value: 1514.40, chain: 'Solana', logo: CB + 'marinade.finance' },
    { asset: 'Jito Staked SOL', symbol: 'JitoSOL', balance: '5', price: 260.10, value: 1300.50, chain: 'Solana', logo: CB + 'jito.network' },
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
      stocks: 37,
      crypto: 20,
      bonds: 18,
      commodities: 8,
      cash: 7,
      yield: 5,
      forex: 5,
    },
    recommendations: [
      { action: 'Buy', asset: 'TLT', reason: 'Rate cuts ahead — extend bond duration for capital gains' },
      { action: 'Buy', asset: 'PAXG', reason: 'Gold below 10% is underweight for late-cycle hedging' },
      { action: 'Sell', asset: 'TSLA', reason: 'Concentrated single-stock risk — trim into SPY' },
    ],
  }
}

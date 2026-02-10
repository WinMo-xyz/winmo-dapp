import { PublicKey } from '@solana/web3.js'

const CB = 'https://logo.clearbit.com/'
const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

/**
 * SPL token list for portfolio balance reads.
 * mint: on-chain mint address (mainnet-beta)
 */
export const SPL_TOKEN_LIST = [
  // Crypto — Large Cap
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: CI + 'btc.svg',
    decimals: 9,
    mint: new PublicKey('5XZw2LKTyrfvfiskJ78AMpackRjPcyCif1WhUsPDuVqQ'),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: CI + 'eth.svg',
    decimals: 9,
    mint: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    logo: CI + 'bnb.svg',
    decimals: 9,
    mint: new PublicKey('9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa'),
  },
  // Crypto — Mid Cap
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: CI + 'uni.svg',
    decimals: 9,
    mint: new PublicKey('8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36'),
  },
  {
    symbol: 'MNT',
    name: 'Mantle',
    logo: CB + 'mantle.xyz',
    decimals: 9,
    mint: new PublicKey('4SoQ8UkWfeDH47T56PA53CZCeW4KytYCiU65CwBWoJUt'),
  },
  // Crypto — Stables & Others
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: CI + 'usdc.svg',
    decimals: 6,
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: CI + 'usdt.svg',
    decimals: 6,
    mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    logo: 'https://static.jup.ag/jup/icon.png',
    decimals: 6,
    mint: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'),
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    logo: CI + 'ray.svg',
    decimals: 6,
    mint: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    logo: CI + 'orca.svg',
    decimals: 6,
    mint: new PublicKey('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'),
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    decimals: 5,
    mint: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    logo: 'https://pyth.network/token.png',
    decimals: 6,
    mint: new PublicKey('HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'),
  },
  {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    logo: CI + 'sol.svg',
    decimals: 9,
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
  },
  // Commodities
  {
    symbol: 'PAXG',
    name: 'Gold',
    logo: CB + 'gold.org',
    decimals: 9,
    mint: new PublicKey('9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R'),
  },
  // Stocks — Pre-IPO
  {
    symbol: 'OPENAI',
    name: 'OpenAI',
    logo: CB + 'openai.com',
    decimals: 9,
    mint: new PublicKey('PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF'),
  },
  {
    symbol: 'ANTH',
    name: 'Anthropic',
    logo: CB + 'anthropic.com',
    decimals: 9,
    mint: new PublicKey('Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw'),
  },
  {
    symbol: 'XAI',
    name: 'xAI',
    logo: CB + 'x.ai',
    decimals: 9,
    mint: new PublicKey('PreC1KtJ1sBPPqaeeqL6Qb15GTLCYVvyYEwxhdfTwfx'),
  },
  {
    symbol: 'SPACEX',
    name: 'SpaceX',
    logo: CB + 'spacex.com',
    decimals: 9,
    mint: new PublicKey('PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh'),
  },
  {
    symbol: 'POLY',
    name: 'Polymarket',
    logo: CB + 'polymarket.com',
    decimals: 9,
    mint: new PublicKey('Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP'),
  },
  // Stocks — Large Cap
  {
    symbol: 'SPY',
    name: 'S&P 500 ETF',
    logo: CB + 'ssga.com',
    decimals: 9,
    mint: new PublicKey('k18WJUULWheRkSpSquYGdNNmtuE2Vbw1hpuUi92ondo'),
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    logo: CB + 'apple.com',
    decimals: 9,
    mint: new PublicKey('XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp'),
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    logo: CB + 'abc.xyz',
    decimals: 9,
    mint: new PublicKey('XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN'),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    logo: CB + 'microsoft.com',
    decimals: 9,
    mint: new PublicKey('XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX'),
  },
  {
    symbol: 'META',
    name: 'Meta',
    logo: CB + 'meta.com',
    decimals: 9,
    mint: new PublicKey('Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu'),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    logo: CB + 'tesla.com',
    decimals: 9,
    mint: new PublicKey('XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB'),
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co',
    logo: CB + 'jpmorganchase.com',
    decimals: 9,
    mint: new PublicKey('XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C'),
  },
  // Stocks — Mid Cap
  {
    symbol: 'MCD',
    name: "McDonald's Corp",
    logo: CB + 'mcdonalds.com',
    decimals: 9,
    mint: new PublicKey('XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2'),
  },
  {
    symbol: 'PEP',
    name: 'PepsiCo',
    logo: CB + 'pepsico.com',
    decimals: 9,
    mint: new PublicKey('gud6b3fYekjhMG5F818BALwbg2vt4JKoow59Md9ondo'),
  },
  {
    symbol: 'C',
    name: 'Citigroup',
    logo: CB + 'citigroup.com',
    decimals: 9,
    mint: new PublicKey('PjtfUiw6Hwd8PZ94EcUw8mBSYxp7SjjzSLeNTDKondo'),
  },
  {
    symbol: 'BA',
    name: 'Boeing',
    logo: CB + 'boeing.com',
    decimals: 9,
    mint: new PublicKey('1YVZ4LGpq8CAhpdpm3mgy7GgPb83gJczCpxLUQ3ondo'),
  },
  // Stocks — Small Cap
  {
    symbol: 'SBUX',
    name: 'Starbucks',
    logo: CB + 'starbucks.com',
    decimals: 9,
    mint: new PublicKey('iPFqjcZQTNMNXA4kbShbMhfAVD8yr8Uq9UtXMV6ondo'),
  },
  {
    symbol: 'ADBE',
    name: 'Adobe',
    logo: CB + 'adobe.com',
    decimals: 9,
    mint: new PublicKey('12Rh6JhfW4X5fKP16bbUdb4pcVCKDHFB48x8GG33ondo'),
  },
  {
    symbol: 'INTU',
    name: 'Intuit',
    logo: CB + 'intuit.com',
    decimals: 9,
    mint: new PublicKey('CozoH5HBTyyeYSQxHcWpGzd4Sq5XBaKzBzvTtN3ondo'),
  },
  // Bonds
  {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    logo: CB + 'ishares.com',
    decimals: 9,
    mint: new PublicKey('KaSLSWByKy6b9FrCYXPEJoHmLpuFZtTCJk1F1Z9ondo'),
  },
  {
    symbol: 'HYG',
    name: 'iShares iBoxx $ High Yield Corporate Bond ETF',
    logo: CB + 'ishares.com',
    decimals: 9,
    mint: new PublicKey('c5ug15fwZRfQhhVa6LHscFY33ebVDHcVCezYpj7ondo'),
  },
  {
    symbol: 'SGOV',
    name: 'iShares 0-3 Month Treasury Bond ETF',
    logo: CB + 'ishares.com',
    decimals: 9,
    mint: new PublicKey('HjrN6ChZK2QRL6hMXayjGPLFvxhgjwKEy135VRjondo'),
  },
  {
    symbol: 'AGG',
    name: 'iShares Core US Aggregate Bond ETF',
    logo: CB + 'ishares.com',
    decimals: 9,
    mint: new PublicKey('13qTjKx53y6LKGGStiKeieGbnVx3fx1bbwopKFb3ondo'),
  },
]

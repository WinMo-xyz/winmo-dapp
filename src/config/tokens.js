export const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
]

const CB = 'https://logo.clearbit.com/'
const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'

const TOKEN_LIST = [
  // Crypto — Large Cap
  {
    symbol: 'WBTC',
    name: 'Bitcoin',
    logo: CI + 'btc.svg',
    decimals: 8,
    addresses: { 1: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    logo: CI + 'bnb.svg',
    decimals: 18,
    addresses: { 1: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605' },
  },
  // Crypto — Mid Cap
  {
    symbol: 'MNT',
    name: 'Mantle',
    logo: CB + 'mantle.xyz',
    decimals: 18,
    addresses: { 1: '0x3c3a81e81dc49a522a592e7622a7e711c06bf354' },
  },
  // Crypto — Stables & Others
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: CI + 'usdc.svg',
    decimals: 6,
    addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: CI + 'usdt.svg',
    decimals: 6,
    addresses: { 1: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logo: CI + 'dai.svg',
    decimals: 18,
    addresses: { 1: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    logo: CI + 'link.svg',
    decimals: 18,
    addresses: { 1: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: CI + 'uni.svg',
    decimals: 18,
    addresses: { 1: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logo: CI + 'eth.svg',
    decimals: 18,
    addresses: { 1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  },
  // Commodities
  {
    symbol: 'PAXG',
    name: 'Gold',
    logo: CB + 'gold.org',
    decimals: 18,
    addresses: { 1: '0x45804880De22913dAFE09f4980848ECE6EcbAf78' },
  },
  // Stocks — Large Cap
  {
    symbol: 'SPY',
    name: 'S&P 500 ETF',
    logo: CB + 'ssga.com',
    decimals: 18,
    addresses: { 1: '0xFeDC5f4a6c38211c1338aa411018DFAf26612c08' },
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    logo: CB + 'apple.com',
    decimals: 18,
    addresses: { 1: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c' },
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    logo: CB + 'abc.xyz',
    decimals: 18,
    addresses: { 1: '0xbA47214eDd2bb43099611b208f75E4b42FDcfEDc' },
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    logo: CB + 'microsoft.com',
    decimals: 18,
    addresses: { 1: '0xB812837b81a3a6b81d7CD74CfB19A7f2784555E5' },
  },
  {
    symbol: 'META',
    name: 'Meta',
    logo: CB + 'meta.com',
    decimals: 18,
    addresses: { 1: '0x59644165402b611b350645555B50Afb581C71EB2' },
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    logo: CB + 'tesla.com',
    decimals: 18,
    addresses: { 1: '0xf6b1117ec07684D3958caD8BEb1b302bfD21103f' },
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co',
    logo: CB + 'jpmorganchase.com',
    decimals: 18,
    addresses: { 1: '0x03C1EC4CA9DBb168E6Db0DeF827c085999CBffaF' },
  },
  // Stocks — Mid Cap
  {
    symbol: 'MCD',
    name: "McDonald's Corp",
    logo: CB + 'mcdonalds.com',
    decimals: 18,
    addresses: { 1: '0x4C82c8cD9a218612DCe60b156B73A36705645e3b' },
  },
  {
    symbol: 'PEP',
    name: 'PepsiCo',
    logo: CB + 'pepsico.com',
    decimals: 18,
    addresses: { 1: '0x3cE219D498D807317F840f4CB0f03FA27dd65046' },
  },
  {
    symbol: 'C',
    name: 'Citigroup',
    logo: CB + 'citigroup.com',
    decimals: 18,
    addresses: { 1: '0xc46e7ef70d7cf8c17863a6b0b9be2af6a4c41abe' },
  },
  {
    symbol: 'BA',
    name: 'Boeing',
    logo: CB + 'boeing.com',
    decimals: 18,
    addresses: { 1: '0x57270D35A840BC5C094da6FBeCA033FB71eA6Ab0' },
  },
  // Stocks — Small Cap
  {
    symbol: 'SBUX',
    name: 'Starbucks',
    logo: CB + 'starbucks.com',
    decimals: 18,
    addresses: { 1: '0xf15FbC1349ab99ABAd63db3f9A510BF413bE3BeF' },
  },
  {
    symbol: 'ADBE',
    name: 'Adobe',
    logo: CB + 'adobe.com',
    decimals: 18,
    addresses: { 1: '0x7042a8fFc7c7049684BfBc2fcb41b72380755a43' },
  },
  {
    symbol: 'INTU',
    name: 'Intuit',
    logo: CB + 'intuit.com',
    decimals: 18,
    addresses: { 1: '0x6cc0afD51CE4Cb6920B775F3D6376Ab82b9A93Bb' },
  },
]

export function getTokensForChain(chainId) {
  return TOKEN_LIST
    .filter(t => t.addresses[chainId])
    .map(t => ({
      symbol: t.symbol,
      name: t.name,
      logo: t.logo,
      decimals: t.decimals,
      address: t.addresses[chainId],
    }))
}

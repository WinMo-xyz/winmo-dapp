// ─── Forex Stablecoin Token Registry (Solana) ─────────────────────────

export const FOREX_TOKENS = {
  // ── USD stablecoins ─────────────────────────────────────
  USDC:      { symbol: 'USDC',      currency: 'USD', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, name: 'USD Coin', issuer: 'Circle' },
  USDT:      { symbol: 'USDT',      currency: 'USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, name: 'Tether USD', issuer: 'Tether' },
  PYUSD:     { symbol: 'PYUSD',     currency: 'USD', mint: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo', decimals: 6, name: 'PayPal USD', issuer: 'PayPal' },
  USDS:      { symbol: 'USDS',      currency: 'USD', mint: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA',  decimals: 6, name: 'USDS', issuer: 'Sky' },
  USDG:      { symbol: 'USDG',      currency: 'USD', mint: '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', decimals: 6, name: 'Global Dollar', issuer: 'Paxos' },
  USDY:      { symbol: 'USDY',      currency: 'USD', mint: 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6', decimals: 6, name: 'Ondo US Dollar Yield', issuer: 'Ondo' },
  USDP:      { symbol: 'USDP',      currency: 'USD', mint: 'HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM', decimals: 6, name: 'Pax Dollar', issuer: 'Paxos' },
  FDUSD:     { symbol: 'FDUSD',     currency: 'USD', mint: '9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u', decimals: 6, name: 'First Digital USD', issuer: 'First Digital' },
  AUSD:      { symbol: 'AUSD',      currency: 'USD', mint: 'AUSD1jCcCyPLybk1YnvPWsHQSrZ46dxwoMniN4N2UEB9', decimals: 6, name: 'AUSD', issuer: 'AUSD' },
  USDe:      { symbol: 'USDe',      currency: 'USD', mint: 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', decimals: 9, name: 'USDe', issuer: 'Ethena' },
  USDu:      { symbol: 'USDu',      currency: 'USD', mint: '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy', decimals: 6, name: 'USDu', issuer: 'Ethena' },
  USD1:      { symbol: 'USD1',      currency: 'USD', mint: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',  decimals: 6, name: 'World Liberty Financial USD', issuer: 'WLFI' },
  CASH:      { symbol: 'CASH',      currency: 'USD', mint: 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH', decimals: 6, name: 'CASH', issuer: 'Cash' },
  GGUSD:     { symbol: 'GGUSD',     currency: 'USD', mint: 'GGUSDyBUPFg5RrgWwqEqhXoha85iYGs6cL57SyK4G2Y7', decimals: 6, name: 'GGUSD', issuer: 'GGUSD' },
  syrupUSDC: { symbol: 'syrupUSDC', currency: 'USD', mint: 'AvZZF1YaZDziPY2RCK4oJrRVrbN3mTD9NL24hPeaZeUj', decimals: 6, name: 'Syrup USDC', issuer: 'Maple' },
  USX:       { symbol: 'USX',       currency: 'USD', mint: '6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG', decimals: 6, name: 'USX', issuer: 'dForce' },
  legacyUSD: { symbol: 'legacyUSD', currency: 'USD', mint: 'BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6', decimals: 6, name: 'Legacy USD Star', issuer: 'Legacy' },
  // ── EUR stablecoins ─────────────────────────────────────
  EURC:      { symbol: 'EURC',      currency: 'EUR', mint: 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr', decimals: 6, name: 'Euro Coin', issuer: 'Circle' },
  VEUR:      { symbol: 'VEUR',      currency: 'EUR', mint: 'C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519', decimals: 9, name: 'VNX Euro', issuer: 'VNX' },
  // ── JPY ─────────────────────────────────────────────────
  GYEN:      { symbol: 'GYEN',      currency: 'JPY', mint: 'Crn4x1Y2HUKko7ox2EZMT6N2t2ZyH7eKtwkBGVnhEq1g', decimals: 6, name: 'GMO JPY', issuer: 'GMO Trust' },
  // ── GBP ─────────────────────────────────────────────────
  VGBP:      { symbol: 'VGBP',      currency: 'GBP', mint: '5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1', decimals: 9, name: 'VNX British Pound', issuer: 'VNX' },
  // ── CHF ─────────────────────────────────────────────────
  VCHF:      { symbol: 'VCHF',      currency: 'CHF', mint: 'AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch', decimals: 9, name: 'VNX Swiss Franc', issuer: 'VNX' },
  // ── BRL ─────────────────────────────────────────────────
  BRZ:       { symbol: 'BRZ',       currency: 'BRL', mint: 'FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD', decimals: 4, name: 'BRZ', issuer: 'Transfero' },
  // ── TRY ─────────────────────────────────────────────────
  TRYB:      { symbol: 'TRYB',      currency: 'TRY', mint: 'A94X2fRy3wydNShU4dRaDyap2UuoeWJGWyATtyp61WZf', decimals: 6, name: 'BiLira', issuer: 'BiLira' },
  // ── MXN ─────────────────────────────────────────────────
  MXNe:      { symbol: 'MXNe',      currency: 'MXN', mint: '6zYgzrT7X2wi9a9NeMtUvUWLLmf2a8vBsbYkocYdB9wa', decimals: 9, name: 'Real MXN', issuer: 'Membrane' },
  // ── NGN ─────────────────────────────────────────────────
  NGNC:      { symbol: 'NGNC',      currency: 'NGN', mint: '52GzcLDMfBveMRnWXKX7U3Pa5Lf7QLkWWvsJRDjWDBSk', decimals: 2, name: 'NGN Coin', issuer: 'NGNC' },
  // ── IDR ─────────────────────────────────────────────────
  IDRX:      { symbol: 'IDRX',      currency: 'IDR', mint: 'idrxTdNftk6tYedPv2M7tCFHBVCpk5rkiNRd8yUArhr',  decimals: 2, name: 'IDRX', issuer: 'IDRX' },
  // ── ZAR ─────────────────────────────────────────────────
  ZARP:      { symbol: 'ZARP',      currency: 'ZAR', mint: 'dngKhBQM3BGvsDHKhrLnjvRKfY5Q7gEnYGToj9Lk8rk',  decimals: 6, name: 'ZARP Stablecoin', issuer: 'ZARP' },
}

export const FOREX_TOKEN_LIST = Object.values(FOREX_TOKENS)

/** Get all token symbols for a given currency code (e.g. 'USD' → ['USDC','USDT',...]) */
export function getTokensByCurrency(currency) {
  return Object.values(FOREX_TOKENS).filter(t => t.currency === currency)
}

// ─── Currency Metadata ─────────────────────────────────────────────────

export const CURRENCY_META = {
  USD: { name: 'US Dollar',           flag: '\u{1F1FA}\u{1F1F8}', symbol: '$' },
  EUR: { name: 'Euro',                flag: '\u{1F1EA}\u{1F1FA}', symbol: '\u20AC' },
  JPY: { name: 'Japanese Yen',        flag: '\u{1F1EF}\u{1F1F5}', symbol: '\u00A5' },
  GBP: { name: 'British Pound',       flag: '\u{1F1EC}\u{1F1E7}', symbol: '\u00A3' },
  CHF: { name: 'Swiss Franc',         flag: '\u{1F1E8}\u{1F1ED}', symbol: 'CHF' },
  AUD: { name: 'Australian Dollar',   flag: '\u{1F1E6}\u{1F1FA}', symbol: 'A$' },
  CAD: { name: 'Canadian Dollar',     flag: '\u{1F1E8}\u{1F1E6}', symbol: 'C$' },
  NZD: { name: 'New Zealand Dollar',  flag: '\u{1F1F3}\u{1F1FF}', symbol: 'NZ$' },
  BRL: { name: 'Brazilian Real',      flag: '\u{1F1E7}\u{1F1F7}', symbol: 'R$' },
  TRY: { name: 'Turkish Lira',        flag: '\u{1F1F9}\u{1F1F7}', symbol: '\u20BA' },
  MXN: { name: 'Mexican Peso',        flag: '\u{1F1F2}\u{1F1FD}', symbol: 'MX$' },
  ZAR: { name: 'South African Rand',  flag: '\u{1F1FF}\u{1F1E6}', symbol: 'R' },
  SGD: { name: 'Singapore Dollar',    flag: '\u{1F1F8}\u{1F1EC}', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar',    flag: '\u{1F1ED}\u{1F1F0}', symbol: 'HK$' },
  NOK: { name: 'Norwegian Krone',     flag: '\u{1F1F3}\u{1F1F4}', symbol: 'kr' },
  SEK: { name: 'Swedish Krona',       flag: '\u{1F1F8}\u{1F1EA}', symbol: 'kr' },
  NGN: { name: 'Nigerian Naira',      flag: '\u{1F1F3}\u{1F1EC}', symbol: '\u20A6' },
  IDR: { name: 'Indonesian Rupiah',   flag: '\u{1F1EE}\u{1F1E9}', symbol: 'Rp' },
}

// ─── Pyth Network Feed IDs ─────────────────────────────────────────────

export const FX_FEED_IDS = {
  // Majors
  'EUR/USD': '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
  'USD/JPY': '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52',
  'GBP/USD': '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
  'USD/CHF': '0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8',
  'AUD/USD': '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80',
  'USD/CAD': '0x3112b03a41c910ed446852aacf67118cb1bec67b2cd0b9a214c58cc0eaa2ecca',
  'NZD/USD': '0x92eea8ba1b00078cdc2ef6f64f091f262e8c7d0576ee4677572f314ebfafa4c7',
  // Crosses
  'EUR/JPY': '0xd8c874fa511b9838d094109f996890642421e462c3b29501a2560cecf82c2eb4',
  'EUR/GBP': '0xc349ff6087acab1c0c5442a9de0ea804239cc9fd09be8b1a93ffa0ed7f366d9c',
  'EUR/CHF': '0x6194ee9b4ae25932ae69e6574871801f0f30b4a3317877c55301a45902aa0c1a',
  'EUR/AUD': '0xf51e4e46f00cb9153ddb379ea26672084c0263126c56102af148402b7a6d11d3',
  'EUR/CAD': '0xfec44951e54a606cbbca6fc7fb721c33bb54e4ae641a8a12d5df94313d635a12',
  'EUR/NZD': '0x589174519ec8e38c11af84436f230bcf600fdb2c9c211303d0d578fda839ea60',
  'GBP/JPY': '0xcfa65905787703c692c3cac2b8a009a1db51ce68b54f5b206ce6a55bfa2c3cd1',
  'GBP/AUD': '0xbbcf32c739841d1170ae2dfaf7c1bd2483df5cf241e2ecf5bce5d14cf09982b1',
  'GBP/CAD': '0xff940d31a543df4485af8f08e81c638cab5af80e399d9928d34f73838a8a106b',
  'GBP/NZD': '0xb02ec3a90ad50a1e46006dd78a06b1ed70f38322c2cd2010c11f6a8c83c8eb33',
  'GBP/CHF': '0xae95ee182ff568100d09257956a01d6bd663072e62fe108bae42ecca4400f527',
  'AUD/JPY': '0x8dbbb66dff44114f0bfc34a1d19f0fe6fc3906dcc72f7668d3ea936e1d6544ce',
  'AUD/NZD': '0x67f98d83d2a5ae486d99bd2ab9da74b09f167fdd4928d4e1189f2360e6943522',
  'AUD/CAD': '0x95330ad1bcac1bd79179fe59000bfe199ba3fe7f03254220548ef2d034bdf4d6',
  'CAD/JPY': '0x9e19cbf0b363b3ce3fa8533e171f449f605a7ca5bb272a9b80df4264591c4cbb',
  'CHF/JPY': '0xe9f0f24d8828dc49e1d7aa6b82373dfaf671f8e28cbf9600b14008670c82a462',
  'NZD/JPY': '0x40f3b8fa7d81f3087ebbe2fd2ad56cd9fa10327e262ca98f3cefdcbf92f94f2f',
  // Exotics
  'USD/SGD': '0x396a969a9c1480fa15ed50bc59149e2c0075a72fe8f458ed941ddec48bdb4918',
  'USD/BRL': '0xd2db4dbf1aea74e0f666b0e8f73b9580d407f5e5cf931940b06dc633d7a95906',
  'USD/MXN': '0xe13b1c1ffb32f34e1be9545583f01ef385fde7f42ee66049d30570dc866b77ca',
  'USD/TRY': '0x032a2eba1c2635bf973e95fb62b2c0705c1be2603b9572cc8d5edeaf8744e058',
  'USD/ZAR': '0x389d889017db82bf42141f23b61b8de938a4e2d156e36312175bebf797f493f1',
  'USD/HKD': '0x19d75fde7fee50fe67753fdc825e583594eb2f51ae84e114a5246c4ab23aff4c',
  'USD/NOK': '0x235ddea9f40e9af5814dbcc83a418b98e3ee8df1e34e1ae4d45cf5de596023a3',
  'USD/SEK': '0x8ccb376aa871517e807358d4e3cf0bc7fe4950474dbe6c9ffc21ef64e43fc676',
}

// ─── FX Market Definitions ──────────────────────────────────────────────

export const FX_MARKETS = [
  // Majors
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', category: 'major', inputToken: 'USDC',  outputToken: 'EURC', volume: 1_980_000_000_000 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', category: 'major', inputToken: 'USDC',  outputToken: 'GYEN', volume: 1_250_000_000_000 },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', category: 'major', inputToken: 'VGBP',  outputToken: 'USDC', volume: 750_000_000_000 },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', category: 'major', inputToken: 'USDC',  outputToken: 'VCHF', volume: 340_000_000_000 },
  // Crosses
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', category: 'cross', inputToken: 'EURC', outputToken: 'GYEN', volume: 180_000_000_000 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', category: 'cross', inputToken: 'EURC', outputToken: 'VGBP', volume: 160_000_000_000 },
  { pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', category: 'cross', inputToken: 'EURC', outputToken: 'VCHF', volume: 110_000_000_000 },
  { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', category: 'cross', inputToken: 'VGBP', outputToken: 'GYEN', volume: 110_000_000_000 },
  { pair: 'GBP/CHF', base: 'GBP', quote: 'CHF', category: 'cross', inputToken: 'VGBP', outputToken: 'VCHF', volume: 35_000_000_000 },
  // Exotics
  { pair: 'USD/BRL', base: 'USD', quote: 'BRL', category: 'exotic', inputToken: 'USDC', outputToken: 'BRZ',  volume: 72_000_000_000 },
  { pair: 'USD/MXN', base: 'USD', quote: 'MXN', category: 'exotic', inputToken: 'USDC', outputToken: 'MXNe', volume: 114_000_000_000 },
  { pair: 'USD/TRY', base: 'USD', quote: 'TRY', category: 'exotic', inputToken: 'USDC', outputToken: 'TRYB', volume: 36_000_000_000 },
  { pair: 'USD/ZAR', base: 'USD', quote: 'ZAR', category: 'exotic', inputToken: 'USDC', outputToken: 'ZARP', volume: 58_000_000_000 },
]

// ─── Cross-Rate via USD Helpers ──────────────────────────────────────────

// Maps currency -> how to get its USD value from a Pyth feed
export const CURRENCY_TO_USD = {
  USD: { feed: null, inverse: false },
  EUR: { feed: 'EUR/USD', inverse: false },   // EUR/USD = X -> 1 EUR = X USD
  GBP: { feed: 'GBP/USD', inverse: false },   // GBP/USD = X -> 1 GBP = X USD
  AUD: { feed: 'AUD/USD', inverse: false },   // AUD/USD = X -> 1 AUD = X USD
  NZD: { feed: 'NZD/USD', inverse: false },   // NZD/USD = X -> 1 NZD = X USD
  JPY: { feed: 'USD/JPY', inverse: true },    // USD/JPY = X -> 1 JPY = 1/X USD
  CHF: { feed: 'USD/CHF', inverse: true },    // USD/CHF = X -> 1 CHF = 1/X USD
  CAD: { feed: 'USD/CAD', inverse: true },
  BRL: { feed: 'USD/BRL', inverse: true },
  TRY: { feed: 'USD/TRY', inverse: true },
  MXN: { feed: 'USD/MXN', inverse: true },
  ZAR: { feed: 'USD/ZAR', inverse: true },
  SGD: { feed: 'USD/SGD', inverse: true },
  HKD: { feed: 'USD/HKD', inverse: true },
  NOK: { feed: 'USD/NOK', inverse: true },
  SEK: { feed: 'USD/SEK', inverse: true },
}

// Currencies used in the cross-rates matrix
export const MATRIX_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'BRL', 'MXN', 'TRY', 'ZAR']

// ─── Helpers ───────────────────────────────────────────────────────────

export function getTradeableMarkets() {
  return FX_MARKETS.filter(m => m.inputToken && m.outputToken)
}

export function formatVolume(vol) {
  if (vol >= 1e12) return `$${(vol / 1e12).toFixed(1)}T`
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(0)}B`
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`
  return `$${vol.toFixed(0)}`
}

export function formatRate(rate) {
  if (rate == null) return '--'
  if (rate >= 1000) return rate.toFixed(2)
  if (rate >= 100) return rate.toFixed(2)
  if (rate >= 1) return rate.toFixed(4)
  return rate.toFixed(6)
}

// Is this a JPY pair (pip = 0.01 instead of 0.0001)?
export function isJpyPair(pair) {
  return pair.includes('JPY')
}

export function pipSize(pair) {
  return isJpyPair(pair) ? 0.01 : 0.0001
}

import { fetchCryptoPrices } from './cmcApi.js'
import { SPL_TOKEN_LIST } from '../config/solanaTokens.js'
import { FX_MARKETS, CURRENCY_META } from '../config/forex'

const CB = 'https://icon.horse/icon/'
const CM = 'https://companiesmarketcap.com/img/company-logos/64/'
const CI = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/'
const CG = 'https://assets.coingecko.com/coins/images/'

// RWA token provider metadata
export const PROVIDERS = {
  ondo:   { name: 'Ondo', logo: CB + 'ondo.finance' },
  backed: { name: 'Backed', logo: CB + 'backed.fi' },
  dinari: { name: 'Dinari', logo: CB + 'dinari.com' },
  paxos:  { name: 'Paxos', logo: CB + 'paxos.com' },
  tether: { name: 'Tether', logo: CB + 'tether.to' },
}

const stocks = [
  // Pre-IPO (no providers)
  { id: 'openai', name: 'OpenAI', symbol: 'OPENAI', price: 245.00, change24h: 3.45, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'openai.com' },
  { id: 'anthropic', name: 'Anthropic', symbol: 'ANTH', price: 185.50, change24h: 2.78, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'anthropic.com' },
  { id: 'xai', name: 'xAI', symbol: 'XAI', price: 120.75, change24h: 4.12, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'x.ai' },
  { id: 'spacex', name: 'SpaceX', symbol: 'SPACEX', price: 350.00, change24h: 1.95, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'spacex.com' },
  { id: 'polymarket', name: 'Polymarket', symbol: 'POLY', price: 42.30, change24h: 5.67, category: 'stocks', subcategory: 'pre-ipo', logo: CB + 'polymarket.com' },
  // Large Cap
  { id: 'aapl', name: 'Apple', symbol: 'AAPL', price: 198.45, change24h: 0.67, category: 'stocks', subcategory: 'large-cap', logo: CB + 'apple.com', providers: [
    { provider: 'ondo', symbol: 'AAPLon', address: '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'AAPLon', address: '123mYEnRLM2LLYsJW3K6oyYh8uP1fngj732iG638ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'AAPLx', address: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'AAPL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'googl', name: 'Alphabet', symbol: 'GOOGL', price: 175.80, change24h: -0.45, category: 'stocks', subcategory: 'large-cap', logo: CB + 'abc.xyz', providers: [
    { provider: 'ondo', symbol: 'GOOGLon', address: '0xbA47214eDd2bb43099611b208f75E4b42FDcfEDc', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'GOOGLon', address: 'bbahNA5vT9WJeYft8tALrH1LXWffjwqVoUbqYa1ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'GOOGLx', address: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'GOOGL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', price: 445.20, change24h: 1.12, category: 'stocks', subcategory: 'large-cap', logo: CB + 'microsoft.com', providers: [
    { provider: 'ondo', symbol: 'MSFTon', address: '0xB812837b81a3a6b81d7CD74CfB19A7f2784555E5', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'MSFTon', address: 'FRmH6iRkMr33DLG6zVLR7EM4LojBFAuq6NtFzG6ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'MSFTx', address: 'XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'MSFT.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'meta', name: 'Meta', symbol: 'META', price: 585.30, change24h: 1.89, category: 'stocks', subcategory: 'large-cap', logo: CM + 'META.png', providers: [
    { provider: 'ondo', symbol: 'METAon', address: '0x59644165402b611b350645555b50afb581c71eb2', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'METAon', address: 'fDxs5y12E7x7jBwCKBXGqt71uJmCWsAQ3Srkte6ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'METAx', address: 'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'META.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'tsla', name: 'Tesla', symbol: 'TSLA', price: 248.50, change24h: -2.34, category: 'stocks', subcategory: 'large-cap', logo: CM + 'TSLA.png', providers: [
    { provider: 'ondo', symbol: 'TSLAon', address: '0xf6b1117ec07684D3958caD8BEb1b302bfD21103f', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'TSLAon', address: 'KeGv7bsfR4MheC1CkmnAVceoApjrkvBhHYjWb67ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'TSLAx', address: 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'TSLA.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'jpm', name: 'JPMorgan Chase & Co', symbol: 'JPM', price: 242.80, change24h: 0.78, category: 'stocks', subcategory: 'large-cap', logo: CM + 'JPM.png', providers: [
    { provider: 'ondo', symbol: 'JPMon', address: '0x03c1ec4ca9dbb168e6db0def827c085999cbffaf', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'JPMon', address: 'E5Gczsavxcomqf6Cw1sGCKLabL1xYD2FzKxVoB4ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'JPMx', address: 'XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'JPM.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'nvda', name: 'NVIDIA', symbol: 'NVDA', price: 140.11, change24h: 2.15, category: 'stocks', subcategory: 'large-cap', logo: CM + 'NVDA.png', providers: [
    { provider: 'ondo', symbol: 'NVDAon', address: '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'NVDAon', address: 'gEGtLTPNQ7jcg25zTetkbmF7teoDLcrfTnQfmn2ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'NVDAx', address: 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'NVDA.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'amzn', name: 'Amazon', symbol: 'AMZN', price: 228.68, change24h: 1.34, category: 'stocks', subcategory: 'large-cap', logo: CB + 'amazon.com', providers: [
    { provider: 'ondo', symbol: 'AMZNon', address: '0xbb8774FB97436d23d74C1b882E8E9A69322cFD31', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'AMZNon', address: '14Tqdo8V1FhzKsE3W2pFsZCzYPQxxupXRcqw9jv6ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'AMZNx', address: 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'AMZN.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'orcl', name: 'Oracle', symbol: 'ORCL', price: 188.45, change24h: 0.92, category: 'stocks', subcategory: 'large-cap', logo: CB + 'oracle.com', providers: [
    { provider: 'ondo', symbol: 'ORCLon', address: '0x8a23c6baadb88512b30475c83df6a63881e33e1e', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'ORCLon', address: 'GmDADFpfwjfzZq9MfCafMDTS69MgVjtzD7Fd9a4ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'ORCL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'pg', name: 'Procter & Gamble', symbol: 'PG', price: 170.30, change24h: -0.23, category: 'stocks', subcategory: 'large-cap', logo: CM + 'PG.png', providers: [
    { provider: 'ondo', symbol: 'PGon', address: '0x339ce23a355ed6d513dd3e1462975c4ecd86823a', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'PGon', address: 'GZ8v4NdSG7CTRZqHMgNsTPRULeVi8CpdWd9wZY8ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'PG.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'qcom', name: 'Qualcomm', symbol: 'QCOM', price: 172.55, change24h: 1.56, category: 'stocks', subcategory: 'large-cap', logo: CM + 'QCOM.png', providers: [
    { provider: 'ondo', symbol: 'QCOMon', address: '0xE3419710c1f77D44B4DaB02316d3f048818C4E59', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'QCOMon', address: 'hrmX7MV5hifoaBVjnrdpz698yABxrbBNAcWtWo9ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'QCOM.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  // Mid Cap
  { id: 'mcd', name: "McDonald's Corp", symbol: 'MCD', price: 295.60, change24h: 0.34, category: 'stocks', subcategory: 'mid-cap', logo: CM + 'MCD.png', providers: [
    { provider: 'ondo', symbol: 'MCDon', address: '0x4c82c8cd9a218612dce60b156b73a36705645e3b', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'MCDon', address: 'EUbJjmDt8JA222M91bVLZs211siZ2jzbFArH9N3ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'MCDx', address: 'XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'MCD.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'pep', name: 'PepsiCo', symbol: 'PEP', price: 168.90, change24h: -0.56, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'pepsico.com', providers: [
    { provider: 'ondo', symbol: 'PEPon', address: '0x3ce219d498d807317f840f4cb0f03fa27dd65046', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'PEPon', address: 'gud6b3fYekjhMG5F818BALwbg2vt4JKoow59Md9ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'PEP.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'c', name: 'Citigroup', symbol: 'C', price: 65.40, change24h: 1.23, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'citigroup.com', providers: [
    { provider: 'ondo', symbol: 'Con', address: '0xc46e7ef70d7cf8c17863a6b0b9be2af6a4c41abe', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'Con', address: 'PjtfUiw6Hwd8PZ94EcUw8mBSYxp7SjjzSLeNTDKondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'C.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'ba', name: 'Boeing', symbol: 'BA', price: 178.20, change24h: -1.45, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'boeing.com', providers: [
    { provider: 'ondo', symbol: 'BAon', address: '0x57270d35a840bc5c094da6fbeca033fb71ea6ab0', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'BAon', address: '1YVZ4LGpq8CAhpdpm3mgy7GgPb83gJczCpxLUQ3ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'BA.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'coin', name: 'Coinbase', symbol: 'COIN', price: 288.70, change24h: 3.45, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'coinbase.com', providers: [
    { provider: 'ondo', symbol: 'COINon', address: '0xf042cfa86cf1d598a75bdb55c3507a1f39f9493b', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'COINon', address: '5u6KDiNJXxX4rGMfYT4BApZQC5CuDNrG6MHkwp1ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'COINx', address: 'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'COIN.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'mstr', name: 'MicroStrategy', symbol: 'MSTR', price: 377.20, change24h: 4.12, category: 'stocks', subcategory: 'mid-cap', logo: CM + 'MSTR.png', providers: [
    { provider: 'ondo', symbol: 'MSTRon', address: '0xcabd955322dfbf94c084929ac5e9eca3feb5556f', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'MSTRon', address: 'FSz4ouiqXpHuGPcpacZfTzbMjScoj5FfzHkiyu2ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'MSTRx', address: 'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'MSTR.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'pfe', name: 'Pfizer', symbol: 'PFE', price: 26.85, change24h: -0.67, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'pfizer.com', providers: [
    { provider: 'ondo', symbol: 'PFEon', address: '0x06954faa913fa14c28eb1b2e459594f22f33f3de', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'PFEon', address: 'Gwh9fPsX1qWATXy63vNaJnAFfwebWQtZaVmPko6ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'PFE.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'crcl', name: 'Circle', symbol: 'CRCL', price: 54.30, change24h: 2.34, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'circle.com', providers: [
    { provider: 'ondo', symbol: 'CRCLon', address: '0x3632dea96a953c11dac2f00b4a05a32cd1063fae', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'CRCLon', address: '6xHEyem9hmkGtVq6XGCiQUGpPsHBaoYuYdFNZa5ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'CRCL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'jd', name: 'JD.com', symbol: 'JD', price: 39.75, change24h: 1.89, category: 'stocks', subcategory: 'mid-cap', logo: CB + 'jd.com', providers: [
    { provider: 'ondo', symbol: 'JDon', address: '0xdeB6B89088cA9B7d7756087c8a0F7C6DF46f319C', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'JDon', address: 'E1aUS5nyv7kaBzdQzPVJW5zfaMgoUJpKYzdnFS2ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'JD.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  // Small Cap
  { id: 'sbux', name: 'Starbucks', symbol: 'SBUX', price: 98.75, change24h: 0.89, category: 'stocks', subcategory: 'small-cap', logo: CM + 'SBUX.png', providers: [
    { provider: 'ondo', symbol: 'SBUXon', address: '0xf15fbc1349ab99abad63db3f9a510bf413be3bef', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'SBUXon', address: 'iPFqjcZQTNMNXA4kbShbMhfAVD8yr8Uq9UtXMV6ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'SBUX.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'adbe', name: 'Adobe', symbol: 'ADBE', price: 485.30, change24h: 2.12, category: 'stocks', subcategory: 'small-cap', logo: CB + 'adobe.com', providers: [
    { provider: 'ondo', symbol: 'ADBEon', address: '0x7042a8ffc7c7049684bfbc2fcb41b72380755a43', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'ADBEon', address: '12Rh6JhfW4X5fKP16bbUdb4pcVCKDHFB48x8GG33ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'ADBE.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'intu', name: 'Intuit', symbol: 'INTU', price: 625.40, change24h: 1.56, category: 'stocks', subcategory: 'small-cap', logo: CB + 'intuit.com', providers: [
    { provider: 'ondo', symbol: 'INTUon', address: '0x6cc0afd51ce4cb6920b775f3d6376ab82b9a93bb', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'INTUon', address: 'CozoH5HBTyyeYSQxHcWpGzd4Sq5XBaKzBzvTtN3ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'INTU.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'gme', name: 'GameStop', symbol: 'GME', price: 29.85, change24h: 5.67, category: 'stocks', subcategory: 'small-cap', logo: CB + 'gamestop.com', providers: [
    { provider: 'ondo', symbol: 'GMEon', address: '0x71d24baeb0a033ec5f90ff65c4210545af378d97', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'GMEon', address: 'aznKt8v32CwYMEcTcB4bGTv8DXWStCpHrcCtyy7ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'GME.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  // ETF
  { id: 'spy', name: 'SPDR S&P 500 ETF', symbol: 'SPY', price: 605.20, change24h: 0.45, category: 'stocks', subcategory: 'etf', logo: CB + 'ssga.com', providers: [
    { provider: 'ondo', symbol: 'SPYon', address: '0xFeDC5f4a6c38211c1338aa411018DFAf26612c08', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'SPYon', address: 'k18WJUULWheRkSpSquYGdNNmtuE2Vbw1hpuUi92ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'SPYx', address: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'SPY.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'qqq', name: 'Invesco QQQ ETF', symbol: 'QQQ', price: 525.80, change24h: 0.78, category: 'stocks', subcategory: 'etf', logo: CB + 'invesco.com', providers: [
    { provider: 'ondo', symbol: 'QQQon', address: '0x0e397938c1aa0680954093495b70a9f5e2249aba', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'QQQon', address: 'HrYNm6jTQ71LoFphjVKBTdAE4uja7WsmLG8VxB8ondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'QQQx', address: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', chain: 'solana', decimals: 6 },
    { provider: 'dinari', symbol: 'QQQ.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'iefa', name: 'iShares Core MSCI EAFE ETF', symbol: 'IEFA', price: 79.25, change24h: 0.15, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IEFAon', address: '0xfeff7a377a86462f5a2a872009722c154707f09e', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'ivv', name: 'iShares Core S&P 500 ETF', symbol: 'IVV', price: 697.00, change24h: 0.42, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IVVon', address: '0x62ca254a363dc3c748e7e955c20447ab5bf06ff7', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'iwm', name: 'iShares Russell 2000 ETF', symbol: 'IWM', price: 267.00, change24h: -0.35, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IWMon', address: '0x070d79021dd7e841123cb0cf554993bf683c511d', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'dgrw', name: 'WisdomTree US Quality Dividend Growth Fund', symbol: 'DGRW', price: 46.00, change24h: 0.28, category: 'stocks', subcategory: 'etf', logo: CB + 'wisdomtree.com', providers: [
    { provider: 'ondo', symbol: 'DGRWon', address: '0x81eb954936a7062d1758fc0e6e3b88d42d9c361c', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'eem', name: 'iShares MSCI Emerging Markets ETF', symbol: 'EEM', price: 60.51, change24h: 0.67, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'EEMon', address: '0x77a1a02e4a888ada8620b93c30de8a41e621126c', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'efa', name: 'iShares MSCI EAFE ETF', symbol: 'EFA', price: 104.00, change24h: 0.23, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'EFAon', address: '0x4111b60bc87f2bd1e81e783e271d7f0ec6ee088b', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'iemg', name: 'iShares Core MSCI Emerging Markets ETF', symbol: 'IEMG', price: 72.83, change24h: 0.54, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IEMGon', address: '0xcdd60d15125bf3362b6838d2506b0fa33bc1a515', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'ijh', name: 'iShares Core S&P MidCap ETF', symbol: 'IJH', price: 71.79, change24h: -0.18, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IJHon', address: '0xfd50fc4e3686a8da814c5c3d6121d8ab98a537f0', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'itot', name: 'iShares Core S&P Total US Stock Market ETF', symbol: 'ITOT', price: 151.90, change24h: 0.35, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'ITOTon', address: '0x0692481c369e2bdc728a69ae31b848343a4567be', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'iwf', name: 'iShares Russell 1000 Growth ETF', symbol: 'IWF', price: 460.98, change24h: 0.89, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IWFon', address: '0x8d05432c2786e3f93f1a9a62b9572dbf54f3ea06', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'iwn', name: 'iShares Russell 2000 Value ETF', symbol: 'IWN', price: 200.95, change24h: -0.42, category: 'stocks', subcategory: 'etf', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IWNon', address: '0x9dcf7f739b8c0270e2fc0cc8d0dabe355a150dba', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'psq', name: 'ProShares Short QQQ', symbol: 'PSQ', price: 30.52, change24h: -0.78, category: 'stocks', subcategory: 'etf', logo: CB + 'proshares.com', providers: [
    { provider: 'ondo', symbol: 'PSQon', address: '0x9ebd34d99cc3a45b39cafc14ad7994263fa2be56', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'sqqq', name: 'ProShares UltraPro Short QQQ', symbol: 'SQQQ', price: 68.32, change24h: -2.15, category: 'stocks', subcategory: 'etf', logo: CB + 'proshares.com', providers: [
    { provider: 'ondo', symbol: 'SQQQon', address: '0x0a00c19246fc41b2524d56c87ec44ce8b30ba0f8', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'tqqq', name: 'ProShares UltraPro QQQ', symbol: 'TQQQ', price: 51.71, change24h: 1.45, category: 'stocks', subcategory: 'etf', logo: CB + 'proshares.com', providers: [
    { provider: 'ondo', symbol: 'TQQQon', address: '0xa45cd7ac9865b9539166ebaf2abc362df4736580', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'vti', name: 'Vanguard Total Stock Market ETF', symbol: 'VTI', price: 342.70, change24h: 0.32, category: 'stocks', subcategory: 'etf', logo: CB + 'vanguard.com', providers: [
    { provider: 'ondo', symbol: 'VTIon', address: '0x57b392146848c6321bb2a3d4358df1bdeacdc62a', chain: 'ethereum', decimals: 18 },
  ] },
  { id: 'vtv', name: 'Vanguard Value ETF', symbol: 'VTV', price: 206.39, change24h: 0.18, category: 'stocks', subcategory: 'etf', logo: CB + 'vanguard.com', providers: [
    { provider: 'ondo', symbol: 'VTVon', address: '0x84e8f1b9b40dd1832925702459d12ffb14d97bf3', chain: 'ethereum', decimals: 18 },
  ] },
]

const crypto = [
  // Large Cap
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 248.30, change24h: 5.12, category: 'crypto', subcategory: 'large-cap', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 104250.00, change24h: 1.45, category: 'crypto', subcategory: 'large-cap', logo: CI + 'btc.svg', ethereumAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3890.50, change24h: 2.78, category: 'crypto', subcategory: 'large-cap', logo: CI + 'eth.svg', ethereumAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 715.40, change24h: 0.89, category: 'crypto', subcategory: 'large-cap', logo: CI + 'bnb.svg', ethereumAddress: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605' },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', price: 14.20, change24h: 1.85, category: 'crypto', subcategory: 'large-cap', logo: CI + 'link.svg', ethereumAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { id: 'trx', name: 'TRON', symbol: 'TRX', price: 0.276, change24h: 0.45, category: 'crypto', subcategory: 'large-cap', logo: CG + '1094/standard/tron-logo.png', ethereumAddress: '0x50327c6c5a14DCade707ABad2E27eB517dF87AB5' },
  { id: 'ton', name: 'Toncoin', symbol: 'TON', price: 1.35, change24h: -1.20, category: 'crypto', subcategory: 'large-cap', logo: CB + 'ton.org', ethereumAddress: '0x582d872A1B094FC48F5DE31D3B73F2D9bE47deF1' },
  { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', price: 0.000006, change24h: 3.45, category: 'crypto', subcategory: 'large-cap', logo: CG + '11939/large/shiba.png', ethereumAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', price: 0.0000037, change24h: 5.67, category: 'crypto', subcategory: 'large-cap', logo: CG + '29850/large/pepe-token.jpeg', ethereumAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
  // Mid Cap
  { id: 'jup', name: 'Jupiter', symbol: 'JUP', price: 1.24, change24h: 4.56, category: 'crypto', subcategory: 'mid-cap', logo: 'https://static.jup.ag/jup/icon.png' },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', price: 14.20, change24h: 4.56, category: 'crypto', subcategory: 'mid-cap', logo: CI + 'uni.svg', ethereumAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  { id: 'mnt', name: 'Mantle', symbol: 'MNT', price: 1.08, change24h: 2.34, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'mantle.xyz', ethereumAddress: '0x3c3a81e81dc49a522a592e7622a7e711c06bf354' },
  { id: 'cro', name: 'Cronos', symbol: 'CRO', price: 0.079, change24h: 1.23, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'crypto.com', ethereumAddress: '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b' },
  { id: 'leo', name: 'UNUS SED LEO', symbol: 'LEO', price: 8.60, change24h: 0.34, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'bitfinex.com', ethereumAddress: '0x2AF5D2aD76741191D15Dfe7bF6aC92d4Bd912Ca3' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', price: 109.33, change24h: 2.15, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'aave.com', ethereumAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
  { id: 'okb', name: 'OKB', symbol: 'OKB', price: 75.19, change24h: -0.67, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'okx.com', ethereumAddress: '0x75231F58b43240C9718Dd58B4967c5114342a86c' },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', price: 1.00, change24h: -0.89, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'near.org', ethereumAddress: '0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4' },
  { id: 'render', name: 'Render', symbol: 'RENDER', price: 1.36, change24h: 3.78, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'rendernetwork.com', ethereumAddress: '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24' },
  { id: 'arb', name: 'Arbitrum', symbol: 'ARB', price: 0.12, change24h: -1.56, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'arbitrum.io', ethereumAddress: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1' },
  { id: 'pol', name: 'Polygon', symbol: 'POL', price: 0.10, change24h: 0.78, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'polygon.technology', ethereumAddress: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' },
  { id: 'ondo', name: 'Ondo Finance', symbol: 'ONDO', price: 0.26, change24h: 4.12, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'ondo.finance', ethereumAddress: '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3' },
  { id: 'wld', name: 'Worldcoin', symbol: 'WLD', price: 0.39, change24h: -2.34, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'worldcoin.org', ethereumAddress: '0x163f8C2467924be0ae7B5347228CABF260318753' },
  { id: 'ena', name: 'Ethena', symbol: 'ENA', price: 0.12, change24h: 1.45, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'ethena.fi', ethereumAddress: '0x57e114B691Db790C35207b2e685D4A43181e6061' },
  { id: 'qnt', name: 'Quant', symbol: 'QNT', price: 65.43, change24h: 0.56, category: 'crypto', subcategory: 'mid-cap', logo: CB + 'quant.network', ethereumAddress: '0x4a220E6096B25EADb88358cb44068A3248254675' },
  // Small Cap
  { id: 'ray', name: 'Raydium', symbol: 'RAY', price: 5.85, change24h: 3.12, category: 'crypto', subcategory: 'small-cap', logo: CI + 'ray.svg' },
  { id: 'orca-token', name: 'Orca', symbol: 'ORCA', price: 4.20, change24h: 2.45, category: 'crypto', subcategory: 'small-cap', logo: CG + '17547/standard/Orca_Logo.png' },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.0000234, change24h: 7.89, category: 'crypto', subcategory: 'small-cap', logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
  { id: 'pyth', name: 'Pyth Network', symbol: 'PYTH', price: 0.42, change24h: 1.67, category: 'crypto', subcategory: 'small-cap', logo: CG + '31924/standard/pyth.png' },
  { id: 'trump', name: 'Official Trump', symbol: 'TRUMP', price: 3.29, change24h: 8.90, category: 'crypto', subcategory: 'small-cap', logo: 'https://dd.dexscreener.com/ds-data/tokens/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN.png' },
  { id: 'pump', name: 'Pump.fun', symbol: 'PUMP', price: 0.0021, change24h: 12.34, category: 'crypto', subcategory: 'small-cap', logo: CB + 'pump.fun' },
  { id: 'nexo', name: 'Nexo', symbol: 'NEXO', price: 0.81, change24h: 1.23, category: 'crypto', subcategory: 'small-cap', logo: CB + 'nexo.com', ethereumAddress: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206' },
  { id: 'morpho', name: 'Morpho', symbol: 'MORPHO', price: 1.16, change24h: -0.45, category: 'crypto', subcategory: 'small-cap', logo: CB + 'morpho.org', ethereumAddress: '0x58D97B57BB95320F9a05dC918Aef65434969c2b2' },
  { id: 'edgen', name: 'Edgen', symbol: 'EDGEN', price: 0.00206, change24h: 0.00, category: 'crypto', subcategory: 'small-cap', logo: CG + '66227/large/-AlLx9IW_400x400.png', ethereumAddress: '0xAa9806c938836627Ed1a41Ae871c7E1889AE02Ca' },
]

const commodities = [
  { id: 'gold', name: 'Gold', symbol: 'XAU', price: 2685.40, change24h: 0.34, category: 'commodities', subcategory: 'precious-metals', logo: CB + 'gold.org', providers: [
    { provider: 'paxos', symbol: 'PAXG', address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78', chain: 'ethereum', decimals: 18 },
    { provider: 'paxos', symbol: 'PAXG', address: '9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R', chain: 'solana', decimals: 9 },
    { provider: 'tether', symbol: 'XAUT', address: '0x68749665FF8D2d112Fa859AA293F07A622782F38', chain: 'ethereum', decimals: 6 },
  ] },
  { id: 'gld', name: 'SPDR Gold Shares', symbol: 'GLD', price: 245.80, change24h: 0.42, category: 'commodities', subcategory: 'precious-metals', logo: CB + 'ssga.com', providers: [
    { provider: 'ondo', symbol: 'GLDon', address: '0x423d42e505e64f99b6e277eb7ed324cc5606f139', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'GLDon', address: 'hWfiw4mcxT8rnNFkk6fsCQSxoxgZ9yVhB6tyeVcondo', chain: 'solana', decimals: 9 },
    { provider: 'backed', symbol: 'GLDx', address: 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', chain: 'solana', decimals: 8 },
    { provider: 'dinari', symbol: 'GLD.d', address: '0xBE8e3f4d5BD6eE0175359982Cc91DAfa3cf72502', chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'slv', name: 'iShares Silver Trust', symbol: 'SLV', price: 28.95, change24h: 1.12, category: 'commodities', subcategory: 'precious-metals', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'SLVon', address: '0xf3e4872e6a4cf365888d93b6146a2baa7348f1a4', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'SLVon', address: 'iy11ytbSGcUnrjE6Lfv78TFqxKyUESfku1FugS9ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'SLV.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'iau', name: 'iShares Gold Trust', symbol: 'IAU', price: 49.20, change24h: 0.38, category: 'commodities', subcategory: 'precious-metals', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'IAUon', address: '0x4f0ca3df1c2e6b943cf82e649d576ffe7b2fabcf', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'IAUon', address: 'M77ZvkZ8zW5udRbuJCbuwSwavRa7bGAZYMTwru8ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'IAU.d', address: '0x39Bce681d72720F80424914800A78c63FdfaF645', chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'pall', name: 'abrdn Physical Palladium Shares ETF', symbol: 'PALL', price: 95.30, change24h: 0.56, category: 'commodities', subcategory: 'precious-metals', logo: CB + 'abrdn.com', providers: [
    { provider: 'ondo', symbol: 'PALLon', address: '0x0ce36d199bd6851788e03392568849394cbde722', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'PALLon', address: 'P7hTXnKk2d2DyqWnefp5BSroE1qjjKpKxg9SxQqondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'PALL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'uso', name: 'United States Oil Fund', symbol: 'USO', price: 72.40, change24h: -0.68, category: 'commodities', subcategory: 'energy', logo: CB + 'uscfinvestments.com', providers: [
    { provider: 'ondo', symbol: 'USOon', address: '0x1f5fc5c3c8b0f15c7e21af623936ff2b210b6415', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'USOon', address: 'rpydAzWdCy85HEmoQkH5PVxYtDYQWjmLxgHHadxondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'USO.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'copx', name: 'Global X Copper Miners ETF', symbol: 'COPX', price: 42.15, change24h: 0.89, category: 'commodities', subcategory: 'industrial', logo: CB + 'globalxetfs.com', providers: [
    { provider: 'ondo', symbol: 'COPXon', address: '0x423a63dfe8d82cd9c6568c92210aa537d8ef6885', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'COPXon', address: 'X7j77hTmjZJbepkXXBcsEapM8qNgdfihkFj6CZ5ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'COPX.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'nikl', name: 'Sprott Nickel Miners ETF', symbol: 'NIKL', price: 18.75, change24h: -1.23, category: 'commodities', subcategory: 'industrial', logo: CB + 'sprott.com', providers: [
    { provider: 'ondo', symbol: 'NIKLon', address: '0xbf54eb503bb350583d11f4348086dc3608fa245c', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'NIKLon', address: 'V8LRV7kWjrx6Prke9oHEHNUiR122BVtyuPciTCTondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'NIKL.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'remx', name: 'VanEck Rare Earth/Strategic Metals ETF', symbol: 'REMX', price: 38.40, change24h: 1.45, category: 'commodities', subcategory: 'industrial', logo: CB + 'vaneck.com', providers: [
    { provider: 'ondo', symbol: 'REMXon', address: '0x1140043f02d8ee34b10eae2e32ae921cda1459ee', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'REMXon', address: 'tiitb2Z1HtpB2DpVr6V7tdCFS3jmTinLeuGj9EVondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'REMX.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'dbc', name: 'Invesco DB Commodity Index', symbol: 'DBC', price: 23.60, change24h: -0.34, category: 'commodities', subcategory: 'broad', logo: CB + 'invesco.com', providers: [
    { provider: 'ondo', symbol: 'DBCon', address: '0x20224080ad516769723c9a4a18325fc4e8c9ab5d', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'DBCon', address: 'td1aY5AvYQuwGD75qNq9aPipMexraN9mQXJwqifondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'DBC.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'ftgc', name: 'First Trust Global Tactical Commodity', symbol: 'FTGC', price: 22.85, change24h: 0.15, category: 'commodities', subcategory: 'broad', logo: CB + 'ftportfolios.com', providers: [
    { provider: 'ondo', symbol: 'FTGCon', address: '0xacf3fecaa787f268351a86409c3bd3b96ef924fb', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'FTGCon', address: 'ivBnfPTyuHDNWmMSnbavckhJK6SHZW8h77nZKsEondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'FTGC.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'pdbc', name: 'Invesco Optimum Yield Diversified Commodity', symbol: 'PDBC', price: 14.85, change24h: -0.22, category: 'commodities', subcategory: 'broad', logo: CB + 'invesco.com', providers: [
    { provider: 'ondo', symbol: 'PDBCon', address: '0x46c0a02a877c1412cb32b57028b2f771c0364a7e', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'PDBCon', address: 'M6agiXbNgy8Xon9ngiW4ZDPbMFcNCTMkMMkshZyondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'PDBC.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
]

const bonds = [
  { id: 'tlt', name: 'iShares 20+ Year Treasury Bond ETF', symbol: 'TLT', price: 91.50, change24h: -0.22, category: 'bonds', subcategory: 'treasury', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'TLTon', address: '0x992651BFeB9A0DCC4457610E284ba66D86489d4d', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'TLTon', address: 'KaSLSWByKy6b9FrCYXPEJoHmLpuFZtTCJk1F1Z9ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'TLT.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'sgov', name: 'iShares 0-3 Month Treasury Bond ETF', symbol: 'SGOV', price: 100.12, change24h: 0.01, category: 'bonds', subcategory: 'treasury', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'SGOVon', address: '0x8de5d49725550f7b318b2fa0f1b1f118e98e8d0f', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'SGOVon', address: 'HjrN6ChZK2QRL6hMXayjGPLFvxhgjwKEy135VRjondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'SGOV.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'agg', name: 'iShares Core US Aggregate Bond ETF', symbol: 'AGG', price: 97.85, change24h: -0.08, category: 'bonds', subcategory: 'treasury', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'AGGon', address: '0xfF7CF16aA2fFc463b996DB2f7B7cf0130336899D', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'AGGon', address: '13qTjKx53y6LKGGStiKeieGbnVx3fx1bbwopKFb3ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'AGG.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'tip', name: 'iShares TIPS Bond ETF', symbol: 'TIP', price: 107.30, change24h: -0.15, category: 'bonds', subcategory: 'treasury', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'TIPon', address: '0x2df38ca485d01fc15e4fd85847ed26b7ef871c1c', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'TIPon', address: 'k6BPp2Xmf2TYgrZiUyWfUoZBKeqaDbvPoAVgSx2ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'TIP.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'usfr', name: 'WisdomTree Floating Rate Treasury Fund', symbol: 'USFR', price: 50.35, change24h: 0.02, category: 'bonds', subcategory: 'treasury', logo: CB + 'wisdomtree.com', providers: [
    { provider: 'ondo', symbol: 'USFRon', address: '0xfb82561a955bf59b9263301126af490d3799e231', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'USFRon', address: 'o6U1Sm6Vd7EofMyCrL28mrp2QLzgYGgjveHiEQ5ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'USFR.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'hyg', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', symbol: 'HYG', price: 78.60, change24h: 0.15, category: 'bonds', subcategory: 'corporate', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'HYGon', address: '0xeD3618Bb8778F8eBBe2f241Da532227591771D04', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'HYGon', address: 'c5ug15fwZRfQhhVa6LHscFY33ebVDHcVCezYpj7ondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'HYG.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'binc', name: 'iShares Flexible Income Active ETF', symbol: 'BINC', price: 51.20, change24h: 0.12, category: 'bonds', subcategory: 'corporate', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'BINCon', address: '0x88703c1e71f44a2d329c99e8e112f7a4e7dd6312', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'BINCon', address: 'mhZ69E1vDnAsQJXAwarLYSX5tmgeMajXBJ2rXAcondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'BINC.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'cloa', name: 'iShares AAA CLO Active ETF', symbol: 'CLOA', price: 50.85, change24h: 0.05, category: 'bonds', subcategory: 'clo', logo: CB + 'ishares.com', providers: [
    { provider: 'ondo', symbol: 'CLOAon', address: '0x8cefd49b703de9c0486d9bf6cb559f0895268ee8', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'CLOAon', address: 't71FyTYHVkPAb5g48adDHmkVxXYbUuP2eq6jDZLondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'CLOA.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'cloi', name: 'VanEck CLO ETF', symbol: 'CLOI', price: 25.40, change24h: 0.08, category: 'bonds', subcategory: 'clo', logo: CB + 'vaneck.com', providers: [
    { provider: 'ondo', symbol: 'CLOIon', address: '0xe8b09e8175aecb35a171fa059647434fe47f114c', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'CLOIon', address: 'ucQ3VfWAx9pkCN4Kg84zE56FtB4FJN2kQH4ArYYondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'CLOI.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
  { id: 'jaaa', name: 'Janus Henderson AAA CLO ETF', symbol: 'JAAA', price: 50.95, change24h: 0.03, category: 'bonds', subcategory: 'clo', logo: CB + 'janushenderson.com', providers: [
    { provider: 'ondo', symbol: 'JAAAon', address: '0x219a1b27baa08d72fac836665a3b752f3c9acbbc', chain: 'ethereum', decimals: 18 },
    { provider: 'ondo', symbol: 'JAAAon', address: 'KZtqx9BJbpcGY7vdzhqPXM3ECKChxE5YhXaDiwRondo', chain: 'solana', decimals: 9 },
    { provider: 'dinari', symbol: 'JAAA.d', address: null, chain: 'arbitrum', decimals: 18 },
  ] },
]

const assetDetails = {
  // === CRYPTO — LARGE CAP ===
  btc: {
    description: 'The original crypto. Launched in 2009 by the pseudonymous Satoshi Nakamoto, BTC runs on a global peer-to-peer network with no central authority. Capped at 21 million coins, it is the digital gold standard for decentralized money.',
    news: [
      { title: 'Bitcoin Spot ETFs Cross $120B in Total AUM', date: '2026-02-07', source: 'CoinDesk' },
      { title: 'Bitcoin Hash Rate Hits 800 EH/s as Mining Expands', date: '2026-02-02', source: 'The Block' },
      { title: 'El Salvador Launches Bitcoin-Backed Sovereign Bond', date: '2026-01-27', source: 'Financial Times' },
    ],
  },
  eth: {
    description: 'The programmable blockchain. Ethereum lets anyone deploy smart contracts and apps without middlemen. Most of DeFi, NFTs, and Layer 2 rollups run on it. Transitioned to proof-of-stake in 2022, cutting energy use by 99%.',
    news: [
      { title: 'Ethereum Pectra Upgrade Goes Live, Cuts L2 Fees 80%', date: '2026-02-08', source: 'The Block' },
      { title: 'Ethereum L2 TVL Surpasses $85B Across All Rollups', date: '2026-02-03', source: 'DeFi Llama' },
      { title: 'BlackRock Ethereum ETF Sees Record Weekly Inflows', date: '2026-01-28', source: 'Bloomberg' },
    ],
  },
  sol: {
    description: 'Fast and cheap. Solana settles transactions in under a second for fractions of a cent. Big DeFi and NFT scene, powered by its Proof of History consensus. Home to Jupiter, Raydium, and a thriving memecoin culture.',
    news: [
      { title: 'Solana Processes 100K TPS During Firedancer Stress Test', date: '2026-02-06', source: 'The Block' },
      { title: 'Solana DeFi TVL Breaks $25B as New Protocols Launch', date: '2026-02-01', source: 'DeFi Llama' },
      { title: 'Visa Expands Stablecoin Settlement to Solana Network', date: '2026-01-26', source: 'CoinDesk' },
    ],
  },
  bnb: {
    description: 'Binance\'s native token. BNB powers the BNB Chain ecosystem, covers trading fees on Binance, and is used in launchpad token sales. Regular quarterly burns reduce supply over time.',
    news: [
      { title: 'BNB Chain Hits 2M Daily Active Addresses Record', date: '2026-02-06', source: 'The Block' },
      { title: 'Binance Launches Regulated Exchange in Japan and UAE', date: '2026-01-31', source: 'CoinDesk' },
      { title: 'BNB Quarterly Burn Removes $900M Worth of Tokens', date: '2026-01-26', source: 'Bloomberg' },
    ],
  },
  link: { description: 'The oracle network connecting smart contracts to real-world data. Chainlink provides price feeds, verifiable randomness, and cross-chain messaging (CCIP) used by most major DeFi protocols across dozens of blockchains.' },
  trx: { description: 'Justin Sun\'s blockchain focused on content and payments. TRON processes more USDT stablecoin transfers than any other chain, making it a backbone of global peer-to-peer dollar payments.' },
  ton: { description: 'Built for Telegram\'s 900M+ users. TON (The Open Network) is a fast Layer 1 blockchain with native Telegram integration for payments, mini-apps, and social features built right into the chat app.' },
  shib: { description: 'The self-proclaimed Dogecoin killer. Shiba Inu grew from a meme token into a full ecosystem with its own DEX (ShibaSwap), Layer 2 chain (Shibarium), and metaverse project.' },
  pepe: { description: 'The frog meme token. PEPE launched in 2023 as a pure meme play with zero utility or roadmap — just vibes and community. Became one of the top meme coins by market cap on sheer hype alone.' },
  // === CRYPTO — MID CAP ===
  jup: {
    description: 'Solana\'s go-to DEX aggregator. Jupiter finds the best price across every liquidity source on the chain. Also does limit orders, DCA, and perps. The most-used app in the Solana ecosystem.',
    news: [
      { title: 'Jupiter V8 Aggregator Launches with Cross-Chain Routing', date: '2026-02-05', source: 'The Block' },
      { title: 'JUP Staking Hits $1.5B as Governance Activity Surges', date: '2026-01-30', source: 'DeFi Llama' },
      { title: 'Jupiter Perps Volume Tops $2B in Single Day', date: '2026-01-24', source: 'CoinDesk' },
    ],
  },
  uni: {
    description: 'The leading DEX protocol. Uniswap pioneered automated market makers and handles billions in daily volume across Ethereum and L2s. Its open-source code spawned an entire category of decentralized exchanges.',
    news: [
      { title: 'Uniswap V4 Hooks Drive 40% Volume Increase', date: '2026-02-05', source: 'The Block' },
      { title: 'Uniswap Labs Launches Cross-Chain Swap Feature', date: '2026-01-30', source: 'CoinDesk' },
      { title: 'UNI Governance Approves Fee Switch for Token Holders', date: '2026-01-25', source: 'DeFi Llama' },
    ],
  },
  mnt: { description: 'Mantle Network\'s native token. Mantle is an Ethereum Layer 2 optimistic rollup backed by BitDAO\'s multi-billion dollar treasury, offering low-cost EVM-compatible transactions with Ethereum-level security.' },
  cro: { description: 'Cronos chain and Crypto.com\'s ecosystem token. CRO powers the Cronos EVM chain and unlocks perks like cashback, airport lounge access, and higher earn rates on the Crypto.com platform.' },
  leo: { description: 'Bitfinex exchange\'s utility token. UNUS SED LEO was issued to cover an $850M loss and gives holders trading fee discounts and withdrawal fee reductions on one of the oldest crypto exchanges.' },
  aave: { description: 'The largest decentralized lending protocol. Aave lets users supply and borrow crypto across Ethereum, Polygon, Arbitrum, and other chains with algorithmic interest rates and flash loans.' },
  okb: { description: 'OKX exchange\'s utility token. OKB gives holders trading fee discounts, early access to Jumpstart token launches, and powers the OKX Chain DeFi ecosystem.' },
  near: { description: 'A sharded, developer-friendly Layer 1 blockchain. NEAR Protocol uses Nightshade sharding for massive scalability and human-readable account names instead of hex addresses. Strong focus on AI and chain abstraction.' },
  render: { description: 'Decentralized GPU rendering network. Render connects artists and studios who need rendering power with GPU providers, creating a distributed compute marketplace for 3D graphics, motion design, and AI workloads.' },
  arb: { description: 'The leading Ethereum Layer 2 rollup by TVL. Arbitrum uses optimistic rollups to deliver fast, cheap transactions while inheriting Ethereum\'s full security. Home to GMX, Camelot, and hundreds of DeFi protocols.' },
  pol: { description: 'Polygon\'s upgraded native token (formerly MATIC). POL powers the Polygon ecosystem of chains including the zkEVM rollup and the AggLayer interoperability protocol connecting multiple L2s together.' },
  ondo: { description: 'The RWA tokenization leader. Ondo Finance brings US treasuries, bonds, and equities onchain through regulated products like USDY and OUSG, bridging traditional finance and DeFi with institutional-grade compliance.' },
  wld: { description: 'Sam Altman\'s digital identity project. Worldcoin uses iris-scanning Orbs to create a global proof-of-personhood system, distributing WLD tokens to verified unique humans worldwide.' },
  ena: { description: 'Ethena\'s governance token. Ethena created USDe, a synthetic dollar backed by staked ETH and delta-neutral hedging, offering high yields as a DeFi-native stablecoin alternative without traditional banking rails.' },
  qnt: { description: 'Enterprise blockchain interoperability. Quant\'s Overledger OS connects different blockchains and legacy financial networks, targeting banks, healthcare systems, and supply chain enterprises with cross-chain solutions.' },
  // === CRYPTO — SMALL CAP ===
  ray: { description: 'Solana\'s original automated market maker. Raydium provides deep liquidity and fast swaps on Solana, pioneering the hybrid AMM-orderbook model with concentrated liquidity pools for capital-efficient trading.' },
  'orca-token': { description: 'Solana\'s user-friendly DEX. Orca focuses on simple, intuitive trading with concentrated liquidity pools (Whirlpools) for capital-efficient swaps. Known for clean UX and the aquatic-themed design.' },
  bonk: { description: 'Solana\'s community dog meme coin. BONK was airdropped to Solana developers and NFT holders in late 2022, reviving the ecosystem during a bear market and becoming the chain\'s most beloved meme token.' },
  pyth: { description: 'Institutional-grade price oracles. Pyth Network aggregates first-party data from 90+ exchanges, trading firms, and market makers, delivering high-frequency, low-latency price feeds for DeFi on 50+ blockchains.' },
  trump: { description: 'The official memecoin launched by Donald Trump on Solana in January 2025. TRUMP token instantly became one of the most-traded meme coins in crypto history, driven by political fandom and speculation.' },
  pump: { description: 'Pump.fun\'s native token. The platform lets anyone launch a memecoin on Solana in seconds with a bonding curve mechanism. Became the fastest crypto app ever to hit $100M in cumulative revenue.' },
  nexo: { description: 'Crypto lending and earning platform. Nexo offers interest-bearing accounts, instant crypto credit lines, and an exchange. The NEXO token unlocks higher yields, lower loan rates, and cashback rewards.' },
  morpho: { description: 'Optimized DeFi lending. Morpho sits on top of Aave and Compound to offer better rates by peer-to-peer matching lenders and borrowers, improving capital efficiency for both sides of the market.' },
  // === STOCKS — PRE-IPO ===
  openai: {
    description: 'The company behind ChatGPT and GPT-5. OpenAI builds frontier AI models and is one of the most valuable private tech companies in the world. Racing toward AGI with billions in compute investment.',
    news: [
      { title: 'OpenAI Valued at $300B in Latest Secondary Sale', date: '2026-02-07', source: 'The Information' },
      { title: 'GPT-5 Enterprise Adoption Drives $15B ARR Milestone', date: '2026-02-01', source: 'Bloomberg' },
      { title: 'OpenAI Restructures to For-Profit as IPO Rumors Grow', date: '2026-01-26', source: 'Financial Times' },
    ],
  },
  anthropic: {
    description: 'AI safety company behind Claude. Anthropic focuses on building reliable, interpretable, and steerable AI systems. Backed by Google and major VCs, competing at the frontier of large language models.',
    news: [
      { title: 'Anthropic Raises $5B Series E at $90B Valuation', date: '2026-02-06', source: 'TechCrunch' },
      { title: 'Claude Enterprise Crosses 500K Business Customers', date: '2026-01-30', source: 'The Information' },
      { title: 'Anthropic Partners with AWS on Custom AI Chip Program', date: '2026-01-25', source: 'Bloomberg' },
    ],
  },
  xai: { description: 'Elon Musk\'s AI venture building Grok, the AI assistant integrated into X (formerly Twitter). Backed by billions in funding with direct access to X\'s real-time data firehose for training and inference.' },
  spacex: {
    description: 'Elon Musk\'s rocket company. SpaceX builds Falcon 9, Starship, and runs Starlink — the world\'s largest satellite internet constellation with millions of subscribers across 70+ countries.',
    news: [
      { title: 'Starship Completes First Orbital Refueling Mission', date: '2026-02-08', source: 'Reuters' },
      { title: 'Starlink Surpasses 10 Million Subscribers Globally', date: '2026-02-02', source: 'Bloomberg' },
      { title: 'SpaceX Valued at $350B in Latest Tender Offer', date: '2026-01-27', source: 'Financial Times' },
    ],
  },
  polymarket: { description: 'The largest prediction market platform built on Polygon. Polymarket lets users trade on the outcomes of real-world events — elections, sports, policy, culture — with transparent, onchain settlement and real-money stakes.' },
  // === STOCKS — LARGE CAP ===
  aapl: {
    description: 'iPhones, Macs, iPads, wearables, and services. Apple makes the hardware and runs the ecosystem that a few billion people use daily. The world\'s most valuable brand with unmatched customer loyalty.',
    news: [
      { title: 'Apple Reports Record Q1 Revenue Driven by AI Features', date: '2026-02-06', source: 'CNBC' },
      { title: 'Apple Intelligence Expands to 30 Languages in iOS 19.3', date: '2026-01-31', source: 'TechCrunch' },
      { title: 'Apple Vision Pro 2 Announced at Reduced Price Point', date: '2026-01-25', source: 'Bloomberg' },
    ],
  },
  googl: { description: 'Alphabet is Google\'s parent company. Search, YouTube, Android, Cloud, Waymo, DeepMind — Alphabet dominates internet infrastructure and leads AI research through its portfolio of subsidiaries serving billions daily.' },
  msft: {
    description: 'Cloud, Office, Windows, Xbox, LinkedIn. Microsoft is one of the world\'s most valuable companies and a dominant force in enterprise AI through its deep OpenAI partnership and Azure cloud platform.',
    news: [
      { title: 'Microsoft Azure AI Revenue Grows 80% Year over Year', date: '2026-02-05', source: 'CNBC' },
      { title: 'Microsoft Copilot Reaches 100M Monthly Active Users', date: '2026-01-31', source: 'TechCrunch' },
      { title: 'Microsoft Reports Record Q2 Cloud Revenue at $40B', date: '2026-01-26', source: 'Bloomberg' },
    ],
  },
  meta: {
    description: 'Social media giant behind Facebook, Instagram, WhatsApp, and Threads. Meta connects 3B+ daily active people and is investing heavily in AR/VR hardware and open-source AI models like Llama.',
    news: [
      { title: 'Meta Llama 4 Tops Benchmarks, Open-Source AI Surges', date: '2026-02-07', source: 'The Verge' },
      { title: 'Instagram Reaches 3 Billion Monthly Active Users', date: '2026-02-01', source: 'TechCrunch' },
      { title: 'Meta Quest 4 Pre-Orders Sell Out in 24 Hours', date: '2026-01-28', source: 'Bloomberg' },
    ],
  },
  tsla: {
    description: 'EVs, batteries, solar, and robotics. Tesla makes electric cars, energy storage, and the Optimus humanoid robot. Ships more EVs than anyone else in the US and is pioneering autonomous driving.',
    news: [
      { title: 'Tesla Robotaxi Service Launches in Austin and LA', date: '2026-02-08', source: 'Reuters' },
      { title: 'Tesla Q4 Deliveries Beat Estimates at 620K Vehicles', date: '2026-02-02', source: 'Electrek' },
      { title: 'Tesla Megapack Factory Reaches 100 GWh Annual Capacity', date: '2026-01-27', source: 'Bloomberg' },
    ],
  },
  jpm: { description: 'The biggest US bank by assets. JPMorgan Chase spans consumer banking, investment banking, asset management, and trading. A bellwether for the global financial system managing trillions in client assets.' },
  nvda: { description: 'The AI chip giant. NVIDIA designs the GPUs that power virtually all AI training and inference workloads worldwide. From gaming roots to a multi-trillion-dollar data center empire fueling the AI revolution.' },
  amzn: { description: 'E-commerce, cloud, and everything in between. Amazon runs the world\'s largest online marketplace and AWS — the backbone of the internet\'s cloud infrastructure powering millions of businesses.' },
  orcl: { description: 'Enterprise software and cloud infrastructure. Oracle runs the mission-critical databases behind banks, airlines, and governments worldwide. Aggressively expanding into cloud computing and AI-powered enterprise applications.' },
  pg: { description: 'Consumer goods giant behind Tide, Pampers, Gillette, and Oral-B. Procter & Gamble sells products used by nearly 5 billion people daily across 180+ countries. A dividend aristocrat with 60+ years of consecutive increases.' },
  qcom: { description: 'The wireless chip leader. Qualcomm\'s Snapdragon processors power most of the world\'s Android smartphones. Expanding aggressively into automotive, IoT, and AI edge computing as 5G and AI reshape mobile.' },
  // === STOCKS — MID CAP ===
  mcd: { description: 'The world\'s largest fast food chain. McDonald\'s operates 40,000+ restaurants in 100+ countries through a franchise model. Also one of the world\'s largest real estate empires — it owns the land under most locations.' },
  pep: { description: 'Snacks and beverages. PepsiCo owns Pepsi, Lay\'s, Doritos, Gatorade, Quaker, and dozens more. A $90B+ revenue global food and drink giant with a portfolio of brands people reach for every day.' },
  c: { description: 'One of the biggest global banks. Citigroup operates in 160+ countries, spanning consumer banking, institutional clients, wealth management, and trading desks. The most internationally diversified US bank.' },
  ba: { description: 'The aerospace and defense giant. Boeing builds commercial airplanes, military aircraft, satellites, and rockets. One of only two major commercial airplane manufacturers on Earth alongside Airbus.' },
  coin: { description: 'America\'s largest crypto exchange. Coinbase provides trading, custody, and infrastructure for digital assets. Also earns from the USDC stablecoin partnership and operates Base, an Ethereum Layer 2 chain.' },
  mstr: { description: 'The biggest corporate Bitcoin holder. MicroStrategy (now Strategy) holds 400,000+ BTC on its balance sheet, making its stock a leveraged proxy for Bitcoin. Also sells enterprise analytics software.' },
  pfe: { description: 'One of the world\'s largest pharmaceutical companies. Pfizer develops drugs and vaccines spanning oncology, immunology, cardiology, and rare diseases. Maker of the first authorized mRNA COVID vaccine.' },
  crcl: { description: 'The company behind USDC, the second-largest stablecoin with $30B+ in circulation. Circle operates regulated financial infrastructure for digital dollars and recently went public on the NYSE.' },
  jd: { description: 'China\'s largest direct-sales e-commerce platform. JD.com runs its own logistics network with automated warehouses across China, handling hundreds of millions of orders annually with same-day delivery.' },
  // === STOCKS — SMALL CAP ===
  sbux: { description: 'The world\'s largest coffeehouse chain. Starbucks operates 38,000+ stores globally, pioneering premium coffee culture and the mobile-first loyalty program that drives 60%+ of US revenue.' },
  adbe: { description: 'The creative software leader. Adobe makes Photoshop, Illustrator, Premiere Pro, and the entire Creative Cloud suite used by millions of designers, photographers, and video editors worldwide.' },
  intu: { description: 'Financial software for consumers and small businesses. Intuit makes TurboTax, QuickBooks, and Credit Karma — powering tax filing for 50M+ Americans and accounting for millions of small businesses.' },
  gme: { description: 'Video game retailer turned meme stock phenomenon. GameStop sells gaming hardware, software, and collectibles through 4,000+ retail stores and e-commerce. Now holds Bitcoin on its corporate balance sheet.' },
  // === ETF ===
  spy: {
    description: 'The SPDR S&P 500 ETF. Tracks the 500 largest US public companies — the most traded ETF in the world and the benchmark for the US stock market. Over $500B in assets under management.',
    news: [
      { title: 'S&P 500 Hits Record High as AI Rally Broadens', date: '2026-02-06', source: 'Bloomberg' },
      { title: 'SPY ETF Inflows Top $50B in January 2026', date: '2026-02-02', source: 'CNBC' },
      { title: 'US Q4 GDP Growth Beats Expectations at 3.2%', date: '2026-01-27', source: 'Reuters' },
    ],
  },
  qqq: { description: 'Tracks the Nasdaq-100 index — the 100 largest non-financial companies on Nasdaq. Heavy on tech giants like Apple, Microsoft, NVIDIA, Amazon, and Meta. The go-to ETF for US tech exposure.' },
  iefa: { description: 'Broad international equity exposure at ultra-low cost. iShares Core MSCI EAFE tracks large and mid-cap stocks across developed markets in Europe, Australasia, and the Far East excluding US and Canada.' },
  ivv: { description: 'Tracks the S&P 500 index with one of the lowest expense ratios available (0.03%). iShares Core S&P 500 holds all 500 of America\'s largest public companies. A core building block for any US equity portfolio.' },
  iwm: { description: 'Small-cap US equity exposure. iShares Russell 2000 tracks 2,000 small-cap American companies, offering diversification beyond the mega-cap tech names that dominate the S&P 500.' },
  dgrw: { description: 'Quality dividend growth strategy. WisdomTree\'s DGRW screens US companies for long-term earnings growth and dividend quality, weighting by expected dividends rather than market cap for a fundamentals-first approach.' },
  eem: { description: 'Broad emerging markets exposure. Tracks large and mid-cap companies across 24 emerging market countries including China, India, Brazil, Taiwan, and South Korea. A gateway to faster-growing economies.' },
  efa: { description: 'International developed market equities. iShares MSCI EAFE tracks large-cap stocks in Europe, Australia, Asia, and the Far East — broad developed-world exposure for everything outside North America.' },
  iemg: { description: 'Core emerging markets at ultra-low cost. Similar to EEM but adds small-cap stocks for broader coverage across 26 emerging market countries. Over 2,800 holdings for maximum diversification.' },
  ijh: { description: 'US mid-cap exposure. Tracks the S&P MidCap 400 — companies larger than small-caps but below the S&P 500. Often considered the sweet spot between growth potential and established business stability.' },
  itot: { description: 'The total US stock market in one ETF. iShares Core S&P Total tracks large, mid, small, and micro-cap US stocks — over 3,500 holdings for maximum diversification across the entire American market.' },
  iwf: { description: 'US large-cap growth stocks. iShares Russell 1000 Growth focuses on the fastest-growing large companies in America, heavily weighted toward technology, healthcare, and consumer discretionary sectors.' },
  iwn: { description: 'US small-cap value stocks. iShares Russell 2000 Value targets undervalued small companies, offering a contrarian tilt toward cheaper, often cyclical names in financials, industrials, and real estate.' },
  psq: { description: 'Inverse Nasdaq-100 exposure. ProShares Short QQQ aims to return the opposite of the Nasdaq-100\'s daily performance. A hedging tool for portfolios heavy in tech stocks. Designed for short-term tactical use.' },
  sqqq: { description: 'Triple-leveraged inverse Nasdaq-100. ProShares UltraPro Short QQQ seeks -3x the daily return of QQQ. An aggressive short-term trading instrument for bearish bets on tech. Not meant for buy-and-hold.' },
  tqqq: { description: 'Triple-leveraged Nasdaq-100. ProShares UltraPro QQQ seeks 3x the daily return of QQQ. High-octane tech exposure for short-term traders who can handle extreme volatility and daily rebalancing decay.' },
  vti: { description: 'The entire US stock market in one fund. Vanguard Total Stock Market tracks 4,000+ US stocks across every market cap, from trillion-dollar giants to the smallest micro-caps. Ultra-low 0.03% expense ratio.' },
  vtv: { description: 'US large-cap value stocks at rock-bottom cost. Vanguard Value targets undervalued blue-chip companies in financials, energy, healthcare, and industrials. Pairs well with growth ETFs for balanced exposure.' },
  // === COMMODITIES ===
  gold: {
    description: 'The oldest store of value. People have been hoarding gold for thousands of years, and central banks still stockpile it. A hedge against inflation, currency debasement, and geopolitical uncertainty.',
    news: [
      { title: 'Gold Crosses $2,800 as Central Banks Accelerate Buying', date: '2026-02-07', source: 'Bloomberg' },
      { title: 'Tokenized Gold Market Hits $5B TVL on Ethereum', date: '2026-02-01', source: 'DeFi Pulse' },
      { title: 'China Adds 30 Tonnes of Gold to Reserves in January', date: '2026-01-28', source: 'World Gold Council' },
    ],
  },
  gld: { description: 'The largest physically-backed gold ETF. SPDR Gold Shares holds gold bullion in London vaults, with each share representing about 1/10th of an ounce. The most liquid way to trade gold exposure.' },
  slv: { description: 'Physical silver exposure. iShares Silver Trust holds silver bullion in vaults, offering investors a convenient way to gain exposure to the silver price without the hassle of storing physical metal.' },
  uso: { description: 'Oil futures exposure. United States Oil Fund tracks the price of West Texas Intermediate (WTI) crude oil through near-month futures contracts. The most popular way to trade oil price movements.' },
  copx: { description: 'Copper mining equities. Global X Copper Miners ETF holds companies engaged in copper mining worldwide, offering leveraged exposure to the industrial metal critical for EVs, grids, and construction.' },
  dbc: { description: 'Broad commodities basket. Invesco DB Commodity Index tracks 14 commodities across energy, agriculture, and metals using futures contracts. A one-stop shop for diversified commodity exposure.' },
  ftgc: { description: 'Actively managed commodities. First Trust Global Tactical Commodity allocates dynamically across energy, agriculture, metals, and livestock based on market conditions and relative value analysis.' },
  iau: { description: 'Low-cost physical gold exposure. iShares Gold Trust holds gold bullion at a lower expense ratio than GLD (0.25% vs 0.40%), making it popular for buy-and-hold gold investors seeking minimal drag.' },
  nikl: { description: 'Nickel mining equities. Sprott Nickel Miners ETF holds companies mining and producing nickel — a critical metal for EV batteries, stainless steel, and the global energy transition.' },
  pall: { description: 'Physical palladium exposure. abrdn Physical Palladium Shares holds palladium bullion in secure vaults. Palladium is a precious metal used primarily in automotive catalytic converters for emission control.' },
  pdbc: { description: 'Broad commodity exposure with tax efficiency. Invesco Optimum Yield Diversified Commodity uses an optimized futures roll strategy and issues a simple 1099 tax form instead of the dreaded K-1.' },
  remx: { description: 'Rare earth and strategic metals exposure. VanEck Rare Earth/Strategic Metals ETF holds miners and refiners of elements critical for electronics, EVs, wind turbines, and defense applications.' },
  // === BONDS ===
  tlt: { description: 'Long-duration US Treasury exposure. iShares 20+ Year Treasury Bond ETF holds US government bonds with 20+ year maturities. A pure play on long-term interest rates — rises when rates fall, drops when they rise.' },
  hyg: { description: 'High-yield corporate bonds. iShares iBoxx $ High Yield holds below-investment-grade corporate bonds offering higher yields in exchange for more credit risk. A popular way to reach for income in fixed income.' },
  sgov: { description: 'Ultra-short Treasury exposure. iShares 0-3 Month Treasury Bond ETF parks cash in the shortest-duration US government securities available. Essentially a money market ETF with near-zero interest rate risk.' },
  agg: { description: 'The broadest US bond market ETF. iShares Core US Aggregate Bond holds treasuries, mortgage-backed securities, and investment-grade corporate bonds across all maturities. The benchmark for US fixed income.' },
  binc: { description: 'Flexible income strategy. BlackRock\'s actively managed BINC allocates across global fixed income sectors — government bonds, corporates, high yield, emerging market debt — seeking income with moderate risk.' },
  cloa: { description: 'AAA-rated CLO exposure. iShares AAA CLO Active ETF holds the highest-quality tranches of collateralized loan obligations, offering a yield premium over traditional short-term bonds with floating-rate protection.' },
  cloi: { description: 'Investment-grade CLO exposure from VanEck. CLO ETF invests in the senior tranches of collateralized loan obligations, providing floating-rate income that naturally benefits when interest rates rise.' },
  jaaa: { description: 'AAA CLO exposure from Janus Henderson. JAAA holds the most senior, safest tranches of CLOs — offering higher yields than money market funds with floating-rate protection and minimal credit risk.' },
  tip: { description: 'Inflation-protected bonds. iShares TIPS Bond ETF holds US Treasury Inflation-Protected Securities whose principal adjusts with CPI. A shield for purchasing power when inflation runs hotter than expected.' },
  usfr: { description: 'Floating rate Treasury exposure. WisdomTree Floating Rate Treasury Fund holds US government floating rate notes. Yields reset every week with short-term rates, providing automatic protection from rate hikes.' },
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

/**
 * Returns a static price map: symbol -> { price, change24h }
 * Used as fallback for tokens without live CoinGecko prices (stocks, bonds, commodities).
 */
export function getStaticPriceMap() {
  const map = {}
  for (const asset of allAssets) {
    map[asset.symbol] = { price: asset.price, change24h: asset.change24h }
  }
  return map
}

// Build set of symbols available on Solana from SPL token list
const _solanaSymbols = new Set(SPL_TOKEN_LIST.map(t => t.symbol))
_solanaSymbols.add('SOL') // Native SOL (WSOL is the wrapped SPL version)

// Asset symbols that differ from their SPL symbol
const _solanaAliases = { XAU: 'PAXG' }

export function getAssetChains(asset) {
  const chains = []
  if (asset.providers) {
    for (const p of asset.providers) {
      if (p.address && !chains.includes(p.chain)) chains.push(p.chain)
    }
    return chains
  }
  if (_solanaSymbols.has(asset.symbol) || _solanaSymbols.has(_solanaAliases[asset.symbol])) {
    chains.push('solana')
  }
  if (asset.ethereumAddress) chains.push('ethereum')
  return chains
}

export function getAssetProviders(asset) {
  if (!asset.providers) return []
  return asset.providers.filter(p => p.address != null)
}

export function getStocks(subcategory) {
  if (!subcategory) return stocks
  return stocks.filter(s => s.subcategory === subcategory)
}

export function getCrypto(subcategory) {
  if (!subcategory) return crypto
  return crypto.filter(c => c.subcategory === subcategory)
}

export function getCommodities(subcategory) {
  if (!subcategory) return commodities
  return commodities.filter(c => c.subcategory === subcategory)
}

export function getBonds(subcategory) {
  if (!subcategory) return bonds
  return bonds.filter(b => b.subcategory === subcategory)
}

export function getAssetById(id) {
  const asset = allAssets.find(a => a.id === id)
  if (!asset) return null
  const detail = { ...defaultDetail, ...(assetDetails[id] || {}) }
  return { ...asset, ...detail }
}

export function searchAssets(query) {
  const q = query.toLowerCase()
  const assetResults = allAssets.filter(
    a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
  )
  // Also search forex pairs
  const fxResults = FX_MARKETS
    .filter(m => {
      const pair = m.pair.toLowerCase()
      const pairFlat = pair.replace('/', '')
      const baseName = CURRENCY_META[m.base]?.name?.toLowerCase() || ''
      const quoteName = CURRENCY_META[m.quote]?.name?.toLowerCase() || ''
      return pair.includes(q) || pairFlat.includes(q) || baseName.includes(q) || quoteName.includes(q)
        || m.base.toLowerCase().includes(q) || m.quote.toLowerCase().includes(q)
    })
    .map(m => ({
      id: `forex-${m.pair.replace('/', '')}`,
      name: `${m.pair} Forex`,
      symbol: m.pair,
      price: null,
      change24h: 0,
      category: 'forex',
      logo: null,
      _forexPair: m.pair.replace('/', ''),
    }))
  return [...assetResults, ...fxResults]
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

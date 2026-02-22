import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DappNavbar from '../components/DappNavbar'
import BuyModal from '../components/BuyModal'
import AssetLogo from '../components/AssetLogo'
import AISuggestions from '../components/AISuggestions'
import { getStocks, getCrypto, getCommodities, getBonds, getAssetChains } from '../services/assets'
import { generateAssetSuggestions } from '../services/aiSuggestions'
import { useLivePrices } from '../hooks/useLivePrices'
import { useRatings } from '../hooks/useRatings'
import RwaArbitrageTab from '../components/RwaArbitrage'
import AssetSwap from '../components/AssetSwap'
import './Assets.css'

const SUB_TABS = {
  Stocks: [
    { key: 'pre-ipo', label: 'Pre-IPO' },
    { key: 'large-cap', label: 'Large Cap' },
    { key: 'mid-cap', label: 'Mid Cap' },
    { key: 'small-cap', label: 'Small Cap' },
    { key: 'etf', label: 'ETF' },
    { key: 'arbitrage', label: 'Arbitrage' },
    { key: 'swap', label: 'Swap' },
  ],
  Crypto: [
    { key: 'large-cap', label: 'Large Cap' },
    { key: 'mid-cap', label: 'Mid Cap' },
    { key: 'small-cap', label: 'Small Cap' },
    { key: 'swap', label: 'Swap' },
  ],
  Commodities: [
    { key: 'precious-metals', label: 'Precious Metals' },
    { key: 'energy', label: 'Energy' },
    { key: 'industrial', label: 'Industrial' },
    { key: 'broad', label: 'Broad' },
    { key: 'arbitrage', label: 'Arbitrage' },
    { key: 'swap', label: 'Swap' },
  ],
  Bonds: [
    { key: 'treasury', label: 'Treasury' },
    { key: 'corporate', label: 'Corporate' },
    { key: 'clo', label: 'CLO' },
    { key: 'swap', label: 'Swap' },
  ],
}

const DEFAULT_SUB = {
  Stocks: 'pre-ipo',
  Crypto: 'large-cap',
  Commodities: 'precious-metals',
  Bonds: 'treasury',
}

const HEADERS = {
  Stocks: { word: 'Stock', subtitle: 'Trade tokenized equities on Solana & Ethereum. Real-time prices from leading exchanges.' },
  Crypto: { word: 'Crypto', subtitle: 'Trade cryptocurrencies across Solana & Ethereum. Live prices from CoinMarketCap.' },
  Commodities: { word: 'Commodity', subtitle: 'Trade tokenized commodities on Solana & Ethereum. Gold, silver, oil, and more.' },
  Bonds: { word: 'Bond', subtitle: 'Trade tokenized bonds on Solana & Ethereum. Treasury, corporate, and CLO exposure.' },
}

const FETCHERS = {
  Stocks: getStocks,
  Crypto: getCrypto,
  Commodities: getCommodities,
  Bonds: getBonds,
}

function formatPrice(price) {
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

export default function Assets({ defaultTab = 'Crypto' }) {
  const [subSelections, setSubSelections] = useState(DEFAULT_SUB)
  const [buyAsset, setBuyAsset] = useState(null)
  const [sellAsset, setSellAsset] = useState(null)
  const [swapFromSymbol, setSwapFromSymbol] = useState(null)
  const navigate = useNavigate()
  const { version } = useLivePrices()

  const activeSub = subSelections[defaultTab]
  const tabs = SUB_TABS[defaultTab] || []
  const fetcher = FETCHERS[defaultTab]
  const assets = fetcher ? fetcher(activeSub) : []

  const ratingSymbols = useMemo(() => {
    if (defaultTab !== 'Crypto') return []
    return assets.map(a => a.symbol).filter(Boolean)
  }, [assets, defaultTab])
  const { ratings, isLoading: ratingsLoading, hasError: ratingsError } = useRatings(ratingSymbols, version)

  const assetSuggestions = useMemo(() => generateAssetSuggestions(assets, null, defaultTab, ratings), [assets, defaultTab, ratings])

  const handleSubChange = (key) => {
    setSubSelections(prev => ({ ...prev, [defaultTab]: key }))
  }

  const handleSuggestionAction = useCallback((s) => {
    // Find matching asset by symbol
    const match = assets.find(a => a.symbol === s.asset)
    if (!match) return
    switch (s.action) {
      case 'Buy':
        setBuyAsset(match)
        break
      case 'Sell':
        setSellAsset(match)
        break
      case 'Swap':
        setSwapFromSymbol(match.symbol)
        handleSubChange('swap')
        break
      default:
        navigate(`/assets/${match.id}`)
    }
  }, [assets, navigate])

  return (
    <>
      <DappNavbar />
      <main className="assets-page">
        <div className="container">
          <h1 className="assets-title">
            <span className="gradient-text">{HEADERS[defaultTab]?.word}</span> Trading
          </h1>
          <p className="assets-subtitle">{HEADERS[defaultTab]?.subtitle}</p>

          {tabs.length > 0 && (
            <div className="assets-tabs">
              {tabs.map((s) => (
                <button
                  key={s.key}
                  className={`assets-tab ${activeSub === s.key ? 'active' : ''}`}
                  onClick={() => handleSubChange(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {activeSub !== 'swap' && activeSub !== 'arbitrage' && (
            <AISuggestions suggestions={assetSuggestions} onAction={handleSuggestionAction} ratingsLoading={ratingsLoading} ratingsError={ratingsError} />
          )}

          {activeSub === 'swap' ? (
            <AssetSwap category={defaultTab.toLowerCase()} initialFromSymbol={swapFromSymbol} />
          ) : activeSub === 'arbitrage' ? (
            <RwaArbitrageTab category={defaultTab.toLowerCase()} />
          ) : (
            <div className="assets-table-wrap glass-card">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>24h %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="asset-row-clickable" onClick={() => navigate(`/assets/${asset.id}`)}>
                      <td className="asset-name-cell">
                        <AssetLogo logo={asset.logo} name={asset.name} size={32} />
                        <span className="asset-name">{asset.name}</span>
                      </td>
                      <td className="asset-symbol">{asset.symbol}</td>
                      <td>${formatPrice(asset.price)}</td>
                      <td className={`asset-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </td>
                      <td className="asset-actions">
                        <button className="btn btn-buy asset-buy-btn" onClick={(e) => { e.stopPropagation(); setBuyAsset(asset) }}>
                          Buy
                        </button>
                        {getAssetChains(asset).length > 0 && (
                          <button className="btn btn-sell asset-sell-btn" onClick={(e) => { e.stopPropagation(); setSellAsset(asset) }}>
                            Sell
                          </button>
                        )}
                        <button className="btn btn-outline asset-detail-btn" onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}`) }}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {buyAsset && <BuyModal asset={buyAsset} mode="buy" onClose={() => setBuyAsset(null)} />}
      {sellAsset && <BuyModal asset={sellAsset} mode="sell" onClose={() => setSellAsset(null)} />}
    </>
  )
}

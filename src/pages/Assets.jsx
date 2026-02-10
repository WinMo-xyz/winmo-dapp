import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DappNavbar from '../components/DappNavbar'
import BuyModal from '../components/BuyModal'
import AssetLogo from '../components/AssetLogo'
import { getStocks, getCrypto, getCommodities, getBonds } from '../services/assets'
import { useLivePrices } from '../hooks/useLivePrices'
import './Assets.css'

const TABS = ['Stocks', 'Crypto', 'Commodities', 'Bonds']

const STOCK_SUBS = [
  { key: 'pre-ipo', label: 'Pre-IPO' },
  { key: 'large-cap', label: 'Large Cap' },
  { key: 'mid-cap', label: 'Mid Cap' },
  { key: 'small-cap', label: 'Small Cap' },
]

const CRYPTO_SUBS = [
  { key: 'large-cap', label: 'Large Cap' },
  { key: 'mid-cap', label: 'Mid Cap' },
  { key: 'small-cap', label: 'Small Cap' },
]

function formatPrice(price) {
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

export default function Assets() {
  const [activeTab, setActiveTab] = useState('Stocks')
  const [stockSub, setStockSub] = useState('pre-ipo')
  const [cryptoSub, setCryptoSub] = useState('large-cap')
  const [buyAsset, setBuyAsset] = useState(null)
  const navigate = useNavigate()
  const { version } = useLivePrices()
  void version

  let assets = []
  let subTabs = null

  if (activeTab === 'Stocks') {
    assets = getStocks(stockSub)
    subTabs = (
      <div className="assets-subtabs">
        {STOCK_SUBS.map((s) => (
          <button
            key={s.key}
            className={`assets-subtab ${stockSub === s.key ? 'active' : ''}`}
            onClick={() => setStockSub(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
    )
  } else if (activeTab === 'Crypto') {
    assets = getCrypto(cryptoSub)
    subTabs = (
      <div className="assets-subtabs">
        {CRYPTO_SUBS.map((s) => (
          <button
            key={s.key}
            className={`assets-subtab ${cryptoSub === s.key ? 'active' : ''}`}
            onClick={() => setCryptoSub(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
    )
  } else if (activeTab === 'Commodities') {
    assets = getCommodities()
  } else {
    assets = getBonds()
  }

  return (
    <>
      <DappNavbar />
      <main className="assets-page">
        <div className="container">
          <div className="assets-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`assets-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {subTabs}

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
                  <tr key={asset.id}>
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
                      <button className="btn btn-accent asset-buy-btn" onClick={() => setBuyAsset(asset)}>
                        Buy
                      </button>
                      <button className="btn btn-outline asset-detail-btn" onClick={() => navigate(`/assets/${asset.id}`)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {buyAsset && <BuyModal asset={buyAsset} onClose={() => setBuyAsset(null)} />}
    </>
  )
}

import { useParams, Link } from 'react-router-dom'
import DappNavbar from '../components/DappNavbar'
import BuyPanel from '../components/BuyPanel'
import PriceChart from '../components/PriceChart'
import AssetLogo from '../components/AssetLogo'
import { getAssetById } from '../services/assets'
import { useLivePrices } from '../hooks/useLivePrices'
import './AssetDetail.css'

function formatPrice(price) {
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

export default function AssetDetail() {
  const { id } = useParams()
  const { version } = useLivePrices()
  void version
  const asset = getAssetById(id)

  if (!asset) {
    return (
      <>
        <DappNavbar />
        <main className="asset-detail-page">
          <div className="container">
            <div className="asset-not-found glass-card">
              <h2>Asset not found</h2>
              <p>Nothing here. This asset doesn't exist.</p>
              <Link to="/assets" className="btn btn-secondary">Back to Assets</Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DappNavbar />
      <main className="asset-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="asset-detail-breadcrumb">
            <Link to="/assets" className="breadcrumb-link">Assets</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{asset.name}</span>
          </div>

          {/* Header */}
          <div className="asset-detail-header">
            <div className="asset-detail-info">
              <AssetLogo logo={asset.logo} name={asset.name} size={56} />
              <div>
                <h1 className="asset-detail-name">{asset.name}</h1>
                <span className="asset-detail-symbol">{asset.symbol}</span>
              </div>
            </div>
            <div className="asset-detail-price-wrap">
              <span className="asset-detail-price gradient-text">${formatPrice(asset.price)}</span>
              <span className={`asset-detail-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="asset-detail-desc">{asset.description}</p>

          {/* Chart + Buy Panel Grid */}
          <div className="asset-detail-grid">
            <div className="asset-detail-chart glass-card">
              <PriceChart assetId={asset.id} price={asset.price} category={asset.category} subcategory={asset.subcategory} />
            </div>

            <div className="asset-detail-sidebar">
              <BuyPanel asset={asset} />
            </div>
          </div>

          {/* News & Funding */}
          <section className="asset-detail-news">
            <h2 className="asset-detail-section-title">News & Funding Rounds</h2>
            <div className="news-wrapper">
              <div className="news-blur">
                <div className="news-grid">
                  {asset.news.map((item, i) => (
                    <div key={i} className="news-card glass-card glass-card-hover">
                      <span className="news-source">{item.source}</span>
                      <h3 className="news-title">{item.title}</h3>
                      <span className="news-date">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="news-coming-soon">
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

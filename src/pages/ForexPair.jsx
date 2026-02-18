import { useParams, Link, useNavigate } from 'react-router-dom'
import DappNavbar from '../components/DappNavbar'
import ForexPairDetail from '../components/forex/ForexPairDetail'
import { useForexRates } from '../hooks/useForexRates'
import './Forex.css'

export default function ForexPair() {
  const { pair } = useParams()
  const navigate = useNavigate()
  const { rates, markets, isLoading, getCrossRate } = useForexRates()

  // Convert URL param (EURUSD) to pair format (EUR/USD)
  const pairName = pair.length >= 6
    ? `${pair.slice(0, 3)}/${pair.slice(3)}`.toUpperCase()
    : pair.toUpperCase()

  const market = markets.find(m => m.pair === pairName)

  if (isLoading) {
    return (
      <>
        <DappNavbar />
        <main className="forex-page">
          <div className="container">
            <div className="forex-loading"><p className="forex-loading-text">Loading FX rates...</p></div>
          </div>
        </main>
      </>
    )
  }

  if (!market) {
    return (
      <>
        <DappNavbar />
        <main className="forex-page">
          <div className="container">
            <div className="asset-not-found glass-card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: 40 }}>
              <h2>Pair not found</h2>
              <p style={{ color: 'var(--color-light-secondary)', marginBottom: 24 }}>
                No forex market found for "{pairName}".
              </p>
              <Link to="/forex" className="btn btn-secondary">Back to Forex</Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DappNavbar />
      <main className="forex-page">
        <div className="container">
          <ForexPairDetail
            market={market}
            rates={rates}
            getCrossRate={getCrossRate}
            onClose={() => navigate('/forex')}
          />
        </div>
      </main>
    </>
  )
}

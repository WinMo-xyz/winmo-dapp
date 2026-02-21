import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Portfolio from './pages/Portfolio'

const Assets = lazy(() => import('./pages/Assets'))
const AssetDetail = lazy(() => import('./pages/AssetDetail'))
const Yield = lazy(() => import('./pages/Yield'))
const Forex = lazy(() => import('./pages/Forex'))
const ForexPair = lazy(() => import('./pages/ForexPair'))
const Money = lazy(() => import('./pages/Money'))
const AIAgent = lazy(() => import('./pages/AIAgent'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/portfolio" element={<Navigate to="/" replace />} />
          <Route path="/stocks" element={<Assets key="stocks" defaultTab="Stocks" />} />
          <Route path="/crypto" element={<Assets key="crypto" defaultTab="Crypto" />} />
          <Route path="/commodities" element={<Assets key="commodities" defaultTab="Commodities" />} />
          <Route path="/bonds" element={<Assets key="bonds" defaultTab="Bonds" />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/yield" element={<Yield />} />
          <Route path="/forex" element={<Forex />} />
          <Route path="/forex/:pair" element={<ForexPair />} />
          <Route path="/money" element={<Money />} />
          <Route path="/ai-agent" element={<AIAgent />} />
        </Routes>
      </Suspense>
    </>
  )
}

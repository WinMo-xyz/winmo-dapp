import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'

const Portfolio = lazy(() => import('./pages/Portfolio'))
const Assets = lazy(() => import('./pages/Assets'))
const AssetDetail = lazy(() => import('./pages/AssetDetail'))
const Yield = lazy(() => import('./pages/Yield'))
const Forex = lazy(() => import('./pages/Forex'))
const ForexPair = lazy(() => import('./pages/ForexPair'))

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
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/stocks" element={<ProtectedRoute><Assets key="stocks" defaultTab="Stocks" /></ProtectedRoute>} />
          <Route path="/crypto" element={<ProtectedRoute><Assets key="crypto" defaultTab="Crypto" /></ProtectedRoute>} />
          <Route path="/commodities" element={<ProtectedRoute><Assets key="commodities" defaultTab="Commodities" /></ProtectedRoute>} />
          <Route path="/bonds" element={<ProtectedRoute><Assets key="bonds" defaultTab="Bonds" /></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
          <Route path="/yield" element={<ProtectedRoute><Yield /></ProtectedRoute>} />
          <Route path="/forex" element={<ProtectedRoute><Forex /></ProtectedRoute>} />
          <Route path="/forex/:pair" element={<ProtectedRoute><ForexPair /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

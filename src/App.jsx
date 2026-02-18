import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Assets from './pages/Assets'
import AssetDetail from './pages/AssetDetail'
import Yield from './pages/Yield'
import Forex from './pages/Forex'
import ForexPair from './pages/ForexPair'

export default function App() {
  return (
    <>
      <ScrollToTop />
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
    </>
  )
}

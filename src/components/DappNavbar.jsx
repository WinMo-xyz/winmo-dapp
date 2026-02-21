import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import UnifiedConnectButton from './UnifiedConnectButton'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import './DappNavbar.css'

export default function DappNavbar() {
  const navigate = useNavigate()
  const navStripRef = useRef(null)
  const [canScroll, setCanScroll] = useState(false)

  const checkOverflow = useCallback(() => {
    const el = navStripRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    setCanScroll(el.scrollWidth > el.clientWidth + 8 && !atEnd)
  }, [])

  useEffect(() => {
    checkOverflow()
    let timer
    const debouncedCheck = () => {
      clearTimeout(timer)
      timer = setTimeout(checkOverflow, 200)
    }
    window.addEventListener('resize', debouncedCheck)
    return () => {
      window.removeEventListener('resize', debouncedCheck)
      clearTimeout(timer)
    }
  }, [checkOverflow])

  const handleSearchSelect = (asset) => {
    if (asset._forexPair) {
      navigate(`/forex/${asset._forexPair}`)
    } else {
      navigate(`/assets/${asset.id}`)
    }
  }

  return (
    <>
      <nav className="dapp-navbar">
        <div className="dapp-navbar-inner">
          <NavLink to="/" className="navbar-logo">
            <img src="/winmo-logo.png" alt="WinMo" className="logo-img" />
            <span className="logo-text">WinMo</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="dapp-nav-center">
            <div className="dapp-nav-pill">
              <NavLink to="/" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Portfolio
              </NavLink>
              <NavLink to="/money" className={({ isActive }) => `dapp-nav-link nav-coming-soon ${isActive ? 'active' : ''}`}>
                Money
              </NavLink>
              <NavLink to="/stocks" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Stocks
              </NavLink>
              <NavLink to="/crypto" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Crypto
              </NavLink>
              <NavLink to="/commodities" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Commodities
              </NavLink>
              <NavLink to="/bonds" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Bonds
              </NavLink>
              <NavLink to="/yield" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Yield
              </NavLink>
              <NavLink to="/forex" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
                Forex
              </NavLink>
              <NavLink to="/ai-agent" className={({ isActive }) => `dapp-nav-link nav-new ${isActive ? 'active' : ''}`}>
                AI Agent
              </NavLink>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="dapp-nav-actions">
            <SearchBar onSelect={handleSearchSelect} />
            <ThemeToggle />
            <UnifiedConnectButton />
          </div>

          {/* Mobile top bar right */}
          <div className="dapp-mobile-right">
            <SearchBar onSelect={handleSearchSelect} />
            <ThemeToggle />
            <UnifiedConnectButton compact />
          </div>
        </div>

        {/* Mobile scrollable nav strip — sits right below header */}
        <div className={`dapp-mobile-nav ${canScroll ? 'has-overflow' : ''}`} ref={navStripRef} onScroll={checkOverflow}>
          <NavLink to="/" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Portfolio
          </NavLink>
          <NavLink to="/money" className={({ isActive }) => `dapp-mobile-chip nav-coming-soon ${isActive ? 'active' : ''}`}>
            Money
          </NavLink>
          <NavLink to="/stocks" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Stocks
          </NavLink>
          <NavLink to="/crypto" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Crypto
          </NavLink>
          <NavLink to="/commodities" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Commodities
          </NavLink>
          <NavLink to="/bonds" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Bonds
          </NavLink>
          <NavLink to="/yield" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Yield
          </NavLink>
          <NavLink to="/forex" className={({ isActive }) => `dapp-mobile-chip ${isActive ? 'active' : ''}`}>
            Forex
          </NavLink>
          <NavLink to="/ai-agent" className={({ isActive }) => `dapp-mobile-chip nav-new ${isActive ? 'active' : ''}`}>
            AI Agent
          </NavLink>
        </div>
      </nav>
    </>
  )
}

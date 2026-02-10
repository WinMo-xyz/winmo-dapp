import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import UnifiedConnectButton from './UnifiedConnectButton'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import './DappNavbar.css'

export default function DappNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearchSelect = (asset) => {
    navigate(`/assets/${asset.id}`)
  }

  return (
    <nav className="dapp-navbar">
      <div className="dapp-navbar-inner">
        <NavLink to="/portfolio" className="navbar-logo">
          <span className="logo-mark">W</span>
          <span className="logo-text">WinMo</span>
        </NavLink>

        <div className="dapp-nav-center">
          <div className="dapp-nav-pill">
            <NavLink to="/portfolio" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
              Portfolio
            </NavLink>
            <NavLink to="/assets" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
              Assets
            </NavLink>
            <NavLink to="/yield" className={({ isActive }) => `dapp-nav-link ${isActive ? 'active' : ''}`}>
              Yield
            </NavLink>
          </div>
        </div>

        <div className="dapp-nav-actions">
          <SearchBar onSelect={handleSearchSelect} />
          <ThemeToggle />
          <UnifiedConnectButton />
        </div>

        <div className="dapp-mobile-right">
          <ThemeToggle />
          <UnifiedConnectButton compact />
          <button
            className={`dapp-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`dapp-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink
          to="/portfolio"
          className={({ isActive }) => `dapp-mobile-link ${isActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Portfolio
        </NavLink>
        <NavLink
          to="/assets"
          className={({ isActive }) => `dapp-mobile-link ${isActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Assets
        </NavLink>
        <NavLink
          to="/yield"
          className={({ isActive }) => `dapp-mobile-link ${isActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Yield
        </NavLink>
        <div className="dapp-mobile-search">
          <SearchBar onSelect={(asset) => { handleSearchSelect(asset); setMenuOpen(false) }} />
        </div>
      </div>
    </nav>
  )
}

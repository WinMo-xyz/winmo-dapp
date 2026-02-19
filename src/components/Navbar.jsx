import { Link } from 'react-router-dom'
import UnifiedConnectButton from './UnifiedConnectButton'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/winmo-logo.png" alt="WinMo" className="logo-img" />
          <span className="logo-text">WinMo</span>
        </Link>

        <div className="landing-nav-actions">
          <ThemeToggle />
          <UnifiedConnectButton />
        </div>
      </div>
    </nav>
  )
}

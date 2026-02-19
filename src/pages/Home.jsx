import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '../context/WalletContext'
import Navbar from '../components/Navbar'
import './Home.css'

export default function Home() {
  const { isConnected } = useWallet()
  const { setVisible: openSolanaModal } = useWalletModal()
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isConnected) {
      navigate('/portfolio')
    }
  }, [isConnected, navigate])

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  return (
    <>
      <Navbar />
      <section className="home-hero">
        {/* Background glows */}
        <div className="glow home-glow-1" />
        <div className="glow home-glow-2" />

        <div className="container home-container">
          <div className="home-content">
            <h1 className="home-heading">
              <span className="gradient-text">Winning</span>
              <br />
              Money
            </h1>
            <p className="home-subtitle">
              Stocks, crypto, commodities, bonds. One portfolio, fully onchain. Buy anything from anywhere.
            </p>
            <div className="home-cta-group">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <div className="home-cta-wrap" ref={pickerRef}>
                    <button
                      className="btn btn-primary home-cta"
                      onClick={() => setPickerOpen(!pickerOpen)}
                    >
                      Connect Wallet
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                    {pickerOpen && (
                      <div className="home-chain-picker">
                        <button
                          className="home-chain-option"
                          onClick={() => { setPickerOpen(false); openSolanaModal(true) }}
                        >
                          <span className="home-chain-icon">◎</span>
                          <span>Solana</span>
                        </button>
                        <button
                          className="home-chain-option"
                          onClick={() => { setPickerOpen(false); openConnectModal() }}
                        >
                          <span className="home-chain-icon">Ξ</span>
                          <span>Ethereum</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </ConnectButton.Custom>

              <button
                className="btn home-cta home-cta-agent"
                onClick={() => navigate('/ai-agent')}
              >
                Connect AI Agent
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="home-visual">
            {/* Glow effects */}
            <div className="home-vis-glow home-vis-glow-1" />
            <div className="home-vis-glow home-vis-glow-2" />
            <div className="home-vis-glow home-vis-glow-center" />
            {/* Giant background text */}
            <div className="home-vis-marquee" aria-hidden="true">
              <span>WINMO</span>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}

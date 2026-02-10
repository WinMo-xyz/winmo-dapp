import { useState, useRef, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '../context/WalletContext'
import './UnifiedConnectButton.css'

export default function UnifiedConnectButton({ compact = false }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const ref = useRef(null)
  const { isEvmConnected, isSolanaConnected, evmAddress, solanaAddress } = useWallet()
  const { disconnect: disconnectSolana, wallet: solanaWalletInfo } = useSolanaWallet()
  const { setVisible: openSolanaModal } = useWalletModal()

  // Use actual address presence — more reliable than connection flags
  const hasEvm = isEvmConnected && !!evmAddress
  const hasSol = isSolanaConnected && !!solanaAddress

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  const truncatedSolana = solanaAddress
    ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
    : ''

  // Both disconnected — show single "Connect Wallet" with chain picker
  if (!hasEvm && !hasSol) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <div className="unified-connect" ref={ref}>
            <button
              className="unified-connect-btn"
              onClick={() => setPickerOpen(!pickerOpen)}
            >
              {!compact && 'Connect Wallet'}
              {compact && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              )}
            </button>
            {pickerOpen && (
              <div className="unified-picker">
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openConnectModal() }}
                >
                  <span className="unified-picker-icon">Ξ</span>
                  <span>Ethereum</span>
                </button>
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openSolanaModal(true) }}
                >
                  <span className="unified-picker-icon">◎</span>
                  <span>Solana</span>
                </button>
              </div>
            )}
          </div>
        )}
      </ConnectButton.Custom>
    )
  }

  // At least one connected — show connected wallet(s)
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal }) => (
        <div className="unified-connect" ref={ref}>
          <div className="unified-connected-group">
            {/* EVM wallet */}
            {hasEvm && account ? (
              <button className="unified-wallet-pill" onClick={openAccountModal}>
                {chain?.iconUrl && (
                  <img src={chain.iconUrl} alt={chain.name} className="unified-chain-icon" />
                )}
                <span className="unified-wallet-addr">{account.displayName}</span>
              </button>
            ) : null}

            {/* Solana wallet */}
            {hasSol ? (
              <button className="unified-wallet-pill solana" onClick={disconnectSolana}>
                {solanaWalletInfo?.adapter.icon ? (
                  <img src={solanaWalletInfo.adapter.icon} alt="Solana" className="unified-chain-icon" />
                ) : (
                  <span className="unified-picker-icon sm">◎</span>
                )}
                {!compact && <span className="unified-wallet-addr">{truncatedSolana}</span>}
              </button>
            ) : null}

            {/* Connect other chain */}
            {(!hasEvm || !hasSol) && (
              <button
                className="unified-add-btn"
                onClick={() => setPickerOpen(!pickerOpen)}
                title={!hasEvm ? 'Connect Ethereum' : 'Connect Solana'}
              >
                +
              </button>
            )}
          </div>

          {pickerOpen && (
            <div className="unified-picker">
              {!hasEvm && (
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openConnectModal() }}
                >
                  <span className="unified-picker-icon">Ξ</span>
                  <span>Ethereum</span>
                </button>
              )}
              {!hasSol && (
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openSolanaModal(true) }}
                >
                  <span className="unified-picker-icon">◎</span>
                  <span>Solana</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </ConnectButton.Custom>
  )
}

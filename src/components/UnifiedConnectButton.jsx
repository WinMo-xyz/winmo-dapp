import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '../context/WalletContext'
import './UnifiedConnectButton.css'

export default function UnifiedConnectButton({ compact = false }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [solModalOpen, setSolModalOpen] = useState(false)
  const [solBalance, setSolBalance] = useState(null)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)
  const solModalRef = useRef(null)
  const { isEvmConnected, isSolanaConnected, evmAddress, solanaAddress } = useWallet()
  const { disconnect: disconnectSolana, wallet: solanaWalletInfo, publicKey } = useSolanaWallet()
  const { connection } = useConnection()
  const { setVisible: openSolanaModal } = useWalletModal()

  // Use actual address presence — more reliable than connection flags
  const hasEvm = isEvmConnected && !!evmAddress
  const hasSol = isSolanaConnected && !!solanaAddress

  // Fetch SOL balance when modal opens
  useEffect(() => {
    if (!solModalOpen || !publicKey || !connection) return
    let cancelled = false
    connection.getBalance(publicKey).then((lamports) => {
      if (!cancelled) setSolBalance(lamports / 1e9)
    }).catch(() => {
      if (!cancelled) setSolBalance(0)
    })
    return () => { cancelled = true }
  }, [solModalOpen, publicKey, connection])

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  // Close Solana modal on outside click
  useEffect(() => {
    if (!solModalOpen) return
    const handler = (e) => {
      if (solModalRef.current && !solModalRef.current.contains(e.target)) setSolModalOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [solModalOpen])

  const handleCopyAddress = useCallback(() => {
    if (!solanaAddress) return
    navigator.clipboard.writeText(solanaAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [solanaAddress])

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
                  onClick={() => { setPickerOpen(false); openSolanaModal(true) }}
                >
                  <span className="unified-picker-icon">◎</span>
                  <span>Solana</span>
                </button>
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openConnectModal() }}
                >
                  <span className="unified-picker-icon">Ξ</span>
                  <span>Ethereum</span>
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
            {/* Solana wallet */}
            {hasSol ? (
              <button className="unified-wallet-pill solana" onClick={() => setSolModalOpen(true)}>
                {solanaWalletInfo?.adapter.icon ? (
                  <img src={solanaWalletInfo.adapter.icon} alt="Solana" className="unified-chain-icon" />
                ) : (
                  <span className="unified-picker-icon sm">◎</span>
                )}
                {!compact && <span className="unified-wallet-addr">{truncatedSolana}</span>}
              </button>
            ) : null}

            {/* Solana account modal — portalled to body to escape navbar stacking context */}
            {solModalOpen && hasSol && createPortal(
              <div className="sol-modal-overlay">
                <div className="sol-modal" ref={solModalRef}>
                  <button className="sol-modal-close" onClick={() => setSolModalOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="sol-modal-avatar">
                    {solanaWalletInfo?.adapter.icon ? (
                      <img src={solanaWalletInfo.adapter.icon} alt="Solana wallet" />
                    ) : (
                      <span>◎</span>
                    )}
                  </div>

                  <div className="sol-modal-address">{truncatedSolana}</div>
                  <div className="sol-modal-balance">
                    {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '— SOL'}
                  </div>

                  <div className="sol-modal-actions">
                    <button className="sol-modal-action" onClick={handleCopyAddress}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                    <button className="sol-modal-action disconnect" onClick={() => { disconnectSolana(); setSolModalOpen(false) }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* EVM wallet */}
            {hasEvm && account ? (
              <button className="unified-wallet-pill" onClick={openAccountModal}>
                {chain?.iconUrl && (
                  <img src={chain.iconUrl} alt={chain.name} className="unified-chain-icon" />
                )}
                {!compact && <span className="unified-wallet-addr">{account.displayName}</span>}
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
              {!hasSol && (
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openSolanaModal(true) }}
                >
                  <span className="unified-picker-icon">◎</span>
                  <span>Solana</span>
                </button>
              )}
              {!hasEvm && (
                <button
                  className="unified-picker-option"
                  onClick={() => { setPickerOpen(false); openConnectModal() }}
                >
                  <span className="unified-picker-icon">Ξ</span>
                  <span>Ethereum</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </ConnectButton.Custom>
  )
}

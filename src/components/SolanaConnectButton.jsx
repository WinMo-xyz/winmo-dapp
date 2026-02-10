import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import './SolanaConnectButton.css'

export default function SolanaConnectButton({ compact = false }) {
  const { publicKey, wallet, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : ''

  return (
    <button
      className={`solana-connect-btn ${connected ? 'connected' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleClick}
    >
      {connected && wallet?.adapter.icon ? (
        <img
          src={wallet.adapter.icon}
          alt={wallet.adapter.name}
          className="solana-wallet-icon"
        />
      ) : (
        <span className="solana-connect-icon">◎</span>
      )}
      {connected ? (
        <span className="solana-connect-addr">{truncatedAddress}</span>
      ) : (
        <span className="solana-connect-label">Solana</span>
      )}
    </button>
  )
}

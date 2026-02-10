import { createContext, useContext } from 'react'
import { useAccount, useEnsName } from 'wagmi'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  // EVM state
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const { data: ensName } = useEnsName({ address: evmAddress })

  // Solana state
  const { publicKey, connected: isSolanaConnected } = useSolanaWallet()
  const solanaAddress = publicKey?.toBase58() || null

  const isConnected = isEvmConnected || isSolanaConnected

  // displayName prefers ENS > truncated Solana > truncated EVM
  let displayName = ''
  if (ensName) {
    displayName = ensName
  } else if (solanaAddress) {
    displayName = `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
  } else if (evmAddress) {
    displayName = `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
  }

  return (
    <WalletContext.Provider value={{
      address: solanaAddress || evmAddress || null,
      evmAddress: evmAddress || null,
      solanaAddress,
      isConnected,
      isEvmConnected,
      isSolanaConnected,
      ensName,
      displayName,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletProvider } from './context/WalletContext'
import { WinmoAgentProvider } from './agent'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { config } from './config/wagmi'
import { SOLANA_RPC_ENDPOINT, SOLANA_WALLETS } from './config/solana'
import App from './App'
import '@rainbow-me/rainbowkit/styles.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import './styles/solana-overrides.css'
import './styles/global.css'

const queryClient = new QueryClient()

function RainbowKitThemed({ children }) {
  const { theme } = useTheme()
  const rkTheme = theme === 'dark'
    ? darkTheme({
        accentColor: '#c9a84c',
        accentColorForeground: '#050917',
        borderRadius: 'large',
        fontStack: 'system',
      })
    : lightTheme({
        accentColor: '#9a7b2e',
        accentColorForeground: '#f8f5f0',
        borderRadius: 'large',
        fontStack: 'system',
      })

  return (
    <RainbowKitProvider theme={rkTheme}>
      {children}
    </RainbowKitProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemed>
            <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
              <SolanaWalletProvider wallets={SOLANA_WALLETS} autoConnect>
                <WalletModalProvider>
                  <BrowserRouter>
                    <WalletProvider>
                      <WinmoAgentProvider>
                        <App />
                      </WinmoAgentProvider>
                    </WalletProvider>
                  </BrowserRouter>
                </WalletModalProvider>
              </SolanaWalletProvider>
            </ConnectionProvider>
          </RainbowKitThemed>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </StrictMode>,
)

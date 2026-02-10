import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'
import { http } from 'wagmi'

export const config = getDefaultConfig({
  appName: 'WinMo DApp',
  // Get a real project ID at https://cloud.walletconnect.com/ (free)
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'winmo-dapp-demo',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth'),
  },
})

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'WinMo DApp',
  projectId: 'winmo-dapp-demo',
  chains: [mainnet],
})

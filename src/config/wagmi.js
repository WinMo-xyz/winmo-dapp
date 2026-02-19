import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'
import { http } from 'wagmi'

export const config = getDefaultConfig({
  appName: 'WinMo',
  appDescription: 'Multi-chain DeFi portfolio & trading',
  appUrl: 'https://app.winmo.xyz',
  appIcon: 'https://app.winmo.xyz/winmo-logo.png',
  projectId: '861c3750c40fc4ec1ff2ad29ed455431',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com'),
  },
})

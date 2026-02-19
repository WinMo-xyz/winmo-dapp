import { useEffect, useRef } from 'react'
import { useWallet } from '../context/WalletContext'
import { useAccount } from 'wagmi'
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import {
  getStocks, getCrypto, getCommodities, getBonds,
  getAssetById, searchAssets, getStaticPriceMap, getSwappableTokens,
} from '../services/assets'
import { getYieldProtocols } from '../services/yield'
import { fetchCryptoPrices } from '../services/cmcApi'
import { fetchPythPrices } from '../services/pythApi'
import { FX_FEED_IDS } from '../config/forex'
import {
  getQuote as jupiterGetQuote,
  getSwapTransaction as jupiterGetSwapTx,
  toSmallestUnit as jupToSmallest,
  fromSmallestUnit as jupFromSmallest,
  resolveSolanaMint,
  getSplDecimals,
  SOLANA_PAYMENT_META,
} from '../services/jupiterApi'
import {
  getRouteRaw as kyberGetRouteRaw,
  buildRoute as kyberBuildRoute,
  resolveTokenAddress,
  getTokenDecimals,
  toSmallestUnit as kyberToSmallest,
  fromSmallestUnit as kyberFromSmallest,
  PAYMENT_TOKEN_META,
} from '../services/kyberswapApi'

export function WinmoAgentProvider({ children }) {
  const wallet = useWallet()
  const walletRef = useRef(wallet)
  walletRef.current = wallet

  const { connector } = useAccount()
  const connectorRef = useRef(connector)
  connectorRef.current = connector

  const { connection } = useConnection()
  const connectionRef = useRef(connection)
  connectionRef.current = connection

  const solanaWallet = useSolanaWallet()
  const solanaWalletRef = useRef(solanaWallet)
  solanaWalletRef.current = solanaWallet

  useEffect(() => {
    let readyResolve
    const readyPromise = new Promise((resolve) => { readyResolve = resolve })

    const api = {
      version: '1.0.0',
      ready: readyPromise,

      // ─── Read-only: Asset data ──────────────────────────

      async getAssets(category, subcategory) {
        const getters = { stocks: getStocks, crypto: getCrypto, commodities: getCommodities, bonds: getBonds }
        if (category && getters[category]) return getters[category](subcategory)
        if (!category) return [...getStocks(), ...getCrypto(), ...getCommodities(), ...getBonds()]
        return []
      },

      async getAsset(id) {
        return getAssetById(id)
      },

      async searchAssets(query) {
        return searchAssets(query)
      },

      // ─── Read-only: Prices ──────────────────────────────

      async getPrices() {
        const live = await fetchCryptoPrices()
        const staticPrices = getStaticPriceMap()
        return { ...staticPrices, ...(live || {}) }
      },

      async getForexRates() {
        return fetchPythPrices(FX_FEED_IDS)
      },

      // ─── Read-only: Yield ───────────────────────────────

      async getYieldProtocols(riskLevel) {
        return getYieldProtocols(riskLevel)
      },

      // ─── Quote ──────────────────────────────────────────

      async getQuote({ from, to, amount, chain }) {
        if (!from || !to || !amount || !chain) {
          throw new Error('Missing required params: from, to, amount, chain')
        }

        if (chain === 'solana') {
          const fromAsset = [...getStocks(), ...getCrypto(), ...getCommodities(), ...getBonds()]
            .find(a => a.symbol.toUpperCase() === from.toUpperCase())
          const toAsset = [...getStocks(), ...getCrypto(), ...getCommodities(), ...getBonds()]
            .find(a => a.symbol.toUpperCase() === to.toUpperCase())

          let inputMint, inputDecimals
          const payMeta = SOLANA_PAYMENT_META[from.toUpperCase()]
          if (payMeta) {
            inputMint = payMeta.mint
            inputDecimals = payMeta.decimals
          } else {
            inputMint = resolveSolanaMint(fromAsset)
            inputDecimals = inputMint ? getSplDecimals(inputMint) : 6
          }

          let outputMint
          const outPay = SOLANA_PAYMENT_META[to.toUpperCase()]
          if (outPay) {
            outputMint = outPay.mint
          } else {
            outputMint = resolveSolanaMint(toAsset)
          }

          if (!inputMint || !outputMint) throw new Error('Cannot resolve mints for this pair on Solana')

          const amountRaw = jupToSmallest(amount, inputDecimals)
          return jupiterGetQuote(inputMint, outputMint, amountRaw)
        }

        if (chain === 'ethereum') {
          const fromAsset = [...getStocks(), ...getCrypto(), ...getCommodities(), ...getBonds()]
            .find(a => a.symbol.toUpperCase() === from.toUpperCase())
          const toAsset = [...getStocks(), ...getCrypto(), ...getCommodities(), ...getBonds()]
            .find(a => a.symbol.toUpperCase() === to.toUpperCase())

          let inputAddr, inputDecimals
          const payMeta = PAYMENT_TOKEN_META[from.toUpperCase()]
          if (payMeta) {
            inputAddr = payMeta.address
            inputDecimals = payMeta.decimals
          } else {
            inputAddr = resolveTokenAddress(fromAsset)
            inputDecimals = inputAddr ? getTokenDecimals(inputAddr) : 18
          }

          let outputAddr
          const outPay = PAYMENT_TOKEN_META[to.toUpperCase()]
          if (outPay) {
            outputAddr = outPay.address
          } else {
            outputAddr = resolveTokenAddress(toAsset)
          }

          if (!inputAddr || !outputAddr) throw new Error('Cannot resolve addresses for this pair on Ethereum')

          const amountRaw = kyberToSmallest(amount, inputDecimals)
          return kyberGetRouteRaw(inputAddr, outputAddr, amountRaw)
        }

        throw new Error(`Unsupported chain: ${chain}`)
      },

      // ─── Wallet-dependent ───────────────────────────────

      getWalletState() {
        const w = walletRef.current
        return {
          isConnected: w.isConnected,
          isEvmConnected: w.isEvmConnected,
          isSolanaConnected: w.isSolanaConnected,
          evmAddress: w.evmAddress,
          solanaAddress: w.solanaAddress,
          displayName: w.displayName,
          ensName: w.ensName,
        }
      },

      async getPortfolio() {
        const w = walletRef.current
        if (!w.isConnected) throw new Error('No wallet connected')

        const holdings = []

        // EVM balances via wagmi provider
        if (w.isEvmConnected && w.evmAddress) {
          try {
            const { getBalance, readContract } = await import('wagmi/actions')
            const { config } = await import('../config/wagmi')
            const { ERC20_TOKEN_LIST } = await import('../config/tokens')

            // Native ETH
            const ethBal = await getBalance(config, { address: w.evmAddress })
            if (ethBal && Number(ethBal.formatted) > 0) {
              holdings.push({ symbol: 'ETH', chain: 'ethereum', balance: ethBal.formatted })
            }

            // ERC-20 tokens
            for (const token of ERC20_TOKEN_LIST) {
              try {
                const bal = await readContract(config, {
                  address: token.address,
                  abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }],
                  functionName: 'balanceOf',
                  args: [w.evmAddress],
                })
                const formatted = kyberFromSmallest(bal.toString(), token.decimals || 18)
                if (Number(formatted) > 0) {
                  holdings.push({ symbol: token.symbol, chain: 'ethereum', balance: formatted })
                }
              } catch (_) { /* skip tokens that fail */ }
            }
          } catch (_) { /* wagmi not available */ }
        }

        // Solana balances
        if (w.isSolanaConnected && w.solanaAddress) {
          try {
            const conn = connectionRef.current
            const { PublicKey } = await import('@solana/web3.js')
            const owner = new PublicKey(w.solanaAddress)

            // Native SOL
            const solBal = await conn.getBalance(owner)
            if (solBal > 0) {
              holdings.push({ symbol: 'SOL', chain: 'solana', balance: jupFromSmallest(solBal.toString(), 9) })
            }

            // SPL tokens
            const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
              programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            })
            for (const { account } of tokenAccounts.value) {
              const info = account.data.parsed?.info
              if (info && Number(info.tokenAmount?.uiAmount) > 0) {
                holdings.push({
                  symbol: info.mint,
                  chain: 'solana',
                  balance: info.tokenAmount.uiAmountString,
                  mint: info.mint,
                })
              }
            }
          } catch (_) { /* solana not available */ }
        }

        return holdings
      },

      async getBalance(symbol, chain) {
        const portfolio = await api.getPortfolio()
        const match = portfolio.find(h =>
          h.symbol.toUpperCase() === symbol.toUpperCase() && h.chain === chain
        )
        return match ? match.balance : '0'
      },

      // ─── Transactional ──────────────────────────────────

      async executeSwap({ from, to, amount, chain, slippage }) {
        const w = walletRef.current
        if (!w.isConnected) throw new Error('No wallet connected')

        if (chain === 'solana') {
          if (!w.isSolanaConnected) throw new Error('Solana wallet not connected')
          const swallet = solanaWalletRef.current
          if (!swallet.signTransaction) throw new Error('Solana wallet does not support signing')

          const quote = await api.getQuote({ from, to, amount, chain })
          const { swapTransaction } = await jupiterGetSwapTx(quote, swallet.publicKey)

          const { VersionedTransaction } = await import('@solana/web3.js')
          const txBuf = Buffer.from(swapTransaction, 'base64')
          const tx = VersionedTransaction.deserialize(txBuf)
          const signed = await swallet.signTransaction(tx)
          const conn = connectionRef.current
          const sig = await conn.sendRawTransaction(signed.serialize())
          await conn.confirmTransaction(sig, 'confirmed')

          return { chain: 'solana', txHash: sig }
        }

        if (chain === 'ethereum') {
          if (!w.isEvmConnected) throw new Error('Ethereum wallet not connected')
          const conn = connectorRef.current
          if (!conn) throw new Error('No EVM connector available')

          const quote = await api.getQuote({ from, to, amount, chain })
          const buildData = await kyberBuildRoute(
            quote.routeSummary,
            w.evmAddress,
            slippage || 100
          )

          const provider = await conn.getProvider()
          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: w.evmAddress,
              to: buildData.routerAddress,
              data: buildData.data,
              value: buildData.transactionValue || '0x0',
            }],
          })

          return { chain: 'ethereum', txHash }
        }

        throw new Error(`Unsupported chain: ${chain}`)
      },
    }

    Object.freeze(api)
    window.winmo = api
    readyResolve()
    window.dispatchEvent(new CustomEvent('winmo:ready'))

    return () => {
      delete window.winmo
    }
  }, [])

  return children
}

import { SupportedChains } from './types'
import { chain, Chain } from 'wagmi'

export const mumbaiContractAddress =
  '0xC885a10d858179140Bc48283217297910A8eE0Dd'
export const goerliContractAddress =
  '0x3bbF06ad0468F4883e3142A7c7dB6CaD12229cd1'

export const chainToContractAddress = new Map<SupportedChains, string>([
  [SupportedChains.ethereum, goerliContractAddress],
  [SupportedChains.polygon, mumbaiContractAddress],
])

export const chainToHyperlaneId = new Map<SupportedChains, string>([
  [SupportedChains.ethereum, '5'],
  [SupportedChains.polygon, '80001'],
])

export const supportedChainToWagmiChain = new Map<SupportedChains, Chain>([
  [SupportedChains.ethereum, chain.goerli],
  [SupportedChains.optimism, chain.arbitrumGoerli],
  [SupportedChains.polygon, chain.polygonMumbai],
])

export const chainIdToCurrencyId = new Map<string, string>([
  ['80001', '2'],
  ['5', '1'],
])

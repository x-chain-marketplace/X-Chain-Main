import { ethers } from 'ethers'
import { SupportedChains } from './types'
import * as PushAPI from '@pushprotocol/restapi'
import { chain, Chain } from 'wagmi'

export const mumbaiContractAddress =
  '0x12256d5D9429D15457F2bA8d303221136e0e9942'
export const goerliContractAddress =
  '0x88643Bb4bdc710f1ff62c7d65DF31031cd5a455c'

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

export const push = async (address: string) => {
  if (!address) return
  const PK = '75b2c1b5eb14c0a2178e06d065f804d5cb62834b4afa34328ff274ab38d755a7' // channel private key
  const Pkey = `0x${PK}`
  const signer = new ethers.Wallet(Pkey)
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title: `Your NFT was sold`,
        body: `{NFT_NAME was sold for {} ETH on {} network`,
      },
      payload: {
        title: `Your NFT was sold`,
        body: `{NFT_NAME was sold for {} ETH on {} network`,
        cta: '',
        img: '',
      },
      recipients: `eip155:5:${address}`, // recipient address
      channel: 'eip155:5:0xB9dBFEF2751682519EFAC269baD93fD62C4ac455', // your channel address
      env: 'staging',
    })

    // apiResponse?.status === 204, if sent successfully!
    console.log('API repsonse: ', apiResponse)
  } catch (err) {
    console.error('Error: ', err)
  }
}

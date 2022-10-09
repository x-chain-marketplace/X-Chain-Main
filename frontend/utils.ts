import { ethers } from 'ethers'
import { SupportedChains } from './types'
import * as PushAPI from '@pushprotocol/restapi'

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

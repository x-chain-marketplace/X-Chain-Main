import { NextApiRequest, NextApiResponse } from 'next'
import { Network, Alchemy, Nft } from 'alchemy-sdk'
import { SupportedChains } from '../../../../../types'

const chainToKey = new Map([
  [SupportedChains.ethereum, process.env.ETH_KEY],
  [SupportedChains.optimism, process.env.OPTIMISM_KEY],
  [SupportedChains.polygon, process.env.POLYGON_KEY],
])

const chainToNetwork = new Map([
  [SupportedChains.ethereum, Network.ETH_GOERLI],
  [SupportedChains.polygon, Network.MATIC_MUMBAI],
  [SupportedChains.optimism, Network.OPT_GOERLI],
])

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ nft: Nft; owner: string } | { message: string }>
) {
  const { chain, contract, tokenId } = req.query

  const supportedChains = Object.values(SupportedChains)
  if (!supportedChains.includes(chain as any)) {
    return res.status(400).json({
      message: `chain ${chain} is not valid, supported chains: ${JSON.stringify(
        supportedChains
      )}`,
    })
  }

  const settings = {
    apiKey: chainToKey.get(chain as SupportedChains), // Replace with your Alchemy API Key.
    network: chainToNetwork.get(chain as SupportedChains), // Replace with your network.
  }
  const alchemy = new Alchemy(settings)
  const data = await alchemy.nft.getNftMetadata(
    contract as string,
    tokenId as string
  )

  const owner = await alchemy.nft.getOwnersForNft(
    contract as string,
    tokenId as string
  )

  res.status(200).json({ nft: data, owner: owner.owners[0] })
}

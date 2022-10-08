import { NextApiRequest, NextApiResponse } from 'next'
import { Network, Alchemy, Nft } from 'alchemy-sdk'

enum Chain {
  ethereum = 'ethereum',
  optimism = 'optimism',
  polygon = 'polygon',
}

const chainToKey = new Map([
  [Chain.ethereum, process.env.ETH_KEY],
  [Chain.optimism, process.env.OPTIMISM_KEY],
  [Chain.polygon, process.env.POLYGON_KEY],
])

const chainToNetwork = new Map([
  [Chain.ethereum, Network.ETH_GOERLI],
  [Chain.polygon, Network.MATIC_MUMBAI],
  [Chain.optimism, Network.OPT_GOERLI],
])

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Nft | { message: string }>
) {
  const { chain, contract, tokenId } = req.query

  const supportedChains = Object.values(Chain)
  if (!supportedChains.includes(chain as any)) {
    return res.status(400).json({
      message: `chain ${chain} is not valid, supported chains: ${JSON.stringify(
        supportedChains
      )}`,
    })
  }

  const settings = {
    apiKey: chainToKey.get(chain as Chain), // Replace with your Alchemy API Key.
    network: chainToNetwork.get(chain as Chain), // Replace with your network.
  }
  const alchemy = new Alchemy(settings)
  const data = await alchemy.nft.getNftMetadata(
    contract as string,
    tokenId as string
  )

  res.status(200).json(data)
}

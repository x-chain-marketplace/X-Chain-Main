import { Box, Img, Spinner } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '../../../../components/layout/Layout'
import { Nft } from 'alchemy-sdk'
import axios from 'axios'
import { useAccount } from 'wagmi'

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain, contract, tokenId } = router.query

  const { address } = useAccount()
  const [nft, setNft] = useState<Nft | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)

  useEffect(() => {
    const grabMetadata = async () => {
      setIsLoadingMetadata(true)
      const url = `/api/nft/${chain}/${contract}/${tokenId}`
      const res = await axios.get(url)
      const nft = res.data as Nft
      setNft(nft)
      setIsLoadingMetadata(false)
    }

    if (chain && contract && tokenId) {
      grabMetadata()
    }
  }, [chain, contract, tokenId])

  // TODO make sure this exists go to backup otherwise
  const image = nft?.media[0].gateway

  return (
    <Layout>
      <Box>
        <div>{`current wallet address: ${address}`}</div>
        <div>{`chain: ${chain}`}</div>
        <div>{`contract address: ${contract}`}</div>
        <div>{`tokenId: ${tokenId}`}</div>
        <div>
          {isLoadingMetadata ? (
            <Spinner />
          ) : (
            <>
              <div>{`title: ${nft?.title}`}</div>
              <div>{`description: ${nft?.description}`}</div>
              <Box boxSize="sm">
                <Img src={image} alt={nft?.title} />
              </Box>
            </>
          )}
        </div>
      </Box>
    </Layout>
  )
}

export default NftIndex

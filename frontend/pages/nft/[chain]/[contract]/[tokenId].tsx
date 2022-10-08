import { Box, Spinner } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '../../../../components/layout/Layout'
import { Nft } from 'alchemy-sdk'
import axios from 'axios'

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain, contract, tokenId } = router.query

  const { data: session } = useSession()
  const address = session?.user?.name
  const [metadata, setMetadata] = useState<Nft | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)

  useEffect(() => {
    const grabMetadata = async () => {
      setIsLoadingMetadata(true)
      const url = `/api/nft/${chain}/${contract}/${tokenId}`
      const data = (await axios.get(url)) as Nft

      console.log(`here's the data ${JSON.stringify(data)}`)
      setMetadata(data)
      setIsLoadingMetadata(false)
    }

    if (chain && contract && tokenId) {
      grabMetadata()
    }
  }, [chain, contract, tokenId])

  return (
    <Layout>
      <Box>
        <div>{`address: ${address}`}</div>
        <div>{`chain: ${chain}`}</div>
        <div>{`contract address: ${contract}`}</div>
        <div>{`tokenId: ${tokenId}`}</div>
        <div>
          {isLoadingMetadata ? (
            <Spinner />
          ) : (
            <div>{`metadata: ${JSON.stringify(metadata)}`}</div>
          )}
        </div>
      </Box>
    </Layout>
  )
}

export default NftIndex

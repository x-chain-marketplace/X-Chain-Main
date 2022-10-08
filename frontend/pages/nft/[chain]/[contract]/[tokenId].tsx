import { Box } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Layout } from '../../../../components/layout/Layout'

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain, contract, tokenId } = router.query

  const { data: session } = useSession()
  const address = session?.user?.name

  return (
    <Layout>
      <Box>
        <div>{`address: ${address}`}</div>
        <div>{`chain: ${chain}`}</div>
        <div>{`contract address: ${contract}`}</div>
        <div>{`tokenId: ${tokenId}`}</div>
      </Box>
    </Layout>
  )
}

export default NftIndex

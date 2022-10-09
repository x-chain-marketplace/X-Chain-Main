import { Box, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Layout } from '../components/layout/Layout'

const Done: NextPage = () => {
  const router = useRouter()
  const { message, assetLink } = router.query

  return (
    <Layout>
      <Box maxW="lg" mx="auto">
        <Text>{message}</Text>
        {assetLink ? <Link href={assetLink as string}>View Asset</Link> : null}
      </Box>
    </Layout>
  )
}

export default Done

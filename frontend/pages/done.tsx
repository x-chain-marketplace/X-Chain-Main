import { Box, Button, Img, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Layout } from '../components/layout/Layout'

const Done: NextPage = () => {
  const router = useRouter()
  const { message, assetLink } = router.query

  return (
    <Layout>
      <Box
        maxW="xl"
        mx="auto"
        display="flex"
        textAlign="center"
        flexDirection="column"
        justifyContent="center"
        p="20px"
      >
        <Img
          src="/logo-solo.svg"
          display="block"
          mx="auto"
          justifyContent="center"
          width="250px"
        />
        <Text fontSize="27px" mb="50px">
          {message}
        </Text>
        {assetLink ? (
          <Link href={assetLink as string}>
            <Button
              mt={4}
              background="#FF6600"
              mr={3}
              display="flex"
              border="2px solid #FF6600"
              width="250px"
              padding="25px 20px"
              color="#fff"
              borderRadius="120px"
              mx="auto"
              fontSize="20px"
              _hover={{
                background: '#ff660099',
                transition: '0.5s',
                transform: 'scale(1.05)',
                color: '#fff',
              }}
            >
              View Asset
            </Button>
          </Link>
        ) : null}
      </Box>
    </Layout>
  )
}

export default Done

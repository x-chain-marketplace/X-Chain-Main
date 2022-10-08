import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Layout } from '../components/layout/Layout'

const Home: NextPage = () => {
  const router = useRouter()
  const [chain, setChain] = useState('')
  const handleChainChange = (event: any) => setChain(event.target.value)
  const [contract, setContract] = useState('')
  const handleContractChange = (event: any) => setContract(event.target.value)
  const [tokenId, setTokenId] = useState('')
  const handleTokenIdChange = (event: any) => setTokenId(event.target.value)
  return (
    <Layout>
      <Box>
        <Stack spacing={4}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="$"
            />
            <Input
              type="text"
              placeholder="chain"
              value={chain}
              onChange={handleChainChange}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="#"
            />
            <Input
              type="text"
              placeholder="contract address"
              value={contract}
              onChange={handleContractChange}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="T"
            />
            <Input
              type="text"
              placeholder="tokenId"
              value={tokenId}
              onChange={handleTokenIdChange}
            />
          </InputGroup>

          <Button
            mt={4}
            colorScheme="teal"
            onClick={() => {
              router.push(`/nft/${chain}/${contract}/${tokenId}`)
            }}
          >
            Go
          </Button>
        </Stack>
      </Box>
    </Layout>
  )
}

export default Home

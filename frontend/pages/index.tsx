import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Layout } from '../components/layout/Layout'
import { Chain } from '../types'

const Home: NextPage = () => {
  const router = useRouter()

  const [contract, setContract] = useState('')
  const handleContractChange = (event: any) => setContract(event.target.value)
  const [tokenId, setTokenId] = useState('')
  const [chain, setChain] = useState(Chain.ethereum)

  const handleTokenIdChange = (event: any) => setTokenId(event.target.value)
  return (
    <Layout>
      <Box>
        <Stack spacing={4}>
          <RadioGroup
            onChange={(value) => setChain(value as Chain)}
            value={chain}
          >
            <Stack direction="row">
              <Radio value={Chain.ethereum}>Ethereum</Radio>
              <Radio value={Chain.optimism}>Optimism</Radio>
              <Radio value={Chain.polygon}>Polygon</Radio>
            </Stack>
          </RadioGroup>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
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

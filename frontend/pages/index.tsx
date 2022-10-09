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
import { SupportedChains } from '../types'

const Home: NextPage = () => {
  const router = useRouter()

  const [contract, setContract] = useState('')
  const handleContractChange = (event: any) => setContract(event.target.value)
  const [tokenId, setTokenId] = useState('')
  const [chain, setChain] = useState(SupportedChains.ethereum)

  const handleTokenIdChange = (event: any) => setTokenId(event.target.value)
  return (
    <Layout>
      <Box maxW="lg" mx="auto">
        <Stack spacing={4}>
          <RadioGroup
            onChange={(value) => setChain(value as SupportedChains)}
            value={chain}
          >
            <Stack direction="row">
              <Radio value={SupportedChains.ethereum}>Ethereum</Radio>
              <Radio value={SupportedChains.optimism}>Optimism</Radio>
              <Radio value={SupportedChains.polygon}>Polygon</Radio>
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
            background="#FF6600"
            mr={3}
            border="2px solid #FF6600"
            padding="25px 40px"
            color="#fff"
            borderRadius="120px"
            fontSize="20px"
            onClick={() => {
              router.push(`/nft/${chain}/${contract}/${tokenId}`)
            }}
            _hover={{
              background: '#ff660099',
              transition: '0.5s',
              transform: 'scale(1.05)',
              color: '#fff',
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

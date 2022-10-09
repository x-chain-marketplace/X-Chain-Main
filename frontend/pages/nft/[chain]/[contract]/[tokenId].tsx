import {
  Box,
  Button,
  useColorMode,
  Flex,
  Grid,
  GridItem,
  Heading,
  Img,
  Image,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  Link,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '../../../../components/layout/Layout'
import { Nft } from 'alchemy-sdk'
import axios from 'axios'
import {
  useAccount,
  useContractRead,
  useNetwork,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import marketABI from '../../../../artifacts/contracts/Market.sol/Market.json'
import { Chain } from '../../../../types'
import { formatEther, getAddress, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

const mumbaiContractAddress = '0xC885a10d858179140Bc48283217297910A8eE0Dd'
const goerliContractAddress = '0x3bbF06ad0468F4883e3142A7c7dB6CaD12229cd1'

const chainToContractAddress = new Map<Chain, string>([
  [Chain.ethereum, goerliContractAddress],
  [Chain.polygon, mumbaiContractAddress],
])

const chainToHyperlaneId = new Map<Chain, string>([
  [Chain.ethereum, '5'],
  [Chain.polygon, '80001'],
])

enum TransactionState {
  pending = 'pending',
  failed = 'failed',
  complete = 'complete',
  notStarted = 'notStarted',
}

type ListingInfo = [string, BigNumber, string]

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain: listingChain, contract, tokenId } = router.query

  const { address } = useAccount()
  const { chain: userConnectedChain } = useNetwork()
  const [nft, setNft] = useState<Nft | null>(null)
  const [nftOwner, setNftOwner] = useState<string | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)
  const [isErrorFetchingMetadata, setIsErrorFetchingMetadata] = useState(false)
  const [transactionState, setTransactionState] = useState<TransactionState>(
    TransactionState.notStarted
  )
  const { colorMode, toggleColorMode } = useColorMode()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const listedWithUs =
    nftOwner != null &&
    [mumbaiContractAddress, goerliContractAddress].includes(
      getAddress(nftOwner)
    )

  useEffect(() => {
    const grabMetadata = async () => {
      try {
        setIsLoadingMetadata(true)
        const url = `/api/nft/${listingChain}/${contract}/${tokenId}`
        const res = await axios.get(url)
        const { nft, owner } = res.data as { nft: Nft; owner: string }
        setNftOwner(owner)
        setNft(nft)
        setIsLoadingMetadata(false)
        setIsErrorFetchingMetadata(false)
      } catch (e) {
        console.log(e)
        setIsErrorFetchingMetadata(true)
      }
    }

    if (listingChain && contract && tokenId) {
      grabMetadata()
    }
  }, [listingChain, contract, tokenId])

  // TODO make sure this exists go to backup otherwise
  const image = nft?.media[0].gateway

  const getListInformationArgs = [
    chainToHyperlaneId.get(listingChain as Chain) as string,
    contract,
    tokenId,
  ]

  const {
    data: listingInfoData,
    isError: isErrorListingInfo,
    isLoading: isLoadingListingInfo,
  } = useContractRead({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI.abi,
    functionName: 'getListInformation',
    args: getListInformationArgs,
    chainId: userConnectedChain?.id ?? 80001,
  })
  const listingInfo = listingInfoData as ListingInfo | undefined
  const sellerConnected = listingInfo && listingInfo[0] === address

  console.log('listing info')
  console.log(listingInfo)

  const buyArgs = [
    chainToHyperlaneId.get(listingChain as Chain),
    chainToContractAddress.get(listingChain as Chain),
    contract,
    tokenId,
    listingInfo && listingInfo[0],
    '2',
  ]

  const { config } = usePrepareContractWrite({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI.abi,
    functionName: 'buy',
    args: buyArgs,
    chainId: userConnectedChain?.id ?? 80001,
    enabled: listingInfo != null,
    overrides: { value: parseEther('1') },
  })

  console.log('buy config')
  console.log(config)

  const {
    data: result,
    isLoading,
    isSuccess,
    writeAsync,
  } = useContractWrite(config)

  console.log('Write function')
  console.log(writeAsync)

  const buyNFT = async () => {
    if (!writeAsync) {
      throw new Error('Write not ready, button should be disabled')
    }

    setTransactionState(TransactionState.pending)
    const txnRes = await writeAsync()
    console.log(`Txn hash: ${txnRes.hash}`)
    console.log('waiting')

    const txn = await txnRes.wait()
    console.log('Done')
    console.log(txn)
    setTransactionState(TransactionState.complete)
  }
  const modalInterior = (transactionState: TransactionState) => {
    switch (transactionState) {
      case TransactionState.notStarted:
        return (
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={buyNFT}>
              Buy NFT
            </Button>
            <Button onClick={onClose}>Back</Button>
          </ModalFooter>
        )
      case TransactionState.pending:
        return (
          <Flex
            alignItems="center"
            flexDir="column"
            marginBottom={10}
            marginTop={10}
          >
            <Spinner marginBottom={5} />
            <Link
              fontSize="md"
              href="https://etherscan.io/tx/0x077b71c0517104c8a47fd6eb3415c436a472bfe77322dcd6c0de561b358317f9"
            >
              View the transaction
            </Link>
          </Flex>
        )
      case TransactionState.complete:
        return (
          <Flex
            alignItems="center"
            flexDir="column"
            marginBottom={10}
            marginTop={10}
          >
            <Text marginBottom={5}>Yay everything worked</Text>
            <Link
              fontSize="md"
              href="https://etherscan.io/tx/0x077b71c0517104c8a47fd6eb3415c436a472bfe77322dcd6c0de561b358317f9"
            >
              View the transaction
            </Link>
          </Flex>
        )
      case TransactionState.failed:
        return <Text>Oh no</Text>
    }
  }

  const nftData = (nft: Nft | null, isLoading: boolean) => {
    if (isLoading) {
      return <Spinner />
    }

    if (nft == null || isErrorFetchingMetadata) {
      return (
        <Text fontSize="lg">
          Something went wrong while fetching nft metadata
        </Text>
      )
    }

    return (
      <Box>
        <Img
          src={image}
          alt={nft?.title}
          boxSize="lg"
          borderRadius="xl"
          mx="auto"
          marginBottom={5}
          objectFit="cover"
        />
        <div>
          <Flex flexDirection="column">
            <Text fontSize="xs">Contract Address:</Text>
            <Text fontSize="xl">{`${contract}`}</Text>
          </Flex>
        </div>

        <div>
          <Flex flexDirection="column">
            <Text fontSize="xs">TokenId:</Text>
            <Text fontSize="xl">{`${tokenId}`}</Text>
          </Flex>
        </div>
      </Box>
    )
  }

  const listingData = (
    listingInfo: ListingInfo | undefined,
    isLoading: boolean
  ) => {
    if (isLoading) {
      return <Spinner />
    }

    if (listingInfo == null || isErrorListingInfo) {
      return (
        <Text fontSize="lg">
          Something went wrong while fetching listing Info
        </Text>
      )
    }

    return (
      <Box>
        {isLoadingMetadata ? (
          <Spinner />
        ) : (
          <>
            <Heading marginBottom={5}>{nft?.title}</Heading>
            <Text fontSize="lg">{nft?.description}</Text>
            <Box marginTop={10}>
              <div>
                <Flex>
                  <Image
                    mb={4}
                    ml={5}
                    pr={5}
                    src="/wallet-icon.svg"
                    fallbackSrc="/wallet-icon.svg"
                    borderRadius="full"
                  />
                  <Flex flexDirection="column">
                    <Text fontSize="xs">Owner:</Text>
                    <Text
                      fontSize="xl"
                      as="b"
                      maxWidth="350px"
                      noOfLines={1}
                      textTransform="uppercase"
                    >{`${address}`}</Text>
                  </Flex>
                </Flex>
              </div>
              <div>
                <Flex>
                  <Image
                    mb={4}
                    ml={5}
                    pr={5}
                    src="/chain-icon.svg"
                    fallbackSrc="/chain-icon.svg"
                  />
                  <Flex flexDirection="column">
                    <Text fontSize="xs">Chain:</Text>
                    <Text fontSize="xl" as="b">
                      {listingChain}
                    </Text>
                  </Flex>
                </Flex>
              </div>
              <div>
                <Flex>
                  <Image
                    mb={4}
                    ml={5}
                    pr={5}
                    src="/price-icon.svg"
                    fallbackSrc="/price-icon.svg"
                    borderRadius="full"
                  />
                  <Flex flexDirection="column">
                    <Text fontSize="xs">Price:</Text>
                    <Text fontSize="xl" as="b">
                      {formatEther(listingInfo[1])}
                    </Text>
                  </Flex>
                </Flex>
              </div>
            </Box>
            <Box>
              <Button
                onClick={onOpen}
                disabled={writeAsync == null || userConnectedChain == null}
              >
                {userConnectedChain
                  ? `Buy on ${userConnectedChain.name}`
                  : 'connect your wallet to buy this'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    )
  }

  return (
    <Layout>
      <Button onClick={toggleColorMode} size={'sm'} variant="link">
        {colorMode === 'light' ? <Text> </Text> : <Text> </Text>}
      </Button>

      <Grid
        h="500px"
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem
          colSpan={1}
          bg="#170D27"
          borderRadius="xl"
          borderColor="#ffffff"
          border="5px"
          p="10"
        >
          {nftData(nft, isLoadingMetadata)}
        </GridItem>
        <GridItem
          colSpan={1}
          bg="#170D27"
          borderRadius="xl"
          borderColor="#ffffff"
          border="5px"
          p="10"
        >
          {listingData(listingInfo, isLoadingListingInfo)}
        </GridItem>
      </Grid>

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Summary</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>Insightful Transaction Summary</ModalBody>
          {modalInterior(transactionState)};
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export default NftIndex

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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
import {
  formatEther,
  formatUnits,
  getAddress,
  parseEther,
} from 'ethers/lib/utils'
import { BigNumber, ethers } from 'ethers'
import * as PushAPI from '@pushprotocol/restapi'
import { TransactionReceipt } from '@ethersproject/providers'

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

const chainIdToCurrencyId = new Map<string, string>([
  ['80001', '2'],
  ['5', '1'],
])

enum TransactionState {
  pending = 'pending',
  failed = 'failed',
  complete = 'complete',
  notStarted = 'notStarted',
}

// sellerAddress, price, currencyId
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
  const [txnReceipt, setTxnReceipt] = useState<null | TransactionReceipt>(null)
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

  // GET LISTING INFORMATION

  const {
    data: listingInfoData,
    isError: isErrorListingInfo,
    isLoading: isLoadingListingInfo,
  } = useContractRead({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI.abi,
    functionName: 'getListInformation',
    args: getListInformationArgs,
    chainId: userConnectedChain?.id,
  })
  const listingInfo = listingInfoData as ListingInfo | undefined
  const sellerConnected = listingInfo && listingInfo[0] === address
  const ownerConnected =
    nftOwner != null &&
    address != null &&
    getAddress(nftOwner) === getAddress(address)

  // BUY

  console.log('listing info')
  console.log(listingInfo)

  const nftSourceDomainId = chainToHyperlaneId.get(listingChain as Chain)
  const nftSourceContractAddress = chainToContractAddress.get(
    listingChain as Chain
  )
  const sellerAddress = listingInfo && listingInfo[0]
  const buyerCurrencyId =
    userConnectedChain &&
    chainIdToCurrencyId.get(userConnectedChain.id.toString() as string)
  const buyArgs = [
    nftSourceDomainId,
    nftSourceContractAddress,
    contract,
    tokenId,
    sellerAddress,
    buyerCurrencyId,
  ]
  const { config: buyConfig } = usePrepareContractWrite({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI.abi,
    functionName: 'buy',
    args: buyArgs,
    chainId: userConnectedChain?.id ?? 80001,
    enabled: listingInfo != null,
    overrides: { value: parseEther('0.5') },
  })
  console.log('buy config')
  console.log(buyConfig)
  const {
    data: buyResult,
    writeAsync: buy,
    error: buyError,
  } = useContractWrite(buyConfig)
  console.log('Buy Error')
  console.log(buyError)
  console.log('Buy Result')
  console.log(buyResult)
  console.log('Buy function')
  console.log(buy)

  // SELL

  console.log(`Owner connected: ${ownerConnected}`)
  console.log(`Seller connected: ${sellerConnected}`)

  const currencyId = listingChain === Chain.ethereum ? '1' : '2'
  const chainId = listingChain === Chain.ethereum ? '80001' : '5'
  const contractToMessage = chainToContractAddress.get(Chain.polygon)
  const sellArgs = [
    contract,
    tokenId,
    formatUnits(parseEther('0.0001'), 'wei'),
    currencyId,
    chainId,
    contractToMessage,
  ]
  const { config: sellConfig } = usePrepareContractWrite({
    addressOrName: chainToContractAddress.get(listingChain as Chain) as string,
    contractInterface: marketABI.abi,
    functionName: 'list',
    args: sellArgs,
    chainId: 5,
    enabled: ownerConnected,
  })
  console.log('sell config')
  console.log(sellConfig)
  const {
    data: sellResult,
    writeAsync: sell,
    error: sellError,
  } = useContractWrite(sellConfig)
  console.log('Sell Error')
  console.log(sellError)
  console.log('Sell Result')
  console.log(sellResult)
  console.log('Sell function')
  console.log(sell)

  // Higher level functions

  // TODO DRY sell and buy XD

  const buyNFT = async () => {
    if (!buy) {
      throw new Error('buy not ready, button should be disabled')
    }

    setTransactionState(TransactionState.pending)
    const txnRes = await buy()
    console.log(`Txn hash: ${txnRes.hash}`)
    console.log('waiting')

    const txn = await txnRes.wait()
    console.log('Done')
    console.log(txn)
    setTxnReceipt(txn)
    setTransactionState(TransactionState.complete)
  }

  const sellNFT = async () => {
    if (!sell) {
      throw new Error('Sell not ready, button should be disabled')
    }

    setTransactionState(TransactionState.pending)
    const txnRes = await sell()
    console.log(`Txn hash: ${txnRes.hash}`)
    console.log('waiting')

    const txn = await txnRes.wait()
    console.log('Done')
    console.log(txn)
    setTxnReceipt(txn)
    setTransactionState(TransactionState.complete)
  }

  const push = async () => {
    if (!address) return
    const PK =
      '75b2c1b5eb14c0a2178e06d065f804d5cb62834b4afa34328ff274ab38d755a7' // channel private key
    const Pkey = `0x${PK}`
    const signer = new ethers.Wallet(Pkey)
    try {
      const apiResponse = await PushAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `Your NFT was sold`,
          body: `{NFT_NAME was sold for {} ETH on {} network`,
        },
        payload: {
          title: `Your NFT was sold`,
          body: `{NFT_NAME was sold for {} ETH on {} network`,
          cta: '',
          img: '',
        },
        recipients: `eip155:5:${address}`, // recipient address
        channel: 'eip155:5:0xB9dBFEF2751682519EFAC269baD93fD62C4ac455', // your channel address
        env: 'staging',
      })

      // apiResponse?.status === 204, if sent successfully!
      console.log('API repsonse: ', apiResponse)
    } catch (err) {
      console.error('Error: ', err)
    }
  }

  // UI Segments

  const currentContractWrite = ownerConnected ? sellNFT : buyNFT
  const modalInterior = (transactionState: TransactionState) => {
    const explorerUrl = `${userConnectedChain?.blockExplorers?.default.url}/tx/${txnReceipt?.transactionHash}`

    switch (transactionState) {
      case TransactionState.notStarted:
        return (
          <ModalFooter display="flex" justifyContent="center">
            <Button
              background="#FF6600"
              mr={3}
              border="2px solid #FF6600"
              padding="25px 40px"
              color="#fff"
              borderRadius="120px"
              fontSize="20px"
              onClick={currentContractWrite}
              _hover={{
                background: '#ff660099',
                transition: '0.5s',
                transform: 'scale(1.05)',
                color: '#fff',
              }}
            >
              {ownerConnected ? 'Sell NFT' : 'Buy NFT'}
            </Button>

            <Button
              border="2px solid #ccc"
              borderRadius="120px"
              padding="25px 30px"
              onClick={onClose}
            >
              Back
            </Button>
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
            <Link fontSize="md" href={explorerUrl}>
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
            <Text color="ffffff" marginBottom={5}>
              Yay everything worked
            </Text>
            <Link fontSize="md" href={explorerUrl}>
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
        <Text color="#ffffff" fontSize="lg">
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
            <Text color="#ffffff" fontSize="xs">
              Contract Address:
            </Text>
            <Text color="#ffffff" fontSize="xl" as="b">{`${contract}`}</Text>
          </Flex>
        </div>

        <div>
          <Flex flexDirection="column">
            <Text color="#ffffff" mt="3" fontSize="xs">
              TokenId:
            </Text>
            <Text color="#ffffff" fontSize="xl" as="b">{`${tokenId}`}</Text>
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

    if (!listedWithUs) {
      return (
        <>
          <Text color="#ffffff" fontSize="lg">
            not listed with us!
          </Text>
          {ownerConnected ? (
            <Button onClick={onOpen} disabled={false}>
              {!userConnectedChain
                ? 'connect your wallet to list your NFT'
                : `Sell on ${listingChain}`}
            </Button>
          ) : null}
        </>
      )
    }

    if (listingInfo == null || isErrorListingInfo) {
      return (
        <Text color="#ffffff" fontSize="lg">
          There was a problem loading in listing data
        </Text>
      )
    }

    return (
      <Box>
        {isLoadingMetadata ? (
          <Spinner />
        ) : (
          <>
            <Heading color="#ffffff" marginBottom={5}>
              {nft?.title}
            </Heading>
            <Text color="#ffffff" fontSize="lg">
              {nft?.description}
            </Text>
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
                    <Text color="#ffffff" fontSize="xs">
                      Owner:
                    </Text>
                    <Text
                      fontSize="xl"
                      as="b"
                      maxWidth="350px"
                      color="#ffffff"
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
                    <Text color="#ffffff" fontSize="xs">
                      Chain:
                    </Text>
                    <Text fontSize="xl" as="b" color="#ffffff">
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
                    <Text color="#ffffff" fontSize="xs">
                      Price:
                    </Text>
                    <Text color="#ffffff" fontSize="xl" as="b">
                      {formatEther(listingInfo[1])}
                    </Text>
                  </Flex>
                </Flex>
              </div>
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              padding="40px"
              background="linear-gradient(180deg, #27183F 0%, #170D27 100%);"
            >
              <Button
                onClick={onOpen}
                disabled={false}
                background="#FF6600"
                border="2px solid #FF6600"
                padding="25px 20px"
                color="#fff"
                borderRadius="120px"
                fontSize="20px"
                _hover={{
                  background: '#ff660099',
                  transition: '0.5s',
                  transform: 'scale(1.05)',
                  color: '#fff',
                }}
              >
                {!userConnectedChain
                  ? 'connect your wallet to buy this'
                  : ownerConnected
                  ? `Sell on ${listingChain}`
                  : `Buy on ${userConnectedChain.name}`}
              </Button>
            </Box>
          </>
        )}
      </Box>
    )
  }

  // Component

  return (
    <Layout>
      <Grid
        h="500px"
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem
          colSpan={1}
          bg="linear-gradient(180deg, #27183F 0%, #170D27 100%);"
          borderRadius="xl"
          borderColor="#ffffff"
          border="5px"
          p="10"
        >
          {nftData(nft, isLoadingMetadata)}
        </GridItem>
        <GridItem
          colSpan={1}
          bg="linear-gradient(180deg, #27183F 0%, #170D27 100%);"
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
        <ModalContent h="700px" maxW="850px">
          <ModalHeader mx="auto">
            <Text fontSize="34px">Transaction Summary</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex justifyContent="space-between">
              <Stat mr="5">
                <StatLabel fontSize="lg" mb="2">
                  You Are Paying
                </StatLabel>
                <Box
                  p="5"
                  border="1px"
                  display="flex"
                  borderRadius="xl"
                  flexDirection="column"
                  justifyContent="center"
                  background="linear-gradient(180deg, #27183F 0%, #170D27 100%)"
                  minHeight="400px"
                  borderColor="#ccc"
                >
                  <div>
                    <Flex>
                      <Image
                        mb={10}
                        ml={5}
                        pr={5}
                        src="/price-icon.svg"
                        fallbackSrc="/price-icon.svg"
                      />
                      <Flex flexDirection="column">
                        <Text fontSize="xs" color="#fff">
                          Price:
                        </Text>
                        <Text fontSize="xl" as="b" color="#fff">
                          <StatNumber>{`${
                            listingInfo && formatEther(listingInfo[1])
                          } ${
                            userConnectedChain?.nativeCurrency?.name
                          }`}</StatNumber>
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
                        src="/chain-icon.svg"
                        fallbackSrc="/chain-icon.svg"
                      />
                      <Flex flexDirection="column">
                        <Text fontSize="xs" color="#fff">
                          Chain:
                        </Text>
                        <Text fontSize="xl" as="b" color="#fff">
                          {userConnectedChain?.name}
                        </Text>
                      </Flex>
                    </Flex>
                  </div>
                </Box>
              </Stat>
              <Stat ml="5">
                <StatLabel fontSize="lg" mb="2">
                  You Are Recieving
                </StatLabel>
                <Box
                  p="5"
                  border="1px"
                  borderColor="#ccc"
                  minHeight="400px"
                  background="linear-gradient(180deg, #27183F 0%, #170D27 100%)"
                  borderRadius="xl"
                >
                  <Img
                    display="block"
                    mx="auto"
                    boxSize="xs"
                    width="200px"
                    height="100%"
                    src={image}
                  />
                  <StatNumber
                    display="flex"
                    color="#fff"
                    justifyContent="center"
                    mt="2"
                    fontSize="xl"
                    mb="5"
                  >
                    {nft?.title}
                  </StatNumber>

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
                        <Text color="#fff" fontSize="xs">
                          Chain:
                        </Text>
                        <Text color="#fff" fontSize="xl" as="b">
                          {listingChain}
                        </Text>
                      </Flex>
                    </Flex>
                  </div>
                </Box>
              </Stat>
            </Flex>
          </ModalBody>
          {modalInterior(transactionState)};
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export default NftIndex

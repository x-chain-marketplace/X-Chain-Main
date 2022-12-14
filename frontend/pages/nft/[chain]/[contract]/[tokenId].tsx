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
  Input,
  InputGroup,
  InputLeftElement,
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
  Text,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '../../../../components/layout/Layout'
import { Nft } from 'alchemy-sdk'
import axios from 'axios'
import { useAccount, useContractRead, useNetwork, Chain } from 'wagmi'
import marketABI from '../../../../artifacts/contracts/Market.sol/Market.json'
import {
  ListingInfo,
  SupportedChains,
  TransactionState,
} from '../../../../types'
import { formatEther, getAddress } from 'ethers/lib/utils'
import {
  chainToContractAddress,
  chainToHyperlaneId,
  goerliContractAddress,
  mumbaiContractAddress,
  supportedChainToWagmiChain,
} from '../../../../utils'
import useMarketContract from '../../../../hooks/useMarketContract'

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain: listingChain, contract, tokenId } = router.query

  const { address } = useAccount()
  const { chain: userConnectedChain } = useNetwork()
  const [nft, setNft] = useState<Nft | null>(null)
  const [nftOwner, setNftOwner] = useState<string | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)
  const [isErrorFetchingMetadata, setIsErrorFetchingMetadata] = useState(false)
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
    chainToHyperlaneId.get(listingChain as SupportedChains) as string,
    contract,
    tokenId,
  ]

  // GET LISTING INFORMATION

  const {
    data: listingInfoData,
    isError: isErrorListingInfo,
    isLoading: isLoadingListingInfo,
  } = useContractRead({
    addressOrName: chainToContractAddress.get(
      SupportedChains.polygon
    ) as string,
    contractInterface: marketABI.abi,
    functionName: 'getListInformation',
    args: getListInformationArgs,
    chainId: 80001, // userConnectedChain?.id hardcoding this for now
  })
  const listingInfo = listingInfoData as ListingInfo | undefined
  const sellerConnected = listingInfo && listingInfo[0] === address
  const ownerConnected =
    nftOwner != null &&
    address != null &&
    getAddress(nftOwner) === getAddress(address)

  console.log('Owner connected')
  console.log(nftOwner)
  console.log(address)
  console.log(ownerConnected)

  const { txnReceipt, txnState, txnHash, buyNFT, sellNFT } = useMarketContract(
    listingInfo,
    listingChain as SupportedChains,
    contract as string,
    tokenId as string,
    ownerConnected,
    sellerConnected as boolean,
    userConnectedChain as Chain
  )

  // UI Segments
  const currentContractWrite = ownerConnected
    ? async () => {
        await sellNFT()
        const params = new URLSearchParams({
          message: 'Asset listed for sale!',
        })
        await new Promise((resolve) => setInterval(resolve, 2000))
        router.push(`/done?${params.toString()}`)
      }
    : async () => {
        await buyNFT()
        const params = new URLSearchParams({
          message: 'Purchase Successful',
          assetLink: 'mock this',
        })
        await new Promise((resolve) => setInterval(resolve, 2000))
        router.push(`/done?${params.toString()}`)
      }

  const modalInterior = (txnState: TransactionState) => {
    const explorerUrl = `${userConnectedChain?.blockExplorers?.default.url}/tx/${txnHash}`

    switch (txnState) {
      case TransactionState.notStarted:
        return (
          <ModalFooter display="flex" justifyContent="center">
            <Button
              background="#FF6600"
              mr={3}
              border="2px solid #FF6600"
              padding="25px 70px"
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
              fontSize="20px"
              borderRadius="120px"
              padding="25px 30px"
              onClick={onClose}
              color="#000"
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
            <Spinner color="#000" width="80px" height="80px" marginBottom={5} />
            <Link fontSize="md" color="#c0c0c0" href={explorerUrl}>
              View the Transaction
            </Link>
          </Flex>
        )
      case TransactionState.complete:
        return (
          <Flex
            alignItems="center"
            flexDir="column"
            marginBottom={10}
            marginTop={5}
          >
            <Text fontSize="32px" color="#000" marginBottom={5}>
              Yay Everything Worked!
            </Text>
            <Link fontSize="md" href={explorerUrl}>
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
                View the transaction
              </Button>
            </Link>
          </Flex>
        )
      case TransactionState.failed:
        return <Text>Oh no</Text>
    }
  }

  const nftData = (nft: Nft | null, isLoading: boolean) => {
    if (isLoading) {
      return (
        <Spinner
          marginTop="20px"
          width="100px"
          height="100px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          mx="auto"
        />
      )
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
      return (
        <Spinner
          marginTop="20px"
          width="100px"
          height="100px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          mx="auto"
        />
      )
    }

    if (!listedWithUs) {
      return (
        <>
          <Image
            display="block"
            mx="auto"
            mt="20"
            mb="5"
            src="/caution.svg"
            fallbackSrc="/caution.svg"
          />
          <Text
            color="#ffffff"
            as="b"
            display="flex"
            justifyContent="center"
            fontSize="lg"
          >
            This Asset is Not Listed with Us!
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
          <Spinner
            marginTop="20px"
            width="100px"
            height="100px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            mx="auto"
          />
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
                      {
                        supportedChainToWagmiChain.get(
                          listingChain as SupportedChains
                        )?.name
                      }
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
                  ? `Sell ${listingChain} NFT`
                  : `Buy with funds from ${userConnectedChain.name}`}
              </Button>
            </Box>


{/* THIS IS FOR THE SELL PRICE BOX */}
            <Box
              display="flex"
              justifyContent="center"
              flexDirection="column"
              padding="40px"
              background="linear-gradient(180deg, #27183F 0%, #170D27 100%);"
            >
              <Text
                fontSize="xl"
                color="#fff"
                as="b"
                display="flex"
                justifyContent="center"
              >
                Set Sell Price
              </Text>

              <InputGroup mt="15px" mb="10px">
                <Input
                  type="text"
                  placeholder="0.0 ETH"
                  background="#fff"
                  textAlign="center"
                  fontSize="20px"
                  fontWeight="700"
                  color="#000"
                  _placeholder={{
                    color: '#000',
                    fontSize: '20px',
                    fontWeight: '700',
                  }}
                />
              </InputGroup>
              <Button
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
                  ? `Sell ${listingChain} NFT`
                  : `Buy with funds from ${userConnectedChain.name}`}
              </Button>
            </Box>

            {/* THIS ENDS THE SELL PRICE BOX */}

          </>
        )}
      </Box>
    )
  }

  // Component
  const currencyActionPreview = (
    action: string,
    chain: string,
    currencyName: string,
    price: string
  ) => (
    <Stat mr="5">
      <StatLabel fontSize="lg" mb="2">
        {action}
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
                <StatNumber>{`${price} ${currencyName}`}</StatNumber>
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
                {chain}
              </Text>
            </Flex>
          </Flex>
        </div>
      </Box>
    </Stat>
  )

  const nftActionPreview = (
    action: string,
    image: string,
    nftName: string,
    chain: string
  ) => (
    <Stat ml="5">
      <StatLabel fontSize="lg" mb="2">
        {action}
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
          {nftName}
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
                {chain}
              </Text>
            </Flex>
          </Flex>
        </div>
      </Box>
    </Stat>
  )

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
        <ModalContent
          h="750px"
          maxW="850px"
          borderRadius="xl"
          background="#fff"
        >
          <ModalHeader mx="auto">
            <Text color="#000" fontSize="34px">
              Transaction Summary
            </Text>
          </ModalHeader>
          <ModalCloseButton color="#000" />
          <ModalBody pb={6}>
            <Flex color="#000" justifyContent="space-between">
              {ownerConnected
                ? nftActionPreview(
                    'You are Listing',
                    image as string,
                    nft?.title as string,
                    supportedChainToWagmiChain.get(
                      listingChain as SupportedChains
                    )?.name as string
                  )
                : currencyActionPreview(
                    'You Are Paying:',
                    userConnectedChain?.name as string,
                    userConnectedChain?.nativeCurrency?.name as string,
                    (listingInfo && formatEther(listingInfo[1])) as string
                  )}
              {ownerConnected
                ? currencyActionPreview(
                    'You will receive upon sale',
                    userConnectedChain?.name as string,
                    userConnectedChain?.nativeCurrency?.name as string,
                    (listingInfo && formatEther(listingInfo[1])) as string
                  )
                : nftActionPreview(
                    'You Are Recieving:',
                    image as string,
                    nft?.title as string,
                    supportedChainToWagmiChain.get(
                      listingChain as SupportedChains
                    )?.name as string
                  )}
            </Flex>
          </ModalBody>
          {modalInterior(txnState)};
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export default NftIndex

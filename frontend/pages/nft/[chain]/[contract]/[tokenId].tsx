import {
  Box,
  Button,
  Heading,
  Img,
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
  Flex,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '../../../../components/layout/Layout'
import { Nft } from 'alchemy-sdk'
import axios from 'axios'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import marketABI from '../../../../artifacts/contracts/Market.sol/Market.json'
import { Chain } from '../../../../types'
import { formatEther, getAddress } from 'ethers/lib/utils'
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

  console.log(getListInformationArgs)

  const {
    data: listingInfoData,
    isError: isErrorListingInfo,
    isLoading: isLoadingListingInfo,
  } = useContractRead({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI as any,
    functionName: 'getListInformation',
    args: getListInformationArgs,
    chainId: userConnectedChain?.id ?? 80001,
  })
  const listingInfo = listingInfoData as ListingInfo | undefined
  const sellerConnected = listingInfo && listingInfo[0] === address

  const buyNFT = async () => {
    setTransactionState(TransactionState.pending)
    await new Promise((resolve) => {
      setTimeout(resolve, 10 * 1000)
    })
    setTransactionState(TransactionState.complete)
  }
  const modalInterior = (transactionState: TransactionState) => {
    switch (transactionState) {
      case TransactionState.notStarted:
        return (
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={buyNFT}>
              {userConnectedChain
                ? `Buy NFT on ${userConnectedChain.name}`
                : `Connect wallet to buy NFT`}
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
      <>
        <Heading marginBottom={5}>{nft?.title}</Heading>
        <Text fontSize="lg" marginBottom={2}>
          {nft?.description}
        </Text>
        <Text fontSize="md">
          {listedWithUs ? 'Listed on name placholder' : `Owned by ${nftOwner}`}
        </Text>
        <Img
          src={image}
          alt={nft?.title}
          boxSize="sm"
          marginBottom={10}
          marginTop={10}
        />
        <Button onClick={onOpen}>Buy NFT</Button>
      </>
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
      <>
        <Text fontSize="md">{`seller: ${listingInfo[0]}`}</Text>
        <Text fontSize="md">{`price: ${formatEther(listingInfo[1])}`}</Text>
        <Text fontSize="md">{`currencyId: ${listingInfo[2]}`}</Text>
      </>
    )
  }

  return (
    <Layout>
      <Box>
        {nftData(nft, isLoadingMetadata)}
        {listingData(listingInfo, isLoadingListingInfo)}
        <Box marginTop={10}>
          <div>{`current wallet address: ${address}`}</div>
          <div>{`listing chain: ${listingChain}`}</div>
          <div>{`contract address: ${contract}`}</div>
          <div>{`tokenId: ${tokenId}`}</div>
          <div>{`NFT seller currenctly connected: ${sellerConnected}`}</div>
        </Box>
      </Box>
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

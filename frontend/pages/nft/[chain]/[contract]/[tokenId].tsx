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
import { useAccount, useContractRead } from 'wagmi'
import marketABI from '../../../../artifacts/contracts/Market.sol/Market.json'
import { Chain } from '../../../../types'

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

const NftIndex: NextPage = () => {
  const router = useRouter()
  const { chain, contract, tokenId } = router.query

  const { address } = useAccount()
  const [nft, setNft] = useState<Nft | null>(null)
  const [nftOwner, setNftOwner] = useState<string | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)
  const [transactionState, setTransactionState] = useState<TransactionState>(
    TransactionState.notStarted
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const listedWithUs =
    nftOwner != null &&
    [mumbaiContractAddress, goerliContractAddress].includes(nftOwner)

  useEffect(() => {
    const grabMetadata = async () => {
      setIsLoadingMetadata(true)
      const url = `/api/nft/${chain}/${contract}/${tokenId}`
      const res = await axios.get(url)
      const { nft, owner } = res.data as { nft: Nft; owner: string }
      setNftOwner(owner)
      setNft(nft)
      setIsLoadingMetadata(false)
    }

    if (chain && contract && tokenId) {
      grabMetadata()
    }
  }, [chain, contract, tokenId])

  // TODO make sure this exists go to backup otherwise
  const image = nft?.media[0].gateway

  const getListInformationArgs = [
    chainToHyperlaneId.get(chain as Chain) as string,
    contract,
    tokenId,
  ]

  console.log(getListInformationArgs)

  const {
    data: listInfo,
    isError: islistInfoError,
    isLoading: isLoadingListInfo,
  } = useContractRead({
    addressOrName: chainToContractAddress.get(Chain.polygon) as string,
    contractInterface: marketABI as any,
    functionName: 'getListInformation',
    args: getListInformationArgs,
    chainId: 80001,
  })

  console.log(`listInfo: ${isLoadingListInfo}`)
  console.log(`listInfo: ${listInfo}`)

  const modalInterior = (transactionState: TransactionState) => {
    switch (transactionState) {
      case TransactionState.notStarted:
        return (
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={async () => {
                setTransactionState(TransactionState.pending)
                await new Promise((resolve) => {
                  setTimeout(resolve, 10 * 1000)
                })
                setTransactionState(TransactionState.complete)
              }}
            >
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

  return (
    <Layout>
      <Box>
        {isLoadingMetadata ? (
          <Spinner />
        ) : (
          <>
            <Heading marginBottom={5}>{nft?.title}</Heading>
            <Text fontSize="lg" marginBottom={2}>
              {nft?.description}
            </Text>
            <Text fontSize="md">
              {listedWithUs
                ? 'Listed on name placholder'
                : `Owned by ${nftOwner}`}
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
        )}
        {listInfo ? (
          <Text fontSize="md">{JSON.stringify(listInfo)}</Text>
        ) : (
          <Spinner />
        )}
        <Box marginTop={10}>
          <div>{`current wallet address: ${address}`}</div>
          <div>{`chain: ${chain}`}</div>
          <div>{`contract address: ${contract}`}</div>
          <div>{`tokenId: ${tokenId}`}</div>
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

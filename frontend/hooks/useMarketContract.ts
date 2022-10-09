import { useState } from 'react'
import { SupportedChains, TransactionState } from '../types'
import {
  chainIdToCurrencyId,
  chainToContractAddress,
  chainToHyperlaneId,
} from '../utils'
import marketABI from '../artifacts/contracts/Market.sol/Market.json'
import { Chain, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { formatUnits, parseEther } from 'ethers/lib/utils'
import { TransactionReceipt } from '@ethersproject/providers'

export default function useMarketContract(
  listingInfo: any,
  listingChain: SupportedChains,
  contractAddress: string,
  tokenId: string,
  ownerConnected: boolean,
  sellerConnected: boolean,
  userConnectedChain: Chain
) {
  const [txnState, setTxnState] = useState<TransactionState>(
    TransactionState.notStarted
  )
  const [txnHash, setTxnHash] = useState<null | string>(null)
  const [txnReceipt, setTxnReceipt] = useState<null | TransactionReceipt>(null)

  console.log('listing info')
  console.log(listingInfo)

  const nftSourceDomainId = chainToHyperlaneId.get(listingChain)
  const nftSourceContractAddress = chainToContractAddress.get(
    listingChain as SupportedChains
  )
  const sellerAddress = listingInfo && listingInfo[0]
  const buyerCurrencyId =
    userConnectedChain &&
    chainIdToCurrencyId.get(userConnectedChain.id.toString() as string)
  const buyArgs = [
    nftSourceDomainId,
    nftSourceContractAddress,
    contractAddress,
    tokenId,
    sellerAddress,
    buyerCurrencyId,
  ]
  const { config: buyConfig } = usePrepareContractWrite({
    addressOrName: chainToContractAddress.get(
      SupportedChains.polygon
    ) as string,
    contractInterface: marketABI.abi,
    functionName: 'buy',
    args: buyArgs,
    chainId: userConnectedChain?.id ?? 80001,
    enabled: listingInfo != null,
    overrides: { value: parseEther('0.2') },
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

  const currencyId = listingChain === SupportedChains.ethereum ? '1' : '2'
  const chainId = listingChain === SupportedChains.ethereum ? '80001' : '5'
  const contractToMessage = chainToContractAddress.get(SupportedChains.polygon)
  const sellArgs = [
    contractAddress,
    tokenId,
    formatUnits(parseEther('0.0001'), 'wei'),
    currencyId,
    chainId,
    contractToMessage,
  ]
  const { config: sellConfig } = usePrepareContractWrite({
    addressOrName: chainToContractAddress.get(
      listingChain as SupportedChains
    ) as string,
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

  const buyNFT = async () => {
    if (!buy) {
      throw new Error('buy not ready, button should be disabled')
    }

    setTxnState(TransactionState.pending)
    const txnRes = await buy()
    setTxnHash(txnRes.hash)
    console.log(`Txn hash: ${txnRes.hash}`)
    console.log('waiting')

    const txn = await txnRes.wait()
    console.log('Done')
    console.log(txn)
    setTxnReceipt(txn)
    setTxnState(TransactionState.complete)
  }

  const sellNFT = async () => {
    if (!sell) {
      throw new Error('Sell not ready, button should be disabled')
    }

    setTxnState(TransactionState.pending)
    const txnRes = await sell()
    setTxnHash(txnRes.hash)
    console.log(`Txn hash: ${txnRes.hash}`)
    console.log('waiting')

    const txn = await txnRes.wait()
    console.log('Done')
    console.log(txn)
    setTxnReceipt(txn)
    setTxnState(TransactionState.complete)
  }

  return { txnHash, txnReceipt, txnState, buyNFT, sellNFT }
}

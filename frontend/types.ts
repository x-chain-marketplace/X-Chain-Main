import { BigNumber } from 'ethers'

export enum SupportedChains {
  ethereum = 'ethereum',
  optimism = 'optimism',
  polygon = 'polygon',
}

export enum TransactionState {
  pending = 'pending',
  failed = 'failed',
  complete = 'complete',
  notStarted = 'notStarted',
}

// sellerAddress, price, currencyId
export type ListingInfo = [string, BigNumber, string]

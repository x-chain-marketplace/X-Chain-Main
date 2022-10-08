/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface MarketInterface extends utils.Interface {
  functions: {
    "buy(uint32,address,address,uint256,address)": FunctionFragment;
    "domainToContractAddress(uint32)": FunctionFragment;
    "getResisteredContract(uint32)": FunctionFragment;
    "handle(uint32,bytes32,bytes)": FunctionFragment;
    "list(address,uint256,uint256,uint32,address)": FunctionFragment;
    "listedPrice(bytes32)": FunctionFragment;
    "outbox()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setContract(uint32,address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "buy"
      | "domainToContractAddress"
      | "getResisteredContract"
      | "handle"
      | "list"
      | "listedPrice"
      | "outbox"
      | "owner"
      | "renounceOwnership"
      | "setContract"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "buy",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "domainToContractAddress",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getResisteredContract",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "handle",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "list",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "listedPrice",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "outbox", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setContract",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "buy", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "domainToContractAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getResisteredContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "handle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "list", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "listedPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "outbox", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "Bought(address,uint256,address,uint256)": EventFragment;
    "Listed(address,uint256,address,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Bought"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Listed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface BoughtEventObject {
  nftContractAddress: string;
  tokenId: BigNumber;
  seller: string;
  price: BigNumber;
}
export type BoughtEvent = TypedEvent<
  [string, BigNumber, string, BigNumber],
  BoughtEventObject
>;

export type BoughtEventFilter = TypedEventFilter<BoughtEvent>;

export interface ListedEventObject {
  nftContractAddress: string;
  tokenId: BigNumber;
  seller: string;
  price: BigNumber;
}
export type ListedEvent = TypedEvent<
  [string, BigNumber, string, BigNumber],
  ListedEventObject
>;

export type ListedEventFilter = TypedEventFilter<ListedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface Market extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MarketInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    buy(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      seller: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    domainToContractAddress(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getResisteredContract(
      domainId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    handle(
      _origin: PromiseOrValue<BigNumberish>,
      _sender: PromiseOrValue<BytesLike>,
      _messageBody: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    list(
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      price: PromiseOrValue<BigNumberish>,
      domainIdTo: PromiseOrValue<BigNumberish>,
      ourContractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    listedPrice(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    outbox(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setContract(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  buy(
    domainId: PromiseOrValue<BigNumberish>,
    contractAddress: PromiseOrValue<string>,
    nftContractAddress: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    seller: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  domainToContractAddress(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getResisteredContract(
    domainId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  handle(
    _origin: PromiseOrValue<BigNumberish>,
    _sender: PromiseOrValue<BytesLike>,
    _messageBody: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  list(
    nftContractAddress: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    price: PromiseOrValue<BigNumberish>,
    domainIdTo: PromiseOrValue<BigNumberish>,
    ourContractAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  listedPrice(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  outbox(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setContract(
    domainId: PromiseOrValue<BigNumberish>,
    contractAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    buy(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      seller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    domainToContractAddress(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getResisteredContract(
      domainId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    handle(
      _origin: PromiseOrValue<BigNumberish>,
      _sender: PromiseOrValue<BytesLike>,
      _messageBody: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    list(
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      price: PromiseOrValue<BigNumberish>,
      domainIdTo: PromiseOrValue<BigNumberish>,
      ourContractAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    listedPrice(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    outbox(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setContract(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Bought(address,uint256,address,uint256)"(
      nftContractAddress?: null,
      tokenId?: null,
      seller?: null,
      price?: null
    ): BoughtEventFilter;
    Bought(
      nftContractAddress?: null,
      tokenId?: null,
      seller?: null,
      price?: null
    ): BoughtEventFilter;

    "Listed(address,uint256,address,uint256)"(
      nftContractAddress?: null,
      tokenId?: null,
      seller?: null,
      price?: null
    ): ListedEventFilter;
    Listed(
      nftContractAddress?: null,
      tokenId?: null,
      seller?: null,
      price?: null
    ): ListedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    buy(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      seller: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    domainToContractAddress(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getResisteredContract(
      domainId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    handle(
      _origin: PromiseOrValue<BigNumberish>,
      _sender: PromiseOrValue<BytesLike>,
      _messageBody: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    list(
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      price: PromiseOrValue<BigNumberish>,
      domainIdTo: PromiseOrValue<BigNumberish>,
      ourContractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    listedPrice(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    outbox(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setContract(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    buy(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      seller: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    domainToContractAddress(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getResisteredContract(
      domainId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    handle(
      _origin: PromiseOrValue<BigNumberish>,
      _sender: PromiseOrValue<BytesLike>,
      _messageBody: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    list(
      nftContractAddress: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      price: PromiseOrValue<BigNumberish>,
      domainIdTo: PromiseOrValue<BigNumberish>,
      ourContractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    listedPrice(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    outbox(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setContract(
      domainId: PromiseOrValue<BigNumberish>,
      contractAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
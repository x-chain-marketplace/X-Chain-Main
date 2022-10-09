# ZipChain (X-Chain NFT Swap)

---

## Contract
### Mumbai
https://mumbai.polygonscan.com/address/0x12256d5D9429D15457F2bA8d303221136e0e9942

### Polygon
https://polygonscan.com/address/0xa2e541300cdf197C6e27e1Ad341b12eA283FA595#code

### Optimism
https://optimistic.etherscan.io/address/0xee064652655fa40e8e455a2004fd6c75a8e750eb

### MoonbaseAlpha


## Why we built
Numerous L1 and L2 blockchains have emerged, but there are still few solutions that support chain-to-chain interactions, and liquidity between chains is not significant. We believe that the cost (financial and labor) of the bridge is one of the main reasons for making this.
This time, we would like to solve this project by building this app.

Our application eliminates the process of buying NFT on other chains. Generally, you have to bridge your token and get native tokens on other chains, and after that, you need to switch chains and make another transaction to buy NFTs. If the token for buying NFTs is ERC20, you have to swap the native token for ERC20 additionally.

However, in ZipChain, you can buy NFT on other chains with only one transaction, no need to bridge, no need to swap. 

Our goal is to create a world where people can easily buy the NFT they want without worrying about chains.

## What is ZipChain
In this app, the users can buy NFTs from any chain, any tokens. For example, you can buy NFTs on Ethereum from Polygon transactions.

Firstly, the seller lists NFT on Ethereum, then the price information will be broadcasted to the other blockchains using cross-chain messaging protocols and stored. Buyers can get the listed price from the Polygon contract. When the buyer sends a token for a price to our contract, information about that transaction is sent to the Listed Chain (Ethereum this time) 

Confirmation 
Once the transaction is successfully told to the origin chain, the NFT will be sent to the buyer. Then, "confirmation" will be sent to the payment chain (Polygon). If NFT has already been sold, and the buyer can't get NFTs, "reverted" will be sent to the payment chain (Polygon)

Result
Contract on the payment chain (Polygon) gets "confirmation" the token will be sent to the seller, but if it gets "reverted", the token will be back to the buyer. This system prevents multiple payments from occurring on the same list.


## Transaction Flow
This is the transaction flow our application. At this time, the seller list NFT on Ethereum, and the buyer try to buy that NFT from Polygon Network using MATIC

<img width="751" alt="Screen Shot 2022-10-09 at 7 43 40" src="https://user-images.githubusercontent.com/64068653/194757490-2199824f-a366-4ae4-b92c-4d60d5fe94d1.png">

### Flow 1
- The sellers list their NFTs on Ethereum
- NFTs will be locked in our contract
- The price (ETH) will be sent to Polygon contract via Hyperlane

### Flow 2
- Buyers buy NFTs from Polygon transaction
- Buyer will send Matic to our contract
- Convert listed price (ETH * price) and sending price (Matic * msg.value) using Chainlink Data Feed.
- Check sending the price of USD is higher than the listed price of USD
- Currency will be sent to our contract.
- NFT information will be sent to Optimism contract using Hyperlane

### Flow 3
- Check if NFT is still on sale
- If yes, currency stored in our contract will be sent to the seller, and NFT will be transferred to the buyer
- If no, currency stored in our contract will be backed to the buyer

## How we built
Hyperlane , Chainlink, and Push are the core protocols of the smart contract of ZipChain

We use Hyperlane as a part of cross-chain messaging so that we can send any data from one blockchain to another blockchain and vice versa. 
Since Hyperlane supports sending plenty of types of data (uint, address, bytes……), it worked well with the cross-chain app because we had to send a lot of information, and it was easy to build a cross-chain application using the API they provided.

Chainlink solves the problem of differences in the price of Native tokens for each chain. This time, we supported native tokens of each chain, and we needed to maintain price consistency.
Chainlink provides an API that can fetch the price out of the blockchain so that we can get both ETH and MATIC prices and allow transactions in different tokens.

Push Protocol contributes significantly to improving UX. In the cross-chain application, there is a large time lag between when a user sends a transaction and when the results are reflected. By integrating Push Protocol, the users no more need to wait or search for the result of the transaction. Additionally, they provide not only frontend SDK but also a smart contract interface. It was a great match because some of the transactions in the cross-chain application do not go through the front end.


## Getting Started

It is recommended to use Yarn to avoid dependency collisions: [Yarn](https://classic.yarnpkg.com/en/docs/install)

```bash
git clone https://github.com/ChangoMan/nextjs-ethereum-starter.git
cd nextjs-ethereum-starter

yarn install

# Start up the Hardhat Network
yarn chain
```

Here we just install the npm project's dependencies, and by running `yarn chain` we spin up an instance of Hardhat Network that you can connect to using MetaMask. In a different terminal in the same directory, run:

```bash
yarn deploy
```

This will deploy the contract to Hardhat Network. After this completes run:

```bash
cd frontend
yarn install
```

This will install the frontend packages. We also need to set up the local configuration file.

```bash
cp .env.local.example .env.local
```

This will create a file called `.env.local`. Open up that file and fill in the `NEXTAUTH_SECRET=` environment variable.

```bash
yarn dev
```

This will start up the Next.js development server. Your site will be available at http://localhost:3000/

To interact with the local contract, be sure to switch your MetaMask Network to `Localhost 8545`

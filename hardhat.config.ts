import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import {
  accounts,
  infuraId,
  portalId,
  polygonscanApiKey,
} from "./lib/env";

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  paths: {
    artifacts: "./frontend/artifacts",
  },
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
    },
    ethereum: {
      chainId: 1,
      url: `https://eth-mainnet.gateway.pokt.network/v1/lb/${portalId}`,
      accounts,
    },
    goerli: {
      chainId: 5,
      url: `https://eth-goerli.gateway.pokt.network/v1/lb/${portalId}`,
      accounts,
    },
    optimisticEthereum: {
      chainId: 10,
      url: `https://optimism-mainnet.gateway.pokt.network/v1/lb/${portalId}`,
      accounts,
    },
    polygon: {
      chainId: 137,
      url: `https://poly-mainnet.gateway.pokt.network/v1/lb/${portalId}`,
      accounts,
    },
    moonbaseAlpha: {
      chainId: 1287,
      url: `https://rpc.api.moonbase.moonbeam.network`,
      accounts,
    },
    polygonMumbai: {
      chainId: 80001,
      url: `https://matic-mumbai.chainstacklabs.com`,
      accounts,
    },
  },
  typechain: {
    outDir: "./frontend/types/typechain",
  },
  etherscan: {
    apiKey: {
      goerli: "Z1TKKCFKK9GTVJ3FZP3IA4K8SINX16NCJ3",
      polygonMumbai: "GZ6K1PAJV7YH2G2CZNG7RKYSURKXB3PFTA",
      polygon: "GZ6K1PAJV7YH2G2CZNG7RKYSURKXB3PFTA",
      moonbaseAlpha: "J91J9C15UUQIZRVGQ6FYVBZW5219XEBYRE",
      optimisticEthereum: "62F9T62NRZXPYIMWSPE4Y6PYE4MKMMGXUZ",
    },
  },
};

export default config;

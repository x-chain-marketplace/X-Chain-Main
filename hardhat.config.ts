import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import {
  accounts,
  infuraId,
  ethersanApiKey,
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
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${infuraId}`,
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
    },
  },
};

export default config;

import * as dotenv from "dotenv";

dotenv.config();

export const accounts =
  process.env.DEPLOYER_PRIVATE_KEY !== undefined
    ? [process.env.DEPLOYER_PRIVATE_KEY]
    : [];
export const infuraId = process.env.INFURA_API_KEY || "";
export const ethersanApiKey = process.env.ETHERSCAN_API_KEY || "";
export const polygonscanApiKey = process.env.POLYGONSCAN_API_KEY || "";
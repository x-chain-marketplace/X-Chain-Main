// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import fs from 'fs';
import { config, ethers } from 'hardhat';

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // fs.unlinkSync(`${config.paths.artifacts}/contracts/contractAddress.ts`);

  // We get the contract to deploy
  const goerliOutboxAddress = "0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD";
  const mumbaiOutboxAddress = "0xe17c37212d785760E8331D4A4395B17b34Ba8cDF";
  const moonbaseOutboxAddress = "0x54148470292C24345fb828B003461a9444414517";

  const goerliDomain = "5";
  const mumbaiDomain = "80001";
  const moonbeamDomain = "0x6d6f2d61";

  const goerliPushCommContractAddress =
    "0xb3971bcef2d791bc4027bbfedfb47319a4aaaaaa";
  const mumbaiPushCommContractAddress =
    "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa";
  const zeroaddress = "0x0000000000000000000000000000000000000000";

  const goerliPushChannelAddress = "0x3584ba4C558A5ff7cb153a355d892Cd20D0A6206";
  const mumbaiPushChannelAddress = "";


  const MarketContract = await ethers.getContractFactory('Market');
  const market = await MarketContract.deploy(
    goerliOutboxAddress,
    goerliDomain,
    goerliPushCommContractAddress,
    goerliPushChannelAddress
  );
  await market.deployed();
  console.log("YourContract deployed to:", market.address);

  saveFrontendFiles(
    market.address,
    "Market"
  );
}

// https://github.com/nomiclabs/hardhat-hackathon-boilerplate/blob/master/scripts/deploy.js
function saveFrontendFiles(
  contractAddress: string,
  contractName: string
) {
  fs.writeFileSync(
    `${config.paths.artifacts}/contracts/contractAddress.ts`,
    `export const ${contractName} = '${contractAddress}'\n`
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

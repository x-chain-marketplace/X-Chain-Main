import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Market", () => {
    let signer: SignerWithAddress;
    let malicious: SignerWithAddress;
    beforeEach(async () => {
        [signer, malicious] = await ethers.getSigners();
        const MockConnextHandler = await ethers.getContractFactory(
          "MockConnextHandler"
        );
        const mockConnextHandler = await MockConnextHandler.deploy();
        
  })
});

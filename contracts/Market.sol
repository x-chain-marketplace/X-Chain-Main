// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IOutbox {
  function dispatch(
    uint32 _destinationDomain,
    bytes32 _recipientAddress,
    bytes calldata _messageBody
  ) external returns (uint256);
}

interface IMessageRecipient {
  function handle(
    uint32 _origin,
    bytes32 _sender,
    bytes calldata _messageBody
  ) external;
}

contract Market is IMessageRecipient, Ownable {
  constructor(address _outbox) {
    outbox = _outbox;
  }
  address public outbox;
  mapping(bytes32 => uint256) public listedPrice;
  mapping(uint32 => bytes32) public domainToContractAddress;

  event Listed(address nftContractAddress, uint256 tokenId, address seller, uint256 price);
  event Bought(address nftContractAddress, uint256 tokenId, address seller, uint256 price);

  modifier onlyResisterdContract(uint32 _origin, bytes32 _sender) {
    bool resistered = false;

    bytes32 resisteredAddress = domainToContractAddress[_origin];
    if (_sender == resisteredAddress) {
      resistered = true;
    }
    _;
  }

  function setContract(uint32 domainId, address contractAddress) public onlyOwner {
    domainToContractAddress[domainId] = addressToBytes32(contractAddress);
  }

  function getResisteredContract(uint32 domainId) public view returns(address) {
    return bytes32ToAddress(domainToContractAddress[domainId]);
  }

  function buy(uint32 domainId, address contractAddress, address nftContractAddress, uint256 tokenId, address payable seller)public payable {
    // Check transferred amount is match to the listedPrice
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    require(listedPrice[key] <= msg.value);
    seller.transfer(listedPrice[key]);

    // Send message to the other chain 
    _sendMessage(domainId, contractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, listedPrice[key]));

    emit Bought(nftContractAddress, tokenId, seller, listedPrice[key]);
  }


  function list(address nftContractAddress, uint256 tokenId, uint256 price, uint32 domainIdTo, address ourContractAddress)public {
    // Transfer NFT to our contract
    IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);

    // Send Message via Hyperlane
    _sendMessage(domainIdTo, ourContractAddress, abi.encode("Listing", nftContractAddress, tokenId, msg.sender, price));

    emit Listed(nftContractAddress, tokenId, msg.sender, price);
  }


  function handle(uint32 _origin, bytes32 _sender, bytes calldata _messageBody) external override onlyResisterdContract(_origin, _sender) {
    // Branch, according to the message
    (string memory messageType, address nftContractAddress, uint256 tokenId, address messageSender, uint256 price) = abi.decode(_messageBody, (string, address, uint256, address, uint256));
    // case Listing
    // Upgrade the mapping price
    if (compareStrings(messageType, "Listing")) {
        bytes32 key = keccak256(abi.encodePacked(_origin, nftContractAddress, tokenId, messageSender));
        listedPrice[key] = price;
    }

    // case Selling
    // Transfer NFTs to the buyer 
    if (compareStrings(messageType, "Trading")) {
        IERC721(nftContractAddress).transferFrom(address(this),messageSender,tokenId);
    }

  }

  function getPrice(uint32 domainId, address nftContractAddress, uint256 tokenId, address seller) public view returns(uint256){
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    return listedPrice[key];
  }

  function _sendMessage (uint32 _destinationDomain, address _receipient, bytes memory _callData) internal {
    IOutbox(outbox).dispatch(_destinationDomain, addressToBytes32(_receipient), _callData);
  }


  function addressToBytes32(address _addr) internal pure returns (bytes32) {
    return bytes32(uint256(uint160(_addr)));
  }

  function bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
    return address(uint160(uint256(_buf)));
  }

  function compareStrings(string memory a, string memory b) internal pure returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
  }

}
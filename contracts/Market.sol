// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

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
  AggregatorV3Interface internal priceFeed;

  address public outbox;
  mapping(bytes32=>address) public sellerAddress;
  mapping(bytes32 => uint256) public listedPrice;
  mapping(bytes32 => uint32) public listedCurrency;
  mapping(uint32 => bytes32) public domainToContractAddress;
  mapping(uint32 => address) public currencyIdToChainlinkContract;

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

  function setChainlinkContract(uint32 currencyId, address contractAddress) public onlyOwner {
    currencyIdToChainlinkContract[currencyId] = contractAddress;
  }

  function getResisteredContract(uint32 domainId) public view returns(address) {
    return bytes32ToAddress(domainToContractAddress[domainId]);
  }

  function buy(uint32 domainId, address contractAddress, address nftContractAddress, uint256 tokenId, address payable seller, uint32 currencyId)public payable {
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    if(currencyId == listedCurrency[key]){
    // Check transferred amount is match to the listedPrice
      require(listedPrice[key] <= msg.value);
      seller.transfer(listedPrice[key]);

    // Send message to the other chain 
      _sendMessage(domainId, contractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, listedPrice[key], 0,0));
    }else{
    // Multipy currency * price both listed and used payment
      address chainlinkContractAddress = currencyIdToChainlinkContract[currencyId];
      address listedChainlinkContractAddress = currencyIdToChainlinkContract[listedCurrency[key]];
      ( , int256 CurrencyPrice, , , ) = AggregatorV3Interface(chainlinkContractAddress).latestRoundData();
      ( , int256 listedCurrencyPrice, , , ) = AggregatorV3Interface(listedChainlinkContractAddress).latestRoundData();
      require(uint256(listedCurrencyPrice) * listedPrice[key] <= uint256(CurrencyPrice) * msg.value, "Market.sol: listedPrice and SendingPrice are not matched");
      seller.transfer(msg.value);
      // Send message to the other chain 
      _sendMessage(domainId, contractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, listedPrice[key], 0,0));
    }
    emit Bought(nftContractAddress, tokenId, seller, listedPrice[key]);
  }



  function list(address nftContractAddress, uint256 tokenId, uint256 price, uint32 currencyId, uint32 domainIdTo, address ourContractAddress)public {
    // Transfer NFT to our contract
    IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);
    sellerAddress[keccak256(abi.encodePacked(nftContractAddress, tokenId))] = msg.sender;

    // Send Message via Hyperlane
    _sendMessage(domainIdTo, ourContractAddress, abi.encode("Listing", nftContractAddress, tokenId, msg.sender, price, currencyId));

    emit Listed(nftContractAddress, tokenId, msg.sender, price);
  }

  function cancelListing(address nftContractAddress, uint256 tokenId) public {
    bytes32 key = keccak256(abi.encodePacked(nftContractAddress, tokenId));
    require(msg.sender == sellerAddress[key]);
    IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);
    sellerAddress[key] == address(0);
  }


  function handle(uint32 _origin, bytes32 _sender, bytes calldata _messageBody) external override onlyResisterdContract(_origin, _sender) {
    // Branch, according to the message
    (string memory messageType, address nftContractAddress, uint256 tokenId, address messageSender, uint256 price, uint32 currencyId) = abi.decode(_messageBody, (string, address, uint256, address, uint256, uint32));
    // case Listing
    // Upgrade the mapping price
    if (compareStrings(messageType, "Listing")) {
        bytes32 key = keccak256(abi.encodePacked(_origin, nftContractAddress, tokenId, messageSender));
        listedPrice[key] = price;
        listedCurrency[key] = currencyId;
    }

    // case Selling
    // Transfer NFTs to the buyer 
    if (compareStrings(messageType, "Trading")) {
        IERC721(nftContractAddress).transferFrom(address(this),messageSender,tokenId);
        sellerAddress[keccak256(abi.encodePacked(nftContractAddress, tokenId))] = address(0);
    }

  }

  function getPrice(uint32 domainId, address nftContractAddress, uint256 tokenId, address seller) public view returns(uint256){
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    return listedPrice[key];
  }

  function getChainlinkContractAddress(uint32 domainId) public view returns(address){
    return currencyIdToChainlinkContract[domainId];
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
  
  // This function isn't need for the product version
  function testGetPriceMultiple(uint32 domainId, address nftContractAddress, uint256 tokenId, address payable seller, uint32 currencyId, uint256 msgValue)public view returns(uint256[2] memory) {
    uint256[2] memory result;
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    address chainlinkContractAddress = currencyIdToChainlinkContract[currencyId];
    address listedChainlinkContractAddress = currencyIdToChainlinkContract[listedCurrency[key]];
    ( , int256 CurrencyPrice, , , ) = AggregatorV3Interface(chainlinkContractAddress).latestRoundData();
    ( , int256 listedCurrencyPrice, , , ) = AggregatorV3Interface(listedChainlinkContractAddress).latestRoundData();
    result[0] = uint256(listedCurrencyPrice) * listedPrice[key];
    result[1] = uint256(CurrencyPrice) * msgValue;
    return result;
  }

}
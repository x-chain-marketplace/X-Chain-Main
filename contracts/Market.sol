// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
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

interface IPUSHCommInterface {
    function sendNotification(address _channel, address _recipient, bytes calldata _identity) external;
}

contract Market is IMessageRecipient, Ownable {
  constructor(address _outbox, uint32 _selfDomainid, address _pushCommContractAddress, address _pushChannelAddress) {
    outbox = _outbox;
    selfDomainId = _selfDomainid;
    pushCommContractAddress = _pushCommContractAddress;
    pushChannelAddress = _pushChannelAddress;
  }
  AggregatorV3Interface internal priceFeed;

  address public outbox;
  uint32 public selfDomainId;
  address public pushCommContractAddress;
  address public pushChannelAddress;
  mapping(bytes32=>address) public sellerAddress;
  mapping(bytes32 => uint256) public listedPrice;
  mapping(bytes32 => uint32) public listedCurrency;
  mapping(bytes32 => uint256) public paidPrice;
  mapping(uint32 => bytes32) public domainToContractAddress;
  mapping(uint32 => address) public currencyIdToChainlinkContract;
  mapping(uint32 => address) public currencyIdToCurrencyContractAddress;

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
    domainToContractAddress[domainId] = _addressToBytes32(contractAddress);
  }
  function setSelfDomainId(uint32 domainId) public onlyOwner {
    selfDomainId = domainId;
  }

  function setChainlinkContract(uint32 currencyId, address contractAddress) public onlyOwner {
    currencyIdToChainlinkContract[currencyId] = contractAddress;
  }

  function setCurrencyContractAddress(uint32 currencyId, address currencyContractAddress)public onlyOwner {
    currencyIdToCurrencyContractAddress[currencyId] = currencyContractAddress;
  }

  function setPushCommContractAddress(address _contractAddress) public onlyOwner {
    pushCommContractAddress = _contractAddress;
  }
  function setPushChannelAddress(address _address) public onlyOwner {
    pushChannelAddress = _address;
  }

  function getResisteredContract(uint32 domainId) public view returns(address) {
    return _bytes32ToAddress(domainToContractAddress[domainId]);
  }

  function buy(uint32 originDomainId, address originZipChainContractAddress, address nftContractAddress, uint256 tokenId, address payable seller, uint32 currencyId)public payable {
    require(currencyIdToChainlinkContract[currencyId] != address(0), "This currency isn't supported");
    bytes32 key = keccak256(abi.encodePacked(originDomainId, nftContractAddress, tokenId, seller));
    require(listedPrice[key] != 0 || listedCurrency[key] != 0);
    if(currencyId == listedCurrency[key]){
      require(listedPrice[key] <= msg.value);
      bytes32 paidPriceKey = keccak256(abi.encode(originDomainId, nftContractAddress, tokenId, msg.sender));
      paidPrice[paidPriceKey] = msg.value;
      _sendMessage(originDomainId, originZipChainContractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, msg.value, currencyId, selfDomainId, address(this)));
      _clearListing(originDomainId, nftContractAddress, tokenId, seller);
    }else{
      address chainlinkContractAddress = currencyIdToChainlinkContract[currencyId];
      address listedChainlinkContractAddress = currencyIdToChainlinkContract[listedCurrency[key]];
      ( , int256 CurrencyPrice, , , ) = AggregatorV3Interface(chainlinkContractAddress).latestRoundData();
      ( , int256 listedCurrencyPrice, , , ) = AggregatorV3Interface(listedChainlinkContractAddress).latestRoundData();
      require(uint256(listedCurrencyPrice) * listedPrice[key] <= uint256(CurrencyPrice) * msg.value, "Market.sol: listedPrice and SendingPrice are not matched");
      _sendMessage(originDomainId, originZipChainContractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, msg.value, currencyId, selfDomainId, address(this)));
      _clearListing(originDomainId, nftContractAddress, tokenId, seller);
    }
    emit Bought(nftContractAddress, tokenId, seller, listedPrice[key]);
  }

  function list(address nftContractAddress, uint256 tokenId, uint256 price, uint32 currencyId, uint32 destinationDomainId, address destinationZipChainContractAddress)public {
    IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);
    sellerAddress[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId))] = msg.sender;
    _sendMessage(destinationDomainId, destinationZipChainContractAddress, abi.encode("Listing", nftContractAddress, tokenId, msg.sender, price, currencyId, selfDomainId, address(this)));
    bytes32 key = keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId, msg.sender));
    listedPrice[key] = price;
    listedCurrency[key] = currencyId;
    emit Listed(nftContractAddress, tokenId, msg.sender, price);
  }

  function cancelListing(address nftContractAddress, uint256 tokenId) public {
    bytes32 key = keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId));
    require(msg.sender == sellerAddress[key]);
    IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);
    sellerAddress[key] == address(0);
  }

  function handle(uint32 _origin, bytes32 _sender, bytes calldata _messageBody) external override onlyResisterdContract(_origin, _sender) {
    (
      string memory messageType, 
      address nftContractAddress, 
      uint256 tokenId, 
      address messageSender, 
      uint256 price, 
      uint32 currencyId, 
      uint32 originDomain, 
      address originMarketAddress
    ) = abi.decode(_messageBody, (string, address, uint256, address, uint256, uint32, uint32, address));
    bytes32 keyListing = keccak256(abi.encodePacked(originDomain, nftContractAddress, tokenId, messageSender));
    address seller = sellerAddress[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId))];
    bytes32 keyBuying = keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId, seller));
    bytes32 sellerAddressKey = keccak256(abi.encodePacked(originDomain, nftContractAddress, tokenId));
    if (_compareStrings(messageType, "Listing")) {
      sellerAddress[sellerAddressKey] = messageSender;
      listedPrice[keyListing] = price;
      listedCurrency[keyListing] = currencyId;
    }else if(_compareStrings(messageType, "Trading")){
      if(listedPrice[keyBuying] == 0 || listedCurrency[keyBuying] == 0){
        _sendMessage(originDomain, originMarketAddress, abi.encode("Reverted", nftContractAddress, tokenId, messageSender, price, currencyId, originDomain, originMarketAddress));
        if(pushCommContractAddress != address(0) && pushChannelAddress != address(0)){
          IPUSHCommInterface(pushCommContractAddress).sendNotification(
            pushChannelAddress,
            messageSender,
            bytes(string(abi.encodePacked( "0", "+", "3",  "+",  "Failed",  "+",  "You have failed to purchase NFT")))
          );
        }
        return;
      }
      IERC721(nftContractAddress).transferFrom(address(this),messageSender,tokenId);
      _sendMessage(originDomain, originMarketAddress, abi.encode("Confirmd", nftContractAddress, tokenId, messageSender, price, currencyId, originDomain, originMarketAddress));
      if(pushCommContractAddress != address(0) && pushChannelAddress != address(0)){
        IPUSHCommInterface(pushCommContractAddress).sendNotification(
          pushChannelAddress, 
          messageSender,
          bytes(string(  abi.encodePacked( "0", "+",  "3",  "+",  "Success", "+", "You have successfully purchased NFT !")))
        );
        IPUSHCommInterface(pushCommContractAddress).sendNotification(
          pushChannelAddress,
          seller, 
          bytes(string(  abi.encodePacked("0","+","3", "+", "Sold","+", "Your listed NFT was sold" )))
        );
      }
      _clearListing(originDomain, nftContractAddress, tokenId, seller);
    }else if(_compareStrings(messageType, "Confirm")) {
      payable(sellerAddress[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId))])
        .transfer(paidPrice[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId, messageSender))]);
      _clearListing(selfDomainId, nftContractAddress, tokenId, messageSender);
    }else if(_compareStrings(messageType, "Reverted")) {
      payable(messageSender).transfer(paidPrice[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId, messageSender))]);
    }
  }

  function getListInformation(uint32 domainId, address nftContractAddress, uint256 tokenId)public view returns(address, uint256, uint32) {
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId));
    address seller = sellerAddress[key];
    key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    uint256 price = listedPrice[key];
    uint32 currencyId = listedCurrency[key];
    return (seller, price, currencyId);
  }

  function getChainlinkContractAddress(uint32 domainId) public view returns(address){
    return currencyIdToChainlinkContract[domainId];
  }

  function _sendMessage (uint32 _destinationDomain, address _receipient, bytes memory _callData) internal {
    IOutbox(outbox).dispatch(_destinationDomain, _addressToBytes32(_receipient), _callData);
  }

  function _clearListing(uint32 domainId, address nftContractAddress, uint256 tokenId, address seller)internal {
    sellerAddress[keccak256(abi.encodePacked(selfDomainId, nftContractAddress, tokenId))] = address(0);
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    listedCurrency[key] = 0;
    listedPrice[key] = 0;

  }

  function _addressToBytes32(address _addr) internal pure returns (bytes32) {
    return bytes32(uint256(uint160(_addr)));
  }

  function _bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
    return address(uint160(uint256(_buf)));
  }

  function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
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

  function buyWithERC20(uint32 domainId, address contractAddress, address nftContractAddress, uint256 tokenId, address payable seller, uint32 currencyId, uint256 sendPrice)public {
    require(currencyIdToChainlinkContract[currencyId] != address(0), "This currency isn't supported");
    bytes32 key = keccak256(abi.encodePacked(domainId, nftContractAddress, tokenId, seller));
    require(listedPrice[key] != 0 || listedCurrency[key] != 0);
    if(currencyId == listedCurrency[key]){
      require(listedPrice[key] <= sendPrice);
      IERC20(currencyIdToCurrencyContractAddress[currencyId]).transferFrom(msg.sender, address(this), listedPrice[key]);
      _sendMessage(domainId, contractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, 0, 0, selfDomainId, address(this)));
      _clearListing(domainId, nftContractAddress, tokenId, seller);
    }else{
      address chainlinkContractAddress = currencyIdToChainlinkContract[currencyId];
      address listedChainlinkContractAddress = currencyIdToChainlinkContract[listedCurrency[key]];
      ( , int256 CurrencyPrice, , , ) = AggregatorV3Interface(chainlinkContractAddress).latestRoundData();
      ( , int256 listedCurrencyPrice, , , ) = AggregatorV3Interface(listedChainlinkContractAddress).latestRoundData();
      require(uint256(listedCurrencyPrice) * listedPrice[key] <= uint256(CurrencyPrice) * sendPrice, "Market.sol: listedPrice and SendingPrice are not matched");
      IERC20(currencyIdToCurrencyContractAddress[currencyId]).transferFrom(msg.sender, address(this), listedPrice[key]);
      _sendMessage(domainId, contractAddress, abi.encode("Trading", nftContractAddress, tokenId, msg.sender, 0, 0,selfDomainId, address(this)));
      _clearListing(domainId, nftContractAddress, tokenId, seller);
    }
    emit Bought(nftContractAddress, tokenId, seller, listedPrice[key]);
  }
}
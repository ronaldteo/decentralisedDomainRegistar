// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NTUDomainRegistrar {
    
    
    struct Domain {
        address owner;
        bool isRegistered;
        uint256 expiryTime;
    }
    
    struct Bid {
        bytes32 commitment;
        uint256 deposit;
        bool revealed;
        uint256 revealedValue;
    }
    
    struct Auction {
        string domainName;
        uint256 commitEndTime;
        uint256 revealEndTime;
        address highestBidder;
        uint256 highestBid;
        bool finalized;
        mapping(address => Bid) bids;
        address[] bidders;
    }
    
    
    mapping(string => Domain) public domains;
    mapping(address => string) public reverseRegistry;
    mapping(string => Auction) public auctions;
    
    string[] public registeredDomains;
    
    uint256 public constant COMMIT_DURATION = 2 minutes;
    uint256 public constant REVEAL_DURATION = 2 minutes;
    uint256 public constant REGISTRATION_DURATION = 365 days;
    
    
    event AuctionStarted(string domainName, uint256 commitEndTime, uint256 revealEndTime);
    event BidCommitted(string domainName, address bidder, bytes32 commitment);
    event BidRevealed(string domainName, address bidder, uint256 value);
    event AuctionFinalized(string domainName, address winner, uint256 winningBid);
    event DomainRegistered(string domainName, address owner);
    event DomainTransferred(string domainName, address from, address to);
    event EtherSent(string domainName, address from, uint256 amount);
        
    modifier onlyDomainOwner(string memory domainName) {
        require(domains[domainName].owner == msg.sender, "Not domain owner");
        _;
    }
    
    modifier domainNotRegistered(string memory domainName) {
        require(!domains[domainName].isRegistered, "Domain already registered");
        _;
    }
    
    modifier domainRegistered(string memory domainName) {
        require(domains[domainName].isRegistered, "Domain not registered");
        _;
    }
    

    function startAuction(string memory domainName) 
        public 
        domainNotRegistered(domainName) 
    {
        require(auctions[domainName].commitEndTime == 0, "Auction already exists");
        
        Auction storage auction = auctions[domainName];
        auction.domainName = domainName;
        auction.commitEndTime = block.timestamp + COMMIT_DURATION;
        auction.revealEndTime = auction.commitEndTime + REVEAL_DURATION;
        auction.finalized = false;
        
        emit AuctionStarted(domainName, auction.commitEndTime, auction.revealEndTime);
    }
    

    function commitBid(string memory domainName, bytes32 commitment) 
        public 
        payable 
    {
        Auction storage auction = auctions[domainName];
        require(auction.commitEndTime > 0, "Auction does not exist");
        require(block.timestamp < auction.commitEndTime, "Commit phase ended");
        require(msg.value > 0, "Must send deposit");
        require(auction.bids[msg.sender].commitment == bytes32(0), "Already committed");
        
        auction.bids[msg.sender] = Bid({
            commitment: commitment,
            deposit: msg.value,
            revealed: false,
            revealedValue: 0
        });
        
        auction.bidders.push(msg.sender);
        
        emit BidCommitted(domainName, msg.sender, commitment);
    }
    

    function makeCommitment(
        string memory domainName, 
        uint256 bidValue, 
        bytes32 secret
    ) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(domainName, bidValue, secret));
    }
    

    function revealBid(
        string memory domainName, 
        uint256 bidValue, 
        bytes32 secret
    ) 
        public 
    {
        Auction storage auction = auctions[domainName];
        require(block.timestamp >= auction.commitEndTime, "Commit phase not ended");
        require(block.timestamp < auction.revealEndTime, "Reveal phase ended");
        
        Bid storage bid = auction.bids[msg.sender];
        require(bid.commitment != bytes32(0), "No commitment found");
        require(!bid.revealed, "Already revealed");
        
        bytes32 computedCommitment = makeCommitment(domainName, bidValue, secret);
        require(computedCommitment == bid.commitment, "Invalid reveal");
        
        require(bid.deposit >= bidValue, "Deposit less than bid");
        
        bid.revealed = true;
        bid.revealedValue = bidValue;
        
        if (bidValue > auction.highestBid) {
            auction.highestBid = bidValue;
            auction.highestBidder = msg.sender;
        }
        
        emit BidRevealed(domainName, msg.sender, bidValue);
    }
    

    function finalizeAuction(string memory domainName) public {
        Auction storage auction = auctions[domainName];
        require(auction.commitEndTime > 0, "Auction does not exist");
        require(block.timestamp >= auction.revealEndTime, "Reveal phase not ended");
        require(!auction.finalized, "Auction already finalized");
        
        auction.finalized = true;
        
        if (auction.highestBidder != address(0)) {
            domains[domainName] = Domain({
                owner: auction.highestBidder,
                isRegistered: true,
                expiryTime: block.timestamp + REGISTRATION_DURATION
            });
            
            registeredDomains.push(domainName);
            reverseRegistry[auction.highestBidder] = domainName;

            for (uint i = 0; i < auction.bidders.length; i++) {
                address bidder = auction.bidders[i];
                Bid storage bid = auction.bids[bidder];
                
                if (bidder == auction.highestBidder) {
                    uint256 refund = bid.deposit - auction.highestBid;
                    if (refund > 0) {
                        payable(bidder).transfer(refund);
                    }
                } else {
                    payable(bidder).transfer(bid.deposit);
                }
            }
            
            emit AuctionFinalized(domainName, auction.highestBidder, auction.highestBid);
            emit DomainRegistered(domainName, auction.highestBidder);
        } else {
            for (uint i = 0; i < auction.bidders.length; i++) {
                address bidder = auction.bidders[i];
                Bid storage bid = auction.bids[bidder];
                payable(bidder).transfer(bid.deposit);
            }
        }
    }
    
    function resolveDomain(string memory domainName) 
        public 
        view 
        domainRegistered(domainName)
        returns (address) 
    {
        require(block.timestamp < domains[domainName].expiryTime, "Domain expired");
        return domains[domainName].owner;
    }
    
    function reverseResolve(address owner) 
        public 
        view 
        returns (string memory) 
    {
        return reverseRegistry[owner];
    }
    function transferDomain(string memory domainName, address newOwner) 
        public 
        onlyDomainOwner(domainName)
        domainRegistered(domainName)
    {
        require(newOwner != address(0), "Invalid address");
        
        address oldOwner = domains[domainName].owner;
        domains[domainName].owner = newOwner;
        delete reverseRegistry[oldOwner];
        reverseRegistry[newOwner] = domainName;
        
        emit DomainTransferred(domainName, oldOwner, newOwner);
    }

    function sendToDomain(string memory domainName) 
        public 
        payable 
        domainRegistered(domainName)
    {
        require(msg.value > 0, "Must send ether");
        address owner = domains[domainName].owner;
        payable(owner).transfer(msg.value);
        
        emit EtherSent(domainName, msg.sender, msg.value);
    }
    
    function getAllRegisteredDomains() public view returns (string[] memory) {
        return registeredDomains;
    }

    function getAuctionInfo(string memory domainName) 
        public 
        view 
        returns (
            uint256 commitEndTime,
            uint256 revealEndTime,
            address highestBidder,
            uint256 highestBid,
            bool finalized
        ) 
    {
        Auction storage auction = auctions[domainName];
        return (
            auction.commitEndTime,
            auction.revealEndTime,
            auction.highestBidder,
            auction.highestBid,
            auction.finalized
        );
    }

    function getMyBid(string memory domainName) 
        public 
        view 
        returns (
            bytes32 commitment,
            uint256 deposit,
            bool revealed,
            uint256 revealedValue
        ) 
    {
        Bid storage bid = auctions[domainName].bids[msg.sender];
        return (
            bid.commitment,
            bid.deposit,
            bid.revealed,
            bid.revealedValue
        );
    }
    
    function isDomainAvailable(string memory domainName) public view returns (bool) {
        return !domains[domainName].isRegistered && auctions[domainName].commitEndTime == 0;
    }
}
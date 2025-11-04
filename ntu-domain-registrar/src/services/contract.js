import { ethers } from 'ethers';
import contractService from './contractService';

//send eth to domain
export async function sendEth(domain, amount) {
    try {
        await contractService.initialize();
        const convertedAmt = ethers.utils.parseEther(amount.toString());
        const txn = await contractService.contract.sendToDomain(domain, {value: convertedAmt});

        console.log(txn)

        //waiting for block confirmation
        const confirm = await txn.wait()
        console.log(confirm)

        return {
            success: true,
            txn,
            confirm
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//find domain with address
export async function addressResolver(address) {
    try {
        await contractService.initialize();
        const domain = await contractService.contract.reverseResolve(address);
        //to test SC output
        if (domain === "") {
            console.log("This address has no associated domains")
        }

        return domain

    } catch (error) {
        if (error.message.includes("expired")) {
            console.log("Domain has expired");
            return null;
        }
    }
}

//find address with domain
export async function domainResolver(domain) {
    try {
        await contractService.initialize();
        const address = await contractService.contract.resolveDomain(domain);

        return address;

    } catch (error) {
        if (error.message.includes("expired")) {
            console.log("Domain has expired");
            return null;
        } else if (error.message.includes("not registered")) {
            console.log("Domain not registered");
            return null;
        }
    }
}

//find all domains
export async function allDomains() {
    try {
        await contractService.initialize();
        
        const result = await contractService.contract.getAllRegisteredDomains();
        const domainNames = result[0];
        const owners = result[1];
        const expiryDates = result[2];
        
        //convert to readable format
        const domainsData = domainNames.map((domain, index) => {
            const expiryTime = expiryDates[index].toNumber 
                ? expiryDates[index].toNumber() 
                : parseInt(expiryDates[index]);
            
            const now = Math.floor(Date.now() / 1000);
            
            return {
                domain,
                owner: owners[index],
                expiryTime,
                expiryDate: new Date(expiryTime * 1000).toISOString(),
                isExpired: now > expiryTime
            };
        });
        
        return domainsData;
    } catch (error) {
        console.error("Error getting all registered domains:", error);
        throw error;
    }
}

//get expiry date for particular domain
export async function getDomainExpiryDate(domainName) {
    try {
        await contractService.initialize();
        const domain = await contractService.contract.domains(domainName);
        
        if (!domain.isRegistered) {
            return null;
        }
        
        const expiryTime = domain.expiryTime.toNumber 
            ? domain.expiryTime.toNumber() 
            : parseInt(domain.expiryTime);
        const now = Math.floor(Date.now() / 1000);
        const expiryDate = new Date(expiryTime * 1000).toISOString();
        const isExpired = now > expiryTime;
        
        return {
            expiryTime,
            expiryDate,
            isExpired
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

//commit function
export async function commit(domain, amount, secret) {
    let bid;
    let auction;
    try {
        await contractService.initialize();
        
        //get user's account and balance
        const account = await contractService.getAccount();
        const provider = contractService.provider;
        const balance = await provider.getBalance(account);
        const convertedAmt = ethers.utils.parseEther(amount.toString());
        const estimatedGasCost = ethers.utils.parseEther("0.005");
        const totalRequired = convertedAmt.add(estimatedGasCost);
        
        //check if user has sufficient balance
        if (balance.lt(totalRequired)) {
            console.error("Insufficient balance.");
            throw new Error(`Insufficient balance. Ensure you have enough ETH in your account.`);
        }
        
        //check if domain is already registered and active
        try {
            const address = await contractService.contract.resolveDomain(domain);
            if (address) {
                console.log("Domain is active and registered");
                throw new Error("Domain already registered");
            }
        } catch (error) {
            //if error is "Domain expired", can continue
            if (error.message.includes("Domain expired")) {
                console.log("Domain is expired, new auction can be started");
            } else if (error.message.includes("already registered")) {
                console.log("Domain already registered");
                throw error;
            } else {
                console.log(error.message);
            }
        }

        //check for case where nobody revealed
        let auctionExists = false;
        try {
            auction = await contractService.contract.getAuctionInfo(domain);
            console.log("Auction info:", auction);
            
            const commitEndTime = auction.commitEndTime.toNumber ? 
                auction.commitEndTime.toNumber() : 
                parseInt(auction.commitEndTime);
            const revealEndTime = auction.revealEndTime.toNumber ?
                auction.revealEndTime.toNumber() :
                parseInt(auction.revealEndTime);
            const now = Math.floor(Date.now() / 1000);

            //to check whether no people revealed
            const highestBid = ethers.utils.formatEther(auction.highestBid);
            const hasZeroBid = parseFloat(highestBid) === 0;
            
            if (commitEndTime === 0) {
                console.log("Auction doesn't exist");
                auctionExists = false;
              //case if nobody revealed
            } else if (hasZeroBid && !auction.finalized) {
                if (now >= revealEndTime && revealEndTime !== 0) {
                    console.log("Reveal phase ended with 0 ETH bid, can start new auction");
                    auctionExists = false;
                } else {
                    console.log("Auction exists with active/pending reveal phase");
                    auctionExists = true;
                }
            } else {
                console.log("Auction exists, commitEndTime:", commitEndTime);
                auctionExists = true;
            }
        } catch (error) {
            console.log(error.message);
            auctionExists = false;
        }

        //check for case where domain expired
        if (!auctionExists) {
            try {
                const expiryData = await getDomainExpiryDate(domain);
                if (expiryData && expiryData.isExpired) {
                    auctionExists = false;
                }
            } catch (error) {
                console.log(error)
            }
        }


        //if no auction exists/expired/no reveals, start auction
        if (!auctionExists) {
            const currentBalance = await provider.getBalance(account);
            const auctionStartGas = ethers.utils.parseEther("0.003");
            const requiredForAuctionStart = convertedAmt.add(auctionStartGas).add(estimatedGasCost);
            
            if (currentBalance.lt(requiredForAuctionStart)) {
                throw new Error(`Insufficient balance to start auction and commit bid.`);
            }
            
            try {
                const startTx = await contractService.contract.startAuction(domain);
                await startTx.wait(); // wait for mining to finish
                
                auction = await contractService.contract.getAuctionInfo(domain);
            } catch (startError) {
                console.error(startError.message);
                
                if (startError.message.includes("Auction already exists")) {
                    console.log("Auction already started by another user");
                    try {
                        auction = await contractService.contract.getAuctionInfo(domain);
                    } catch (fetchError) {
                        console.error("Error fetching existing auction:", fetchError.message);
                        throw fetchError;
                    }
                } else {
                    throw startError;
                }
            }
        }

        //make commitment
        const secret32 = ethers.utils.formatBytes32String(secret);
        const commitment = await contractService.contract.makeCommitment(domain, convertedAmt, secret32);

        //commit
        try {
            bid = await contractService.contract.commitBid(domain, commitment, {value: convertedAmt});
            console.log("Bid committed successfully");
            await bid.wait(); // wait for mining to finish
            console.log("Bid commit transaction confirmed");
        } catch (commitError) {
            console.error(commitError.message);
            throw commitError;
        }

        return {
            success: true,
            bid,
            auction
        }
    } catch (error) {
        console.error("Full commit error:", error.message);
        
        const errorCode = error.code;
        const errorMessage = error.message || '';
        
        if (errorMessage.includes('Insufficient balance')) {
            return errorMessage;
        }
        if (errorMessage.includes('insufficient funds') || 
            errorMessage.includes('INSUFFICIENT_FUNDS') ||
            errorCode === 'INSUFFICIENT_FUNDS') {
            return "Insufficient funds. Please ensure you have enough ETH.";
        }
        if (errorMessage.includes('network') || 
            errorMessage.includes('timeout')) {
            return "Network error. Please check your connection and try again.";
        }
        if (errorMessage.includes('user rejected')) {
            return "Transaction rejected by user.";
        }
        if (errorMessage.includes('committed') || 
            errorMessage.includes('Already')) {
            return "You have already committed a bid for this domain.";
        }
        if (errorMessage.includes('has ended') || 
            errorMessage.includes('ended')) {
            return "Commit phase has ended.";
        }
        if (errorMessage.includes('already registered')) {
            return "Domain already registered.";
        }
        if (errorMessage.includes('exist')) {
            return "Auction does not exist.";
        }
        if (errorMessage.includes('deposit')) {
            return "Invalid deposit amount.";
        }
        console.error("Unexpected error:", error);
        return "Failed to commit bid. Please try again or contact support.";
    }
}


//auction info
export async function auctionInfo(domain) {
    try {
        await contractService.initialize();
        const auction = await contractService.contract.getAuctionInfo(domain);
        return auction;

    } catch (error) {
        if (error.message.includes("expired")) {
            console.log("Domain has expired");
            return "Domain has expired";
        } else if (error.message.includes("not registered")) {
            console.log("Domain not registered");
            return "Domain not registered";
        }
    }
}

//reveal
export async function reveal(domain, amount, secret) {
    try {
        await contractService.initialize();
        const convertedAmt = ethers.utils.parseEther(amount.toString());
        const secret32 = ethers.utils.formatBytes32String(secret);

        const reveal = await contractService.contract.revealBid(domain, convertedAmt, secret32);
        console.log(reveal);
        const receipt = await reveal.wait();
        return {
            success: true,
            tx: reveal
        };
        
    } catch (error) {
        if (error.message.includes("Commit phase")) {
            console.log("Commit phase has not ended");
            return "Commit phase has not ended";
        } else if (error.message.includes("Reveal phase")) {
            console.log("Reveal phase has ended");
            return "Reveal phase has ended";
        } else if (error.message.includes("commitment")) {
            console.log("No commitment found!");
            return "No commitment found!";
        } else if (error.message.includes("revealed")) {
            console.log("Bid already revealed");
            return "Bid already revealed";
        } else if (error.message.includes("Invalid")) {
            console.log("Invalid reveal transaction");
            return "Invalid reveal transaction. Verify your bid amount and secret.";
        } else if (error.message.includes("Deposit")) {
            console.log("Deposit less than bid");
            return "Deposit less than bid";
        } else {
            console.log(error);
            throw error;
        }       
    }
}

//finalise auction
// only show finalise button if reveal over + current account is winner
export async function finalize(domain) {
    let auction; // if undefined -> auction not ready to be finalised
    let owner; // if undefined -> current owner is not bid winner
    let finalized; // contains details about finalize txn

    //check if reveal phase ended
    try {
        await contractService.initialize();
        if (canFinalizeAuction(domain)) {
            auction = await contractService.contract.getAuctionInfo(domain);
        } else {
            console.log("Auction cannot be finalised now")
            return {
                auction,
                owner,
                finalized
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }

    //check if current owner is bid winner
    try {
        const account = await contractService.getAccount();
        const winner = auction.highestBidder;
        if (account.toLowerCase() === winner.toLowerCase()) {
            owner = account;
        } else {
            console.log("Current account is not highest bidder");
            return {
                auction,
                owner,
                finalized
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
    
    // finalize
    try {
        finalized = await contractService.contract.finalizeAuction(domain);
        console.log(finalized);
        const receipt = await finalized.wait();
        
        return {
            success: true,
            auction,
            owner,
            finalized,
            tx: receipt
        };
    } catch (error) { // catches error if insufficient gas
        console.log(error);
        throw error;
    }
}

//helper function to check if reveal phase ended
export async function canFinalizeAuction(domainName) {
  try {
    const info = await contractService.contract.getAuctionInfo(domainName);
    const now = Math.floor(Date.now() / 1000);
    const revealEnd = parseInt(info.revealEndTime);
    return now >= revealEnd && !info.finalized && revealEnd > 0;
  } catch (error) {
    console.error('Error checking if can finalize:', error);
    return false;
  }
}

//get user's bid info from smart contract
export async function getMyBid(domain) {
  try {
    await contractService.initialize();
    const bidInfo = await contractService.contract.getMyBid(domain);
    
    return {
      commitment: bidInfo.commitment,
      deposit: bidInfo.deposit,
      revealed: bidInfo.revealed,
      revealedValue: bidInfo.revealedValue
    };
  } catch (error) {
    console.error("Error getting bid info:", error);
    if (error.message.includes("revert")) {
      return null;
    }
    throw error;
  }
}
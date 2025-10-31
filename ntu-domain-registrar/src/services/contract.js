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
        console.error(error);
        throw error;
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
            return "Domain has expired";
        } else if (error.message.includes("not registered")) {
            console.log("Domain not registered");
            return "Domain not registered";
        }
    }
}

//find all domains
export async function allDomains() {
    try {
        await contractService.initialize();
        const domains = await contractService.contract.getAllRegisteredDomains();

        let addresses = [];
        for (const domain of domains) {
            const address = await contractService.contract.resolveDomain(domain);
            addresses.push(address);
        }

        return [domains, addresses];

    } catch (error) {
        console.error(error);
        throw error;
    }
}

//secret generator
// export function generateSecret() {
//   return ethers.utils.hexlify(ethers.utils.randomBytes(32));
// }

//commit function
export async function commit(domain, amount, secret) {
    let bid;
    let auction;
    try {
        await contractService.initialize();
        //check if domain already exists
        const address = await contractService.contract.resolveDomain(domain);
        if (typeof address !== "undefined") {
            console.log("Domain already exists", address);
            return {
                bid,
                auction
            }
        }

        //get existing auction
        auction = await contractService.contract.getAuctionInfo(domain);
        
    } catch (error) {
        //if domain is expired or not registered
        if (error.message.includes("expired")) {
            try{
                console.log("Domain expired... starting auction");
                auction = await contractService.contract.startAuction(domain);
            } catch (error) {
                console.log(error);
                throw error;
            }
        } else if (error.message.includes("not registered")) {
            try{
                console.log("Domain does not exist... starting auction");
                auction = await contractService.contract.startAuction(domain);
            } catch (error) {
                console.log(error);
                throw error;
            }
        } else {
            console.log(error);
            throw error;
        }
    }
    
    //commit
    try {
        await contractService.initialize();
        const convertedAmt = ethers.utils.parseEther(amount.toString());

        //make commitment
        //secret = generateSecret();
        const secret32 = ethers.utils.formatBytes32String(secret);
        const commit = await contractService.contract.makeCommitment(domain, convertedAmt, secret32);
        console.log(commit);
        bid = await contractService.contract.commitBid(domain, commit, {value: convertedAmt});
        console.log(bid);
        return {
            bid,
            auction
        }
    } catch (error) {
        // return error message
        if (error.message.includes("exist")) {
            console.log("Auction does not exist");
            return "Auction does not exist";
        } else if (error.message.includes("ended")) {
            console.log("Commit phase has ended");
            return "Commit phase has ended";
        } else if (error.message.includes("deposit")) {
            console.log("Invalid deposit amount");
            return "Invalid deposit amount";
        } else if (error.message.includes("committed")) {
            console.log("Address already committed");
            return "Address already committed";
        } else {
            console.log(error);
            throw error;
        }
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
            return "Domain has expired";
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
            return "Invalid reveal transaction";
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
            auction = contractService.contract.getAuctionInfo(domain);
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
        if (account === winner) {
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
        return {
            auction,
            owner,
            finalized
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

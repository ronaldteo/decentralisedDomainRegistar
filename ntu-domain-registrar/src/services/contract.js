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
export function generateSecret() {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
}

//commit function
export async function commit(domain, amount, secret) {
    let bid;
    let auction;
    try {
        await contractService.initialize();
        //check if domain already exists
        const address = await contractService.contract.resolveDomain(domain);
        auction = await contractService.contract.getAuctionInfo(domain);
        console.log("Domain already exists", address);
        return {
            auction
        }

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
        const commit = await contractService.contract.makeCommitment(domain, convertedAmt, secret);
        console.log(commit);
        bid = await contractService.contract.commitBid(domain, commit, {value: convertedAmt});
        console.log(bid);
        return {
            secret,
            bid,
            auction
        }
    } catch (error) {
        // if auction does not exist (but this will never happen)
        if (error.message.includes("exist")) {
            console.log("Auction does not exist");
        } else if (error.message.includes("ended")) {
            console.log("Commit phase has ended");
        } else if (error.message.includes("deposit")) {
            console.log("Invalid deposit amount");
        } else if (error.message.includes("committed")) {
            console.log("Address already committed");
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
        //TODO: what return value is needed?
        if (error.message.includes("expired")) {
            console.log("Domain has expired");
        } else if (error.message.includes("not registered")) {
            console.log("Domain not registered");
        }
    }
}

//reveal
export async function reveal(domain, amount, secret) {
    try {
        await contractService.initialize();
        const convertedAmt = ethers.utils.parseEther(amount.toString());

        const reveal = await contractService.contract.revealBid(domain, convertedAmt, secret);
        console.log(reveal);
        

    } catch (error) {
        console.log(error);
        throw error       
    }
}

export async function finalize(domain) {
    try{
        const finalize = await contractService.contract.finalizeAuction(domain);
        console.log(finalize);
        return finalize;
    } catch (error) {
        console.log(error);
    }
}

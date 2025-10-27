import { ethers } from 'ethers';
import CONTRACT_ABI from '../config/contractABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async initialize() {
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
    }
  }

  async isDomainAvailable(domain) {
    return await this.contract.isDomainAvailable(domain);
  }

  async resolveDomain(domain) {
    return await this.contract.resolveDomain(domain);
  }

  async reverseResolve(address) {
    return await this.contract.reverseResolve(address);
  }

  async getAuctionInfo(domain) {
    return await this.contract.getAuctionInfo(domain);
  }

  async startAuction(domain) {
    const tx = await this.contract.startAuction(domain);
    return await tx.wait();
  }

  async commitBid(domain, commitment, value) {
    const tx = await this.contract.commitBid(domain, commitment, { value });
    return await tx.wait();
  }

  async revealBid(domain, bidAmount, secret) {
    const tx = await this.contract.revealBid(domain, bidAmount, secret);
    return await tx.wait();
  }

  async finalizeAuction(domain) {
    const tx = await this.contract.finalizeAuction(domain);
    return await tx.wait();
  }

  async transferDomain(domain, newOwner) {
    const tx = await this.contract.transferDomain(domain, newOwner);
    return await tx.wait();
  }

  async sendToDomain(domain, value) {
    const tx = await this.contract.sendToDomain(domain, { value });
    return await tx.wait();
  }

  async getAllRegisteredDomains() {
    return await this.contract.getAllRegisteredDomains();
  }
}

export default new ContractService();

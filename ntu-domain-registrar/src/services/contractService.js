import { ethers } from 'ethers';
import CONTRACT_ABI from '../config/contractABI.json';

const CONTRACT_ADDRESS = '0xF963010d45Bc1053875171961A8A1516148D705a';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.listenersSet = false;
    this.initialized = false;
    this.initializationPromise = null; // Store the promise
  }

  async initialize() {
    // If already initialized, just return the account
    if (this.initialized && this.account) {
      console.log('Already initialized, returning existing account:', this.account);
      return this.account;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      console.log('Initialization in progress, waiting...');
      return this.initializationPromise;
    }

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
    }

    // Create and store the initialization promise
    this.initializationPromise = this._doInitialize();
    
    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.initializationPromise = null;
    }
  }

  async _doInitialize() {
    try {
      // Check if already connected
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts.length > 0) {
        // Already connected, use existing account
        this.account = accounts[0];
      } else {
        // Request new connection
        const newAccounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        this.account = newAccounts[0];
      }
      
      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS, 
        CONTRACT_ABI, 
        this.signer
      );

      // Set up event listeners (only once)
      if (!this.listenersSet) {
        // Remove old listeners first (if any)
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        
        // Add new listeners
        window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
        window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
        this.listenersSet = true;
      }

      this.initialized = true;
      return this.account;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw error;
    }
  }

  handleAccountsChanged(accounts) {
    console.log('Account change detected:', accounts);
    
    if (accounts.length === 0) {
      console.log('No accounts connected. Clearing session...');
      this.account = null;
      this.provider = null;
      this.signer = null;
      this.contract = null;
      this.initialized = false;
      sessionStorage.removeItem('walletConnected');
      sessionStorage.removeItem('walletAccount');
      window.location.reload();
    } else {
      const newAccount = accounts[0].toLowerCase();
      const currentAccount = this.account?.toLowerCase();
      
      if (newAccount !== currentAccount) {
        console.log('Account changed from', this.account, 'to', accounts[0]);
        this.account = accounts[0];
        sessionStorage.setItem('walletAccount', accounts[0]);
        window.location.reload();
      }
    }
  }

  handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    window.location.reload();
  }

  async getAccount() {
    if (!this.account) {
      await this.initialize();
    }
    return this.account;
  }

  async getBalance() {
    if (!this.account || !this.provider) {
      await this.initialize();
    }
    const balance = await this.provider.getBalance(this.account);
    return ethers.utils.formatEther(balance);
  }

  async getNetwork() {
    if (!this.provider) {
      await this.initialize();
    }
    return await this.provider.getNetwork();
  }

  disconnect() {
    if (window.ethereum && this.listenersSet) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    
    this.account = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.listenersSet = false;
    this.initialized = false;
    this.initializationPromise = null;
  }
}

export default new ContractService();

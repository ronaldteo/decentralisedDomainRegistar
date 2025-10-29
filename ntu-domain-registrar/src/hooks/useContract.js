import { useState, useEffect, useCallback, useRef } from 'react';
import contractService from '../services/contractService';

export const useContract = () => {
  // Initialize with stored values immediately to prevent flicker
  const storedAccount = typeof window !== 'undefined' ? sessionStorage.getItem('walletAccount') : null;
  const wasConnected = typeof window !== 'undefined' ? sessionStorage.getItem('walletConnected') === 'true' : false;
  
  const [initialized, setInitialized] = useState(wasConnected);
  const [account, setAccount] = useState(storedAccount);
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const connectedAccount = await contractService.initialize();
      setAccount(connectedAccount);
      
      const accountBalance = await contractService.getBalance();
      setBalance(accountBalance);
      
      const currentNetwork = await contractService.getNetwork();
      setNetwork(currentNetwork);
      
      setInitialized(true);
      
      sessionStorage.setItem('walletConnected', 'true');
      sessionStorage.setItem('walletAccount', connectedAccount);
    } catch (err) {
      console.error('Failed to connect:', err);
      
      if (err.message.includes('already pending')) {
        setError('Connection request already pending. Please check MetaMask and approve the request.');
      } else if (err.message.includes('User rejected')) {
        setError('Connection rejected. Please try again and approve in MetaMask.');
      } else if (err.message.includes('Initialization already in progress')) {
        setTimeout(() => connect(), 500);
        return;
      } else {
        setError(err.message);
      }
      
      sessionStorage.removeItem('walletConnected');
      sessionStorage.removeItem('walletAccount');
      setAccount(null);
      setInitialized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    contractService.disconnect();
    setAccount(null);
    setBalance('0');
    setNetwork(null);
    setInitialized(false);
    setError(null);
    
    sessionStorage.removeItem('walletConnected');
    sessionStorage.removeItem('walletAccount');
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const initializeConnection = async () => {
      const wasConnected = sessionStorage.getItem('walletConnected');
      const savedAccount = sessionStorage.getItem('walletAccount');
      
      if (wasConnected && savedAccount && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
            setTimeout(() => connect(), 100);
          } else {
            sessionStorage.removeItem('walletConnected');
            sessionStorage.removeItem('walletAccount');
            setAccount(null);
            setInitialized(false);
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error);
          sessionStorage.removeItem('walletConnected');
          sessionStorage.removeItem('walletAccount');
          setAccount(null);
          setInitialized(false);
        }
      }
    };

    initializeConnection();
  }, [connect]);

  return { 
    initialized, 
    account, 
    balance, 
    network, 
    error, 
    loading,
    connect,
    disconnect
  };
};

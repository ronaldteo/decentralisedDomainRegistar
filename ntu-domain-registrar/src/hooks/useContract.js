import { useState, useEffect } from 'react';
import contractService from '../services/contractService';

export const useContract = () => {
  const [initialized, setInitialized] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await contractService.initialize();
        const signer = await contractService.signer.getAddress();
        setAccount(signer);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize contract:', error);
      }
    };
    init();
  }, []);

  return { initialized, account };
};

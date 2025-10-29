import React, { useEffect, useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { Card, CardContent } from '../ui/card';
import { AlertCircle } from 'lucide-react';

const NetworkChecker = ({ children }) => {
  const { network, error } = useContract();
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Define expected network (change this based on your deployment)
  const EXPECTED_CHAIN_ID = 11155111; // Sepolia testnet
  const EXPECTED_NETWORK_NAME = 'Sepolia';

  useEffect(() => {
    if (network && network.chainId !== EXPECTED_CHAIN_ID) {
      setWrongNetwork(true);
    } else {
      setWrongNetwork(false);
    }
  }, [network]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md border-red-300 bg-red-50">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-red-600 underline"
              >
                Install MetaMask â†’
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md border-yellow-300 bg-yellow-50">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Wrong Network</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Please switch to {EXPECTED_NETWORK_NAME} network to use this application.
              </p>
              <p className="text-xs text-yellow-600">
                Current network: {network?.name || 'Unknown'} (Chain ID: {network?.chainId})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default NetworkChecker;

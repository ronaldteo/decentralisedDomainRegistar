import React from 'react';
import { useContract } from '../../hooks/useContract';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Wallet, Power, AlertCircle } from 'lucide-react';

const Header = () => {
  const { account, balance, error, loading, connect, disconnect } = useContract();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-6">
        {/* Left side - Logo (fixed width) */}
        <div className="flex w-48 items-center space-x-3">
          <div className="h-6 w-1.5 rounded-full bg-black"></div>
          <span className="text-xl font-bold leading-none text-black">NTU<br></br>Domain Registar</span>
        </div>
        
        {/* Center - Navigation (flex-1, centered) */}
        <nav className="flex flex-1 items-center justify-center space-x-2 text-sm font-medium">
          <a href="/" className="flex items-center rounded-full px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black">
            Search
          </a>
          <a href="/resolver" className="flex items-center rounded-full px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black">
            Resolver
          </a>
          <a href="/send" className="flex items-center rounded-full px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black">
            Send
          </a>
          <a href="/history" className="flex items-center rounded-full px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black">
            History
          </a>
        </nav>

        {/* Right side - Wallet (fixed width matching left) */}
        <div className="flex w-48 items-center justify-end space-x-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Error</span>
            </div>
          )}
          
          {!account && loading ? (
            <Badge variant="secondary" className="border border-gray-300 bg-gray-100">
              <span className="leading-none text-gray-600">Connecting...</span>
            </Badge>
          ) : account ? (
            <>
              <div className="flex flex-col items-end">
                <Badge variant="secondary" className="mb-1 border border-gray-300 bg-gray-100 font-mono text-xs leading-none text-black">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </Badge>
                {balance !== '0' && (
                  <span className="text-xs leading-none text-gray-600">
                    {parseFloat(balance).toFixed(4)} ETH
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="h-8 w-8 flex-shrink-0 rounded-full p-0"
                  title="Disconnect"
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={connect}
              size="sm"
              className="h-9 rounded-full px-4"
              disabled={loading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Connect</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

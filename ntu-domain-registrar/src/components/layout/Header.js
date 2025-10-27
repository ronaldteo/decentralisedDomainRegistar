import React from 'react';
import { useContract } from '../../hooks/useContract';
import { Badge } from '../ui/badge';

const Header = () => {
  const { account } = useContract();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-1.5 rounded-full bg-black"></div>
          <span className="text-xl font-bold leading-none text-black">NTU Domain</span>
        </div>
        
        <nav className="flex items-center space-x-2 text-sm font-medium">
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

        <div className="flex items-center space-x-3">
          {account ? (
            <>
              <Badge variant="secondary" className="border border-gray-300 bg-gray-100 font-mono text-xs leading-none text-black">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </Badge>
              <div className="h-2 w-2 rounded-full bg-black"></div>
            </>
          ) : (
            <Badge variant="outline" className="leading-none text-black">Not Connected</Badge>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

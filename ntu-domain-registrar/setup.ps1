# setup-typography.ps1
# Improved text positioning and typography

Write-Host "Optimizing text positioning and typography..." -ForegroundColor Cyan

# Update Header with better text alignment
Write-Host "`nUpdating components with improved typography..." -ForegroundColor Yellow
$headerContent = @'
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
'@
$headerContent | Out-File -FilePath "src\components\layout\Header.js" -Encoding UTF8

# Update SearchBar with better label positioning
$searchBarContent = @'
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="flex w-full gap-3" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for domain (e.g. mydomain.ntu)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 border-2 border-gray-300 bg-white pr-12 text-base leading-none text-black placeholder:text-gray-500"
        />
        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>
      <Button type="submit" size="lg" className="h-14 px-8 text-base leading-none">
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
'@
$searchBarContent | Out-File -FilePath "src\components\common\SearchBar.js" -Encoding UTF8

# Update CountdownTimer with centered text
$countdownTimerContent = @'
import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { Card, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, onComplete, label }) => {
  const timeLeft = useCountdown(endTime, onComplete);

  if (timeLeft.total <= 0) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center gap-3 p-5">
          <div className="flex items-center justify-center rounded-full bg-white p-2.5">
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium leading-none text-gray-900">Phase ended</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-300 bg-white">
      <CardContent className="p-8">
        <p className="mb-6 text-center text-sm font-medium leading-relaxed text-gray-600">{label}</p>
        <div className="flex items-center justify-center gap-4">
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-3xl font-light leading-none text-gray-400">:</span>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-3xl font-light leading-none text-gray-400">:</span>
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      </CardContent>
    </Card>
  );
};

const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center rounded-3xl border-2 border-gray-300 bg-gray-50 px-5 py-4 shadow-sm">
      <span className="text-4xl font-semibold leading-none tabular-nums text-black">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <p className="mt-3 text-xs font-medium uppercase leading-none tracking-wider text-gray-600">
      {label}
    </p>
  </div>
);

export default CountdownTimer;
'@
$countdownTimerContent | Out-File -FilePath "src\components\common\CountdownTimer.js" -Encoding UTF8

# Update DomainSearch with better heading hierarchy
Write-Host "`nUpdating pages with improved text positioning..." -ForegroundColor Yellow
$domainSearchContent = @'
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const DomainSearch = () => {
  const navigate = useNavigate();

  const handleSearch = (domain) => {
    navigate(`/domain/${domain}`);
  };

  const steps = [
    { number: 1, title: 'Search', description: 'Find your desired domain name' },
    { number: 2, title: 'Bid', description: 'Place your sealed bid in auction' },
    { number: 3, title: 'Own', description: 'Win and claim your domain' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Find Your Domain
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Search for available .ntu domains and participate in decentralized auctions
            </p>
          </div>
          
          <Card className="mb-12 border-gray-300 bg-white shadow-lg">
            <CardContent className="p-10">
              <SearchBar onSearch={handleSearch} />
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.number} className="border-gray-300 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
                    <span className="text-2xl font-bold leading-none text-black">{step.number}</span>
                  </div>
                  <CardTitle className="mb-2 text-xl leading-tight text-black">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainSearch;
'@
$domainSearchContent | Out-File -FilePath "src\pages\DomainSearch\DomainSearch.js" -Encoding UTF8

# Update DomainDetails with proper text alignment
$domainDetailsContent = @'
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import contractService from '../../services/contractService';
import TabPanel from '../../components/common/TabPanel';
import OwnedTab from './OwnedTab';
import CommitTab from './CommitTab';
import RevealTab from './RevealTab';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const DomainDetails = () => {
  const { domain } = useParams();
  const [activeTab, setActiveTab] = useState('Owned');
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomainData();
  }, [domain]);

  const loadDomainData = async () => {
    setLoading(true);
    try {
      const available = await contractService.isDomainAvailable(domain);
      const owner = !available ? await contractService.resolveDomain(domain) : null;
      const auctionInfo = await contractService.getAuctionInfo(domain);
      
      setDomainData({ available, owner, auctionInfo });
    } catch (error) {
      console.error('Error loading domain:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-black hover:bg-gray-100"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="leading-none">Back to search</span>
          </Button>

          <Card className="border-gray-300 bg-white">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-3 text-3xl leading-tight text-black">{domain}</CardTitle>
                  <Badge 
                    variant={domainData?.available ? "default" : "secondary"}
                    className={`leading-none ${
                      domainData?.available 
                        ? "bg-black text-white" 
                        : "border-gray-300 bg-gray-100 text-black"
                    }`}
                  >
                    {domainData?.available ? 'Available' : 'Registered'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <TabPanel 
                tabs={['Owned', 'Commit', 'Reveal']} 
                activeTab={activeTab} 
                onChange={setActiveTab} 
              />
              
              <div className="mt-8">
                {activeTab === 'Owned' && <OwnedTab domainData={domainData} />}
                {activeTab === 'Commit' && <CommitTab domain={domain} domainData={domainData} onUpdate={loadDomainData} />}
                {activeTab === 'Reveal' && <RevealTab domain={domain} domainData={domainData} onUpdate={loadDomainData} />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DomainDetails;
'@
$domainDetailsContent | Out-File -FilePath "src\pages\DomainDetails\DomainDetails.js" -Encoding UTF8

# Update OwnedTab with better text layout
$ownedTabContent = @'
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const OwnedTab = ({ domainData }) => {
  if (domainData?.available) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">Domain Available</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              This domain is available for auction. Switch to the Commit tab to place your bid.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-300 bg-white">
      <CardHeader>
        <CardTitle className="text-sm uppercase leading-none tracking-wide text-black">
          Owner Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <CardDescription className="text-sm leading-relaxed text-gray-600">Address</CardDescription>
          <code className="block break-all rounded-2xl border-2 border-gray-300 bg-gray-50 p-5 font-mono text-sm leading-relaxed text-black">
            {domainData?.owner}
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnedTab;
'@
$ownedTabContent | Out-File -FilePath "src\pages\DomainDetails\OwnedTab.js" -Encoding UTF8

# Update CommitTab with aligned labels and inputs
$commitTabContent = @'
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { AlertCircle } from 'lucide-react';
import contractService from '../../services/contractService';
import CountdownTimer from '../../components/common/CountdownTimer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';

const CommitTab = ({ domain, domainData, onUpdate }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommit = async () => {
    if (!bidAmount || !secret) {
      alert('Please fill in both bid amount and secret');
      return;
    }

    setLoading(true);
    try {
      const commitment = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'bytes32'],
          [ethers.utils.parseEther(bidAmount), ethers.utils.formatBytes32String(secret)]
        )
      );
      
      await contractService.commitBid(domain, commitment, ethers.utils.parseEther(bidAmount));
      alert('Bid committed successfully!');
      setBidAmount('');
      setSecret('');
      onUpdate();
    } catch (error) {
      console.error('Error committing bid:', error);
      alert('Error committing bid. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const auctionStatus = domainData?.auctionInfo?.phase;
  const commitEndTime = domainData?.auctionInfo?.commitEndTime;

  if (auctionStatus === 'ended') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg font-medium leading-none text-black">Auction has ended</p>
        </CardContent>
      </Card>
    );
  }

  if (auctionStatus === 'reveal') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg font-medium leading-none text-black">Currently in reveal phase</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {commitEndTime && (
        <CountdownTimer 
          endTime={new Date(commitEndTime * 1000)} 
          label="Time remaining in commit phase"
        />
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="bidAmount" className="text-base font-semibold leading-none text-black">
            Bid Amount
          </Label>
          <div className="relative">
            <Input
              id="bidAmount"
              type="text"
              placeholder="0.1"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="h-14 border-2 border-gray-300 bg-white pr-20 text-base leading-none text-black placeholder:text-gray-500"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold leading-none text-gray-600">
              ETH
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="secret" className="text-base font-semibold leading-none text-black">
            Secret Phrase
          </Label>
          <Input
            id="secret"
            type="password"
            placeholder="Enter a secret phrase"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500"
          />
          <Card className="border-gray-300 bg-gray-50">
            <CardContent className="flex gap-3 p-5">
              <div className="flex items-center justify-center rounded-full bg-white p-2.5">
                <AlertCircle className="h-5 w-5 text-black" />
              </div>
              <p className="flex-1 text-sm leading-relaxed text-gray-700">
                Save this secret phrase securely. You will need it during the reveal phase.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button 
          onClick={handleCommit}
          disabled={loading}
          className="h-14 w-full text-base leading-none"
          size="lg"
        >
          {loading ? 'Processing...' : 'Commit Bid'}
        </Button>
      </div>
    </div>
  );
};

export default CommitTab;
'@
$commitTabContent | Out-File -FilePath "src\pages\DomainDetails\CommitTab.js" -Encoding UTF8

# Update RevealTab with consistent text alignment
$revealTabContent = @'
import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Info } from 'lucide-react';
import contractService from '../../services/contractService';
import CountdownTimer from '../../components/common/CountdownTimer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';

const RevealTab = ({ domain, domainData, onUpdate }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const handleFinalize = useCallback(async () => {
    if (finalizing) return;
    
    setFinalizing(true);
    try {
      await contractService.finalizeAuction(domain);
      alert('Auction finalized successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error finalizing auction:', error);
      alert('Error finalizing auction. See console for details.');
    } finally {
      setFinalizing(false);
    }
  }, [domain, onUpdate, finalizing]);

  const handleReveal = async () => {
    if (!bidAmount || !secret) {
      alert('Please fill in both bid amount and secret');
      return;
    }

    setLoading(true);
    try {
      await contractService.revealBid(
        domain, 
        ethers.utils.parseEther(bidAmount),
        ethers.utils.formatBytes32String(secret)
      );
      alert('Bid revealed successfully!');
      setBidAmount('');
      setSecret('');
      onUpdate();
    } catch (error) {
      console.error('Error revealing bid:', error);
      alert('Error revealing bid. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const auctionStatus = domainData?.auctionInfo?.phase;
  const revealEndTime = domainData?.auctionInfo?.revealEndTime;

  if (auctionStatus === 'ended') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg font-medium leading-none text-black">Auction has ended</p>
        </CardContent>
      </Card>
    );
  }

  if (auctionStatus === 'commit') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg font-medium leading-none text-black">Currently in commit phase</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {revealEndTime && (
        <CountdownTimer 
          endTime={new Date(revealEndTime * 1000)} 
          onComplete={handleFinalize}
          label="Time remaining in reveal phase"
        />
      )}

      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex items-center justify-center rounded-full bg-white p-2.5 shadow-sm">
            <Info className="h-5 w-5 text-black" />
          </div>
          <p className="flex-1 text-sm leading-relaxed text-gray-700">
            The auction will automatically finalize when the timer reaches zero.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="revealAmount" className="text-base font-semibold leading-none text-black">
            Bid Amount
          </Label>
          <div className="relative">
            <Input
              id="revealAmount"
              type="text"
              placeholder="0.1"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="h-14 border-2 border-gray-300 bg-white pr-20 text-base leading-none text-black placeholder:text-gray-500"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold leading-none text-gray-600">
              ETH
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="revealSecret" className="text-base font-semibold leading-none text-black">
            Secret Phrase
          </Label>
          <Input
            id="revealSecret"
            type="password"
            placeholder="Enter your secret phrase"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500"
          />
        </div>

        <Button 
          onClick={handleReveal}
          disabled={loading}
          className="h-14 w-full text-base leading-none"
          size="lg"
        >
          {loading ? 'Processing...' : 'Reveal Bid'}
        </Button>
      </div>
    </div>
  );
};

export default RevealTab;
'@
$revealTabContent | Out-File -FilePath "src\pages\DomainDetails\RevealTab.js" -Encoding UTF8

# Update DomainResolver with better text hierarchy
$domainResolverContent = @'
import React, { useState } from 'react';
import contractService from '../../services/contractService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const DomainResolver = () => {
  const [mode, setMode] = useState('domain');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      if (mode === 'domain') {
        const address = await contractService.resolveDomain(input);
        setResult({ type: 'address', value: address });
      } else {
        const domains = await contractService.reverseResolve(input);
        setResult({ type: 'domains', value: domains });
      }
    } catch (error) {
      console.error('Resolution error:', error);
      alert('Error resolving. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-gray-300 bg-white">
            <CardHeader>
              <CardTitle className="text-3xl leading-tight text-black">Domain Resolver</CardTitle>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Resolve domain names to addresses or vice versa
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex gap-2 rounded-2xl border-2 border-gray-300 bg-gray-100 p-2">
                <button
                  onClick={() => setMode('domain')}
                  className={`flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-medium leading-none transition-all ${
                    mode === 'domain'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Domain to Address
                </button>
                <button
                  onClick={() => setMode('address')}
                  className={`flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-medium leading-none transition-all ${
                    mode === 'address'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Address to Domains
                </button>
              </div>

              <div className="space-y-3">
                <Label htmlFor="resolveInput" className="text-base font-semibold leading-none text-black">
                  {mode === 'domain' ? 'Domain Name' : 'Ethereum Address'}
                </Label>
                <Input
                  id="resolveInput"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'domain' ? 'example.ntu' : '0x...'}
                  className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500"
                />
              </div>

              <Button 
                onClick={handleResolve}
                disabled={loading}
                className="h-14 w-full text-base leading-none"
                size="lg"
              >
                {loading ? 'Resolving...' : 'Resolve'}
              </Button>

              {result && (
                <Card className="border-gray-300 bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase leading-none tracking-wide text-black">
                      Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.type === 'address' ? (
                      <code className="block break-all rounded-2xl border-2 border-gray-300 bg-white p-5 font-mono text-sm leading-relaxed text-black">
                        {result.value}
                      </code>
                    ) : (
                      <div className="space-y-2">
                        {result.value.length > 0 ? (
                          result.value.map((domain, idx) => (
                            <div key={idx} className="flex items-center rounded-2xl border-2 border-gray-300 bg-white px-5 py-4">
                              <span className="text-sm font-medium leading-none text-black">{domain}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm leading-relaxed text-gray-600">No domains found</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DomainResolver;
'@
$domainResolverContent | Out-File -FilePath "src\pages\DomainResolver\DomainResolver.js" -Encoding UTF8

# Update SendEth
$sendEthContent = @'
import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractService from '../../services/contractService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const SendEth = () => {
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!domain || !amount) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      await contractService.sendToDomain(domain, ethers.utils.parseEther(amount));
      alert(`Successfully sent ${amount} ETH to ${domain}`);
      setDomain('');
      setAmount('');
    } catch (error) {
      console.error('Send error:', error);
      alert('Error sending ETH. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-gray-300 bg-white">
            <CardHeader>
              <CardTitle className="text-3xl leading-tight text-black">Send ETH</CardTitle>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Send Ethereum to any registered .ntu domain
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="recipientDomain" className="text-base font-semibold leading-none text-black">
                  Recipient Domain
                </Label>
                <Input
                  id="recipientDomain"
                  type="text"
                  placeholder="example.ntu"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="sendAmount" className="text-base font-semibold leading-none text-black">
                  Amount
                </Label>
                <div className="relative">
                  <Input
                    id="sendAmount"
                    type="text"
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 border-2 border-gray-300 bg-white pr-20 text-base leading-none text-black placeholder:text-gray-500"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold leading-none text-gray-600">
                    ETH
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSend}
                disabled={loading}
                className="h-14 w-full text-base leading-none"
                size="lg"
              >
                {loading ? 'Sending...' : 'Send ETH'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendEth;
'@
$sendEthContent | Out-File -FilePath "src\pages\SendEth\SendEth.js" -Encoding UTF8

# Update History
$historyContent = @'
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import contractService from '../../services/contractService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const History = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const allDomains = await contractService.getAllRegisteredDomains();
      const domainsWithOwners = await Promise.all(
        allDomains.map(async (domain) => {
          const owner = await contractService.resolveDomain(domain);
          return { domain, owner };
        })
      );
      setDomains(domainsWithOwners);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Card className="overflow-hidden border-gray-300 bg-white">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-3xl leading-tight text-black">Registered Domains</CardTitle>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                All domains currently registered on the platform
              </CardDescription>
            </CardHeader>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-none tracking-wider text-gray-700">
                      Domain
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-none tracking-wider text-gray-700">
                      Owner Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {domains.map(({ domain, owner }, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-gray-50">
                      <td className="px-8 py-5">
                        <span className="font-medium leading-none text-black">{domain}</span>
                      </td>
                      <td className="px-8 py-5">
                        <code className="inline-flex items-center rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-2 font-mono text-sm leading-none text-black">
                          {owner}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {domains.length === 0 && (
              <CardContent className="p-16 text-center">
                <p className="text-base leading-relaxed text-gray-600">No domains registered yet</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default History;
'@
$historyContent | Out-File -FilePath "src\pages\History\History.js" -Encoding UTF8

Write-Host "`nTypography optimization completed!" -ForegroundColor Green
Write-Host "`nKey improvements:" -ForegroundColor Cyan
Write-Host "- Consistent leading-none for buttons and badges" -ForegroundColor White
Write-Host "- leading-tight for headings (1.25)" -ForegroundColor White
Write-Host "- leading-relaxed for body text (1.625)" -ForegroundColor White
Write-Host "- Proper vertical centering with flexbox" -ForegroundColor White
Write-Host "- Absolute positioning for icon overlays" -ForegroundColor White
Write-Host "- Centered text in status messages" -ForegroundColor White
Write-Host "- Better spacing between labels and inputs" -ForegroundColor White
Write-Host "`nAll text properly positioned and aligned!" -ForegroundColor Green

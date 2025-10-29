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
          <div className="flex items-start gap-2 text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Save this secret phrase securely. You will need it during the reveal phase.
            </p>
          </div>
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

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

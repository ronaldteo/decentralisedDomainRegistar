import React, { useState, useEffect } from 'react';
import { reveal, finalize, auctionInfo, canFinalizeAuction, getMyBid } from '../../services/contract';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Clock, Eye, EyeOff, Check, Trophy, Lock } from 'lucide-react';
import contractService from '../../services/contractService';


const RevealTab = ({ domain, status, phase, auctionData, onUpdate, onTabChange }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bufferingSteps, setBufferingSteps] = useState([]);
  const [revealPhaseEnded, setRevealPhaseEnded] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [revealedAmount, setRevealedAmount] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [finalizingAuction, setFinalizingAuction] = useState(false);
  const [auctionFinalized, setAuctionFinalized] = useState(false);
  const [highestBidderInfo, setHighestBidderInfo] = useState(null);
  const [userHadCommitment, setUserHadCommitment] = useState(false);
  const [checkingBidStatus, setCheckingBidStatus] = useState(true);


  // Get current account
  useEffect(() => {
    const getAccount = async () => {
      try {
        const account = await contractService.getAccount();
        setCurrentAccount(account);
      } catch (error) {
        // Continue
      }
    };

    getAccount();

    // Listen for account changes
    const handleAccountChange = () => {
      getAccount();
      setError(null);
      setSuccess(false);
      setSuccessData(null);
      setHasRevealed(false);
      setIsWinner(false);
      setCheckingBidStatus(true);
    };

    window.ethereum?.on('accountsChanged', handleAccountChange);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountChange);
    };
  }, []);


  // Check if user has already revealed
  useEffect(() => {
    const checkRevealStatus = async () => {
      if (!currentAccount) {
        setCheckingBidStatus(false);
        return;
      }

      try {
        setCheckingBidStatus(true);
        const bidInfo = await getMyBid(domain);
        
        if (bidInfo) {
          // Check if user had a commitment
          const hasCommitment = bidInfo.commitment && 
            bidInfo.commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000';
          
          setUserHadCommitment(hasCommitment);
          
          if (bidInfo.revealed) {
            // User has revealed
            setHasRevealed(true);
            const amount = ethers.utils.formatEther(bidInfo.revealedValue);
            setRevealedAmount(amount);
          } else if (hasCommitment) {
            // User has committed but not revealed yet
            setHasRevealed(false);
            setRevealedAmount(null);
          } else {
            // No commitment found
            setHasRevealed(false);
            setRevealedAmount(null);
          }
        } else {
          // No bid info
          setUserHadCommitment(false);
          setHasRevealed(false);
          setRevealedAmount(null);
        }
      } catch (error) {
        setUserHadCommitment(false);
        setHasRevealed(false);
        setRevealedAmount(null);
      } finally {
        setCheckingBidStatus(false);
      }
    };

    if (currentAccount) {
      checkRevealStatus();
    }
  }, [domain, currentAccount]);


  // Calculate time left until reveal phase ends
  useEffect(() => {
    if ((phase !== 'reveal' && phase !== 'pending_finalize') || !auctionData?.revealEndTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      
      let revealEndTime = auctionData.revealEndTime;
      if (revealEndTime.toNumber) {
        revealEndTime = revealEndTime.toNumber();
      } else {
        revealEndTime = parseInt(revealEndTime);
      }

      const difference = revealEndTime - now;

      if (difference <= 0) {
        setTimeLeft('Reveal phase ended');
        setRevealPhaseEnded(true);
        return;
      }

      setRevealPhaseEnded(false);
      const minutes = Math.floor(difference / 60);
      const seconds = Math.floor(difference % 60);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [phase, auctionData?.revealEndTime]);


  // Check if current user is winner after reveal phase ends
  useEffect(() => {
    if (!revealPhaseEnded && phase !== 'pending_finalize') return;
    if (!currentAccount || status === 'Registered') return;

    const checkWinner = async () => {
      try {
        const auction = await auctionInfo(domain);
        
        if (auction) {
          const highestBidderAddress = auction.highestBidder;

          setHighestBidderInfo({
            address: highestBidderAddress,
            amount: ethers.utils.formatEther(auction.highestBid)
          });
          
          if (highestBidderAddress && 
              highestBidderAddress.toLowerCase() === currentAccount.toLowerCase()) {
            setIsWinner(true);
          } else {
            setIsWinner(false);
          }
        }
      } catch (error) {
        // Continue
      }
    };

    checkWinner();
  }, [revealPhaseEnded, currentAccount, domain, status, phase]);


  const validateReveal = () => {
    if (!bidAmount) {
      return { valid: false, message: 'Please enter your bid amount' };
    }

    if (parseFloat(bidAmount) <= 0) {
      return { valid: false, message: 'Bid amount must be greater than 0' };
    }

    if (!secret) {
      return { valid: false, message: 'Please enter your secret' };
    }

    if (secret.length < 8) {
      return { valid: false, message: 'Secret must be at least 8 characters' };
    }

    return { valid: true, message: '' };
  };


  const handleReveal = () => {
    const validation = validateReveal();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setShowConfirmation(true);
  };


  const handleConfirmReveal = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    
    setBufferingSteps([
      { step: 'Submitting reveal...', completed: false },
      { step: 'Confirming transaction...', completed: false },
    ]);

    try {
      let stepIndex = 0;

      const result = await reveal(domain, bidAmount, secret);

      if (result && typeof result === 'object' && result.success) {
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        stepIndex++;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        
        await onUpdate?.();

        setLoading(false);
        setSuccess(true);
        setSuccessData({
          bidAmount: bidAmount,
          transactionHash: result.tx?.hash
        });
        setHasRevealed(true);
        setRevealedAmount(bidAmount);
        setBidAmount('');
        setSecret('');
      } else if (typeof result === 'string') {
        setLoading(false);
        setBufferingSteps([]);
        setError(result);
      } else {
        setLoading(false);
        setBufferingSteps([]);
        setError('Failed to reveal bid');
      }
    } catch (err) {
      setLoading(false);
      setBufferingSteps([]);
      
      if (err.message.includes('Commit phase')) {
        setError('Commit phase has not ended yet');
      } else if (err.message.includes('Reveal phase')) {
        setError('Reveal phase has ended');
      } else if (err.message.includes('commitment')) {
        setError('No commitment found. Make sure you entered the correct bid amount and secret.');
      } else if (err.message.includes('revealed')) {
        setError('Bid already revealed');
        setHasRevealed(true);
      } else if (err.message.includes('Invalid')) {
        setError('Invalid reveal. Secret or bid amount does not match your commitment.');
      } else if (err.message.includes('Deposit')) {
        setError('Deposit less than bid amount');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Failed to reveal bid. Please try again.');
      }
    }
  };


  const handleFinalize = async () => {
    setFinalizingAuction(true);
    setError(null);
    
    setBufferingSteps([
      { step: 'Finalizing auction...', completed: false },
      { step: 'Confirming transaction...', completed: false },
      { step: 'Registering domain...', completed: false },
    ]);

    try {
      let stepIndex = 0;

      const result = await finalize(domain);

      if (result && result.success && result.tx) {
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        stepIndex++;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        stepIndex++;

        await new Promise(resolve => setTimeout(resolve, 1000));
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        
        await onUpdate?.();

        setFinalizingAuction(false);
        setAuctionFinalized(true);

        setTimeout(() => {
          onTabChange?.('Owned');
        }, 2000);
      } else {
        setFinalizingAuction(false);
        setBufferingSteps([]);
        setError('Failed to finalize auction');
      }
    } catch (err) {
      setFinalizingAuction(false);
      setBufferingSteps([]);
      
      if (err.message.includes('not the highest bidder')) {
        setError('Only the highest bidder can finalize the auction');
      } else if (err.message.includes('cannot be finalized')) {
        setError('Auction cannot be finalized yet. Reveal phase may not be over.');
      } else if (err.message.includes('not found')) {
        setError('Auction or account information not found');
      } else if (err.message.includes('connect wallet')) {
        setError('Please connect your wallet');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Failed to finalize auction. Please try again.');
      }
    }
  };


  const handleCancel = () => {
    setShowConfirmation(false);
  };


  // Show when domain is available or expired
  if ((status === 'Available' || status === 'Expired') && !phase) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-black-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not in Reveal Phase
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {status === 'Expired'
                ? `This domain has expired and is available. Switch to the Commit tab to place your bid.`
                : `This domain is available for auction. Switch to the Commit tab to place your bid.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show when domain is already registered
  if (status === 'Registered') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not in Reveal Phase
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              This domain is already registered.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show when still in commit phase
  if (phase === 'commit') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Still in Commit Phase
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              The reveal phase hasn't started yet. Please wait for the commit phase to end before revealing your bid.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while checking bid status
  if (checkingBidStatus) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-black" />
          <p className="ml-3 text-sm text-gray-600">Checking your bid status...</p>
        </CardContent>
      </Card>
    );
  }

  // Show "Reveal phase ended" message if user didn't bid
  if ((phase === 'pending_finalize' || revealPhaseEnded) && !userHadCommitment && !hasRevealed) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <Lock className="h-5 w-5 flex-shrink-0 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not a Participant
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              You did not place a bid in this auction. The reveal phase has ended.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show for users who committed but reveal phase is still active
  if (phase === 'reveal' && userHadCommitment && !hasRevealed && !revealPhaseEnded) {
    return (
      <Card className="border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Reveal Your Bid</CardTitle>
          <CardDescription>Submit your bid amount and secret to reveal your bid</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Time Left */}
            <div className="flex items-center gap-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">Time Left to Reveal</p>
                <p className="text-lg font-bold text-blue-600">{timeLeft}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                  <p className="flex-1 text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Bid Amount */}
            <div className="space-y-3">
              <Label htmlFor="revealAmount" className="text-base font-semibold text-black">
                Bid Amount
              </Label>
              <div className="relative">
                <Input
                  id="revealAmount"
                  type="number"
                  placeholder="Enter the exact bid amount you committed."
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={loading || showConfirmation}
                  step="0.001"
                  min="0"
                  className="h-12 border-2 border-gray-300 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 pointer-events-none">
                  ETH
                </span>
              </div>
            </div>

            {/* Secret */}
            <div className="space-y-3">
              <Label htmlFor="revealSecret" className="text-base font-semibold text-black">
                Secret
              </Label>
              <div className="relative">
                <Input
                  id="revealSecret"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter your secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={loading || showConfirmation}
                  className="h-12 border-2 border-gray-300 pr-12"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  disabled={loading || showConfirmation}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleReveal}
              disabled={loading || !bidAmount || !secret || showConfirmation}
              className="h-12 w-full text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revealing...
                </>
              ) : (
                'Reveal Bid'
              )}
            </Button>
          </div>
        </CardContent>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <Card className="w-full max-w-md border-gray-300 bg-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-black">Confirm Reveal</CardTitle>
                <CardDescription>Please review your reveal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Reveal Details */}
                  <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Domain</p>
                      <p className="text-base font-bold text-black">{domain}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-medium text-gray-600 mb-1">Bid Amount</p>
                      <p className="text-base font-bold text-black">{bidAmount} ETH</p>
                    </div>
                  </div>

                  {/* Warning */}
                  <Card className="border-yellow-300 bg-yellow-50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        Make sure the bid amount and secret match your original commitment exactly. Any mismatch will cause the reveal to fail.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 h-10"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmReveal}
                      className="flex-1 h-10"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Revealing...
                        </>
                      ) : (
                        'Confirm Reveal'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    );
  }

  // Show buffering state for reveal
  if (loading && bufferingSteps.length > 0 && !finalizingAuction) {
    return (
      <Card className="border-gray-400 bg-white">
        <CardContent className="p-10">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-6">Processing Your Reveal</h3>
            
            <div className="space-y-4">
              {bufferingSteps.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : index === bufferingSteps.findIndex(s => !s.completed) ? (
                      <Loader2 className="h-8 w-8 animate-spin text-black" />
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300">
                        <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      item.completed ? 'text-black' : 
                      index === bufferingSteps.findIndex(s => !s.completed) ? 'text-black' : 
                      'text-gray-600'
                    }`}>
                      {item.step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show buffering state for finalize
  if (finalizingAuction && bufferingSteps.length > 0) {
    return (
      <Card className="border-gray-400 bg-white">
        <CardContent className="p-10">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-6">Finalizing Auction</h3>
            
            <div className="space-y-4">
              {bufferingSteps.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : index === bufferingSteps.findIndex(s => !s.completed) ? (
                      <Loader2 className="h-8 w-8 animate-spin text-black" />
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300">
                        <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      item.completed ? 'text-black' : 
                      index === bufferingSteps.findIndex(s => !s.completed) ? 'text-black' : 
                      'text-gray-600'
                    }`}>
                      {item.step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show reveal summary if user revealed
  if ((success && successData) || (hasRevealed && status !== 'Registered')) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-10">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-black">
                Bid Revealed Successfully
              </h3>
              <p className="text-sm text-green-700">
                Your bid for {domain} has been revealed.
              </p>
            </div>
          </div>

          {/* Show time left till end of reveal phase */}
          {timeLeft && !revealPhaseEnded && phase === 'reveal' && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">Time Left to Reveal</p>
                <p className="text-lg font-bold text-blue-600">{timeLeft}</p>
              </div>
            </div>
          )}

          {/* Bid Details */}
          <div className="space-y-4 mb-6">
            <div className="rounded-lg border border-green-300 bg-white p-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Bid Amount Revealed</p>
              <p className="text-lg font-bold text-black">
                {successData?.bidAmount || revealedAmount} ETH
              </p>
            </div>

            {successData?.transactionHash && (
              <div className="rounded-lg border border-green-300 bg-white p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Transaction Hash</p>
                <code className="block break-all font-mono text-xs text-black">
                  {successData.transactionHash}
                </code>
              </div>
            )}
          </div>

          {/* Info Message - waiting for phase to end */}
          {!revealPhaseEnded && phase === 'reveal' && (
            <Card className="border-blue-300 bg-blue-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Your bid has been revealed. Waiting for the reveal phase to end to determine the winner.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Winner Message */}
          {revealPhaseEnded && isWinner && !auctionFinalized && (
            <Card className="border-yellow-300 bg-yellow-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <Trophy className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-700 font-semibold mb-2">
                    Congratulations! You are the highest bidder!
                  </p>
                  <p className="text-xs text-yellow-700">
                    Winning bid amount: {highestBidderInfo?.amount} ETH
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Winner Message - shown until domain is registered */}
          {revealPhaseEnded && !isWinner && !auctionFinalized && status !== 'Registered' && (
            <Card className="border-gray-300 bg-gray-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-700 font-semibold mb-2">
                    You are not the highest bidder.
                  </p>
                  <p className="text-xs text-gray-700">
                    Highest bid: {highestBidderInfo?.amount} ETH
                  </p>
                  <p className="text-xs text-gray-700 mt-2">
                    Waiting for the highest bidder to finalize the auction.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finalize Button for winner */}
          {revealPhaseEnded && isWinner && !auctionFinalized && (
            <Button
              className="w-full h-12 text-base bg-black hover:bg-gray-800 text-white"
              onClick={handleFinalize}
              disabled={finalizingAuction}
            >
              {finalizingAuction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizing Auction...
                </>
              ) : (
                <>
                  Finalize Auction & Register Domain
                </>
              )}
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <Card className="border-red-300 bg-red-50 mt-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <p className="flex-1 text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show when reveal phase ended and nobody won the auction
  if (phase === 'pending_finalize' && userHadCommitment && revealPhaseEnded && 
      auctionData?.highestBid === 0 && !hasRevealed) {
    return (
      <Card className="border-blue-300 bg-blue-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              No Winner
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Nobody won the auction as nobody revealed their bid. The auction has ended with no winner.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show when user is not the highest bidder in pending finalization
  if (phase === 'pending_finalize' && userHadCommitment && !isWinner && 
      auctionData?.highestBid > 0 && hasRevealed) {
    return (
      <Card className="border-orange-300 bg-orange-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not the Highest Bidder
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              You did not win the auction. The highest bidder is registering the domain.
            </p>
            <p className="text-sm leading-relaxed text-gray-600 mt-2">
              Highest bid: {highestBidderInfo?.amount} ETH
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};


export default RevealTab;

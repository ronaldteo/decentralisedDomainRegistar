import React, { useState, useEffect } from 'react';
import { commit, getMyBid } from '../../services/contract';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Clock, Eye, EyeOff, ArrowRight, Copy, Check } from 'lucide-react';
import contractService from '../../services/contractService';


const CommitTab = ({ domain, status, phase, auctionData, onUpdate, onTabChange }) => {
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showConfirmSecret, setShowConfirmSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userHasBid, setUserHasBid] = useState(false);
  const [userBidAmount, setUserBidAmount] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bufferingSteps, setBufferingSteps] = useState([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [commitPhaseEnded, setCommitPhaseEnded] = useState(false);
  const [checkingBidStatus, setCheckingBidStatus] = useState(true);


  // Get current account and listen for account changes
  useEffect(() => {
    const getAccount = async () => {
      try {
        const account = await contractService.getAccount();
        setCurrentAccount(account);
      } catch (error) {
        setCurrentAccount(null);
      }
    };


    getAccount();


    const handleAccountChange = (accounts) => {
      setUserHasBid(false);
      setUserBidAmount(null);
      setSuccess(false);
      setSuccessData(null);
      setAmount('');
      setSecret('');
      setConfirmSecret('');
      setError(null);
      setShowConfirmation(false);
      setShowSecret(false);
      setShowConfirmSecret(false);
      setBufferingSteps([]);
      setCheckingBidStatus(true);
      getAccount();
    };


    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      };
    }
  }, []);


  // Check if user has already bid
  useEffect(() => {
    const checkUserBid = async () => {
      if (!currentAccount || !domain) {
        setCheckingBidStatus(false);
        setUserHasBid(false);
        setUserBidAmount(null);
        return;
      }


      try {
        setCheckingBidStatus(true);
        const bidInfo = await getMyBid(domain);
        
        const hasCommitment = bidInfo?.commitment && bidInfo.commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000';
        
        if (hasCommitment) {
          setUserHasBid(true);
          const bidAmount = ethers.utils.formatEther(bidInfo.deposit);
          setUserBidAmount(bidAmount);
        } else {
          setUserHasBid(false);
          setUserBidAmount(null);
        }
      } catch (error) {
        setUserHasBid(false);
        setUserBidAmount(null);
      } finally {
        setCheckingBidStatus(false);
      }
    };


    if (currentAccount && domain) {
      checkUserBid();
    }
  }, [domain, currentAccount, phase]);


  // Calculate time left until commit phase ends or reveal phase ends
  useEffect(() => {
    if ((phase !== 'commit' && phase !== 'reveal') || !auctionData?.commitEndTime) return;


    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      
      let endTime;
      
      if (phase === 'commit') {
        endTime = auctionData.commitEndTime;
      } else if (phase === 'reveal') {
        endTime = auctionData.revealEndTime;
      } else {
        return;
      }


      if (endTime.toNumber) {
        endTime = endTime.toNumber();
      } else {
        endTime = parseInt(endTime);
      }


      const difference = endTime - now;


      if (difference <= 0) {
        setTimeLeft(phase === 'commit' ? 'Commit phase ended' : 'Reveal phase ended');
        setCommitPhaseEnded(true);
        return;
      }


      setCommitPhaseEnded(false);
      const minutes = Math.floor(difference / 60);
      const seconds = Math.floor(difference % 60);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };


    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [phase, auctionData?.commitEndTime, auctionData?.revealEndTime]);


  const validateSecret = () => {
    if (!secret) {
      return { valid: false, message: 'Please enter a secret' };
    }
    if (secret.length < 8) {
      return { valid: false, message: 'Secret must be at least 8 characters' };
    }
    if (secret !== confirmSecret) {
      return { valid: false, message: 'Secret confirmation does not match' };
    }
    return { valid: true, message: '' };
  };


  const handleCommit = () => {
    if (!amount) {
      setError('Please enter a bid amount');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('Bid amount must be greater than 0');
      return;
    }
    const secretValidation = validateSecret();
    if (!secretValidation.valid) {
      setError(secretValidation.message);
      return;
    }
    setShowConfirmation(true);
  };


  const handleConfirm = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    
    const isFirstBid = status === 'Expired' || status === 'Available' || !auctionData || auctionData.commitEndTime === 0 || auctionData.commitEndTime === '0';
    
    const steps = isFirstBid 
      ? [
          { step: 'Initialising auction...', completed: false },
          { step: 'Submitting bid...', completed: false },
          { step: 'Confirming transaction...', completed: false },
        ]
      : [
          { step: 'Submitting bid...', completed: false },
          { step: 'Confirming transaction...', completed: false },
        ];
    
    setBufferingSteps(steps);


    try {
      let stepIndex = 0;


      if (isFirstBid) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setBufferingSteps(prev => prev.map((s, i) => i === 0 ? { ...s, completed: true } : s));
        stepIndex = 1;
      }
      
      const result = await commit(domain, amount, secret);


      if (result.success || result.bid) {
        const submitBidIndex = isFirstBid ? 1 : 0;
        setBufferingSteps(prev => prev.map((s, i) => i === submitBidIndex ? { ...s, completed: true } : s));
        stepIndex = submitBidIndex + 1;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBufferingSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, completed: true } : s));
        
        await onUpdate?.();


        setLoading(false);
        setSuccess(true);
        setSuccessData({
          amount: amount,
          secret: secret,
          transactionHash: result.bid?.hash
        });
        setUserHasBid(true);
        setUserBidAmount(amount);
        setAmount('');
        setSecret('');
        setConfirmSecret('');
      } else {
        setLoading(false);
        setBufferingSteps([]);
        setError(result || 'Failed to commit bid');
      }
    } catch (err) {
      setLoading(false);
      setBufferingSteps([]);
      
      if (err.message.includes('Auction does not exist')) {
        setError('Unable to start auction. Please try again.');
      } else if (err.message.includes('ended')) {
        setError('Commit phase has ended');
      } else if (err.message.includes('deposit')) {
        setError('Invalid deposit amount');
      } else if (err.message.includes('committed') || err.message.includes('Already')) {
        setError('You have already committed a bid for this domain');
        setUserHasBid(true);
      } else if (err.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Failed to commit bid. Please try again.');
      }
    }
  };


  const handleCancel = () => {
    setShowConfirmation(false);
  };


  const handleCopySecret = () => {
    navigator.clipboard.writeText(successData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && amount && secret && confirmSecret && !showConfirmation) {
      handleCommit();
    }
  };


  // Show when not in commit/reveal phase and domain is not available or expired
  if (phase !== 'commit' && phase !== 'reveal' && status !== 'Available' && status !== 'Expired') {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not in Commit Phase
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {status === 'Registered' 
                ? 'This domain is already registered.' 
                : `The auction is currently in ${status} phase.`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  // Show when in reveal phase but user did not participate in commit
  if (phase === 'reveal' && !userHasBid && !checkingBidStatus) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">
              Not in Commit Phase
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              You did not participate in the commit phase. You cannot bid in this auction.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  // Show buffering state with steps
  if (loading && bufferingSteps.length > 0) {
    return (
      <Card className="border-gray-400 bg-white">
        <CardContent className="p-10">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-6">Processing Your Bid</h3>
            
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


  // Show success state with secret
  if (success && successData) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-10">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-black">
                Bid Committed Successfully
              </h3>
              <p className="text-sm text-green-700">
                Your sealed bid for {domain} has been committed.
              </p>
            </div>
          </div>


          {phase === 'commit' && timeLeft && !commitPhaseEnded && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">Time Left for Commit Phase</p>
                <p className="text-lg font-bold text-orange-600">{timeLeft}</p>
              </div>
            </div>
          )}


          <div className="space-y-4 mb-6">
            <div className="rounded-lg border border-green-300 bg-white p-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Bid Amount</p>
              <p className="text-lg font-bold text-black">{successData.amount} ETH</p>
            </div>


            {successData.transactionHash && (
              <div className="rounded-lg border border-green-300 bg-white p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Transaction Hash</p>
                <code className="block break-all font-mono text-xs text-black">
                  {successData.transactionHash}
                </code>
              </div>
            )}
          </div>


          <Card className="border-yellow-300 bg-yellow-50 mb-6">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-yellow-800 mb-3">
                Your Secret (Write it down or memorize it!)
              </p>
              <div className="bg-white p-3 rounded border-2 border-yellow-300 mb-3 flex items-center justify-between">
                <code className="font-mono font-bold text-sm text-black">
                  {successData.secret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="ml-3 flex-shrink-0 text-yellow-600 hover:text-yellow-700"
                >
                  {copiedSecret ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-yellow-700 font-semibold">
                Your secret is NOT stored anywhere. You must remember it for the reveal phase!
              </p>
            </CardContent>
          </Card>


          <Card className="border-blue-300 bg-blue-50 mb-6">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">
                You cannot place another bid for this domain in this auction. Wait for the reveal phase.
              </p>
            </CardContent>
          </Card>


          {commitPhaseEnded ? (
            <Button
              className="w-full h-12 text-base bg-black hover:bg-gray-800 text-white"
              onClick={() => onTabChange?.('Reveal')}
            >
              Go to Reveal Phase
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={true}
            >
              Waiting for Reveal Phase
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }


  // Show user's bid summary if they already bid
  if (userHasBid && !checkingBidStatus && currentAccount && (phase === 'commit' || phase === 'reveal' || phase === 'pending_finalize')) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-10">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-black">
                Your Bid Summary
              </h3>
              <p className="text-sm text-green-700">
                You have committed a bid for {domain}.
              </p>
            </div>
          </div>


          {phase === 'commit' && timeLeft && !commitPhaseEnded && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">Time Left to Commit</p>
                <p className="text-lg font-bold text-orange-600">{timeLeft}</p>
              </div>
            </div>
          )}


          <div className="space-y-4 mb-6">
            <div className="rounded-lg border border-green-300 bg-white p-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Your Bid Amount</p>
              <p className="text-lg font-bold text-black">
                {userBidAmount ? `${userBidAmount} ETH` : `${amount} ETH`}
              </p>
            </div>
          </div>


          {phase === 'pending_finalize' && (
            <Card className="border-blue-300 bg-blue-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Auction is pending finalization. The winner will register the domain shortly.
                </p>
              </CardContent>
            </Card>
          )}


          {phase === 'reveal' && (
            <Card className="border-yellow-300 bg-yellow-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Ready to reveal? You'll need your secret to prove your bid. Switch to the Reveal tab when you're ready.
                </p>
              </CardContent>
            </Card>
          )}


          {phase === 'commit' && (
            <Card className="border-yellow-300 bg-yellow-50 mb-6">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Please remember your secret. You'll need it in the reveal phase.
                </p>
              </CardContent>
            </Card>
          )}


          {phase === 'commit' && commitPhaseEnded ? (
            <Button
              className="w-full h-12 text-base bg-black hover:bg-gray-800 text-white"
              onClick={() => onTabChange?.('Reveal')}
            >
              Go to Reveal Phase
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : phase === 'commit' && !commitPhaseEnded ? (
            <Button
              className="w-full"
              disabled={true}
            >
              Waiting for Reveal Phase
            </Button>
          ) : phase === 'reveal' ? (
            <Button
              className="w-full h-12 text-base bg-black hover:bg-gray-800 text-white"
              onClick={() => onTabChange?.('Reveal')}
            >
              Go to Reveal Phase
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }


  // Main form for users who haven't bid yet
  return (
    <Card className="border-gray-300 bg-white">
      <CardHeader>
        <CardTitle className="text-black">Commit Your Bid</CardTitle>
        <CardDescription>Place a sealed bid for {domain}</CardDescription>
      </CardHeader>


      <CardContent>
        <div className="space-y-6">
          {phase === 'commit' && (
            <div className="flex items-center gap-3 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">Time Left for Commit Phase</p>
                <p className="text-lg font-bold text-orange-600">{timeLeft}</p>
              </div>
            </div>
          )}


          {(status === 'Available' || status === 'Expired') && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="flex items-start gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                <p className="text-sm text-green-700">
                  {status === 'Expired' 
                    ? `This domain has expired. Commit a bid to start a new auction for ${domain}`
                    : `Be the first to commit a bid to start the auction for ${domain}`
                  }
                </p>
              </CardContent>
            </Card>
          )}


          {error && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <p className="flex-1 text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}


          <div className="space-y-3">
            <Label htmlFor="bidAmount" className="text-base font-semibold text-black">
              Bid Amount
            </Label>
            <div className="relative">
              <Input
                id="bidAmount"
                type="number"
                placeholder="Enter your bid amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
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


          <div className="space-y-3">
            <Label htmlFor="secret" className="text-base font-semibold text-black">
              Secret (8+ characters)
            </Label>
            <div className="relative">
              <Input
                id="secret"
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
            <p className="text-xs text-gray-600">
              Create a secure secret phrase (minimum 8 characters)
            </p>
          </div>


          <div className="space-y-3">
            <Label htmlFor="confirmSecret" className="text-base font-semibold text-black">
              Confirm Secret
            </Label>
            <div className="relative">
              <Input
                id="confirmSecret"
                type={showConfirmSecret ? 'text' : 'password'}
                placeholder="Re-enter your secret"
                value={confirmSecret}
                onChange={(e) => setConfirmSecret(e.target.value)}
                disabled={loading || showConfirmation}
                className="h-12 border-2 border-gray-300 pr-12"
              />
              <button
                onClick={() => setShowConfirmSecret(!showConfirmSecret)}
                disabled={loading || showConfirmation}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showConfirmSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {secret && confirmSecret && secret === confirmSecret && (
              <p className="text-xs text-green-600">Secrets match</p>
            )}
            {secret && confirmSecret && secret !== confirmSecret && (
              <p className="text-xs text-red-600">Secrets do not match</p>
            )}
          </div>


          <Button
            onClick={handleCommit}
            disabled={loading || !amount || !secret || !confirmSecret || secret !== confirmSecret || showConfirmation}
            className="h-12 w-full text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Committing...
              </>
            ) : (
              'Commit Bid'
            )}
          </Button>
        </div>
      </CardContent>


      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md border-gray-300 bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-black">Confirm Your Bid</CardTitle>
              <CardDescription>Please review your bid details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Domain</p>
                    <p className="text-base font-bold text-black">{domain}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">Bid Amount</p>
                    <p className="text-base font-bold text-black">{amount} ETH</p>
                  </div>
                </div>


                <Card className="border-yellow-300 bg-yellow-50">
                  <CardContent className="flex items-start gap-3 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      Save your secret securely. You'll need it in the reveal phase to prove your bid and potentially win the domain.
                    </p>
                  </CardContent>
                </Card>


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
                    onClick={handleConfirm}
                    className="flex-1 h-10"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm & Commit'
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
};


export default CommitTab;

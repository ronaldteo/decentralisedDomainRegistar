import React, { useState } from 'react';
import { sendEth, domainResolver } from '../../services/contract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

const SendEth = () => {
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [fetchingOwner, setFetchingOwner] = useState(false);

  const handleSendClick = async () => {
    if (!domain || !amount) {
      setError('Please fill in both fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Fetch domain owner
    setFetchingOwner(true);
    try {
      const address = await domainResolver(domain);
      if (!address) {
        setError(`Domain "${domain}" is not registered`);
        setFetchingOwner(false);
        return;
      }
      setOwnerAddress(address);
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error fetching domain owner');
      setError(`Failed to resolve domain. ${err.message}`);
    } finally {
      setFetchingOwner(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      const result = await sendEth(domain, amount);
      
      if (result.success) {
        setSuccess(true);
        setTxHash(result.txn?.hash);
        setDomain('');
        setAmount('');
        setOwnerAddress(null);
      }
    } catch (err) {
      if (err.message.includes('not registered')) {
        setError(`Domain "${domain}" is not registered`);
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient balance to send ETH');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Error sending ETH. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setOwnerAddress(null);
  };

  const handleClear = () => {
    setDomain('');
    setAmount('');
    setError(null);
    setSuccess(false);
    setTxHash(null);
    setOwnerAddress(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && domain && amount && !showConfirmation && !fetchingOwner) {
      handleSendClick();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Send ETH
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Send Ethereum to any registered .ntu domain
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Card className="mb-8 border-green-300 bg-green-50 shadow-lg">
              <CardContent className="p-10">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-black">
                      Successfully sent {amount} ETH to {domain}
                    </h3>
                    <p className="mb-4 text-sm text-green-700">
                      Transaction confirmed on the blockchain
                    </p>
                    <div className="mb-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Transaction Hash</Label>
                      <code className="block break-all rounded-2xl border-2 border-green-300 bg-white p-4 font-mono text-sm leading-relaxed text-black">
                        {txHash}
                      </code>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(txHash);
                          alert('Transaction hash copied to clipboard!');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Copy Hash
                      </Button>
                      <Button
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        View on Etherscan
                      </Button>
                      <Button
                        onClick={handleClear}
                        size="sm"
                      >
                        Send Another
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Card */}
          <Card className="mb-8 border-gray-300 bg-white shadow-lg">
            <CardContent className="p-10">
              <div className="space-y-6">
                {/* Error Message */}
                {error && (
                  <Card className="border-red-300 bg-red-50">
                    <CardContent className="flex items-start gap-3 p-5">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                      <p className="flex-1 text-sm leading-relaxed text-red-700">
                        {error}
                      </p>
                    </CardContent>
                  </Card>
                )}

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
                    onKeyPress={handleKeyPress}
                    disabled={loading || success || showConfirmation || fetchingOwner}
                    className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="sendAmount" className="text-base font-semibold leading-none text-black">
                    Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="sendAmount"
                      type="number"
                      placeholder="0.1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading || success || showConfirmation || fetchingOwner}
                      step="0.001"
                      min="0"
                      className="h-14 border-2 border-gray-300 bg-white pr-20 text-base leading-none text-black placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold leading-none text-gray-600 pointer-events-none">
                      ETH
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSendClick}
                  disabled={loading || !domain || !amount || success || showConfirmation || fetchingOwner}
                  className="h-14 w-full text-base leading-none"
                  size="lg"
                >
                  {fetchingOwner ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying Domain...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send ETH'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <Card className="w-full max-w-md border-gray-300 bg-white shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-black">Confirm Transaction</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Please review the details before sending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Transaction Details */}
                    <div className="space-y-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6">
                      {/* Recipient Domain */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Recipient Domain</p>
                        <p className="text-lg font-bold text-black">{domain}</p>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Domain Owner Address</p>
                        <code className="block break-all rounded-lg border border-gray-300 bg-white p-3 font-mono text-xs leading-relaxed text-black">
                          {ownerAddress}
                        </code>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-600 mb-1">Amount to Send</p>
                        <p className="text-lg font-bold text-black">{amount} ETH</p>
                      </div>
                    </div>

                    {/* Warning */}
                    <Card className="border-yellow-300 bg-yellow-50">
                      <CardContent className="flex items-start gap-3 p-4">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-700">
                          Please verify the recipient address. Transactions cannot be undone.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1 h-12"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        className="flex-1 h-12"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Confirm & Send'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendEth;

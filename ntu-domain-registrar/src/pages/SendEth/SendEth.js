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

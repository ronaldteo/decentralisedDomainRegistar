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

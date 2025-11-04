import React, { useState } from 'react';
import { addressResolver, domainResolver } from '../../services/contract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';


const DomainResolver = () => {
  const [mode, setMode] = useState('domain');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const validateDomain = (domain) => {
    // Check if domain ends with .ntu
    if (!domain.endsWith('.ntu')) {
      return { valid: false, message: 'Invalid domain name. Only .ntu domains are allowed.' };
    }

    // Check for blank domain (just .ntu)
    if (domain === '.ntu') {
      return { valid: false, message: 'Invalid domain name. Domain cannot be blank.' };
    }

    // Check if domain name before .ntu is empty
    const domainName = domain.slice(0, -4); // Remove .ntu
    if (domainName.trim() === '') {
      return { valid: false, message: 'Invalid domain name. Domain cannot be blank.' };
    }

    // Count occurrences of .ntu
    const ntuCount = (domain.match(/\.ntu/g) || []).length;
    if (ntuCount > 1) {
      return { valid: false, message: 'Invalid domain name. Only one .ntu extension is allowed.' };
    }

    return { valid: true };
  };


  const validateAddress = (address) => {
    // Check if address is empty
    if (!address || address.trim() === '') {
      return { valid: false, message: 'Please enter an Ethereum address.' };
    }

    // Check if address starts with 0x
    if (!address.startsWith('0x')) {
      return { valid: false, message: 'Invalid address format. Ethereum addresses must start with 0x.' };
    }

    // Check if address is 42 characters long (0x + 40 hex characters)
    if (address.length !== 42) {
      return { valid: false, message: 'Invalid address format.' };
    }

    // Check if all characters after 0x are valid hex
    const hexPart = address.slice(2);
    if (!/^[0-9a-fA-F]{40}$/.test(hexPart)) {
      return { valid: false, message: 'Invalid address format.' };
    }

    return { valid: true };
  };


  const handleResolve = async () => {
    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }
    
    // Validate input format
    if (mode === 'domain') {
      const validation = validateDomain(input.trim());
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
    } else {
      const validation = validateAddress(input.trim());
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (mode === 'domain') {
        // Resolve domain to address
        const address = await domainResolver(input.trim());
        
        // Check if address is null, undefined, empty, or zero address
        if (!address || 
            address === '' || 
            address === '0x0000000000000000000000000000000000000000') {
          // Domain not registered
          setResult({
            type: 'notRegistered',
            query: input.trim(),
            success: false
          });
        } else {
          // Domain is registered with valid owner
          setResult({ 
            type: 'address', 
            value: address,
            query: input.trim(),
            success: true
          });
        }
      } else {
        // Resolve address to domain
        const domain = await addressResolver(input.trim());
        
        // Check if domain is null, undefined, or empty
        if (domain && domain !== '' && domain.trim() !== '') {
          setResult({ 
            type: 'domain', 
            value: domain,
            query: input.trim(),
            success: true
          });
        } else {
          // No domain found
          setResult({
            type: 'notFound',
            query: input.trim(),
            success: false
          });
        }
      }
    } catch (err) {
      console.error('Resolution error:', err);
      
      // If any error occurs for domain resolution, show not registered
      if (mode === 'domain') {
        setResult({
          type: 'notRegistered',
          query: input.trim(),
          success: false
        });
      } else {
        // For address resolution, show not found
        setResult({
          type: 'notFound',
          query: input.trim(),
          success: false
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleResolve();
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Domain Resolver
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Resolve domain names to addresses or find the domain owned by an address
            </p>
          </div>
          
          <Card className="mb-8 border-gray-300 bg-white shadow-lg">
            <CardContent className="p-10">
              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex gap-2 rounded-2xl border-2 border-gray-300 bg-gray-100 p-2">
                  <button
                    onClick={() => {
                      setMode('domain');
                      handleClear();
                    }}
                    className={`flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-medium leading-none transition-all ${
                      mode === 'domain'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Domain to Address
                  </button>
                  <button
                    onClick={() => {
                      setMode('address');
                      handleClear();
                    }}
                    className={`flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-medium leading-none transition-all ${
                      mode === 'address'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Address to Domain
                  </button>
                </div>


                {/* Input Field */}
                <div className="space-y-3">
                  <Label htmlFor="resolveInput" className="text-base font-semibold leading-none text-black">
                    {mode === 'domain' ? 'Domain Name' : 'Ethereum Address'}
                  </Label>
                  <Input
                    id="resolveInput"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={mode === 'domain' ? 'example.ntu' : '0x000...'}
                    className="h-14 border-2 border-gray-300 bg-white text-base leading-none text-black placeholder:text-gray-500"
                  />
                  {mode === 'domain' ? (
                    <p className="text-sm text-gray-600">
                      Only .ntu domains are supported
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Enter a valid Ethereum address
                    </p>
                  )}
                </div>


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


                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleResolve}
                    disabled={loading || !input.trim()}
                    className="h-14 flex-1 text-base leading-none"
                    size="lg"
                  >
                    {loading ? 'Resolving...' : 'Resolve'}
                  </Button>
                  {(result || error) && (
                    <Button 
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-6 text-base leading-none"
                      size="lg"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Result Card - Domain to Address Success */}
          {result && result.success && result.type === 'address' && (
            <Card className="border-gray-300 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">Resolution Successful</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Address for {result.query}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    Owner Address
                  </Label>
                  <code className="block break-all rounded-2xl border-2 border-gray-300 bg-gray-50 p-5 font-mono text-sm leading-relaxed text-black">
                    {result.value}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(result.value);
                        alert('Address copied to clipboard!');
                      }}
                      className="text-sm"
                    >
                      Copy Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`https://sepolia.etherscan.io/address/${result.value}`, '_blank');
                      }}
                      className="text-sm"
                    >
                      View on Etherscan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Result Card - Address to Domain Success */}
          {result && result.success && result.type === 'domain' && (
            <Card className="border-gray-300 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">Resolution Successful</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Primary domain for {result.query.slice(0, 10)}...{result.query.slice(-8)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    Primary Domain
                  </Label>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-300 bg-gray-50 px-5 py-4">
                    <span className="flex-1 text-lg font-semibold leading-none text-black">
                      {result.value}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/domain/${result.value}`;
                      }}
                      className="text-sm"
                    >
                      View Domain
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Result Card - Domain Not Registered Unsuccessful */}
          {result && !result.success && result.type === 'notRegistered' && (
            <Card className="border-gray-300 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full bg-gray-100 p-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">Resolution Unsuccessful</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Domain is not registered
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-gray-300 bg-gray-50 p-5">
                    <p className="mb-2 text-sm font-medium text-gray-600">Domain</p>
                    <p className="text-lg font-semibold text-black">{result.query}</p>
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    This domain is not currently registered. Visit the domain profile to register it through our auction system.
                  </p>
                  <Button
                    onClick={() => {
                      window.location.href = `/domain/${result.query}`;
                    }}
                    className="h-12 w-full text-base leading-none"
                  >
                    View Domain Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Result Card - Address Not Found Unsuccessful */}
          {result && !result.success && result.type === 'notFound' && (
            <Card className="border-gray-300 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full bg-gray-100 p-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">Resolution Unsuccessful</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      No domain associated with this address
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-gray-300 bg-gray-50 p-5">
                    <p className="mb-2 text-sm font-medium text-gray-600">Address</p>
                    <p className="text-lg font-semibold text-black break-all">{result.query}</p>
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    This address does not have any registered domains in the .ntu registry. Start by registering a domain through our auction system.
                  </p>
                  <Button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="h-12 w-full text-base leading-none"
                  >
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};


export default DomainResolver;

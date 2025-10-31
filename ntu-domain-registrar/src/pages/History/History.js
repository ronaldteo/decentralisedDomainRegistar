import React, { useState, useEffect } from 'react';
import { allDomains } from '../../services/contract';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, AlertCircle, ExternalLink, Copy } from 'lucide-react';

const History = () => {
  const [domains, setDomains] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => {
    loadAllDomains();
  }, []);

  const loadAllDomains = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await allDomains();
      
      if (Array.isArray(result) && result.length === 2) {
        setDomains(result[0]);
        setAddresses(result[1]);
      } else if (result.domains && result.addresses) {
        setDomains(result.domains);
        setAddresses(result.addresses);
      } else {
        setDomains([]);
        setAddresses([]);
      }
    } catch (err) {
      console.error('Error loading domains:', err);
      setError('Failed to load domain history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewDomain = (domain) => {
    window.location.href = `/domain/${domain}`;
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const openEtherscan = (address) => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
                Domain History
              </h1>
              <p className="text-xl leading-relaxed text-gray-600">
                View all registered .ntu domains
              </p>
            </div>
            <div className="flex items-center justify-center rounded-3xl border-2 border-gray-300 bg-white p-20 shadow-sm">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-black" />
                <p className="mt-4 text-base text-gray-600">Loading domains...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
                Domain History
              </h1>
              <p className="text-xl leading-relaxed text-gray-600">
                View all registered .ntu domains
              </p>
            </div>
            <Card className="border-red-300 bg-red-50 shadow-sm">
              <CardContent className="flex items-start gap-4 p-10">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-black">{error}</h3>
                  <Button onClick={loadAllDomains} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Domain History
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              View all registered .ntu domains
            </p>
          </div>

          {/* Stats Card */}
          <Card className="mb-8 border-gray-300 bg-white shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-black to-gray-800">
                  <span className="text-2xl font-bold text-white">{domains.length}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Domains Registered</p>
                  <p className="text-base text-gray-700">Active in the .ntu registry</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domains List */}
          {domains.length === 0 ? (
            <Card className="border-gray-300 bg-white shadow-lg">
              <CardContent className="flex items-center justify-center p-20">
                <div className="text-center">
                  <p className="text-lg font-semibold text-black">No domains registered yet</p>
                  <p className="mt-2 text-gray-600">Start registering domains to see them here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-300 bg-white shadow-lg overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  {/* Header */}
                  <thead className="border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-8 py-5 text-left">
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Domain Name</span>
                      </th>
                      <th className="px-8 py-5 text-left">
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Owner Address</span>
                      </th>
                      <th className="px-8 py-5 text-left">
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Action</span>
                      </th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="divide-y divide-gray-200">
                    {domains.map((domain, index) => {
                      const address = addresses[index];
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* Domain Name */}
                          <td className="px-8 py-5">
                            <p className="text-base font-bold text-black">{domain}</p>
                          </td>

                          {/* Owner Address */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                                {address}
                              </code>
                              <button
                                onClick={() => copyAddress(address)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copy address"
                              >
                                <Copy className={`h-4 w-4 ${copiedAddress === address ? 'text-green-600' : 'text-gray-400'}`} />
                              </button>
                              <button
                                onClick={() => openEtherscan(address)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="View on Etherscan"
                              >
                                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-black" />
                              </button>
                            </div>
                          </td>

                          {/* View Domain Button */}
                          <td className="px-8 py-5 text-left">
                            <Button
                              onClick={() => viewDomain(domain)}
                              size="sm"
                              className="text-sm"
                            >
                              View Domain
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-200">
                  {domains.map((domain, index) => {
                    const address = addresses[index];
                    
                    return (
                      <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Domain</p>
                          <p className="text-base font-bold text-black">{domain}</p>
                        </div>
                        <div className="mb-4 space-y-2">
                          <p className="text-sm text-gray-600">Owner</p>
                          <div className="flex items-center gap-2">
                            <code className="break-all text-xs font-mono text-gray-700 bg-gray-50 rounded-lg px-3 py-2 flex-1">
                              {address}
                            </code>
                            <button
                              onClick={() => copyAddress(address)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Copy className={`h-4 w-4 ${copiedAddress === address ? 'text-green-600' : 'text-gray-400'}`} />
                            </button>
                            <button
                              onClick={() => openEtherscan(address)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                            >
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={() => viewDomain(domain)}
                          size="sm"
                          className="w-full text-sm"
                        >
                          View Domain
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Pagination Info */}
          {domains.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">
                Total <span className="font-semibold text-black">{domains.length}</span> domain{domains.length !== 1 ? 's' : ''} registered
              </p>
              <Button
                variant="outline"
                onClick={loadAllDomains}
                className="h-12 px-8 border-2"
              >
                Refresh List
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

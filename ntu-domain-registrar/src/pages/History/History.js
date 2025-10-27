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

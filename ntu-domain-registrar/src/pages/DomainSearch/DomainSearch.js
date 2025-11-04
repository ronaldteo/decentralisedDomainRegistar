import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const DomainSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const validateDomain = (domain) => {
    // Check if empty
    if (!domain || domain.trim() === '') {
      return { valid: false, message: 'Please enter a domain name' };
    }

    // Check if ends with .ntu
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

    return { valid: true, message: '' };
  };

  const handleSearch = () => {
    const validation = validateDomain(searchQuery);
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    // Navigate to domain details page
    window.location.href = `/domain/${searchQuery}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Find Your Domain
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Search for available .ntu domains and participate in decentralised auctions
            </p>
          </div>

          <Card className="border-gray-300 bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="example.ntu"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="h-14 border-2 border-gray-300 text-base"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                    <p className="flex-1 text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  className="h-12 w-full text-base"
                  size="lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Domain
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DomainSearch;

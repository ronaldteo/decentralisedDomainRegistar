import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const DomainSearch = () => {
  const navigate = useNavigate();

  const handleSearch = (domain) => {
    navigate(`/domain/${domain}`);
  };

  const steps = [
    { number: 1, title: 'Search', description: 'Find your desired domain name' },
    { number: 2, title: 'Bid', description: 'Place your sealed bid in auction' },
    { number: 3, title: 'Own', description: 'Win and claim your domain' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="mb-5 text-6xl font-bold leading-tight tracking-tight text-black">
              Find Your Domain
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Search for available .ntu domains and participate in decentralized auctions
            </p>
          </div>
          
          <Card className="mb-12 border-gray-300 bg-white shadow-lg">
            <CardContent className="p-10">
              <SearchBar onSearch={handleSearch} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DomainSearch;

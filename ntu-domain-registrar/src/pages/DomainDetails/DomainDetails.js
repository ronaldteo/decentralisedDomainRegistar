import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import contractService from '../../services/contractService';
import TabPanel from '../../components/common/TabPanel';
import OwnedTab from './OwnedTab';
import CommitTab from './CommitTab';
import RevealTab from './RevealTab';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const DomainDetails = () => {
  const { domain } = useParams();
  const [activeTab, setActiveTab] = useState('Owned');
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomainData();
  }, [domain]);

  const loadDomainData = async () => {
    setLoading(true);
    try {
      const available = await contractService.isDomainAvailable(domain);
      const owner = !available ? await contractService.resolveDomain(domain) : null;
      const auctionInfo = await contractService.getAuctionInfo(domain);
      
      setDomainData({ 
        available: available !== false,
        owner, 
        auctionInfo 
      });
    } catch (error) {
      console.error('Error loading domain:', error);
      setDomainData({ 
        available: true, 
        owner: null, 
        auctionInfo: null 
      });
    }
    setLoading(false);
  };

  const getStatusInfo = () => {
    if (!domainData) return { label: 'Available', color: 'green' };
    
    const phase = domainData.auctionInfo?.phase;
    
    if (!domainData.available) {
      return { 
        label: 'Registered', 
        color: 'black' 
      };
    }
    
    if (phase === 'commit') {
      return { 
        label: 'In Commit Phase', 
        color: 'orange' 
      };
    }
    
    if (phase === 'reveal') {
      return { 
        label: 'In Reveal Phase', 
        color: 'orange' 
      };
    }
    
    return { 
      label: 'Available', 
      color: 'green' 
    };
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-black hover:bg-gray-100"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="leading-none">Back to search</span>
          </Button>

          <Card className="border-gray-300 bg-white">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-3 text-3xl leading-tight text-black">{domain}</CardTitle>
                  <Badge 
                    className={`leading-none ${
                      statusInfo.color === 'green' 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : statusInfo.color === 'orange'
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <TabPanel 
                tabs={['Owned', 'Commit', 'Reveal']} 
                activeTab={activeTab} 
                onChange={setActiveTab} 
              />
              
              <div className="mt-8">
                {activeTab === 'Owned' && <OwnedTab domainData={domainData} />}
                {activeTab === 'Commit' && <CommitTab domain={domain} domainData={domainData} onUpdate={loadDomainData} />}
                {activeTab === 'Reveal' && <RevealTab domain={domain} domainData={domainData} onUpdate={loadDomainData} />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DomainDetails;

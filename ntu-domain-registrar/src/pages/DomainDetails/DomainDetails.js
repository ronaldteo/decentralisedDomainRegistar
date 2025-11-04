import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { domainResolver, auctionInfo, getDomainExpiryDate } from '../../services/contract';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import TabPanel from '../../components/common/TabPanel';
import OwnedTab from './OwnedTab';
import CommitTab from './CommitTab';
import RevealTab from './RevealTab';


const DomainDetails = () => {
  const { domain } = useParams();
  const [activeTab, setActiveTab] = useState('Owned');
  const [status, setStatus] = useState('Available');
  const [owner, setOwner] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [expiryData, setExpiryData] = useState(null);


  useEffect(() => {
    loadDomainStatus();
  }, [domain]);


  //check if commit or reveal phase and refresh when phase ends
  useEffect(() => {
    if (!phase || phase === 'pending_finalize' || !auctionData) return;

    const endTime = phase === 'commit' ? auctionData.commitEndTime : auctionData.revealEndTime;
    const normalizedEndTime = endTime?.toNumber?.() ?? parseInt(endTime);
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= normalizedEndTime) {
        loadDomainStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, auctionData]);


  //refresh when Owned tab is clicked
  useEffect(() => {
    if (activeTab === 'Owned') {
      loadDomainStatus();
    }
  }, [activeTab]);


  //normalize timestamps
  const normalizeTimestamp = (time) => time?.toNumber?.() ?? parseInt(time);

  const loadDomainStatus = async () => {
    setLoading(true);
    let expiryInfo = null;
    try {
      const now = Math.floor(Date.now() / 1000);

      //check if domain is registered
      try {
        const address = await domainResolver(domain);
        if (address && address !== '0x0000000000000000000000000000000000000000' && address !== null) {
          try {
            expiryInfo = await getDomainExpiryDate(domain); //fetch expiry data
          } catch (error) {
            // Continue
          }
          
          setStatus('Registered');
          setOwner(address);
          setPhase(null);
          setAuctionData(null);
          setExpiryData(expiryInfo);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log("Domain not active or expired");
      }

      // Check expiry
      let isExpired = false;
      try {
        expiryInfo = await getDomainExpiryDate(domain);
        if (expiryInfo?.isExpired) {
          isExpired = true;
        }
      } catch (error) {
        console.log("Could not check expiry");
      }

      //get auction info
      let auction = null;
      try {
        auction = await auctionInfo(domain);
      } catch (error) {
        console.log("Could not get auction info");
      }

      // Check if auction exists and is valid
      const hasActiveAuction = auction && auction.commitEndTime !== 0 && auction.commitEndTime !== '0' && !(auction.commitEndTime.toNumber ? auction.commitEndTime.toNumber() === 0 : parseInt(auction.commitEndTime) === 0);

      // If auction exists, prioritize it over expiry status
      if (hasActiveAuction) {
        const commitEndTime = normalizeTimestamp(auction.commitEndTime);
        const revealEndTime = normalizeTimestamp(auction.revealEndTime);
        const highestBidValue = parseFloat(ethers.utils.formatEther(auction.highestBid));

        setAuctionData(auction);
        setExpiryData(expiryInfo);

        // Check if reveal phase ended with 0 bid (failed auction)
        if (now >= revealEndTime && highestBidValue === 0) {
          //auction ended with no winner - treat as available/expired
          if (isExpired) {
            setStatus('Expired');
            setPhase(null);
          } else {
            setStatus('Available');
            setPhase(null);
          }
        } else if (now < commitEndTime) {
          setStatus('In Commit Phase');
          setPhase('commit');
        } else if (now < revealEndTime) {
          setStatus('In Reveal Phase');
          setPhase('reveal');
        } else if (revealEndTime !== 0 && !auction.finalized) {
          setStatus('Pending Finalisation');
          setPhase('pending_finalize');
        } else {
          if (isExpired) {
            setStatus('Expired');
          } else {
            setStatus('Available');
          }
          setPhase(null);
        }

        setOwner(null);
        setLoading(false);
        return;
      }

      // No active auction - check expiry status
      if (isExpired) {
        setStatus('Expired');
        setOwner(null);
        setPhase(null);
        setAuctionData(null);
        setExpiryData(expiryInfo);
      } else {
        setStatus('Available');
        setOwner(null);
        setPhase(null);
        setAuctionData(null);
        setExpiryData(null);
      }

      setLoading(false);
    } catch (error) {
      setStatus('Available');
      setOwner(null);
      setPhase(null);
      setAuctionData(null);
      setExpiryData(null);
      setLoading(false);
    }
  };


  const getStatusBadgeColor = () => {
    const colors = {
      'Registered': 'bg-black text-white hover:bg-gray-800',
      'Available': 'bg-green-600 text-white hover:bg-green-700',
      'Expired': 'bg-red-600 text-white hover:bg-red-700',
      'In Commit Phase': 'bg-orange-500 text-white hover:bg-orange-600',
      'In Reveal Phase': 'bg-orange-600 text-white hover:bg-blue-700',
      'Pending Finalisation': 'bg-yellow-600 text-white hover:bg-yellow-700',
    };
    return colors[status] || 'bg-gray-600 text-white hover:bg-gray-700';
  };


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
                  <CardTitle className="mb-3 text-3xl leading-tight text-black">
                    {domain}
                  </CardTitle>
                  <Badge className={`leading-none ${getStatusBadgeColor()}`}>
                    {status}
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
                {activeTab === 'Owned' && (
                  <OwnedTab 
                    domain={domain}
                    expiryData={expiryData}
                    domainData={{
                      available: status === 'Available',
                      registered: status === 'Registered',
                      expired: status === 'Expired',
                      owner: owner,
                      phase: phase,
                      auctionData: auctionData
                    }}
                  />
                )}
                {activeTab === 'Commit' && (
                  <CommitTab 
                    domain={domain}
                    status={status}
                    phase={phase}
                    auctionData={auctionData}
                    onUpdate={loadDomainStatus}
                    onTabChange={setActiveTab}
                  />
                )}
                {activeTab === 'Reveal' && (
                  <RevealTab 
                    domain={domain}
                    status={status}
                    phase={phase}
                    auctionData={auctionData}
                    onUpdate={loadDomainStatus}
                    onTabChange={setActiveTab}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default DomainDetails;

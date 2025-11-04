import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';


const OwnedTab = ({ domain, domainData, expiryData }) => {
  //simplified BigNumber formatting
  const formatBigNumber = (value) => {
    if (!value) return '0';
    try {
      if (value._isBigNumber || ethers.BigNumber.isBigNumber(value)) {
        return ethers.utils.formatEther(value);
      }
      return value.toString();
    } catch {
      return value.toString();
    }
  };


  //Format date and time
  const formatExpiryDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };


  //card component
  const StatusCard = ({ icon: Icon, bgColor, borderColor, title, description, data }) => (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardContent className="flex items-start gap-4 p-6">
        <div className={`flex items-center justify-center rounded-full p-3 ${
          bgColor.includes('orange') ? 'bg-orange-100' :
          bgColor.includes('yellow') ? 'bg-yellow-100' :
          bgColor.includes('red') ? 'bg-white' :
          'bg-white shadow-sm'
        }`}>
          <Icon className={`h-6 w-6 ${
            bgColor.includes('orange') ? 'text-orange-600' :
            bgColor.includes('yellow') ? 'text-yellow-600' :
            'text-black'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold leading-tight text-black">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
          {data && (
            <div className={`mt-4 rounded-lg border p-3 ${
              bgColor.includes('orange') ? 'border-orange-300 bg-white' :
              bgColor.includes('yellow') ? 'border-yellow-300 bg-white' :
              'border-gray-300 bg-white'
            }`}>
              {data}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );


  // Available state
  if (domainData?.available && !domainData?.phase) {
    return (
      <StatusCard
        icon={CheckCircle2}
        bgColor="bg-gray-50"
        borderColor="border-gray-300"
        title="Domain Available"
        description="This domain is available for auction. Switch to the Commit tab to place your bid."
      />
    );
  }


  // Commit phase state
  if (domainData?.phase === 'commit') {
    const bidData = domainData?.auctionData?.highestBid > 0 && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Current Highest Bid</p>
        <p className="text-sm font-bold text-black">{formatBigNumber(domainData.auctionData.highestBid)} ETH</p>
      </div>
    );


    return (
      <StatusCard
        icon={Clock}
        bgColor="bg-orange-50"
        borderColor="border-gray-300"
        title="Auction in Commit Phase"
        description="This domain is currently in the commit phase. Place your sealed bid in the Commit tab to participate in the auction."
        data={bidData}
      />
    );
  }


  // Reveal phase state
  if (domainData?.phase === 'reveal') {
    const bidData = domainData?.auctionData?.highestBid > 0 && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Current Highest Bid</p>
        <p className="text-sm font-bold text-black">{formatBigNumber(domainData.auctionData.highestBid)} ETH</p>
      </div>
    );


    return (
      <StatusCard
        icon={Clock}
        bgColor="bg-orange-50"
        borderColor="border-gray-300"
        title="Auction in Reveal Phase"
        description="The commit phase has ended. Switch to the Reveal tab to reveal your bid and compete for the domain."
        data={bidData}
      />
    );
  }


  // Pending finalization state
  if (domainData?.phase === 'pending_finalize') {
    const bidData = domainData?.auctionData && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Winning Bid</p>
        <p className="text-sm font-bold text-black">{formatBigNumber(domainData.auctionData.highestBid)} ETH</p>
      </div>
    );


    return (
      <StatusCard
        icon={AlertCircle}
        bgColor="bg-yellow-50"
        borderColor="border-gray-300"
        title="Auction Pending Finalisation"
        description="The reveal phase has ended. Awaiting winning bidder to finalise the auction and complete the domain registration."
        data={bidData}
      />
    );
  }


  // Registered state
  if (domainData?.registered && expiryData) {
    const isExpired = expiryData.isExpired || false;
    const { date, time } = formatExpiryDate(expiryData.expiryDate);


    return (
      <Card className="border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-sm uppercase leading-none tracking-wide text-black">
            Owner Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <CardDescription className="text-sm leading-relaxed text-gray-600">Address</CardDescription>
            <code className="block break-all rounded-2xl border-2 border-gray-300 bg-gray-50 p-5 font-mono text-sm leading-relaxed text-black">
              {domainData?.owner}
            </code>
          </div>


          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CardDescription className="text-sm leading-relaxed text-gray-600">Expiry Date</CardDescription>
            </div>
            <div className={`rounded-2xl border-2 p-5 ${isExpired ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-black'}`}>
                {date}
              </p>
              <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                {time}
              </p>
              {isExpired && (
                <span className="mt-2 inline-block px-3 py-1 rounded-full bg-red-200 text-xs font-semibold text-red-700">
                  Expired
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  // Expired state
  // Expired state
  if (domainData?.expired) {
    const { date, time } = expiryData ? formatExpiryDate(expiryData.expiryDate) : { date: 'N/A', time: 'N/A' };
    
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">Domain Expired</h3>
            
            <div className="space-y-3 mt-4">
              <p className="text-sm leading-relaxed text-gray-600">
                This domain has expired and is now available for auction.<br></br>
                Switch to the Commit tab to place your bid and start a new auction.
              </p>

              {expiryData && (
                <div className="rounded-lg border border-red-300 bg-white p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Expired on</p>
                  <p className="text-sm font-semibold text-red-600">{date}</p>
                  <p className="text-xs text-gray-600">{time}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  return null;
};


export default OwnedTab;

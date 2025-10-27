import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const OwnedTab = ({ domainData }) => {
  if (domainData?.available) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold leading-tight text-black">Domain Available</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              This domain is available for auction. Switch to the Commit tab to place your bid.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-300 bg-white">
      <CardHeader>
        <CardTitle className="text-sm uppercase leading-none tracking-wide text-black">
          Owner Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <CardDescription className="text-sm leading-relaxed text-gray-600">Address</CardDescription>
          <code className="block break-all rounded-2xl border-2 border-gray-300 bg-gray-50 p-5 font-mono text-sm leading-relaxed text-black">
            {domainData?.owner}
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnedTab;

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const TabPanel = ({ tabs, activeTab, onChange }) => {
  return (
    <Tabs className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            active={activeTab === tab}
            onClick={() => onChange(tab)}
            className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-black"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabPanel;

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const TabPanel = ({ tabs, activeTab, onChange }) => {
  return (
    <Tabs className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            active={activeTab === tab}
            onClick={() => onChange(tab)}
            className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:scale-95"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabPanel;

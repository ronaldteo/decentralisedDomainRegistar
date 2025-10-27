import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="flex w-full gap-3" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for domain (e.g. mydomain.ntu)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 border-2 border-gray-300 bg-white pr-12 text-base leading-none text-black placeholder:text-gray-500"
        />
        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>
      <Button type="submit" size="lg" className="h-14 px-8 text-base leading-none">
        Search
      </Button>
    </form>
  );
};

export default SearchBar;

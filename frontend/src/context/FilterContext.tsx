// context/FilterContext.tsx
import React, { createContext, useContext, useState } from 'react';

export const FilterContext = createContext<any>(null);

export const FilterContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState({
    region: '',
    corridor: '',
    startDate: '',
    endDate: ''
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);

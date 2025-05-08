// File: components/BaseDashboard.tsx
import React, { useState, useEffect } from 'react';
import { FilterContextProvider } from '../../../context/FilterContext';
import FilterSidebar from '../../FilterSidebar';
import Header from '../../Header';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const BaseDashboard: React.FC<Props> = ({ title, children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = title || 'Dashboard';
  }, [title]);

  return (
    <FilterContextProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 border-r">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Header title={title || 'Dashboard'} />

          {isLoading && (
            <div className="text-center text-gray-500 my-6">Loading...</div>
          )}

          <div className="p-4">{children}</div>
        </main>
      </div>
    </FilterContextProvider>
  );
};

export default BaseDashboard;

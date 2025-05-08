import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { FilterParams } from '../types/api.types';

// This component would typically connect to your application state/redux
// to display the currently active filters

interface FilterChipListProps {
  onFilterChange: (newFilter: Partial<FilterParams>) => void;
  activeFilters: FilterParams;
}

const FilterChipList: React.FC<FilterChipListProps> = ({ onFilterChange, activeFilters }) => {
  // Convert activeFilters to display format
  const displayFilters = [
    { key: 'zone_Group', value: activeFilters.zone_Group, label: `Region: ${activeFilters.zone_Group}` },
    { key: 'dateRange', value: activeFilters.dateRange.toString(), label: `Date Range: Last 12 Months` },
    { key: 'timePeriod', value: activeFilters.timePeriod.toString(), label: `Time Period: All Day` }
  ];

  const handleDelete = (key: string) => {
    // Handle filter removal based on key
    switch (key) {
      case 'zone_Group':
        // Reset zone_Group to default or prompt user to select new region
        break;
      case 'dateRange':
        // Reset dateRange to default
        onFilterChange({ dateRange: 4 });
        break;
      case 'timePeriod':
        // Reset timePeriod to default
        onFilterChange({ timePeriod: 4 });
        break;
      default:
        break;
    }
  };

  if (displayFilters.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, padding: 2, alignItems: 'center' }}>
      <Typography variant="body2" sx={{ marginRight: 1 }}>
        Active Filters:
      </Typography>
      {displayFilters.map((filter) => (
        <Chip
          key={filter.key}
          label={filter.label}
          onDelete={() => handleDelete(filter.key)}
          color="primary"
          variant="outlined"
          size="small"
        />
      ))}
    </Box>
  );
};

export default FilterChipList; 
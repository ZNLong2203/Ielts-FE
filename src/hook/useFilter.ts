import { useState, useMemo } from 'react';

export const useFilter = <T extends Record<string, any>>(
  data: T[],
  filterFields: string[]
) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const hasActiveFilters = Object.values(filters).some(value => 
      value && value.trim() !== ''
    );
    
    if (!hasActiveFilters) return data;

    return data.filter((item) => {
      return filterFields.every((field) => {
        const filterValue = filters[field];
        
        if (!filterValue || filterValue.trim() === '') return true;
        
        const itemValue = item[field];
        const normalizedFilter = filterValue.toLowerCase().trim();
        
        // Handle null/undefined/empty values
        if (itemValue == null || itemValue === '') {
          // Allow searching for null values with specific keywords
          const nullKeywords = ['null', 'empty', 'none', 'n/a', 'missing'];
          return nullKeywords.some(keyword => 
            normalizedFilter.includes(keyword)
          );
        }
        
        // Normal string comparison for non-null values
        const normalizedItem = String(itemValue).toLowerCase();
        return normalizedItem.includes(normalizedFilter);
      });
    });
  }, [data, filters, filterFields]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleClose = () => {
    setIsFilterVisible(false);
  };

  return {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  };
};
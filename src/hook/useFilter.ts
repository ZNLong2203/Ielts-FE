import { useState, useMemo } from "react";

export const useFilter = (data: any[], fields: string[]) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleClose = () => {
    setIsFilterVisible(false);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      fields.every((field) => {
        const filterValue = filters[field] || "";
        return item[field]
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    );
  }, [data, filters, fields]);

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

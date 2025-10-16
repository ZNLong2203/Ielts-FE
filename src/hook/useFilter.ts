import { useState, useMemo } from "react";

interface FilterState {
  [key: string]: string;
}

export const useFilter = <T extends Record<string, any>>(
  data: T[],
  filterFields: string[]
) => {
  const initialFilters: FilterState = {};
  filterFields.forEach((field) => {
    initialFilters[field] = "";
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleClose = () => {
    setIsFilterVisible(false);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === "") return true;

        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;

        // Handle price filtering
        if (
          key === "price" ||
          key === "final_amount" ||
          key === "combo_price" && value
        ) {
          const price = Number(itemValue) || 0;

          switch (value) {
            case "free":
              return price === 0;
            case "under_500k":
              return price > 0 && price < 500000;
            case "500k_1m":
              return price >= 500000 && price <= 1000000;
            case "1m_2m":
              return price > 1000000 && price <= 2000000;
            case "2m_5m":
              return price > 2000000 && price <= 5000000;
            case "over_5m":
              return price > 5000000;
            default:
              return true;
          }
        }

        // Handle boolean filtering for is_featured
        if (key === "is_featured" && value) {
          return itemValue.toString() === value;
        }

        // Handle date filtering
        if (key === "created_at" && value) {
          const now = new Date();
          const itemDate = new Date(itemValue);

          switch (value) {
            case "7d":
              return (
                itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              );
            case "30d":
              return (
                itemDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              );
            case "3m":
              return (
                itemDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
              );
            case "6m":
              return (
                itemDate >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
              );
            case "1y":
              return (
                itemDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
              );
            case "1y+":
              return (
                itemDate < new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
              );
            default:
              return true;
          }
        }

        // For exact match filters (status, role, location, difficulty_level)
        if (["status", "role", "location", "difficulty_level"].includes(key)) {
          return itemValue.toString().toLowerCase() === value.toLowerCase();
        }

        // For text search filters (name, email, phone, title, skill_focus)
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

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

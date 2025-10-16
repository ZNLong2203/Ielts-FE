"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface FilterState {
  [key: string]: string;
}

interface SelectOption {
  label: string;
  value: string;
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type: "input" | "select" | "multiselect";
  options?: SelectOption[];
}

interface FilterProps {
  filters: FilterState;
  onFilterChange: (field: string, value: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
  isVisible: boolean;
  totalItems: number;
  filteredCount: number;
  label: string;
  fieldConfigs?: FieldConfig[];
}

const AdminFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
  isVisible,
  totalItems,
  filteredCount,
  label,
  fieldConfigs,
}: FilterProps) => {
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  if (!isVisible) return null;

  const renderFilterField = (field: FieldConfig) => {
    switch (field.type) {
      case "select":
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={`${field.key}-filter`} className="text-sm font-medium">
              {field.label}
            </Label>
            <Select
              value={filters[field.key] || "all"}
              onValueChange={(value) => onFilterChange(field.key, value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {field.label}</SelectItem>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "input":
      default:
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={`${field.key}-filter`} className="text-sm font-medium">
              {field.label}
            </Label>
            <div className="relative">
              {field.icon}
              <Input
                id={`${field.key}-filter`}
                placeholder={field.placeholder}
                value={filters[field.key] || ""}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Filter {label}</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {Object.values(filters).filter(v => v !== "").length} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="mr-1 h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fieldConfigs?.map((field) => renderFilterField(field))}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters)
                .filter(([key, value]) => value !== "")
                .map(([key, value]) => {
                  const field = fieldConfigs?.find(f => f.key === key);
                  const displayValue = field?.type === "select" 
                    ? field.options?.find(opt => opt.value === value)?.label || value
                    : value;
                  
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      <span className="font-semibold">{field?.label}:</span>
                      <span>{displayValue}</span>
                      <button
                        onClick={() => onFilterChange(key, "")}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Filter Results Info */}
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                Showing <span className="font-semibold">{filteredCount}</span> of{" "}
                <span className="font-semibold">{totalItems}</span>{" "}
                {label.toLowerCase()}
                {filteredCount !== totalItems && (
                  <span className="ml-2 text-blue-600">
                    ({totalItems - filteredCount} hidden by filters)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminFilter;
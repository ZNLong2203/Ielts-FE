"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, X, Mail, Phone } from "lucide-react";

interface FilterState {
  [key: string]: string;
}

interface FieldConfigs {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
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
  fieldConfigs?: FieldConfigs[];
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Filter {label}</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fieldConfigs?.map((field) => (
            <div className="space-y-2" key={field.key}>
              <Label
                htmlFor={`${field.key}-filter`}
                className="text-sm font-medium"
              >
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
          ))}
        </div>

        {/* Filter Results Info */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
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
        )}
      </CardContent>
    </Card>
  );
};

export default AdminFilter;

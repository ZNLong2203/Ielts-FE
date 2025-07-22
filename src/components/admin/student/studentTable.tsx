"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Filter,
  Search,
  Mail,
  Phone,
} from "lucide-react";

import { columns } from "@/components/admin/student/studentColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";

import { getStudents } from "@/api/student";
import { useFilter } from "@/hook/useFilter";
import AdminFilter from "@/components/filter/admin-filter";

const StudentTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isPending, refetch } = useQuery({
    queryKey: ["students", page],
    queryFn: () => getStudents({ page }),
  });

  // Define which fields to filter
  const filterFields = ["full_name", "email", "phone"];

  // Use the filter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(data?.result || [], filterFields);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;

  // Metadata information
  const currentPage = data?.meta?.current || 1;
  const pageSize = data?.meta?.pageSize || 10;
  const totalPages = data?.meta?.pages || 1;
  const totalItems = data?.meta?.total || 0;
  const filteredCount = filteredData.length;

  // Calculate stats for filtered data
  const activeStudents = filteredData.filter(
    (student) => student.status === "active"
  ).length;
  const unactiveStudents = filteredData.filter(
    (student) => student.status !== "active"
  ).length;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  const handleRefresh = () => {
    refetch();
  };


  const fieldConfigs = [
    {
      key: "full_name",
      label: "Full Name",
      placeholder: "Search by name...",
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "email",
      label: "Email Address",
      placeholder: "Search by email...",
      icon: (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "phone",
      label: "Phone Number",
      placeholder: "Search by phone...",
      icon: (
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <Heading
            title="Student Management"
            description="Manage and monitor student accounts"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={hasActiveFilters ? "bg-blue-50 border-blue-200" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/admin/students/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards - Updated to show filtered data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? "Filtered Students" : "Total Students"}
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? `of ${totalItems} total`
                : `${pageSize} per page`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Current Page
            </p>
            <div className="h-4 w-4 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">
                {currentPage}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : data?.result?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              students {hasActiveFilters ? "filtered" : "displayed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              students verified and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Unactive
            </p>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {unactiveStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              students not verified or inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      {isFilterVisible && (
        <AdminFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onClose={handleClose}
          isVisible={isFilterVisible}
          totalItems={totalItems}
          filteredCount={filteredCount}
          label="Students"
          fieldConfigs={fieldConfigs}
        />
      )}

      {/* Data Table Section */}
      <Card>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-muted-foreground">
                Loading students...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredData} // Use filtered data from hook
                searchKey={["full_name", "email", "phone"]}
                searchPlaceholder="Search by name, email, or phone..."
              />

              {/* Enhanced Pagination */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {hasActiveFilters ? filteredCount : totalItems}
                    </span>{" "}
                    entries
                    {hasActiveFilters && (
                      <span className="text-blue-600 ml-1">(filtered)</span>
                    )}
                  </span>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1}
                    className="hidden md:flex"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden md:inline">Previous</span>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className="w-8 h-8"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <span className="mr-1 hidden md:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="hidden md:flex"
                  >
                    Last
                  </Button>

                  <div className="hidden md:flex items-center space-x-2 ml-4">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">
                        of {totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTable;

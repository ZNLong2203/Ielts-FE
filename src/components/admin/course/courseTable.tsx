"use client";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  FileText,
  Download,
  Eye,
  Edit,
  Archive,
  FileX,
  FileCheck,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/course/courseColumn";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/route";
import { getAllCoursesForAdmin } from "@/api/course";
import { useFilter } from "@/hook/useFilter";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

const CourseTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Get all courses
  const {
    data: allCourses,
    isLoading: allLoading,
    refetch: allRefetch,
    isError: allError,
  } = useQuery({
    queryKey: ["courses", page],
    queryFn: () => getAllCoursesForAdmin({ page }),
  });

  const filterFields = ["title", "skill_focus", "difficulty_level"];

  // Use the filter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(allCourses?.result || [], filterFields);
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;
  const filteredCount = filteredData.length;

  // Metadata information
  const currentPage = allCourses?.meta?.current || 1;
  const pageSize = allCourses?.meta?.pageSize || 10;
  const totalPages = allCourses?.meta?.pages || 1;
  const totalItems = allCourses?.meta?.total || 0;

  const fieldConfigs = [
    {
      key: "title",
      label: "Title",
      placeholder: "Search by title",
      icon: (
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      ),
    },
    {
      key: "skill_focus",
      label: "Skill Focus",
      placeholder: "Search by skill focus",
      icon: (
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      ),
    },
    {
      key: "difficulty_level",
      label: "Difficulty Level",
      placeholder: "Search by difficulty level",
      icon: (
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  const handleRefresh = () => {
    allRefetch();
  };

  if (allLoading) {
    return <Loading />;
  }

  if (allError) {
    return (
      <Error
        title="Error fetching courses"
        description="There was an error fetching the courses. Please try again later."
        onRetry={() => handleRefresh()}
      />
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading
            title="Course Management"
            description="Manage your courses here."
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
            disabled={allLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${allLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push(ROUTES.ADMIN_BLOGS + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blog
          </Button>
        </div>
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
          {allLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredData}
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

export default CourseTable;

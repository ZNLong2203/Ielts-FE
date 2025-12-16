"use client";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  Download,
  BookOpen,
  GraduationCap,
  Star,
  DollarSign,
  Calendar
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/course/courseColumn";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/route";
import { getAllCoursesForAdmin } from "@/api/course";
import { useFilter } from "@/hook/useFilter";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

const CourseTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Dynamic query params
  const queryParams = {
    deleted: false,
    page: page,
  }
  
  // Get all courses
  const {
    data: allCourses,
    isLoading: allLoading,
    refetch: allRefetch,
    isError: allError,
  } = useQuery({
    queryKey: ["courses", queryParams],
    queryFn: () => getAllCoursesForAdmin(queryParams),
  });

  // Add price to filter fields
  const filterFields = ["title", "skill_focus", "is_featured", "price", "created_at"];

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

  const featureCount = filteredData.filter(
    (course) => course.is_featured
  ).length;
  const notFeatureCount = filteredData.filter(
    (course) => !course.is_featured
  ).length;

  // Calculate price statistics from filtered data
  const prices = filteredData.map(course => Number(course.price) || 0);
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

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
      type: "input" as const,
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "skill_focus",
      label: "Skill Focus",
      placeholder: "Search by skill focus",
      type: "input" as const,
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "is_featured",
      label: "Featured",
      placeholder: "Select featured...",
      type: "select" as const,
      icon: (
        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Featured", value: "true" },
        { label: "Not Featured", value: "false" },
      ],
    },
    {
      key: "price",
      label: "Price Range",
      placeholder: "Select price range...",
      type: "select" as const,
      icon: (
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Free (0 VND)", value: "free" },
        { label: "Under 500,000 VND", value: "under_500k" },
        { label: "500,000 VND - 1,000,000 VND", value: "500k_1m" },
        { label: "1,000,000 VND - 2,000,000 VND", value: "1m_2m" },
        { label: "2,000,000 VND - 5,000,000 VND", value: "2m_5m" },
        { label: "Over 5,000,000 VND", value: "over_5m" },
      ],
    },
     {
      key: "created_at",
      label: "Creation Date",
      placeholder: "Select creation period...",
      type: "select" as const,
      icon: (
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Last 7 days", value: "7d" },
        { label: "Last 30 days", value: "30d" },
        { label: "Last 3 months", value: "3m" },
        { label: "Last 6 months", value: "6m" },
        { label: "Last year", value: "1y" },
      ],
    },
  ];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  const handleRefresh = () => {
    allRefetch();
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
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
    <div className="space-y-6">
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
            onClick={() => router.push(ROUTES.ADMIN_COURSES + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? "Filtered Courses" : "Total Courses"}
            </p>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? `of ${totalItems} total`
                : `${pageSize} per page`}
            </p>
          </CardContent>
        </Card>

        {/* Average Price Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Average Price
            </p>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(avgPrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? "of filtered courses" : "of all courses"}
            </p>
          </CardContent>
        </Card>

        {/* Featured Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Featured
            </p>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {featureCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Featured courses</p>
          </CardContent>
        </Card>

        {/* Regular Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Regular</p>
            <GraduationCap className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {notFeatureCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Regular courses</p>
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
          label="Courses"
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
                searchKey={["title", "skill_focus", "difficulty_level"]}
                searchPlaceholder="Search by title, skill focus, or difficulty..."
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

                {/* Pagination controls - same as before */}
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
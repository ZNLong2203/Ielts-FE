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
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Filter,
  Search,
  Calendar,
  Target,
  Star,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./mockTestColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMockTests } from "@/api/mockTest";
import { useFilter } from "@/hook/useFilter";
import ROUTES from "@/constants/route";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

const MockTestTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mockTests", page],
    queryFn: () => getMockTests({ page }),
  });

  // Meta information
  const currentPage = data?.meta?.current || 1;
  const pageSize = data?.meta?.pageSize || 10;
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.pages || 1;

  // Define which fields to filter
  const filterFields = [
    "title",
    "test_type",
    "test_level",
    "difficulty_level",
    "is_active",
    "created_at",
  ];

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
  const filteredCount = filteredData.length;

  // Calculate tests by type
  const listeningTests = filteredData.filter(
    (test) => test.test_type === "listening"
  ).length;
  const readingTests = filteredData.filter(
    (test) => test.test_type === "reading"
  ).length;
  const writingTests = filteredData.filter(
    (test) => test.test_type === "writing"
  ).length;
  const speakingTests = filteredData.filter(
    (test) => test.test_type === "speaking"
  ).length;
  const fullTests = filteredData.filter(
    (test) => test.test_type === "full_test"
  ).length;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Error Loading Mock Tests"
        description="There was an error loading the mock tests. Please try again later."
        onRetry={() => refetch()}
      />
    );
  }

  const fieldConfigs = [
    {
      key: "title",
      label: "Test Title",
      placeholder: "Search by test title",
      type: "input" as const,
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "test_type",
      label: "Test Type",
      placeholder: "Filter by test type",
      type: "select" as const,
      icon: (
        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Listening", value: "listening" },
        { label: "Reading", value: "reading" },
        { label: "Writing", value: "writing" },
        { label: "Speaking", value: "speaking" },
        { label: "Full Test", value: "full_test" },
      ],
    },
    {
      key: "test_level",
      label: "Test Level",
      placeholder: "Filter by test level",
      type: "select" as const,
      icon: (
        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ],
    },
    {
      key: "difficulty_level",
      label: "Difficulty Level",
      placeholder: "Filter by difficulty",
      type: "select" as const,
      icon: (
        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Hard", value: "hard" },
        { label: "Advanced", value: "advanced" },
        { label: "Master", value: "master" },
      ],
    },
    {
      key: "is_active",
      label: "Status",
      placeholder: "Filter by status",
      type: "select" as const,
      icon: (
        <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading
            title="Mock Test Management"
            description="Manage and organize IELTS mock tests for students."
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
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push(ROUTES.ADMIN_MOCK_TESTS + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Test Type Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Listening Tests
            </p>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {listeningTests}
            </div>
            <p className="text-xs text-muted-foreground">
              Audio comprehension tests
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Reading Tests
            </p>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {readingTests}
            </div>
            <p className="text-xs text-muted-foreground">
              Reading comprehension tests
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Writing Tests
            </p>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {writingTests}
            </div>
            <p className="text-xs text-muted-foreground">
              Essay and task tests
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Speaking Tests
            </p>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {speakingTests}
            </div>
            <p className="text-xs text-muted-foreground">
              Oral communication tests
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
          label="Mock Tests"
          fieldConfigs={fieldConfigs}
        />
      )}

      {/* Data Table Section */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredData}
                searchKey={["title", "test_type", "test_level"]}
                searchPlaceholder="Search by title, type, or level..."
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

export default MockTestTable;
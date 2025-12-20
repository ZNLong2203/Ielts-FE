"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Search,
  Mail,
  Phone,
  Filter,
  Shield,
  Calendar
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { columns } from "@/components/admin/teacher/teacherColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { getTeachers, getPendingTeachers } from "@/api/teacher";
import { useState, useMemo } from "react";
import { useFilter } from "@/hook/useFilter";
import ROUTES from "@/constants/route";

const TeacherTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");

  // Get the current page from search params or default to 1
  const page = Number(searchParams.get("page")) || 1;

  const {
    data: allTeachersData,
    isLoading: isLoadingActive,
    refetch: refetchActive,
    isError: isErrorActive,
  } = useQuery({
    queryKey: ["teachers", page],
    queryFn: () => getTeachers({ page }),
  });

  const {
    data: pendingTeachersData,
    isLoading: isLoadingPending,
    refetch: refetchPending,
    isError: isErrorPending,
  } = useQuery({
    queryKey: ["pendingTeachers"],
    queryFn: () => getPendingTeachers(),
  });

  const isPending = isLoadingActive || isLoadingPending;

  // Combined tab data management
  const tabData = useMemo(() => {
    if (activeTab === "all") {
      return {
        currentPage: allTeachersData?.meta?.current || 1,
        data: allTeachersData?.result || [],
        totalItems: allTeachersData?.meta?.total || 0,
        pageSize: allTeachersData?.meta?.pageSize || 10,
        totalPages: allTeachersData?.meta?.pages || 1,
        isLoading: isLoadingActive,
        refetch: refetchActive,
        meta: allTeachersData?.meta,
      };
    } else {
      return {
        currentPage: pendingTeachersData?.meta?.current || 1,
        data: pendingTeachersData?.result || [],
        totalItems: pendingTeachersData?.meta?.total || 0,
        pageSize: pendingTeachersData?.meta?.pageSize || 10,
        totalPages: pendingTeachersData?.meta?.pages || 1,
        isLoading: isLoadingPending,
        refetch: refetchPending,
        meta: pendingTeachersData?.meta,
      };
    }
  }, [
    activeTab,
    allTeachersData?.meta,
    allTeachersData?.result,
    pendingTeachersData?.meta,
    pendingTeachersData?.result,
    isLoadingActive,
    isLoadingPending,
    refetchActive,
    refetchPending,
  ]);

  const {
    currentPage,
    data: currentData,
    totalItems: currentTotalItems,
    pageSize,
    totalPages,
    isLoading: currentIsLoading,
    refetch: currentRefetch,
  } = tabData;

  // Stats for cards (keep separate as they're always for active teachers)
  const totalItems = allTeachersData?.meta?.total || 0;
  const totalPendingItems = pendingTeachersData?.meta?.total || 0;

  // Calculate stats for active teachers
  const activeTeachers =
    allTeachersData?.result?.filter((teacher) => teacher.status === "active")
      .length || 0;

  const inactiveTeachers =
    allTeachersData?.result?.filter((teacher) => teacher.status === "inactive")
      .length || 0;

  // Field for filtering
  const filterFields = ["full_name", "email", "phone", "status", "created_at"];

  // Use the filter hook with current tab data
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(currentData, filterFields);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;
  const filteredCount = filteredData.length;

  const fieldConfigs = [
    {
      key: "full_name",
      label: "Full Name",
      placeholder: "Search by name...",
      type: "input" as const,
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "email",
      label: "Email Address",
      placeholder: "Search by email...",
      type: "input" as const,
      icon: (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "phone",
      label: "Phone Number",
      placeholder: "Search by phone...",
      type: "input" as const,
      icon: (
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "status",
      label: "Status",
      placeholder: "Select status...",
      type: "select" as const,
      icon: (
        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
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
    currentRefetch();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear filters when switching tabs
    handleClearFilters();
    // Reset to first page for pending tab
    if (value === "pending") {
      router.push("?page=1");
    }
  };

  // Handle loading
  if (isLoadingActive || isLoadingPending) {
    return <Loading />;
  }

  if (isErrorActive || isErrorPending) {
    return (
      <Error
        title="Error Loading Data"
        description="There was an issue loading the teacher data. Please try again later."
        dismissible
        onDismiss={() => router.push(ROUTES.ADMIN_TEACHERS)}
        onRetry={currentRefetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <Heading
            title="Teacher Management"
            description="Manage and monitor teacher accounts"
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
            disabled={currentIsLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push(ROUTES.ADMIN_TEACHERS + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Active Teachers
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeachers}</div>
            <p className="text-xs text-muted-foreground">{pageSize} per page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Pending Applications
            </p>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalPendingItems}
            </div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeTeachers}
            </div>
            <p className="text-xs text-muted-foreground">
              teachers verified and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Inactive
            </p>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inactiveTeachers}
            </div>
            <p className="text-xs text-muted-foreground">
              teachers not verified or inactive
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
          totalItems={currentTotalItems}
          filteredCount={filteredCount}
          label={activeTab === "all" ? "All Teachers" : "Pending Applications"}
          fieldConfigs={fieldConfigs}
        />
      )}

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>All Teachers</span>
            <Badge variant="secondary" className="ml-2">
              {totalItems}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending Applications</span>
            {totalPendingItems > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalPendingItems}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Teachers Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent>
              {currentIsLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading all teachers...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable
                    columns={columns}
                    data={hasActiveFilters ? filteredData : currentData}
                    searchKey={["full_name", "email"]}
                    searchPlaceholder="Search by name, email..."
                  />

                  {/* Enhanced Pagination */}
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {hasActiveFilters
                            ? 1
                            : (currentPage - 1) * pageSize + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-foreground">
                          {hasActiveFilters
                            ? filteredCount
                            : Math.min(
                                currentPage * pageSize,
                                currentTotalItems
                              )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {hasActiveFilters ? filteredCount : currentTotalItems}
                        </span>{" "}
                        entries
                        {hasActiveFilters && (
                          <Badge variant="outline" className="ml-2">
                            Filtered
                          </Badge>
                        )}
                      </span>
                    </div>

                    {/* Only show pagination when not filtering */}
                    {!hasActiveFilters && (
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
                          <span className="ml-1 hidden md:inline">
                            Previous
                          </span>
                        </Button>

                        <div className="flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
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
                                    pageNum === currentPage
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="w-8 h-8"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}
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
                          <span className="text-sm text-muted-foreground">
                            Page
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">
                              {currentPage}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              of {totalPages}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Teachers Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-medium">
                  Pending Teacher Applications
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Review and approve teacher applications below
              </p>
            </CardHeader>
            <CardContent>
              {currentIsLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading pending applications...
                  </p>
                </div>
              ) : pendingTeachersData?.result?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Clock className="h-12 w-12 text-gray-400" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      No Pending Applications
                    </h3>
                    <p className="text-sm text-gray-500">
                      All teacher applications have been reviewed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable
                    columns={columns}
                    data={
                      hasActiveFilters
                        ? filteredData
                        : pendingTeachersData?.result || []
                    }
                    searchKey={["full_name", "email", "subject"]}
                    searchPlaceholder="Search pending applications..."
                  />

                  {/* Show total pending count */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {hasActiveFilters ? (
                        <>
                          Showing{" "}
                          <span className="font-medium">{filteredCount}</span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {totalPendingItems}
                          </span>{" "}
                          pending applications
                          <Badge variant="outline" className="ml-2">
                            Filtered
                          </Badge>
                        </>
                      ) : (
                        <>
                          Total pending applications:{" "}
                          <span className="font-medium">
                            {totalPendingItems}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Awaiting Review
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherTable;

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
  File,
  FileCheck,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/blog/blogColumn";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/route";
import {
  getBlogs,
  getArchivedBlogs,
  getDraftBlogs,
  getPublishedBlogs,
} from "@/api/blog";
import { useFilter } from "@/hook/useFilter";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";

const BlogTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const activeTab = searchParams.get("tab") || "all";

  // Get all blogs
  const {
    data: allBlogs,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["blogs", page],
    queryFn: () => getBlogs({ page }),
    enabled: activeTab === "all",
  });

  // Get published blogs
  const {
    data: publishedBlogs,
    isLoading: publishedLoading,
    refetch: refetchPublished,
  } = useQuery({
    queryKey: ["publishedBlogs", page],
    queryFn: () => getPublishedBlogs({ page }),
    enabled: activeTab === "published",
  });

  // Get draft blogs
  const {
    data: draftBlogs,
    isLoading: draftLoading,
    refetch: refetchDraft,
  } = useQuery({
    queryKey: ["draftBlogs", page],
    queryFn: () => getDraftBlogs({ page }),
    enabled: activeTab === "draft",
  });

  // Get archived blogs
  const {
    data: archivedBlogs,
    isLoading: archivedLoading,
    refetch: refetchArchived,
  } = useQuery({
    queryKey: ["archivedBlogs", page],
    queryFn: () => getArchivedBlogs({ page }),
    enabled: activeTab === "archived",
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "published":
        return publishedBlogs;
      case "draft":
        return draftBlogs;
      case "archived":
        return archivedBlogs;
      default:
        return allBlogs;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "published":
        return publishedLoading;
      case "draft":
        return draftLoading;
      case "archived":
        return archivedLoading;
      default:
        return allLoading;
    }
  };

  const data = getCurrentData();
  const isLoading = getCurrentLoading();

  // Define which fields to filter
  const filterFields = ["title", "category"];

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

  // Handle tab change
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    params.set("page", "1"); // Reset to first page when changing tabs
    router.push(`${ROUTES.ADMIN_BLOGS}?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data?.meta && newPage > data?.meta.pages)) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${ROUTES.ADMIN_BLOGS}?${params.toString()}`);
  };

  // Refresh current tab data
  const handleRefresh = () => {
    switch (activeTab) {
      case "published":
        refetchPublished();
        break;
      case "draft":
        refetchDraft();
        break;
      case "archived":
        refetchArchived();
        break;
      default:
        refetchAll();
        break;
    }
    toast.success("Data refreshed successfully");
  };

  // Get status counts for badges
  const getStatusCounts = () => {
    if (!allBlogs?.result)
      return { all: 0, published: 0, draft: 0, archived: 0 };

    const all = allBlogs.result.length;
    const published = allBlogs.result.filter(
      (blog) => blog.status === "published"
    ).length;
    const draft = allBlogs.result.filter(
      (blog) => blog.status === "draft"
    ).length;
    const archived = allBlogs.result.filter(
      (blog) => blog.status === "archived"
    ).length;

    return { all, published, draft, archived };
  };

  const statusCounts = getStatusCounts();
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading
            title="Blog Management"
            description="Manage your blog here."
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() =>
              router.push(ROUTES.ADMIN_BLOGS + "/create")
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blog
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? "Filtered Categories" : "Total Blogs"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : data?.meta?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? `of ${data?.meta?.total} total`
                : `${data?.meta?.pageSize} per page`}
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
                {data?.meta?.current || 1}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : data?.result?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Blogs {hasActiveFilters ? "filtered" : "displayed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Publish</p>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.published}
            </div>
            <p className="text-xs text-muted-foreground">Blog published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Archived
            </p>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.archived}
            </div>
            <p className="text-xs text-muted-foreground">Blog archived</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Draft</p>
            <FileX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.draft}
            </div>
            <p className="text-xs text-muted-foreground">Blog draft</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>All Blogs</span>
                <Badge variant="secondary">{statusCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Published</span>
                <Badge variant="secondary">{statusCounts.published}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Draft</span>
                <Badge variant="secondary">{statusCounts.draft}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex items-center space-x-2"
              >
                <Archive className="h-4 w-4" />
                <span>Archived</span>
                <Badge variant="secondary">{statusCounts.archived}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {hasActiveFilters && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {filteredCount} of {data?.result?.length || 0} blogs
                          match your filters
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchPlaceholder="Search blogs..."
                />
              </div>
            </TabsContent>

            <TabsContent value="published" className="mt-6">
              <div className="space-y-4">
                {hasActiveFilters && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {filteredCount} of {data?.result?.length || 0}{" "}
                          published blogs match your filters
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchPlaceholder="Search published blogs..."
                />
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <div className="space-y-4">
                {hasActiveFilters && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {filteredCount} of {data?.result?.length || 0} draft
                          blogs match your filters
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchPlaceholder="Search draft blogs..."
                />
              </div>
            </TabsContent>

            <TabsContent value="archived" className="mt-6">
              <div className="space-y-4">
                {hasActiveFilters && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {filteredCount} of {data?.result?.length || 0}{" "}
                          archived blogs match your filters
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchPlaceholder="Search archived blogs..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardContent>
          {/* Enhanced Pagination */}
          {data?.meta.current && (
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {hasActiveFilters
                      ? 1
                      : (data?.meta.current - 1) * data?.meta.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {hasActiveFilters
                      ? filteredCount
                      : Math.min(
                          data?.meta.current * data?.meta.pageSize,
                          data?.meta.total
                        )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {hasActiveFilters ? filteredCount : data?.meta.total}
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
                    disabled={data?.meta.current <= 1}
                    className="hidden md:flex"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data?.meta.current - 1)}
                    disabled={data?.meta.current <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden md:inline">Previous</span>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, data?.meta.pages) },
                      (_, i) => {
                        let pageNum;
                        if (data?.meta.pages <= 5) {
                          pageNum = i + 1;
                        } else if (data?.meta.current <= 3) {
                          pageNum = i + 1;
                        } else if (data?.meta.current >= data?.meta.pages - 2) {
                          pageNum = data?.meta.pages - 4 + i;
                        } else {
                          pageNum = data?.meta.current - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === data?.meta.current
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
                    onClick={() => handlePageChange(data?.meta.current + 1)}
                    disabled={data?.meta.current >= data?.meta.pages}
                  >
                    <span className="mr-1 hidden md:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data?.meta.pages)}
                    disabled={data?.meta.current >= data?.meta.pages}
                    className="hidden md:flex"
                  >
                    Last
                  </Button>

                  <div className="hidden md:flex items-center space-x-2 ml-4">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">
                        {data?.meta.current}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {data?.meta.pages}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Panel
        <AdminFilter
          isVisible={isFilterVisible}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onClose={handleClose}
          isVisible={isFilterVisible}

        /> */}
    </div>
  );
};

export default BlogTable;

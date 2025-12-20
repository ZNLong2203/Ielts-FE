"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useFilter } from "@/hook/useFilter";
import { useQuery } from "@tanstack/react-query";
import { getTeacherBlogs } from "@/api/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/components/ui/loading";
import Heading from "@/components/ui/heading";
import Error from "@/components/ui/error";
import { TextBadgeInfo } from "@/components/ui/info";
import AdminFilter from "@/components/filter/admin-filter";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  Edit,
  Eye,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { IBlog } from "@/interface/blog";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ROUTES from "@/constants/route";

const TeacherBlogList = () => {
  const router = useRouter();
  const userId = useSelector((state: any) => state.user.user?.id);

  // State management
  const [page, setPage] = useState(1);

  // Fetch blogs
  const {
    data: blogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teacherBlogs", page],
    queryFn: () =>
      getTeacherBlogs(userId),
    enabled: !!userId,
  });

  const filterFields = ["title", "status"];

  // Use the filter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(blogsData?.result || [], filterFields);
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;
  const filteredCount = filteredData.length;

  // Pagination info
  const totalBlogs = blogsData?.meta?.total || 0;
  const pageSize = blogsData?.meta?.pageSize || 10;
  const totalPages = Math.ceil(totalBlogs / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const fieldConfigs: { key: string; label: string; placeholder: string; type: "input" | "select" | "multiselect"; icon: JSX.Element }[] = [
    {
      key: "title",
      label: "Title",
      placeholder: "Search by title",   
      type: "input",
      icon: (
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      ),
    },
    {
      key: "status",
      label: "Status",
      placeholder: "Search by status",
      type: "input",
      icon: (
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load blogs"
        description="Unable to fetch your blogs. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Heading title="My Blogs" description="Manage your blog posts" />

            <div className="flex items-center space-x-3">
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
              <Link href={ROUTES.TEACHER_BLOGS + "/create"}>
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Blog</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8  ">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Blogs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalBlogs}
                  </p>
                  <p className="text-xs text-muted-foreground">10 per page</p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {blogsData?.result?.filter(
                      (blog: IBlog) => blog.status === "published"
                    ).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Blog published
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {blogsData?.result?.filter(
                      (blog: IBlog) => blog.status === "draft"
                    ).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Blog drafts</p>
                </div>
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {blogsData?.result?.reduce(
                      (sum: number, blog: IBlog) =>
                        sum + (blog.view_count || 0),
                      0
                    ) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Blog views</p>
                </div>
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
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
            totalItems={totalBlogs}
            filteredCount={filteredCount}
            label="Blogs"
            fieldConfigs={fieldConfigs}
          />
        )}

        {/* Blog Grid */}
        {filteredData?.length > 0 ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
              {filteredData.map((blog) => (
                <Card
                  key={blog.id}
                  className="group hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <TextBadgeInfo status={blog.status} />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(ROUTES.TEACHER_BLOGS + `/${blog.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(ROUTES.TEACHER_BLOGS + `/${blog.id}/update`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardTitle className="text-lg line-clamp-2">
                      <Link
                        href={`/teacher/blogs/${blog.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {blog.image && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          width={400}
                          height={225}
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {blog.created_at
                              ? format(
                                  new Date(blog.created_at),
                                  "MMM dd, yyyy"
                                )
                              : "N/A"}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{blog.view_count || 0}</span>
                        </span>
                      </div>

                      {Array.isArray(blog?.tags) && blog.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalBlogs)} of {totalBlogs} blogs
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blogs found
                </h3>
                <Link href="/teacher/blogs/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Blog
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherBlogList;

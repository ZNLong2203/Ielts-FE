"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useFilter } from "@/hook/useFilter";
import { useQuery } from "@tanstack/react-query";
import { getTeacherBlogs } from "@/api/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const userId = useSelector((state: { user: { user?: { id?: string } } }) => state.user.user?.id);

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
      getTeacherBlogs(userId || ""),
    enabled: !!userId,
  });

  const filterFields = ["title", "status"];

  // Transform blogs to map blog_categories to category
  const transformedBlogs = blogsData?.result?.map((blog: IBlog & { blog_categories?: { id?: string; name?: string; slug?: string } }) => {
    const transformed = {
      ...blog,
      category: blog.category || (blog.blog_categories ? {
        id: blog.blog_categories.id || '',
        name: blog.blog_categories.name || '',
        slug: blog.blog_categories.slug,
      } : undefined),
    };
    // Debug log to check category data
    if (blog.blog_categories) {
      console.log('Blog category data:', { blogId: blog.id, blog_categories: blog.blog_categories, transformedCategory: transformed.category });
    }
    return transformed;
  }) || [];

  // Use the filter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(transformedBlogs, filterFields);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8  ">
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

        {/* Blog Table */}
        {filteredData?.length > 0 ? (
          <>
            <Card className="overflow-hidden border border-gray-200 mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Blog
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((blog) => (
                      <tr
                        key={blog.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* Blog Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 h-16 w-24 relative rounded-md overflow-hidden bg-gray-100">
                              {blog.image ? (
                                <Image
                                  src={blog.image}
                                  alt={blog.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <Link
                                  href={`/teacher/blogs/${blog.id}`}
                                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                                >
                                  {blog.title}
                                </Link>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                {blog.content?.replace(/<[^>]*>/g, "").substring(0, 80) || "No content"}...
                              </p>
                              {Array.isArray(blog?.tags) && blog.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {blog.tags.slice(0, 2).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs bg-gray-50 text-gray-600 border-gray-200 px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {blog.tags.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{blog.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {blog.category?.name ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium">
                              {blog.category.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TextBadgeInfo status={blog.status} />
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {blog.created_at
                                ? format(
                                    new Date(blog.created_at),
                                    "dd MMM, yyyy"
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-blue-50 hover:border-blue-300"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

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

"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeacherBlogs } from "@/api/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

const TeacherBlogList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useSelector((state: any) => state.user.user?.id);

  // State management
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Fetch blogs
  const {
    data: blogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "teacherBlogs",
      userId,
      page,
      status,
      search,
    ],
    queryFn: () =>
      getTeacherBlogs(userId, {
        page,
        status: status === "all" ? undefined : status,
      }),
    enabled: !!userId,
  });

  // Status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatus(value);
    setPage(1);
  };

  // Pagination info
  const totalBlogs = blogsData?.meta?.total || 0;
  const pageSize = blogsData?.meta?.pageSize || 10;
  const totalPages = Math.ceil(totalBlogs / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Blogs</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and organize your blog content
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/teacher/blogs/create">
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
        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search blogs..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <Select
                  value={status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

               
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      (blog) => blog.status === "published"
                    ).length || 0}
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
                      (blog) => blog.status === "draft"
                    ).length || 0}
                  </p>
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
                      (sum, blog) => sum + (blog.views || 0),
                      0
                    ) || 0}
                  </p>
                </div>
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blog Grid */}
        {blogsData?.result && blogsData.result.length > 0 ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogsData.result.map((blog) => (
                <Card
                  key={blog.id}
                  className="group hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        className={`${getStatusBadge(
                          blog.status
                        )} text-xs px-2 py-1`}
                      >
                        {blog.status?.toUpperCase()}
                      </Badge>

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
                              router.push(`/teacher/blogs/${blog.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/teacher/blogs/${blog.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
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

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {blog.excerpt || "No excerpt available..."}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(blog.created_at), "MMM dd, yyyy")}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{blog.views || 0}</span>
                        </span>
                      </div>

                      {blog.category && (
                        <Badge variant="secondary" className="text-xs">
                          {blog.category.name}
                        </Badge>
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
                <p className="text-gray-500 mb-6">
                  {search || status !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first blog post"}
                </p>
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

"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Clock,
  Share2,
  Heart,
  MessageCircle,
} from "lucide-react";

import { getBlog } from "@/api/blog";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { formatDistanceToNow } from "date-fns";

const BlogDetail = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const blogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: blog,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => getBlog(blogId),
    enabled: !!blogId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusActions = (currentStatus: string) => {
    const actions = [];
    if (currentStatus !== "published") {
      actions.push({
        label: "Publish",
        value: "published",
        icon: Eye,
      });
    }
    if (currentStatus !== "draft") {
      actions.push({
        label: "Move to Draft",
        value: "draft",
        icon: Edit,
      });
    }
    if (currentStatus !== "archived") {
      actions.push({
        label: "Archive",
        value: "archived",
        icon: Trash2,
      });
    }
    return actions;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !blog) {
    return (
      <Error
        title="Blog Not Found"
        description="The requested blog post does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_BLOGS)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Blog Details
                </h1>
                <p className="text-sm text-gray-500">
                  View and manage blog post information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_BLOGS}/${blogId}/edit`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blog Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(blog?.status)}>
                      {blog.status.charAt(0).toUpperCase() +
                        blog.status.slice(1)}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900">
                    {blog.title}
                  </h1>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Created{" "}
                        {blog.published_at
                          ? new Date(blog.published_at).toLocaleDateString()
                          : "N/A"}
                        ago
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            {blog.image && (
              <Card>
                <CardContent className="pt-6">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Blog Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Author</span>
                </CardTitle>
              </CardHeader>
              <CardContent></CardContent>
            </Card>

            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Category & Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* {blog.category && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Category
                    </p>
                    <Badge variant="outline">{blog.category.name}</Badge>
                  </div>
                )}

                {blog.tags && blog.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* SEO Info */}
            {blog.title && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {blog.title && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Title</p>
                      <p className="text-sm text-gray-600">{blog.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

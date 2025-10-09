"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import {
  TextInfoField,
  DateInfoField,
  TextBadgeInfo,
} from "@/components/ui/info";
import {
  Edit,
  Eye,
  Calendar,
  Tag,
  Share2,
  Heart,
  FileText,
  Image as ImageIcon,
  Star,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { getBlog } from "@/api/blog";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";

const BlogDetail = () => {
  const router = useRouter();
  const params = useParams();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const {
    data: blog,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getBlog(slug),
    enabled: !!slug,
  });

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
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <Heading
                title="Blog Details"
                description="Blog post details and information"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_BLOGS}/${slug}/update`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Update Blog</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_BLOGS)}
                className="flex items-center space-x-2"
              >
                <span>Back to Blog list</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Blog Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <TextInfoField label="Blog Title" value={blog.title} />

                    <TextInfoField
                      label="Author ID"
                      value={blog.author_id || "Unknown"}
                    />

                    <TextInfoField
                      label="Category ID"
                      value={blog.category_id || "Uncategorized"}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <TextBadgeInfo label="Status" status={blog.status} />
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        Featured:
                      </label>
                      <Badge
                        variant={blog.is_featured ? "default" : "secondary"}
                        className={
                          blog.is_featured
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                      >
                        {blog.is_featured ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          "No"
                        )}
                      </Badge>
                    </div>

                    <TextInfoField
                      label="Like Count"
                      value={blog.like_count || 0}
                    />
                  </div>

                  <DateInfoField
                    label="Published At"
                    value={blog.published_at}
                  />
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            {blog.image && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    <span>Featured Image</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Statistics & Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <TextBadgeInfo status={blog.status} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes:</span>
                    <span className="text-sm font-medium">
                      {blog.like_count || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured:</span>
                    <span className="text-sm font-medium">
                      {blog.is_featured ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tags:</span>
                    <span className="text-sm font-medium">
                      {blog.tags?.length || 0}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-gray-500">
                  <div>ID: {blog.id}</div>
                  {blog.published_at && (
                    <div>
                      Published:{" "}
                      {new Date(blog.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`${ROUTES.ADMIN_BLOGS}/${slug}/update`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Blog
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`/blogs/${slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            {/* Blog Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-2">
                    {blog.title}
                  </div>
                  <div className="text-gray-600 line-clamp-3">
                    {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {blog.published_at
                        ? new Date(blog.published_at).toLocaleDateString()
                        : "Not published"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{blog.like_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

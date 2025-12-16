"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBlogCategory } from "@/api/blogCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import {
  TextInfoField,
  DateInfoField,
  TextBadgeInfo,
} from "@/components/ui/info";
import { ArrowRight, Edit, FileText, FolderOpen } from "lucide-react";
import ROUTES from "@/constants/route";

const BlogCategoryDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["blogCategory", slug],
    queryFn: () => getBlogCategory(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Blog Category Not Found"
        description="The requested blog category does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_BLOG_CATEGORIES)}
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
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <Heading
                title="Blog Category Details"
                description="Blog category details and information"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_BLOG_CATEGORIES}/${slug}/update`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Update Blog Category</span>
              </Button>
               <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_BLOG_CATEGORIES)}
                className="flex items-center space-x-2"
              >
                <span>Back to Blog Category list</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Blog Category Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextInfoField label="Category Name" value={data.name} />

                <TextInfoField label="URL Slug" value={data.slug} />
              </div>

              <div className="space-y-4">
                <div>
                  <TextBadgeInfo
                    label="Status"
                    status={data.is_active ? "Active" : "Inactive"}
                  />
                </div>
                <TextInfoField label="Display Order" value={data.ordering} />
              </div>

              <DateInfoField label="Created At" value={data.created_at} />

              <DateInfoField label="Updated At" value={data.updated_at} />
            </div>

            {data.description && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {data.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogCategoryDetail;

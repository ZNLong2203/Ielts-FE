"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBlogCategoryById } from "@/api/blogCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import {
  TextInfoField,
  DateInfoField,
  TextBadgeInfo,
} from "@/components/ui/info";
import { ArrowLeft, Edit, FileText, Hash, Eye, Settings } from "lucide-react";
import ROUTES from "@/constants/route";

const BlogCategoryDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { data, isPending, isError } = useQuery({
    queryKey: ["blogCategory", slug],
    queryFn: () => getBlogCategoryById(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FileText className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-muted-foreground">Blog category not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading
                title={data.name}
                description="Blog category details and information"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_BLOG_CATEGORIES}/${slug}/update`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Category</span>
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

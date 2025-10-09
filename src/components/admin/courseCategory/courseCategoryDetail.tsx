"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCourseCategory } from "@/api/courseCategory";
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
import { ArrowLeft, ArrowRight, Edit, FileText, FolderOpen } from "lucide-react";
import ROUTES from "@/constants/route";

const CourseCategoryDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["courseCategory", slug],
    queryFn: () => getCourseCategory(slug),
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Course Category Not Found"
        description="The requested course category does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_COURSE_CATEGORIES)}
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
                title="Course Category Details"
                description="Course category details and information"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() =>
                  router.push(
                    `${ROUTES.ADMIN_COURSE_CATEGORIES}/${slug}/update`
                  )
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Update Course Category</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_COURSE_CATEGORIES)}
                className="flex items-center space-x-2"
              >
                <span>Back to Course Category list</span>
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
              <span>Course Category Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextInfoField label="Category Name" value={data.name} />

                <TextInfoField label="Icon" value={data.icon} />
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

export default CourseCategoryDetail;

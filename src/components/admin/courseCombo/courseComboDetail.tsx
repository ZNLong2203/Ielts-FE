"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseCombo } from "@/api/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import {
  TextInfoField,
  DateInfoField,
  TextBadgeInfo,
} from "@/components/ui/info";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  BookOpen,
  Users,
  TrendingUp,
  ShoppingCart,
  Tag,
  AlertCircle,
} from "lucide-react";
import ROUTES from "@/constants/route";
import { useState } from "react";

const CourseComboDetail = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["courseCombo", slug],
    queryFn: () => getCourseCombo(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <Error
        title="Course Combo Not Found"
        description="The requested course combo does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_COURSE_COMBO)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  // Calculate combo stats
  const savings =
    (Number(data.original_price) || 0) - (Number(data.combo_price) || 0);
  const savingsPercentage =
    Number(data.original_price) > 0
      ? ((savings / Number(data.original_price)) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div>
                  <Heading
                    title="Course Combo Details"
                    description="View combo information and course details"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_COURSE_COMBO}/edit/${slug}`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Combo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Number of Courses
                      </label>
                      <div className="mt-1 text-2xl font-bold text-blue-600">
                        {data.course_ids.length || 0}
                      </div>
                    </div>
                  </div>
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

                {/* Tags */}
                {data.tags && data.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span>Tags</span>
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Pricing Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">
                      Original Price
                    </label>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      {Number(data.original_price || 0).toLocaleString()} VND
                    </div>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <label className="text-sm font-medium text-red-700">
                      Discount
                    </label>
                    <div className="mt-1 text-2xl font-bold text-red-600">
                      {data.discount_percentage}%
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Save {savings.toLocaleString()} VND
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <label className="text-sm font-medium text-green-700">
                      Final Price
                    </label>
                    <div className="mt-1 text-2xl font-bold text-green-600">
                      {Number(data.combo_price || 0).toLocaleString()} VND
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {savingsPercentage}% off
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">
                      Pricing Summary
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">
                        Individual Course Total:
                      </span>
                      <span className="font-medium text-blue-900">
                        {Number(data.original_price || 0).toLocaleString()} VND
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">
                        Combo Discount ({data.discount_percentage}%):
                      </span>
                      <span className="text-red-600">
                        -{savings.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="border-t border-blue-300 pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-blue-900">
                          Final Combo Price:
                        </span>
                        <span className="text-green-600">
                          {Number(data.combo_price || 0).toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Included Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Included Courses ({data.courses?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.courses && data.courses.length > 0 ? (
                  <div className="space-y-4">
                    {data.courses.map((course, index) => (
                      <div
                        key={course.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <h4 className="font-medium text-gray-900">
                                {course.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {course.difficulty_level}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              {course.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total Value */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span className="text-gray-700">
                          Total Individual Value:
                        </span>
                        <span className="text-gray-900">
                          {data.courses
                            .reduce(
                              (total, course) =>
                                total + (Number(course.price) || 0),
                              0
                            )
                            .toLocaleString()}{" "}
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No courses included in this combo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {data.enrollment_count || 0}
                    </div>
                    <div className="text-sm text-blue-600">Enrolled</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">
                      {(
                        (data.enrollment_count || 0) *
                        (Number(data.combo_price) || 0)
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">Revenue (VND)</div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-700">
                      {(data.total_lessons || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-600">Total lessons</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateInfoField label="Created At" value={data.created_at} />
                  <DateInfoField label="Updated At" value={data.updated_at} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`${ROUTES.ADMIN_COURSE_COMBO}/edit/${slug}`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Combo
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(ROUTES.ADMIN_COURSE_COMBO)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Combos
                </Button>
              </CardContent>
            </Card>

            {/* Combo Preview */}
            <Card className="border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-sm text-green-700">
                  Combo Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-green-900">
                    {data.name}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {savingsPercentage}% OFF
                  </div>
                  <div className="text-sm text-green-700 bg-white px-2 py-1 rounded border">
                    {data.courses?.length || 0} Courses Included
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    {Number(data.combo_price || 0).toLocaleString()} VND
                  </div>
                  <div className="text-xs text-green-600 line-through">
                    Was {Number(data.original_price || 0).toLocaleString()} VND
                  </div>
                  <div className="text-xs text-green-600">
                    Save {savings.toLocaleString()} VND
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Course Combo
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{data.name}"? This action cannot
              be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseComboDetail;

"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCoupon } from "@/api/coupon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { TextInfoField, DateInfoField } from "@/components/ui/info";
import {
  ArrowLeft,
  Edit,
  Gift,
  Percent,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ROUTES from "@/constants/route";
import { format } from "date-fns";

const CouponDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["coupon", slug],
    queryFn: () => getCoupon(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Coupon Not Found"
        description="The requested coupon does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_COUPONS)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  // Calculate coupon stats
  const usageLimit = data.usage_limit || 0;

  // Check if coupon is expired
  const now = new Date();
  const validUntil = new Date(data.valid_until);
  const validFrom = new Date(data.valid_from);
  const isExpired = now > validUntil;
  const isNotStarted = now < validFrom;
  const isActive = !isExpired && !isNotStarted && data.is_active;

  // Get status text and color
  const getStatusInfo = () => {
    if (!data.is_active) return { text: "Inactive", color: "gray" };
    if (isNotStarted) return { text: "Not Started", color: "blue" };
    if (isExpired) return { text: "Expired", color: "red" };
    return { text: "Active", color: "green" };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Heading
                  title="Coupon Details"
                  description="View coupon information and usage statistics"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_COUPONS}/${slug}/update`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Coupon</span>
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
                  <Gift className="h-5 w-5 text-purple-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <TextInfoField label="Coupon Name" value={data.name} />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Coupon Code
                      </label>
                      <div className="mt-1 font-mono bg-gray-100 px-3 py-2 rounded-lg border text-lg font-bold">
                        {data.code}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        {isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge
                          variant={
                            statusInfo.color === "green"
                              ? "default"
                              : "secondary"
                          }
                          className={`
                            ${
                              statusInfo.color === "green"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              statusInfo.color === "red"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              statusInfo.color === "blue"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }
                            ${
                              statusInfo.color === "orange"
                                ? "bg-orange-100 text-orange-800"
                                : ""
                            }
                            ${
                              statusInfo.color === "gray"
                                ? "bg-gray-100 text-gray-800"
                                : ""
                            }
                          `}
                        >
                          {statusInfo.text}
                        </Badge>
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
              </CardContent>
            </Card>

            {/* Discount Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  <span>Discount Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Discount Type
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className="text-base px-3 py-1"
                        >
                          {data.discount_type === "percentage"
                            ? "Percentage (%)"
                            : "Fixed Amount (VND)"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Discount Value
                      </label>
                      <div className="mt-1 text-2xl font-bold text-green-600">
                        {data.discount_type === "percentage"
                          ? `${data.discount_value}%`
                          : `${Number(
                              data.discount_value
                            ).toLocaleString()} VND`}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <TextInfoField
                      label="Minimum Purchase Amount"
                      value={
                        Number(data.minimum_amount) > 0
                          ? `${Number(
                              data.minimum_amount
                            ).toLocaleString()} VND`
                          : "No minimum"
                      }
                    />

                    {data.discount_type === "percentage" &&
                      Number(data.maximum_discount) > 0 && (
                        <TextInfoField
                          label="Maximum Discount"
                          value={`${Number(
                            data.maximum_discount
                          ).toLocaleString()} VND`}
                        />
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validity Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Validity Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateInfoField label="Valid From" value={data.valid_from} />
                  <DateInfoField label="Valid Until" value={data.valid_until} />
                </div>

                {/* Validity Status */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Current Status
                      </h4>
                      <p className="text-sm text-gray-600">
                        {isNotStarted && "Coupon hasn't started yet"}
                        {isActive && "Coupon is currently active"}
                        {isExpired && "Coupon has expired"}
                      </p>
                    </div>
                    <Clock
                      className={`h-5 w-5 ${
                        isActive ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applicable Combos */}
            {data.applicable_combos && data.applicable_combos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span>Applicable Combo Packages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.applicable_combos.map((combo: any) => (
                      <div
                        key={combo.id}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <h4 className="font-medium text-gray-900">
                          {combo.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {combo.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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

          {/* Sidebar - Statistics */}
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
                    router.push(`${ROUTES.ADMIN_COUPONS}/${slug}/update`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Coupon
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigator.clipboard.writeText(data.code)}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Copy Coupon Code
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(ROUTES.ADMIN_COUPONS)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Coupons
                </Button>
              </CardContent>
            </Card>

            {/* Coupon Preview */}
            <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-sm text-purple-700">
                  Coupon Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-purple-900">
                    {data.name}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.discount_type === "percentage"
                      ? `${data.discount_value}% OFF`
                      : `${Number(data.discount_value).toLocaleString()} VND`}
                  </div>
                  <div className="text-xs text-purple-700 font-mono bg-white px-2 py-1 rounded border">
                    Code: {data.code}
                  </div>
                  {Number(data.minimum_amount) > 0 && (
                    <div className="text-xs text-purple-600">
                      Min. purchase:
                      {Number(data.minimum_amount).toLocaleString() + " "}
                      VND
                    </div>
                  )}
                  <div className="text-xs text-purple-600">
                    Valid until{" "}
                    {format(new Date(data.valid_until), "MMM dd, yyyy")}
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

export default CouponDetail;

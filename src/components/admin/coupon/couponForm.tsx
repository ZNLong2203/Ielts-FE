"use client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import DateField from "@/components/form/date-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

import {
  ArrowRight,
  Save,
  Percent,
  Tag,
  Gift,
  Clock,
  AlertCircle,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CouponCreateSchema, CouponUpdateSchema } from "@/validation/coupon";
import { createCoupon, getCoupon, updateCoupon } from "@/api/coupon";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect } from "react";

const CouponForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Create New Coupon";
    description = "Create a new discount coupon for courses and combo packages";
  } else {
    title = "Update Coupon";
    description = "Update coupon details and settings";
  }

  // Get coupon details
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["coupon", slug],
    queryFn: () => getCoupon(slug),
    enabled: slug !== undefined && slug !== "",
  });

  const createCouponMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CouponCreateSchema>) => {
      return createCoupon(formData);
    },
    onSuccess: (data) => {
      toast.success("Coupon created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      });
      router.push(ROUTES.ADMIN_COUPONS);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CouponUpdateSchema>) => {
      return updateCoupon(slug, formData);
    },
    onSuccess: (data) => {
      toast.success("Coupon updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["coupon", slug],
      });
      router.push(ROUTES.ADMIN_COUPONS);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    },
  });

  const couponForm = useForm<z.infer<typeof CouponCreateSchema>>({
    resolver: zodResolver(CouponCreateSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      minimum_amount: "",
      maximum_discount: "",
      usage_limit: 1,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      is_active: true,
      applicable_combos: [],
    },
  });

  // Discount type options
  const discountTypeOptions = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount ($)" },
  ];

  useEffect(() => {
    if (data) {
      couponForm.reset({
        code: data.code,
        name: data.name,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        minimum_amount: data.minimum_amount,
        maximum_discount: data.maximum_discount,
        usage_limit: data.usage_limit,
        valid_from: new Date(data.valid_from),
        valid_until: new Date(data.valid_until),
        is_active: data.is_active,
        applicable_combos: data.applicable_combos || [],
      });
    }
  }, [data, couponForm]);

  const onSubmit = (formData: z.infer<typeof CouponCreateSchema>) => {
    console.log("Coupon Form Data:", formData);

    const submitData = {
      ...formData,
    };

    if (slug && slug !== "") {
      return updateCouponMutation.mutate(submitData);
    } else {
      return createCouponMutation.mutate(submitData);
    }
  };

  const watchDiscountType = couponForm.watch("discount_type");
  const watchValidFrom = couponForm.watch("valid_from");
  const watchValidUntil = couponForm.watch("valid_until");

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <span>Back to Coupons</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...couponForm}>
                  <form
                    onSubmit={couponForm.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={couponForm.control}
                        name="code"
                        label="Coupon Code"
                        placeholder="e.g., SAVE20, NEWSTUDENT"
                        required
                        className="uppercase"
                      />

                      <TextField
                        control={couponForm.control}
                        name="name"
                        label="Coupon Name"
                        placeholder="e.g., Black Friday Sale, Student Discount"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={couponForm.control}
                        name="description"
                        label="Description"
                        placeholder="Describe what this coupon is for"
                        required
                      />

                      <FormField
                        control={couponForm.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Active Status
                              </FormLabel>
                              <FormDescription className="text-sm">
                                Enable or disable this coupon
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            {/* Discount Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  <span>Discount Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...couponForm}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        control={couponForm.control}
                        name="discount_type"
                        label="Discount Type"
                        placeholder="Select discount type"
                        options={discountTypeOptions}
                      />

                      <TextField
                        control={couponForm.control}
                        name="discount_value"
                        label={`Discount Value ${
                          watchDiscountType === "percentage" ? "(%)" : "($)"
                        }`}
                        type="number"
                        placeholder={
                          watchDiscountType === "percentage"
                            ? "e.g., 20"
                            : "e.g., 50"
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={couponForm.control}
                        name="minimum_amount"
                        label="Minimum Purchase Amount ($)"
                        placeholder="e.g., 100"
                      />

                      {watchDiscountType === "percentage" && (
                        <TextField
                          control={couponForm.control}
                          name="maximum_discount"
                          label="Maximum Discount Amount ($)"
                          placeholder="e.g., 200"
                        />
                      )}
                    </div>

                    {/* Discount Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Discount Preview
                      </h4>
                      <div className="text-sm text-gray-600">
                        {watchDiscountType === "percentage" ? (
                          <p>
                            <strong>
                              {couponForm.watch("discount_value")}%
                            </strong>{" "}
                            off
                            {Number(couponForm.watch("maximum_discount")) > 0 && (
                              <span>
                                {" "}
                                (max ${couponForm.watch("maximum_discount")})
                              </span>
                            )}
                            {Number(couponForm.watch("minimum_amount")) > 0 && (
                              <span>
                                {" "}
                                on orders over $
                                {couponForm.watch("minimum_amount")}
                              </span>
                            )}
                          </p>
                        ) : (
                          <p>
                            <strong>
                              ${couponForm.watch("discount_value")}
                            </strong>{" "}
                            off
                            {Number(couponForm.watch("minimum_amount")) > 0 && (
                              <span>
                                {" "}
                                on orders over $
                                {couponForm.watch("minimum_amount")}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>
            {/* Usage & Validity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Usage & Validity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...couponForm}>
                  <div className="space-y-6">
                    <TextField
                      control={couponForm.control}
                      name="usage_limit"
                      label="Usage Limit"
                      placeholder="e.g., 100"
                      type="number"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DateField
                        control={couponForm.control}
                        name="valid_from"
                        label="Valid From"
                        allowFuture={true} // Cho phép chọn tương lai
                        minDate={new Date()} // Minimum là hôm nay
                      />

                      <DateField
                        control={couponForm.control}
                        name="valid_until"
                        label="Valid Until"
                        allowFuture
                        minDate={couponForm.watch("valid_from")}
                      />
                    </div>

                    {/* Validity Check */}
                    {watchValidFrom &&
                      watchValidUntil &&
                      watchValidUntil <= watchValidFrom && (
                        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Invalid Date Range
                            </p>
                            <p className="text-sm text-red-600">
                              Valid until date must be after valid from date.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </Form>
              </CardContent>
            </Card>
            {/* Submit Button */}
                <Form {...couponForm}>
                  <form onSubmit={couponForm.handleSubmit(onSubmit)}>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                        disabled={
                          createCouponMutation.isPending ||
                          updateCouponMutation.isPending
                        }
                      >
                        {createCouponMutation.isPending ||
                        updateCouponMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>
                              {slug && slug !== ""
                                ? "Update Coupon"
                                : "Create Coupon"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coupon Summary */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-purple-700 text-sm">
                  Coupon Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded border">
                      {couponForm.watch("code") || "COUPON_CODE"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">
                      {watchDiscountType === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">
                      {watchDiscountType === "percentage"
                        ? `${couponForm.watch("discount_value")}%`
                        : `$${couponForm.watch("discount_value")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage Limit:</span>
                    <span>{couponForm.watch("usage_limit")} times</span>
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

export default CouponForm;

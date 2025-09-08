"use client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import TagsField from "@/components/form/tags-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

import {
  ArrowLeft,
  Save,
  BookOpen,
  DollarSign,
  Target,
  Percent,
  Package,
  AlertCircle,
  CheckCircle,
  Calculator,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CourseComboCreateSchema,
  CourseComboUpdateSchema,
} from "@/validation/courseCombo";
import {
  createCourseCombo,
  updateCourseCombo,
  getAllCoursesForAdmin,
  getCourseCombo,
} from "@/api/course";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";

const CourseComboForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Create New Course Combo";
    description = "Create a new course combination package for students";
  } else {
    title = "Update Course Combo";
    description = "Update course combo details and pricing";
  }

  // Get course combo details
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courseCombo", slug],
    queryFn: () => getCourseCombo(slug),
    enabled: slug !== undefined && slug !== "",
  });

  // Get all courses for selection
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getAllCoursesForAdmin({ page: 1 }),
  });

  const createComboMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseComboCreateSchema>) => {
      console.log("Creating combo with data:", formData);
      return createCourseCombo(formData);
    },
    onSuccess: (data) => {
      toast.success("Course combo created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["courseCombos"],
      });
      router.push(ROUTES.ADMIN_COURSE_COMBO);
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create course combo"
      );
    },
  });

  const updateComboMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseComboUpdateSchema>) => {
      console.log("Updating combo with data:", formData);
      return updateCourseCombo(slug, formData);
    },
    onSuccess: (data) => {
      toast.success("Course combo updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["courseCombos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courseCombo", slug],
      });
      router.push(ROUTES.ADMIN_COURSE_COMBO);
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update course combo"
      );
    },
  });

  const comboForm = useForm<z.infer<typeof CourseComboCreateSchema>>({
    resolver: zodResolver(CourseComboCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      original_price: "",
      discount_percentage: 0,
      combo_price: "",
      course_ids: [],
      tags: [],
    },
  });

  // Course options for selection
  const courseOptions =
    coursesData?.result?.map((course) => ({
      id: course.id,
      title: course.title,
      price: course.price,
      level: course.difficulty_level,
    })) || [];

  useEffect(() => {
    if (data) {
      comboForm.reset({
        name: data.name,
        description: data.description,
        discount_percentage: data.discount_percentage || 0,
        combo_price: data.combo_price?.toString() || "",
        original_price: data.original_price?.toString() || "",
        course_ids: data.course_ids || [],
        tags: data.tags || [],
      });
    }
  }, [data, comboForm]);

  const onSubmit = (formData: z.infer<typeof CourseComboCreateSchema>) => {
    console.log("Course Combo Form Data:", formData);
    console.log("Course IDs from form:", formData.course_ids);

    // Validate that course_ids are selected
    if (!formData.course_ids || formData.course_ids.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    const submitData = {
      ...formData,
    };

    console.log("Final submit data:", submitData);

    if (slug && slug !== "") {
      return updateComboMutation.mutate(submitData);
    } else {
      return createComboMutation.mutate(submitData);
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    // Get current course_ids from form
    const currentCourseIds = comboForm.getValues("course_ids") || [];
    
    let newSelectedCourses;
    if (checked) {
      newSelectedCourses = [...currentCourseIds, courseId];
    } else {
      newSelectedCourses = currentCourseIds.filter((id) => id !== courseId);
    }
    
    // Update course_ids in form
    comboForm.setValue("course_ids", newSelectedCourses);
    
    // Auto-calculate original price based on selected courses
    const selectedCoursesInfo = courseOptions.filter((course) =>
      newSelectedCourses.includes(course.id)
    );
    
    const totalOriginalPrice = selectedCoursesInfo.reduce(
      (sum, course) => sum + Number(course.price || 0),
      0
    );
    
    // Update original price in form
    comboForm.setValue("original_price", totalOriginalPrice.toString());
    
    // Recalculate combo price if discount percentage exists
    const currentDiscountPercentage = Number(comboForm.getValues("discount_percentage")) || 0;
    if (currentDiscountPercentage > 0) {
      const calculatedComboPrice = totalOriginalPrice * (1 - currentDiscountPercentage / 100);
      comboForm.setValue("combo_price", Math.round(calculatedComboPrice).toString());
    }
  };

  // Watch for discount percentage changes to auto-calculate combo price
  const watchDiscountPercentage = comboForm.watch("discount_percentage");
  const watchOriginalPrice = comboForm.watch("original_price");
  const watchCourseIds = comboForm.watch("course_ids"); // Watch course_ids

  useEffect(() => {
    const originalPrice = Number(watchOriginalPrice) || 0;
    const discountPercentage = Number(watchDiscountPercentage) || 0;
    
    if (originalPrice > 0 && discountPercentage > 0) {
      const calculatedComboPrice = originalPrice * (1 - discountPercentage / 100);
      comboForm.setValue("combo_price", Math.round(calculatedComboPrice).toString());
    }
  }, [watchDiscountPercentage, watchOriginalPrice, comboForm]);

  // Calculate pricing info based on form course_ids
  const selectedCoursesInfo = courseOptions.filter((course) =>
    watchCourseIds?.includes(course.id)
  );

  const totalOriginalPrice = selectedCoursesInfo.reduce(
    (sum, course) => sum + Number(course.price || 0),
    0
  );

  const originalPrice = Number(comboForm.watch("original_price")) || 0;
  const discountPercentage = Number(comboForm.watch("discount_percentage")) || 0;
  const comboPrice = Number(comboForm.watch("combo_price")) || 0;

  // Calculate discount based on percentage
  const calculatedDiscountPrice = originalPrice * (1 - discountPercentage / 100);
  const actualSavings = originalPrice - comboPrice;
  const actualDiscountPercentage = originalPrice > 0 ? (actualSavings / originalPrice) * 100 : 0;

  // Watch for form changes
  const watchName = comboForm.watch("name");
  const watchComboPrice = comboForm.watch("combo_price");

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Course Combos</span>
            </Button>
          </div>
        </div>
      </div>

      <Form {...comboForm}>
        <form onSubmit={comboForm.handleSubmit(onSubmit)} className="space-y-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={comboForm.control}
                      name="name"
                      label="Combo Name"
                      placeholder="e.g., IELTS Complete Package, Speaking & Writing Bundle"
                      required
                    />

                    <TextField
                      control={comboForm.control}
                      name="description"
                      label="Description"
                      placeholder="Describe what this combo package includes and its benefits"
                      required
                    />

                    <TagsField
                      control={comboForm.control}
                      name="tags"
                      label="Tags"
                      placeholder="Add tags (e.g., IELTS, Speaking, Writing, Premium)"
                    />
                  </CardContent>
                </Card>

                {/* Course Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span>Course Selection</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Select courses to include in this combo package (Original price will be auto-calculated)
                    </p>
                  </CardHeader>
                  <CardContent>
                    {courseOptions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {courseOptions.map((course) => (
                            <div
                              key={course.id}
                              className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                                watchCourseIds?.includes(course.id)
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  id={course.id}
                                  checked={watchCourseIds?.includes(course.id) || false}
                                  onCheckedChange={(checked: any) =>
                                    handleCourseSelection(course.id, checked as boolean)
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={course.id}
                                    className="block text-sm font-medium text-gray-900 cursor-pointer"
                                  >
                                    {course.title}
                                  </label>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {course.level}
                                    </Badge>
                                    <span className="text-sm font-medium text-green-600">
                                      {Number(course.price).toLocaleString()} VND
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Selected Courses Summary */}
                        {watchCourseIds && watchCourseIds.length > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                              Selected Courses ({watchCourseIds.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedCoursesInfo.map((course) => (
                                <div
                                  key={course.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-blue-800">
                                    {course.title}
                                  </span>
                                  <span className="font-medium text-blue-900">
                                    {Number(course.price).toLocaleString()} VND
                                  </span>
                                </div>
                              ))}
                              <div className="border-t border-blue-300 pt-2 mt-2">
                                <div className="flex justify-between text-sm font-medium">
                                  <span className="text-blue-900">
                                    Total Course Price:
                                  </span>
                                  <span className="text-blue-900">
                                    {totalOriginalPrice.toLocaleString()} VND
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Auto-calculation notice */}
                            <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-xs text-blue-800">
                                  Original price will be automatically set to {totalOriginalPrice.toLocaleString()} VND
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No courses available</p>
                      </div>
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
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <TextField
                          control={comboForm.control}
                          name="original_price"
                          label="Original Price (VND)"
                          placeholder="Auto-calculated from selected courses"
                          required
                        />
                        {watchCourseIds && watchCourseIds.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Auto-calculated from selected courses
                          </p>
                        )}
                      </div>

                      <div>
                        <TextField
                          control={comboForm.control}
                          name="discount_percentage"
                          label="Discount Percentage (%)"
                          type="number"
                          placeholder="e.g., 20"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Final price will be auto-calculated
                        </p>
                      </div>

                      <div>
                        <TextField
                          control={comboForm.control}
                          name="combo_price"
                          label="Final Combo Price (VND)"
                          placeholder="Auto-calculated from discount"
                          required
                        />
                        {discountPercentage > 0 && originalPrice > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Calculator className="h-3 w-3 inline mr-1" />
                            Auto-calculated: {Math.round(calculatedDiscountPrice).toLocaleString()} VND
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing Validation */}
                    {Number(watchComboPrice) > Number(originalPrice) &&
                      originalPrice &&
                      watchComboPrice && (
                        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Invalid Pricing
                            </p>
                            <p className="text-sm text-red-600">
                              Combo price must be less than original price.
                            </p>
                          </div>
                        </div>
                      )}

                    {Number(discountPercentage) > 100 && discountPercentage && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Invalid Discount
                          </p>
                          <p className="text-sm text-red-600">
                            Discount percentage cannot exceed 100%.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Real-time Pricing Calculator */}
                    {originalPrice > 0 && discountPercentage > 0 && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-2 mb-3">
                          <Calculator className="h-5 w-5 text-purple-600 mt-0.5" />
                          <h4 className="text-sm font-medium text-purple-900">
                            Auto Calculation Preview
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-800">
                              Selected Courses Total:
                            </span>
                            <span className="font-medium text-purple-900">
                              {totalOriginalPrice.toLocaleString()} VND
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-800">
                              Original Price (Form):
                            </span>
                            <span className="font-medium text-purple-900">
                              {originalPrice.toLocaleString()} VND
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-800">
                              Discount ({discountPercentage}%):
                            </span>
                            <span className="text-red-600">
                              - {(originalPrice * discountPercentage / 100).toLocaleString()} VND
                            </span>
                          </div>
                          <div className="border-t border-purple-300 pt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-purple-900">
                                Final Combo Price:
                              </span>
                              <span className="text-purple-700">
                                {Math.round(calculatedDiscountPrice).toLocaleString()} VND
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                        disabled={
                          createComboMutation.isPending ||
                          updateComboMutation.isPending ||
                          !watchCourseIds ||
                          watchCourseIds.length === 0
                        }
                      >
                        {createComboMutation.isPending ||
                        updateComboMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>
                              {slug && slug !== ""
                                ? "Update Course Combo"
                                : "Create Course Combo"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Enhanced Combo Summary */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-green-700 text-sm">
                      Combo Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-900">
                          {watchName || "Course Combo Name"}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {watchCourseIds?.length || 0} Course
                          {(watchCourseIds?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {comboPrice > 0 && (
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-green-600">
                            {comboPrice.toLocaleString()} VND
                          </div>
                          {originalPrice > 0 && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600 line-through">
                                Was {originalPrice.toLocaleString()} VND
                              </div>
                              <div className="text-sm font-medium text-green-700">
                                Save {actualSavings.toLocaleString()} VND (
                                {actualDiscountPercentage.toFixed(1)}% off)
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pricing breakdown */}
                      <div className="space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Courses Total:</span>
                          <span>{totalOriginalPrice.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Price:</span>
                          <span>{originalPrice.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span>{discountPercentage}%</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span className="text-gray-900">Final Price:</span>
                          <span className="text-green-600">{comboPrice.toLocaleString()} VND</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="border-gray-200 bg-gray-50/50">
                  <CardHeader>
                    <CardTitle className="text-gray-700 text-sm">
                      Combo Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-gray-800">
                    <p>• Select complementary courses that work well together</p>
                    <p>• Set competitive original price based on market research</p>
                    <p>• Use appropriate discount percentage to attract students</p>
                    <p>• Ensure final combo price provides good value</p>
                    <p>• Consider different skill levels and progression paths</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseComboForm;
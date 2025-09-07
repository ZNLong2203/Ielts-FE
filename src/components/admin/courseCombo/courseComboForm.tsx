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
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

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
      toast.error(
        error.response?.data?.message || "Failed to create course combo"
      );
    },
  });

  const updateComboMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseComboUpdateSchema>) => {
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
      setSelectedCourses(data.course_ids || []);
    }
  }, [data, comboForm]);

  const onSubmit = (formData: z.infer<typeof CourseComboCreateSchema>) => {
    console.log("Course Combo Form Data:", formData);

    const submitData = {
      ...formData,
      course_ids: selectedCourses,
    };

    if (slug && slug !== "") {
      return updateComboMutation.mutate(submitData);
    } else {
      return createComboMutation.mutate(submitData);
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    }
  };

  // Calculate pricing info
  const selectedCoursesInfo = courseOptions.filter((course) =>
    selectedCourses.includes(course.id)
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
  const watchOriginalPrice = comboForm.watch("original_price");
  const watchDiscountPercentage = comboForm.watch("discount_percentage");
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
              <CardContent>
                <Form {...comboForm}>
                  <form
                    onSubmit={comboForm.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
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
                  </form>
                </Form>
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
                  Select courses to include in this combo package
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
                            selectedCourses.includes(course.id)
                              ? "border-green-300 bg-green-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={course.id}
                              checked={selectedCourses.includes(course.id)}
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
                                  ${course.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected Courses Summary */}
                    {selectedCourses.length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          Selected Courses ({selectedCourses.length})
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
                                ${course.price}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-blue-300 pt-2 mt-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-blue-900">
                                Total Course Price:
                              </span>
                              <span className="text-blue-900">
                                ${totalOriginalPrice}
                              </span>
                            </div>
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
              <CardContent>
                <Form {...comboForm}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TextField
                        control={comboForm.control}
                        name="original_price"
                        label="Original Price ($)"
                        placeholder="e.g., 299.99"
                        required
                      />

                      <TextField
                        control={comboForm.control}
                        name="discount_percentage"
                        label="Discount Percentage (%)"
                        type="number"
                        placeholder="e.g., 20"
                        required
                      />

                      <TextField
                        control={comboForm.control}
                        name="combo_price"
                        label="Final Combo Price ($)"
                        placeholder="e.g., 199.99"
                        required
                      />
                    </div>

                    {/* Pricing Validation */}
                    {Number(watchComboPrice) > Number(watchOriginalPrice) &&
                      watchOriginalPrice &&
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

                    {Number(watchDiscountPercentage) > 100 && watchDiscountPercentage && (
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

                    {/* Pricing Calculator */}
                    {originalPrice > 0 && discountPercentage > 0 && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-2 mb-3">
                          <Calculator className="h-5 w-5 text-purple-600 mt-0.5" />
                          <h4 className="text-sm font-medium text-purple-900">
                            Discount Calculator
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-800">
                              Original Price:
                            </span>
                            <span className="font-medium text-purple-900">
                              ${originalPrice}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-800">
                              Discount ({discountPercentage}%):
                            </span>
                            <span className="text-red-600">
                              -${(originalPrice * discountPercentage / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="border-t border-purple-300 pt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-purple-900">
                                Calculated Price:
                              </span>
                              <span className="text-purple-700">
                                ${calculatedDiscountPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Savings Preview */}
                    {originalPrice > 0 && comboPrice > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-2 mb-3">
                          <Percent className="h-5 w-5 text-green-600 mt-0.5" />
                          <h4 className="text-sm font-medium text-green-900">
                            Final Pricing Summary
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-800">
                              Original Price:
                            </span>
                            <span className="line-through text-gray-500">
                              ${originalPrice}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-800">Final Combo Price:</span>
                            <span className="font-medium text-green-900">
                              ${comboPrice}
                            </span>
                          </div>
                          <div className="border-t border-green-300 pt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-green-900">
                                You Save:
                              </span>
                              <span className="text-green-700">
                                ${actualSavings.toFixed(2)} ({actualDiscountPercentage.toFixed(1)}% off)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Form {...comboForm}>
                  <form onSubmit={comboForm.handleSubmit(onSubmit)}>
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
                          selectedCourses.length === 0
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
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Combo Summary */}
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
                      {selectedCourses.length} Course
                      {selectedCourses.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {comboPrice > 0 && (
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        ${comboPrice}
                      </div>
                      {originalPrice > 0 && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600 line-through">
                            Was ${originalPrice}
                          </div>
                          <div className="text-sm font-medium text-green-700">
                            Save ${actualSavings.toFixed(2)} (
                            {actualDiscountPercentage.toFixed(1)}% off)
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original:</span>
                      <span>${watchOriginalPrice || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span>{watchDiscountPercentage || "0"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final Price:</span>
                      <span className="font-medium">
                        ${watchComboPrice || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-700 text-sm">
                  Combo Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-blue-800">
                <p>• Select complementary courses that work well together</p>
                <p>• Set competitive original price based on market research</p>
                <p>• Use appropriate discount percentage to attract students</p>
                <p>• Ensure final combo price provides good value</p>
                <p>• Consider different skill levels and progression paths</p>
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm">
                  Validation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {watchName ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        watchName ? "text-green-700" : "text-red-700"
                      }
                    >
                      Combo Name
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedCourses.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        selectedCourses.length > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      Courses Selected
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {watchOriginalPrice && Number(watchOriginalPrice) > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        watchOriginalPrice && Number(watchOriginalPrice) > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      Original Price Set
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {watchComboPrice && Number(watchComboPrice) > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        watchComboPrice && Number(watchComboPrice) > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      Final Price Set
                    </span>
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

export default CourseComboForm;
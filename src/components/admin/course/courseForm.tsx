"use client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field"; // Thêm import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

import {
  Save,
  FileText,
  DollarSign,
  BookOpen,
  Tag,
  Plus,
  X,
  GraduationCap,
  Target,
  CheckCircle,
  Settings,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CourseCreateSchema, CourseUpdateSchema } from "@/validation/course";
import {
  createAdminCourse,
  updateAdminCourse,
  getAdminCourseDetail,
} from "@/api/course";
import { getTeachers } from "@/api/teacher";
import { getCourseCategories } from "@/api/courseCategory";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";

const CourseForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Create New Course";
    description = "Design and create a new IELTS course";
  } else {
    title = "Edit Course";
    description = "Update course information and content";
  }

  // Queries
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => getAdminCourseDetail(slug),
    enabled: slug !== undefined && slug !== "",
  });

  const { data: teacherData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers({ all: true }),
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCourseCategories({ page: 1 }),
  });

  const skillFocusOptions = [
    {
      label: "Reading",
      value: "reading",
    },
    {
      label: "Listening",
      value: "listening",
    },
    {
      label: "Speaking",
      value: "speaking",
    },
    {
      label: "Writing",
      value: "writing",
    },
  ];

  const difficultyLevelOptions = [
    {
      label: "Beginner",
      value: "beginner",
    },
    {
      label: "Intermediate",
      value: "intermediate",
    },
    {
      label: "Advanced",
      value: "advanced",
    },
  ];

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseCreateSchema>) => {
      return createAdminCourse(formData);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      router.push(ROUTES.ADMIN_COURSES);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create course");
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseUpdateSchema>) => {
      return updateAdminCourse(slug, formData);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", slug] });
      router.push(ROUTES.ADMIN_COURSES);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update course");
    },
  });

  // Form setup
  const courseForm = useForm<z.infer<typeof CourseCreateSchema>>({
    resolver: zodResolver(CourseCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      teacher_id: "",
      category_id: "",
      skill_focus: "speaking",
      difficulty_level: "beginner",
      estimated_duration: 0,
      price: 0,
      discount_price: 0,
      is_featured: false,
      requirements: [],
      what_you_learn: [],
      course_outline: {
        sections: [{ title: "", lessons: [""] }],
      },
      tags: [],
    },
  });

  // Field arrays
  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control: courseForm.control,
    name: "course_outline.sections",
  });

  const teacherOptions =
    teacherData?.result.map((teacher) => ({
      label: teacher.full_name || "Unknown Teacher",
      value: teacher.id,
    })) || [];

  const detailCategory = categoryData?.result.find(
    (category) => category.id === courseData?.category.id
  );
  
  const categoryOptions =
    categoryData?.result.map((category) => ({
      label: category.name,
      value: category.id,
    })) || [];

  useEffect(() => {
    if (courseData) {
      courseForm.reset(courseData);
      courseForm.setValue("category_id", detailCategory?.id || "");
    }
  }, [courseData, courseForm]);

  const onSubmit = async (data: z.infer<typeof CourseCreateSchema>) => {
    console.log("click")
    console.log("Course Form Submitted:", data);
    if (slug) {
      updateCourseMutation.mutate(data);
    } else {
      createCourseMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Course Not Found"
        description="The requested course does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_COURSES)}
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
              <Heading title={title} description={description} />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  /* Preview logic */
                }}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...courseForm}>
          <form
            onSubmit={courseForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>Course Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={courseForm.control}
                        name="title"
                        label="Course Title"
                        placeholder="Enter course title..."
                        className="md:col-span-2"
                      />

                      <TextField
                        control={courseForm.control}
                        name="description"
                        label="Description"
                        placeholder="Course description..."
                        className="md:col-span-2"
                      />

                      {/* <SelectField
                        control={courseForm.control}
                        name="teacher_id"
                        label="Teacher"
                        placeholder="Select teacher"
                        options={teacherOptions}
                      /> */}

                      <SelectField
                        control={courseForm.control}
                        name="category_id"
                        label="Category"
                        placeholder="Select category"
                        options={categoryOptions}
                      />

                      <SelectField
                        control={courseForm.control}
                        name="skill_focus"
                        label="Skill Focus"
                        placeholder="Select skill"
                        options={skillFocusOptions}
                      />
                      <SelectField
                        control={courseForm.control}
                        name="difficulty_level"
                        label="Difficulty Level"
                        placeholder="Select difficulty"
                        options={difficultyLevelOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Duration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Pricing & Duration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TextField
                        control={courseForm.control}
                        name="price"
                        label="Price (VND)"
                        type="number"
                      />

                      <TextField
                        control={courseForm.control}
                        name="discount_price"
                        label="Discount Price (VND)"
                        type="number"
                      />

                      <TextField
                        control={courseForm.control}
                        name="estimated_duration"
                        label="Duration (hours)"
                        type="number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span>Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TagsField
                      control={courseForm.control}
                      name="requirements"
                      label="Course Requirements"
                      placeholder="Type requirement and press Enter..."
                    />
                  </CardContent>
                </Card>

                {/* What You Learn */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span>What Students Will Learn</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TagsField
                      control={courseForm.control}
                      name="what_you_learn"
                      label="What Students Will Learn"
                      placeholder="Type learning outcome and press Enter..."
                    />
                  </CardContent>
                </Card>

                {/* Course Outline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                      <span>Course Outline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sectionFields.map((section, sectionIndex) => (
                      <div
                        key={section.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <TextField
                            control={courseForm.control}
                            name={`course_outline.sections.${sectionIndex}.title`}
                            label={`Section ${sectionIndex + 1} Title`}
                            placeholder="Enter section title..."
                            className="flex-1"
                          />
                          {sectionFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSection(sectionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendSection({ title: "", lessons: [""] })
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </CardContent>
                </Card>

                {/* Tags - Sử dụng TagsField */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-pink-600" />
                      <span>Tags</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TagsField
                      control={courseForm.control}
                      name="tags"
                      label="Course Tags"
                      placeholder="Type tag and press Enter..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span>Course Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={courseForm.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Featured Course
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Display this course prominently
                            </p>
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
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        disabled={
                          createCourseMutation.isPending ||
                          updateCourseMutation.isPending
                        }
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {createCourseMutation.isPending ||
                          updateCourseMutation.isPending
                            ? slug
                              ? "Updating..."
                              : "Creating..."
                            : slug
                            ? "Update Course"
                            : "Create Course"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CourseForm;

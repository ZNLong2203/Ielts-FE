"use client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Badge } from "@/components/ui/badge";

import {
  Save,
  FileText,
  DollarSign,
  BookOpen,
  Tag,
  Plus,
  GraduationCap,
  Target,
  CheckCircle,
  Settings,
  List,
  Trash2,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CourseCreateSchema, CourseUpdateSchema } from "@/validation/course";
import {
  createAdminCourse,
  updateAdminCourse,
  getAdminCourseDetail,
} from "@/api/course";
import { createSection, getSectionsByCourseId } from "@/api/section";
import { getCourseCategories } from "@/api/courseCategory";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";
import { ISectionCreate } from "@/interface/section";

const CourseForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();
  const [newSections, setNewSections] = useState<ISectionCreate[]>([]);

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

  const { data: sectionsData } = useQuery({
    queryKey: ["sections", slug],
    queryFn: () => getSectionsByCourseId(slug),
    enabled: slug !== undefined && slug !== "",
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCourseCategories({ page: 1 }),
  });

  const skillFocusOptions = [
    { label: "Reading", value: "reading" },
    { label: "Listening", value: "listening" },
    { label: "Speaking", value: "speaking" },
    { label: "Writing", value: "writing" },
  ];

  const difficultyLevelOptions = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseCreateSchema>) => {
      return createAdminCourse(formData);
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Course created successfully");

      // Create sections after course creation
      if (newSections.length > 0 && data?.data?.id) {
        try {
          for (const section of newSections) {
            await createSection(section, slug);
          }
          toast.success("Sections created successfully");
        } catch (error: any) {
          toast.error("Failed to create some sections");
        }
      }

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
    onSuccess: async (data) => {
      toast.success(data?.message || "Course updated successfully");

      // Create new sections if any
      if (newSections.length > 0) {
        try {
          for (const section of newSections) {
            console.log("Creating section:", section);
            console.log("For course ID:", slug);
            await createSection(section, slug);
          }
          toast.success("New sections created successfully");
        } catch (error) {
          toast.error("Failed to create some sections");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", slug] });
      queryClient.invalidateQueries({ queryKey: ["sections", slug] });
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
      category_id: "",
      skill_focus: "speaking",
      difficulty_level: "beginner",
      estimated_duration: 0,
      price: "",
      discount_price: "",
      is_featured: false,
      requirements: [],
      what_you_learn: [],
      tags: [],
    },
  });

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
  }, [courseData, courseForm, detailCategory?.id]);

  const onSubmit = async (data: z.infer<typeof CourseCreateSchema>) => {
    console.log("Course Form Submitted:", data);
    if (slug) {
      updateCourseMutation.mutate(data as z.infer<typeof CourseUpdateSchema>);
    } else {
      createCourseMutation.mutate(data);
    }
  };

  // Section management functions
  const addNewSection = () => {
    setNewSections([
      ...newSections,
      {
        course_id: slug || "",
        title: "",
        description: "",
        ordering: (sectionsData?.length || 0) + newSections.length + 1,
      },
    ]);
  };

  const updateNewSection = (index: number, field: string, value: string) => {
    const updated = [...newSections];
    updated[index] = { ...updated[index], [field]: value };
    setNewSections(updated);
  };

  const removeNewSection = (index: number) => {
    setNewSections(newSections.filter((_, i) => i !== index));
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
                        placeholder="Enter price..."
                      />

                      <TextField
                        control={courseForm.control}
                        name="discount_price"
                        label="Discount Price (VND)"
                        placeholder="Enter discount price..."
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

                {/* Course Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <List className="h-5 w-5 text-indigo-600" />
                        <span>Course Sections</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addNewSection}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Section</span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Existing Sections (for edit mode) */}
                    {sectionsData && sectionsData.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-gray-700 flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Existing Sections</span>
                        </h4>
                        {sectionsData.map((section) => (
                          <div
                            key={section.id}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="secondary">
                                    Section {section.ordering}
                                  </Badge>
                                  <span className="font-medium">
                                    {section.title}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {section.description}
                                </p>
                                <div className="text-xs text-gray-500">
                                  {section.lessons?.length || 0} lessons
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Sections */}
                    {newSections.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-gray-700 flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>New Sections</span>
                        </h4>
                        {newSections.map((section, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 bg-blue-50 border-blue-200"
                          >
                            <div className="flex items-start justify-between">
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800"
                              >
                                New Section {section.ordering}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNewSection(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Section Title
                                </label>
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) =>
                                    updateNewSection(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter section title..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Section Description
                                </label>
                                <textarea
                                  value={section.description}
                                  onChange={(e) =>
                                    updateNewSection(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter section description..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {(!sectionsData || sectionsData.length === 0) &&
                      newSections.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">
                            No sections yet
                          </p>
                          <p className="text-sm">
                            Add sections to organize your course content
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Tags */}
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

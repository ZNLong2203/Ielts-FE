"use client";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  DollarSign,
  BookOpen,
  Tag,
  Target,
  CheckCircle,
  Settings,
  ArrowRight,
  List,
  Plus,
  FolderOpen,
  PlayCircle,
  FileText,
  Users,
  Clock,
  BarChart3,
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
import { useEffect } from "react";
import { ISectionCreate } from "@/interface/section";
import SectionForm from "./section/sectionForm";
import LessonList from "./lesson/lessonList";

const CourseForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();
  const [newSections, setNewSections] = useState<ISectionCreate[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  // Determine if we're editing or creating
  const isEditing = slug !== undefined && slug !== "";
  const isCreating = !isEditing;

  let title = "";
  let description = "";
  if (isCreating) {
    title = "Create New Course";
    description = "Design and create a new IELTS course";
  } else {
    title = "Update Course";
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
    enabled: isEditing,
  });

  const { data: sectionsData } = useQuery({
    queryKey: ["sections", slug],
    queryFn: () => getSectionsByCourseId(slug),
    enabled: isEditing,
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

      if (newSections.length > 0 && data?.data?.id) {
        try {
          for (const section of newSections) {
            await createSection(section, data.data.id);
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

      if (newSections.length > 0) {
        try {
          for (const section of newSections) {
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
    if (courseData && isEditing) {
      courseForm.reset(courseData);
      courseForm.setValue("category_id", detailCategory?.id || "");
      // Auto-select first section if available
      if (courseData.sections && courseData.sections.length > 0 && !selectedSectionId) {
        setSelectedSectionId(courseData.sections[0].id);
      }
    }
  }, [courseData, courseForm, detailCategory?.id, isEditing, selectedSectionId]);

  const onSubmit = async (data: z.infer<typeof CourseCreateSchema>) => {
    console.log("Course Form Submitted:", data);
    if (isEditing) {
      updateCourseMutation.mutate(data as z.infer<typeof CourseUpdateSchema>);
    } else {
      createCourseMutation.mutate(data);
    }
  };

  // Section handlers
  const handleSectionFormSuccess = () => {
    setShowSectionForm(false);
    queryClient.invalidateQueries({ queryKey: ["sections", slug] });
    queryClient.invalidateQueries({ queryKey: ["course", slug] });
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  const getTotalLessons = () => {
    return courseData?.sections?.reduce((total: any, section: any) => 
      total + (section.lessons?.length || 0), 0) || 0;
  };

  if (isEditing && isLoading) {
    return <Loading />;
  }

  if (isEditing && isError) {
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_COURSES)}
                className="flex items-center space-x-2"
              >
                <span>Back to Course list</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Form Section */}
            <Form {...courseForm}>
              <form onSubmit={courseForm.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Course Information */}
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
              </form>
            </Form>

            {/* Course Content Management - Tab Interface */}
            {isEditing && courseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <List className="h-5 w-5 text-purple-600" />
                      <span>Course Content Management</span>
                      {courseData.sections && (
                        <Badge variant="outline">
                          {courseData.sections.length} sections
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSectionForm(!showSectionForm)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Section</span>
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Section Form */}
                  {showSectionForm && (
                    <>
                      <SectionForm
                        courseId={courseData.id}
                        existingSections={courseData.sections || []}
                        onSuccess={handleSectionFormSuccess}
                        onCancel={() => setShowSectionForm(false)}
                      />
                      <Separator className="my-6" />
                    </>
                  )}

                  {/* Tabs for Sections */}
                  {courseData.sections && courseData.sections.length > 0 ? (
                    <Tabs value={selectedSectionId || ""} onValueChange={handleSectionSelect}>
                      <TabsList className="grid w-full grid-cols-auto gap-1 h-auto p-1 overflow-x-auto">
                        {courseData.sections
                          .sort((a, b) => (a.ordering || 999) - (b.ordering || 999))
                          .map((section, index) => (
                            <TabsTrigger
                              key={section.id}
                              value={section.id}
                              className="flex items-center space-x-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 min-w-fit"
                            >
                              <FolderOpen className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate max-w-32">
                                {section.title || `Section ${index + 1}`}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {section.lessons?.length || 0}
                              </Badge>
                            </TabsTrigger>
                          ))}
                      </TabsList>

                      {courseData.sections.map((section) => (
                        <TabsContent key={section.id} value={section.id} className="mt-6">
                          <div className="space-y-6">
                            {/* Section Info Header */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <FolderOpen className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-purple-900">
                                      {section.title}
                                    </h3>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <Badge variant="outline" className="bg-white">
                                        Section {section.ordering}
                                      </Badge>
                                      <Badge variant="outline" className="bg-white">
                                        {section.lessons?.length || 0} lessons
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {section.description && (
                                <p className="text-purple-700 text-sm">
                                  {section.description}
                                </p>
                              )}
                            </div>

                            {/* Lesson Management for Selected Section */}
                            <LessonList 
                              section={section} 
                              courseId={courseData.id}
                            />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    // Empty state
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <FolderOpen className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No sections yet
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Create your first section to organize your course lessons and content.
                      </p>
                      <Button
                        onClick={() => setShowSectionForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Section
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
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

            {/* Statistics (when editing) */}
            {isEditing && courseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">
                        {courseData.estimated_duration} hours
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-sm font-medium">
                        {Number(courseData.price)?.toLocaleString()} VND
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sections:</span>
                      <span className="text-sm font-medium">
                        {courseData?.sections?.length || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Lessons:
                      </span>
                      <span className="text-sm font-medium">
                        {getTotalLessons()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Featured:</span>
                      <span className="text-sm font-medium">
                        {courseData.is_featured ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tags:</span>
                      <span className="text-sm font-medium">
                        {courseData.tags?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    form="course-form"
                    className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                    disabled={
                      createCourseMutation.isPending ||
                      updateCourseMutation.isPending
                    }
                    onClick={courseForm.handleSubmit(onSubmit)}
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {createCourseMutation.isPending ||
                      updateCourseMutation.isPending
                        ? isEditing
                          ? "Updating..."
                          : "Creating..."
                        : isEditing
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

            {/* Course Preview (when editing) */}
            {isEditing && courseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span>Course Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-2">
                      {courseData.title}
                    </div>
                    <div className="text-gray-600 line-clamp-3">
                      {courseData.description}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{courseData.skill_focus}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{courseData.difficulty_level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{courseData.estimated_duration}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>
                        {Number(courseData.price)?.toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
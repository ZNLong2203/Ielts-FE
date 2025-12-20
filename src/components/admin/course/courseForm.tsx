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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  Save,
  DollarSign,
  BookOpen,
  Tag,
  Target,
  CheckCircle,
  Settings,
  ArrowRight,
  FolderOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  List,
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
  uploadCourseThumbnail,
} from "@/api/course";
import { createSection, getSectionsByCourseId } from "@/api/section";
import { getCourseCategories } from "@/api/courseCategory";
import { getExercisesByLessonId } from "@/api/exercise"; // Add this import
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";
import { ISectionCreate } from "@/interface/section";

// Import tab components
import SectionTab from "./form/courseSectionTab";
import LessonTab from "./form/courseLessonTab";
import ExerciseTab from "./form/courseExerciseTab";
import QuestionTab from "./form/courseQuestionTab";
import FileUploadField from "@/components/form/file-field";
import { getTeachers } from "@/api/teacher";

const CourseForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();
  const [newSections, setNewSections] = useState<ISectionCreate[]>([]);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

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

  const {
    data: teachersData,
    isLoading: isLoadingActive,
    refetch: refetchActive,
    isError: isErrorActive,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers(),
  });


  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCourseCategories({ page: 1 }),
  });

  // Fetch exercises for selected lesson
  const {
    data: exerciseData,
    isLoading: isExerciseLoading,
    isError: isExerciseError,
    refetch: refetchExercises,
  } = useQuery({
    queryKey: ["exercises", selectedLessonId],
    queryFn: () => getExercisesByLessonId(selectedLessonId || ""),
    enabled: isEditing && selectedLessonId !== null,
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

      const thumbnailValue = courseForm.getValues("thumbnail");
      const thumbnailFileToUpload =
        thumbnailValue instanceof File ? thumbnailValue : null;

      if (thumbnailFileToUpload && data?.data?.id) {
        try {
          await uploadCourseThumbnail(data.data.id, thumbnailFileToUpload);
        } catch (error: any) {
          toast.error("Failed to upload thumbnail");
          console.error("Thumbnail upload error:", error);
        }
      }

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

      // Upload thumbnail if changed
      const thumbnailValue = courseForm.getValues("thumbnail");
      const thumbnailFileToUpload =
        thumbnailValue instanceof File ? thumbnailValue : null;

      if (thumbnailFileToUpload && slug) {
        try {
          await uploadCourseThumbnail(slug, thumbnailFileToUpload);
        } catch (error: any) {
          toast.error("Failed to upload thumbnail");
          console.error("Thumbnail upload error:", error);
        }
      }

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
      // Don't redirect for editing - let user continue managing content
      if (isCreating) {
        router.push(ROUTES.ADMIN_COURSES);
      }
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
      teacher_id: "",
      skill_focus: "speaking",
      difficulty_level: "beginner",
      estimated_duration: 0,
      price: "",
      discount_price: "",
      is_featured: false,
      requirements: [],
      what_you_learn: [],
      tags: [],
      thumbnail: "",
    },
  });

  const detailCategory = categoryData?.result.find(
    (category) => category.id === courseData?.category.id
  );

  const categoryOptions =
    categoryData?.result.map((category) => ({
      label: category.name,
      value: String(category.id),
    })) || [];

  const teacherOptions =
    teachersData?.result
      ?.filter((teacher) => !!teacher?.teachers?.id)
      .map((teacher) => ({
        label: teacher.full_name || teacher.email,
        value: String(teacher.teachers!.id),
      })) || [];

  useEffect(() => {
    if (courseData && isEditing) {
      courseForm.reset(courseData);
      courseForm.setValue("category_id", detailCategory?.id ? String(detailCategory.id) : "");
      courseForm.setValue("teacher_id", courseData?.teacher?.id ? String(courseData.teacher.id) : "");
    }
  }, [courseData, courseForm, detailCategory?.id, isEditing]);

  const onSubmit = async (data: z.infer<typeof CourseCreateSchema>) => {
    console.log("Course Form Submitted:", data);
    if (isEditing) {
      updateCourseMutation.mutate(data as z.infer<typeof CourseUpdateSchema>);
    } else {
      createCourseMutation.mutate(data);
    }
  };

  // Tab navigation handlers
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
    setActiveTab("lessons");
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedExerciseId(null);
    setActiveTab("exercises");
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setActiveTab("questions");
  };

  const handleBackToSections = () => {
    setSelectedSectionId(null);
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
    setActiveTab("sections");
  };

  const handleBackToLessons = () => {
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
    setActiveTab("lessons");
  };

  const handleBackToExercises = () => {
    setSelectedExerciseId(null);
    setActiveTab("exercises");
  };

  // Helper functions to get selected data
  const getSelectedSection = () => {
    if (!selectedSectionId || !courseData?.sections) return null;
    return courseData.sections.find(
      (section: any) => section.id === selectedSectionId
    );
  };

  const getSelectedLesson = () => {
    if (!selectedLessonId) return null;
    const section = getSelectedSection();
    if (!section?.lessons) return null;
    return section.lessons.find(
      (lesson: any) => lesson.id === selectedLessonId
    );
  };

  // Define a minimal type for exercises returned from API
  type Exercise = {
    id: string;
    title?: string;
    questions?: any[];
  };

  // Get selected exercise from exerciseData instead of lesson.exercises
  const getSelectedExercise = () => {
    if (!selectedExerciseId || !exerciseData) return null;

    const exercises = exerciseData as Exercise | Exercise[];

    if (Array.isArray(exercises)) {
      return (
        exercises.find(
          (exercise: Exercise) => exercise.id === selectedExerciseId
        ) || null
      );
    }

    // If it's a single exercise object
    if (exercises && typeof exercises === "object" && "id" in exercises) {
      return (exercises as Exercise).id === selectedExerciseId
        ? (exercises as Exercise)
        : null;
    }

    return null;
  };

  // Helper functions to get counts
  const getTotalSections = () => courseData?.sections?.length || 0;

  const getTotalLessons = () => {
    if (!selectedSectionId) return 0;
    const section = getSelectedSection();
    return section?.lessons?.length || 0;
  };

  const getTotalExercises = () => {
    if (!exerciseData) return 0;
    const exercises = exerciseData as Exercise | Exercise[];
    if (Array.isArray(exercises)) return exercises.length;
    return exercises && typeof exercises === "object" && "id" in exercises
      ? 1
      : 0;
  };

  const getTotalQuestions = () => {
    const exercise = getSelectedExercise();
    if (!exercise) return 0;
    return exercise?.questions?.length || 0;
  };

  // Refresh handler
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["course", slug] });
    queryClient.invalidateQueries({ queryKey: ["sections", slug] });
    if (selectedLessonId) {
      queryClient.invalidateQueries({
        queryKey: ["exercises", selectedLessonId],
      });
    }
    refetch();
    if (selectedLessonId) {
      refetchExercises();
    }
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
        <div className="space-y-8">
          {/* Course Form Section */}
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
                          name="teacher_id"
                          label="Teacher"
                          placeholder="Select teacher"
                          options={teacherOptions}
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Course Thumbnail */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span>Course Thumbnail</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FileUploadField
                        control={courseForm.control}
                        name="thumbnail"
                        label="Thumbnail Image"
                        accept="image/*"
                        currentImage={isEditing ? courseData?.thumbnail : ""}
                        maxSize={5}
                        multiple={false}
                        placeholder="Click to upload course thumbnail"
                        description="Recommended: 1200x630px, JPG or PNG, max 5MB"
                      />
                    </CardContent>
                  </Card>

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
                </div>
              </div>
            </form>
          </Form>

          {/* Content Management Tabs - Only show when editing */}
          {isEditing && courseData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="h-5 w-5 text-purple-600" />
                  <span>Course Content Management</span>
                  <Badge variant="outline">{getTotalSections()} sections</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger
                      value="sections"
                      className="flex items-center space-x-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Sections</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="lessons"
                      className="flex items-center space-x-2"
                      disabled={!selectedSectionId}
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>Lessons</span>
                      {selectedSectionId && getTotalLessons() > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {getTotalLessons()}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="exercises"
                      className="flex items-center space-x-2"
                      disabled={!selectedLessonId}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Exercises</span>
                      {selectedLessonId && getTotalExercises() > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {getTotalExercises()}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="questions"
                      className="flex items-center space-x-2"
                      disabled={!selectedExerciseId}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Questions</span>
                      {selectedExerciseId && getTotalQuestions() > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {getTotalQuestions()}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Breadcrumb Navigation */}
                  <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
                    <button
                      onClick={handleBackToSections}
                      className="hover:text-blue-600 transition-colors"
                    >
                      Sections
                    </button>

                    {selectedSectionId && (
                      <>
                        <span>/</span>
                        <button
                          onClick={handleBackToLessons}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {getSelectedSection()?.title || "Section"} - Lessons
                        </button>
                      </>
                    )}

                    {selectedLessonId && (
                      <>
                        <span>/</span>
                        <button
                          onClick={handleBackToExercises}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {getSelectedLesson()?.title || "Lesson"} - Exercises
                        </button>
                      </>
                    )}

                    {selectedExerciseId && (
                      <>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">
                          {getSelectedExercise()?.title || "Exercise"} -
                          Questions
                        </span>
                      </>
                    )}
                  </div>

                  <TabsContent value="sections">
                    <SectionTab
                      courseData={courseData}
                      selectedSectionId={selectedSectionId}
                      onSectionSelect={handleSectionSelect}
                      onRefresh={handleRefresh}
                    />
                  </TabsContent>

                  <TabsContent value="lessons">
                    <LessonTab
                      section={getSelectedSection()}
                      selectedLessonId={selectedLessonId}
                      onLessonSelect={handleLessonSelect}
                      onBack={handleBackToSections}
                      onRefresh={handleRefresh}
                    />
                  </TabsContent>

                  <TabsContent value="exercises">
                    <ExerciseTab
                      lesson={getSelectedLesson()}
                      selectedExerciseId={selectedExerciseId}
                      onExerciseSelect={handleExerciseSelect}
                      onBack={handleBackToLessons}
                      onRefresh={handleRefresh}
                    />
                  </TabsContent>

                  <TabsContent value="questions">
                    <QuestionTab
                      exercise={getSelectedExercise()}
                      lesson={getSelectedLesson()}
                      exerciseData={exerciseData}
                      isExerciseLoading={isExerciseLoading}
                      isExerciseError={isExerciseError}
                      onBack={handleBackToExercises}
                      onRefresh={handleRefresh}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseForm;

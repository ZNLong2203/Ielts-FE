"use client";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { TextInfoField, DateInfoField } from "@/components/ui/info";
import {
  Edit,
  Tag,
  BookOpen,
  Star,
  BarChart3,
  GraduationCap,
  Users,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  User,
  Award,
  ArrowRight,
  Banknote
} from "lucide-react";

import { getAdminCourseDetail } from "@/api/course";
import ROUTES from "@/constants/route";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Import the new components
import CourseContentTabs from "./detail/courseDetailContentTab";

const CourseDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    refetch,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => getAdminCourseDetail(slug),
    enabled: !!slug,
  });

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill?.toLowerCase()) {
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "writing":
        return "bg-purple-100 text-purple-800";
      case "listening":
        return "bg-orange-100 text-orange-800";
      case "speaking":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalLessons = () => {
    return courseData?.sections?.reduce((total: any, section: any) => 
      total + (section.lessons?.length || 0), 0) || 0;
  };

  if (courseLoading) {
    return <Loading />;
  }

  if (courseError || !course) {
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

  const courseData = course;

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
              <Heading
                title={`Course: ${courseData.title}`}
                description="Course information and content overview"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_COURSES}/${slug}/update`)
                }
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Update Course</span>
              </Button>
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
            {/* Course Thumbnail */}
            {courseData.thumbnail && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Course Thumbnail</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={courseData.thumbnail}
                      alt={courseData.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Course Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <TextInfoField
                      label="Course Title"
                      value={courseData.title}
                    />

                    <TextInfoField
                      label="Category"
                      value={courseData.category?.name || "Uncategorized"}
                    />

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Skill Focus
                      </label>
                      <Badge
                        className={cn(
                          "text-xs",
                          getSkillColor(courseData.skill_focus)
                        )}
                      >
                        {courseData.skill_focus?.charAt(0).toUpperCase() +
                          courseData.skill_focus?.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Difficulty Level
                      </label>
                      <Badge
                        className={cn(
                          "text-xs",
                          getDifficultyColor(courseData.difficulty_level)
                        )}
                      >
                        {courseData.difficulty_level?.charAt(0).toUpperCase() +
                          courseData.difficulty_level?.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        Featured:
                      </label>
                      <Badge
                        variant={
                          courseData.is_featured ? "default" : "secondary"
                        }
                        className={
                          courseData.is_featured
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                      >
                        {courseData.is_featured ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          "No"
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {courseData.estimated_duration} hours
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Banknote className="h-4 w-4 text-green-500" />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {Number(courseData.price)?.toLocaleString()} VND
                        </span>
                        {courseData.discount_price &&
                          parseFloat(courseData.discount_price) <
                            parseFloat(courseData.price) && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700"
                            >
                              {Number(
                                courseData.discount_price
                              )?.toLocaleString()}{" "}
                              VND
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <TextInfoField
                      label="Description"
                      value={courseData.description}
                    />
                  </div>

                  <DateInfoField
                    label="Created At"
                    value={courseData.created_at}
                  />
                  <DateInfoField
                    label="Updated At"
                    value={courseData.updated_at}
                  />
                </div>

                {courseData.tags && courseData.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {courseData.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

                {/* Teacher Information */}
            {courseData.teacher && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-green-600" />
                    <span>Teacher Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      {courseData.teacher.avatar ? (
                        <div className="relative">
                          <Image
                            src={courseData.teacher.avatar}
                            alt={courseData.teacher.name}
                            width={100}
                            height={100}
                            className="w-20 h-20 rounded-full object-cover border-3 border-green-200 shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-3 border-green-300 shadow-lg">
                            <User className="h-10 w-10 text-green-600" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xl font-bold text-gray-900">
                            {courseData.teacher.name || "Unknown Teacher"}
                          </h4>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Instructor
                          </Badge>
                        </div>
                        <p className="text-sm text-green-600 font-medium flex items-center space-x-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>Course Instructor & IELTS Expert</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {courseData.teacher.qualification ? (
                          <div className="group hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                              <div className="flex-shrink-0 p-2 bg-blue-500 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                                  Qualification
                                </p>
                                <p className="text-sm text-blue-900 font-medium leading-tight">
                                  {courseData.teacher.qualification}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="group hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                              <div className="flex-shrink-0 p-2 bg-gray-400 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                  Qualification
                                </p>
                                <p className="text-sm text-gray-500 font-medium leading-tight">
                                  Not specified
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {courseData.teacher.experience_years ? (
                          <div className="group hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                              <div className="flex-shrink-0 p-2 bg-purple-500 rounded-lg">
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
                                  Experience
                                </p>
                                <p className="text-sm text-purple-900 font-medium leading-tight">
                                  {courseData.teacher.experience_years} years
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="group hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                              <div className="flex-shrink-0 p-2 bg-gray-400 rounded-lg">
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                  Experience
                                </p>
                                <p className="text-sm text-gray-500 font-medium leading-tight">
                                  Not specified
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ✅ Use the new CourseContentTabs component */}
            <CourseContentTabs courseData={courseData} />

            {/* Requirements */}
            {courseData.requirements && courseData.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <span>Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courseData.requirements.map((requirement: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What You Learn */}
            {courseData.what_you_learn && courseData.what_you_learn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span>What Students Will Learn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courseData.what_you_learn.map((learning: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                      >
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{learning}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
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

                  {courseData.discount_price &&
                    parseFloat(courseData.discount_price) <
                      parseFloat(courseData.price) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-red-600">
                          {Number(courseData.discount_price)?.toLocaleString()}{" "}
                          VND
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured:</span>
                    <span className="text-sm font-medium">
                      {courseData.is_featured ? "Yes" : "No"}
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
                    <span className="text-sm text-gray-600">Tags:</span>
                    <span className="text-sm font-medium">
                      {courseData.tags?.length || 0}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-gray-500">
                  <div>ID: {courseData.id}</div>
                  <div>
                    Created:{" "}
                    {format(new Date(courseData.created_at), "MMM dd, yyyy")}
                  </div>
                  {courseData.published_at && (
                    <div>
                      Published:{" "}
                      {format(
                        new Date(courseData.published_at),
                        "MMM dd, yyyy"
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span>Course Summary</span>
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
                    <GraduationCap className="h-3 w-3" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
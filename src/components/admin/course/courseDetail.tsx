"use client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Eye,
  Calendar,
  Tag,
  Share2,
  BookOpen,
  Star,
  BarChart3,
  GraduationCap,
  Users,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  Play,
  Trash2,
  Settings,
} from "lucide-react";

import { getAdminCourseDetail } from "@/api/course";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { cn } from "@/lib/utils";

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
    switch (level) {
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
    switch (skill) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading
                title="Course Details"
                description="Course information and content overview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
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
                    <TextInfoField label="Course Title" value={course.title} />

                    <TextInfoField
                      label="Category"
                      value={course.category.name || "Uncategorized"}
                    />

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Skill Focus
                      </label>
                      <Badge
                        className={cn(
                          "text-xs",
                          getSkillColor(course.skill_focus)
                        )}
                      >
                        {course.skill_focus?.charAt(0).toUpperCase() +
                          course.skill_focus?.slice(1)}
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
                          getDifficultyColor(course.difficulty_level)
                        )}
                      >
                        {course.difficulty_level?.charAt(0).toUpperCase() +
                          course.difficulty_level?.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        Featured:
                      </label>
                      <Badge
                        variant={course.is_featured ? "default" : "secondary"}
                        className={
                          course.is_featured
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                      >
                        {course.is_featured ? (
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
                        {course.estimated_duration} hours
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {course.price?.toLocaleString()} VND
                        </span>
                        {course.discount_price &&
                          course.discount_price < course.price && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700"
                            >
                              {course.discount_price?.toLocaleString()} VND
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <TextInfoField
                      label="Description"
                      value={course.description}
                    />
                  </div>

                  <DateInfoField label="Created At" value={course.created_at} />

                  <DateInfoField label="Updated At" value={course.updated_at} />
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
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

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <span>Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.requirements.map((requirement, index) => (
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
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span>What Students Will Learn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.what_you_learn.map((learning, index) => (
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

            {/* Course Outline */}
            {course.course_outline?.sections &&
              course.course_outline.sections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                      <span>Course Outline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.course_outline.sections.map(
                        (section, sectionIndex) => (
                          <div
                            key={sectionIndex}
                            className="border rounded-lg p-4"
                          >
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-medium">
                                {sectionIndex + 1}
                              </div>
                              {section.title}
                            </h4>
                            <div className="space-y-2 ml-8">
                              {section.lessons?.map((lesson, lessonIndex) => (
                                <div
                                  key={lessonIndex}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <Play className="h-3 w-3 text-gray-400" />
                                  {lesson}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Column - Statistics & Actions */}
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
                      {course.estimated_duration} hours
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium">
                      {course.price?.toLocaleString()} VND
                    </span>
                  </div>

                  {course.discount_price &&
                    course.discount_price < course.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-red-600">
                          {course.discount_price?.toLocaleString()} VND
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured:</span>
                    <span className="text-sm font-medium">
                      {course.is_featured ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sections:</span>
                    <span className="text-sm font-medium">
                      {course.course_outline?.sections?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tags:</span>
                    <span className="text-sm font-medium">
                      {course.tags?.length || 0}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-gray-500">
                  <div>ID: {course.id}</div>
                  <div>
                    Created: {new Date(course.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`${ROUTES.ADMIN_COURSES}/${slug}/update`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Course
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`/courses/${slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            {/* Course Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-2">
                    {course.title}
                  </div>
                  <div className="text-gray-600 line-clamp-3">
                    {course.description}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{course.skill_focus}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{course.difficulty_level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.estimated_duration}h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{course.price?.toLocaleString()}</span>
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

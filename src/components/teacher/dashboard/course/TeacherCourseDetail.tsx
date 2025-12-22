"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { AlertModal } from "@/components/modal/alert-modal";
import { TextInfoField } from "@/components/ui/info";
import {
  Edit,
  Tag,
  Star,
  BarChart3,
  BookOpen,
  DollarSign,
  Target,
  CheckCircle,
  List,
  GraduationCap,
  ArrowRight,
  Users,
} from "lucide-react";
import { getQueryClient } from "@/utils/getQueryClient";
import { getAdminCourseDetail, deleteAdminCourse } from "@/api/course";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import Image from "next/image";

const TeacherCourseDetail = () => {
  const [open, setOpen] = useState(false);
  const queryClient = getQueryClient();
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["teacherCourse", slug],
    queryFn: () => getAdminCourseDetail(slug),
    enabled: !!slug,
  });

  const { mutate: deleteCourse, isPending } = useMutation({
    mutationFn: deleteAdminCourse,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete course");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      setOpen(false);
      toast.success("Course deleted successfully");
      router.push(ROUTES.TEACHER_COURSES);
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(parseFloat(price));
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !course) {
    return (
      <Error
        title="Course Not Found"
        description="The requested course does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.TEACHER_COURSES)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteCourse(slug)}
        loading={isPending}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Heading
                  title="Course Details"
                  description="Course information and statistics"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="default"
                  onClick={() =>
                    router.push(`${ROUTES.TEACHER_COURSES}/${slug}/students`)
                  }
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4" />
                  <span>View learner progress</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`${ROUTES.TEACHER_COURSES}`)
                  }
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
                      <TextInfoField
                        label="Course Title"
                        value={course.title}
                      />

                      <TextInfoField
                        label="Category"
                        value={course.category?.name || "Uncategorized"}
                      />

                      <TextInfoField
                        label="Skill Focus"
                        value={course.skill_focus}
                      />

                      <TextInfoField
                        label="Difficulty Level"
                        value={course.difficulty_level}
                      />
                    </div>

                    <div className="space-y-4">
                      <TextInfoField
                        label="Duration (hours)"
                        value={course.estimated_duration}
                      />

                      <TextInfoField
                        label="Price"
                        value={formatPrice(course.price)}
                      />

                      {course.discount_price && (
                        <TextInfoField
                          label="Discount Price"
                          value={formatPrice(course.discount_price)}
                        />
                      )}

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
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <p className="text-sm text-gray-600">
                      {course.description}
                    </p>
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

              {/* Thumbnail */}
              {course.thumbnail && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <span>Course Thumbnail</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What You'll Learn */}
              {course.what_you_learn && course.what_you_learn.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span>What You'll Learn</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.what_you_learn.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <List className="h-5 w-5 text-orange-600" />
                      <span>Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Teacher Information */}
              {course.teacher && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                      <span>Teacher Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      {course.teacher.avatar && (
                        <Image
                          src={course.teacher.avatar}
                          alt={course.teacher.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {course.teacher.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {course.teacher.qualification}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {course.teacher.experience_years} years exp
                          </span>
                        </div>
                      </div>
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
                      <span className="text-sm text-gray-600">Featured:</span>
                      <span className="text-sm font-medium">
                        {course.is_featured ? "Yes" : "No"}
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
                    {course.published_at && (
                      <div>
                        Published:{" "}
                        {new Date(course.published_at).toLocaleDateString()}
                      </div>
                    )}
                    {course.created_at && (
                      <div>
                        Created:{" "}
                        {new Date(course.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(course.price)}
                      </span>
                    </div>

                    {course.discount_price && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Discount Price:
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(course.discount_price)}
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <span className="text-sm font-medium text-green-700">
                            Save{" "}
                            {(
                              ((parseFloat(course.price) -
                                parseFloat(course.discount_price)) /
                                parseFloat(course.price)) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherCourseDetail;

"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getStudent } from "@/api/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  BookOpen,
  Target,
  Clock,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Globe,
  GraduationCap,
  Star,
  Key,
  Activity,
  UserCircle,
  Languages,
  Trophy,
  Settings,
} from "lucide-react";
import ROUTES from "@/constants/route";
import Heading from "@/components/ui/heading";

const StudentDetail = () => {
  const userId = useParams().userId as string;
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ["studentDetail", userId],
    queryFn: () => getStudent(userId),
    retry: false,
  });

  // Helper functions
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") || "U"
    );
  };

  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "Not set";
  };

  const formatDateTime = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleString() : "Never";
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm text-muted-foreground">
          Loading student details...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Error loading student details
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <User className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-muted-foreground">Student not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
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
                title="Student Details"
                description="Comprehensive student profile and academic information"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_STUDENTS}/edit/${userId}`)
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Student
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={data?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(data?.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {data?.full_name || "Student"}
                </CardTitle>
                <p className="text-sm text-gray-500">{data?.email}</p>

                {/* Email Verification Status */}
                <div className="flex items-center justify-center mt-2">
                  {data?.email_verified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Email Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Email Unverified</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-blue-600">
                      {data?.students?.current_level || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">Current Level</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-green-600">
                      {data?.students?.target_ielts_score || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">Target Score</div>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.gender || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.phone || "No phone"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.city && data?.country
                        ? `${data.city}, ${data.country}`
                        : data?.city || data?.country || "No location"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.login_count || 0} logins
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Account Status */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                    Account Status
                  </h4>
                  <Badge
                    variant={getStatusVariant(data?.status || "")}
                    className="w-full justify-center"
                  >
                    {data?.status
                      ? data.status.charAt(0).toUpperCase() +
                        data.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.full_name || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.gender || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.date_of_birth
                          ? new Date(data.date_of_birth).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-900">{data?.email}</p>
                        {data?.email_verified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.phone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.city && data?.country
                          ? `${data.city}, ${data.country}`
                          : data?.city || data?.country || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span>Academic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Current IELTS Level
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.students?.current_level || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Target IELTS Score
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.students?.target_ielts_score || "Not set"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Language Preference
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.students?.language_preference || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.students?.timezone || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Student Since
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.students?.created_at
                          ? new Date(
                              data.students.created_at
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Learning Goals */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700">
                    Learning Goals
                  </label>
                  <div className="mt-2">
                    {data?.students?.learning_goals &&
                    data.students.learning_goals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.students.learning_goals.map(
                          (goal: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {goal}
                            </Badge>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No specific goals set
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {data?.students?.bio && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">
                      Biography
                    </label>
                    <p className="mt-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {data.students.bio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account & Security Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Account & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Account Status
                      </label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(data?.status || "")}>
                          {data?.status
                            ? data.status.charAt(0).toUpperCase() +
                              data.status.slice(1)
                            : "Unknown"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.role?.toUpperCase() || "STUDENT"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Total Logins
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.login_count || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Member Since
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.created_at
                          ? new Date(data.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Last Login
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.last_login
                          ? new Date(data.last_login).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Password Status
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-900">
                          {data?.password ? "Password set" : "No password"}
                        </p>
                        {data?.password ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
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

export default StudentDetail;

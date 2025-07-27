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
  Phone,
  MapPin,
  Shield,
  BookOpen,
  Target,
  Edit,
  CheckCircle,
  XCircle,
  GraduationCap,
  Activity,
  UserCircle,
  Settings,
} from "lucide-react";
import ROUTES from "@/constants/route";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import {
  DateInfoField,
  TextBadgeInfo,
  TextIconInfo,
  TextInfoField,
} from "@/components/ui/info";

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

  if (isPending) {
    return <Loading />;
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
                  <TextIconInfo
                    icon={UserCircle}
                    value={`Gender: ${
                      data?.gender
                        ? data.gender.charAt(0).toLocaleUpperCase() +
                          data.gender.slice(1)
                        : "Not provided"
                    }`}
                  />

                  <TextIconInfo
                    icon={Phone}
                    value={`Phone: ${data?.phone || "Not provided"}`}
                  />

                  <TextIconInfo icon={MapPin} value={`Location: ${data?.city}, ${data?.country}`} />

                  <TextIconInfo
                    icon={Activity}
                    value={`Login count: ${data?.login_count || 0} logins`}
                  />
                </div>

                <Separator />

                {/* Account Status */}
                <TextBadgeInfo
                  status={data?.status || "Unknown"}
                  label="Account Status"
                />
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
                    <TextInfoField
                      label="Full Name"
                      value={data?.full_name || "Not provided"}
                    />

                    <TextInfoField
                      label="Gender"
                      value={data?.gender || "Not specified"}
                    />

                    <TextInfoField
                      label="Date of Birth"
                      value={
                        data?.date_of_birth
                          ? new Date(data.date_of_birth).toLocaleDateString()
                          : "Not provided"
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <TextInfoField
                      label="Email Address"
                      value={data?.email || "Not provided"}
                      verified={data?.email_verified}
                      IconNeg={XCircle}
                      IconPos={CheckCircle}
                    />

                    <TextInfoField
                      label="Phone Number"
                      value={data?.phone || "Not provided"}
                    />

                    <TextInfoField
                      label="Location"
                      value={
                        data?.city && data?.country
                          ? `${data.city}, ${data.country}`
                          : data?.city || data?.country || "Not provided"
                      }
                    />
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
                    <TextInfoField
                      label="Current IELTS Level"
                      value={data?.students?.current_level || "Not specified"}
                    />

                    <TextInfoField
                      label="Target IELTS Score"
                      value={data?.students?.target_ielts_score || "Not set"}
                    />

                    <TextInfoField
                      label="Language Preference"
                      value={
                        data?.students?.language_preference || "Not specified"
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <TextInfoField
                      label="Timezone"
                      value={data?.students?.timezone || "Not specified"}
                    />

                    <DateInfoField
                      label="Student Since"
                      value={
                        data?.students?.created_at
                          ? new Date(
                              data.students.created_at
                            ).toLocaleDateString()
                          : "Unknown"
                      }
                    />
                  </div>
                </div>

                {/* Learning Goals */}
                <div className="my-6">
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

                <TextInfoField
                  label="Bio"
                  value={data?.students?.bio || "No biography provided"}
                />
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
                    <TextBadgeInfo
                      status={data?.status || "Unknown"}
                      label="Account Status"
                    />

                    <TextInfoField
                      label="Role"
                      value={data?.role?.toUpperCase() || "STUDENT"}
                    />

                    <TextInfoField
                      label="Login Count"
                      value={data?.login_count?.toString() || "0"}
                    />
                  </div>

                  <div className="space-y-4">
                    <DateInfoField
                      label="Member Since"
                      value={
                        data?.created_at
                          ? new Date(data.created_at).toLocaleDateString()
                          : "Unknown"
                      }
                    />

                    <DateInfoField
                      label="Last Login"
                      value={
                        data?.last_login
                          ? new Date(data.last_login).toLocaleDateString()
                          : "Unknown"
                      }
                    />

                    <TextInfoField
                      label="Password Status"
                      value={data?.password ? "Password set" : "No password"}
                      verified={!!data?.password}
                      IconNeg={XCircle}
                      IconPos={CheckCircle}
                    />
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

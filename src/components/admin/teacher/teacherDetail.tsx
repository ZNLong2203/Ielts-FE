"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getTeacher } from "@/api/teacher";
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
  Award,
  Edit,
  CheckCircle,
  XCircle,
  GraduationCap,
  Activity,
  UserCircle,
  Settings,
  Clock,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import ROUTES from "@/constants/route";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import {
  ContactInfoItem,
  DateInfoField,
  TextInfoField,
} from "@/components/ui/info";

const TeacherDetail = () => {
  const teacherId = useParams().userId as string;
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ["teacherDetail", teacherId],
    queryFn: () => getTeacher(teacherId),
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
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getApprovalVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
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
        .join("") || "T"
    );
  };

  if (isPending) {
    return <Loading />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <User className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-muted-foreground">Teacher not found</p>
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
                title="Teacher Details"
                description="Comprehensive teacher profile and professional information"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`${ROUTES.ADMIN_TEACHERS}/edit/${teacherId}`)
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Teacher
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
                  {data?.full_name || "Teacher"}
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
                    <Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-blue-600">
                      {data?.teachers?.ielts_band_score || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">IELTS Score</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-green-600">
                      {data?.teachers?.experience_years || "0"}
                    </div>
                    <div className="text-xs text-gray-600">Years Exp.</div>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <ContactInfoItem icon={UserCircle} value={data?.gender} />

                  <ContactInfoItem
                    icon={Phone}
                    value={data?.phone || "No phone"}
                  />
                  <ContactInfoItem
                    icon={MapPin}
                    value={data?.country || "No location"}
                  />
                  <ContactInfoItem
                    icon={Activity}
                    value={`${data?.login_count || 0} logins`}
                  />
                </div>

                <Separator />

                {/* Account Status */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                    Account Status
                  </h4>
                  <Badge variant={getStatusVariant(data?.status || "")}>
                    {data?.status
                      ? data.status.charAt(0).toUpperCase() +
                        data.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </div>

                {/* Approval Status */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                    Approval Status
                  </h4>
                  <Badge
                    variant={getApprovalVariant(data?.teachers?.status || "")}
                  >
                    {data?.teachers?.status === "approved"
                      ? "Approved"
                      : data?.teachers?.status === "rejected"
                      ? "Rejected"
                      : "Pending"}
                  </Badge>
                </div>

                {/* Specializations */}
                {data?.teachers?.specializations &&
                  data.teachers.specializations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">
                        Specializations
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {data.teachers.specializations
                          .slice(0, 3)
                          .map((spec: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                        {data.teachers.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{data.teachers.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
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
                    <TextInfoField label="Full Name" value={data?.full_name} />

                    <TextInfoField label="Gender" value={data?.gender} />

                    <DateInfoField
                      label="Date of Birth"
                      value={data?.date_of_birth}
                    />

                    <TextInfoField
                      label="Country"
                      value={data?.country || "Not provided"}
                    />
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

                    <TextInfoField label="Phone Number" value={data?.phone} />
                    <TextInfoField
                      label="Role"
                      value={data?.role?.toUpperCase() || "TEACHER"}
                    />
                    <TextInfoField label="City" value={data?.city} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <TextInfoField
                      label="Teaching Experience"
                      value={
                        data?.teachers?.experience_years
                          ? `${data.teachers.experience_years} years`
                          : "Not specified"
                      }
                    />

                    <TextInfoField
                      label="Qualification"
                      value={data?.teachers?.qualification || "Not provided"}
                    />

                    <TextInfoField
                      label="IELTS Band Score"
                      value={data?.teachers?.ielts_band_score || "Not provided"}
                    />
                  </div>

                  <div className="space-y-4">
                    <DateInfoField
                      label="Teaching Since"
                      value={data?.teachers?.created_at}
                    />

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Profile Status
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
                        Application Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {data?.created_at
                          ? new Date(data.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700">
                    Teaching Specializations
                  </label>
                  <div className="mt-2">
                    {data?.teachers?.specializations &&
                    data.teachers.specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.teachers.specializations.map(
                          (spec: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No specializations specified
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents & Files */}
            {(data?.avatar || data?.teachers?.certification_urls) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Documents & Files</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Profile Picture */}
                    {data?.avatar && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Profile Picture
                            </p>
                            <p className="text-xs text-gray-500">Image file</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Certificates */}
                    {data?.teachers?.certification_urls &&
                      data.teachers.certification_urls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Certificates (
                            {data.teachers.certification_urls.length})
                          </h4>
                          <div className="space-y-2">
                            {data.teachers.certification_urls.map(
                              (cert: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                      <Award className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        Certificate {index + 1}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {typeof cert === "string"
                                          ? "Document file"
                                          : cert.name || "Document file"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

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
                        Approval Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={getApprovalVariant(
                            data?.teachers?.status || ""
                          )}
                        >
                          {data?.teachers?.status
                            ? data.teachers.status.charAt(0).toUpperCase() +
                              data.teachers.status.slice(1)
                            : "Pending Review"}
                        </Badge>
                      </div>
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
                          : "Never"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Verification
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-900">
                          {data?.email_verified ? "Verified" : "Unverified"}
                        </p>
                        {data?.email_verified ? (
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

export default TeacherDetail;

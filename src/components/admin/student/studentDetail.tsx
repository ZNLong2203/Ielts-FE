"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getStudent } from "@/api/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  BookOpen,
  Target,
  Trophy,
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import Heading from "@/components/ui/heading";


const StudentDetail = () => {
  const userId = useParams().userId as string;
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ["studentDetail", userId],
    queryFn: () => getStudent(userId),
    retry: false,
  });

  const response = data;

  // Helper function để lấy badge variant dựa trên status
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

  // Helper function để lấy initials
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Heading title="Student Details" description="Comprehensive student information" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                {response?.avatar ? (
                  <AvatarImage src={response?.avatar} alt={response?.full_name} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(response?.full_name || "")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{response?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{response?.email}</p>
                <div className="flex items-center justify-center mt-1">
                  {response?.email_verified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Unverified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {response?.students?.current_level || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current Level
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {response?.students?.target_ielts_score || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target Score
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {response?.login_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Login Count</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {response?.status === "active" ? "Active" : "Inactive"}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Student ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {response?.students?.id}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.full_name}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.gender || "Not provided"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.country || "Not provided"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">City</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.city || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.email}
                    </p>
                  </div>
                  {response?.email_verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {response?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.created_at
                        ? new Date(response?.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.last_login
                        ? new Date(response?.last_login).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  IELTS Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Current Level</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {response?.students?.current_level || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Target Score</p>
                    <p className="text-2xl font-bold text-green-500">
                      {response?.students?.target_ielts_score || "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">
                    Language Preference
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {response?.students?.language_preference || "Not set"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Learning Goals</p>
                  <div className="text-sm text-muted-foreground">
                    {response?.students?.learning_goals && response.students.learning_goals.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {response.students.learning_goals.map(
                          (goal: string, index: number) => (
                            <li key={index}>{goal}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "No specific goals set"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Bio</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {response?.students?.bio || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {response?.students?.user_id || "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Student Created</p>
                  <p className="text-sm text-muted-foreground">
                    {response?.students?.created_at
                      ? new Date(response?.students?.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {response?.students?.updated_at
                      ? new Date(response?.students?.updated_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Password Status</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.password ? "Password set" : "No password"}
                    </p>
                  </div>
                  {response?.password ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {response?.email_verified
                        ? "Verified"
                        : "Pending verification"}
                    </p>
                  </div>
                  {response?.email_verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <Badge
                      variant={getStatusVariant(response?.status || "")}
                      className="mt-1"
                    >
                      {response?.status
                        ? response.status.charAt(0).toUpperCase() + response.status.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Login Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Total Logins</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {response?.login_count || 0}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {response?.last_login
                      ? new Date(response?.last_login).toLocaleString()
                      : "Never logged in"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Account Role</p>
                  <Badge variant="outline" className="mt-1">
                    {response?.role?.toUpperCase() || "STUDENT"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetail;
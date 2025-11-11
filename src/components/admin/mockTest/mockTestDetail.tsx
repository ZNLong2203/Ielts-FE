"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Target,
  Clock,
  Star,
  Settings,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Share2,
  BookOpen,
  Volume2,
  PenTool,
  Mic,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMockTest, deleteMockTest, updateMockTest } from "@/api/mockTest";
import ROUTES from "@/constants/route";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

const MockTestDetail = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  // Queries
  const {
    data: mockTest,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mockTest", mockTestId],
    queryFn: () => getMockTest(mockTestId),
    enabled: !!mockTestId,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () => deleteMockTest(mockTestId),
    onSuccess: () => {
      toast.success("Mock test deleted successfully! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["mockTests"] });
      router.push(ROUTES.ADMIN_MOCK_TESTS);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete mock test"
      );
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      updateMockTest(mockTestId, { deleted: isActive }),
    onSuccess: (data) => {
      toast.success(
        `Mock test ${data.deleted ? "deleted" : "activated"} successfully! ${
          data.deleted ? "🗑️" : "✅"
        }`
      );
      queryClient.invalidateQueries({ queryKey: ["mockTest", mockTestId] });
      queryClient.invalidateQueries({ queryKey: ["mockTests"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update mock test status"
      );
    },
  });

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  };

  // Helper functions
  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "full_test":
        return <Target className="h-5 w-5" />;
      case "listening":
        return <Volume2 className="h-5 w-5" />;
      case "reading":
        return <BookOpen className="h-5 w-5" />;
      case "writing":
        return <PenTool className="h-5 w-5" />;
      case "speaking":
        return <Mic className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTestTypeLabel = (testType: string) => {
    switch (testType) {
      case "full_test":
        return "Full Test";
      case "listening":
        return "Listening";
      case "reading":
        return "Reading";
      case "writing":
        return "Writing";
      case "speaking":
        return "Speaking";
      default:
        return testType;
    }
  };

  const getSectionTypeIcon = (sectionType: string) => {
    switch (sectionType) {
      case "listening":
        return <Volume2 className="h-4 w-4 text-blue-600" />;
      case "reading":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "writing":
        return <PenTool className="h-4 w-4 text-purple-600" />;
      case "speaking":
        return <Mic className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleToggleActive = () => {
    if (mockTest) {
      toggleActiveMutation.mutate(!mockTest.deleted);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleEdit = () => {
    router.push(`${ROUTES.ADMIN_MOCK_TESTS}/update/${mockTestId}`);
  };

  const handlePreview = () => {
    // Navigate to student view for preview
    window.open(`/mock-test/${mockTestId}`, "_blank");
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/mock-test/${mockTestId}`;
    navigator.clipboard.writeText(link);
    toast.success("Test link copied to clipboard! 📋");
  };

  if (isLoading && !mockTest) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Mock Test Not Found"
        description="The requested mock test does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  if (!mockTest) {
    return null;
  }

  const totalDuration =
    mockTest.test_sections?.reduce(
      (total, section) => total + section.duration,
      0
    ) || 0;

  const sectionsByType =
    mockTest.test_sections?.reduce((acc, section) => {
      const type = section.section_type.split("_")[0]; // listening, reading, writing, speaking
      if (!acc[type]) acc[type] = [];
      acc[type].push(section);
      return acc;
    }, {} as Record<string, any[]>) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getTestTypeIcon(mockTest.test_type)}
                </div>
                <Heading
                  title={mockTest.title}
                  description={mockTest.description || "IELTS Mock Test"}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                variant={mockTest.deleted ? "default" : "secondary"}
                className={
                  mockTest.deleted
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {mockTest.deleted ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {mockTest.deleted ? "Deleted" : "Active"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center space-x-1"
              >
                <Play className="h-4 w-4" />
                <span>Preview</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-1"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Test Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Test Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getTestTypeIcon(mockTest.test_type)}
                    </div>
                    <div className="text-sm text-gray-600">Test Type</div>
                    <div className="font-semibold text-blue-800">
                      {getTestTypeLabel(mockTest.test_type)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold text-green-800">
                      {formatDuration(totalDuration)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5" />
                    </div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="flex items-center justify-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Number(mockTest.difficulty_level)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {mockTest.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">{mockTest.description}</p>
                  </div>
                )}

                {mockTest.instructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Instructions
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {mockTest.instructions}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    <span>Test Sections</span>
                    <Badge variant="outline">
                      {mockTest.test_sections?.length || 0} sections
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTest.test_sections?.map((section, index) => (
                    <div
                      key={section.ordering || index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {section.ordering || index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getSectionTypeIcon(section.section_type)}
                            <h4 className="font-medium">
                              {section.section_name}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(section.duration)}</span>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {section.section_type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      {section.description && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-700">
                            {section.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Section Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(sectionsByType).map(([type, sections]) => (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        {getSectionTypeIcon(type)}
                        <h4 className="font-medium capitalize">{type}</h4>
                        <Badge variant="secondary">
                          {sections.length} section(s)
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        {sections.map((section, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{section.section_name}</span>
                            <span className="text-gray-600">
                              {formatDuration(section.time_limit)}
                            </span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Time:</span>
                          <span>
                            {formatDuration(
                              sections.reduce((sum, s) => sum + s.time_limit, 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handlePreview}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Test
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Test Link
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      // Handle share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: mockTest.title,
                          url: `${window.location.origin}/mock-test/${mockTestId}`,
                        });
                      } else {
                        handleCopyLink();
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Test
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span>Test Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      {mockTest.deleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <label className="text-sm font-medium">
                        {mockTest.deleted ? "Deleted" : "Active"}
                      </label>
                    </div>
                    <div className="text-sm text-gray-600">
                      {mockTest.deleted
                        ? "Test is deleted and not visible to students"
                        : "Test is hidden from students"}
                    </div>
                  </div>
                  <Switch
                    checked={mockTest.deleted}
                    onCheckedChange={handleToggleActive}
                    disabled={toggleActiveMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span>Test Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {mockTest.id}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sections:</span>
                    <span className="font-medium">
                      {mockTest.test_sections?.length || 0}
                    </span>
                  </div>

                  {mockTest.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {formatDate(mockTest.created_at.toString())}
                      </span>
                    </div>
                  )}

                  {mockTest.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {formatDate(mockTest.updated_at.toString())}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete a mock test, there is no going back. Please be
                  certain.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteMutation.isPending
                        ? "Deleting..."
                        : "Delete Mock Test"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Mock Test</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{mockTest.title}"? This
                        action cannot be undone and will permanently remove the
                        test and all associated data including student attempts
                        and results.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Mock Test
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestDetail;

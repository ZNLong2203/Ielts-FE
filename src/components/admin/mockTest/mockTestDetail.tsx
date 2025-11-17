"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Edit3,
  Trash2,
  ArrowRight,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  BookOpen,
  Volume2,
  PenTool,
  Mic,
  Timer,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMockTest, deleteMockTest, updateMockTest } from "@/api/mockTest";
import ROUTES from "@/constants/route";
import { format } from "date-fns";

const MockTestDetail = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(param.slug) ? param.slug[0] : param.slug;
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

  // Helper functions
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP 'at' pp");
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0m";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      return `${mins}m`;
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

  const getSectionTypeColor = (sectionType: string) => {
    switch (sectionType) {
      case "listening":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reading":
        return "bg-green-100 text-green-800 border-green-200";
      case "writing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "speaking":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleEdit = () => {
    router.push(`${ROUTES.ADMIN_MOCK_TESTS}/update/${mockTestId}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !mockTest) {
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

  const totalDuration =
    mockTest.test_sections?.reduce(
      (total, section) => total + section.duration,
      0
    ) || 0;

  const sectionsByType =
    mockTest.test_sections?.reduce((acc, section) => {
      const type = section.section_type.split("_")[0];
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <Heading
                title={mockTest.title}
                description="Mock test details and management"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Update Test</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
                className="flex items-center space-x-2"
              >
                <span>Back to Test list</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Test Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Current Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={mockTest.deleted ? "destructive" : "default"}
                      className={`${
                        mockTest.deleted
                          ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                          : "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                      } px-3 py-1`}
                    >
                      {mockTest.deleted ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </>
                      )}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {mockTest.deleted
                        ? "Hidden from students"
                        : "Visible to students"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Test Timeline */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Test Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Test Created</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(mockTest.created_at.toString())}
                        </p>
                      </div>
                    </div>

                    {mockTest.updated_at !== mockTest.created_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(mockTest.updated_at.toString())}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span>Test Sections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTest.test_sections?.map((section, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getSectionTypeIcon(section.section_type)}
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs ${getSectionTypeColor(
                              section.section_type
                            )}`}
                          >
                            {section.section_type.replace("_", " ")}
                          </Badge>
                        </div>

                        <h4 className="font-medium text-gray-900">
                          {section.section_name}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          Order: {section.ordering || index + 1}
                        </p>

                        {section.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {section.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right space-y-2">
                        <p className="text-md font-semibold text-blue-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(section.duration)}
                        </p>

                        {/* Reading Section Button */}
                        {section.section_type.includes("reading") && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/reading?sectionId=${section.id}`
                              )
                            }
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Manage Reading
                          </Button>
                        )}

                        {/* Listening Section Button */}
                        {section.section_type.includes("listening") && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening?sectionId=${section.id}`
                              )
                            }
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Volume2 className="h-4 w-4 mr-1" />
                            Manage Listening
                          </Button>
                        )}

                        {/* Writing Section Button */}
                        {section.section_type.includes("writing") && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${section.id}`
                              )
                            }
                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <PenTool className="h-4 w-4 mr-1" />
                            Manage Writing
                          </Button>
                        )}

                        {/* Speaking Section Button */}
                        {section.section_type.includes("speaking") && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${section.id}`
                              )
                            }
                            className="ml-2 bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Mic className="h-4 w-4 mr-1" />
                            Manage Speaking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Description */}
            {mockTest.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span>Test Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {mockTest.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Section Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(sectionsByType).map(([type, sections]) => (
                    <div
                      key={type}
                      className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getSectionTypeIcon(type)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold capitalize">
                            {type}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {sections.length} section(s)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {sections.map((section, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-white rounded-lg"
                          >
                            <span className="text-sm font-medium">
                              {section.section_name}
                            </span>
                            <span className="text-sm text-gray-600 font-mono">
                              {formatDuration(section.duration)}
                            </span>
                          </div>
                        ))}

                        <Separator className="my-2" />

                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>Total:</span>
                          <span
                            className={`font-mono ${
                              type === "listening"
                                ? "text-blue-600"
                                : type === "reading"
                                ? "text-green-600"
                                : type === "writing"
                                ? "text-purple-600"
                                : "text-orange-600"
                            }`}
                          >
                            {formatDuration(
                              sections.reduce((sum, s) => sum + s.duration, 0)
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
            {/* Test Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-green-600" />
                  <span>Test Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Test ID:</span>
                    <span className="font-medium text-xs font-mono">
                      {mockTest.id}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Test Type:</span>
                    <span className="font-medium capitalize">
                      {mockTest.test_type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Duration:</span>
                    <span className="font-medium">
                      {formatDuration(totalDuration)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sections:</span>
                    <span className="font-medium">
                      {mockTest.test_sections?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difficulty:</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Number(mockTest.difficulty_level)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Status:</span>
                    <span
                      className={
                        mockTest.deleted ? "text-red-600" : "text-green-600"
                      }
                    >
                      {mockTest.deleted ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Test Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Test Information
                  </h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p>
                      • Visibility: {mockTest.deleted ? "Hidden" : "Public"}
                    </p>
                    <p>
                      • Created: {format(new Date(mockTest.created_at), "PPP")}
                    </p>
                    <p>
                      • Updated: {format(new Date(mockTest.updated_at), "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete this mock test and all associated data.
                  This action cannot be undone.
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
                        will permanently remove:
                        <ul className="mt-2 list-disc list-inside text-sm">
                          <li>The test and all its sections</li>
                          <li>All student attempts and results</li>
                          <li>Analytics and performance data</li>
                        </ul>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Permanently
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

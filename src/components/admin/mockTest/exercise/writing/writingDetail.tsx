"use client";
import React, { useState } from "react";
import { getWritingMockTestExercise } from "@/api/writing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  PenTool,
  Edit3,
  FileText,
  Eye,
  ArrowRight,
  Info,
  BarChart3,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { IWritingMockTestExercise } from "@/api/writing";

type TabType = "overview" | "preview";

const WritingDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const writingExerciseId = Array.isArray(params.writingId)
    ? params.writingId[0]
    : params.writingId;
  const sectionId = searchParams?.get("sectionId") ?? undefined;

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Query
  const {
    data: writingExercise,
    isLoading,
    isError,
    refetch,
  } = useQuery<IWritingMockTestExercise>({
    queryKey: ["writingExercise", writingExerciseId],
    queryFn: async () => getWritingMockTestExercise(writingExerciseId!),
    enabled: !!writingExerciseId,
    retry: 2,
  });

  // Navigation handlers
  const handleBackToList = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${sectionId}`
    );
  };

  const handleEdit = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing/${writingExerciseId}/update?sectionId=${sectionId}`
    );
  };

  // Utility functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !writingExercise) {
    return (
      <Error
        title="Writing Exercise Not Found"
        description="The requested writing exercise does not exist or has been deleted."
        onRetry={() => refetch()}
        onGoBack={handleBackToList}
      />
    );
  }

  const content = writingExercise.writing_content || {};
  const taskType = content.taskType || writingExercise.task_type || "task_1";
  const questionType = content.questionType || writingExercise.question_type || "essay";
  const questionText = content.questionText || writingExercise.question_text || "";
  const questionImage = content.questionImage || writingExercise.question_image;
  const questionChart = content.questionChart || writingExercise.question_chart;
  const wordLimit = content.wordLimit || writingExercise.word_limit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PenTool className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {writingExercise.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Badge className="bg-purple-100 text-purple-800 border-0">
                    {taskType === "task_1" ? "Task 1" : "Task 2"}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    {questionType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Back to List</span>
              </Button>

              <Button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Exercise</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "preview", label: "Full Preview", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-purple-600" />
                    <span>Exercise Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Exercise Title
                      </label>
                      <p className="text-md font-semibold text-gray-900 mt-1">
                        {writingExercise.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Task Type
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-purple-100 text-purple-800 border-0">
                          {taskType === "task_1" ? "Task 1" : "Task 2"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Question Type
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-blue-100 text-blue-800 border-0">
                          {questionType}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Word Limit
                      </label>
                      <p className="text-md font-semibold text-gray-900 mt-1">
                        {wordLimit || "N/A"}
                      </p>
                    </div>
                  </div>

                  {writingExercise.instruction && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Instructions
                      </label>
                      <p className="text-md text-gray-900 mt-1">
                        {writingExercise.instruction}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Time Limit
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {writingExercise.time_limit || 0} min
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        #{writingExercise.ordering || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        Active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Question Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Question Text
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {questionText}
                      </p>
                    </div>
                  </div>

                  {questionImage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Question Image
                      </label>
                      <div className="mt-2">
                        <img
                          src={questionImage}
                          alt="Question image"
                          className="max-w-full h-auto rounded-lg border"
                        />
                      </div>
                    </div>
                  )}

                  {questionChart && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Question Chart Data
                      </label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {typeof questionChart === "string"
                            ? questionChart
                            : JSON.stringify(questionChart, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Exercise Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Exercise Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exercise ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {writingExercise.id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Task Type:</span>
                      <span className="font-medium capitalize">
                        {taskType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Question Type:</span>
                      <span className="font-medium capitalize">
                        {questionType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-medium">
                        {writingExercise.time_limit || 0} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Word Limit:</span>
                      <span className="font-medium">
                        {wordLimit || "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <Card>
            <CardHeader>
              <CardTitle>Full Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {writingExercise.title}
                </h2>
                {writingExercise.instruction && (
                  <p className="text-gray-600 mb-4">{writingExercise.instruction}</p>
                )}
                <div className="p-6 bg-gray-50 rounded-lg border mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap text-lg">
                    {questionText}
                  </p>
                </div>
                {questionImage && (
                  <div className="mb-4">
                    <img
                      src={questionImage}
                      alt="Question image"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
                {wordLimit && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">Word Limit:</span>
                    <span>{wordLimit} words</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WritingDetail;

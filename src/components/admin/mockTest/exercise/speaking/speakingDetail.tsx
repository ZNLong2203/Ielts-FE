"use client";
import React, { useState } from "react";
import { getSpeakingMockTestExercise } from "@/api/speaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  Mic,
  Edit3,
  FileText,
  Eye,
  ArrowRight,
  Info,
  BarChart3,
  Volume2,
  Clock,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { ISpeakingMockTestExercise } from "@/api/speaking";

type TabType = "overview" | "preview";

const SpeakingDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const speakingExerciseId = Array.isArray(params.speakingId)
    ? params.speakingId[0]
    : params.speakingId;
  const sectionId = searchParams?.get("sectionId") ?? undefined;

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Query
  const {
    data: speakingExercise,
    isLoading,
    isError,
    refetch,
  } = useQuery<ISpeakingMockTestExercise>({
    queryKey: ["speakingExercise", speakingExerciseId],
    queryFn: async () => getSpeakingMockTestExercise(speakingExerciseId!),
    enabled: !!speakingExerciseId,
    retry: 2,
  });

  // Navigation handlers
  const handleBackToList = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${sectionId}`
    );
  };

  const handleEdit = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking/${speakingExerciseId}/update?sectionId=${sectionId}`
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !speakingExercise) {
    return (
      <Error
        title="Speaking Exercise Not Found"
        description="The requested speaking exercise does not exist or has been deleted."
        onRetry={() => refetch()}
        onGoBack={handleBackToList}
      />
    );
  }

  const content = speakingExercise.speaking_content || {};
  const partType = content.partType || speakingExercise.part_type || "part_1";
  
  // Try to load from question_groups first (new structure), fallback to content JSON (old structure)
  interface QuestionGroup {
    id: string;
    group_instruction?: string;
    questions?: Array<{
      question_text?: string;
      expected_duration?: number;
      instructions?: string;
      audio_url?: string;
    }>;
  }
  const questionGroups = ((speakingExercise as unknown) as { question_groups?: QuestionGroup[] }).question_groups || [];
  let questions: Array<{ question_text: string; expected_duration?: number; instructions?: string; audio_url?: string }> = [];
  
  if (questionGroups.length > 0) {
    // Flatten all questions from all groups
    questions = questionGroups.flatMap((group: QuestionGroup) => {
      if (group.questions && group.questions.length > 0) {
        // If group has questions, map each question
        return group.questions.map((question) => ({
          question_text: question.question_text || group.group_instruction || '',
          expected_duration: question.expected_duration,
          instructions: group.group_instruction || question.instructions,
          audio_url: question.audio_url,
        }));
      } else {
        // If group has no questions, create one from group_instruction
        return [{
          question_text: group.group_instruction || '',
          expected_duration: undefined,
          instructions: group.group_instruction,
          audio_url: undefined,
        }];
      }
    });
  } else {
    questions = content.questions || speakingExercise.questions || [];
  }
  
  const additionalInstructions = content.additionalInstructions || speakingExercise.additional_instructions;

  const getPartTypeLabel = (part: string) => {
    switch (part) {
      case "part_1":
        return "Part 1 - Introduction & Interview";
      case "part_2":
        return "Part 2 - Long Turn";
      case "part_3":
        return "Part 3 - Discussion";
      default:
        return part;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {speakingExercise.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Badge className="bg-orange-100 text-orange-800 border-0">
                    {getPartTypeLabel(partType)}
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
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
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
                      ? "border-orange-500 text-orange-600"
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
                    <Info className="h-5 w-5 text-orange-600" />
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
                        {speakingExercise.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Part Type
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-orange-100 text-orange-800 border-0">
                          {getPartTypeLabel(partType)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {speakingExercise.instruction && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Instructions
                      </label>
                      <p className="text-md text-gray-900 mt-1">
                        {speakingExercise.instruction}
                      </p>
                    </div>
                  )}

                  {additionalInstructions && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Additional Instructions
                      </label>
                      <p className="text-md text-gray-900 mt-1">
                        {additionalInstructions}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Time Limit
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {speakingExercise.time_limit || 0} min
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Questions
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {questions.length}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        #{speakingExercise.ordering || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <span>Questions ({questions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-semibold text-orange-600">
                              Question {index + 1}
                            </span>
                            {question.expected_duration && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {question.expected_duration}s
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-900 font-medium">
                            {question.question_text || question.questionText || "No question text"}
                          </p>
                          {question.instructions && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Instructions: </span>
                              {question.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      {question.audio_url && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2 mb-2">
                            <Volume2 className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Audio Prompt
                            </span>
                          </div>
                          <audio
                            src={question.audio_url}
                            controls
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
                        {speakingExercise.id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Part Type:</span>
                      <span className="font-medium">
                        {partType.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-medium">
                        {speakingExercise.time_limit || 0} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order:</span>
                      <span className="font-medium">
                        #{speakingExercise.ordering || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
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
                  {speakingExercise.title}
                </h2>
                {speakingExercise.instruction && (
                  <p className="text-gray-600 mb-4">{speakingExercise.instruction}</p>
                )}
                {additionalInstructions && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Additional Instructions:
                    </p>
                    <p className="text-blue-800">{additionalInstructions}</p>
                  </div>
                )}
                <div className="space-y-4 mt-6">
                  {questions.map((question: any, index: number) => (
                    <div
                      key={index}
                      className="p-6 bg-gray-50 rounded-lg border space-y-3"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold text-orange-600">
                          Question {index + 1}
                        </span>
                        {question.expected_duration && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Expected: {question.expected_duration}s
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-gray-900">
                        {question.question_text || question.questionText || "No question text"}
                      </p>
                      {question.instructions && (
                        <p className="text-sm text-gray-600 italic">
                          {question.instructions}
                        </p>
                      )}
                      {question.audio_url && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2 mb-2">
                            <Volume2 className="h-5 w-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Audio Prompt
                            </span>
                          </div>
                          <audio
                            src={question.audio_url}
                            controls
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpeakingDetail;

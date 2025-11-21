"use client";
import React, { useState, useEffect } from "react";
import { getListeningExercise } from "@/api/listening";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  Headphones,
  Edit3,
  Clock,
  Target,
  Hash,
  FileText,
  Eye,
  BarChart3,
  Settings,
  Info,
  Timer,
  Award,
  Volume2,
  CheckCircle,
  Layers,
  Users,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { IListeningExercise } from "@/interface/listening";
import HLSAudioPlayer from "@/components/modal/hsl-audio-player";
import QuestionGroupList from "../questionGroup/questionGroupList";

const DIFFICULTY_LABELS = {
  "1": {
    label: "Beginner",
    color: "bg-green-100 text-green-800 border-green-200",
    stars: 1,
  },
  "2": {
    label: "Elementary",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    stars: 2,
  },
  "3": {
    label: "Intermediate",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    stars: 3,
  },
  "4": {
    label: "Upper Intermediate",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    stars: 4,
  },
  "5": {
    label: "Advanced",
    color: "bg-red-100 text-red-800 border-red-200",
    stars: 5,
  },
} as const;

type TabType = "overview" | "audio" | "questionGroups" | "questions" | "preview";

const ListeningDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const listeningExerciseId = Array.isArray(params.listeningId)
    ? params.listeningId[0]
    : params.listeningId;
  const sectionId = searchParams?.get("sectionId");

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Query
  const {
    data: listeningExercise,
    isLoading,
    isError,
    refetch,
  } = useQuery<IListeningExercise>({
    queryKey: ["listeningExercise", listeningExerciseId],
    queryFn: async () => getListeningExercise(listeningExerciseId!),
    enabled: !!listeningExerciseId,
    retry: 2,
  });

  console.log("Listening Exercise Data:", listeningExercise);

  // Navigation handlers
  const handleBackToList = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening?sectionId=${sectionId}`
    );
  };

  const handleEdit = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening/${listeningExerciseId}/update?sectionId=${sectionId}`
    );
  };

  const handlePreview = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening/${listeningExerciseId}/preview?sectionId=${sectionId}`
    );
  };

  // Utility functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !listeningExercise) {
    return (
      <Error
        title="Listening Exercise Not Found"
        description="The requested listening exercise does not exist or has been deleted."
        onRetry={() => refetch()}
        onGoBack={handleBackToList}
      />
    );
  }

  // Fix: Use listening_passage instead of reading_passage
  const difficulty =
    DIFFICULTY_LABELS[
      listeningExercise.reading_passage
        ?.difficulty_level as keyof typeof DIFFICULTY_LABELS
    ] || DIFFICULTY_LABELS["3"];
  const wordCount = listeningExercise.reading_passage?.word_count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Headphones className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {listeningExercise.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{listeningExercise.reading_passage?.title}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <span>Back to List</span>
              </Button>

              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
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
              { key: "audio", label: "Audio", icon: Volume2 },
              { key: "questionGroups", label: "Question Groups", icon: Layers },
              { key: "questions", label: "Questions", icon: FileText },
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
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {listeningExercise.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Exercise Type
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                        {listeningExercise.exercise_type ||
                          "Listening Comprehension"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Skill Type
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                        {listeningExercise.skill_type || "Listening"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        #{listeningExercise.ordering}
                      </p>
                    </div>
                  </div>

                  {listeningExercise.instruction && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Instructions
                      </label>
                      <div className="mt-2 p-4 bg-purple-50 rounded-lg">
                        <p className="text-gray-700">
                          {listeningExercise.instruction}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio & Transcript Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-green-600" />
                    <span>Audio & Content Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Audio Title
                      </label>
                      <p className="text-md font-semibold text-gray-900 mt-1">
                        {listeningExercise.reading_passage?.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Difficulty Level
                      </label>
                      <div className="mt-1">
                        <Badge className={`${difficulty.color} border`}>
                          <div className="flex items-center space-x-1">
                            <span>{difficulty.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {wordCount}
                      </div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {/* This would come from question groups count */}
                        0
                      </div>
                      <div className="text-sm text-gray-600">Question Groups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {listeningExercise.total_questions || 0}
                      </div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="text-sm font-medium text-gray-600">
                      Content Preview
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 line-clamp-4">
                        {listeningExercise.reading_passage?.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Test Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span>Test Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Time Limit
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {listeningExercise.time_limit} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Passing Score
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {listeningExercise.passing_score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total Points
                      </span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {listeningExercise.total_points || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Listening Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Exercise Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <p>• Average listening speed: ~150 words/min</p>
                  <p>• Recommended for {difficulty.label} level</p>
                  <p>• Listen carefully for key information</p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("questionGroups")}
                    className="w-full justify-start"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Manage Question Groups
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("questions")}
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View All Questions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("audio")}
                    className="w-full justify-start"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Audio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  <span>Audio Player</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listeningExercise.audio_url ? (
                  <HLSAudioPlayer
                    src={listeningExercise.audio_url}
                    title={listeningExercise.reading_passage?.title}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Volume2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Audio File
                    </h3>
                    <p className="text-gray-500 mb-6">
                      No audio file has been uploaded for this exercise yet.
                    </p>
                    <Button onClick={handleEdit} className="bg-purple-600 hover:bg-purple-700">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Add Audio File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "questionGroups" && (
          <QuestionGroupList
            exerciseId={listeningExerciseId}
            mockTestId={mockTestId}
          />
        )}

        {activeTab === "questions" && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Questions Overview
                </h3>
                <p className="text-gray-500 mb-6">
                  Individual questions will be listed here, organized by question groups.
                </p>
                <Button 
                  onClick={() => setActiveTab("questionGroups")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Manage Question Groups First
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "preview" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Exercise Header */}
            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Headphones className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  {listeningExercise.title}
                </CardTitle>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mt-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Time: {listeningExercise.time_limit} minutes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Pass: {listeningExercise.passing_score}</span>
                  </div>

                  <Badge className={`${difficulty.color} border`}>
                    <div className="flex items-center space-x-1">
                      <span>{difficulty.label}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Instructions */}
            {listeningExercise.instruction && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">
                    {listeningExercise.instruction}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            {listeningExercise.audio_url && (
              <HLSAudioPlayer
                src={listeningExercise.audio_url}
                title={listeningExercise.reading_passage?.title}
              />
            )}

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Audio Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-md">
                    {listeningExercise.reading_passage?.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Section Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Questions for this exercise will be displayed here.</p>
                  <p className="text-sm mt-2">
                    Total Questions: {listeningExercise.total_questions || 0}
                  </p>
                  <Button 
                    onClick={() => setActiveTab("questionGroups")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Create Question Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningDetail;
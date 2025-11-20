"use client";
import React, { useState } from "react";
import { getReadingExercise } from "@/api/reading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  BookOpen,
  Edit3,
  Clock,
  Target,
  Hash,
  Star,
  FileText,
  Eye,
  BarChart3,
  Layers,
  Copy,
  Download,
  Share2,
  Settings,
  Info,
  Timer,
  Award,
  BookMarked,
  List,
  CheckCircle,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { IReadingExercise } from "@/interface/reading";

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

const ReadingDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const readingExerciseId = Array.isArray(params.readingId)
    ? params.readingId[0]
    : params.readingId;
  const sectionId = searchParams?.get("sectionId");

  const [activeTab, setActiveTab] = useState<
    "overview" | "passage" | "paragraphs" | "preview"
  >("overview");
  const [selectedParagraph, setSelectedParagraph] = useState<string | null>(
    null
  );

  // Query
  const {
    data: readingExercise,
    isLoading,
    isError,
    refetch,
  } = useQuery<IReadingExercise>({
    queryKey: ["readingExercise", readingExerciseId],
    queryFn: async () => getReadingExercise(readingExerciseId!),
    enabled: !!readingExerciseId,
    retry: 2,
  });

  // Navigation handlers
  const handleBackToList = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/reading?sectionId=${sectionId}`
    );
  };

  const handleEdit = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/reading/${readingExerciseId}?sectionId=${sectionId}`
    );
  };

  const handlePreview = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/reading/${readingExerciseId}/preview?sectionId=${sectionId}`
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

  if (isError || !readingExercise) {
    return (
      <Error
        title="Reading Exercise Not Found"
        description="The requested reading exercise does not exist or has been deleted."
        onRetry={() => refetch()}
        onGoBack={handleBackToList}
      />
    );
  }

  const difficulty =
    DIFFICULTY_LABELS[
      readingExercise.reading_passage
        ?.difficulty_level as keyof typeof DIFFICULTY_LABELS
    ] || DIFFICULTY_LABELS["3"];
  const wordCount = readingExercise.reading_passage?.word_count || 0;
  const paragraphs = readingExercise.reading_passage?.paragraphs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {readingExercise.title}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{readingExercise.reading_passage?.title}</span>
                    <span>•</span>
                    <Badge className={`${difficulty.color} border text-xs`}>
                      <div className="flex items-center space-x-1">
                        <span>{difficulty.label}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
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
              { key: "passage", label: "Passage", icon: BookMarked },
              { key: "paragraphs", label: "Paragraphs", icon: List },
              { key: "preview", label: "Full Preview", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
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
                    <Info className="h-5 w-5 text-blue-600" />
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
                        {readingExercise.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Exercise Type
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                        {readingExercise.exercise_type ||
                          "Reading Comprehension"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Skill Type
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                        {readingExercise.skill_type || "Reading"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        #{readingExercise.ordering}
                      </p>
                    </div>
                  </div>

                  {readingExercise.instruction && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Instructions
                      </label>
                      <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-700">
                          {readingExercise.instruction}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Passage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookMarked className="h-5 w-5 text-green-600" />
                    <span>Passage Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Passage Title
                      </label>
                      <p className="text-md font-semibold text-gray-900 mt-1">
                        {readingExercise.reading_passage?.title}
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
                      <div className="text-2xl font-bold text-green-600">
                        {paragraphs.length}
                      </div>
                      <div className="text-sm text-gray-600">Paragraphs</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {readingExercise.total_questions || 0}
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
                        {readingExercise.reading_passage?.content}
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
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Time Limit
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {readingExercise.time_limit} min
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
                      {readingExercise.passing_score}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total Points
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {readingExercise.total_points || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-gray-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      copyToClipboard(
                        readingExercise.reading_passage?.content || ""
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Passage Content
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(readingExercise.title)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Exercise Title
                  </Button>
                </CardContent>
              </Card>

              {/* Reading Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Exercise Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <p>• Average reading speed: 200 words/min</p>
                  <p>• Recommended for {difficulty.label} level</p>
                  <p>
                    • Estimated completion:{" "}
                    {Math.ceil(readingExercise.time_limit * 0.8)} minutes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "passage" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookMarked className="h-5 w-5 text-green-600" />
                    <span>{readingExercise.reading_passage?.title}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        readingExercise.reading_passage?.content || ""
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-md">
                    {readingExercise.reading_passage?.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "paragraphs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Paragraph References
              </h2>
              <div className="text-sm text-gray-600">
                {paragraphs.length}{" "}
                {paragraphs.length === 1 ? "paragraph" : "paragraphs"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {paragraphs.map((paragraph, index) => (
                <Card
                  key={paragraph.id}
                  className={`transition-all duration-200 ${
                    selectedParagraph === paragraph.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                          {paragraph.label}
                        </div>
                        <span className="text-lg">
                          Paragraph {paragraph.label}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paragraph.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {paragraph.content}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Words: {paragraph.content.split(/\s+/).length}
                        </span>
                        <span>Characters: {paragraph.content.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Exercise Header */}
            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  {readingExercise.title}
                </CardTitle>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mt-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Time: {readingExercise.time_limit} minutes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Pass: {readingExercise.passing_score}</span>
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
            {readingExercise.instruction && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">
                    {readingExercise.instruction}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reading Passage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {readingExercise.reading_passage?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-md">
                    {readingExercise.reading_passage?.content}
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
                    Total Questions: {readingExercise.total_questions || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingDetail;

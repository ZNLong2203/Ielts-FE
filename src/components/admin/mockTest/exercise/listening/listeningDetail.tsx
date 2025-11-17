"use client";
import React, { useState } from "react";
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
  Volume2,
  List,
  CheckCircle,
  Play,
  Pause,
  Mic,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { IListeningExercise } from "@/interface/listening";

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

const ListeningDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const listeningExerciseId = Array.isArray(params.listeningId)
    ? params.listeningId[0]
    : params.listeningId;
  const sectionId = searchParams?.get("sectionId");

  const [activeTab, setActiveTab] = useState<
    "overview" | "audio" | "transcript" | "paragraphs" | "preview"
  >("overview");
  const [selectedParagraph, setSelectedParagraph] = useState<string | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio ref
  const audioRef = React.useRef<HTMLAudioElement>(null);

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

  // Audio handlers
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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

  const difficulty =
    DIFFICULTY_LABELS[
      listeningExercise.listening_passage
        ?.difficulty_level as keyof typeof DIFFICULTY_LABELS
    ] || DIFFICULTY_LABELS["3"];
  const wordCount = listeningExercise.listening_passage?.word_count || 0;
  const paragraphs = listeningExercise.listening_passage?.paragraphs || [];
  const audioDuration = listeningExercise.audio_duration || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {listeningExercise.title}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{listeningExercise.listening_passage?.title}</span>
                    <span>•</span>
                    <Badge className={`${difficulty.color} border text-xs`}>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: difficulty.stars }, (_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                        <span>{difficulty.label}</span>
                      </div>
                    </Badge>
                    <span>•</span>
                    <span>{formatDuration(audioDuration)}</span>
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
              { key: "transcript", label: "Transcript", icon: FileText },
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
                    <span>Audio & Transcript Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Audio Title
                      </label>
                      <p className="text-md font-semibold text-gray-900 mt-1">
                        {listeningExercise.listening_passage?.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Difficulty Level
                      </label>
                      <div className="mt-1">
                        <Badge className={`${difficulty.color} border`}>
                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: difficulty.stars },
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-current"
                                />
                              )
                            )}
                            <span>{difficulty.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatDuration(audioDuration)}
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
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
                        {listeningExercise.total_questions || 0}
                      </div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="text-sm font-medium text-gray-600">
                      Transcript Preview
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 line-clamp-4">
                        {listeningExercise.listening_passage?.content}
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
                      {listeningExercise.passing_score}%
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Audio Duration
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatDuration(audioDuration)}
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
                        listeningExercise.listening_passage?.content || ""
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Transcript
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(listeningExercise.title)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Exercise Title
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(listeningExercise.audio_url || "")}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Copy Audio URL
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.print()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Print Exercise
                  </Button>
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
                  <p>
                    • Audio duration:{" "}
                    {formatDuration(audioDuration)}
                  </p>
                  <p>• Listen carefully for key information</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-purple-600" />
                    <span>{listeningExercise.listening_passage?.title}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {formatDuration(audioDuration)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Headphones className="h-12 w-12 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {listeningExercise.listening_passage?.title}
                      </h3>
                      <p className="text-gray-600">
                        {difficulty.label} • {formatDuration(audioDuration)} • {wordCount} words
                      </p>
                    </div>
                  </div>
                  
                  {listeningExercise.audio_url && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <audio 
                        ref={audioRef}
                        src={listeningExercise.audio_url}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full"
                        controls
                        preload="metadata"
                      />
                      
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <span>Use the controls above to play the audio</span>
                        <div className="flex items-center space-x-2">
                          <Mic className="h-4 w-4" />
                          <span>High Quality Audio</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Audio Transcript</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        listeningExercise.listening_passage?.content || ""
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
                    {listeningExercise.listening_passage?.content}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Word Count: {wordCount}</span>
                    <span>Characters: {listeningExercise.listening_passage?.content?.length || 0}</span>
                    <span>Paragraphs: {paragraphs.length}</span>
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
                      ? "ring-2 ring-purple-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">
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
                  <div className="flex items-center space-x-1">
                    <Volume2 className="h-4 w-4" />
                    <span>{formatDuration(audioDuration)}</span>
                  </div>
                  <Badge className={`${difficulty.color} border`}>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: difficulty.stars }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
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
                  <p className="text-gray-700 text-sm">{listeningExercise.instruction}</p>
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  <span>{listeningExercise.listening_passage?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Headphones className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{listeningExercise.listening_passage?.title}</h4>
                      <p className="text-sm text-gray-600">Duration: {formatDuration(audioDuration)}</p>
                    </div>
                  </div>
                  
                  {listeningExercise.audio_url && (
                    <div className="bg-white rounded-lg p-4">
                      <audio 
                        ref={audioRef}
                        src={listeningExercise.audio_url}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full"
                        controls
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Audio Transcript</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-md">
                    {listeningExercise.listening_passage?.content}
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
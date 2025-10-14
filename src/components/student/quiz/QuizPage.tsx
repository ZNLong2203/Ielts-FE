"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  BookOpen,
  PlayCircle,
  Headphones,
  FileText,
  MessageSquare,
  Mic,
  Search,
  Filter,
  Trophy,
  Users,
  ChevronRight,
  Star,
  Target,
  TrendingUp,
  Eye,
} from "lucide-react";

import { allIeltsQuizzes, QuizData, convertToBandScore } from "@/quizMockData";
import { cn } from "@/lib/utils";
import QuizDetail from "./QuizDetail";

const QuizPage = () => {
  const [currentView, setCurrentView] = useState<"list" | "quiz">("list");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Convert quiz data to array for easier handling
  const quizList: QuizData[] = Object.values(allIeltsQuizzes);

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizList.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === "all" || quiz.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  // Handle quiz selection
  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView("quiz");
  };

  const handlePreviewQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView("quiz");
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedQuizId(null);
  };

  // If quiz is selected, show QuizDetail
  if (currentView === "quiz" && selectedQuizId) {
    return (
      <QuizDetail 
        quizId={selectedQuizId} 
        onBack={handleBackToList}
      />
    );
  }

  // Get section icon
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "listening":
        return <Headphones className="h-5 w-5" />;
      case "reading":
        return <BookOpen className="h-5 w-5" />;
      case "writing":
        return <FileText className="h-5 w-5" />;
      case "speaking":
        return <Mic className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  // Get section color
  const getSectionColor = (section: string) => {
    switch (section) {
      case "listening":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "reading":
        return "bg-green-50 text-green-700 border-green-200";
      case "writing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "speaking":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Get difficulty based on duration and questions
  const getDifficulty = (quiz: QuizData) => {
    if (quiz.total_questions > 30 || quiz.duration > 45) return "Advanced";
    if (quiz.total_questions > 15 || quiz.duration > 25) return "Intermediate";
    return "Beginner";
  };

  // Quiz List View
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IELTS Practice Tests</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive practice tests for all IELTS sections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Trophy className="h-3 w-3 mr-1" />
              {quizList.length} Tests Available
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Listening", count: 1, icon: Headphones, color: "blue" },
            { label: "Reading", count: 1, icon: BookOpen, color: "green" },
            { label: "Writing", count: 1, icon: FileText, color: "purple" },
            { label: "Speaking", count: 1, icon: Mic, color: "orange" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuizzes.map((quiz) => {
          const difficulty = getDifficulty(quiz);
          const sectionColor = getSectionColor(quiz.section);
          
          return (
            <Card
              key={quiz.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
              onClick={() => handleStartQuiz(quiz.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg border",
                      sectionColor
                    )}>
                      {getSectionIcon(quiz.section)}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 capitalize">
                        {quiz.section} Section
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {quiz.description}
                </p>

                {/* Quiz Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(quiz.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>{quiz.total_questions} Questions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4" />
                    <span>{quiz.total_points} Points</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{difficulty}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={cn("text-xs", sectionColor)}>
                    {quiz.section.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {difficulty}
                  </Badge>
                  {quiz.section === "listening" && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      Audio Included
                    </Badge>
                  )}
                  {quiz.section === "writing" && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      Essay Tasks
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>4.8</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>1.2k taken</span>
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewQuiz(quiz.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartQuiz(quiz.id);
                      }}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Start Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tests found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedSection("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <MessageSquare className="h-5 w-5" />
            <span>How to Take IELTS Practice Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <p className="font-medium">Choose Your Section</p>
                <p className="text-blue-700">Start with listening and reading for skill building</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <p className="font-medium">Time Management</p>
                <p className="text-blue-700">Stick to the time limits for realistic practice</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <p className="font-medium">Review Answers</p>
                <p className="text-blue-700">Study explanations to understand mistakes</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <div>
                <p className="font-medium">Track Progress</p>
                <p className="text-blue-700">Monitor your band scores over time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;
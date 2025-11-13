"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Headphones,
  FileText,
  Mic,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { getMockTests } from "@/api/mockTest";
import { IMockTest } from "@/interface/mockTest";
import { useRouter } from "next/navigation";
import QuizStatistics from "./QuizStatistics";
import QuizCard from "./QuizCard";
import QuizSearchFilter from "./QuizSearchFilter";
import QuizInstructions from "./QuizInstructions";

const QuizPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [currentPage] = useState(1);

  // Fetch mock tests from API
  const { data: mockTestsData, isLoading, isError } = useQuery({
    queryKey: ["mockTests", currentPage],
    queryFn: () => getMockTests({ page: currentPage }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert to array and filter
  const quizList: IMockTest[] = useMemo(() => {
    return mockTestsData?.result || [];
  }, [mockTestsData]);

  // Filter quizzes based on search and filters
  const filteredQuizzes = useMemo(() => {
    return quizList.filter((quiz) => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Get section type from test_type or first section
      const sectionType = quiz.test_type === "full_test" 
        ? "all" 
        : (quiz.test_type && quiz.test_type !== "full_test" 
          ? quiz.test_type 
          : quiz.test_sections?.[0]?.section_type);
      const matchesSection = selectedSection === "all" || sectionType === selectedSection;
      
      return matchesSearch && matchesSection;
    });
  }, [quizList, searchQuery, selectedSection]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/dashboard/my-quizzes/${quizId}`);
  };

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

  const getSectionColor = (section: string) => {
    switch (section) {
      case "listening":
        return "text-blue-600 border-blue-300";
      case "reading":
        return "text-green-600 border-green-300";
      case "writing":
        return "text-purple-600 border-purple-300";
      case "speaking":
        return "text-orange-600 border-orange-300";
      default:
        return "text-gray-600 border-gray-300";
    }
  };

  // Get difficulty from difficulty_level
  const getDifficulty = (quiz: IMockTest) => {
    const level = quiz.difficulty_level;
    if (level === "5" || level === "advanced") return "Advanced";
    if (level === "4" || level === "upper_intermediate") return "Upper Intermediate";
    if (level === "3" || level === "intermediate") return "Intermediate";
    if (level === "2" || level === "elementary") return "Elementary";
    return "Beginner";
  };

  // Get section type from quiz
  const getQuizSection = (quiz: IMockTest): string => {
    if (quiz.test_type === "full_test") return "full_test";
    // Use test_type directly if available, otherwise fallback to test_sections
    if (quiz.test_type && quiz.test_type !== "full_test") {
      return quiz.test_type;
    }
    return quiz.test_sections?.[0]?.section_type || "reading";
  };

  // Get section border color - subtle
  const getSectionBorderColor = (section: string) => {
    switch (section) {
      case "listening":
        return "border-l-blue-400";
      case "reading":
        return "border-l-green-400";
      case "writing":
        return "border-l-purple-400";
      case "speaking":
        return "border-l-orange-400";
      default:
        return "border-l-gray-400";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading mock tests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load mock tests. Please try again.</p>
        </div>
      </div>
    );
  }

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
              {mockTestsData?.meta?.total || quizList.length} Tests Available
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <QuizStatistics quizList={quizList} getQuizSection={getQuizSection} />
      </div>

      {/* Search and Filter Section */}
      <QuizSearchFilter
        searchQuery={searchQuery}
        selectedSection={selectedSection}
        onSearchChange={setSearchQuery}
        onSectionChange={setSelectedSection}
      />

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const difficulty = getDifficulty(quiz);
          const section = getQuizSection(quiz);
          const sectionColor = getSectionColor(section);
          const borderColor = getSectionBorderColor(section);
          
          return (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              section={section}
              sectionColor={sectionColor}
              borderColor={borderColor}
              difficulty={difficulty}
              getSectionIcon={getSectionIcon}
              onStart={handleStartQuiz}
            />
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
      <QuizInstructions />
    </div>
  );
};

export default QuizPage;
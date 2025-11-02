"use client";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  HelpCircle,
  Plus,
  BarChart3,
  ArrowLeft,
  Search,
  Target,
} from "lucide-react";

import { ICourseQuestion } from "@/interface/courseQuestion";
import { IExercise } from "@/interface/exercise";
import { deleteCourseQuestion } from "@/api/courseQuestion";
import CourseQuestionForm from "./courseQuestionForm";
import CourseQuestionItem from "@/components/admin/courseQuestion/courseQuestionItem";
import { getExerciseByLessonId } from "@/api/exercise";

interface QuestionListProps {
  exercise: IExercise;
  lessonId: string;
  sectionId?: string;
  onBack?: () => void;
}

type FilterType =
  | "all"
  | "multiple_choice"
  | "single_choice"
  | "true_false"
  | "essay"
  | "fill_blank"
  | "listening"
  | "reading";
type SortType = "ordering" | "points" | "difficulty" | "type" | "created_at";

const QuestionList = ({
  exercise,
  lessonId,
  sectionId = "",
  onBack,
}: QuestionListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<ICourseQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<ICourseQuestion | null>(null);

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("ordering");

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["exercise", lessonId, exercise.id],
    queryFn: () => getExerciseByLessonId(lessonId, exercise.id),
    refetchOnWindowFocus: false,
  });

  console.log("📊 Questions API Response:", data);

  // Enhanced data processing
  const getQuestionsArray = (): ICourseQuestion[] => {
    if (!data) return [];

    if (data.questions && Array.isArray(data.questions)) {
      return data.questions.filter((q) => q && !q.deleted);
    }

    return [];
  };

  const questions = getQuestionsArray();

  // Enhanced filtering and sorting
  const getFilteredAndSortedQuestions = () => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (q) =>
          q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.explanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.question_group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.question_type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "ordering":
          return (a.ordering ?? 999) - (b.ordering ?? 999);
        case "points":
          return Number(b.points || 0) - Number(a.points || 0);
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            (difficultyOrder[
              a.difficulty_level as keyof typeof difficultyOrder
            ] || 2) -
            (difficultyOrder[
              b.difficulty_level as keyof typeof difficultyOrder
            ] || 2)
          );
        case "type":
          return (a.question_type || "").localeCompare(b.question_type || "");
        case "created_at":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        default:
          return (a.ordering ?? 999) - (b.ordering ?? 999);
      }
    });

    return filtered;
  };

  const sortedQuestions = getFilteredAndSortedQuestions();

  // Enhanced statistics
  const getStatistics = () => {
    const totalPoints = questions.reduce(
      (total, q) => total + (Number(q.points) || 0),
      0
    );
    const avgPoints =
      questions.length > 0 ? (totalPoints / questions.length).toFixed(1) : "0";

    const typeStats = questions.reduce((acc, q) => {
      const type = q.question_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyStats = questions.reduce((acc, q) => {
      const difficulty = q.difficulty_level || "medium";
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: questions.length,
      totalPoints,
      avgPoints,
      typeStats,
      difficultyStats,
    };
  };

  const stats = getStatistics();

  // Enhanced mutations
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => {
      return deleteCourseQuestion(lessonId, exercise.id, questionId);
    },
    onSuccess: () => {
      toast.success("Question deleted successfully! 🗑️");
      queryClient.invalidateQueries({
        queryKey: ["exercise", lessonId, exercise.id],
      });
      setDeletingQuestion(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete question");
    },
  });

  // Enhanced form handlers
  const handleFormSuccess = () => {
    console.log("📝 Question form success - refreshing data");
    setShowForm(false);
    setEditingQuestion(null);

    // Comprehensive invalidation
    queryClient.invalidateQueries({
      queryKey: ["exercise", lessonId, exercise.id],
    });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: ICourseQuestion) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDeleteQuestion = (question: ICourseQuestion) => {
    setDeletingQuestion(question);
  };

  const confirmDelete = () => {
    if (deletingQuestion) {
      deleteQuestionMutation.mutate(deletingQuestion.id);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-600">
              Loading questions...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch the data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    console.error("❌ Error loading questions:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-red-600" />
            <span>Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xl font-semibold text-red-600 mb-2">
              Error loading questions
            </p>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred while loading the questions."}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Back Navigation */}
      {onBack && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-gray-100 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Exercises</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Target className="h-3 w-3 mr-1" />
              {stats.total} Questions
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <BarChart3 className="h-3 w-3 mr-1" />
              {stats.totalPoints} Points
            </Badge>
          </div>
        </div>
      )}

      {/* Enhanced Context Header */}
      <div className="p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <HelpCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-md font-bold text-green-900">
            Question Management
          </h2>
        </div>
        <div className="space-y-1">
          <p className="text-green-800 font-medium text-sm">
            Exercise: {exercise.title}
          </p>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Select
                  value={filterType}
                  onValueChange={(value: FilterType) => setFilterType(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="fill_blank">Fill Blank</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value: SortType) => setSortBy(value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordering">Order</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="created_at">Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View controls and actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Questions Display */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>Questions</span>
              <Badge variant="outline" className="ml-2">
                {sortedQuestions.length} of {stats.total}
              </Badge>
            </CardTitle>

            {searchTerm && (
              <Badge variant="secondary">Filtered: "{searchTerm}"</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-16">
              {questions.length === 0 ? (
                <>
                  <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <HelpCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get started by creating your first question for this
                    exercise.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Question
                  </Button>
                </>
              ) : (
                // No questions match filter
                <>
                  <div className="bg-yellow-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Search className="h-12 w-12 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No matching questions
                  </h3>
                  <p className="text-gray-500 mb-6">
                    No questions found matching your current filters. Try
                    adjusting your search or filter criteria.
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterType("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {sortedQuestions.map((question, questionIndex) => (
                <div
                  key={`${question.id}-${question.ordering || questionIndex}`}
                >
                  <CourseQuestionItem
                    question={question}
                    questionIndex={questionIndex}
                    exerciseId={exercise.id}
                    handleEditQuestion={handleEditQuestion}
                    handleDeleteQuestion={handleDeleteQuestion}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Question Form */}
      {showForm && (
        <div className="mt-6">
          <Separator className="mb-6" />
          <CourseQuestionForm
            exerciseId={exercise.id}
            lessonId={lessonId}
            sectionId={sectionId}
            question={editingQuestion}
            existingQuestions={sortedQuestions}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Enhanced Delete Confirmation */}
      <AlertDialog
        open={!!deletingQuestion}
        onOpenChange={() => setDeletingQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-red-600" />
              <span>Delete Question</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete this question? This action
                cannot be undone.
              </p>
              {deletingQuestion && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-medium text-sm text-gray-800">
                    "{deletingQuestion.question_text}"
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                    <span>Type: {deletingQuestion.question_type}</span>
                    <span>Points: {deletingQuestion.points}</span>
                    <span>Order: {deletingQuestion.ordering}</span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuestionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Question"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionList;

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  FileText,
} from "lucide-react";
import CourseQuestionItem from "../courseQuestion/courseQuestionItem";
import CourseQuestionForm from "../courseQuestion/courseQuestionForm";
import { useQuery } from "@tanstack/react-query";
import { getExerciseByLessonId } from "@/api/exercise"; // Import correct function

interface QuestionTabProps {
  exercise: any;
  lesson?: any;
  exerciseData?: any;
  isExerciseLoading?: boolean;
  isExerciseError?: boolean;
  onBack: () => void;
  onRefresh?: () => void;
}

const QuestionTab: React.FC<QuestionTabProps> = ({
  exercise,
  lesson,
  exerciseData,
  isExerciseLoading = false,
  isExerciseError = false,
  onBack,
  onRefresh,
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Fetch questions for the exercise with better key management
  const {
    data: detailExerciseData,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ["exercise-details", lesson?.id, exercise?.id], // Better query key
    queryFn: () => getExerciseByLessonId(lesson.id, exercise?.id),
    enabled: !!exercise?.id && !!lesson?.id,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  console.log("Exercise Details Data:", detailExerciseData);

  // Get exercise details from exerciseData if available
  const getExerciseDetails = () => {
    if (!exercise) return null;

    if (!exerciseData) return exercise;

    const exercises = exerciseData?.data || exerciseData || [];

    if (Array.isArray(exercises)) {
      const foundExercise = exercises.find((ex: any) => ex.id === exercise.id);
      return foundExercise || exercise;
    }

    if (exercises.id === exercise.id) {
      return exercises;
    }
    return exercise;
  };

  const exerciseDetails = getExerciseDetails();

  // Get questions array from API response
  const questions =
    detailExerciseData?.data?.questions || detailExerciseData?.questions || [];
  const sortedQuestions = Array.isArray(questions)
    ? [...questions].sort((a, b) => (a.ordering || 999) - (b.ordering || 999))
    : [];

  // Enhanced success handler with better refresh logic
  const handleQuestionFormSuccess = async () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);

    try {
      await refetchQuestions();

      onRefresh?.();
    } catch (error) {
      console.error("❌ Failed to refetch questions:", error);
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleCancelForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  // Enhanced refresh handler
  const handleRefreshQuestions = async () => {
    console.log("🔄 Manual refresh triggered...");
    try {
      await refetchQuestions();
      onRefresh?.();
      console.log("✅ Manual refresh completed");
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  };

  // Force refresh when exercise changes
  useEffect(() => {
    if (exercise?.id && lesson?.id) {
      console.log("🔄 Exercise changed, refetching questions...");
      refetchQuestions();
    }
  }, [exercise?.id, lesson?.id, refetchQuestions]);

  if (!exercise) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Exercise Selected
            </h3>
            <p className="text-gray-500 mb-4">
              Please select an exercise to view its questions.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state - combine both loading states
  if (isExerciseLoading || isQuestionsLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Button>
            <div>
              <h3 className="text-lg font-semibold">
                {exercise.title} - Questions
              </h3>
              <p className="text-sm text-gray-600">
                Manage questions for this exercise
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateQuestion}
            className="flex items-center space-x-2"
            disabled={showQuestionForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>

        {/* Loading State */}
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading questions...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch the questions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - combine both error states
  if (isExerciseError || isQuestionsError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Button>
            <div>
              <h3 className="text-lg font-semibold">
                {exercise.title} - Questions
              </h3>
              <p className="text-sm text-gray-600">
                Manage questions for this exercise
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateQuestion}
            className="flex items-center space-x-2"
            disabled={showQuestionForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>

        {/* Error State */}
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load questions
              </h3>
              <p className="text-gray-500 mb-4">
                There was an error loading the questions for this exercise.
              </p>
              <Button onClick={() => refetchQuestions()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with manual refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <div>
            <h3 className="text-lg font-semibold">
              {exerciseDetails.title} - Questions
            </h3>
            <p className="text-sm text-gray-600">
              Manage questions for this exercise
              {sortedQuestions.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {sortedQuestions.length} questions
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshQuestions}
            className="flex items-center space-x-1"
          >
            <Loader2
              className={`h-3 w-3 ${isQuestionsLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateQuestion}
            className="flex items-center space-x-2"
            disabled={showQuestionForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <>
          <CourseQuestionForm
            exerciseId={exercise.id}
            lessonId={lesson?.id}
            sectionId={lesson?.section_id}
            question={editingQuestion}
            existingQuestions={sortedQuestions}
            onSuccess={handleQuestionFormSuccess}
            onCancel={handleCancelForm}
          />
        </>
      )}

      {/* Questions List */}
      {sortedQuestions.length > 0 ? (
        <div className="space-y-4">
          {sortedQuestions.map((question: any, index: number) => (
            <div
              key={question.id}
              className={
                editingQuestion?.id === question.id
                  ? "ring-2 ring-orange-500 bg-orange-50 rounded-lg p-1"
                  : ""
              }
            >
              <CourseQuestionItem
                question={question}
                questionIndex={index}
                exerciseId={exercise.id}
                lessonId={lesson?.id}
                sectionId={lesson?.section_id}
                handleEditQuestion={handleEditQuestion}
                onRefresh={handleRefreshQuestions}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions in this exercise
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first question to start building exercise content.
              </p>
              <Button
                onClick={handleCreateQuestion}
                className="bg-green-600 hover:bg-green-700"
                disabled={showQuestionForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      {showQuestionForm && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span>
                {editingQuestion
                  ? `Editing question: "${editingQuestion.question_text?.substring(
                      0,
                      50
                    )}..."`
                  : "Creating new question"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionTab;

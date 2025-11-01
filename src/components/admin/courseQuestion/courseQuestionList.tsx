"use client";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

import { HelpCircle, Plus, BarChart3, ArrowLeft } from "lucide-react";

import {
  ICourseQuestion,
  ICourseQuestionUpdate,
} from "@/interface/courseQuestion";
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

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercise", lessonId, exercise.id],
    queryFn: () => getExerciseByLessonId(lessonId, exercise.id),
  });

  console.log("Questions API Response:", data);

  // Safely extract questions array from response
  const getQuestionsArray = (): ICourseQuestion[] => {
    if (!data) return [];

    if (data.questions && Array.isArray(data.questions)) {
      return data.questions.filter((q) => q && !q.deleted);
    }

    return [];
  };

  const questions = getQuestionsArray();

  // Sort questions by ordering
  const sortedQuestions = [...questions].sort((a, b) => {
    const orderA = a.ordering ?? 999;
    const orderB = b.ordering ?? 999;
    return orderA - orderB;
  });

  // Calculate total points
  const getTotalPoints = () => {
    return sortedQuestions.reduce((total, question) => {
      return total + (Number(question.points) || 0);
    }, 0);
  };

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => {
      return deleteCourseQuestion(lessonId, exercise.id, questionId);
    },
    onSuccess: () => {
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["exercise", lessonId, exercise.id],
      });

      setDeletingQuestion(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete question");
    },
  });

  // Form handlers
  const handleFormSuccess = () => {
    console.log("📝 Question form success - refreshing data");
    setShowForm(false);
    setEditingQuestion(null);

    // Enhanced invalidation
    queryClient.invalidateQueries({ queryKey: ["exercise", lessonId, exercise.id] });
  };

  const handleFormCancel = () => {
    console.log("❌ Question form cancelled");
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    console.error("Error loading questions:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-red-600" />
            <span>Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p className="text-lg font-medium mb-2">Error loading questions</p>
            <p className="text-sm mb-4">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["questions", exercise.id],
                })
              }
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      {onBack && (
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Exercises</span>
          </Button>
        </div>
      )}

      {/* Context header */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3 mb-2">
          <HelpCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-md font-semibold text-green-900">
            Question Management
          </h2>
        </div>
        <div className="text-sm text-green-700">
          <p className="font-medium mb-1">Exercise: {exercise.title}</p>
        </div>
      </div>

      {/* Questions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>Questions</span>
            <Badge variant="outline" className="ml-2">
              {sortedQuestions.length} questions
            </Badge>

            {getTotalPoints() > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <BarChart3 className="h-3 w-3 mr-1" />
                {getTotalPoints()} pts
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No questions yet</p>
              <p className="text-sm">
                Add your first question to this exercise
              </p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedQuestions.map((question, questionIndex) => (
                <CourseQuestionItem
                  key={`${question.id}-${question.ordering || questionIndex}`}
                  question={question}
                  questionIndex={questionIndex}
                  exerciseId={exercise.id}
                  handleEditQuestion={handleEditQuestion}
                  handleDeleteQuestion={handleDeleteQuestion}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question form modal/section */}
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deletingQuestion}
        onOpenChange={() => setDeletingQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the question &ldquo;
              {deletingQuestion?.question_text}&rdquo;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionList;

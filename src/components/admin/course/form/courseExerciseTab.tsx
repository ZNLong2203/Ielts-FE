"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ExerciseForm from "../exercise/exerciseForm";
import ExerciseItem from "../exercise/exerciseItem";
import { useQuery } from "@tanstack/react-query";
import { getExercisesByLessonId } from "@/api/exercise";

interface ExerciseTabProps {
  lesson: any;
  selectedExerciseId: string | null;
  onExerciseSelect: (exerciseId: string) => void;
  onBack: () => void;
  onRefresh?: () => void;
}

const ExerciseTab: React.FC<ExerciseTabProps> = ({
  lesson,
  selectedExerciseId,
  onExerciseSelect,
  onBack,
  onRefresh,
}) => {
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  const {
    data: exerciseData,
    isLoading: isExerciseLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["exercises", lesson?.id],
    queryFn: () => getExercisesByLessonId(lesson.id),
    enabled: !!lesson?.id,
  });

  // Get exercises array from API response
  const exercises = exerciseData || [];

  const handleExerciseFormSuccess = () => {
    setShowExerciseForm(false);
    setEditingExercise(null);
    refetch(); // Refetch exercises after success
    onRefresh?.();
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setShowExerciseForm(true);
  };

  const handleCreateExercise = () => {
    setEditingExercise(null);
    setShowExerciseForm(true);
  };

  const handleCancelForm = () => {
    setShowExerciseForm(false);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exercise: any) => {
    // This will be handled by ExerciseItem internally
  };

  const handleManageQuestions = (exercise: any) => {
    // Select the exercise to view its questions
    onExerciseSelect(exercise.id);
  };

  if (!lesson) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Lesson Selected
            </h3>
            <p className="text-gray-500 mb-4">
              Please select a lesson to view its exercises.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isExerciseLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div>
              <h3 className="text-lg font-semibold">
                {lesson.title} - Exercises
              </h3>
              <p className="text-sm text-gray-600">
                Manage exercises for this lesson
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateExercise}
            className="flex items-center space-x-2"
            disabled={showExerciseForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Exercise</span>
          </Button>
        </div>

        {/* Loading State */}
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading exercises...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch the exercises.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div>
              <h3 className="text-lg font-semibold">
                {lesson.title} - Exercises
              </h3>
              <p className="text-sm text-gray-600">
                Manage exercises for this lesson
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateExercise}
            className="flex items-center space-x-2"
            disabled={showExerciseForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Exercise</span>
          </Button>
        </div>

        {/* Error State */}
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load exercises
              </h3>
              <p className="text-gray-500 mb-4">
                There was an error loading the exercises for this lesson.
              </p>
              <Button onClick={() => refetch()} variant="outline">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <div>
            <h3 className="text-lg font-semibold">
              {lesson.title} - Exercises
            </h3>
            <div className="text-sm text-gray-600 flex items-center">
              <span>Manage exercises for this lesson</span>
              {exercises.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {exercises.length} exercises
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={handleCreateExercise}
          className="flex items-center space-x-2"
          disabled={showExerciseForm}
        >
          <Plus className="h-4 w-4" />
          <span>Add Exercise</span>
        </Button>
      </div>

      {/* Exercise Form */}
      {showExerciseForm && (
        <>
          <ExerciseForm
            lessonId={lesson.id}
            exercise={editingExercise}
            existingExercises={exercises}
            onSuccess={handleExerciseFormSuccess}
            onCancel={handleCancelForm}
          />
        </>
      )}

      {/* Exercises List using ExerciseItem */}
      {exercises && exercises.length > 0 ? (
        <div className="space-y-4">
          {exercises
            .sort((a: any, b: any) => (a.ordering || 999) - (b.ordering || 999))
            .map((exercise: any, index: number) => (
              <div
                key={exercise.id}
                className={`${
                  selectedExerciseId === exercise.id
                    ? "ring-1 ring-black bg-green-50 rounded-lg p-1"
                    : editingExercise?.id === exercise.id
                    ? "ring-1 ring-orange-500 bg-orange-50 rounded-lg p-1"
                    : ""
                }`}
              >
                <ExerciseItem
                  exercise={exercise}
                  exerciseIndex={index}
                  lessonId={lesson.id}
                  handleEditExercise={handleEditExercise}
                  handleDeleteExercise={handleDeleteExercise}
                  onManageQuestions={handleManageQuestions}
                  isSelected={selectedExerciseId === exercise.id}
                  isEditing={editingExercise?.id === exercise.id}
                  onRefresh={refetch}
                />
              </div>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No exercises in this lesson
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first exercise to start building lesson content.
              </p>
              <Button
                onClick={handleCreateExercise}
                className="bg-green-600 hover:bg-green-700"
                disabled={showExerciseForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseTab;

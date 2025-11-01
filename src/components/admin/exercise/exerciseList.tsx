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

import { Target, Plus, Clock } from "lucide-react";

import { IExercise } from "@/interface/exercise";
import { deleteExercise, getExercisesByLessonId } from "@/api/exercise";
import ExerciseForm from "./exerciseForm";
import ExerciseItem from "./exerciseItem";
import CourseQuestionList from "../courseQuestion/courseQuestionList"; // Updated import

interface ExerciseListProps {
  lessonId: string;
  sectionId?: string;
}

const ExerciseList = ({ lessonId, sectionId = "" }: ExerciseListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<IExercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<IExercise | null>(null);
  
  // UPDATED: State for managing questions with CourseQuestionList
  const [managingQuestionsForExercise, setManagingQuestionsForExercise] = useState<IExercise | null>(null);

  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises", lessonId],
    queryFn: () => getExercisesByLessonId(lessonId),
    staleTime: 1 * 60 * 1000,
  });

  // Safely extract exercises array from response
  const getExercisesArray = (): IExercise[] => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data.filter(exercise => exercise && !exercise.deleted);
    }
    return [];
  };

  const exercises = getExercisesArray();
  const sortedExercises = [...exercises].sort((a, b) => {
    const orderA = a.ordering ?? 999;
    const orderB = b.ordering ?? 999;
    return orderA - orderB;
  });

  const formatDurationVietnamese = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return "0 s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];

    if (hours > 0) {
      parts.push(`${hours} h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} m`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds} s`);
    }

    return parts.join(" ");
  };

  const getTotalTime = () => {
    const totalSeconds = sortedExercises.reduce((total, exercise) => {
      return total + (exercise.time_limit || 0);
    }, 0);
    return formatDurationVietnamese(totalSeconds);
  };

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => {
      console.log("🗑️ Deleting exercise:", exerciseId);
      return deleteExercise(lessonId, exerciseId);
    },
    onSuccess: () => {
      console.log("✅ Exercise deleted successfully");
      toast.success("Exercise deleted successfully");
      
      // Enhanced invalidation
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
      
      if (sectionId) {
        queryClient.invalidateQueries({ queryKey: ["sections", sectionId] });
      }
      
      setDeletingExercise(null);
    },
    onError: (error: Error) => {
      console.error("❌ Delete exercise error:", error);
      toast.error(error.message || "Failed to delete exercise");
    },
  });

  // Form handlers
  const handleFormSuccess = () => {
    console.log("📝 Exercise form success - refreshing data");
    setShowForm(false);
    setEditingExercise(null);
    
    // Enhanced invalidation
    queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
    queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
  };

  const handleFormCancel = () => {
    console.log("❌ Exercise form cancelled");
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleEditExercise = (exercise: IExercise) => {
    console.log("✏️ Editing exercise:", exercise.title);
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDeleteExercise = (exercise: IExercise) => {
    console.log("🗑️ Requesting deletion of exercise:", exercise.title);
    setDeletingExercise(exercise);
  };

  // UPDATED: CourseQuestion management handlers
  const handleManageQuestions = (exercise: IExercise) => {
    console.log("🎯 Managing course questions for exercise:", exercise.title);
    
    // Pre-fetch exercise data to ensure latest question data
    queryClient.prefetchQuery({
      queryKey: ["exercise", lessonId, exercise.id],
      staleTime: 0, // Always fetch fresh data
    });
    
    setManagingQuestionsForExercise(exercise);
  };

  const handleBackFromQuestionManagement = () => {
    console.log("🔙 Back from course question management - Refreshing data");
    
    // Force refresh to ensure latest question data reflects in exercise list
    queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
    queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
    
    if (sectionId) {
      queryClient.invalidateQueries({ queryKey: ["sections", sectionId] });
    }
    
    setManagingQuestionsForExercise(null);
  };

  const confirmDelete = () => {
    if (deletingExercise) {
      deleteExerciseMutation.mutate(deletingExercise.id);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Exercises</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading exercises...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    console.error("Error loading exercises:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-600" />
            <span>Exercises</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p className="text-lg font-medium mb-2">Error loading exercises</p>
            <p className="text-sm mb-4">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] })}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (managingQuestionsForExercise) {
    return (
      <CourseQuestionList
        exercise={managingQuestionsForExercise}
        lessonId={lessonId}
        sectionId={sectionId}
        onBack={handleBackFromQuestionManagement}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Exercises</span>
          
            {sortedExercises.some((ex) => ex.time_limit > 0) && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                {getTotalTime()}
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
              Add Exercise
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {sortedExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No exercises yet</p>
              <p className="text-sm">Add your first exercise to this lesson</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Exercise
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExercises.map((exercise, exerciseIndex) => (
                <ExerciseItem
                  key={`${exercise.id}-${exercise.ordering || exerciseIndex}`}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  lessonId={lessonId}
                  handleEditExercise={handleEditExercise}
                  handleDeleteExercise={handleDeleteExercise}
                  onManageQuestions={handleManageQuestions} // This will now open CourseQuestionList
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise form modal/section */}
      {showForm && (
        <div className="mt-6">
          <Separator className="mb-6" />
          <ExerciseForm
            lessonId={lessonId}
            sectionId={sectionId}
            exercise={editingExercise}
            existingExercises={sortedExercises}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deletingExercise}
        onOpenChange={() => setDeletingExercise(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the exercise &ldquo;
              {deletingExercise?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteExerciseMutation.isPending}
            >
              {deleteExerciseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExerciseList;
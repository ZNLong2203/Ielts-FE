"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import {
  Target,
  Plus,
  Clock,
} from "lucide-react";

import { ILesson } from "@/interface/lesson";
import { IExercise } from "@/interface/exercise";
import { deleteExercise } from "@/api/exercise";
import ExerciseForm from "./exerciseForm";
import ExerciseItem from "./exerciseItem";

interface ExerciseListProps {
  lesson: ILesson;
  sectionId?: string;
}

const ExerciseList = ({ lesson, sectionId = "" }: ExerciseListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<IExercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<IExercise | null>(null);
  
  const queryClient = useQueryClient();

  // Get exercises from lesson data and filter out deleted ones
  const exercises = lesson?.exercises || [];
  
  // Filter out deleted exercises
  const activeExercises = exercises.filter(exercise => exercise.deleted == false);

  // Sort exercises by ordering
  const sortedExercises = [...activeExercises].sort((a, b) => {
    const orderA = a.ordering ?? 999;
    const orderB = b.ordering ?? 999;
    return orderA - orderB;
  });

  // Enhanced duration formatting
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else if (minutes > 0) {
      return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Calculate total time - giống lessonList
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
    
    return parts.join(' ');
  };

  const getTotalTime = () => {
    const totalSeconds = sortedExercises.reduce((total, exercise) => {
      return total + (exercise.time_limit || 0);
    }, 0);
    return formatDurationVietnamese(totalSeconds);
  };

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(lesson.id, exerciseId),
    onSuccess: () => {
      toast.success("Exercise deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lesson.id] });
   
      setDeletingExercise(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete exercise");
    },
  });

  // Form handlers
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExercise(null);
    // Invalidate lesson data để update exercises
    queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lesson.id] });
   
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleEditExercise = (exercise: IExercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDeleteExercise = (exercise: IExercise) => {
    setDeletingExercise(exercise);
  };

  const confirmDelete = () => {
    if (deletingExercise) {
      deleteExerciseMutation.mutate(deletingExercise.id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Exercises</span>
            <Badge variant="outline" className="ml-2">
              {sortedExercises.length} exercises
            </Badge>
            {sortedExercises.some(ex => ex.time_limit > 0) && (
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
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  handleEditExercise={handleEditExercise}
                  handleDeleteExercise={handleDeleteExercise}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise form modal/section - giống lessonList */}
      {showForm && (
        <div className="mt-6">
          <Separator className="mb-6" />
          <ExerciseForm
            lessonId={lesson.id}
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
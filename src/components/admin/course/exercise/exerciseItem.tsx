"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
  Clock,
  Trophy,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Target,
  HelpCircle,
  Eye,
  EyeOff,
  Plus,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IExercise } from "@/interface/exercise";
import { getExerciseByLessonId, deleteExercise } from "@/api/exercise";

const formatDuration = (minutes: number) => {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "No limit";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  }

  return `${remainingMinutes}m`;
};

const getExerciseTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "reading":
      return "bg-blue-100 text-blue-800";
    case "listening":
      return "bg-orange-100 text-orange-800";
    case "writing":
      return "bg-purple-100 text-purple-800";
    case "speaking":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface ExerciseItemProps {
  exercise: IExercise;
  exerciseIndex: number;
  lessonId: string;
  handleEditExercise: (exercise: IExercise) => void;
  handleDeleteExercise: (exercise: IExercise) => void;
  onManageQuestions?: (exercise: IExercise) => void;
  isSelected?: boolean;
  isEditing?: boolean;
  onRefresh?: () => void;
}

const ExerciseItem = ({
  exercise,
  exerciseIndex,
  lessonId,
  handleEditExercise,
  handleDeleteExercise: _,
  onManageQuestions,
  isSelected = false,
  isEditing = false,
  onRefresh,
}: ExerciseItemProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch exercise details including questions
  const {
    data: exerciseData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exercise", lessonId, exercise.id],
    queryFn: () => getExerciseByLessonId(lessonId, exercise.id),
  });

  console.log("Exercise Data:", exerciseData);

  const questions = exerciseData && Array.isArray(exerciseData.questions)
    ? exerciseData.questions.filter((q: any) => q.deleted === false)
    : [];

  // Delete exercise mutation - handle internally
  const deleteExerciseMutation = useMutation({
    mutationFn: () => deleteExercise(lessonId, exercise.id),
    onSuccess: () => {
      toast.success("Exercise deleted successfully");
      
      // Enhanced invalidation for course form context
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      
      // Also invalidate lesson and section data
      const sectionId = exercise.section_id || exercise.lesson?.section_id;
      if (sectionId) {
        queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
        queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
        queryClient.invalidateQueries({ queryKey: ["sections", sectionId] });
      }
      
      setDeleteDialogOpen(false);
      onRefresh?.();
    },
    onError: (error: Error) => {
      console.error("❌ Delete exercise error:", error);
      toast.error(error.message || "Failed to delete exercise");
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteExerciseMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <Badge variant="outline" className="w-20 h-6 bg-gray-200 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
        <span className="text-red-600 text-sm">Error loading exercise details</span>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-sm hover:border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            {/* Exercise Number */}
            <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg font-bold">
              {exerciseIndex + 1}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {exercise.title}
                </h4>
             
                {isEditing && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Currently Editing
                  </Badge>
                )}
                {isSelected && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Selected
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Score: {exercise.passing_score || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(exercise.time_limit)}</span>
                </div>
                <span>Order #{exercise.ordering || exerciseIndex + 1}</span>
                <span>{questions.length} questions</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditExercise(exercise)}
              className={
                isEditing
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "hover:bg-blue-50 text-gray-600 hover:text-blue-700"
              }
              title="Edit exercise"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="hover:bg-red-50 text-gray-600 hover:text-red-700 transition-colors"
              title="Delete exercise"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onManageQuestions?.(exercise)}
              className="flex items-center space-x-1"
            >
              <span>
                {isSelected ? "Managing Questions" : "View Questions"}
              </span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{exercise.title}&rdquo;? 
              This action cannot be undone and will also delete all questions in this exercise.
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

export default ExerciseItem;
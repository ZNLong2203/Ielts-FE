"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// DnD imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  PlayCircle,
  Plus,
  GripVertical,
  Save,
  RotateCcw,
  Clock,
  Target,
  ArrowLeft,
} from "lucide-react";

import { ILesson } from "@/interface/lesson";
import { ISection } from "@/interface/section";
import { getLessonsBySectionId, deleteLesson, reorderLesson } from "@/api/lesson";
import LessonForm from "./lessonForm";
import SortableLessonItem from "./sortableLessonItem";
import ExerciseList from "../exercise/exerciseList"; 

interface LessonListProps {
  section: ISection;
  courseId?: string;
}

const LessonList = ({ section, courseId = "" }: LessonListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<ILesson | null>(null);
  const [localLessons, setLocalLessons] = useState<ILesson[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Add state for exercise management
  const [managingExercisesForLesson, setManagingExercisesForLesson] = useState<ILesson | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch lessons for this section
  const {
    data: lessons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lessons", section.id],
    queryFn: () => getLessonsBySectionId(section.id!),
  });

  const safeLessons = Array.isArray(lessons) ? lessons : (lessons?.result || []);

  // Update local lessons when data changes
  useEffect(() => {
    if (safeLessons && safeLessons.length > 0) {
      const sortedLessons = [...safeLessons].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalLessons(sortedLessons);
      setHasUnsavedChanges(false);
    } else {
      setLocalLessons([]);
    }
  }, [safeLessons]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Calculate total duration
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

  const getTotalDuration = () => {
    const totalSeconds = localLessons.reduce((total, lesson) => {
      return total + (lesson.video_duration || 0);
    }, 0);
    return formatDurationVietnamese(totalSeconds);
  };

  // Add handlers for exercise management
  const handleManageExercises = (lesson: ILesson) => {
    setManagingExercisesForLesson(lesson);
  };

  const handleBackFromExerciseManagement = () => {
    queryClient.invalidateQueries({ queryKey: ["lessons", section.id] });
    setManagingExercisesForLesson(null);
  };

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedLessons: ILesson[]) => {
      const reorderData = reorderedLessons.map((lesson, index) => ({
        id: lesson.id,
        ordering: index + 1,
      }));
      
      console.log(" Sending lesson reorder data:", reorderData);
      return reorderLesson(section.id!, reorderData);
    },
    onSuccess: () => {
      toast.success("Lessons reordered successfully");
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["lessons", section.id] });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      }
    },
    onError: (error: any) => {
      console.error(" Reorder error:", error);
      toast.error(error?.message || "Failed to reorder lessons");
      // Revert to original order
      const sortedLessons = [...safeLessons].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalLessons(sortedLessons);
      setHasUnsavedChanges(false);
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId, section.id!),
    onSuccess: () => {
      toast.success("Lesson deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", section.id] });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      }
      setDeletingLesson(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete lesson");
    },
  });

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log(" Lesson Drag End - Active:", active.id, "Over:", over?.id);

    if (active.id !== over?.id && over?.id) {
      setLocalLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        console.log("Moving lesson from index", oldIndex, "to", newIndex);

        if (oldIndex === -1 || newIndex === -1) {
          console.error("Invalid indices:", { oldIndex, newIndex });
          return items;
        }

        const newOrder = arrayMove(items, oldIndex, newIndex);
        console.log("New lesson order:", newOrder.map((l, i) => `${i + 1}. ${l.title}`));
        
        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  // Save and reset handlers
  const handleSaveReorder = () => {
    console.log("Saving lesson reorder...", localLessons);
    reorderMutation.mutate(localLessons);
  };

  const handleResetReorder = () => {
    console.log("Resetting lesson order...");
    const sortedLessons = [...safeLessons].sort((a, b) => {
      const orderA = a.ordering ?? 999;
      const orderB = b.ordering ?? 999;
      return orderA - orderB;
    });
    setLocalLessons(sortedLessons);
    setHasUnsavedChanges(false);
  };

  // Form handlers
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleEditLesson = (lesson: ILesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleDeleteLesson = (lesson: ILesson) => {
    setDeletingLesson(lesson);
  };

  const confirmDelete = () => {
    if (deletingLesson) {
      deleteLessonMutation.mutate(deletingLesson.id);
    }
  };

  if (managingExercisesForLesson) {
    return (
      <div className="space-y-6">
        {/* Back navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBackFromExerciseManagement}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Lessons</span>
          </Button>
        </div>

        {/* Context header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-md font-semibold text-blue-900">
              Exercise Management
            </h2>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">
              Lesson: {managingExercisesForLesson.title}
            </p>
            <p>
              Section: {section.title}
            </p>
            
          </div>
        </div>

        {/* Exercise list component */}
        <ExerciseList 
          lessonId={managingExercisesForLesson.id}
          sectionId={section.id} 
        />
      </div>
    );
  }

  // Show form if editing or creating lesson
  if (editingLesson || showForm) {
    return (
      <>
        <LessonForm
          courseId={courseId}
          sectionId={section.id!}
          lesson={editingLesson}
          existingLessons={localLessons}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />

        {/* Delete confirmation dialog */}
        <AlertDialog
          open={!!deletingLesson}
          onOpenChange={() => setDeletingLesson(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the lesson &ldquo;
                {deletingLesson?.title}&rdquo;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteLessonMutation.isPending}
              >
                {deleteLessonMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            Loading lessons...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading lessons: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            <span>Lesson</span>    
            {/* Total duration badge */}
            {localLessons.some(l => l.video_duration > 0) && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                {getTotalDuration()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Reorder controls */}
            {hasUnsavedChanges && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetReorder}
                  className="flex items-center space-x-1 text-gray-600"
                  disabled={reorderMutation.isPending}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveReorder}
                  className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700"
                  disabled={reorderMutation.isPending}
                >
                  <Save className="h-3 w-3" />
                  <span>
                    {reorderMutation.isPending ? "Saving..." : "Save Order"}
                  </span>
                </Button>
              </>
            )}
            
            <Button
              onClick={() => setShowForm(true)}
              variant={"outline"}
              size={"sm"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="mx-6 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 text-orange-800">
              <GripVertical className="h-4 w-4" />
              <span className="text-sm font-medium">
                You have unsaved changes to lesson order
              </span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Click "Save Order" to apply changes or "Reset" to discard them.
            </p>
          </div>
        )}

        <CardContent>
          {localLessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No lessons yet</p>
              <p className="text-sm">Add your first lesson to get started</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Lesson
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localLessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {localLessons.map((lesson, lessonIndex) => {
                    const originalIndex = safeLessons.findIndex((l: { id: string }) => l.id === lesson.id);
                    const hasChanged = originalIndex !== lessonIndex && hasUnsavedChanges;
                    
                    return (
                      <SortableLessonItem
                        key={lesson.id}
                        sectionId={section.id!}
                        lessonId={lesson.id}
                        lessonIndex={lessonIndex}
                        handleEditLesson={handleEditLesson}
                        handleDeleteLesson={handleDeleteLesson}
                        formatDuration={formatDuration}
                        hasUnsavedChanges={hasChanged}
                        onManageExercises={handleManageExercises} // Pass the handler
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Lesson form modal/section */}
      {showForm && (
        <div className="mt-6">
          <Separator className="mb-6" />
          <LessonForm
            courseId={courseId}
            sectionId={section.id!}
            lesson={editingLesson}
            existingLessons={localLessons}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deletingLesson}
        onOpenChange={() => setDeletingLesson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lesson &ldquo;
              {deletingLesson?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLessonMutation.isPending}
            >
              {deleteLessonMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonList;
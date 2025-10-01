"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// FIX: Add DnD imports
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  PlayCircle,
  FileText,
  BookOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  Video,
  GripVertical, // FIX: Add drag handle icon
  Save,
  RotateCcw,
} from "lucide-react";

import { ILesson } from "@/interface/lesson";
import { ISection } from "@/interface/section";
import { getLessonsBySectionId, deleteLesson, reorderLesson } from "@/api/lesson"; // FIX: Import reorderLessons
import LessonForm from "./lessonForm";
import { cn } from "@/lib/utils";

interface LessonListProps {
  section: ISection;
  courseId?: string;
}

const LESSON_TYPE_CONFIG = {
  video: { icon: Video, label: "Video", color: "bg-red-100 text-red-700" },
  document: {
    icon: FileText,
    label: "Document",
    color: "bg-blue-100 text-blue-700",
  },
  quiz: { icon: BookOpen, label: "Quiz", color: "bg-green-100 text-green-700" },
  assignment: {
    icon: FileText,
    label: "Assignment",
    color: "bg-purple-100 text-purple-700",
  },
};

// FIX: Add Sortable Lesson Item Component
const SortableLessonItem = ({
  lesson,
  lessonIndex,
  handleEditLesson,
  handleDeleteLesson,
  formatDuration,
  hasUnsavedChanges,
}: {
  lesson: ILesson;
  lessonIndex: number;
  handleEditLesson: (lesson: ILesson) => void;
  handleDeleteLesson: (lesson: ILesson) => void;
  formatDuration: (seconds: number) => string;
  hasUnsavedChanges: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeConfig =
    LESSON_TYPE_CONFIG[
      lesson.lesson_type as keyof typeof LESSON_TYPE_CONFIG
    ];
  const Icon = typeConfig?.icon || PlayCircle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-all duration-200 bg-white",
        isDragging && "shadow-2xl border-blue-400 bg-blue-50 rotate-1 scale-105 z-50",
        hasUnsavedChanges && !isDragging && "border-orange-300 bg-orange-50",
        !isDragging && !hasUnsavedChanges && "hover:bg-gray-50"
      )}
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* FIX: Add drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing transition-all",
            "border border-dashed hover:border-solid",
            isDragging
              ? "bg-blue-500 text-white border-blue-600"
              : "bg-gray-50 text-gray-400 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300"
          )}
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Order number */}
        <div className="flex-shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "w-8 h-6 justify-center",
              hasUnsavedChanges && "bg-orange-100 text-orange-700 border-orange-300"
            )}
          >
            {lessonIndex + 1}
          </Badge>
        </div>

        {/* Lesson icon and type */}
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {lesson.title}
            </h4>
            {lesson.is_preview && (
              <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
            {/* FIX: Add reorder indicator */}
           
          </div>
          {lesson.description && (
            <p className="text-sm text-gray-600 truncate">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Lesson metadata */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Badge
            className={`${
              typeConfig?.color || "bg-gray-100 text-gray-700"
            } px-2 py-1`}
          >
            {typeConfig?.label || lesson.lesson_type}
          </Badge>

          {lesson.lesson_type === "video" &&
            lesson.video_duration > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDuration(lesson.video_duration)}
                </span>
              </div>
            )}
        </div>
      </div>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleEditLesson(lesson)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteLesson(lesson)}
            className="flex items-center space-x-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const LessonList = ({ section, courseId = "" }: LessonListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<ILesson | null>(null);
  
  // FIX: Add reorder state
  const [localLessons, setLocalLessons] = useState<ILesson[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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

  console.log(lessons);
  const safeLessons = lessons.result || [];

  // FIX: Update local lessons when data changes
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

  // FIX: Add DnD sensors
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

  // FIX: Add reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedLessons: ILesson[]) => {
      const reorderData = reorderedLessons.map((lesson, index) => ({
        id: lesson.id,
        ordering: index + 1,
      }));
      
      console.log("💾 Sending lesson reorder data:", reorderData);
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
      console.error("❌ Reorder error:", error);
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

  // FIX: Add drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🔄 Lesson Drag End - Active:", active.id, "Over:", over?.id);

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

  // FIX: Add save and reset handlers
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

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  // Handle edit lesson
  const handleEditLesson = (lesson: ILesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  // Handle delete lesson
  const handleDeleteLesson = (lesson: ILesson) => {
    setDeletingLesson(lesson);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deletingLesson) {
      deleteLessonMutation.mutate(deletingLesson.id);
    }
  };

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
            <span>Lessons</span>
            <Badge variant="outline">{localLessons.length}</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* FIX: Add reorder controls */}
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
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>

        {/* FIX: Add unsaved changes indicator */}
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
            /* FIX: Wrap lessons in DnD context */
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
                    const originalIndex = safeLessons.findIndex(l => l.id === lesson.id);
                    const hasChanged = originalIndex !== lessonIndex && hasUnsavedChanges;
                    
                    return (
                      <SortableLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        handleEditLesson={handleEditLesson}
                        handleDeleteLesson={handleDeleteLesson}
                        formatDuration={formatDuration}
                        hasUnsavedChanges={hasChanged}
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
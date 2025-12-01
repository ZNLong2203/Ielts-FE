"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Save,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import LessonForm from "../lesson/lessonForm";
import SortableLessonItem from "../lesson/sortableLessonItem";
import { reorderLesson } from "@/api/lesson";
import { ILesson } from "@/interface/lesson";

interface LessonTabProps {
  section: any;
  selectedLessonId: string | null;
  onLessonSelect: (lessonId: string) => void;
  onBack: () => void;
  onRefresh?: () => void;
}

const LessonTab: React.FC<LessonTabProps> = ({
  section,
  selectedLessonId,
  onLessonSelect,
  onBack,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // Drag and Drop state
  const [localLessons, setLocalLessons] = useState<ILesson[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local lessons when section data changes
  useEffect(() => {
    if (section?.lessons && section.lessons.length > 0) {
      const sortedLessons = [...section.lessons].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalLessons(sortedLessons);
      setHasUnsavedChanges(false);
    } else {
      setLocalLessons([]);
    }
  }, [section?.lessons]);

  // DnD Sensors
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

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedLessons: ILesson[]) => {
      const reorderData = reorderedLessons.map((lesson, index) => ({
        id: lesson.id,
        ordering: index + 1,
      }));
      return reorderLesson(section.id, reorderData);
    },
    onSuccess: () => {
      toast.success("Lessons reordered successfully");
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["lessons", section.id] });
      queryClient.invalidateQueries({
        queryKey: ["course", section.course_id],
      });
      onRefresh?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reorder lessons");
      // Revert to original order
      if (section?.lessons) {
        const sortedLessons = [...section.lessons].sort((a, b) => {
          const orderA = a.ordering ?? 999;
          const orderB = b.ordering ?? 999;
          return orderA - orderB;
        });
        setLocalLessons(sortedLessons);
        setHasUnsavedChanges(false);
      }
    },
  });

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      setLocalLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  // Form handlers
  const handleLessonFormSuccess = () => {
    setShowLessonForm(false);
    setEditingLesson(null);
    onRefresh?.();
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setShowLessonForm(true);
  };

  const handleCancelForm = () => {
    setShowLessonForm(false);
    setEditingLesson(null);
  };

  // Save and reset handlers
  const handleSaveReorder = () => {
    reorderMutation.mutate(localLessons);
  };

  const handleResetReorder = () => {
    if (section?.lessons) {
      const sortedLessons = [...section.lessons].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalLessons(sortedLessons);
      setHasUnsavedChanges(false);
    }
  };

  if (!section) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Section Selected
            </h3>
            <p className="text-gray-500 mb-4">
              Please select a section to view its lessons.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sections
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{section.title} - Lessons</h3>
            <p className="text-sm text-gray-600">
              Manage lessons in this section
            </p>
          </div>
        </div>

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
            onClick={handleCreateLesson}
            className="flex items-center space-x-2"
            disabled={showLessonForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Lesson</span>
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
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

     
      {/* Lesson Form */}
      {showLessonForm && (
        <>
          <LessonForm
            sectionId={section.id}
            courseId={section.course_id}
            lesson={editingLesson}
            existingLessons={section.lessons || []}
            onSuccess={handleLessonFormSuccess}
            onCancel={handleCancelForm}
          />
        </>
      )}

      {/* Lessons List with Drag and Drop */}
      {localLessons && localLessons.length > 0 ? (
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
              {localLessons.map((lesson, index) => {
                const originalIndex =
                  section?.lessons?.findIndex((l: any) => l.id === lesson.id) ??
                  -1;
                const hasChanged = originalIndex !== index && hasUnsavedChanges;

                return (
                  <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    lessonIndex={index}
                    selectedLessonId={selectedLessonId}
                    editingLesson={editingLesson}
                    onEditLesson={handleEditLesson}
                    onLessonSelect={onLessonSelect}
                    showLessonForm={showLessonForm}
                    hasUnsavedChanges={hasChanged}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lessons in this section
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first lesson to start building section content.
              </p>
              <Button
                onClick={handleCreateLesson}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={showLessonForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      {showLessonForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>
                {editingLesson
                  ? `Editing lesson: "${editingLesson.title}"`
                  : "Creating new lesson"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonTab;

"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// FIX: Import DnD kit properly
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  BookOpen,
  FileText,
  Video,
  Clock,
  Play,
  Edit,
  Trash2,
  Plus,
  Eye,
  GripVertical,
  Save,
  RotateCcw,
} from "lucide-react";

import { ISection } from "@/interface/section";
import { deleteSection, reorderSections } from "@/api/section";
import { AlertModal } from "@/components/modal/alert-modal";
import SectionForm from "./sectionForm";
import LessonList from "../lesson/lessonList";
import { cn } from "@/lib/utils";

interface SectionDetailProps {
  courseId: string;
  sections?: ISection[];
  isEditable?: boolean;
  className?: string;
}

// FIX: Simplify Sortable Section Component
const SortableSectionItem = ({
  section,
  sectionIndex,
  isEditable,
  handleEditSection,
  handleDeleteSection,
  handleManageLessons,
  deleteSectionMutation,
  getLessonIcon,
  hasUnsavedChanges,
}: {
  section: ISection;
  sectionIndex: number;
  isEditable: boolean;
  handleEditSection: (section: ISection) => void;
  handleDeleteSection: (section: ISection) => void;
  handleManageLessons: (section: ISection) => void;
  deleteSectionMutation: any;
  getLessonIcon: (type: string) => JSX.Element;
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
    id: section.id,
    disabled: !isEditable, // FIX: Disable when not editable
  });

   // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // FIX: Add opacity for better visual feedback
  };

  // Sort lessons by ordering within each section
  const sortedLessons = section.lessons
    ? [...section.lessons].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      })
    : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-4 transition-all duration-200 bg-white",
        isDragging &&
          "shadow-2xl border-blue-400 bg-blue-50 rotate-2 scale-105",
        hasUnsavedChanges && !isDragging && "border-orange-300 bg-orange-50",
        !isDragging &&
          !hasUnsavedChanges &&
          "hover:shadow-sm hover:border-gray-300"
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* FIX: More visible drag handle */}
          {isEditable && (
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md cursor-grab active:cursor-grabbing transition-all",
                "border-2 border-dashed hover:border-solid",
                isDragging
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-gray-50 text-gray-400 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300"
              )}
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          <Badge
            variant="secondary"
            className={cn(
              "bg-indigo-100 text-indigo-800",
              hasUnsavedChanges &&
                "bg-orange-100 text-orange-800 border-orange-300"
            )}
          >
            Section {sectionIndex + 1}
          </Badge>
          <h4 className="font-semibold text-gray-900">
            {section.title || `Untitled Section ${sectionIndex + 1}`}
          </h4>

          {/* FIX: Add reorder indicator */}
          {hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-700 border-orange-300"
            >
              Moved
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {sortedLessons.length} lessons
          </Badge>
          {isEditable && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleManageLessons(section)}
                className="h-8 px-2 text-xs hover:bg-green-50 text-green-700 hover:text-green-800"
                title="Manage lessons"
              >
                <Play className="h-3 w-3 mr-1" />
                Manage Lesson
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditSection(section)}
                className="h-8 w-8 p-0 hover:bg-blue-50"
                title="Edit section"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSection(section)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete section"
                disabled={deleteSectionMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Section Description */}
      {section.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {section.description}
        </p>
      )}

      {/* Lessons List */}
      {sortedLessons && sortedLessons.length > 0 ? (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>Lessons</span>
            </h5>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedLessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.id || lessonIndex}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Badge
                    variant="outline"
                    className="text-xs w-8 justify-center flex-shrink-0"
                  >
                    {lesson.ordering ?? lessonIndex + 1}
                  </Badge>

                  <div className="flex-shrink-0">
                    {getLessonIcon(lesson.lesson_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {lesson.video_duration && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(lesson.video_duration)}</span>
                    </div>
                  )}

                  {lesson.is_preview && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      lesson.lesson_type === "video"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {lesson.lesson_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Separator />
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
            <Play className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500 mb-2">
              No lessons in this section
            </p>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManageLessons(section)}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Manage Lessons
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionDetail = ({
  courseId,
  sections = [],
  isEditable = false,
  className = "",
}: SectionDetailProps) => {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<ISection | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ISection | null>(null);

  const [managingLessonsForSection, setManagingLessonsForSection] =
    useState<ISection | null>(null);

  // FIX: Reorder state
  const [localSections, setLocalSections] = useState<ISection[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // FIX: Update local sections when props change
  useEffect(() => {
    if (sections && sections.length > 0) {
      // Sort by ordering before setting local state
      const sortedSections = [...sections].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalSections(sortedSections);
      setHasUnsavedChanges(false);
    } else {
      setLocalSections([]);
    }
  }, [sections]);

  // FIX: Better sensor configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // FIX: Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections: ISection[]) => {
      const reorderData = reorderedSections.map((section, index) => ({
        id: section.id,
        ordering: index + 1,
      }));
      
      return reorderSections(courseId, reorderData);
    },
    onSuccess: () => {
      toast.success("Sections reordered successfully");
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      console.error("Reorder error:", error);
      toast.error(error?.message || "Failed to reorder sections");
      // Revert to original order
      const sortedSections = [...sections].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalSections(sortedSections);
      setHasUnsavedChanges(false);
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      console.log("Deleting section:", sectionId);
      return deleteSection(sectionId, courseId);
    },
    onSuccess: () => {
      toast.success("Section deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    },
    onError: (error: Error) => {
      console.error("Delete section error:", error);
      toast.error(error?.message || "Failed to delete section");
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    },
  });

  // FIX: Improved drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      setLocalSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          console.error("Invalid indices:", { oldIndex, newIndex });
          return items;
        }

        const newOrder = arrayMove(items, oldIndex, newIndex);

        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  // FIX: Save and reset handlers
  const handleSaveReorder = () => {
    reorderMutation.mutate(localSections);
  };

  const handleResetReorder = () => {
    const sortedSections = [...sections].sort((a, b) => {
      const orderA = a.ordering ?? 999;
      const orderB = b.ordering ?? 999;
      return orderA - orderB;
    });
    setLocalSections(sortedSections);
    setHasUnsavedChanges(false);
  };

  // Handle delete section click
  const handleDeleteSection = (section: ISection) => {
    setSectionToDelete(section);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (sectionToDelete?.id) {
      deleteSectionMutation.mutate(sectionToDelete.id);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  // Handle edit section
  const handleEditSection = (section: ISection) => {
    setEditingSection(section);
    setShowCreateForm(false);
  };

  // Handle create new section
  const handleCreateSection = () => {
    setShowCreateForm(true);
    setEditingSection(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setEditingSection(null);
    setShowCreateForm(false);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setEditingSection(null);
    setShowCreateForm(false);
  };

  // Handle manage lessons for section
  const handleManageLessons = (section: ISection) => {
    setManagingLessonsForSection(section);
  };

  // Handle back from lesson management
  const handleBackFromLessonManagement = () => {
    setManagingLessonsForSection(null);
  };

  // Show form if editing or creating section
  if (editingSection || showCreateForm) {
    return (
      <>
        <SectionForm
          courseId={courseId}
          section={editingSection}
          existingSections={sections}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          className={className}
        />

        {/* Delete confirmation modal */}
        <AlertModal
          isOpen={deleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteSectionMutation.isPending}
        />
      </>
    );
  }

  // Show lesson management view
  if (managingLessonsForSection) {
    return (
      <>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackFromLessonManagement}
            className="mb-4 flex items-center space-x-2"
          >
            <span>← Back to Course Outline</span>
          </Button>
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-1">
              Managing lessons for: {managingLessonsForSection.title}
            </h3>
            <p className="text-sm text-green-700">
              Section {managingLessonsForSection.ordering}
            </p>
          </div>
        </div>

        <LessonList section={managingLessonsForSection} courseId={courseId} />
      </>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <>
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Course Outline</span>
              </div>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSection}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No sections available</p>
              <p className="text-sm mb-4">
                This course doesn&apos;t have any sections yet.
              </p>
              {isEditable && (
                <Button
                  variant="outline"
                  onClick={handleCreateSection}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Section
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete confirmation modal */}
        <AlertModal
          isOpen={deleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteSectionMutation.isPending}
        />
      </>
    );
  }

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "article":
      case "text":
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTotalLessons = () => {
    return sections.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    );
  };
  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Course Outline</span>
              <Badge variant="outline" className="ml-2">
                {sections.length} sections • {getTotalLessons()} lessons
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {/* FIX: Reorder controls */}
              {hasUnsavedChanges && isEditable && (
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

              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSection}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </Button>
              )}
            </div>
          </CardTitle>

          {/* FIX: Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 text-orange-800">
                <GripVertical className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You have unsaved changes to section order
                </span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Click "Save Order" to apply changes or "Reset" to discard them.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* FIX: DnD Context with better configuration */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {localSections.map((section, sectionIndex) => {
                  const originalIndex = sections.findIndex(
                    (s) => s.id === section.id
                  );
                  const hasChanged =
                    originalIndex !== sectionIndex && hasUnsavedChanges;

                  return (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      isEditable={isEditable}
                      handleEditSection={handleEditSection}
                      handleDeleteSection={handleDeleteSection}
                      handleManageLessons={handleManageLessons}
                      deleteSectionMutation={deleteSectionMutation}
                      getLessonIcon={getLessonIcon}
                      hasUnsavedChanges={hasChanged}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteSectionMutation.isPending}
      />
    </>
  );
};

export default SectionDetail;

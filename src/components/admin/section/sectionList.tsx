"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

import {
  BookOpen,
  FileText,
  Video,
  Plus,
  GripVertical,
  Save,
  RotateCcw,
  ArrowLeft,
  Target,
  Play,
} from "lucide-react";

import { ISection } from "@/interface/section";
import { deleteSection, reorderSections } from "@/api/section";
import { AlertModal } from "@/components/modal/alert-modal";
import SectionForm from "./sectionForm";
import SortableSectionItem from "./sortableSectionItem";
import LessonList from "../lesson/lessonList";

interface SectionDetailProps {
  courseId: string;
  sections?: ISection[];
  isEditable?: boolean;
  className?: string;
}

const SectionList = ({
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
    queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    setManagingLessonsForSection(section);
  };

  // Handle back from lesson management
  const handleBackFromLessonManagement = () => {
    queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
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
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course Outline</span>
          </Button>
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3 mb-2">
              <Play className="h-5 w-5 text-green-600" />
              <h2 className="text-md font-bold text-green-900">
                Lesson Management
              </h2>
            </div>
            <div>
              <p className="text-green-900 mb-1 text-sm font-medium">
                Section: {managingLessonsForSection.title}
              </p>
            </div>
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

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Course Outline</span>
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

export default SectionList;

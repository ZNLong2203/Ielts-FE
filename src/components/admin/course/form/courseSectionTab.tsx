"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  FolderOpen,
  Plus,
  Save,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import SectionForm from "../section/sectionForm";
import SortableSectionItem from "../section/sortableSectionItem";
import { reorderSections, deleteSection } from "@/api/section";
import { ISection } from "@/interface/section";
import { AlertModal } from "@/components/modal/alert-modal";

interface SectionTabProps {
  courseData: any;
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onRefresh?: () => void;
}

const SectionTab: React.FC<SectionTabProps> = ({
  courseData,
  selectedSectionId,
  onSectionSelect,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  
  // Drag and Drop state
  const [localSections, setLocalSections] = useState<ISection[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ISection | null>(null);

  // Update local sections when courseData changes
  useEffect(() => {
    if (courseData?.sections && courseData.sections.length > 0) {
      const sortedSections = [...courseData.sections].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalSections(sortedSections);
      setHasUnsavedChanges(false);
    } else {
      setLocalSections([]);
    }
  }, [courseData?.sections]);

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
    mutationFn: async (reorderedSections: ISection[]) => {
      const reorderData = reorderedSections.map((section, index) => ({
        id: section.id,
        ordering: index + 1,
      }));
      return reorderSections(courseData.id, reorderData);
    },
    onSuccess: () => {
      toast.success("Sections reordered successfully");
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["sections", courseData.id] });
      queryClient.invalidateQueries({ queryKey: ["course", courseData.id] });
      onRefresh?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reorder sections");
      // Revert to original order
      if (courseData?.sections) {
        const sortedSections = [...courseData.sections].sort((a, b) => {
          const orderA = a.ordering ?? 999;
          const orderB = b.ordering ?? 999;
          return orderA - orderB;
        });
        setLocalSections(sortedSections);
        setHasUnsavedChanges(false);
      }
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      return deleteSection(sectionId, courseData.id);
    },
    onSuccess: () => {
      toast.success("Section deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sections", courseData.id] });
      queryClient.invalidateQueries({ queryKey: ["course", courseData.id] });
      setDeleteModalOpen(false);
      setSectionToDelete(null);
      onRefresh?.();
      
      // If the deleted section was selected, clear the selection
      if (selectedSectionId === sectionToDelete?.id) {
        // You might want to call a callback to clear the selection in the parent
        // For now, we'll just refresh
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete section");
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    },
  });

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      setLocalSections((items) => {
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
  const handleSectionFormSuccess = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    onRefresh?.();
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setShowSectionForm(true);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setShowSectionForm(true);
  };

  const handleCancelForm = () => {
    setShowSectionForm(false);
    setEditingSection(null);
  };

  // Delete handlers
  const handleDeleteSection = (section: ISection) => {
    setSectionToDelete(section);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sectionToDelete) {
      deleteSectionMutation.mutate(sectionToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  // Save and reset handlers
  const handleSaveReorder = () => {
    reorderMutation.mutate(localSections);
  };

  const handleResetReorder = () => {
    if (courseData?.sections) {
      const sortedSections = [...courseData.sections].sort((a, b) => {
        const orderA = a.ordering ?? 999;
        const orderB = b.ordering ?? 999;
        return orderA - orderB;
      });
      setLocalSections(sortedSections);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Section Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Sections</h3>
          <p className="text-sm text-gray-600">
            Organize your course content into sections
          </p>
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
            onClick={handleCreateSection}
            className="flex items-center space-x-2"
            disabled={showSectionForm}
          >
            <Plus className="h-4 w-4" />
            <span>Add Section</span>
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
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

      {/* Section Form */}
      {showSectionForm && (
        <>
          <SectionForm
            courseId={courseData.id}
            section={editingSection}
            existingSections={courseData.sections || []}
            onSuccess={handleSectionFormSuccess}
            onCancel={handleCancelForm}
          />
          <Separator />
        </>
      )}

      {/* Sections List with Drag and Drop */}
      {localSections && localSections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localSections.map((section, index) => {
                const originalIndex = courseData?.sections?.findIndex(
                  (s: any) => s.id === section.id
                ) ?? -1;
                const hasChanged =
                  originalIndex !== index && hasUnsavedChanges;

                return (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    sectionIndex={index}
                    isEditable={true}
                    selectedSectionId={selectedSectionId}
                    editingSection={editingSection}
                    onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
                    onSectionSelect={onSectionSelect}
                    showSectionForm={showSectionForm}
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
              <div className="bg-gray-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FolderOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sections yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first section to organize your course lessons and
                content.
              </p>
              <Button
                onClick={handleCreateSection}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={showSectionForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteSectionMutation.isPending}
        title="Delete Section"
        description={
          sectionToDelete
            ? `Are you sure you want to delete "${sectionToDelete.title}"? This action cannot be undone and will also delete all lessons and exercises in this section.`
            : "Are you sure you want to delete this section?"
        }
      />
    </div>
  );
};

export default SectionTab;
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Clock,
  BookOpen,
  Edit,
  Trash2,
  GripVertical,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

import { ISection } from "@/interface/section";
import { cn } from "@/lib/utils";

interface SortableSectionItemProps {
  section: ISection;
  sectionIndex: number;
  isEditable: boolean;
  selectedSectionId: string | null;
  editingSection: any;
  onEditSection: (section: ISection) => void;
  onDeleteSection?: (section: ISection) => void; // Add delete handler
  onSectionSelect: (sectionId: string) => void;
  showSectionForm: boolean;
  hasUnsavedChanges?: boolean;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  sectionIndex,
  isEditable,
  selectedSectionId,
  editingSection,
  onEditSection,
  onDeleteSection,
  onSectionSelect,
  showSectionForm,
  hasUnsavedChanges = false,
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
    disabled: !isEditable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper functions (same logic as courseSectionTab)
  const getSectionDuration = (section: any) => {
    return (
      section.lessons?.reduce(
        (total: number, lesson: any) => total + (lesson.video_duration || 30),
        0
      ) || 0
    );
  };

  const formatDuration = (duration: number) => {
    if (!duration) return "~30 min";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200",
        // Drag state styling
        isDragging && "shadow-2xl scale-105 rotate-2 z-50",
        // Reorder state styling
        hasUnsavedChanges && !isDragging && "ring-2 ring-orange-300 bg-orange-50",
        // Selection state styling (same as original)
        !isDragging && !hasUnsavedChanges && selectedSectionId === section.id && "ring-2 ring-blue-500 bg-blue-50",
        // Editing state styling (same as original)
        !isDragging && !hasUnsavedChanges && editingSection?.id === section.id && "ring-2 ring-orange-500 bg-orange-50",
        // Default hover state
        !isDragging && !hasUnsavedChanges && selectedSectionId !== section.id && editingSection?.id !== section.id && "hover:bg-gray-50 hover:shadow-md"
      )}
    >
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            {/* Drag Handle */}
            {isEditable && (
              <div
                {...attributes}
                {...listeners}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing transition-all mt-1",
                  isDragging
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                )}
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* Section Icon */}
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {section.title || `Section ${sectionIndex + 1}`}
              </h4>
              <div className="flex items-center space-x-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  Section {section.ordering || sectionIndex + 1}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {section.lessons?.length || 0} lessons
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatDuration(getSectionDuration(section))}
                </Badge>
                
                {/* Status badges */}
                {editingSection?.id === section.id && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Currently Editing
                  </Badge>
                )}
                {hasUnsavedChanges && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Moved
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditSection(section);
              }}
              disabled={showSectionForm}
              className={cn(
                "transition-colors",
                editingSection?.id === section.id
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "hover:bg-blue-50 text-gray-600 hover:text-blue-700"
              )}
              title="Edit section"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            {onDeleteSection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSection(section);
                }}
                disabled={showSectionForm}
                className="hover:bg-red-50 text-gray-600 hover:text-red-700 transition-colors"
                title="Delete section"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Section Description */}
        {section.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {section.description}
          </p>
        )}

        {/* Footer with stats and action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3" />
              <span>{section.lessons?.length || 0} lessons</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDuration(getSectionDuration(section))}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant={selectedSectionId === section.id ? "default" : "outline"}
            onClick={() => onSectionSelect(section.id)}
            className="flex items-center space-x-1"
          >
            <span>
              {selectedSectionId === section.id ? "Selected" : "View Lessons"}
            </span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SortableSectionItem;
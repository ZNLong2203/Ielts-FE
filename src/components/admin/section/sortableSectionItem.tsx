"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Clock,
  Play,
  Edit,
  Trash2,
  Plus,
  Eye,
  GripVertical,
} from "lucide-react";

import { ISection } from "@/interface/section";
import { cn } from "@/lib/utils";

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

export default SortableSectionItem;
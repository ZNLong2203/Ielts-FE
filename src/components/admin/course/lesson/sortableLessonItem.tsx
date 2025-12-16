"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  FileText,
  Video,
  Edit,
  Trash2,
  ArrowRight,
  GripVertical,
  Clock,
} from "lucide-react";
import { ILesson } from "@/interface/lesson";
import { cn } from "@/lib/utils";

interface SortableLessonItemProps {
  lesson: ILesson;
  lessonIndex: number;
  selectedLessonId: string | null;
  editingLesson: any;
  onEditLesson: (lesson: ILesson) => void;
  onDeleteLesson?: (lesson: ILesson) => void; // Add delete handler
  onLessonSelect: (lessonId: string) => void;
  showLessonForm: boolean;
  hasUnsavedChanges?: boolean;
}

const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  lesson,
  lessonIndex,
  selectedLessonId,
  editingLesson,
  onEditLesson,
  onDeleteLesson,
  onLessonSelect,
  showLessonForm,
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
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper functions (same as original tab)
  const formatDuration = (duration: number) => {
    if (!duration) return "~30 min";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${minutes}m`;
  };

  const getLessonTypeIcon = (lessonType: string) => {
    switch (lessonType?.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200 bg-white rounded-lg border",
        // Drag state styling
        isDragging && "shadow-2xl scale-105 rotate-1 z-50",
        // Reorder state styling
        hasUnsavedChanges && !isDragging && "ring-2 ring-orange-300 bg-orange-50",
        // Selection state styling
        !isDragging && !hasUnsavedChanges && selectedLessonId === lesson.id && "ring-1 ring-black",
        // Editing state styling
        !isDragging && !hasUnsavedChanges && editingLesson?.id === lesson.id && "ring-1 ring-orange-500 bg-orange-50",
        // Default hover state
        !isDragging && !hasUnsavedChanges && selectedLessonId !== lesson.id && editingLesson?.id !== lesson.id && "hover:bg-gray-50 hover:shadow-md"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing transition-all",
                isDragging
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
              )}
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Lesson Number */}
            <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg font-bold">
              {lessonIndex + 1}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {lesson.title}
                </h4>
                {lesson.is_preview && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Preview
                  </Badge>
                )}
                {editingLesson?.id === lesson.id && (
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
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  {getLessonTypeIcon(lesson.lesson_type)}
                  <span className="capitalize">{lesson.lesson_type || "Video"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(lesson.video_duration)}</span>
                </div>
                <span>Order #{lesson.ordering || lessonIndex + 1}</span>
                <span>{lesson.exercises?.length || 0} exercises</span>
              </div>
              
              {lesson.description && (
                <p className="text-xs text-gray-400 mt-1 max-w-md truncate">
                  {lesson.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditLesson(lesson);
              }}
              disabled={showLessonForm}
              className={cn(
                "transition-colors",
                editingLesson?.id === lesson.id
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "hover:bg-blue-50 text-gray-600 hover:text-blue-700"
              )}
              title="Edit lesson"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            {onDeleteLesson && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLesson(lesson);
                }}
                disabled={showLessonForm}
                className="hover:bg-red-50 text-gray-600 hover:text-red-700 transition-colors"
                title="Delete lesson"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant={selectedLessonId === lesson.id ? "default" : "outline"}
              onClick={() => onLessonSelect(lesson.id)}
              className="flex items-center space-x-1"
            >
              <span>
                {selectedLessonId === lesson.id ? "Selected" : "View Exercises"}
              </span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableLessonItem;
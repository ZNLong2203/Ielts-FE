"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PlayCircle,
  FileText,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Video,
  GripVertical,
  X,
  Target,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { ILesson } from "@/interface/lesson";
import { getLessonById } from "@/api/lesson";
import HlsVideoPlayer from "@/components/modal/video-player";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

interface SortableLessonItemProps {
  lessonId: string;
  sectionId: string;
  lessonIndex: number;
  handleEditLesson: (lesson: ILesson) => void;
  handleDeleteLesson: (lesson: ILesson) => void;
  formatDuration: (seconds: number) => string;
  hasUnsavedChanges: boolean;
  onManageExercises?: (lesson: ILesson) => void;
}

// Enhanced duration formatting functions
const formatDuration = (seconds: number) => {
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

  return parts.join(" ");
};

const SortableLessonItem = ({
  lessonId,
  sectionId,
  lessonIndex,
  handleEditLesson,
  handleDeleteLesson,
  hasUnsavedChanges,
  onManageExercises,
}: SortableLessonItemProps) => {
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Fetch lesson data
  const {
    data: lessonInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson", sectionId, lessonId],
    queryFn: () => getLessonById(sectionId, lessonId),
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lessonId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeConfig =
    LESSON_TYPE_CONFIG[
      lessonInfo?.lesson_type as keyof typeof LESSON_TYPE_CONFIG
    ];
  const Icon = typeConfig?.icon || PlayCircle;

  // Get exercises from lesson data
  const exercises = lessonInfo?.exercises?.filter(ex => ex.deleted == false) || [];
  console.log("Lesson Info", lessonInfo)

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <Badge variant="outline" className="w-16 h-6 bg-gray-200 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
        <span className="text-red-600 text-sm">Error loading lesson</span>
      </div>
    );
  }

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
      {/* Lesson Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Drag handle - giống SortableSectionItem */}
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

          {/* Order badge */}
          <Badge
            variant="secondary"
            className={cn(
              "bg-green-100 text-green-800",
              hasUnsavedChanges &&
                "bg-orange-100 text-orange-800 border-orange-300"
            )}
          >
            Lesson {lessonIndex + 1}
          </Badge>

          {/* Lesson title */}
          <h4 className="font-semibold text-gray-900">
            {lessonInfo?.title || `Untitled Lesson ${lessonIndex + 1}`}
          </h4>

          {/* Preview indicator */}
          {lessonInfo?.is_preview && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Badge>
          )}

          {/* Moved indicator */}
          {hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-700 border-orange-300"
            >
              Moved
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {/* Video preview button */}
            {lessonInfo?.lesson_type === "video" && lessonInfo?.hlsUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoPreview(!showVideoPreview)}
                className="h-8 px-2 text-xs hover:bg-blue-50 text-blue-700 hover:text-blue-800"
                title="Video preview"
              >
                <Video className="h-3 w-3 mr-1" />
                {showVideoPreview ? "Hide" : "Watch"}
              </Button>
            )}

            {/* Manage exercises button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => lessonInfo && onManageExercises?.(lessonInfo)}
                className="h-8 px-2 text-xs hover:bg-green-50 text-green-700 hover:text-green-800"
                title="Manage exercises"
              >
                <Target className="h-3 w-3 mr-1" />
                Manage Exercise
              </Button>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => lessonInfo && handleEditLesson(lessonInfo)}
              className="h-8 w-8 p-0 hover:bg-blue-50"
              title="Edit lesson"
            >
              <Edit className="h-3 w-3" />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => lessonInfo && handleDeleteLesson(lessonInfo)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete lesson"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson Description */}
      {lessonInfo?.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {lessonInfo.description}
        </p>
      )}

      {/* Lesson Metadata */}
      <div className="flex items-center space-x-3 mb-4">
        <Badge
          className={`${typeConfig?.color || "bg-gray-100 text-gray-700"} px-2 py-1`}
        >
          <Icon className="h-3 w-3 mr-1" />
          {typeConfig?.label || lessonInfo?.lesson_type}
        </Badge>

        {lessonInfo?.video_duration && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(lessonInfo.video_duration)}</span>
          </div>
        )}

        {exercises.length > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Target className="h-3 w-3 mr-1" />
            {exercises.length} exercise{exercises.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Video Preview Section */}
      {showVideoPreview && lessonInfo?.hlsUrl && (
        <div className="mb-4">
          <Separator className="mb-3" />
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Video Preview</span>
                <Badge variant="outline" className="text-xs">
                  HLS Stream
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatDuration(lessonInfo?.video_duration || 0)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoPreview(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <HlsVideoPlayer
              hlsUrl={lessonInfo.hlsUrl}
              title={lessonInfo?.title}
              description={lessonInfo?.description}
              duration={lessonInfo?.video_duration}
              isPreview={lessonInfo?.is_preview}
              autoPlay={false}
              onProgress={(current, total) => {
                console.log(
                  `${lessonInfo?.title} progress: ${Math.round(
                    (current / total) * 100
                  )}%`
                );
              }}
              onComplete={() => {
                console.log(`${lessonInfo?.title} completed`);
                toast.success("Video completed! 🎉");
              }}
              onError={(error) => {
                console.error(`Video error for ${lessonInfo?.title}:`, error);
                toast.error("Failed to load video");
              }}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Exercises List for Lesson item */}
      {exercises && exercises.length > 0 ? (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Exercises</span>
            </h5>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exercises
              .sort((a, b) => (a.ordering ?? 999) - (b.ordering ?? 999))
              .map((exercise, exerciseIndex) => (
                <div
                  key={exercise.id || exerciseIndex}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="text-xs w-8 justify-center flex-shrink-0"
                    >
                      {exercise.ordering ?? exerciseIndex + 1}
                    </Badge>

                    <div className="flex-shrink-0">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {exercise.title}
                      </p>
                      {exercise.content?.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {exercise.content?.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {exercise.time_limit && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(exercise.time_limit)}</span>
                      </div>
                    )}

                    {exercise.passing_score && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Trophy className="h-3 w-3" />
                        <span>{exercise.passing_score}%</span>
                      </div>
                    )}

                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        exercise.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {exercise.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
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
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500 mb-2">
              No exercises in this lesson
            </p>
            {onManageExercises && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => lessonInfo && onManageExercises(lessonInfo)}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Exercises
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableLessonItem;
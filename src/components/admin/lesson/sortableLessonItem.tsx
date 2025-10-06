"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlayCircle,
  FileText,
  BookOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  Video,
  GripVertical,
  X,
} from "lucide-react";
import { ILesson } from "@/interface/lesson";
import { getLessonById } from "@/api/lesson";
import VideoPlayer from "@/components/modal/video-player";
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
  sectionId: string;
  lesson: ILesson;
  lessonIndex: number;
  handleEditLesson: (lesson: ILesson) => void;
  handleDeleteLesson: (lesson: ILesson) => void;
  formatDuration: (seconds: number) => string;
  hasUnsavedChanges: boolean;
}

// Enhanced duration formatting functions
const formatDurationCompact = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
};

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

  return parts.join(" ");
};

const SortableLessonItem = ({
  sectionId,
  lesson,
  lessonIndex,
  handleEditLesson,
  handleDeleteLesson,
  formatDuration,
  hasUnsavedChanges,
}: SortableLessonItemProps) => {
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  // Fetch lessons for this section
  const {
    data: lessonInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson"],
    queryFn: () => getLessonById(sectionId, lesson.id),
  });
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

  console.log("Lesson Info: ", lessonInfo);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  //   console.log("Lesson fetch:", lesson);

  const typeConfig =
    LESSON_TYPE_CONFIG[lesson.lesson_type as keyof typeof LESSON_TYPE_CONFIG];
  const Icon = typeConfig?.icon || PlayCircle;

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center justify-between p-4 border rounded-lg transition-all duration-200 bg-white",
          isDragging &&
            "shadow-2xl border-blue-400 bg-blue-50 rotate-1 scale-105 z-50",
          hasUnsavedChanges && !isDragging && "border-orange-300 bg-orange-50",
          !isDragging && !hasUnsavedChanges && "hover:bg-gray-50"
        )}
      >
        <div className="flex items-center space-x-4 flex-1">
          {/* Drag handle */}
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
                hasUnsavedChanges &&
                  "bg-orange-100 text-orange-700 border-orange-300"
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
              {hasUnsavedChanges && (
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
                >
                  Moved
                </Badge>
              )}
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

            {/* Enhanced duration display for video lessons */}
            {lesson.lesson_type === "video" && lesson.video_duration > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span className="font-mono">
                  {formatDurationCompact(lesson.video_duration)}
                </span>
                <span className="text-xs text-gray-500 hidden md:inline">
                  ({formatDuration(lesson.video_duration)})
                </span>
              </div>
            )}

            {/* Video preview button */}
            {lesson.lesson_type === "video" && lesson.video_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideoPreview(!showVideoPreview)}
                className="text-xs h-6 px-2"
              >
                <Video className="h-3 w-3 mr-1" />
                {showVideoPreview ? "Hide" : "Watch"}
              </Button>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Watch video option */}
            {lesson.lesson_type === "video" && lesson.video_url && (
              <DropdownMenuItem
                onClick={() => setShowVideoPreview(!showVideoPreview)}
                className="flex items-center space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>{showVideoPreview ? "Hide Video" : "Watch Video"}</span>
              </DropdownMenuItem>
            )}
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

      {/* Video Preview Section */}
      {showVideoPreview && lessonInfo?.hlsUrl && (
        <div className="mt-3 px-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Video Preview</span>
                <Badge variant="outline" className="text-xs">
                  {formatDurationVietnamese(lesson.video_duration)}
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

            <VideoPlayer
              videoUrl={lessonInfo.hlsUrl || ""}
              title={lesson.title}
              description={lesson.description}
              duration={lesson.video_duration}
              isPreview={lesson.is_preview}
              onProgress={(current, total) => {
                // Track video progress
                console.log(
                  `${lesson.title} progress: ${Math.round(
                    (current / total) * 100
                  )}%`
                );
              }}
              onComplete={() => {
                console.log(`${lesson.title} completed`);
                toast.success("Video completed!");
              }}
              className="mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableLessonItem;

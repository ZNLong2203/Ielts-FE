"use client";
import { useState } from "react";
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
} from "lucide-react";

import { ILesson } from "@/interface/lesson";
import { ISection } from "@/interface/section";
import { getLessonsBySectionId, deleteLesson } from "@/api/lesson";
import LessonForm from "./lessonForm";

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

const LessonList = ({ section, courseId = "" }: LessonListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<ILesson | null>(null);
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

  // Ensure lessons is always an array
  console.log(lessons);
  const safeLessons = lessons.result;

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
            <Badge variant="outline">{lessons.result?.length}</Badge>
          </CardTitle>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </CardHeader>

        <CardContent>
          {lessons?.length === 0 ? (
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
            <div className="space-y-4">
              {safeLessons
                ?.sort(
                  (a: ILesson, b: ILesson) =>
                    (a.ordering || 999) - (b.ordering || 999)
                )
                .map((lesson: ILesson) => {
                  const typeConfig =
                    LESSON_TYPE_CONFIG[
                      lesson.lesson_type as keyof typeof LESSON_TYPE_CONFIG
                    ];
                  const Icon = typeConfig?.icon || PlayCircle;

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Order number */}
                        <div className="flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="w-8 h-6 justify-center"
                          >
                            {lesson.ordering}
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
                })}
            </div>
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
            existingLessons={safeLessons}
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

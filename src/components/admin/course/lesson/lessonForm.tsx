"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  X,
  PlayCircle,
  FileText,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";

import { ILesson, ILessonCreate, ILessonUpdate } from "@/interface/lesson";
import { createLesson, updateLesson } from "@/api/lesson";
import VideoUploadSection from "@/components/form/video-upload-field";
import { LessonFormSchema } from "@/validation/lesson";
import { LESSON_TYPES } from "@/constants/lesson";

type LessonFormData = z.infer<typeof LessonFormSchema>;

interface LessonFormProps {
  sectionId: string;
  courseId: string;
  lesson?: ILesson | null;
  existingLessons?: ILesson[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const LessonForm = ({
  sectionId,
  courseId,
  lesson = null,
  existingLessons = [],
  onSuccess,
  onCancel,
  className = "",
}: LessonFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!lesson;
  const [savedLessonId, setSavedLessonId] = useState<string | null>(
    lesson?.id || null
  );

  // Helper function
  const getNextOrdering = () => {
    if (!existingLessons.length) return 1;
    return Math.max(...existingLessons.map((l) => l.ordering || 0)) + 1;
  };

  // Form setup
  const normalizeLessonType = (value: string | undefined): LessonFormData["lesson_type"] => {
    return value === "video" || value === "document" || value === "quiz" || value === "assignment"
      ? value
      : "video";
  };

  const form = useForm<LessonFormData>({
    resolver: zodResolver(LessonFormSchema),
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      lesson_type: normalizeLessonType(lesson?.lesson_type),
      is_preview: lesson?.is_preview || false,
      ordering: lesson?.ordering || getNextOrdering(),
      document_url: lesson?.document_url || "",
    },
  });

  const selectedLessonType = form.watch("lesson_type");

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lesson?.id] });
    queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
  };

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const lessonData: ILessonCreate = {
        title: data.title,
        description: data.description,
        lesson_type: data.lesson_type,
        is_preview: data.is_preview,
        ordering: data.ordering,
        document_url: data.document_url || undefined,
      };
      return createLesson(lessonData, sectionId);
    },
    onSuccess: (response) => {
      toast.success("Lesson created successfully! 📚");
      setSavedLessonId(response.data?.id || response.id);
      invalidateQueries();

      // Don't close form immediately for video lessons to allow upload
      if (selectedLessonType !== "video") {
        onSuccess?.();
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create lesson");
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      if (!lesson?.id) throw new Error("Lesson ID is required");
      const updateData: ILessonUpdate = {
        title: data.title,
        description: data.description,
        lesson_type: data.lesson_type,
        is_preview: data.is_preview,
        ordering: data.ordering,
        document_url: data.document_url || undefined,
      };
      return updateLesson(updateData, lesson.id, sectionId);
    },
    onSuccess: () => {
      toast.success("Lesson updated successfully! ✨");
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update lesson");
    },
  });

  // Event handlers
  const handleSubmit = async (data: LessonFormData) => {
    if (isEditing) {
      updateLessonMutation.mutate(data);
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const onSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = await form.trigger();
    if (isValid) {
      const formData = form.getValues();
      handleSubmit(formData);
    }
  };

  const adjustOrdering = (direction: "up" | "down") => {
    const currentOrdering = form.getValues("ordering");
    const newOrdering = direction === "up" ? currentOrdering - 1 : currentOrdering + 1;
    if (newOrdering >= 1) {
      form.setValue("ordering", newOrdering);
    }
  };

  const handleVideoUploadSuccess = (videoData: any) => {
    console.log("Video uploaded successfully:", videoData);
    invalidateQueries();
    toast.success("Video is ready for streaming! 🎬");
  };

  const handleVideoUploadError = (error: string) => {
    console.error("Video upload error:", error);
  };

  const isLoading = createLessonMutation.isPending || updateLessonMutation.isPending;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            <span>{isEditing ? "Edit Lesson" : "Create New Lesson"}</span>
            {isEditing && lesson && (
              <Badge variant="outline" className="ml-2">
                Lesson {lesson.ordering}
              </Badge>
            )}
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <TextField
                control={form.control}
                name="title"
                label={
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Lesson Title</span>
                    <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter lesson title..."
                required
              />

              <TextField
                control={form.control}
                name="description"
                label={
                  <div>
                    Description <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter lesson description..."
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="lesson_type"
                  label="Lesson type"
                  placeholder="Select lesson type"
                  options={LESSON_TYPES.map(type => ({
                    value: type.value,
                    label: type.label,
                    icon: type.icon,
                  }))}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Lesson Order</label>
                  <div className="flex items-center space-x-2">
                    <TextField
                      control={form.control}
                      name="ordering"
                      label=""
                      type="number"
                      min={1}
                      className="w-24"
                    />
                    <div className="flex flex-col space-y-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustOrdering("up")}
                        className="h-6 w-6 p-0"
                        disabled={form.getValues("ordering") <= 1}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustOrdering("down")}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Setting */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  {form.watch("is_preview") ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <label className="text-sm font-semibold">Preview Lesson</label>
                </div>
                <div className="text-sm text-gray-600">
                  Allow users to preview this lesson without enrollment
                </div>
              </div>
              <Switch
                checked={form.watch("is_preview")}
                onCheckedChange={(checked) => form.setValue("is_preview", checked)}
              />
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              {selectedLessonType === "video" ? (
                <VideoUploadSection
                  lessonId={savedLessonId || lesson?.id}
                  sectionId={sectionId}
                  currentHlsUrl={lesson?.hlsUrl}
                  onUploadSuccess={handleVideoUploadSuccess}
                  onUploadError={handleVideoUploadError}
                />
              ) : (
                <TextField
                  control={form.control}
                  name="document_url"
                  label={
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>Document URL</span>
                    </div>
                  }
                  placeholder="https://example.com/document.pdf"
                  type="url"
                />
              )}
            </div>

            {/* Existing Lessons Preview */}
            {existingLessons.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>Current Lessons</span>
                    <Badge variant="outline">{existingLessons.length}</Badge>
                  </h4>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {existingLessons
                      .sort((a, b) => (a.ordering || 999) - (b.ordering || 999))
                      .map((existingLesson) => (
                        <div
                          key={existingLesson.id}
                          className={`flex items-center justify-between p-2 rounded text-xs border ${
                            existingLesson.id === lesson?.id
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`w-6 h-5 text-xs justify-center ${
                                existingLesson.id === lesson?.id
                                  ? "bg-green-100 text-green-700"
                                  : ""
                              }`}
                            >
                              {existingLesson.ordering}
                            </Badge>
                            <span
                              className={`truncate max-w-32 ${
                                existingLesson.id === lesson?.id
                                  ? "font-medium text-green-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {existingLesson.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {existingLesson.lesson_type}
                            </Badge>
                            {existingLesson.is_preview && (
                              <Eye className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                onClick={onSubmitClick}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Lesson"
                    : "Create Lesson"}
                </span>
              </Button>

              {/* Finish Button for video lessons after creation */}
              {savedLessonId &&
                selectedLessonType === "video" &&
                !isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onSuccess?.();
                      form.reset();
                      setSavedLessonId(null);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Finish</span>
                  </Button>
                )}
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
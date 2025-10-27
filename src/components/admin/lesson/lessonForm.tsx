"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  X,
  PlayCircle,
  FileText,
  ArrowUp,
  ArrowDown,
  Video,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

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

  // Form setup
  const form = useForm<LessonFormData>({
    resolver: zodResolver(LessonFormSchema),
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      lesson_type:
        (lesson?.lesson_type as "video" | "document" | "quiz" | "assignment") ||
        "video",
      is_preview: lesson?.is_preview || false,
      ordering: lesson?.ordering || getNextOrdering(),
      document_url: lesson?.document_url || "",
    },
  });

  const selectedLessonType = form.watch("lesson_type");

  // Get next available ordering number
  function getNextOrdering() {
    if (existingLessons.length === 0) return 1;
    const maxOrdering = Math.max(
      ...existingLessons.map((l) => l.ordering || 0)
    );
    return maxOrdering + 1;
  }

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
      toast.success("Lesson created successfully");
      setSavedLessonId(response.data?.id || response.id);
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lesson?.id] });


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
      toast.success("Lesson updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lesson?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update lesson");
    },
  });

  // Submit handler
  const handleSubmit = async (data: LessonFormData) => {
    try {
      if (isEditing) {
        updateLessonMutation.mutate(data);
      } else {
        createLessonMutation.mutate(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Handle form submission programmatically
  const onSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = await form.trigger();
    if (isValid) {
      const formData = form.getValues();
      handleSubmit(formData);
    }
  };

  // Move ordering up/down
  const adjustOrdering = (direction: "up" | "down") => {
    const currentOrdering = form.getValues("ordering");
    const newOrdering =
      direction === "up" ? currentOrdering - 1 : currentOrdering + 1;

    if (newOrdering >= 1) {
      form.setValue("ordering", newOrdering);
    }
  };

  // Handle video upload success
  const handleVideoUploadSuccess = (videoData: any) => {
    console.log("Video uploaded successfully:", videoData);

    // Invalidate queries to refresh lesson data
    queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });

    toast.success("Video is ready for streaming! 🎬");
  };

  // Handle video upload error
  const handleVideoUploadError = (error: string) => {
    console.error("Video upload error:", error);
    // Error is already shown by VideoUploadSection, just log it
  };

  const isLoading =
    createLessonMutation.isPending || updateLessonMutation.isPending;

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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lesson Title</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter lesson title..."
                        {...field}
                        className="focus:ring-2 focus:ring-green-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onSubmitClick(e as unknown as React.MouseEvent);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter lesson description..."
                        rows={3}
                        {...field}
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lesson_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-2 focus:ring-green-500">
                            <SelectValue placeholder="Select lesson type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LESSON_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ordering"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Order</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                            className="w-24 focus:ring-2 focus:ring-green-500"
                          />
                        </FormControl>
                        <div className="flex flex-col space-y-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => adjustOrdering("up")}
                            className="h-6 w-6 p-0"
                            disabled={field.value <= 1}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Preview Setting */}
            <FormField
              control={form.control}
              name="is_preview"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center space-x-2">
                      {field.value ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Preview Lesson</span>
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Allow users to preview this lesson without enrollment
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                <FormField
                  control={form.control}
                  name="document_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>Document URL</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/document.pdf"
                          {...field}
                          className="focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  X,
  Target,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Trophy,
  Lightbulb,
  Image,
  BookOpen,
} from "lucide-react";

// Import reusable components
import TextField from "@/components/form/text-field";

import {
  IExercise,
  IExerciseCreate,
  IExerciseUpdate,
} from "@/interface/exercise";
import { createExercise, updateExercise } from "@/api/exercise";
import { ExerciseFormSchema } from "@/validation/exercise";

type ExerciseFormData = z.infer<typeof ExerciseFormSchema>;

interface ExerciseFormProps {
  lessonId: string;
  sectionId?: string;
  exercise?: IExercise | null;
  existingExercises?: IExercise[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const ExerciseForm = ({
  lessonId,
  sectionId,
  exercise = null,
  existingExercises = [],
  onSuccess,
  onCancel,
  className = "",
}: ExerciseFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!exercise;

  // Helper function
  const getNextOrdering = () => {
    if (!existingExercises.length) return 1;
    return Math.max(...existingExercises.map((ex) => ex.ordering || 0)) + 1;
  };

  // Form setup
  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(ExerciseFormSchema),
    defaultValues: {
      title: exercise?.title || "",
      description: exercise?.content.description || "",
      instruction: exercise?.instruction || "",
      content: exercise?.content.main_content || "",
      media_url: exercise?.media_url || "",
      time_limit: exercise?.time_limit || 300,
      max_attempts: exercise?.max_attempts || 3,
      passing_score: exercise?.passing_score || "",
      ordering: exercise?.ordering || getNextOrdering(),
      is_active: exercise?.is_active ?? true,
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
    queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
  };

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: ExerciseFormData) => {
      const exerciseData: IExerciseCreate = {
        lesson_id: lessonId,
        title: data.title,
        description: data.description,
        instruction: data.instruction,
        content: data.content,
        media_url: data.media_url || "",
        time_limit: data.time_limit,
        max_attempts: data.max_attempts,
        passing_score: data.passing_score,
        ordering: data.ordering,
        is_active: data.is_active,
      };
      return createExercise(exerciseData, lessonId);
    },
    onSuccess: () => {
      toast.success("Exercise created successfully! 🎯");
      invalidateQueries();
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create exercise");
    },
  });

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async (data: ExerciseFormData) => {
      if (!exercise?.id) throw new Error("Exercise ID is required");
      const updateData: IExerciseUpdate = {
        title: data.title,
        description: data.description,
        instruction: data.instruction,
        content: data.content,
        media_url: data.media_url,
        time_limit: data.time_limit,
        max_attempts: data.max_attempts,
        passing_score: data.passing_score,
        ordering: data.ordering,
        is_active: data.is_active,
      };
      return updateExercise(updateData, exercise.id, lessonId);
    },
    onSuccess: () => {
      toast.success("Exercise updated successfully! ✨");
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update exercise");
    },
  });

  // Event handlers
  const onSubmit = async (data: ExerciseFormData) => {
    if (isEditing) {
      updateExerciseMutation.mutate(data);
    } else {
      createExerciseMutation.mutate(data);
    }
  };

  const adjustOrdering = (direction: "up" | "down") => {
    const currentOrdering = form.getValues("ordering");
    const newOrdering = direction === "up" ? currentOrdering - 1 : currentOrdering + 1;
    if (newOrdering >= 1) {
      form.setValue("ordering", newOrdering);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isLoading = createExerciseMutation.isPending || updateExerciseMutation.isPending;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>{isEditing ? "Edit Exercise" : "Create New Exercise"}</span>
            {isEditing && exercise && (
              <Badge variant="outline" className="ml-2">
                Exercise {exercise.ordering}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <TextField
                control={form.control}
                name="title"
                label={
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Exercise Title</span>
                    <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter exercise title..."
                required
              />

              <TextField
                control={form.control}
                name="description"
                label={
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter exercise description..."
                required
              />

              <TextField
                control={form.control}
                name="instruction"
                label={
                  <div className="flex items-center space-x-1">
                    <Lightbulb className="h-4 w-4" />
                    <span>Instructions</span>
                    <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter specific instructions for this exercise..."
                required
              />

              <TextField
                control={form.control}
                name="content"
                label={
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Content</span>
                    <span className="text-red-500">*</span>
                  </div>
                }
                placeholder="Enter exercise content (questions, materials, etc.)..."
                required
              />

              <TextField
                control={form.control}
                name="media_url"
                label={
                  <div className="flex items-center space-x-1">
                    <Image className="h-4 w-4" />
                    <span>Media URL (Optional)</span>
                  </div>
                }
                placeholder="https://example.com/audio.mp3"
                type="url"
              />
            </div>

            {/* Exercise Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Limit with Display */}
              <div className="space-y-2">
                <TextField
                  control={form.control}
                  name="time_limit"
                  label={
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Time Limit (seconds)</span>
                    </div>
                  }
                  type="number"
                  min={30}
                />
                {form.watch("time_limit") && (
                  <div className="text-sm text-gray-500">
                    Duration: {formatTime(form.watch("time_limit"))}
                  </div>
                )}
              </div>

              <TextField
                control={form.control}
                name="max_attempts"
                label="Max Attempts"
                type="number"
                min={1}
                max={10}
              />

              <TextField
                control={form.control}
                name="passing_score"
                label={
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>Passing Score (%)</span>
                  </div>
                }
                type="text"
                min={0}
                max={100}
              />

              {/* Exercise Order with Controls */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Exercise Order</label>
                <div className="flex items-center space-x-2">
                  <TextField
                    control={form.control}
                    name="ordering"
                    label=""
                    type="number"
                    min={1}
                    className="w-20"
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

            {/* Active Setting */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      form.watch("is_active") ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <label className="text-sm font-semibold">Active Exercise</label>
                </div>
                <div className="text-sm text-gray-600">
                  Exercise is visible and available to students
                </div>
              </div>
              <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(checked) => form.setValue("is_active", checked)}
              />
            </div>

            {/* Existing Exercises Preview */}
            {existingExercises.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2 mb-3">
                    <Target className="h-4 w-4" />
                    <span>Current Exercises</span>
                    <Badge variant="outline">{existingExercises.length}</Badge>
                  </h4>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {existingExercises
                      .sort((a, b) => (a.ordering || 999) - (b.ordering || 999))
                      .map((existingExercise) => (
                        <div
                          key={existingExercise.id}
                          className={`flex items-center justify-between p-2 rounded text-xs border ${
                            existingExercise.id === exercise?.id
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`w-6 h-5 text-xs justify-center ${
                                existingExercise.id === exercise?.id
                                  ? "bg-blue-100 text-blue-700"
                                  : ""
                              }`}
                            >
                              {existingExercise.ordering}
                            </Badge>
                            <span
                              className={`truncate max-w-32 ${
                                existingExercise.id === exercise?.id
                                  ? "font-medium text-blue-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {existingExercise.title}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatTime(existingExercise.time_limit || 300)}
                              </span>
                            </div>
                            {existingExercise.is_active && (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
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
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Exercise"
                    : "Create Exercise"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExerciseForm;
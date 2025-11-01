"use client";
import React from "react";
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

  // Get next available ordering number
  function getNextOrdering() {
    if (existingExercises.length === 0) return 1;
    const maxOrdering = Math.max(
      ...existingExercises.map((ex) => ex.ordering || 0)
    );
    return maxOrdering + 1;
  }

  // Form setup with actual interface structure
  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(ExerciseFormSchema),
    defaultValues: {
      title: exercise?.title || "",
      description: exercise?.content.description || "",
      instruction: exercise?.instruction || "",
      content: exercise?.content.main_content || "",
      media_url: exercise?.media_url || "",
      time_limit: exercise?.time_limit || 300, // 5 minutes default
      max_attempts: exercise?.max_attempts || 3,
      passing_score: exercise?.passing_score || "",
      ordering: exercise?.ordering || getNextOrdering(),
      is_active: exercise?.is_active ?? true,
    },
  });

  // Create exercise mutation với comprehensive invalidation
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
      queryClient.invalidateQueries({
        queryKey: ["lesson", sectionId, lessonId],
      }),
        queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });

      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      console.error("❌ Create exercise error:", error);
      console.error(" Create exercise error:", error);
      toast.error(error?.message || "Failed to create exercise");
    },
  });

  // Update exercise mutation với comprehensive invalidation
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
      queryClient.invalidateQueries({
        queryKey: ["lesson", sectionId, lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error(" Update exercise error:", error);
      toast.error(error?.message || "Failed to update exercise");
    },
  });

  // Submit handler
  const onSubmit = async (data: ExerciseFormData) => {
    try {
      console.log("📝 Form submission:", { isEditing, data });
      console.log(" Form submission:", { isEditing, data });

      if (isEditing) {
        updateExerciseMutation.mutate(data);
      } else {
        createExerciseMutation.mutate(data);
      }
    } catch (error) {
      console.error(" Form submission error:", error);
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

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isLoading =
    createExerciseMutation.isPending || updateExerciseMutation.isPending;

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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Exercise Title</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter exercise title..."
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
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
                    <FormLabel className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Description</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter exercise description..."
                        rows={3}
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Lightbulb className="h-4 w-4" />
                      <span>Instructions</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter specific instructions for this exercise..."
                        rows={3}
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Content</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter exercise content (questions, materials, etc.)..."
                        rows={4}
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Media URL */}
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Image className="h-4 w-4" />
                      <span>Media URL (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/audio.mp3"
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exercise Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="time_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Time Limit (seconds)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min={30}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 300)
                            }
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                          {field.value && (
                            <div className="text-sm text-gray-500">
                              Duration: {formatTime(field.value)}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attempts</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 3)
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passing_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>Passing Score (%)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          min={0}
                          max={100}
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ordering"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Order</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                            className="w-20 focus:ring-2 focus:ring-blue-500"
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

              {/* Active Setting */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center space-x-2">
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            field.value ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                        <span>Active Exercise</span>
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Exercise is visible and available to students
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
            </div>

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

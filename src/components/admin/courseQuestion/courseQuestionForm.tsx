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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  X,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  BarChart3,
  List,
  Plus,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";

import {
  ICourseQuestion,
  ICourseQuestionCreate,
  ICourseQuestionUpdate,
  ICourseQuestionOption,
} from "@/interface/courseQuestion";
import {
  createCourseQuestion,
  updateCourseQuestion,
} from "@/api/courseQuestion";
import { CourseQuestionFormSchema } from "@/validation/courseQuestion";
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from "@/constants/courseQuestion";

type CourseQuestionFormData = z.infer<typeof CourseQuestionFormSchema>;

interface CourseQuestionFormProps {
  exerciseId: string;
  lessonId: string;
  sectionId?: string;
  question?: ICourseQuestion | null;
  existingQuestions?: ICourseQuestion[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const CourseQuestionForm = ({
  exerciseId,
  lessonId,
  question = null,
  existingQuestions = [],
  onSuccess,
  onCancel,
  className = "",
}: CourseQuestionFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!question;

  // Helper to get question options with proper typing
  const getQuestionOptions = (
    question: ICourseQuestion | null
  ): ICourseQuestionOption[] => {
    if (
      !question?.question_options ||
      !Array.isArray(question.question_options)
    ) {
      return [
        {
          option_text: "",
          is_correct: false,
          ordering: 1,
          explanation: "",
          point: "0",
        },
        {
          option_text: "",
          is_correct: false,
          ordering: 2,
          explanation: "",
          point: "0",
        },
        {
          option_text: "",
          is_correct: false,
          ordering: 3,
          explanation: "",
          point: "0",
        },
        {
          option_text: "",
          is_correct: false,
          ordering: 4,
          explanation: "",
          point: "0",
        },
      ];
    }

    return question.question_options
      .filter((opt) => opt && !opt.deleted)
      .sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
  };

  // Get next available ordering number
  function getNextOrdering() {
    if (existingQuestions.length === 0) return 1;
    const maxOrdering = Math.max(
      ...existingQuestions.map((q) => q.ordering || 0)
    );
    return maxOrdering + 1;
  }

  // FIXED: Form setup matching interface structure
  const form = useForm<CourseQuestionFormData>({
    resolver: zodResolver(CourseQuestionFormSchema),
    defaultValues: {
      question_text: question?.question_text || "",
      question_type: question?.question_type || "multiple_choice",
      difficulty_level: question?.difficulty_level || "medium",
      explanation: question?.explanation || "",
      correct_answer: question?.correct_answer || "",
      points: question?.points || "1",
      ordering: question?.ordering || getNextOrdering(),
      question_options: getQuestionOptions(question),
      media_url: undefined,
      reading_passage: question?.reading_passage || "",
    },
  });

  const questionType = form.watch("question_type");
  const questionOptions = form.watch("question_options") || [];

  // Enhanced invalidation strategy
  const invalidateQuestionQueries = () => {
    const queriesToInvalidate = [
      { queryKey: ["exercise", lessonId, exerciseId] },
    ];

    queriesToInvalidate.forEach((query) => {
      queryClient.invalidateQueries(query);
    });

    queryClient.refetchQueries({
      queryKey: ["exercise", lessonId, exerciseId],
      exact: true,
    });
  };

  // FIXED: Create question mutation matching interface
  const createQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      console.log("🎯 Creating course question:", data.question_text);

      // Filter out empty options and ensure proper structure
      const validOptions = (data.question_options || [])
        .filter((opt) => opt.option_text && opt.option_text.trim() !== "")
        .map((opt, index) => ({
          option_text: opt.option_text?.trim() || "",
          is_correct: opt.is_correct || false,
          ordering: index + 1,
          explanation: opt.explanation || "",
          point: opt.point || "0",
        }));

      const questionData: ICourseQuestionCreate = {
        question_text: data.question_text,
        question_type: data.question_type,
        difficulty_level: data.difficulty_level,
        explanation: data.explanation || "",
        correct_answer: data.correct_answer || "",
        points: data.points,
        ordering: data.ordering,
        options: validOptions,
        media_url: data.media_url,
      };

      return createCourseQuestion(lessonId, exerciseId, questionData);
    },
    onSuccess: (data) => {
      toast.success("Question created successfully! 🎯");

      invalidateQuestionQueries();
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create question");
    },
  });

  // FIXED: Update question mutation matching interface
  const updateQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      if (!question?.id) throw new Error("Question ID is required");
      // Filter out empty options and ensure proper structure
      const validOptions = (data.question_options || [])
        .filter((opt) => opt.option_text && opt.option_text.trim() !== "")
        .map((opt, index) => ({
          id: opt.id, // Keep existing ID if available
          option_text: opt.option_text?.trim() || "",
          is_correct: opt.is_correct || false,
          ordering: index + 1,
          explanation: opt.explanation || "",
          point: opt.point || "0",
        }));

      const updateData: ICourseQuestionUpdate = {
        question_text: data.question_text,
        question_type: data.question_type,
        points: data.points,
        options: validOptions,
        correct_answer: data.correct_answer,
        ordering: data.ordering,
        media_url: data.media_url,
      };

      return updateCourseQuestion(
        lessonId,
        exerciseId,
        question.id,
        updateData
      );
    },
    onSuccess: (data) => {
      toast.success("Question updated successfully! ✨");

      invalidateQuestionQueries();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update question");
    },
  });

  // Submit handler
  const onSubmit = async (data: CourseQuestionFormData) => {
    try {
      console.log("📝 Form submission:", { isEditing, data });

      if (isEditing) {
        updateQuestionMutation.mutate(data);
      } else {
        createQuestionMutation.mutate(data);
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
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

  // FIXED: Question options handlers with proper ICourseQuestionOption structure
  const addOption = () => {
    const currentOptions = form.getValues("question_options") || [];
    const newOption: ICourseQuestionOption = {
      option_text: "",
      is_correct: false,
      ordering: currentOptions.length + 1,
      explanation: "",
      point: "0",
    };
    form.setValue("question_options", [...currentOptions, newOption]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("question_options") || [];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      // Reorder remaining options
      newOptions.forEach((opt, i) => {
        if (opt) opt.ordering = i + 1;
      });
      form.setValue("question_options", newOptions);
    }
  };

  const updateOption = (
    index: number,
    field: keyof ICourseQuestionOption,
    value: any
  ) => {
    const currentOptions = form.getValues("question_options") || [];
    const newOptions = [...currentOptions];

    if (newOptions[index]) {
      newOptions[index] = { ...newOptions[index], [field]: value };

      // If setting this option as correct for single-choice, unset others
      if (field === "is_correct" && value && questionType === "single_choice") {
        newOptions.forEach((option, i) => {
          if (i !== index && option) {
            option.is_correct = false;
          }
        });
      }

      form.setValue("question_options", newOptions);
    }
  };

  // Handle file uploads
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("media_url", file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const isLoading =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;

  // Initialize options when question type changes
  React.useEffect(() => {
    if (questionType === "true_false") {
      const currentOptions = form.getValues("question_options") || [];
      if (
        currentOptions.length === 0 ||
        currentOptions[0]?.option_text !== "True"
      ) {
        form.setValue("question_options", [
          {
            option_text: "True",
            is_correct: false,
            ordering: 1,
            explanation: "",
            point: "1",
          },
          {
            option_text: "False",
            is_correct: false,
            ordering: 2,
            explanation: "",
            point: "1",
          },
        ]);
      }
    } else if (
      questionType === "multiple_choice" ||
      questionType === "single_choice"
    ) {
      const currentOptions = form.getValues("question_options") || [];
      if (currentOptions.length < 2) {
        form.setValue("question_options", [
          {
            option_text: "",
            is_correct: false,
            ordering: 1,
            explanation: "",
            point: "0",
          },
          {
            option_text: "",
            is_correct: false,
            ordering: 2,
            explanation: "",
            point: "0",
          },
          {
            option_text: "",
            is_correct: false,
            ordering: 3,
            explanation: "",
            point: "0",
          },
          {
            option_text: "",
            is_correct: false,
            ordering: 4,
            explanation: "",
            point: "0",
          },
        ]);
      }
    }
  }, [questionType, form]);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-green-600" />
            <span>{isEditing ? "Edit Question" : "Create New Question"}</span>
            {isEditing && question && (
              <Badge variant="outline" className="ml-2">
                Question {question.ordering}
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
            {/* Question Text */}
            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>Question Text</span>
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question here..."
                      rows={3}
                      {...field}
                      className="focus:ring-2 focus:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="question_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <List className="h-4 w-4" />
                      <span>Type</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Difficulty <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>Points</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="1"
                        {...field}
                        className="focus:ring-2 focus:ring-green-500"
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
                    <FormLabel>Order</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          className="w-16 focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <div className="flex flex-col space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustOrdering("up")}
                          className="h-5 w-5 p-0"
                          disabled={field.value <= 1}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustOrdering("down")}
                          className="h-5 w-5 p-0"
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

            {/* Explanation */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Explanation</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide an explanation for the correct answer..."
                      rows={2}
                      {...field}
                      className="focus:ring-2 focus:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media and Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Upload className="h-4 w-4" />
                      <span>Media File</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,audio/*,video/*"
                        onChange={handleMediaUpload}
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reading Passage */}
            {questionType === "reading" && (
              <FormField
                control={form.control}
                name="reading_passage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>Reading Passage</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the reading passage text..."
                        rows={8}
                        {...field}
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Question Options */}
            {(questionType === "multiple_choice" ||
              questionType === "true_false" ||
              questionType === "droplist") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>Answer Options</span>
                  </h4>
                  {questionType !== "true_false" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Option</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {questionOptions.map((option, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {questionType === "true_false"
                            ? index === 0
                              ? "T"
                              : "F"
                            : String.fromCharCode(65 + index)}
                        </Badge>
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${index + 1} text...`}
                            value={option.option_text || ""}
                            onChange={(e) =>
                              updateOption(index, "option_text", e.target.value)
                            }
                            disabled={questionType === "true_false"}
                            className="focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">
                            Correct:
                          </label>
                          <Switch
                            checked={option.is_correct || false}
                            onCheckedChange={(checked) =>
                              updateOption(index, "is_correct", checked)
                            }
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="text"
                            placeholder="Points"
                            value={option.point || "0"}
                            onChange={(e) =>
                              updateOption(index, "point", e.target.value)
                            }
                            className="text-xs focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        {questionType !== "true_false" &&
                          questionOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                      </div>

                      {/* Option Explanation */}
                      <div className="ml-11">
                        <Input
                          placeholder="Option explanation (optional)..."
                          value={option.explanation || ""}
                          onChange={(e) =>
                            updateOption(index, "explanation", e.target.value)
                          }
                          className="text-xs focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Correct Answer Summary */}
                {questionOptions.some((opt) => opt.is_correct) && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Correct Answer(s):{" "}
                        {questionOptions
                          .filter((opt) => opt.is_correct)
                          .map((opt) => opt.option_text)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* For text input and essay questions */}
            {(questionType === "essay" || questionType === "fill_blank") && (
              <FormField
                control={form.control}
                name="correct_answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>
                        {questionType === "essay"
                          ? "Sample Response/Grading Criteria"
                          : questionType === "fill_blank"
                          ? "Correct Answer(s)"
                          : "Expected Answer"}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          questionType === "essay"
                            ? "Provide sample response or grading criteria..."
                            : questionType === "fill_blank"
                            ? "Enter correct answers separated by commas..."
                            : "Enter the expected answer..."
                        }
                        rows={questionType === "essay" ? 5 : 3}
                        {...field}
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Question"
                    : "Create Question"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CourseQuestionForm;

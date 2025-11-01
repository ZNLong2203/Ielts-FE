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
} from "@/interface/courseQuestion";
import { createCourseQuestion, updateCourseQuestion } from "@/api/courseQuestion";
import { CourseQuestionFormSchema } from "@/validation/courseQuestion";

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
  sectionId,
  question = null,
  existingQuestions = [],
  onSuccess,
  onCancel,
  className = "",
}: CourseQuestionFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!question;

  // Get next available ordering number
  function getNextOrdering() {
    if (existingQuestions.length === 0) return 1;
    const maxOrdering = Math.max(...existingQuestions.map((q) => q.ordering || 0));
    return maxOrdering + 1;
  }

  // UPDATED: Form setup to match interface
  const form = useForm<CourseQuestionFormData>({
    resolver: zodResolver(CourseQuestionFormSchema),
    defaultValues: {
      question_text: question?.question_text || "",
      question_type: question?.question_type || "multiple_choice",
      points: question?.points || "1",
      order_index: question?.ordering || getNextOrdering(),
      options: question?.question_options || ["", "", "", ""],
      correct_answer: question?.correct_answer || "",
      media_url: undefined,
    },
  });

  const questionType = form.watch("question_type");
  const options = form.watch("options") || [];
  const correctAnswer = form.watch("correct_answer");

  // Enhanced invalidation strategy
  const invalidateQuestionQueries = () => {
    
    const queriesToInvalidate = [
      { queryKey: ["exercise", lessonId, exerciseId] },
    ];

    queriesToInvalidate.forEach(query => {
      queryClient.invalidateQueries(query);
    });

    queryClient.refetchQueries({ 
      queryKey: ["exercise", lessonId, exerciseId],
      exact: true 
    });
  };

  // UPDATED: Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      
      const questionData: ICourseQuestionCreate = {
        question_text: data.question_text,
        question_type: data.question_type,
        points: data.points,
        order_index: data.order_index,
        options: data.options?.filter(opt => opt.trim() !== "") || [],
        correct_answer: data.correct_answer || "",
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

  // UPDATED: Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      if (!question?.id) throw new Error("Question ID is required");
            
      const updateData: ICourseQuestionUpdate = {
        question_text: data.question_text,
        question_type: data.question_type,
        points: data.points,
        options: data.options?.filter(opt => opt.trim() !== "") || [],
        correct_answer: data.correct_answer,
        media_url: data.media_url,
      };
      
      return updateCourseQuestion(lessonId, exerciseId, question.id, updateData);
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
    const currentOrdering = form.getValues("order_index");
    const newOrdering = direction === "up" ? currentOrdering - 1 : currentOrdering + 1;

    if (newOrdering >= 1) {
      form.setValue("order_index", newOrdering);
    }
  };

  // UPDATED: Question options handlers
  const addOption = () => {
    const currentOptions = form.getValues("options") || [];
    const newOptions = [...currentOptions, ""];
    form.setValue("options", newOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options") || [];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      form.setValue("options", newOptions);
      
      // Update correct answer if it was referencing the removed option
      const currentCorrectAnswer = form.getValues("correct_answer");
      if (currentCorrectAnswer === currentOptions[index]) {
        form.setValue("correct_answer", "");
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = form.getValues("options") || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    form.setValue("options", newOptions);
  };

  const setCorrectAnswer = (answer: string) => {
    form.setValue("correct_answer", answer);
  };

  // UPDATED: Handle media file upload
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("media_url", file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const isLoading = createQuestionMutation.isPending || updateQuestionMutation.isPending;

  // Question type options
  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "single_choice", label: "Single Choice" },
    { value: "true_false", label: "True/False" },
    { value: "text_input", label: "Text Input" },
    { value: "essay", label: "Essay" },
    { value: "fill_blank", label: "Fill in the Blank" },
  ];

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
            {/* Basic Information */}
            <div className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="question_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <List className="h-4 w-4" />
                        <span>Question Type</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionTypes.map((type) => (
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
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>Points</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          className="focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Order</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            className="w-20 focus:ring-2 focus:ring-green-500"
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

              {/* Media Upload */}
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Upload className="h-4 w-4" />
                      <span>Media File (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,audio/*,video/*"
                        onChange={handleMediaUpload}
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <div className="text-xs text-gray-500">
                      Upload images, audio, or video files to enhance your question
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* UPDATED: Question Options */}
              {(questionType === "multiple_choice" || 
                questionType === "single_choice" || 
                questionType === "true_false") && (
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
                    {questionType === "true_false" ? (
                      // True/False options
                      <>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            T
                          </Badge>
                          <div className="flex-1">
                            <Input value="True" disabled className="bg-gray-50" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Correct:</label>
                            <Button
                              type="button"
                              variant={correctAnswer === "True" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCorrectAnswer("True")}
                              className="h-8"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            F
                          </Badge>
                          <div className="flex-1">
                            <Input value="False" disabled className="bg-gray-50" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Correct:</label>
                            <Button
                              type="button"
                              variant={correctAnswer === "False" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCorrectAnswer("False")}
                              className="h-8"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Multiple choice / Single choice options
                      options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </Badge>
                          <div className="flex-1">
                            <Input
                              placeholder={`Option ${index + 1} text...`}
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Correct:</label>
                            <Button
                              type="button"
                              variant={correctAnswer === option ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCorrectAnswer(option)}
                              className="h-8"
                              disabled={!option.trim()}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {options.length > 2 && (
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
                      ))
                    )}
                  </div>

                  {/* Correct Answer Display */}
                  {correctAnswer && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Correct Answer: {correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* For text input and essay questions */}
              {(questionType === "text_input" || questionType === "essay") && (
                <FormField
                  control={form.control}
                  name="correct_answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>Expected Answer/Sample Response</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the expected answer or sample response..."
                          rows={questionType === "essay" ? 5 : 3}
                          {...field}
                          className="focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {questionType === "essay" 
                          ? "Provide sample response or grading criteria" 
                          : "Enter the exact answer expected from students"}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
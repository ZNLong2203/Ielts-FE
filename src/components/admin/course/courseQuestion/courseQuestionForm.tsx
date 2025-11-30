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
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

// Import reusable components
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import FileUploadField from "@/components/form/file-field";

import {
  ICourseQuestion,
  ICourseQuestionCreate,
  ICourseQuestionUpdate,
  ICourseQuestionOption,
} from "@/interface/courseQuestion";
import { 
  createCourseQuestion, 
  updateCourseQuestion,
  uploadCourseQuestionImage,
  uploadCourseQuestionAudio
} from "@/api/courseQuestion";
import { CourseQuestionFormSchema } from "@/validation/courseQuestion";
import { QUESTION_TYPES } from "@/constants/courseQuestion";

type CourseQuestionFormData = z.infer<typeof CourseQuestionFormSchema>;

interface CourseQuestionFormProps {
  exerciseId: string;
  lessonId: string;
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

  // File upload state
  const [uploadingFiles, setUploadingFiles] = React.useState(false);

  // Helper functions
  const getQuestionOptions = (question: ICourseQuestion | null): ICourseQuestionOption[] => {
    if (!question?.question_options?.length) {
      return Array.from({ length: 4 }, (_, i) => ({
        option_text: "",
        is_correct: false,
        ordering: i + 1,
        explanation: "",
        point: "0",
      }));
    }
    return question.question_options
      .filter((opt) => opt && !opt.deleted)
      .sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
  };

  const getNextOrdering = () => {
    if (!existingQuestions.length) return 1;
    return Math.max(...existingQuestions.map((q) => q.ordering || 0)) + 1;
  };

  // Helper function to determine file type
  const getFileType = (file: File): 'image' | 'audio' | 'unknown' => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    return 'unknown';
  };

  const form = useForm<CourseQuestionFormData>({
    resolver: zodResolver(CourseQuestionFormSchema),
    defaultValues: {
      question_text: question?.question_text || "",
      question_type: question?.question_type || "multiple_choice",
      explanation: question?.explanation || "",
      correct_answer: question?.correct_answer || "",
      points: question?.points || "1",
      ordering: question?.ordering || getNextOrdering(),
      question_options: getQuestionOptions(question),
      media_url: undefined, // Changed from image_file and audio_file
    },
  });

  const questionType = form.watch("question_type");
  const questionOptions = form.watch("question_options") || [];
  const mediaFile = form.watch("media_url" as any) as File | undefined; // Watch media_url instead

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["exercise", lessonId, exerciseId] });
    queryClient.refetchQueries({ queryKey: ["exercise", lessonId, exerciseId] });
  };

  // File upload mutation - automatically detects file type
  const uploadFileMutation = useMutation({
    mutationFn: async ({ questionId, mediaFile }: { 
      questionId: string; 
      mediaFile: File; 
    }) => {
      const fileType = getFileType(mediaFile);
      const formData = new FormData();
      formData.append('file', mediaFile);
      
      if (fileType === 'image') {
        return uploadCourseQuestionImage(lessonId, exerciseId, questionId, formData);
      } else if (fileType === 'audio') {
        return uploadCourseQuestionAudio(lessonId, exerciseId, questionId, formData);
      } else {
        throw new Error('Unsupported file type. Please upload an image or audio file.');
      }
    },
    onSuccess: () => {
      toast.success("Media file uploaded successfully! 📁");
      setUploadingFiles(false);
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload media file: ${error.message}`);
      setUploadingFiles(false);
    },
  });

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      const validOptions = (data.question_options || [])
        .filter((opt) => opt.option_text?.trim())
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
        explanation: data.explanation || "",
        correct_answer: data.correct_answer || "",
        points: data.points,
        ordering: data.ordering,
        options: validOptions,
        media_url: undefined,
      };

      return createCourseQuestion(lessonId, exerciseId, questionData);
    },
    onSuccess: async (data) => {
      toast.success("Question created successfully! 🎯");
      
      // Upload media file if exists
      if (mediaFile) {
        setUploadingFiles(true);
        uploadFileMutation.mutate({ 
          questionId: data.id, 
          mediaFile 
        });
      }
      
      invalidateQueries();
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create question");
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: CourseQuestionFormData) => {
      if (!question?.id) throw new Error("Question ID is required");

      const validOptions = (data.question_options || [])
        .filter((opt) => opt.option_text?.trim())
        .map((opt, index) => ({
          id: opt.id,
          option_text: opt.option_text?.trim() || "",
          is_correct: opt.is_correct || false,
          ordering: index + 1,
          explanation: opt.explanation || "",
          point: opt.point || "0",
        }));

      const updateData: ICourseQuestionUpdate = {
        question_text: data.question_text,
        question_type: data.question_type,
        explanation: data.explanation,
        points: data.points,
        options: validOptions,
        correct_answer: data.correct_answer,
        ordering: data.ordering,
      };

      return updateCourseQuestion(lessonId, exerciseId, question.id, updateData);
    },
    onSuccess: async () => {
      toast.success("Question updated successfully! ✨");
      
      // Upload media file if exists
      if (mediaFile) {
        setUploadingFiles(true);
        uploadFileMutation.mutate({ 
          questionId: question!.id, 
          mediaFile 
        });
      }
      
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update question");
    },
  });

  // Event handlers
  const onSubmit = (data: CourseQuestionFormData) => {
    if (isEditing) {
      updateQuestionMutation.mutate(data);
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const adjustOrdering = (direction: "up" | "down") => {
    const currentOrdering = form.getValues("ordering");
    const newOrdering = direction === "up" ? currentOrdering - 1 : currentOrdering + 1;
    if (newOrdering >= 1) {
      form.setValue("ordering", newOrdering);
    }
  };

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
      newOptions.forEach((opt, i) => {
        if (opt) opt.ordering = i + 1;
      });
      form.setValue("question_options", newOptions);
    }
  };

  const updateOption = (index: number, field: keyof ICourseQuestionOption, value: any) => {
    const currentOptions = form.getValues("question_options") || [];
    const newOptions = [...currentOptions];

    if (newOptions[index]) {
      newOptions[index] = { ...newOptions[index], [field]: value };

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

  const isLoading = createQuestionMutation.isPending || updateQuestionMutation.isPending || uploadingFiles;

  // Initialize options based on question type
  React.useEffect(() => {
    if (questionType === "true_false") {
      form.setValue("question_options", [
        { option_text: "True", is_correct: false, ordering: 1, explanation: "", point: "1" },
        { option_text: "False", is_correct: false, ordering: 2, explanation: "", point: "1" },
      ]);
    } else if (questionType === "multiple_choice") {
      const currentOptions = form.getValues("question_options") || [];
      if (currentOptions.length < 2) {
        form.setValue("question_options", getQuestionOptions(null));
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
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Text */}
            <TextField
              control={form.control}
              name="question_text"
              label={
                <div className="flex items-center space-x-1">
                  <HelpCircle className="h-4 w-4" />
                  <span>Question Text</span>
                  <span className="text-red-500">*</span>
                </div>
              }
              placeholder="Enter your question here..."
              required
            />

            {/* Basic Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SelectField
                control={form.control}
                name="question_type"
                label="Question Type"
                placeholder="Select type"
                options={QUESTION_TYPES}
              />

              <TextField
                control={form.control}
                name="points"
                label={
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Points</span>
                  </div>
                }
                placeholder="1"
                type="text"
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold">Order</label>
                <div className="flex items-center space-x-2">
                  <TextField
                    control={form.control}
                    name="ordering"
                    label=""
                    type="number"
                    min={1}
                    className="w-16"
                  />
                  <div className="flex flex-col space-y-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustOrdering("up")}
                      className="h-5 w-5 p-0"
                      disabled={form.getValues("ordering") <= 1}
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
              </div>
            </div>

            {/* Explanation */}
            <TextField
              control={form.control}
              name="explanation"
              label={
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Explanation</span>
                </div>
              }
              placeholder="Provide an explanation for the correct answer..."
            />

            {/* Media Upload Section - Combined */}
            <FileUploadField
              control={form.control}
              name="media_url"
              label="Media Upload"
              accept="image/*,audio/*"
              maxSize={10}
              placeholder="Upload image or audio file"
              description="Images up to 5MB (JPEG, PNG, GIF, WebP) or Audio files up to 10MB (MP3, WAV, OGG, M4A)"
              currentImage={question?.image_url}
            />

            {/* Show file type indicator */}
            {mediaFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800">
                  <span className="text-sm font-medium">
                    File type detected: {getFileType(mediaFile)} file
                  </span>
                </div>
              </div>
            )}

            {/* Question Options */}
            {(questionType === "multiple_choice" || questionType === "droplist" || questionType === "true_false") && (
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
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {questionType === "true_false" 
                            ? (index === 0 ? "T" : "F")
                            : String.fromCharCode(65 + index)
                          }
                        </Badge>
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${index + 1} text...`}
                            value={option.option_text || ""}
                            onChange={(e) => updateOption(index, "option_text", e.target.value)}
                            disabled={questionType === "true_false"}
                            className="focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Correct:</label>
                          <Switch
                            checked={option.is_correct || false}
                            onCheckedChange={(checked) => updateOption(index, "is_correct", checked)}
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="text"
                            placeholder="Points"
                            value={option.point || "0"}
                            onChange={(e) => updateOption(index, "point", e.target.value)}
                            className="text-xs focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        {questionType !== "true_false" && questionOptions.length > 2 && (
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

                      <div className="ml-11">
                        <Input
                          placeholder="Option explanation (optional)..."
                          value={option.explanation || ""}
                          onChange={(e) => updateOption(index, "explanation", e.target.value)}
                          className="text-xs focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

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

            {/* Fill Blank Answer */}
            {questionType === "fill_blank" && (
              <TextField
                control={form.control}
                name="correct_answer"
                label={
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Correct Answer(s)</span>
                  </div>
                }
                placeholder="Enter correct answers separated by commas..."
              />
            )}

            {/* Upload Status */}
            {uploadingFiles && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Uploading media file...
                  </span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
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
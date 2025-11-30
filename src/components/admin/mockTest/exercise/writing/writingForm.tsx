"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  PenTool,
  FileText,
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import {
  getWritingMockTestExercise,
  createWritingMockTestExercise,
  updateWritingMockTestExercise,
} from "@/api/writing";
import { WritingFormSchema, WritingFormUpdateSchema } from "@/validation/writing";

const TASK_TYPE_OPTIONS = [
  { label: "Task 1", value: "task_1" },
  { label: "Task 2", value: "task_2" },
];

const QUESTION_TYPE_OPTIONS = [
  { label: "Essay", value: "essay" },
  { label: "Letter", value: "letter" },
  { label: "Report", value: "report" },
  { label: "Discursive", value: "discursive" },
];

const WritingForm = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const writingExerciseId = Array.isArray(params.writingId)
    ? params.writingId[0]
    : params.writingId;
  const testSectionId = searchParams?.get("sectionId") ?? undefined;
  const isEditing = !!writingExerciseId;

  const title = isEditing
    ? "Update Writing Exercise"
    : "Create Writing Exercise";
  const description = isEditing
    ? "Update writing exercise information"
    : "Create a comprehensive writing exercise for mock test";

  // Queries
  const {
    data: writingExerciseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["writingExercise", writingExerciseId],
    queryFn: () => getWritingMockTestExercise(writingExerciseId),
    enabled: !!writingExerciseId,
  });

  // Form setup
  const schema = isEditing ? WritingFormUpdateSchema : WritingFormSchema;
  const writingForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_section_id: testSectionId || "",
      instruction: "",
      task_type: "task_1",
      question_type: "essay",
      question_text: "",
      question_image: "",
      question_chart: "",
      word_limit: 150,
      time_limit: 20,
      ordering: 1,
      keywords: [],
      sample_answers: [],
    },
  });

  // Keywords field array
  const {
    fields: keywordFields,
    append: appendKeyword,
    remove: removeKeyword,
  } = useFieldArray({
    control: writingForm.control,
    name: "keywords",
  });

  // Sample answers field array
  const {
    fields: sampleAnswerFields,
    append: appendSampleAnswer,
    remove: removeSampleAnswer,
  } = useFieldArray({
    control: writingForm.control,
    name: "sample_answers",
  });

  // Main mutations
  const createWritingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof WritingFormSchema>) => {
      const payload = {
        ...formData,
        test_section_id: testSectionId || formData.test_section_id,
      };
      return createWritingMockTestExercise(payload);
    },
    onSuccess: () => {
      toast.success("Writing exercise created successfully! ✍️");
      queryClient.invalidateQueries({ queryKey: ["writingExercises"] });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${testSectionId}`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create writing exercise"
      );
    },
  });

  const updateWritingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof WritingFormUpdateSchema>) => {
      const payload = {
        ...formData,
        test_section_id: testSectionId || formData.test_section_id,
      };
      return updateWritingMockTestExercise(writingExerciseId!, payload);
    },
    onSuccess: () => {
      toast.success("Writing exercise updated successfully! ✍️");
      queryClient.invalidateQueries({ queryKey: ["writingExercises"] });
      queryClient.invalidateQueries({
        queryKey: ["writingExercise", writingExerciseId],
      });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${testSectionId}`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update writing exercise"
      );
    },
  });

  // Load existing data
  useEffect(() => {
    if (writingExerciseData && isEditing) {
      const content = writingExerciseData.writing_content || {};
      writingForm.reset({
        title: writingExerciseData.title || "",
        test_section_id: testSectionId || "",
        instruction: writingExerciseData.instruction || "",
        task_type: (content.taskType as "task_1" | "task_2") || writingExerciseData.task_type || "task_1",
        question_type: (content.questionType as "essay" | "letter" | "report" | "discursive") || writingExerciseData.question_type || "essay",
        question_text: content.questionText || writingExerciseData.question_text || "",
        question_image: content.questionImage || writingExerciseData.question_image || "",
        question_chart: content.questionChart || writingExerciseData.question_chart || "",
        word_limit: content.wordLimit || writingExerciseData.word_limit || 150,
        time_limit: writingExerciseData.time_limit || 20,
        ordering: writingExerciseData.ordering || 1,
        keywords: content.keywords || writingExerciseData.keywords || [],
        sample_answers: content.sampleAnswers || writingExerciseData.sample_answers || [],
      });
    }
  }, [writingExerciseData, isEditing, writingForm, testSectionId]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateWritingExerciseMutation.mutateAsync(data);
      } else {
        await createWritingExerciseMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting =
    createWritingExerciseMutation.isPending ||
    updateWritingExerciseMutation.isPending;

  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Writing Exercise Not Found"
        description="The requested writing exercise does not exist or has been deleted."
        dismissible={true}
        onDismiss={() =>
          router.push(
            `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${testSectionId}`
          )
        }
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PenTool className="h-6 w-6 text-purple-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/writing?sectionId=${testSectionId}`
                )
              }
              className="flex items-center space-x-2"
            >
              <span>Back to Exercises</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...writingForm}>
          <form
            onSubmit={writingForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Exercise Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={writingForm.control}
                      name="title"
                      label="Exercise Title"
                      placeholder="Enter exercise title..."
                      required
                    />

                    <TextField
                      control={writingForm.control}
                      name="instruction"
                      label="Instructions"
                      placeholder="Enter exercise instructions..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        control={writingForm.control}
                        name="task_type"
                        label="Task Type"
                        placeholder="Select task type"
                        options={TASK_TYPE_OPTIONS}
                        required
                      />

                      <SelectField
                        control={writingForm.control}
                        name="question_type"
                        label="Question Type"
                        placeholder="Select question type"
                        options={QUESTION_TYPE_OPTIONS}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={writingForm.control}
                        name="time_limit"
                        label="Time Limit (minutes)"
                        type="number"
                        placeholder="20"
                      />

                      <TextField
                        control={writingForm.control}
                        name="ordering"
                        label="Order"
                        type="number"
                        placeholder="1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Question Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PenTool className="h-5 w-5 text-purple-600" />
                      <span>Question Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={writingForm.control}
                      name="question_text"
                      label="Question Text"
                      placeholder="Enter the writing question/prompt..."
                      required
                    />

                    <TextField
                      control={writingForm.control}
                      name="word_limit"
                      label="Word Limit"
                      type="number"
                      placeholder="150"
                    />

                    <TextField
                      control={writingForm.control}
                      name="question_image"
                      label="Question Image URL (optional)"
                      placeholder="https://example.com/image.png"
                    />

                    <TextField
                      control={writingForm.control}
                      name="question_chart"
                      label="Question Chart Data (optional)"
                      placeholder='{"type": "bar", "data": {...}}'
                    />
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Keywords</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {keywordFields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <TextField
                          control={writingForm.control}
                          name={`keywords.${index}`}
                          label=""
                          placeholder="Enter keyword..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyword(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendKeyword("")}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Keyword</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Sample Answers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Sample Answers (optional)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sampleAnswerFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <TextField
                            control={writingForm.control}
                            name={`sample_answers.${index}`}
                            label=""
                            placeholder="Enter sample answer..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSampleAnswer(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendSampleAnswer("")}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Sample Answer</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Exercise Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span>Exercise Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Task Type:</span>
                        <span className="font-medium capitalize">
                          {writingForm.watch("task_type")?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Question Type:</span>
                        <span className="font-medium capitalize">
                          {writingForm.watch("question_type")}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium">
                          {writingForm.watch("time_limit") || 0} min
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Word Limit:</span>
                        <span className="font-medium">
                          {writingForm.watch("word_limit") || "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Keywords:</span>
                        <span className="font-medium">
                          {writingForm.watch("keywords")?.length || 0}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-xs text-gray-500">
                        <p>• Task 1: Describe charts/graphs (150 words)</p>
                        <p>• Task 2: Essay writing (250 words)</p>
                        <p>• Time limit: 20-40 minutes per task</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Validation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        {writingForm.watch("title") ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>Exercise title</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {writingForm.watch("question_text")?.length >= 10 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>Question text (min 10 chars)</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {writingForm.watch("task_type") ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>Task type</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>
                              {isEditing ? "Updating..." : "Creating..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>
                              {isEditing ? "Update Exercise" : "Create Exercise"}
                            </span>
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default WritingForm;

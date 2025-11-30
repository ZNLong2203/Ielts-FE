"use client";
import React, { useEffect } from "react";
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
  Mic,
  FileText,
  ArrowRight,
  Calculator,
  CheckCircle,
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
  getSpeakingMockTestExercise,
  createSpeakingMockTestExercise,
  updateSpeakingMockTestExercise,
  type ISpeakingMockTestExercise,
} from "@/api/speaking";
import { SpeakingFormSchema, SpeakingFormUpdateSchema } from "@/validation/speaking";

const PART_TYPE_OPTIONS = [
  { label: "Part 1 - Introduction & Interview", value: "part_1" },
  { label: "Part 2 - Long Turn", value: "part_2" },
  { label: "Part 3 - Discussion", value: "part_3" },
];

const SpeakingForm = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const speakingExerciseId = Array.isArray(params.speakingId)
    ? params.speakingId[0]
    : params.speakingId;
  const testSectionId = searchParams?.get("sectionId") ?? undefined;
  const isEditing = !!speakingExerciseId;

  const title = isEditing
    ? "Update Speaking Exercise"
    : "Create Speaking Exercise";
  const description = isEditing
    ? "Update speaking exercise information"
    : "Create a comprehensive speaking exercise for mock test";

  // Queries
  const {
    data: speakingExerciseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["speakingExercise", speakingExerciseId],
    queryFn: () => getSpeakingMockTestExercise(speakingExerciseId),
    enabled: !!speakingExerciseId,
  });

  // Form setup
  const schema = isEditing ? SpeakingFormUpdateSchema : SpeakingFormSchema;
  const speakingForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_section_id: testSectionId || "",
      instruction: "",
      part_type: "part_1",
      questions: [
        {
          question_text: "",
          expected_duration: 30,
          instructions: "",
        },
      ],
      time_limit: 5,
      ordering: 1,
      additional_instructions: "",
    },
  });

  // Questions field array
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: speakingForm.control,
    name: "questions",
  });

  // Main mutations
  const createSpeakingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof SpeakingFormSchema>) => {
      const payload = {
        ...formData,
        test_section_id: testSectionId || formData.test_section_id,
      };
      return createSpeakingMockTestExercise(payload);
    },
    onSuccess: () => {
      toast.success("Speaking exercise created successfully! 🎤");
      queryClient.invalidateQueries({ queryKey: ["speakingExercises"] });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${testSectionId}`
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : undefined;
      toast.error(errorMessage || "Failed to create speaking exercise");
    },
  });

  const updateSpeakingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof SpeakingFormUpdateSchema>): Promise<ISpeakingMockTestExercise> => {
      const payload = {
        ...formData,
        test_section_id: testSectionId || formData.test_section_id,
      };
      return updateSpeakingMockTestExercise(speakingExerciseId!, payload);
    },
    onSuccess: () => {
      toast.success("Speaking exercise updated successfully! 🎤");
      queryClient.invalidateQueries({ queryKey: ["speakingExercises"] });
      queryClient.invalidateQueries({
        queryKey: ["speakingExercise", speakingExerciseId],
      });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${testSectionId}`
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : undefined;
      toast.error(errorMessage || "Failed to update speaking exercise");
    },
  });

  // Load existing data
  useEffect(() => {
    if (speakingExerciseData && isEditing) {
      const content = speakingExerciseData.speaking_content || {};
      const questions = content.questions || speakingExerciseData.questions || [];
      
      speakingForm.reset({
        title: speakingExerciseData.title || "",
        test_section_id: testSectionId || "",
        instruction: speakingExerciseData.instruction || "",
        part_type: (content.partType as "part_1" | "part_2" | "part_3") || speakingExerciseData.part_type || "part_1",
        questions: questions.length > 0 ? questions : [
          {
            question_text: "",
            expected_duration: 30,
            instructions: "",
          },
        ],
        time_limit: speakingExerciseData.time_limit || 5,
        ordering: speakingExerciseData.ordering || 1,
        additional_instructions: content.additionalInstructions || speakingExerciseData.additional_instructions || "",
      });
    }
  }, [speakingExerciseData, isEditing, speakingForm, testSectionId]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (isEditing) {
        await updateSpeakingExerciseMutation.mutateAsync(data as z.infer<typeof SpeakingFormUpdateSchema>);
      } else {
        await createSpeakingExerciseMutation.mutateAsync(data as z.infer<typeof SpeakingFormSchema>);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting =
    createSpeakingExerciseMutation.isPending ||
    updateSpeakingExerciseMutation.isPending;

  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Speaking Exercise Not Found"
        description="The requested speaking exercise does not exist or has been deleted."
        dismissible={true}
        onDismiss={() =>
          router.push(
            `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${testSectionId}`
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking?sectionId=${testSectionId}`
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
        <Form {...speakingForm}>
          <form
            onSubmit={speakingForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <span>Exercise Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={speakingForm.control}
                      name="title"
                      label="Exercise Title"
                      placeholder="Enter exercise title..."
                      required
                    />

                    <TextField
                      control={speakingForm.control}
                      name="instruction"
                      label="Instructions"
                      placeholder="Enter exercise instructions..."
                    />

                      <SelectField
                        control={speakingForm.control}
                        name="part_type"
                        label="Part Type"
                        placeholder="Select part type"
                        options={PART_TYPE_OPTIONS}
                      />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={speakingForm.control}
                        name="time_limit"
                        label="Time Limit (minutes)"
                        type="number"
                        placeholder="5"
                      />

                      <TextField
                        control={speakingForm.control}
                        name="ordering"
                        label="Order"
                        type="number"
                        placeholder="1"
                      />
                    </div>

                    <TextField
                      control={speakingForm.control}
                      name="additional_instructions"
                      label="Additional Instructions"
                      placeholder="Enter additional instructions for students..."
                    />
                  </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="h-5 w-5 text-orange-600" />
                      <span>Questions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {questionFields.map((field, index) => (
                      <Card key={field.id} className="border-2">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              Question {index + 1}
                            </h4>
                            {questionFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <TextField
                            control={speakingForm.control}
                            name={`questions.${index}.question_text`}
                            label="Question Text"
                            placeholder="Enter the question..."
                            required
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                              control={speakingForm.control}
                              name={`questions.${index}.expected_duration`}
                              label="Expected Duration (seconds)"
                              type="number"
                              placeholder="30"
                            />

                            <TextField
                              control={speakingForm.control}
                              name={`questions.${index}.instructions`}
                              label="Instructions (optional)"
                              placeholder="e.g., Speak for at least 1 minute"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendQuestion({
                          question_text: "",
                          expected_duration: 30,
                          instructions: "",
                        })
                      }
                      className="flex items-center space-x-2 w-full"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Question</span>
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
                        <span className="text-gray-600">Part Type:</span>
                        <span className="font-medium capitalize">
                          {speakingForm
                            .watch("part_type")
                            ?.replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">
                          {speakingForm.watch("questions")?.length || 0}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium">
                          {speakingForm.watch("time_limit") || 0} min
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-xs text-gray-500">
                        <p>• Part 1: 4-5 minutes (Introduction)</p>
                        <p>• Part 2: 3-4 minutes (Long turn)</p>
                        <p>• Part 3: 4-5 minutes (Discussion)</p>
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
                        {speakingForm.watch("title") ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>Exercise title</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {(speakingForm.watch("questions")?.length || 0) > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>At least 1 question</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {speakingForm.watch("part_type") ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>Part type</span>
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
                        className="w-full flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
                        disabled={
                          isSubmitting ||
                          (speakingForm.watch("questions")?.length || 0) === 0
                        }
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

export default SpeakingForm;

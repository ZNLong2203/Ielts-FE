"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import ImageUploadField from "@/components/form/image-field";
import QuestionTypeSelector from "@/components/admin/questionTypeForm/questionTypeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  FileText,
  HelpCircle,
  CheckCircle,
  Eye,
  Hash,
  Image as ImageIcon,
  Circle,
  Link2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import {
  IQuestionGroupUpdate,
  IMatchingOption,
  IQuestionGroupCreate,
} from "@/interface/questionGroup";
import {
  getQuestionGroup,
  createQuestionGroup,
  updateQuestionGroup,
  uploadQuestionGroupImage
} from "@/api/questionGroup";
// Import types from validation file
import { 
  QuestionGroupSchema,
  QuestionGroupFormData,
} from "@/validation/questionGroup";


// Question type options
const QUESTION_TYPE_OPTIONS = [
  {
    label: "Fill in the Blanks",
    value: "fill_blank",
    icon: <FileText className="h-4 w-4" />,
    description: "Students fill in missing words",
  },
  {
    label: "True/False",
    value: "true_false",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "True or false statements",
  },
  {
    label: "Multiple Choice",
    value: "multiple_choice",
    icon: <Circle className="h-4 w-4" />,
    description: "Choose from multiple options",
  },
  {
    label: "Matching",
    value: "matching",
    icon: <Link2 className="h-4 w-4" />,
    description: "Match items with options",
  },
];

interface QuestionGroupFormProps {
  exerciseId?: string;
  mockTestId?: string;
  sectionId?: string;
  questionGroupId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

const QuestionGroupForm: React.FC<QuestionGroupFormProps> = ({
  exerciseId: propExerciseId,
  mockTestId: propMockTestId,
  sectionId: propSectionId,
  questionGroupId: propQuestionGroupId,
  onSuccess,
  onCancel,
  embedded = false,
}) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Use props if provided, otherwise fall back to URL params
  const mockTestId =
    propMockTestId ||
    (Array.isArray(params.slug) ? params.slug[0] : params.slug);
  const exerciseId =
    propExerciseId ||
    (Array.isArray(params.exerciseId)
      ? params.exerciseId[0]
      : params.exerciseId);
  const questionGroupId =
    propQuestionGroupId ||
    (Array.isArray(params.questionGroupId)
      ? params.questionGroupId[0]
      : params.questionGroupId);
  const sectionId = propSectionId || searchParams?.get("sectionId");

  const isEditing = !!questionGroupId;

  const title = isEditing ? "Update Question Group" : "Create Question Group";
  const description = isEditing
    ? "Update question group settings and configuration"
    : "Create a new question group with specific type and settings";

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] =
    useState<string>("multiple_choice");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Query for existing question group data
  const {
    data: questionGroupData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionGroup", questionGroupId],
    queryFn: () => getQuestionGroup(questionGroupId!),
    enabled: !!questionGroupId,
  });

  // Form setup - Fixed: Always use QuestionGroupFormData type
  const questionGroupForm = useForm<QuestionGroupFormData>({
    resolver: zodResolver(QuestionGroupSchema), // Always use full schema
    defaultValues: {
      exercise_id: exerciseId || "",
      group_title: "",
      group_instruction: "",
      passage_reference: "",
      question_type: "multiple_choice",
      question_range: "",
      correct_answer_count: 1,
      ordering: 1,
      image_url: undefined,
      matching_options: [],
    },
  });

  // Matching options field array
  const {
    fields: matchingFields,
    append: appendMatching,
    remove: removeMatching,
  } = useFieldArray({
    control: questionGroupForm.control,
    name: "matching_options",
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({
      questionGroupId,
      formData,
    }: {
      questionGroupId: string;
      formData: FormData;
    }) => {
      return uploadQuestionGroupImage(questionGroupId, formData);
    },
    onSuccess: (response) => {
      // toast.success("Image uploaded successfully! 🖼️");
      setIsUploadingImage(false);
      if (response?.data?.image_url) {
        questionGroupForm.setValue("image_url", response.data.image_url);
      }
      setImageFile(null);
      if (questionGroupId) {
        refetch();
      }
    },
    onError: (error: any) => {
      console.error("Image upload error:", error);
      setIsUploadingImage(false);
      toast.error(error?.response?.data?.message || "Failed to upload image");
    },
  });

  // Create mutation - Fixed to use response.id for image upload
  const createQuestionGroupMutation = useMutation({
    mutationFn: async (formData: QuestionGroupFormData) => {
      const payload: IQuestionGroupCreate = {
        exercise_id: formData.exercise_id,
        group_title: formData.group_title,
        group_instruction: formData.group_instruction,
        passage_reference: formData.passage_reference || "",
        question_type: formData.question_type,
        question_range: formData.question_range,
        correct_answer_count: formData.correct_answer_count,
        ordering: formData.ordering,
        matching_options: formData.matching_options || [],
      };
      const response = await createQuestionGroup(payload);
      return response;
    },
    onSuccess: async (response) => {
      if (imageFile && response?.id) {
        setIsUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          await uploadImageMutation.mutateAsync({
            questionGroupId: response?.id,
            formData,
          });
          toast.success("Question group created and image uploaded successfully! 📝");
        } catch (error) {
          console.error("Image upload error after create:", error);
          toast.success("Question group created successfully! Image upload failed - you can add it later.");
        }
      } else {
        toast.success("Question group created successfully! 📝");
      }

      queryClient.invalidateQueries({ queryKey: ["questionGroups", exerciseId] });
      
      if (embedded && onSuccess) {
        onSuccess();
      } else {
        router.push(
          `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups?sectionId=${sectionId}`
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create question group"
      );
    },
  });

  // Update mutation - Fixed to handle partial data properly
  const updateQuestionGroupMutation = useMutation({
    mutationFn: async (formData: QuestionGroupFormData) => {
      // Convert to partial update payload
      const payload: IQuestionGroupUpdate = {
        group_title: formData.group_title,
        group_instruction: formData.group_instruction,
        passage_reference: formData.passage_reference,
        question_type: formData.question_type,
        question_range: formData.question_range,
        correct_answer_count: formData.correct_answer_count,
        ordering: formData.ordering,
        matching_options: formData.matching_options || [],
      };
      return updateQuestionGroup(questionGroupId!, payload);
    },
    onSuccess: async () => {
      // Handle image upload after update if needed
      if (imageFile && questionGroupId) {
        setIsUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          await uploadImageMutation.mutateAsync({
            questionGroupId,
            formData,
          });
          toast.success("Question group updated and image uploaded successfully! 📝");
        } catch (error) {
          toast.error("Question group updated but image upload failed. Please try uploading image again.");
        }
      } else {
        toast.success("Question group updated successfully! 📝");
      }

      queryClient.invalidateQueries({ queryKey: ["questionGroups", exerciseId] });
      queryClient.invalidateQueries({
        queryKey: ["questionGroup", questionGroupId],
      });
      
      if (embedded && onSuccess) {
        onSuccess();
      } else {
        router.push(
          `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups?sectionId=${sectionId}`
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update question group"
      );
    },
  });

  const watchedQuestionType = questionGroupForm.watch("question_type");

  useEffect(() => {
    setSelectedQuestionType(watchedQuestionType || "multiple_choice");
  }, [watchedQuestionType]);

  // Load existing data for editing
  useEffect(() => {
    if (questionGroupData && isEditing) {
      // Reset form with complete data structure
      questionGroupForm.reset({
        exercise_id: exerciseId || "",
        group_title: questionGroupData.group_title || "",
        group_instruction: questionGroupData.group_instruction || "",
        passage_reference: questionGroupData.passage_reference || "",
        question_type: questionGroupData.question_type || "multiple_choice",
        question_range: questionGroupData.question_range || "",
        correct_answer_count: questionGroupData.correct_answer_count || 1,
        ordering: questionGroupData.ordering || 1,
        image_url: questionGroupData.image_url || "",
        matching_options: questionGroupData.matching_options || [],
      });

      setSelectedQuestionType(questionGroupData.question_type || "multiple_choice");
    }
  }, [questionGroupData, isEditing, questionGroupForm, exerciseId]);

  // Handle image file selection from ImageUploadField
  const handleImageFileSelected = (file: File) => {
    setImageFile(file);
    toast.success("Image selected successfully!");
  };

  // Matching options management
  const addMatchingOption = () => {
    const newOption: IMatchingOption = {
      option_text: "",
      ordering: matchingFields.length + 1,
    };
    appendMatching(newOption);
  };

  // Initialize matching options when question type changes to matching
  useEffect(() => {
    if (selectedQuestionType === "matching" && matchingFields.length === 0) {
      // Add default matching options
      const defaultOptions = [
        { option_text: "", ordering: 1 },
        { option_text: "", ordering: 2 },
      ];
      defaultOptions.forEach((option) => appendMatching(option));
    }
  }, [selectedQuestionType, matchingFields.length, appendMatching]);

  // Enhanced form submission with proper validation
  const onSubmit = async (data: QuestionGroupFormData) => {
    try {
      console.log("Form submit triggered with data:", data)
      
      if (isEditing) {
        console.log("Calling update mutation");
        await updateQuestionGroupMutation.mutateAsync(data);
      } else {
        console.log("Calling create mutation");
        await createQuestionGroupMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleCancel = () => {
    if (embedded && onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const isSubmitting =
    createQuestionGroupMutation.isPending ||
    updateQuestionGroupMutation.isPending ||
    isUploadingImage;

  // Loading and error states for editing
  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Question Group Not Found"
        description="The requested question group does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => {
          if (embedded && onCancel) {
            onCancel();
          } else {
            router.back();
          }
        }}
        onRetry={() => refetch()}
        onGoBack={() => {
          if (embedded && onCancel) {
            onCancel();
          } else {
            router.back();
          }
        }}
      />
    );
  }

  // Form content
  const formContent = (
    <Form {...questionGroupForm}>
      <form
        onSubmit={questionGroupForm.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TextField
                  control={questionGroupForm.control}
                  name="group_title"
                  label="Group Title"
                  placeholder="Enter question group title..."
                  required
                />

                <SelectField
                  control={questionGroupForm.control}
                  name="question_type"
                  label="Question Type"
                  placeholder="Select question type"
                  options={QUESTION_TYPE_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={questionGroupForm.control}
                    name="question_range"
                    label="Question Range"
                    placeholder="e.g., 1-5, 6-10"
                    required
                  />

                  <TextField
                    control={questionGroupForm.control}
                    name="correct_answer_count"
                    label="Correct Answer Count"
                    type="number"
                    placeholder="1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={questionGroupForm.control}
                    name="ordering"
                    label="Order"
                    type="number"
                    placeholder="1"
                    required
                  />

                  <TextField
                    control={questionGroupForm.control}
                    name="passage_reference"
                    label="Passage Reference"
                    placeholder="e.g., Paragraph A, Lines 1-5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Question Type Specific Fields - Now with proper typing */}
            <QuestionTypeSelector
              selectedQuestionType={selectedQuestionType}
              control={questionGroupForm.control}
              matchingFields={matchingFields}
              addMatchingOption={addMatchingOption}
              removeMatchingOption={removeMatching}
            />

            {/* Image Upload - Using ImageUploadField */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <span>Supporting Image (Optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadField
                  control={questionGroupForm.control}
                  name="image_url"
                  label="Question Group Image"
                  currentImage={questionGroupData?.image_url}
                  onFileSelected={handleImageFileSelected}
                  fallback="QG"
                  maxSize={5}
                  disabled={isSubmitting}
                />
                
                {/* Show upload status */}
                {isUploadingImage && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading image file...</span>
                  </div>
                )}
                
                {/* Show selected file info */}
                {imageFile && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-amber-800">
                      <ImageIcon className="h-4 w-4" />
                      <span>
                        New image selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      {isEditing 
                        ? "Image will be uploaded when you save the form" 
                        : "Image will be uploaded after creating the question group"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-purple-600" />
                  <span>Quick Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {QUESTION_TYPE_OPTIONS.find(
                      (opt) => opt.value === selectedQuestionType
                    )?.label || "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Question Range:</span>
                  <span className="font-medium">
                    {questionGroupForm.watch("question_range") || "Not set"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Correct Answers:</span>
                  <span className="font-medium">
                    {questionGroupForm.watch("correct_answer_count") || 0}
                  </span>
                </div>

                {selectedQuestionType === "matching" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Matching Options:</span>
                    <span className="font-medium">{matchingFields.length}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order:</span>
                  <span className="font-medium">
                    {questionGroupForm.watch("ordering") || 1}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Each question type has specific requirements</p>
                  <p>• Matching questions need at least 2 options</p>
                  <p>• Maximum image size: 5MB</p>
                  {imageFile && (
                    <p className="text-amber-600">
                      • Image will be uploaded on save (
                      {(imageFile.size / 1024).toFixed(1)}KB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isUploadingImage
                            ? "Uploading image..."
                            : isEditing
                            ? "Updating..."
                            : "Creating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>
                          {isEditing
                            ? "Update Question Group"
                            : "Create Question Group"}
                        </span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
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
  );

  // If embedded, don't wrap with page layout
  if (embedded) {
    return formContent;
  }

  // Full page layout for standalone form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{isPreviewMode ? "Edit Mode" : "Preview"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreviewMode ? (
          // Preview Mode
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {questionGroupForm.watch("group_title") ||
                      "Untitled Question Group"}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {
                        QUESTION_TYPE_OPTIONS.find(
                          (opt) => opt.value === selectedQuestionType
                        )?.label
                      }
                    </div>
                    <span className="text-sm text-gray-500">
                      Questions: {questionGroupForm.watch("question_range")}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show current image from form or existing data */}
                  {(questionGroupForm.watch("image_url") || questionGroupData?.image_url) && (
                    <div className="mb-4">
                      <img
                        src={questionGroupForm.watch("image_url") || questionGroupData?.image_url}
                        alt="Question group image"
                        className="max-w-md mx-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Instruction:
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {questionGroupForm.watch("group_instruction") ||
                        "No instruction provided."}
                    </p>
                  </div>

                  {questionGroupForm.watch("passage_reference") && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Passage Reference:
                      </h4>
                      <p className="text-gray-700">
                        {questionGroupForm.watch("passage_reference")}
                      </p>
                    </div>
                  )}

                  {selectedQuestionType === "matching" &&
                    matchingFields.length > 0 && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-3">
                          Matching Options:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {matchingFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="flex items-center space-x-2"
                            >
                              <span className="w-6 h-6 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-sm text-gray-700">
                                {questionGroupForm.watch(
                                  `matching_options.${index}.option_text`
                                ) || `Option ${String.fromCharCode(65 + index)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                    <span>
                      Correct Answers:{" "}
                      {questionGroupForm.watch("correct_answer_count")}
                    </span>
                    <span>Order: {questionGroupForm.watch("ordering")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Edit Mode
          formContent
        )}
      </div>
    </div>
  );
};

export default QuestionGroupForm;
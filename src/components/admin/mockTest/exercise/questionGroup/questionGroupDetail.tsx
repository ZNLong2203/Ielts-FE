"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  HelpCircle,
  FileText,
  CheckCircle,
  Circle,
  Link2,
  Hash,
  Clock,
  Eye,
  Settings,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { getQuestionGroup, deleteQuestionGroup } from "@/api/questionGroup";
import { IQuestionGroup, IMatchingOption } from "@/interface/questionGroup";

// Question type configurations
const QUESTION_TYPE_CONFIG = {
  fill_blank: {
    label: "Fill in the Blanks",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Students fill in missing words or phrases",
  },
  true_false: {
    label: "True/False",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "True or false statements",
  },
  multiple_choice: {
    label: "Multiple Choice",
    icon: <Circle className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Choose from multiple options",
  },
  matching: {
    label: "Matching",
    icon: <Link2 className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Match items with corresponding options",
  },
};

interface QuestionGroupDetailProps {
  exerciseId?: string;
  mockTestId?: string;
  sectionId?: string;
  questionGroupId?: string;
  embedded?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const QuestionGroupDetail: React.FC<QuestionGroupDetailProps> = ({
  exerciseId: propExerciseId,
  mockTestId: propMockTestId,
  sectionId: propSectionId,
  questionGroupId: propQuestionGroupId,
  embedded = false,
  onEdit,
  onDelete,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
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

  const [isDeleting, setIsDeleting] = useState(false);

  // Query for question group data
  const {
    data: questionGroup,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionGroup", questionGroupId],
    queryFn: () => getQuestionGroup(questionGroupId!),
    enabled: !!questionGroupId,
  });

  // Delete mutation
  const deleteQuestionGroupMutation = useMutation({
    mutationFn: () => deleteQuestionGroup(questionGroupId!),
    onSuccess: () => {
      toast.success("Question group deleted successfully! 🗑️");
      queryClient.invalidateQueries({
        queryKey: ["questionGroups", exerciseId],
      });

      if (embedded && onDelete) {
        onDelete();
      } else {
        router.push(
          `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups?sectionId=${sectionId}`
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete question group"
      );
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleEdit = () => {
    if (embedded && onEdit) {
      onEdit();
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/edit?sectionId=${sectionId}`
      );
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteQuestionGroupMutation.mutateAsync();
  };

  const handleBack = () => {
    if (embedded && onClose) {
      onClose();
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups?sectionId=${sectionId}`
      );
    }
  };

  const handleCreateQuestion = () => {
    const params = new URLSearchParams();
    if (sectionId) params.set("sectionId", sectionId);
    params.set("tab", "question");
    params.set("questionGroupId", questionGroupId || "");
    params.set("mode", "create");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleViewQuestions = () => {
    const params = new URLSearchParams();
    if (sectionId) params.set("sectionId", sectionId);
    params.set("tab", "question");
    params.set("questionGroupId", questionGroupId || "");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (isError || !questionGroup) {
    return (
      <Error
        title="Question Group Not Found"
        description="The requested question group does not exist or has been deleted."
        dismissible={true}
        onDismiss={handleBack}
        onRetry={() => refetch()}
        onGoBack={handleBack}
      />
    );
  }

  const questionTypeConfig =
    QUESTION_TYPE_CONFIG[
      questionGroup.question_type as keyof typeof QUESTION_TYPE_CONFIG
    ];

  // Main content component
  const detailContent = (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {questionTypeConfig?.icon || (
                <HelpCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {questionGroup.group_title}
              </h1>
              <p className="text-gray-600">Question Group Details</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`px-3 py-1 ${
                questionTypeConfig?.color || "bg-gray-100 text-gray-800"
              }`}
            >
              <span className="mr-1">{questionTypeConfig?.icon}</span>
              {questionTypeConfig?.label || questionGroup.question_type}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Hash className="h-3 w-3 mr-1" />
              Questions: {questionGroup.question_range}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              {questionGroup.correct_answer_count} correct answers
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Question Type
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {questionTypeConfig?.icon}
                    <span className="text-gray-900">
                      {questionTypeConfig?.label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Question Range
                  </label>
                  <p className="mt-1 text-gray-900">
                    {questionGroup.question_range}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Correct Answer Count
                  </label>
                  <p className="mt-1 text-gray-900">
                    {questionGroup.correct_answer_count}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Order
                  </label>
                  <p className="mt-1 text-gray-900">{questionGroup.ordering}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Instructions
                </label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900 whitespace-pre-line">
                    {questionGroup.group_instruction}
                  </p>
                </div>
              </div>

              {questionGroup.passage_reference && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Passage Reference
                  </label>
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                      <p className="text-amber-800">
                        {questionGroup.passage_reference}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Type Specific Information */}
          {questionGroup.question_type === "matching" &&
            questionGroup.matching_options && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link2 className="h-5 w-5 text-orange-600" />
                    <span>Matching Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questionGroup.matching_options
                      .sort((a: any, b: any) => a.ordering - b.ordering)
                      .map((option: IMatchingOption, index: number) => (
                        <div
                          key={option.ordering || index}
                          className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <div className="w-8 h-8 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-gray-900 font-medium">
                            {option.option_text}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Image Display */}
          {questionGroup.image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <span>Supporting Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={questionGroup.image_url}
                    alt="Question group supporting image"
                    className="max-w-full h-auto rounded-lg border shadow-sm"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Question Type</span>
                <span className="text-sm font-medium">
                  {questionTypeConfig?.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Question Range</span>
                <span className="text-sm font-medium">
                  {questionGroup.question_range}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Correct Answers</span>
                <span className="text-sm font-medium">
                  {questionGroup.correct_answer_count}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order</span>
                <span className="text-sm font-medium">
                  {questionGroup.ordering}
                </span>
              </div>

              {questionGroup.matching_options &&
                questionGroup.matching_options.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Matching Options
                    </span>
                    <span className="text-sm font-medium">
                      {questionGroup.matching_options.length}
                    </span>
                  </div>
                )}

              <Separator />

              <div className="space-y-2 text-xs text-gray-500">
                <p>• {questionTypeConfig?.description}</p>
                {questionGroup.image_url && <p>• Has supporting image</p>}
                {questionGroup.passage_reference && (
                  <p>• Has passage reference</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {questionGroup.id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {questionGroup.id}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {questionGroup.created_at
                    ? new Date(questionGroup.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="font-medium">
                  {questionGroup.updated_at
                    ? new Date(questionGroup.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // If embedded, return content without full page layout
  if (embedded) {
    return detailContent;
  }

  // Full page layout for standalone view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Heading
                title="Question Group Details"
                description="View and manage question group information"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {detailContent}
      </div>
    </div>
  );
};

export default QuestionGroupDetail;

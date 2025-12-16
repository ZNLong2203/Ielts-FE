"use client";
import { deleteQuestion, getQuestion } from "@/api/question";
import { getQuestionGroup } from "@/api/questionGroup";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Error from "@/components/ui/error";
import Loading from "@/components/ui/loading";
import { Separator } from "@/components/ui/separator";
import ROUTES from "@/constants/route";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Circle,
  FileText,
  Hash,
  Info,
  Link2,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

// Question type configurations
const QUESTION_TYPE_CONFIG = {
  fill_blank: {
    label: "Fill in Blanks",
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Students fill in missing words or phrases",
  },
  true_false: {
    label: "True/False/Not Given",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Students choose between true, false, or not given",
  },
  multiple_choice: {
    label: "Multiple Choice",
    icon: Circle,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Students choose from multiple options",
  },
  matching: {
    label: "Matching",
    icon: Link2,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Students match items together",
  },
} as const;

const DIFFICULTY_LEVELS = {
  1: { label: "Easy", color: "bg-green-100 text-green-800", icon: "🟢" },
  2: { label: "Medium", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
  3: { label: "Hard", color: "bg-red-100 text-red-800", icon: "🔴" },
};

interface QuestionDetailProps {
  questionId: string;
  exerciseId: string;
  mockTestId: string;
  sectionId?: string;
  questionGroupId?: string;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  questionId,
  exerciseId,
  mockTestId,
  sectionId,
  questionGroupId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for question details
  const {
    data: question,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId),
    enabled: !!questionId,
  });

  // Query for question group if it exists
  const { data: questionGroup, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["questionGroup", question?.question_group_id],
    queryFn: () => getQuestionGroup(question?.question_group_id!),
    enabled: !!question?.question_group_id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteQuestion(questionId),
    onSuccess: () => {
      toast.success("Question deleted successfully! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      handleBack();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete question"
      );
    },
  });

  // Handlers
  const handleEdit = () => {
    if (questionGroupId) {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/questions/${questionId}/edit?sectionId=${sectionId}`
      );
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/questions/${questionId}/edit?sectionId=${sectionId}`
      );
    }
  };

  const handleBack = () => {
    if (questionGroupId) {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/questions?sectionId=${sectionId}`
      );
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}?sectionId=${sectionId}`
      );
    }
  };

  const handleCopyQuestion = () => {
    if (question) {
      const questionText = `Question: ${question.question_text}${
        question.correct_answer ? `\nAnswer: ${question.correct_answer}` : ""
      }${
        question.options && question.options.length > 0
          ? `\nOptions:\n${question.options
              .map(
                (opt: any, idx: number) =>
                  `${String.fromCharCode(65 + idx)}. ${opt.option_text}${
                    opt.is_correct ? " (Correct)" : ""
                  }`
              )
              .join("\n")}`
          : ""
      }`;

      navigator.clipboard.writeText(questionText);
      toast.success("Question copied to clipboard! 📋");
    }
  };

  // Loading and error states
  if (isLoading || isLoadingGroup) {
    return <Loading />;
  }

  if (isError || !question) {
    return (
      <Error
        title="Question Not Found"
        description="The requested question does not exist or has been deleted."
        dismissible={true}
        onDismiss={handleBack}
        onRetry={() => refetch()}
        onGoBack={handleBack}
      />
    );
  }

  const questionTypeConfig =
    QUESTION_TYPE_CONFIG[
      question.question_type as keyof typeof QUESTION_TYPE_CONFIG
    ];
  const difficultyConfig =
    DIFFICULTY_LEVELS[
      question.difficulty_level as keyof typeof DIFFICULTY_LEVELS
    ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Question Group Info */}
          {questionGroup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span>Question Group</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {questionTypeConfig?.icon ? (
                      <questionTypeConfig.icon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {questionGroup.group_title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge
                        className={`${questionTypeConfig?.color} border text-xs`}
                      >
                        {questionTypeConfig?.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Questions: {questionGroup.question_range}
                      </span>
                    </div>
                    {questionGroup.group_instruction && (
                      <p className="text-sm text-gray-600 mt-2">
                        {questionGroup.group_instruction}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question Content</span>
                <div className="flex items-center space-x-2">
                  <Badge className={questionTypeConfig?.color}>
                    {questionTypeConfig?.label}
                  </Badge>
                  <Badge className={difficultyConfig?.color}>
                    {difficultyConfig?.icon} {difficultyConfig?.label}
                  </Badge>
                  <Badge variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    {question.points} pts
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Media (image only – audio is handled at exercise level for IELTS) */}
              {question.image_url && (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={question.image_url}
                      alt="Question image"
                      className="max-w-full h-auto mx-auto rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Question:
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {question.question_text}
                  </p>
                </div>
              </div>

              {/* Reading Passage */}
              {question.reading_passage && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-600" />
                    Passage Reference:
                  </h4>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {question.reading_passage}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Answer Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Answer Information
                </h3>

                {/* Correct Answer */}
                {question.correct_answer && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct Answer:
                    </h4>
                    <p className="text-green-700 font-medium">
                      {question.correct_answer}
                    </p>
                  </div>
                )}

                {/* Alternate Answers */}
                {question.alternate_answers &&
                  question.alternate_answers.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Alternate Answers:
                      </h4>
                      <ul className="space-y-1">
                        {question.alternate_answers.map(
                          (answer: any, index: number) => (
                            <li
                              key={index}
                              className="text-blue-700 flex items-center"
                            >
                              <Circle className="h-3 w-3 mr-2 fill-current" />
                              {answer}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Multiple Choice Options */}
                {question.options && question.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Answer Options:
                    </h4>
                    <div className="grid gap-3">
                      {question.options
                        .sort(
                          (a: any, b: any) =>
                            (a.ordering || 0) - (b.ordering || 0)
                        )
                        .map((option: any, index: number) => (
                          <Card
                            key={option.id || index}
                            className={`p-4 transition-all ${
                              option.is_correct
                                ? "bg-green-50 border-green-300 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-medium text-sm flex-shrink-0 mt-0.5">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-gray-700 font-medium">
                                    {option.option_text}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    {option.is_correct && (
                                      <Badge className="bg-green-100 text-green-800 border-green-300">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Correct
                                      </Badge>
                                    )}
                                    {option.point && option.point > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {option.point} pts
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {option.explanation && (
                                  <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-200">
                                    {option.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Question Explanation */}
              {question.explanation && (
                <div className="space-y-3">
                  <Separator />
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                    Explanation:
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <span>Question Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Question ID:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {question.id.slice(-8)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type:</span>
                  <Badge className={`${questionTypeConfig?.color} text-xs`}>
                    {questionTypeConfig?.label}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-semibold text-green-600">
                    {question.points}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order:</span>
                  <span className="font-medium">#{question.ordering}</span>
                </div>

                <Separator />

                {question.options && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Options:</span>
                    <span className="font-medium">
                      {question.options.length}
                    </span>
                  </div>
                )}

                {question.alternate_answers &&
                  question.alternate_answers.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Alternates:</span>
                      <span className="font-medium">
                        {question.alternate_answers.length}
                      </span>
                    </div>
                  )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Has Explanation:</span>
                  <span
                    className={
                      question.explanation ? "text-green-600" : "text-gray-400"
                    }
                  >
                    {question.explanation ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-gray-500 space-y-1">
                {question.created_at && (
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {question.updated_at && (
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>
                      {new Date(question.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;

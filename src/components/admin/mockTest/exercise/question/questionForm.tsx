"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Heading from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPE_CONFIG } from "@/constants/question";
import ROUTES from "@/constants/route";
import {
  useCreateQuestionMutation,
  useQuestionGroupsQuery,
  useQuestionQuery,
  useUpdateQuestionMutation,
} from "@/hooks/useQuestionHooks";
import {
  IQuestionCreate,
  IQuestionOption,
  IQuestionUpdate,
} from "@/interface/question";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Circle,
  FileText,
  Info,
  Minus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface QuestionFormProps {
  exerciseId: string;
  mockTestId: string;
  sectionId?: string;
  questionGroupId?: string;
  questionId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  exerciseId,
  mockTestId,
  sectionId,
  questionGroupId,
  questionId,
  onSuccess,
  onCancel,
  embedded = false,
}) => {
  const router = useRouter();

  // Form state - Sử dụng null thay vì empty string
  const [formData, setFormData] = useState({
    exercise_id: exerciseId,
    question_group_id: questionGroupId || null,
    question_type: "",
    question_text: "",
    correct_answer: "",
    alternative_answers: [""],
    points: 1,
    ordering: 1,
    explanation: "",
    options: [] as IQuestionOption[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPopulated = useRef(false);

  // Query for question groups
  const {
    data: questionGroups,
    isLoading,
    isError,
    refetch,
  } = useQuestionGroupsQuery(exerciseId);

  // Query for existing question (edit mode)
  const { data: existingQuestion, isLoading: isLoadingQuestion } =
    useQuestionQuery(questionId ?? null);

  // Create mutation
  const createMutation = useCreateQuestionMutation({
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    },
  });

  // Update mutation
  const updateMutation = useUpdateQuestionMutation(questionId || "", {
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    },
  });

  // Get selected question group
  const selectedQuestionGroup = questionGroups?.groups?.find(
    (group: any) => group.id === formData.question_group_id
  );

  // Populate form data when editing or when question groups are loaded

  useEffect(() => {
    if (isPopulated.current) return;
    if (!questionGroups || (questionId && !existingQuestion)) return;

    let formatData: any = {
      exercise_id: exerciseId,
      question_group_id: "",
      question_type: "",
      question_text: "",
      correct_answer: "",
      alternative_answers: [""],
      points: 1,
      ordering: 1,
      explanation: "",
      options: [],
    };

    if (existingQuestion) {
      const selectedGroup = questionGroups.groups.find(
        (g: any) => g.id === existingQuestion.question_group_id
      );

      formatData = {
        ...formatData,
        question_group_id: selectedGroup?.id || null,
        question_type:
          selectedGroup?.question_type || existingQuestion.question_type || "",
        question_text: existingQuestion.question_text || "",
        correct_answer: existingQuestion.correct_answer || "",
        alternative_answers:
          existingQuestion.alternative_answers?.length > 0
            ? existingQuestion.alternative_answers
            : [""],
        points: existingQuestion.points || 1,
        ordering: existingQuestion.ordering || 1,
        explanation: existingQuestion.explanation || "",
        options:
          existingQuestion.options?.map((option: any, index: number) => ({
            id: option.id,
            option_text: option.option_text || "",
            is_correct: Boolean(option.is_correct),
            ordering: option.ordering || index + 1,
            point: Number(option.point) || 1,
            explanation: option.explanation || "",
            matching_option_id: option.matching_option_id || undefined,
          })) || [],
      };

      if (
        existingQuestion.question_type === QUESTION_TYPE_CONFIG.fill_blank.type
      ) {
        formatData.correct_answer =
          existingQuestion.options[0]?.option_text || "";
        formatData.alternative_answers = existingQuestion.options
          .filter((option: any) => option.ordering !== 0)
          .map((option: any) => option.option_text);
      }

      if (
        existingQuestion.question_type === QUESTION_TYPE_CONFIG.true_false.type
      ) {
        formatData.correct_answer =
          existingQuestion.options[0]?.option_text || "";
      }
    } else if (questionGroupId) {
      const selectedGroup = questionGroups.groups.find(
        (g: any) => g.id === questionGroupId
      );
      if (selectedGroup) {
        formatData.question_group_id = selectedGroup.id;
        formatData.question_type = selectedGroup.question_type;
      }
    }

    // Tạo options mặc định nếu cần cho question type có options
    const questionTypeConfig =
      QUESTION_TYPE_CONFIG[
        formatData.question_type as keyof typeof QUESTION_TYPE_CONFIG
      ];
    if (questionTypeConfig?.hasOptions && formatData.options.length === 0) {
      formatData.options = [
        {
          option_text: "",
          is_correct: false,
          ordering: 1,
          point: 1,
          explanation: "",
        },
      ];
    }

    setFormData(formatData);
    isPopulated.current = true;
  }, [
    existingQuestion,
    questionGroups,
    questionGroupId,
    exerciseId,
    questionId,
  ]);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionGroupChange = (value: string) => {
    // Convert "none" back to null
    const actualValue = value === "none" ? null : value;
    const selectedGroup = actualValue
      ? questionGroups?.groups?.find((g: any) => g.id === actualValue)
      : null;

    setFormData((prev) => ({
      ...prev,
      question_group_id: actualValue,
      // Auto-set question type based on selected group
      question_type: selectedGroup
        ? selectedGroup.question_type
        : prev.question_type,
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          option_text: "",
          is_correct: false,
          ordering: prev.options.length + 1,
          point: 1,
          explanation: "",
        },
      ],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleAlternateAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.alternative_answers];
    newAnswers[index] = value;
    setFormData((prev) => ({
      ...prev,
      alternative_answers: newAnswers,
    }));
  };

  const addAlternateAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      alternative_answers: [...prev.alternative_answers, ""],
    }));
  };

  const removeAlternateAnswer = (index: number) => {
    if (formData.alternative_answers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        alternative_answers: prev.alternative_answers.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.question_text.trim()) {
        toast.error("Question text is required");
        return;
      }

      const questionType =
        QUESTION_TYPE_CONFIG[
          formData.question_type as keyof typeof QUESTION_TYPE_CONFIG
        ];

      if (questionType?.hasOptions && formData.options.length === 0) {
        toast.error("At least one option is required for this question type");
        return;
      }

      if (questionType?.hasCorrectAnswer && !formData.correct_answer.trim()) {
        toast.error("Correct answer is required");
        return;
      }

      if (questionType?.hasOptions) {
        const hasCorrectOption = formData.options.some((opt) => opt.is_correct);
        if (!hasCorrectOption) {
          toast.error("At least one option must be marked as correct");
          return;
        }
      }

      // Process options - preserve existing IDs for updates, remove for new options
      const processedOptions = formData.options.map((option) => {
        const processedOption: any = {
          option_text: option.option_text || "",
          is_correct: Boolean(option.is_correct),
          ordering: Number(option.ordering) || 1,
          point: Number(option.point) || 1,
          explanation: option.explanation || "",
        };

        // Include ID only if it's an existing option (for updates)
        if (
          questionId &&
          option.id &&
          typeof option.id === "string" &&
          option.id.length > 10
        ) {
          processedOption.id = option.id;
        }

        // Include matching_option_id if present
        if (option.matching_option_id) {
          processedOption.matching_option_id = option.matching_option_id;
        }

        return processedOption;
      });

      const submissionData = {
        ...formData,
        exercise_id: exerciseId,
        points: Number(formData.points),
        ordering: Number(formData.ordering),
        alternative_answers: formData.alternative_answers.filter(
          (answer) => answer.trim() !== ""
        ),
        options: processedOptions,
        question_group_id: formData.question_group_id,
      };

      console.log("Final submission data:", submissionData);

      if (questionId) {
        const updateData: IQuestionUpdate = {
          ...submissionData,
          question_group_id: submissionData.question_group_id ?? undefined,
        };
        await updateMutation.mutateAsync({
          id: questionId,
          data: updateData,
        });
      } else {
        // For create, remove any temp IDs
        const createData = {
          ...submissionData,
          options: submissionData.options.map(({ id, ...rest }) => rest),
        };
        await createMutation.mutateAsync(
          createData as unknown as IQuestionCreate
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (questionGroupId) {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/questions?sectionId=${sectionId}`
      );
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}?sectionId=${sectionId}`
      );
    }
  };

  if (isLoadingQuestion || isLoading || !isPopulated.current) {
    return <Loading />;
  }

  const questionTypeConfig =
    QUESTION_TYPE_CONFIG[
      formData.question_type as keyof typeof QUESTION_TYPE_CONFIG
    ];

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50"}>
      {!embedded && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <Heading
                    title={questionId ? "Edit Question" : "Create Question"}
                    description={
                      selectedQuestionGroup
                        ? `${questionId ? "Update" : "Create"} question for "${
                            selectedQuestionGroup.group_title
                          }"`
                        : `${questionId ? "Update" : "Create"} a new question`
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${
          embedded ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selected Question Group Info */}
          {formData.question_group_id && selectedQuestionGroup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span>Selected Question Group</span>
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
                      {selectedQuestionGroup.group_title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge
                        className={`${questionTypeConfig?.color} border text-xs`}
                      >
                        {questionTypeConfig?.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Questions: {selectedQuestionGroup.question_range}
                      </span>
                    </div>
                    {selectedQuestionGroup.group_instruction && (
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedQuestionGroup.group_instruction}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question Group Selection */}
                {!questionGroupId &&
                  questionGroups?.groups &&
                  questionGroups.groups.length > 0 && (
                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="question_group_id">Question Group</Label>
                      <Select
                        value={formData.question_group_id || "none"}
                        onValueChange={handleQuestionGroupChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question group (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center space-x-2">
                              <Circle className="h-4 w-4 text-gray-400" />
                              <span>No Question Group</span>
                            </div>
                          </SelectItem>
                          {questionGroups.groups.map((group: any) => {
                            const groupTypeConfig =
                              QUESTION_TYPE_CONFIG[
                                group.question_type as keyof typeof QUESTION_TYPE_CONFIG
                              ];
                            const GroupIcon = groupTypeConfig?.icon || FileText;

                            return (
                              <SelectItem key={group.id} value={group.id}>
                                <div className="flex items-center space-x-2">
                                  <GroupIcon className="h-4 w-4 text-gray-600" />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {group.group_title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {groupTypeConfig?.label} • Questions:{" "}
                                      {group.question_range}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Select a question group to automatically set the
                        question type and associate with the group.
                      </p>
                    </div>
                  )}

                {/* Question Type */}
                <div className="space-y-2">
                  <Label htmlFor="question_type">Question Type *</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value) =>
                      handleInputChange("question_type", value)
                    }
                    disabled={!!formData.question_group_id} // Disabled if question group is selected
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUESTION_TYPE_CONFIG).map(
                        ([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4 text-gray-600" />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        }
                      )}
                    </SelectContent>
                  </Select>
                  {formData.question_group_id && (
                    <p className="text-sm text-orange-600">
                      Question type is set by the selected question group.
                    </p>
                  )}
                  {questionTypeConfig && (
                    <p className="text-sm text-gray-500">
                      {questionTypeConfig.description}
                    </p>
                  )}
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <Label htmlFor="points">Points *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) =>
                      handleInputChange("points", parseInt(e.target.value) || 1)
                    }
                    placeholder="Points for this question"
                  />
                </div>

                {/* Ordering */}
                <div className="space-y-2">
                  <Label htmlFor="ordering">Order Number *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.ordering}
                    onChange={(e) =>
                      handleInputChange(
                        "ordering",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="Question order"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Textarea
                  value={formData.question_text}
                  onChange={(e) =>
                    handleInputChange("question_text", e.target.value)
                  }
                  placeholder="Enter the question text..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Answer Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Correct Answer (for non-multiple choice) */}
              {questionTypeConfig?.hasCorrectAnswer && (
                <div className="space-y-2">
                  <Label htmlFor="correct_answer">Correct Answer *</Label>
                  <Input
                    value={formData.correct_answer}
                    onChange={(e) =>
                      handleInputChange("correct_answer", e.target.value)
                    }
                    placeholder="Enter the correct answer..."
                  />
                </div>
              )}

              {/* Has selector for True/False/Not Given */}
              {questionTypeConfig?.hasTrueFalseNotGiven && (
                <div className="space-y-2">
                  <Label
                    htmlFor="true_false_not_given"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select Answer *
                  </Label>
                  <Select
                    value={formData.correct_answer}
                    onValueChange={(value) =>
                      handleInputChange("correct_answer", value)
                    }
                  >
                    <SelectTrigger className="w-full h-11 bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                      <SelectValue
                        placeholder="Select an option"
                        className="text-gray-500"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                      <SelectItem
                        value="true"
                        className="hover:bg-green-50 focus:bg-green-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium text-gray-800">
                            True
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="false"
                        className="hover:bg-red-50 focus:bg-red-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="font-medium text-gray-800">
                            False
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="yes"
                        className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium text-gray-800">Yes</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="no"
                        className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span className="font-medium text-gray-800">No</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="not_given"
                        className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <span className="font-medium text-gray-800">
                            Not Given
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the correct answer for this True/False/Not Given
                    question
                  </p>
                </div>
              )}

              {/* Matching Headings / Options – for IELTS style matching tasks */}
              {questionTypeConfig?.hasMatching &&
                selectedQuestionGroup?.matching_options && (
                  <div className="space-y-4">
                    {/* Overview of all matching headings/options in this group */}
                    <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Matching set for this group
                      </p>
                      <p className="text-xs text-blue-800 mb-3">
                        These are the headings / options that candidates will match to
                        in this IELTS-style matching task. You can edit this list in
                        the <span className="font-semibold">Question Group</span>{" "}
                        (Matching options).
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3">
                        {selectedQuestionGroup.matching_options
                          .sort((a: any, b: any) => a.ordering - b.ordering)
                          .map((matchingOption: any, matchIndex: number) => (
                            <div
                              key={matchingOption.id || matchIndex}
                              className="flex items-start space-x-2 text-xs text-blue-900"
                            >
                              <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700 flex items-center justify-center">
                                {String.fromCharCode(65 + matchIndex)}
                              </div>
                              <span className="leading-snug">
                                {matchingOption.option_text}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Selector: which heading does this question map to */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Match with heading / option *
                      </Label>
                      <Select
                        value={formData.options[0]?.matching_option_id || "none"}
                        onValueChange={(value) =>
                          handleOptionChange(0, "matching_option_id", value)
                        }
                      >
                        <SelectTrigger className="w-full h-11 bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                          <SelectValue
                            placeholder="Select matching heading / option"
                            className="text-gray-500"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                          <SelectItem value="none">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              <span className="font-medium text-gray-500 italic">
                                No match
                              </span>
                            </div>
                          </SelectItem>
                          {selectedQuestionGroup.matching_options
                            .sort((a: any, b: any) => a.ordering - b.ordering)
                            .map((matchingOption: any, matchIndex: number) => (
                              <SelectItem
                                key={matchingOption.id}
                                value={matchingOption.id}
                                className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="font-medium text-gray-800">
                                    {String.fromCharCode(65 + matchIndex)}.{" "}
                                    {matchingOption.option_text}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose which heading / option this question should be matched
                        with. Each question should map to exactly one heading.
                      </p>
                    </div>
                  </div>
                )}

              {/* Alternate Answers */}
              {questionTypeConfig?.hasAlternateAnswers && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Alternate Answers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAlternateAnswer}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Alternate
                    </Button>
                  </div>
                  {formData.alternative_answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={answer}
                        onChange={(e) =>
                          handleAlternateAnswerChange(index, e.target.value)
                        }
                        placeholder="Alternate answer..."
                      />
                      {formData.alternative_answers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAlternateAnswer(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Options (for multiple choice and matching) */}
              {questionTypeConfig?.hasOptions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  {/* Debug information */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Debug: Options count: {formData.options.length} | Question
                      Type: {formData.question_type} | Has Options:{" "}
                      {questionTypeConfig?.hasOptions ? "Yes" : "No"}
                    </div>
                  )}

                  {formData.options.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">
                        No options added yet
                      </p>
                      <p className="text-sm">
                        Click "Add Option" to create answer choices
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.options.map((option, index) => {
                        console.log(`Rendering option ${index}:`, option); // Debug log
                        return (
                          <Card
                            key={option.id || `option-${index}`}
                            className="p-4"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Option {index + 1}
                                </Label>
                                {formData.options.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Option Text *</Label>
                                  <Input
                                    value={option.option_text || ""} // Fallback to empty string
                                    onChange={(e) =>
                                      handleOptionChange(
                                        index,
                                        "option_text",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter option text..."
                                  />
                                  {/* Debug display */}
                                  {process.env.NODE_ENV === "development" && (
                                    <div className="text-xs text-gray-400">
                                      Value: "{option.option_text}" | ID:{" "}
                                      {option.id || "none"}
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label>Points</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={option.point || 1} // Fallback to 1
                                    onChange={(e) =>
                                      handleOptionChange(
                                        index,
                                        "point",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    placeholder="Points"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`correct-${index}`}
                                    checked={Boolean(option.is_correct)} // Ensure boolean
                                    onCheckedChange={(checked) =>
                                      handleOptionChange(
                                        index,
                                        "is_correct",
                                        Boolean(checked)
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`correct-${index}`}
                                    className="text-sm"
                                  >
                                    Correct Answer
                                  </Label>
                                </div>
                                {/* Debug display for is_correct */}
                                {process.env.NODE_ENV === "development" && (
                                  <div className="text-xs text-gray-400">
                                    is_correct: {String(option.is_correct)}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>Option Explanation</Label>
                                <Textarea
                                  value={option.explanation || ""} // Fallback to empty string
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      "explanation",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Explain why this option is correct/incorrect..."
                                  className="min-h-[60px]"
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media & Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    handleInputChange("explanation", e.target.value)
                  }
                  placeholder="Provide an explanation for this question (optional)..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.question_text.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {questionId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {questionId ? "Update Question" : "Create Question"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;

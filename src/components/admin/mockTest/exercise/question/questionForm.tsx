"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Save,
  FileText,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  Circle,
  Link2,
  ArrowLeft,
  Trash2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import {
  getQuestion,
  createQuestion,
  updateQuestion,
  uploadQuestionImage,
  uploadQuestionAudio,
} from "@/api/question";
import { getQuestionGroups } from "@/api/questionGroup";
import {
  IQuestionCreate,
  IQuestionUpdate,
  IQuestionOption,
} from "@/interface/question";

// Question type configurations
const QUESTION_TYPE_CONFIG = {
  fill_blank: {
    label: "Fill in Blanks",
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Students fill in missing words or phrases",
    hasOptions: false,
    hasCorrectAnswer: true,
    hasAlternateAnswers: true,
  },
  true_false: {
    label: "True/False",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Students choose between true or false",
    hasOptions: false,
    hasCorrectAnswer: true,
    hasAlternateAnswers: false,
  },
  multiple_choice: {
    label: "Multiple Choice",
    icon: Circle,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Students choose from multiple options",
    hasOptions: true,
    hasCorrectAnswer: false,
    hasAlternateAnswers: false,
  },
  matching: {
    label: "Matching",
    icon: Link2,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Students match items together",
    hasOptions: true,
    hasCorrectAnswer: false,
    hasAlternateAnswers: false,
  },
} as const;

const DIFFICULTY_LEVELS = {
  1: { label: "Easy", color: "bg-green-100 text-green-800", value: 1 },
  2: { label: "Medium", color: "bg-yellow-100 text-yellow-800", value: 2 },
  3: { label: "Hard", color: "bg-red-100 text-red-800", value: 3 },
};

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
  const queryClient = useQueryClient();

  // Form state - Sử dụng null thay vì empty string
  const [formData, setFormData] = useState({
    exercise_id: exerciseId,
    question_group_id: questionGroupId || null,
    question_type: "",
    question_text: "",
    reading_passage: "",
    correct_answer: "",
    alternate_answers: [""],
    points: 1,
    ordering: 1,
    difficulty_level: 2,
    explanation: "",
    options: [] as IQuestionOption[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for question groups
  const {
    data: questionGroups,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionGroups", exerciseId],
    queryFn: () => getQuestionGroups(exerciseId),
    enabled: !!exerciseId,
  });

  console.log("Question Group Data", questionGroups)

  // Query for existing question (edit mode)
  const { data: existingQuestion, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId!),
    enabled: !!questionId,
  });

  // Get selected question group
  const selectedQuestionGroup = questionGroups?.groups?.find(
    (group: any) => group.id === formData.question_group_id
  );

  // Populate form data when editing or when question groups are loaded
  useEffect(() => {
    if (existingQuestion) {
      setFormData({
        exercise_id: exerciseId,
        question_group_id: existingQuestion.question_group_id || null,
        question_type: existingQuestion.question_type || "",
        question_text: existingQuestion.question_text || "",
        reading_passage: existingQuestion.reading_passage || "",
        correct_answer: existingQuestion.correct_answer || "",
        alternate_answers: existingQuestion.alternate_answers || [""],
        points: existingQuestion.points || 1,
        ordering: existingQuestion.ordering || 1,
        difficulty_level: existingQuestion.difficulty_level || 2,
        explanation: existingQuestion.explanation || "",
        options: existingQuestion.options || [],
      });

      if (existingQuestion.image_url) {
        setImagePreview(existingQuestion.image_url);
      }
    } else if (questionGroupId && questionGroups?.groups) {
      // Auto-select question group if passed as prop
      const selectedGroup = questionGroups.groups.find(
        (g: any) => g.id === questionGroupId
      );
      if (selectedGroup) {
        setFormData((prev) => ({
          ...prev,
          question_type: selectedGroup.question_type,
          question_group_id: selectedGroup.id,
        }));
      }
    }
  }, [existingQuestion, questionGroups, questionGroupId, exerciseId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: IQuestionCreate) => createQuestion(data),
    onSuccess: async (response) => {
      const newQuestionId = response.data.id;

      // Upload files if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await uploadQuestionImage(newQuestionId, imageFormData);
      }

      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append("audio", audioFile);
        await uploadQuestionAudio(newQuestionId, audioFormData);
      }

      toast.success("Question created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["questions"] });

      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create question"
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IQuestionUpdate }) =>
      updateQuestion(id, data),
    onSuccess: async () => {
      // Upload files if provided
      if (imageFile && questionId) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await uploadQuestionImage(questionId, imageFormData);
      }

      if (audioFile && questionId) {
        const audioFormData = new FormData();
        audioFormData.append("audio", audioFile);
        await uploadQuestionAudio(questionId, audioFormData);
      }

      toast.success("Question updated successfully! ✅");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });

      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update question"
      );
    },
  });

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
    const newAnswers = [...formData.alternate_answers];
    newAnswers[index] = value;
    setFormData((prev) => ({
      ...prev,
      alternate_answers: newAnswers,
    }));
  };

  const addAlternateAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      alternate_answers: [...prev.alternate_answers, ""],
    }));
  };

  const removeAlternateAnswer = (index: number) => {
    if (formData.alternate_answers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        alternate_answers: prev.alternate_answers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
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

      const submissionData = {
        ...formData,
        exercise_id: exerciseId,
        difficulty_level: Number(formData.difficulty_level),
        points: Number(formData.points),
        ordering: Number(formData.ordering),
        alternate_answers: formData.alternate_answers.filter(
          (answer) => answer.trim() !== ""
        ),
        // Keep null for create; will convert to undefined for update
        question_group_id: formData.question_group_id,
      };

      console.log("Submitting data:", submissionData);

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
        await createMutation.mutateAsync(
          submissionData as unknown as IQuestionCreate
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

  if (isLoadingQuestion || isLoading) {
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

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                  <Select
                    value={String(formData.difficulty_level)}
                    onValueChange={(value) =>
                      handleInputChange("difficulty_level", parseInt(value, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LEVELS).map(
                        ([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  config.color.includes("green")
                                    ? "bg-green-500"
                                    : config.color.includes("yellow")
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
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

              {/* Reading Passage Reference */}
              <div className="space-y-2">
                <Label htmlFor="reading_passage">Passage Reference</Label>
                <Textarea
                  value={formData.reading_passage}
                  onChange={(e) =>
                    handleInputChange("reading_passage", e.target.value)
                  }
                  placeholder="Reference to specific passage or text (optional)..."
                  className="min-h-[80px]"
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
                  {formData.alternate_answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={answer}
                        onChange={(e) =>
                          handleAlternateAnswerChange(index, e.target.value)
                        }
                        placeholder="Alternate answer..."
                      />
                      {formData.alternate_answers.length > 1 && (
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
                  {formData.options.map((option, index) => (
                    <Card key={index} className="p-4">
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
                              value={option.option_text}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  "option_text",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option text..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="0"
                              value={option.point}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  "point",
                                  parseInt(e.target.value) || 0
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
                              checked={option.is_correct}
                              onCheckedChange={(checked) =>
                                handleOptionChange(index, "is_correct", checked)
                              }
                            />
                            <Label
                              htmlFor={`correct-${index}`}
                              className="text-sm"
                            >
                              Correct Answer
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Option Explanation</Label>
                          <Textarea
                            value={option.explanation}
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media & Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Question Image</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {imagePreview && (
                    <div className="relative w-24 h-24">
                      <img
                        src={imagePreview}
                        alt="Question image preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <Label>Question Audio</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {audioFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Volume2 className="h-4 w-4" />
                    <span>{audioFile.name}</span>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Maximum file size: 10MB. Supported formats: MP3, WAV, OGG
                </p>
              </div>

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

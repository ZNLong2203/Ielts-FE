"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  CheckCircle,
  Circle,
  Link2,
  Target,
  Search,
  Volume2,
  Image as ImageIcon,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { getQuestions, deleteQuestion, getQuestion } from "@/api/question";
// import QuestionForm from "./questionForm";
// import QuestionDetail from "./questionDetail";

// Question type configurations - matching with questionGroup config
const QUESTION_TYPE_CONFIG = {
  fill_blank: {
    label: "Fill in Blanks",
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Fill missing words",
  },
  true_false: {
    label: "True/False",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "True or false statements",
  },
  multiple_choice: {
    label: "Multiple Choice",
    icon: Circle,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Choose from options",
  },
  matching: {
    label: "Matching",
    icon: Link2,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Match items together",
  },
} as const;

interface QuestionListProps {
  exerciseId: string;
  mockTestId: string;
  sectionId?: string;
  questionGroupId?: string;
}

type ViewMode = "list" | "create" | "edit" | "detail";

const QuestionList: React.FC<QuestionListProps> = ({
  exerciseId,
  mockTestId,
  sectionId,
  questionGroupId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);

  // Query for questions
  const {
    data: questionsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questions", exerciseId],
    queryFn: () => getQuestions(exerciseId!),
    enabled: !!exerciseId,
  });

  // Delete mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success("Question deleted successfully! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["questions", exerciseId, questionGroupId] });
      // Return to list view after successful delete
      setViewMode("list");
      setSelectedQuestionId(undefined);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete question");
    },
  });

  console.log("Questions Data:", questionsData);

  // Filter questions based on questionGroupId if provided
  const allQuestions = questionsData?.questions || [];
  const filteredByGroup = questionGroupId 
    ? allQuestions.filter((q: any) => q.question_group_id === questionGroupId)
    : allQuestions;

  // Apply search and difficulty filters
  const filteredQuestions = filteredByGroup.filter((question: any) => {
    const matchesSearch = 
      question.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.question_number?.toString().includes(searchTerm) ||
      question.correct_answer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = 
      selectedDifficulty === "all" || 
      question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  // Navigation handlers
  const handleCreate = () => {
    setViewMode("create");
    setSelectedQuestionId(undefined);
  };

  const handleEdit = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setViewMode("edit");
  };

  const handleView = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedQuestionId(undefined);
  };

  const handleFormSuccess = () => {
    setViewMode("list");
    setSelectedQuestionId(undefined);
    refetch(); // Refresh the list
  };

  const handleDelete = async (questionId: string, questionText: string) => {
    if (window.confirm(`Are you sure you want to delete this question?`)) {
      await deleteQuestionMutation.mutateAsync(questionId);
    }
  };

  // Detail view handlers
  const handleDetailEdit = () => {
    setViewMode("edit");
  };

  const handleDetailDelete = () => {
    setViewMode("list");
    setSelectedQuestionId(undefined);
  };

  const handleBack = () => {
    if (questionGroupId) {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups?sectionId=${sectionId}`
      );
    } else {
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}?sectionId=${sectionId}`
      );
    }
  };

  // Get question type config
  const getQuestionTypeConfig = (questionType?: string) => {
    if (!questionType) return null;
    return QUESTION_TYPE_CONFIG[questionType as keyof typeof QUESTION_TYPE_CONFIG];
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Failed to Load Questions"
        description="There was an error loading the questions."
        onRetry={() => refetch()}
      />
    );
  }

  const questionTypeConfig = questionsData
    ? getQuestionTypeConfig(questionsData.exercise_info.exercise_type)
    : null;

  // Render different headers based on current mode
  const renderHeader = () => {
    switch (viewMode) {
      case "create":
        return (
          <div className="bg-white border-b shadow-sm">
            <div className="px-6 py-4">
              <div className="flex flex-row justify-between space-x-4">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Create Question
                  </h3>
                  <p className="text-gray-500 text-md">
                    {questionsData 
                      ? `Create a new question for "${questionsData.exercise_info.title}"`
                      : "Create a new question for this exercise"
                    }
                  </p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    className="flex items-center space-x-2"
                  >
                    <span>Back to List</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="bg-white">
            <div className="px-6 py-4">
              <div className="flex justify-between space-x-4">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Edit Question
                  </h3>
                  <p className="text-gray-500 text-md">
                    Update the question settings and configuration
                  </p>
                </div>

                <div>
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    className="flex items-center space-x-2"
                  >
                    <span>Back to List</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "detail":
        return (
          <div className="bg-white">
            <div className="px-6 py-4">
              <div className="flex justify-between space-x-4">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Question Detail
                  </h3>
                  <p className="text-gray-500 text-md">
                    View and manage question information
                  </p>
                </div>

                <div>
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    className="flex items-center space-x-2"
                  >
                    <span>Back to List</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white">
            <div className="px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {questionsData
                      ? `Questions - ${questionsData.exercise_info.title}`
                      : "Questions"
                    }
                  </h3>
                  <p className="text-gray-500 text-md">
                    {questionsData
                      ? `Manage questions for the "${questionsData.exercise_info.title}" question group`
                      : "Manage questions for this exercise"
                    }
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                
                  {/* Primary Create Button */}
                  <Button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        // return (
        //   <QuestionForm
        //     exerciseId={exerciseId}
        //     mockTestId={mockTestId}
        //     sectionId={sectionId}
        //     questionGroupId={questionGroupId}
        //     questionId={null}
        //     onSuccess={handleFormSuccess}
        //     onCancel={handleBackToList}
        //     embedded={true}
        //   />
        // );

      case "edit":
        // return (
        //   <QuestionForm
        //     exerciseId={exerciseId}
        //     mockTestId={mockTestId}
        //     sectionId={sectionId}
        //     questionGroupId={questionGroupId}
        //     questionId={selectedQuestionId!}
        //     onSuccess={handleFormSuccess}
        //     onCancel={handleBackToList}
        //     embedded={true}
        //   />
        // );

      case "detail":
        // return (
        //   <QuestionDetail
        //     exerciseId={exerciseId}
        //     mockTestId={mockTestId}
        //     sectionId={sectionId}
        //     questionGroupId={questionGroupId}
        //     questionId={selectedQuestionId}
        //     onEdit={handleDetailEdit}
        //     onDelete={handleDetailDelete}
        //     onClose={handleBackToList}
        //     embedded={true}
        //   />
        // );

      default:
        return renderListView();
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Question Group Info */}
      {questionsData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                {questionTypeConfig?.icon ? (
                  <questionTypeConfig.icon className="h-5 w-5 text-gray-600" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {questionsData.exercise_info.title}
                  </h3>
                  <Badge className={`${questionTypeConfig?.color} border text-xs`}>
                    {questionTypeConfig?.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Questions: {questionsData.exercise_info.total_questions}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {questionsData.exercise_info.title}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Correct answers: {questionsData.exercise_info.correct_answer_count}</span>
                  <span>Order: #{questionsData.exercise_info.ordering}</span>
                  {questionsData.exercise_info.passage_reference && (
                    <span>Reference: {questionsData.exercise_info.passage_reference}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions by text, number, or answer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedDifficulty !== "all" 
                  ? "No questions found" 
                  : "No questions yet"
                }
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm || selectedDifficulty !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : questionsData
                  ? `Create your first question for "${questionsData.exercise_info.title}"`
                  : "Create your first question for this exercise"
                }
              </p>
              {(!searchTerm && selectedDifficulty === "all") && (
                <Button
                  onClick={handleCreate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredQuestions
            .sort((a: any, b: any) => (a.question_number || 0) - (b.question_number || 0))
            .map((question: any) => {
            const difficultyConfig = {
              easy: { color: "bg-green-100 text-green-800", label: "Easy" },
              medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
              hard: { color: "bg-red-100 text-red-800", label: "Hard" },
            };
            const difficulty = difficultyConfig[question.difficulty as keyof typeof difficultyConfig] || 
                              difficultyConfig.medium;

            return (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleView(question.id)}
                        >
                          {question.question_text}
                        </CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            Q{question.question_number || '?'}
                          </Badge>
                          <Badge className={`${difficulty.color} text-xs`}>
                            {difficulty.label}
                          </Badge>
                          {question.image_url && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                          {question.audio_url && (
                            <Badge variant="outline" className="text-xs">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Audio
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(question.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(question.id)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Question
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(question.id, question.question_text)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {question.correct_answer && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Correct Answer</label>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {question.correct_answer}
                      </p>
                    </div>
                  )}

                  {question.explanation && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Explanation</label>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>Points: {question.points || 1}</span>
                      </div>
                      {question.time_limit && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{question.time_limit}s</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(question.id)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question.id)}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Add Button for Long Lists */}
      {filteredQuestions.length > 6 && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={handleCreate}
            size="lg"
            className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default QuestionList;
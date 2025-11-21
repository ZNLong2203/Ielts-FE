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
  Hash,
  AlertCircle,
  Search,
  Filter,
  SortAsc,
  Users,
  Clock,
  Award,
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
import { IQuestionGroup } from "@/interface/questionGroup";

// Mock API functions - replace with actual API calls
const getQuestionGroups = async (exerciseId: string): Promise<IQuestionGroup[]> => {
  // Mock data
  return [
    {
      id: "1",
      exercise_id: exerciseId,
      group_title: "Multiple Choice Questions",
      group_instructions: "Choose the best answer for each question based on what you hear.",
      passage_reference: "Audio Section A",
      question_type: "multiple_choice",
      question_range: "1-5",
      correct_answer_count: 5,
      ordering: 1,
      matching_options: [],
    },
    {
      id: "2",
      exercise_id: exerciseId,
      group_title: "True/False Statements",
      group_instructions: "Mark each statement as True or False according to the audio.",
      passage_reference: "Audio Section B",
      question_type: "true_false",
      question_range: "6-10",
      correct_answer_count: 5,
      ordering: 2,
      matching_options: [],
    },
    {
      id: "3",
      exercise_id: exerciseId,
      group_title: "Matching Exercise",
      group_instructions: "Match each speaker with their profession.",
      passage_reference: "Audio Section C",
      question_type: "matching",
      question_range: "11-15",
      correct_answer_count: 5,
      ordering: 3,
      matching_options: [
        { option_text: "Doctor", ordering: 1 },
        { option_text: "Teacher", ordering: 2 },
        { option_text: "Engineer", ordering: 3 },
        { option_text: "Artist", ordering: 4 },
        { option_text: "Chef", ordering: 5 },
      ],
    },
  ];
};

const deleteQuestionGroup = async (questionGroupId: string): Promise<void> => {
  // Mock delete
  console.log("Deleting question group:", questionGroupId);
};

// Question type configurations
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

interface QuestionGroupListProps {
  exerciseId: string;
  mockTestId: string;
  sectionId?: string;
}

const QuestionGroupList: React.FC<QuestionGroupListProps> = ({
  exerciseId,
  mockTestId,
  sectionId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Query for question groups
  const {
    data: questionGroups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionGroups", exerciseId],
    queryFn: () => getQuestionGroups(exerciseId),
    enabled: !!exerciseId,
  });

  // Delete mutation
  const deleteQuestionGroupMutation = useMutation({
    mutationFn: deleteQuestionGroup,
    onSuccess: () => {
      toast.success("Question group deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["questionGroups", exerciseId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete question group");
    },
  });

  // Filter question groups
  const filteredQuestionGroups = questionGroups.filter((group) => {
    const matchesSearch = group.group_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      group.question_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || group.question_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Navigation handlers
  const handleCreate = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/create?sectionId=${sectionId}`
    );
  };

  const handleEdit = (questionGroupId: string) => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/edit?sectionId=${sectionId}`
    );
  };

  const handleViewQuestions = (questionGroupId: string) => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/question-groups/${questionGroupId}/questions?sectionId=${sectionId}`
    );
  };

  const handleDelete = async (questionGroupId: string, groupTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${groupTitle}"?`)) {
      await deleteQuestionGroupMutation.mutateAsync(questionGroupId);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Failed to Load Question Groups"
        description="There was an error loading the question groups."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Question Groups</h3>
          <p className="text-sm text-gray-600">
            Manage question groups for this listening exercise
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question Group</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search question groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {Object.entries(QUESTION_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Groups List */}
      {filteredQuestionGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedType !== "all" 
                  ? "No question groups found" 
                  : "No question groups yet"
                }
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first question group to start adding questions to this exercise"
                }
              </p>
              {(!searchTerm && selectedType === "all") && (
                <Button
                  onClick={handleCreate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question Group
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredQuestionGroups.map((group) => {
            const config = QUESTION_TYPE_CONFIG[group.question_type as keyof typeof QUESTION_TYPE_CONFIG];
            const Icon = config?.icon || FileText;

            return (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {group.group_title}
                        </CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge className={`${config?.color} border text-xs`}>
                            {config?.label}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Questions: {group.question_range}
                          </span>
                          <span className="text-sm text-gray-600">
                            Order: #{group.ordering}
                          </span>
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
                        <DropdownMenuItem onClick={() => handleViewQuestions(group.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(group.id)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(group.id, group.group_title)}
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
                  <div>
                    <label className="text-sm font-medium text-gray-600">Instructions</label>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {group.group_instructions}
                    </p>
                  </div>

                  {group.passage_reference && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Passage Reference</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {group.passage_reference}
                      </p>
                    </div>
                  )}

                  {group.question_type === "matching" && group.matching_options && group.matching_options.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Matching Options ({group.matching_options.length})
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {group.matching_options.slice(0, 3).map((option, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {option.option_text}
                          </Badge>
                        ))}
                        {group.matching_options.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.matching_options.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{group.correct_answer_count} correct answers</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQuestions(group.id)}
                        className="flex items-center space-x-1"
                      >
                        <Users className="h-3 w-3" />
                        <span>Questions</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(group.id)}
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

      {/* Summary Stats */}
      {filteredQuestionGroups.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredQuestionGroups.length}
                </div>
                <div className="text-sm text-gray-600">Question Groups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredQuestionGroups.reduce((sum, group) => sum + group.correct_answer_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredQuestionGroups.map(group => group.question_type)).size}
                </div>
                <div className="text-sm text-gray-600">Question Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredQuestionGroups.filter(group => group.question_type === "matching").length}
                </div>
                <div className="text-sm text-gray-600">Matching Groups</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionGroupList;
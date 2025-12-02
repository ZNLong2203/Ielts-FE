"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
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
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// ✅ Import AlertDialog components
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
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { getQuestionGroups, deleteQuestionGroup } from "@/api/questionGroup";
import QuestionGroupForm from "./questionGroupForm";
import QuestionGroupDetail from "./questionGroupDetail";

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

type ViewMode = "list" | "create" | "edit" | "detail";

const QuestionGroupList: React.FC<QuestionGroupListProps> = ({
  exerciseId,
  mockTestId,
  sectionId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined
  );

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

  console.log("Question Groups:", questionGroups);

  // Delete mutation
  const deleteQuestionGroupMutation = useMutation({
    mutationFn: deleteQuestionGroup,
    onSuccess: () => {
      toast.success("Question group deleted successfully! 🗑️");
      queryClient.invalidateQueries({
        queryKey: ["questionGroups", exerciseId],
      });
      // Return to list view after successful delete
      setViewMode("list");
      setSelectedGroupId(undefined);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete question group"
      );
    },
  });

  // Filter question groups
  const filteredQuestionGroups =
    questionGroups?.groups?.filter((group: any) => {
      const matchesSearch =
        group.group_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.question_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "all" || group.question_type === selectedType;

      return matchesSearch && matchesType;
    }) || [];

  // Navigation handlers
  const handleCreate = () => {
    setViewMode("create");
    setSelectedGroupId(undefined);
  };

  const handleEdit = (questionGroupId: string) => {
    setSelectedGroupId(questionGroupId);
    setViewMode("edit");
  };

  const handleView = (questionGroupId: string) => {
    setSelectedGroupId(questionGroupId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedGroupId(undefined);
  };

  const handleFormSuccess = () => {
    setViewMode("list");
    setSelectedGroupId(undefined);
    refetch(); // Refresh the list
  };

  const handleViewQuestions = (questionGroupId: string) => {
    const params = new URLSearchParams();
    if (sectionId) params.set("sectionId", sectionId);
    params.set("tab", "questions");
    params.set("questionGroupId", questionGroupId);

    router.push(`${pathname}?${params.toString()}`);
  };

  // ✅ Updated delete handler using AlertDialog
  const handleDelete = async (questionGroupId: string) => {
    try {
      await deleteQuestionGroupMutation.mutateAsync(questionGroupId);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Detail view handlers
  const handleDetailEdit = () => {
    setViewMode("edit");
  };

  const handleDetailDelete = () => {
    setViewMode("list");
    setSelectedGroupId(undefined);
  };

  const handleBack = () => {
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}?sectionId=${sectionId}`
    );
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

  // Render different headers based on current mode
  const renderHeader = () => {
    switch (viewMode) {
      case "create":
        return (
          <div className="bg-white">
            <div className="px-6 py-4">
              <div className="flex flex-row justify-between space-x-4">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Create Question Group
                  </h3>
                  <p className="text-gray-500 text-md">
                    Create a new question group with specific type and settings
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
                    Edit Question Group
                  </h3>
                  <p className="text-gray-500 text-md">
                    Update the question group settings and configuration
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
                    Question Group Detail
                  </h3>
                  <p className="text-gray-500 text-md">
                    View and manage question group information
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
                    Question Group
                  </h3>
                  <p className="text-gray-500 text-md">
                    {`Manage question groups for the "${questionGroups?.exercise_info.title}" exercise`}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Primary Create Button */}
                  <Button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question Group</span>
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
        return (
          <QuestionGroupForm
            exerciseId={exerciseId}
            mockTestId={mockTestId}
            sectionId={sectionId}
            questionGroupId={null}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
            embedded={true}
          />
        );

      case "edit":
        return (
          <QuestionGroupForm
            exerciseId={exerciseId}
            mockTestId={mockTestId}
            sectionId={sectionId}
            questionGroupId={selectedGroupId!}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
            embedded={true}
          />
        );

      case "detail":
        return (
          <QuestionGroupDetail
            exerciseId={exerciseId}
            mockTestId={mockTestId}
            sectionId={sectionId}
            questionGroupId={selectedGroupId}
            onEdit={handleDetailEdit}
            onDelete={handleDetailDelete}
            onClose={handleBackToList}
            embedded={true}
          />
        );

      default:
        return renderListView();
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
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
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(QUESTION_TYPE_CONFIG).map(([key, config]) => {
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                  : "No question groups yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first question group to start adding questions to this exercise"}
              </p>
              {!searchTerm && selectedType === "all" && (
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
          {filteredQuestionGroups.map((group: any) => {
            const config =
              QUESTION_TYPE_CONFIG[
                group.question_type as keyof typeof QUESTION_TYPE_CONFIG
              ];
            const Icon = config?.icon || FileText;

            return (
              <Card
                key={group.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleView(group.id)}
                        >
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
                        <DropdownMenuItem onClick={() => handleView(group.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewQuestions(group.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(group.id)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        {/* ✅ Replace DropdownMenuItem with AlertDialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question Group?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete "{group.group_title}"? 
                                This will also delete all associated questions. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteQuestionGroupMutation.isPending}
                              >
                                {deleteQuestionGroupMutation.isPending ? "Deleting..." : "Delete Group"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Instructions
                    </label>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {group.group_instruction}
                    </p>
                  </div>

                  {group.passage_reference && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Passage Reference
                      </label>
                      <p className="text-sm text-gray-700 mt-1">
                        {group.passage_reference}
                      </p>
                    </div>
                  )}

                  {group.question_type === "matching" &&
                    group.matching_options &&
                    group.matching_options.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Matching Options ({group.matching_options.length})
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.matching_options
                            .slice(0, 3)
                            .map((option: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
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
                        <span>
                          {group.correct_answer_count} correct answers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(group.id)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
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

      {/* Floating Add Button for Long Lists */}
      {filteredQuestionGroups.length > 6 && (
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

export default QuestionGroupList;
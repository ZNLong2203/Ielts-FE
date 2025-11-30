"use client";
import React, { useState, useMemo } from "react";
import {
  getSpeakingExercisesBySection,
  deleteSpeakingMockTestExercise,
} from "@/api/speaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  Mic,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

type SortByType = "title" | "part_type" | "ordering" | "created_at";

const SpeakingList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const sectionId = searchParams.get("sectionId");
  const mockTestId = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>("ordering");
  const [filterPartType, setFilterPartType] = useState<string>("all");

  // Queries
  const {
    data: speakingExercises,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["speakingExercises", sectionId],
    queryFn: () => {
      return getSpeakingExercisesBySection(sectionId as string);
    },
    enabled: !!sectionId,
  });

  // Delete mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: deleteSpeakingMockTestExercise,
    onSuccess: () => {
      toast.success("Speaking exercise deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["speakingExercises", sectionId],
      });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete exercise"
      );
    },
  });

  // Event handlers
  const handleCreateNew = () => {
    if (!mockTestId || !sectionId) {
      toast.error("Missing required parameters");
      return;
    }
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking/create?sectionId=${sectionId}`
    );
  };

  const handleEdit = (exerciseId: string) => {
    if (!mockTestId || !sectionId) {
      toast.error("Missing required parameters");
      return;
    }
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking/${exerciseId}/update?sectionId=${sectionId}`
    );
  };

  const handleView = (exerciseId: string) => {
    if (!mockTestId || !sectionId) {
      toast.error("Missing required parameters");
      return;
    }
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/speaking/${exerciseId}?sectionId=${sectionId}`
    );
  };

  const handleDelete = async (exerciseId: string) => {
    if (!exerciseId) {
      toast.error("Exercise ID is required");
      return;
    }
    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredAndSortedExercises = useMemo(() => {
    if (
      !speakingExercises?.exercises ||
      !Array.isArray(speakingExercises.exercises)
    ) {
      return [];
    }

    let filtered = speakingExercises.exercises.filter((exercise: any) => {
      if (!exercise) return false;

      const title = exercise.title || "";

      const matchesSearch =
        searchTerm === "" ||
        title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPartType =
        filterPartType === "all" ||
        exercise.speaking_content?.partType === filterPartType ||
        exercise.part_type === filterPartType;

      return matchesSearch && matchesPartType;
    });

    // Sort exercises
    filtered.sort((a: any, b: any) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "part_type":
          const aPart = a.speaking_content?.partType || a.part_type || "";
          const bPart = b.speaking_content?.partType || b.part_type || "";
          return aPart.localeCompare(bPart);
        case "ordering":
          return (a.ordering || 0) - (b.ordering || 0);
        case "created_at":
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        default:
          return (a.ordering || 0) - (b.ordering || 0);
      }
    });

    return filtered;
  }, [speakingExercises, searchTerm, filterPartType, sortBy]);

  const stats = useMemo(() => {
    const exercises = speakingExercises?.exercises || [];
    const totalExercises = exercises.length;

    if (totalExercises === 0) {
      return {
        totalExercises: 0,
        avgTimeLimit: 0,
        totalQuestions: 0,
      };
    }

    const avgTimeLimit = Math.round(
      exercises.reduce(
        (acc: number, ex: any) => acc + Number(ex.time_limit || 0),
        0
      ) / totalExercises
    );

    const totalQuestions = exercises.reduce(
      (acc: number, ex: any) =>
        acc +
        (ex.speaking_content?.questions?.length ||
          ex.questions?.length ||
          0),
      0
    );

    return {
      totalExercises,
      avgTimeLimit,
      totalQuestions,
    };
  }, [speakingExercises]);

  if (isLoading) {
    return <Loading />;
  }

  if (!sectionId) {
    return (
      <Error
        title="Section ID Required"
        description="Section ID is required to load speaking exercises."
        onGoBack={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
      />
    );
  }

  if (isError) {
    return (
      <Error
        title="Failed to Load Speaking Exercises"
        description="Unable to fetch speaking exercises. Please try again."
        onRetry={() => refetch()}
        onGoBack={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Speaking Exercises
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">
                    {speakingExercises?.test_section?.mock_test?.title ||
                      "Mock Test"}
                  </span>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">
                    {speakingExercises?.test_section?.section_name ||
                      "Speaking Section"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
              disabled={!sectionId || !mockTestId}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Exercise</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search exercises by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filterPartType}
                    onValueChange={(value) => setFilterPartType(value)}
                  >
                    <SelectTrigger className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <SelectValue placeholder="All Part Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Part Types</SelectItem>
                      <SelectItem value="part_1">Part 1</SelectItem>
                      <SelectItem value="part_2">Part 2</SelectItem>
                      <SelectItem value="part_3">Part 3</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortByType)}
                  >
                    <SelectTrigger className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordering">Sort by Order</SelectItem>
                      <SelectItem value="title">Sort by Title</SelectItem>
                      <SelectItem value="part_type">Sort by Part Type</SelectItem>
                      <SelectItem value="created_at">Sort by Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Mic className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Exercises
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalExercises}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Time Limit
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgTimeLimit} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">?</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {filteredAndSortedExercises.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Mic className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterPartType !== "all"
                      ? "No exercises found"
                      : "No speaking exercises yet"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {searchTerm || filterPartType !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "Create your first speaking exercise to get started."}
                  </p>
                  {!(searchTerm || filterPartType !== "all") && (
                    <Button
                      onClick={handleCreateNew}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!sectionId || !mockTestId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Exercise
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedExercises.map((exercise: any) => {
              const partType = exercise.speaking_content?.partType || exercise.part_type || "part_1";
              const questions = exercise.speaking_content?.questions || exercise.questions || [];
              const partTypeLabel = partType === "part_1" ? "Part 1" : partType === "part_2" ? "Part 2" : "Part 3";

              return (
                <Card
                  key={exercise.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                              {exercise.ordering || 0}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {exercise.title || "Untitled Exercise"}
                              </h3>
                              <Badge className="bg-orange-100 text-orange-800 border-0">
                                {partTypeLabel}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 border-0">
                                {questions.length} {questions.length === 1 ? "Question" : "Questions"}
                              </Badge>
                            </div>

                            {exercise.instruction && (
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {exercise.instruction}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{exercise.time_limit || 0} minutes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(exercise.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(exercise.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Speaking Exercise
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "
                                {exercise.title || "this exercise"}"? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(exercise.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteExerciseMutation.isPending}
                              >
                                {deleteExerciseMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredAndSortedExercises.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedExercises.length} of{" "}
              {stats.totalExercises} exercises
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingList;


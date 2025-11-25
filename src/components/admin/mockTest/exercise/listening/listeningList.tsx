"use client";
import React, { useState, useMemo } from "react";
import {
  getListeningExercisesBySection,
  deleteListeningExercise,
} from "@/api/listening";
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
  Headphones,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Target,
  Eye,
  Search,
  CheckCircle,
} from "lucide-react";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

const DIFFICULTY_LABELS = {
  "1": { label: "Beginner", color: "bg-green-100 text-green-800", stars: 1 },
  "2": { label: "Elementary", color: "bg-blue-100 text-blue-800", stars: 2 },
  "3": {
    label: "Intermediate",
    color: "bg-yellow-100 text-yellow-800",
    stars: 3,
  },
  "4": {
    label: "Upper Intermediate",
    color: "bg-orange-100 text-orange-800",
    stars: 4,
  },
  "5": { label: "Advanced", color: "bg-red-100 text-red-800", stars: 5 },
} as const;

type SortByType = "title" | "difficulty" | "ordering" | "created_at";

const ListeningList = () => {
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
  const [filterDifficulty, setFilterDifficulty] = useState<string>("0");

  // Queries
  const {
    data: listeningExercises,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listeningExercises", sectionId],
    queryFn: () => {
      return getListeningExercisesBySection(sectionId as string);
    },
    enabled: !!sectionId,
  });

  // Delete mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: deleteListeningExercise,
    onSuccess: () => {
      toast.success("Listening exercise deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["listeningExercises", sectionId],
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
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening/create?sectionId=${sectionId}`
    );
  };

  const handleEdit = (exerciseId: string) => {
    if (!mockTestId || !sectionId) {
      toast.error("Missing required parameters");
      return;
    }
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening/${exerciseId}/update?sectionId=${sectionId}`
    );
  };

  const handleView = (exerciseId: string) => {
    if (!mockTestId || !sectionId) {
      toast.error("Missing required parameters");
      return;
    }
    router.push(
      `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/listening/${exerciseId}?sectionId=${sectionId}`
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

 // Sửa filter logic
const filteredAndSortedExercises = useMemo(() => {
  if (
    !listeningExercises?.exercises ||
    !Array.isArray(listeningExercises.exercises)
  ) {
    return [];
  }

  let filtered = listeningExercises.exercises.filter((exercise: any) => {
    if (!exercise) return false;

    const title = exercise.title || "";
    const passageTitle = exercise.reading_passage?.title || "";

    const matchesSearch =
      searchTerm === "" ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passageTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Sửa logic này
    const matchesDifficulty =
      filterDifficulty === "0" || // "0" means "All Difficulties"
      exercise.reading_passage?.difficulty_level === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Sort exercises
  filtered.sort((a: any, b: any) => {
    if (!a || !b) return 0;

    switch (sortBy) {
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "difficulty":
        const aDiff =
          a.reading_passage?.difficulty_level;
        const bDiff =
          b.reading_passage?.difficulty_level;
        return aDiff.localeCompare(bDiff);
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
}, [listeningExercises, searchTerm, filterDifficulty, sortBy]);
  // Computed stats
  const stats = useMemo(() => {
    const exercises = listeningExercises?.exercises || [];
    const totalExercises = exercises.length;

    if (totalExercises === 0) {
      return {
        totalExercises: 0,
        avgTimeLimit: 0,
        avgPassingScore: 0,
        totalDuration: 0,
      };
    }

    const avgTimeLimit = Math.round(
      exercises.reduce(
        (acc: number, ex: any) => acc + Number(ex.time_limit || 0),
        0
      ) / totalExercises
    );

    const avgPassingScore = Math.round(
      exercises.reduce(
        (acc: number, ex: any) => acc + Number(ex.passing_score || 0),
        0
      ) / totalExercises
    );

    return {
      totalExercises,
      avgTimeLimit,
      avgPassingScore,
    };
  }, [listeningExercises]);

  console.log("Listening Exercises Data:", listeningExercises);
  console.log("Filtered Exercises:", filteredAndSortedExercises);

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // No section ID
  if (!sectionId) {
    return (
      <Error
        title="Section ID Required"
        description="Section ID is required to load listening exercises."
        onGoBack={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
      />
    );
  }

  // Error state
  if (isError) {
    return (
      <Error
        title="Failed to Load Listening Exercises"
        description="Unable to fetch listening exercises. Please try again."
        onRetry={() => refetch()}
        onGoBack={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Headphones className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Listening Exercises
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="hover:text-purple-600 cursor-pointer transition-colors">
                    {listeningExercises?.test_section?.mock_test?.title ||
                      "Mock Test"}
                  </span>
                  <span>•</span>
                  <span className="text-purple-600 font-medium">
                    {listeningExercises?.test_section?.section_name ||
                      "Listening Section"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
              disabled={!sectionId || !mockTestId}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Exercise</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search exercises by title or audio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filterDifficulty}
                    onValueChange={(value) => setFilterDifficulty(value)}
                  >
                    <SelectTrigger className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Difficulties</SelectItem>
                      <SelectItem value="1">Beginner</SelectItem>
                      <SelectItem value="2">Elementary</SelectItem>
                      <SelectItem value="3">Intermediate</SelectItem>
                      <SelectItem value="4">Upper Intermediate</SelectItem>
                      <SelectItem value="5">Advanced</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortByType)}
                  >
                    <SelectTrigger className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordering">Sort by Order</SelectItem>
                      <SelectItem value="title">Sort by Title</SelectItem>
                      <SelectItem value="difficulty">
                        Sort by Difficulty
                      </SelectItem>
                      <SelectItem value="created_at">Sort by Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Headphones className="h-6 w-6 text-purple-600" />
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Passing Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgPassingScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="space-y-6">
          {filteredAndSortedExercises.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Headphones className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterDifficulty
                      ? "No exercises found"
                      : "No listening exercises yet"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {searchTerm || filterDifficulty
                      ? "Try adjusting your search criteria or filters."
                      : "Create your first listening comprehension exercise to get started."}
                  </p>
                  {!(searchTerm || filterDifficulty) && (
                    <Button
                      onClick={handleCreateNew}
                      className="bg-purple-600 hover:bg-purple-700"
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
              const difficultyLevel =
                exercise.listening_passage?.difficulty_level || "3";
              const difficulty =
                DIFFICULTY_LABELS[
                  difficultyLevel as keyof typeof DIFFICULTY_LABELS
                ] || DIFFICULTY_LABELS["3"];

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
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                              {exercise.ordering || 0}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {exercise.title || "Untitled Exercise"}
                              </h3>
                              <Badge className={`${difficulty.color} border-0`}>
                                <div className="flex items-center space-x-1">
                                  <span className="ml-1">
                                    {difficulty.label}
                                  </span>
                                </div>
                              </Badge>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-2">
                              <span className="font-medium">Audio:</span>{" "}
                              {exercise.reading_passage?.title ||
                                "Untitled Audio"}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{exercise.time_limit || 0} minutes</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Target className="h-4 w-4" />
                                <span>
                                  {exercise.passing_score || 0} to pass
                                </span>
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
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
                                Delete Listening Exercise
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

        {/* Results summary */}
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

export default ListeningList;

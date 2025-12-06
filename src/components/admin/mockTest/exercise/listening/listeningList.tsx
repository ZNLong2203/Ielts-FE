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
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import AdminFilter from "@/components/filter/admin-filter";
import { useFilter } from "@/hook/useFilter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  Headphones,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Eye,
  Search,
  Filter,
  Calendar,
  Target,
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

type SortByType = "title" | "difficulty_level" | "ordering" | "created_at";

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

  // ✅ Prepare data for useFilter hook
  const exercisesData = useMemo(() => {
    if (!listeningExercises?.exercises || !Array.isArray(listeningExercises.exercises)) {
      return [];
    }

    return listeningExercises.exercises.map((exercise: any) => ({
      ...exercise,
      // Map nested fields for easier filtering
      difficulty_level: exercise.reading_passage?.difficulty_level || "3",
      passage_title: exercise.reading_passage?.title || "",
      has_audio: exercise.audio_url ? "yes" : "no",
    }));
  }, [listeningExercises]);

  // ✅ Use useFilter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(exercisesData, ["title", "difficulty_level", "has_audio", "created_at"]);

  const filterFieldConfigs = [
    {
      key: "difficulty_level",
      label: "Difficulty Level",
      placeholder: "Select difficulty",
      icon: <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />,
      type: "select" as const,
      options: [
        { label: "Beginner", value: "1" },
        { label: "Elementary", value: "2" },
        { label: "Intermediate", value: "3" },
        { label: "Upper Intermediate", value: "4" },
        { label: "Advanced", value: "5" },
      ],
    },
    {
      key: "created_at",
      label: "Created",
      placeholder: "Select time period",
      icon: <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />,
      type: "select" as const,
      options: [
        { label: "Last 7 days", value: "7d" },
        { label: "Last 30 days", value: "30d" },
        { label: "Last 3 months", value: "3m" },
        { label: "Last 6 months", value: "6m" },
        { label: "Last year", value: "1y" },
        { label: "Over 1 year", value: "1y+" },
      ],
    },
  ];

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

  const finalFilteredExercises = useMemo(() => {
    let result = [...filteredData];

    // Apply search term
    if (searchTerm) {
      result = result.filter((exercise: any) => {
        const title = exercise.title || "";
        const passageTitle = exercise.passage_title || "";
        const searchLower = searchTerm.toLowerCase();
        
        return (
          title.toLowerCase().includes(searchLower) ||
          passageTitle.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sorting
    result.sort((a: any, b: any) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "difficulty_level":
          return (a.difficulty_level || "3").localeCompare(b.difficulty_level || "3");
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

    return result;
  }, [filteredData, searchTerm, sortBy]);

  // Computed stats
  const stats = useMemo(() => {
    const exercises = exercisesData;
    const totalExercises = exercises.length;

    if (totalExercises === 0) {
      return {
        totalExercises: 0,
        avgTimeLimit: 0,
      };
    }

    const avgTimeLimit = Math.round(
      exercises.reduce(
        (acc: number, ex: any) => acc + Number(ex.time_limit || 0),
        0
      ) / totalExercises
    );

    return {
      totalExercises,
      avgTimeLimit,
    };
  }, [exercisesData]);

  console.log("Listening Exercises Data:", listeningExercises);
  console.log("Final Filtered Exercises:", finalFilteredExercises);

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
        {/* ✅ Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Quick Search and Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Quick search exercises by title or audio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* ✅ Advanced Filter Toggle */}
                  <Button
                    variant={isFilterVisible ? "default" : "outline"}
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Advanced Filters</span>
                    {Object.values(filters).filter(v => v !== "").length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                        {Object.values(filters).filter(v => v !== "").length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Advanced Filter Panel */}
          <AdminFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onClose={handleClose}
            isVisible={isFilterVisible}
            totalItems={stats.totalExercises}
            filteredCount={finalFilteredExercises.length}
            label="Listening Exercises"
            fieldConfigs={filterFieldConfigs}
          />
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

          {/* ✅ Filtered Results Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Showing Results
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {finalFilteredExercises.length}
                    {finalFilteredExercises.length !== stats.totalExercises && (
                      <span className="text-sm text-gray-500 ml-1">
                        / {stats.totalExercises}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="space-y-6">
          {finalFilteredExercises.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Headphones className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || Object.values(filters).some(v => v !== "")
                      ? "No exercises found"
                      : "No listening exercises yet"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {searchTerm || Object.values(filters).some(v => v !== "")
                      ? "Try adjusting your search criteria or filters."
                      : "Create your first listening comprehension exercise to get started."}
                  </p>
                  {!(searchTerm || Object.values(filters).some(v => v !== "")) && (
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
            finalFilteredExercises.map((exercise: any) => {
              const difficultyLevel = exercise.difficulty_level || "3";
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
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
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

                            <div className="flex items-center space-x-2 mb-4">
                              <Headphones className="h-4 w-4 text-purple-600" />
                              <span className="text-gray-600">
                                <span className="font-medium">Audio:</span>{" "}
                                {exercise.audio_url ? (
                                  <span className="text-purple-600 font-medium">
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">No audio file</span>
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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

        {/* ✅ Enhanced Results Summary */}
        {finalFilteredExercises.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Showing {finalFilteredExercises.length} of {stats.totalExercises} exercises
              {searchTerm && (
                <span className="text-purple-600 ml-1">
                  matching "{searchTerm}"
                </span>
              )}
              {Object.values(filters).filter(v => v !== "").length > 0 && (
                <span className="text-blue-600 ml-1">
                  with {Object.values(filters).filter(v => v !== "").length} filter(s) applied
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningList;
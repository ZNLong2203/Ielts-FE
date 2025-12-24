"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTeacherCourses } from "@/api/course";
import { ICourse } from "@/interface/course";
import TeacherCourseList from "@/components/teacher/dashboard/course/TeacherCourseList";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/userSlice";
import {
  BookOpen,
  RefreshCw,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import ROUTES from "@/constants/route";
import { useFilter } from "@/hook/useFilter";
import AdminFilter from "@/components/filter/admin-filter";
import { Search } from "lucide-react";

const TeacherCoursePage = () => {
  // Get teacher ID from local storage or context
  const user = useSelector(selectUser);

  const [teacherId, setTeacherId] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user && user.role === "teacher") {
      setTeacherId(user.teachers?.id ?? "");
    }
  }, [user]);

  console.log("Fetching courses for teacher ID:", teacherId);

  const courseQueryParams = {
    page: page,
    is_featured: true
  };
  
  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["teacher-courses", teacherId, courseQueryParams],
    queryFn: () => getTeacherCourses(teacherId, courseQueryParams),
    enabled: !!teacherId,
  });

  console.log("Fetched courses:", courses);
  const courseList = courses?.result ?? [];

  // Filters (match teacherBlogList style via AdminFilter + useFilter)
  const filterFields = ["title", "skill_focus", "difficulty_level"];
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(courseList, filterFields);
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;
  const filteredCount = filteredData.length;

  // Use server-side pagination from API metadata
  const currentPage = courses?.meta?.current || page;
  const pageSize = courses?.meta?.pageSize || 10;
  const totalPages = courses?.meta?.pages || 1;
  const totalCourses = courses?.meta?.total || 0;

  const displayData = hasActiveFilters ? filteredData : courseList;
  const displayCount = hasActiveFilters ? filteredCount : totalCourses;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Failed to load courses"
        description="Unable to fetch your courses. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Heading title="My Courses" description="Manage and view all courses you're teaching" />

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={hasActiveFilters ? "bg-blue-50 border-blue-200" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {hasActiveFilters ? "Filtered Courses" : "Total Courses"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hasActiveFilters ? filteredCount : totalCourses}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveFilters
                      ? `of ${totalCourses} total`
                      : `${pageSize} per page`}
                  </p>
                </div>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {displayData.reduce((sum: number, c: ICourse) => sum + ((c as ICourse & { enrollment_count?: number }).enrollment_count || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total enrollments
                  </p>
                </div>
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section (AdminFilter) */}
        {isFilterVisible && (
          <AdminFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onClose={handleClose}
            isVisible={isFilterVisible}
            totalItems={totalCourses}
            filteredCount={filteredCount}
            label="Courses"
            fieldConfigs={[
              {
                key: "title",
                label: "Title",
                placeholder: "Search by title",
                icon: (
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                ),
                type: "input",
              },
              {
                key: "skill_focus",
                label: "Skill",
                placeholder: "Filter by skill",
                icon: (
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                ),
                type: "select",
                options: [
                  { label: "Reading", value: "reading" },
                  { label: "Listening", value: "listening" },
                  { label: "Speaking", value: "speaking" },
                  { label: "Writing", value: "writing" },
                ],
              },
              {
                key: "difficulty_level",
                label: "Difficulty",
                placeholder: "Filter by level",
                icon: (
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                ),
                type: "select",
                options: [
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Advanced", value: "advanced" },
                ],
              },
            ]}
          />
        )}

        {/* Course Grid */}
        {displayData?.length > 0 ? (
          <>
            <TeacherCourseList courses={displayData} />

            {/* Enhanced Pagination */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mt-8">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(endIndex, displayCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {displayCount}
                    </span>{" "}
                    courses
                    {hasActiveFilters && (
                      <span className="text-blue-600 ml-1">(filtered)</span>
                    )}
                  </span>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1}
                    className="hidden md:flex"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden md:inline">Previous</span>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <span className="mr-1 hidden md:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="hidden md:flex"
                  >
                    Last
                  </Button>

                  <div className="hidden md:flex items-center space-x-2 ml-4">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">
                        of {totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </>
        ) : (
          // Empty State
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <Link href={ROUTES.TEACHER_COURSES + "/create"}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherCoursePage;

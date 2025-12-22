"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getCourseStudentsProgress } from "@/api/course";
import {
  ICourseStudentProgressItem,
  ICourseStudentProgressResponse,
} from "@/interface/courseProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Users, BarChart3, Mail } from "lucide-react";
import ROUTES from "@/constants/route";

const statusVariant: Record<
  ICourseStudentProgressItem["status"],
  "default" | "secondary" | "outline"
> = {
  not_started: "secondary",
  in_progress: "default",
  completed: "outline",
};

const TeacherCourseStudentsProgress = () => {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<ICourseStudentProgressResponse>({
    queryKey: ["course-students-progress", slug],
    queryFn: () => getCourseStudentsProgress(String(slug), { page: 1, limit: 50 }),
    enabled: !!slug,
  });

  if (isLoading) return <Loading />;

  if (isError || !data) {
    return (
      <Error
        title="Unable to load learner progress"
        description="There was a problem loading learner progress for this course."
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
        dismissible={true}
      />
    );
  }

  const course = data.data.course;
  const students = data.data.students ?? [];
  const meta = data.data.meta ?? {
    current: 1,
    currentSize: students.length,
    pageSize: students.length || 0,
    pages: 1,
    total: students.length,
  };

  const columns: ColumnDef<ICourseStudentProgressItem>[] = [
    {
      header: "Student",
      accessorKey: "user.full_name",
      cell: ({ row }) => {
        const u = row.original.user;
        const initials =
          u.full_name
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "U";
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={u.avatar || undefined} alt={u.full_name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium text-sm">{u.full_name}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                <span>{u.email}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Progress",
      accessorKey: "progress_percentage",
      cell: ({ row }) => {
        const value = row.original.progress_percentage;
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{value}%</span>
              <span className="text-muted-foreground">
                {row.original.completed_lessons}/{row.original.total_lessons} lessons
              </span>
            </div>
            <Progress value={value} className="h-1.5" />
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const label =
          status === "not_started"
            ? "Not started"
            : status === "in_progress"
            ? "In progress"
            : "Completed";
        return (
          <Badge variant={statusVariant[status]} className="text-xs capitalize">
            {label}
          </Badge>
        );
      },
    },
    {
      header: "Last activity",
      accessorKey: "last_activity",
      cell: ({ row }) => {
        const value = row.original.last_activity;
        if (!value) return <span className="text-xs text-muted-foreground">No activity</span>;
        const date = new Date(value);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
        );
      },
    },
    {
      header: "Enrollment",
      accessorKey: "enrolled_at",
      cell: ({ row }) => {
        const value = row.original.enrolled_at;
        const date = value ? new Date(value) : null;
        return (
          <span className="text-xs text-muted-foreground">
            {date ? date.toLocaleDateString() : "-"}
          </span>
        );
      },
    },
  ];

  const hasStudents = students && students.length > 0;

  const overallAverage = hasStudents
    ? students.reduce((sum, s) => sum + s.progress_percentage, 0) /
      students.length
    : 0;

  const completedCount = hasStudents
    ? students.filter((s) => s.status === "completed").length
    : 0;
  const inProgressCount = hasStudents
    ? students.filter((s) => s.status === "in_progress").length
    : 0;
  const notStartedCount = hasStudents
    ? students.filter((s) => s.status === "not_started").length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Learner Progress
              </h1>
              {course && (
                <p className="text-xs text-gray-500">
                  Course: {course.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`${ROUTES.TEACHER_COURSES}/${slug}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to course detail
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total learners
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
              <p className="text-xs text-muted-foreground">
                Showing {meta.currentSize} on this page
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average progress
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {overallAverage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all enrolled learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">
                  Not started: {notStartedCount}
                </Badge>
                <Badge>
                  In progress: {inProgressCount}
                </Badge>
                <Badge variant="outline">
                  Completed: {completedCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Learner list
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={students}
              searchKey={["user.full_name", "user.email"]}
              searchPlaceholder="Search by student name or email..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherCourseStudentsProgress;



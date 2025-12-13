"use client";

import StatCard from "@/components/admin/dashboard/StatCard";
import RecentSubmissions from "@/components/teacher/dashboard/RecentSubmissions";
import TeacherOverview from "@/components/teacher/dashboard/TeacherOverview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { BookOpen, FileCheck, RefreshCw, Settings, Star } from "lucide-react";

const TeacherDashboardPage = () => {
  const { data, isLoading, error, refetch } = useTeacherDashboard();

  if (isLoading) return <Loading />;
  if (error) return <Error title="Failed to load dashboard data" />;
  if (!data) return <Error title="No data available" />;

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Heading
            title="Teacher Dashboard"
            description="Track your blog posts and grading activity."
          />
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Blogs"
          value={data.stats.totalBlogs || 0}
          change={data.stats.blogGrowth || 0}
          icon={BookOpen}
          iconColor="text-blue-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Published Blogs"
          value={data.stats.publishedBlogs || 0}
          change={0}
          icon={BookOpen}
          iconColor="text-green-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Pending Grading"
          value={data.stats.pendingSubmissions}
          change={0}
          icon={FileCheck}
          iconColor="text-yellow-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Graded This Month"
          value={data.stats.monthlyGraded || 0}
          change={data.stats.gradingGrowth || 0}
          icon={Star}
          iconColor="text-purple-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
      </div>

      {/* Quick Overview Section */}
      <TeacherOverview stats={data.stats} />

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-1">
        <RecentSubmissions submissions={data.recentSubmissions} />
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Dashboard last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;

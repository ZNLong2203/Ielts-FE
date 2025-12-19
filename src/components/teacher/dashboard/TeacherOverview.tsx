import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeacherStats } from "@/interface/teacherDashboard";
import {
  BookOpen,
  Calendar,
  FileCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface TeacherOverviewProps {
  stats: TeacherStats;
}

const TeacherOverview = ({ stats }: TeacherOverviewProps) => {
  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-gray-50 border-2 border-blue-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Overview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your teaching activity and pending tasks
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Active
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Weekly Blogs */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">
                This Week
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stats.weeklyBlogs || 0}
              </p>
              <p className="text-xs text-gray-500">New Blogs</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {(stats.blogGrowth || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  (stats.blogGrowth || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(stats.blogGrowth || 0).toFixed(1)}% vs last week
              </span>
            </div>
          </div>

          {/* Weekly Graded */}
          <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileCheck className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">
                This Week
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stats.weeklyGraded || 0}
              </p>
              <p className="text-xs text-gray-500">Graded</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {(stats.gradingGrowth || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  (stats.gradingGrowth || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(stats.gradingGrowth || 0).toFixed(1)}% vs last week
              </span>
            </div>
          </div>

          {/* Pending Grading */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileCheck className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Pending</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingSubmissions}
              </p>
              <p className="text-xs text-gray-500">Submissions</p>
            </div>
            {stats.pendingSubmissions > 0 && (
              <Button
                size="sm"
                variant="link"
                className="p-0 h-auto text-xs mt-2"
                asChild
              >
                <Link href="/teacher/grading">Review Now →</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/dashboard/blog/create">
                <BookOpen className="h-4 w-4 mr-2" />
                Write Blog
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/dashboard/writing-grading">
                <FileCheck className="h-4 w-4 mr-2" />
                Review Writing Grading
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/dashboard/blog">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Blogs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeacherOverview;

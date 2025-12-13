import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardStats } from "@/interface/adminDashboard";
import {
  BarChart3,
  BookOpen,
  FileText,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

interface QuickOverviewProps {
  className?: string;
  stats?: DashboardStats;
}

export default function QuickOverview({
  className,
  stats,
}: QuickOverviewProps) {
  // Use real today data from API
  const todayStats = {
    newUsers: stats?.todayNewUsers || 0,
    testsCompleted: stats?.todayTestsCompleted || 0,
    coursesEnrolled: stats?.todayEnrollments || 0,
    revenue: stats?.todayRevenue || 0,
  };

  const weeklyComparison = {
    users: stats?.userGrowth || 0,
    tests: stats?.mockTestGrowth || 0,
    courses: stats?.courseGrowth || 0,
    revenue: stats?.revenueGrowth || 0,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <span>Today&apos;s Overview</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">New Users</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{todayStats.newUsers}</p>
              <span
                className={`text-xs flex items-center ${
                  weeklyComparison.users >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {weeklyComparison.users >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(weeklyComparison.users)}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Tests Done</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {todayStats.testsCompleted}
              </p>
              <span
                className={`text-xs flex items-center ${
                  weeklyComparison.tests >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {weeklyComparison.tests >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(weeklyComparison.tests)}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-1">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Enrollments</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {todayStats.coursesEnrolled}
              </p>
              <span
                className={`text-xs flex items-center ${
                  weeklyComparison.courses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {weeklyComparison.courses >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(weeklyComparison.courses)}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {todayStats.revenue.toLocaleString()} VND
              </p>
              <span
                className={`text-xs flex items-center ${
                  weeklyComparison.revenue >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {weeklyComparison.revenue >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(weeklyComparison.revenue)}%
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Content Status
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
              <span className="text-sm">Published Courses</span>
              <Badge
                variant="outline"
                className="border-green-200 text-green-700"
              >
                {stats?.totalCourses || 0} Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
              <span className="text-sm">Mock Tests Available</span>
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700"
              >
                {stats?.totalMockTests || 0} Tests
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
              <span className="text-sm">Total Users</span>
              <Badge
                variant="outline"
                className="border-purple-200 text-purple-700"
              >
                {stats?.totalUsers || 0} Users
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-9"
              asChild
            >
              <Link href="/admin/course/create">
                <Plus className="h-4 w-4 mr-2" />
                Add New Course
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-9"
              asChild
            >
              <Link href="/admin/mockTest/create">
                <FileText className="h-4 w-4 mr-2" />
                Create Mock Test
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-9"
            >
              <Settings className="h-4 w-4 mr-2" />
              Platform Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import ChartCard from "@/components/admin/dashboard/ChartCard";
import QuickOverview from "@/components/admin/dashboard/QuickOverview";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import StatCard from "@/components/admin/dashboard/StatCard";
import TopCourses from "@/components/admin/dashboard/TopCourses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import { useDashboardData } from "@/hooks/useAdminDashboard";
import {
  BookOpen,
  DollarSign,
  FileText,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";

const AdminPage = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  console.log("Dashboard Data:", data);

  if (isLoading) return <Loading />;
  if (error) return <Error title="Failed to load dashboard data" />;
  if (!data) return <Error title="No data available" />;

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Heading
            title="Admin Dashboard"
            description="Welcome back! Here's what's happening with your IELTS platform."
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
          title="Total Users"
          value={data.stats.totalUsers}
          change={data.stats.userGrowth}
          icon={Users}
          iconColor="text-blue-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Total Courses"
          value={data.stats.totalCourses}
          change={data.stats.courseGrowth}
          icon={BookOpen}
          iconColor="text-green-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Mock Tests"
          value={data.stats.totalMockTests}
          change={data.stats.mockTestGrowth}
          icon={FileText}
          iconColor="text-purple-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
        <StatCard
          title="Revenue"
          value={`$${data.stats.totalRevenue.toLocaleString()}`}
          change={data.stats.revenueGrowth}
          icon={DollarSign}
          iconColor="text-yellow-600"
          className="hover:shadow-xl transition-shadow duration-300"
        />
      </div>
      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="User Growth Over Time"
          data={data.userGrowthChart}
          height={320}
        />
        <ChartCard
          title="Revenue Trends"
          data={data.revenueChart}
          height={320}
        />
      </div>
      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Recent Activities - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivities activities={data.recentActivities} />
        </div>

        {/* Top Courses - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TopCourses courses={data.topCourses} />
        </div>
      </div>
      {/* Quick Overview as separate section */}
      <div className="grid gap-6 lg:grid-cols-1">
        <QuickOverview stats={data.stats} />
      </div>
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Dashboard last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AdminPage;

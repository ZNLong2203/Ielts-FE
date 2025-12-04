import { LucideIcon } from "lucide-react";

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalMockTests: number;
  totalRevenue: number;
  userGrowth: number;
  courseGrowth: number;
  mockTestGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "user_registered"
    | "course_created"
    | "mocktest_completed"
    | "payment_received";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label: string;
}

export type ChartData = ChartDataPoint[];

export interface TopCourse {
  id: string;
  title: string;
  thumbnail?: string;
  enrollments: number;
  rating: number;
  revenue: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  userGrowthChart: ChartData;
  revenueChart: ChartData;
  topCourses: TopCourse[];
}

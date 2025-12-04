import {
  getDashboardData,
  getDashboardStats,
  getMockDashboardData,
  getMockDashboardStats,
  getMockRecentActivities,
  getMockRevenueChart,
  getMockTopCourses,
  getMockUserGrowthChart,
  getRecentActivities,
  getRevenueChart,
  getTopCourses,
  getUserGrowthChart,
} from "@/api/adminDashboard";
import { type DashboardData } from "@/interface/adminDashboard";
import { useQuery } from "@tanstack/react-query";

// Configuration: Set to true to use mock data, false for real APIs
const USE_MOCK_DATA = true;

// Hook for getting complete dashboard data
export const useDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: USE_MOCK_DATA ? getMockDashboardData : getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Individual hooks with mock/real API toggle
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: USE_MOCK_DATA ? getMockDashboardStats : getDashboardStats,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: USE_MOCK_DATA ? getMockRecentActivities : getRecentActivities,
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });
};

export const useUserGrowthChart = () => {
  return useQuery({
    queryKey: ["dashboard", "user-growth"],
    queryFn: USE_MOCK_DATA ? getMockUserGrowthChart : getUserGrowthChart,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueChart = () => {
  return useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: USE_MOCK_DATA ? getMockRevenueChart : getRevenueChart,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopCourses = () => {
  return useQuery({
    queryKey: ["dashboard", "top-courses"],
    queryFn: USE_MOCK_DATA ? getMockTopCourses : getTopCourses,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

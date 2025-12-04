import { getDashboardData, getMockDashboardData } from "@/api/adminDashboard";
import { type DashboardData } from "@/interface/adminDashboard";
import { useQuery } from "@tanstack/react-query";

// Configuration: Set to true to use mock data, false for real APIs
const USE_MOCK_DATA = false;

// Hook for getting complete dashboard data
export const useDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: USE_MOCK_DATA ? getMockDashboardData : getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

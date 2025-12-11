"use client";

import { teacherDashboardApi } from "@/api/teacherDashboard";
import { useQuery } from "@tanstack/react-query";

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherDashboardApi.getDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

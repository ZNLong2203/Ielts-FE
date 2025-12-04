import { API_URL } from "@/constants/api";
import { mockDashboardData } from "@/data/mockDashboard";
import { DashboardData } from "@/interface/adminDashboard";
import api from "@/utils/interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Mock API functions using imported data
export const getMockDashboardData = (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData);
    }, 500);
  });
};

// Real API calls (to be implemented later)
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}`);
  return response.data.data;
};

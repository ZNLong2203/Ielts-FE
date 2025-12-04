import { API_URL } from "@/constants/api";
import {
  mockDashboardData,
  mockDashboardStats,
  mockRecentActivities,
  mockRevenueChart,
  mockTopCourses,
  mockUserGrowthChart,
} from "@/data/mockDashboard";
import {
  ChartData,
  DashboardData,
  DashboardStats,
  RecentActivity,
  TopCourse,
} from "@/interface/adminDashboard";
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

// Mock individual API functions
export const getMockDashboardStats = (): Promise<DashboardStats> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDashboardStats), 300);
  });
};

export const getMockRecentActivities = (): Promise<RecentActivity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRecentActivities), 300);
  });
};

export const getMockUserGrowthChart = (): Promise<ChartData> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUserGrowthChart), 300);
  });
};

export const getMockRevenueChart = (): Promise<ChartData> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRevenueChart), 300);
  });
};

export const getMockTopCourses = (): Promise<TopCourse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTopCourses), 300);
  });
};

// Real API calls (to be implemented later)
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}`);
  return response.data.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}/stats`);
  return response.data.data;
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}/activities`);
  return response.data.data;
};

export const getUserGrowthChart = async (): Promise<ChartData> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}/user-growth`);
  return response.data.data;
};

export const getRevenueChart = async (): Promise<ChartData> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}/revenue`);
  return response.data.data;
};

export const getTopCourses = async (): Promise<TopCourse[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.DASHBOARD}/top-courses`);
  return response.data.data;
};

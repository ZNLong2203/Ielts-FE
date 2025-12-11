import { API_URL } from "@/constants/api";
import { TeacherDashboard } from "@/interface/teacherDashboard";
import api from "@/utils/interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const teacherDashboardApi = {
  // Get all dashboard data
  getDashboard: async (): Promise<TeacherDashboard> => {
    const response = await api.get(`${BASE_URL}${API_URL.TEACHER_DASHBOARD}`);
    return response.data.data;
  },
};

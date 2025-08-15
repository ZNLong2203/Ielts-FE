import api from "@/utils/interceptor";
import {
  ICourse,
  ICourseCreate,
  ICourses,
  ICourseUpdate,
} from "@/interface/course";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ADMIN APIS
export const getAllCoursesForAdmin = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<ICourses> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}`, { params });
  return response.data.data;
};

export const getAdminFeaturedCourses = async (): Promise<ICourse[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/featured`);
  return response.data.data;
};

export const getAdminNewestCourses = async (): Promise<ICourse[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/newest`);
  return response.data.data;
};

export const getAdminCourseDetail = async (id: string): Promise<ICourse> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/${id}`);
  return response.data.data;
};

export const createAdminCourse = async (data: ICourseCreate) => {
  const response = await api.post(`${BASE_URL}${API_URL.COURSES}`, data);
  return response.data;
};

export const updateAdminCourse = async (data: ICourseUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.COURSES}`, data);
  return response.data;
};

export const deleteAdminCourse = async (id: string) => {
  const response = await api.delete(`${BASE_URL}${API_URL.COURSES}/${id}`);
  return response.data;
};

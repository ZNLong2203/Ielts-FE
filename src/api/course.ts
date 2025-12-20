import api from "@/utils/interceptor";
import {
  ICourse,
  ICourseCreate,
  ICourses,
  ICourseUpdate,
  IComboCourse,
  IComboCourses,
  IComboCourseCreate,
  IComboCourseUpdate,
  IComboCourseLevelRangeResponse,
} from "@/interface/course";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ADMIN APIS
export const getAllCoursesForAdmin = async (params?: {
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<ICourses> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}`, { params });
  console.log(response)
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

export const getTeacherCourses = async (teacherId: string, params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<ICourses> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/teacher/${teacherId}`, { params });
  return response.data.data;
}

export const getAdminCourseDetail = async (id: string): Promise<ICourse> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/${id}`);
  console.log("Course detail response:", response);
  return response.data.data;
};

export const createAdminCourse = async (data: ICourseCreate) => {
  const response = await api.post(`${BASE_URL}${API_URL.COURSES}`, data);
  return response.data;
};

export const updateAdminCourse = async (id: string, data: ICourseUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.COURSES}/${id}`, data);
  return response.data;
};

export const deleteAdminCourse = async (id: string) => {
  const response = await api.delete(`${BASE_URL}${API_URL.COURSES}/${id}`);
  return response.data;
};

// COMBO COURSE APIS
export const getCourseCombos = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  tags?: string;
}): Promise<IComboCourses> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/combo`, { params });
  console.log(response)
  return response.data.data;
};

export const getCourseCombo = async (id: string): Promise<IComboCourse> => {
  const response = await api.get(`${BASE_URL}${API_URL.COURSES}/combo/${id}`);
  console.log("Combo course detail response:", response);
  return response.data.data;
};

export const createCourseCombo = async (data: IComboCourseCreate) => {
  const response = await api.post(`${BASE_URL}${API_URL.COURSES}/combo`, data);
  return response.data;
};

export const updateCourseCombo = async (id: string, data: IComboCourseUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.COURSES}/combo/${id}`, data);
  return response.data;
};

export const deleteCourseCombo = async (id: string) => {
  const response = await api.delete(`${BASE_URL}${API_URL.COURSES}/combo/${id}`);
  return response.data;
};

// Get combo courses by level range (for landing page)
export const getComboCoursesByLevel = async (currentLevel: number, targetLevel: number): Promise<IComboCourseLevelRangeResponse> => {
  console.log(`Frontend: Fetching combo courses for ${currentLevel} - ${targetLevel}`);
  try {
    const response = await api.get(`${BASE_URL}${API_URL.COURSES}/combo/level-range/${currentLevel}/${targetLevel}`);
    console.log('Frontend: API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Frontend: Error fetching combo courses:', error);
    throw error;
  }
};

export const uploadCourseThumbnail = async (courseId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `${BASE_URL}${API_URL.COURSES}/${courseId}/thumbnail`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}
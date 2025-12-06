import api from "@/utils/interceptor";
import {
  ILesson,
  ILessonCreate,
  ILessons,
  ILessonUpdate,
} from "@/interface/lesson";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Get all lessons for a specific section
export const getLessonsBySectionId = async (
  sectionId: string
): Promise<ILessons> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}`
  );
  return response.data.data;
};

// Create a new lesson
export const createLesson = async (data: ILessonCreate, sectionId: string) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}`,
    data
  );
  return response.data.data;
};

// Update a lesson
export const updateLesson = async (
  data: ILessonUpdate,
  lessonId: string,
  sectionId: string
) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}`,
    data
  );
  return response.data;
};

// Delete a lesson
export const deleteLesson = async (sectionId: string, lessonId: string) => {
  const response = await api.delete(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}`
  );
  return response.data;
};

// Get a specific lesson
export const getLessonById = async (
  sectionId: string,
  lessonId: string
): Promise<ILesson> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}`
  );
  return response.data.data.data;
};

export const uploadVideo = async (
  lessonId: string,
  sectionId: string,
  video: File
) => {
  const formData = new FormData();
  formData.append("video", video);
  const response = await api.post(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

//Check video status
export const videoStatus = async (sectionId: string, lessonId: string) => {
  const response = await api.get(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}/video-status`
  );
  return response.data.data;
}

// Reorder lesson
export const reorderLesson = async (
  sectionId: string,
  lessonData: { id: string; ordering: number }[]
) => {
  const data = { lessons: lessonData };
  const response = await api.patch(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/reorder`,
    data
  );
  return response.data;
};

// Get lesson progress
export const getLessonProgress = async (
  sectionId: string,
  lessonId: string
) => {
  const response = await api.get(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}/progress`
  );
  if (response.data.data?.data) {
    return response.data.data.data;
  }
  if (response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Mark lesson as completed
export const markLessonComplete = async (
  sectionId: string,
  lessonId: string,
  courseId: string
) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}/complete`,
    {
      course_id: courseId,
    }
  );
  return response.data;
};


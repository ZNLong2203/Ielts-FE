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
  return response.data;
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
export const deleteLesson = async (lessonId: string, sectionId: string) => {
  const response = await api.delete(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}`
  );
  return response.data;
};

// Get a specific lesson
export const getLessonById = async (
  lessonId: string,
  sectionId: string
): Promise<ILesson> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.SECTIONS}/${sectionId}${API_URL.LESSONS}/${lessonId}`
  );
  return response.data.data;
};

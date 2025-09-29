import api from "@/utils/interceptor";
import { ISection, ISectionCreate, ISectionUpdate } from "@/interface/section";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Get all sections for a specific course
export const getSectionsByCourseId = async (
  courseId: string
): Promise<ISection[]> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.COURSES}/${courseId}/sections`
  );
  return response.data.data;
};

// Create a new section
export const createSection = async (data: ISectionCreate, courseId: string) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.COURSES}/${courseId}${API_URL.SECTIONS}`,
    data
  );
  return response.data;
};

// Update a section by ID
export const updateSection = async (
  data: ISectionUpdate,
  id: string,
  courseId: string
) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.COURSES}/${courseId}${API_URL.SECTIONS}/${id}`,
    data
  );
  return response.data;
};

// Get a section by ID
export const getSectionById = async (
  id: string,
  courseId: string
): Promise<ISection> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.COURSES}/${courseId}/sections/${id}`
  );
  return response.data.data;
};

// Delete a section by ID
export const deleteSection = async (id: string, courseId: string) => {
  const response = await api.delete(
    `${BASE_URL}${API_URL.COURSES}/${courseId}/sections/${id}`
  );
  return response.data;
};

// Reorder sections within a course

export const reorderSections = async (
  courseId: string,
  sectionData: { id: string; ordering: number }[]
) => {
  const data = { sections: sectionData };
  console.log("Reorder sections response:", data);

  const response = await api.patch(
    `${BASE_URL}${API_URL.COURSES}/${courseId}${API_URL.SECTIONS}/reorder`,
    data
  );
  return response.data;
};

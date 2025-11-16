import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import {
  IReadingExercise,
  IReadingExerciseCreate,
  IReadingExerciseList,
  IReadingExerciseUpdate,
} from "@/interface/reading";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getReadingExercisesBySection = async (
  testSectionId: string
): Promise<IReadingExerciseList> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.READING}/test-section/${testSectionId}`
  );
  return response.data.data;
};

export const getReadingExercise = async (
  id: string
): Promise<IReadingExercise> => {
  const response = await api.get(`${BASE_URL}${API_URL.READING}/${id}`);
  return response.data.data;
};

export const createReadingExercise = async (
  data: IReadingExerciseCreate
): Promise<IReadingExercise> => {
  const response = await api.post(`${BASE_URL}${API_URL.READING}`, data);
  return response.data;
};

export const updateReadingExercise = async (
  id: string,
  data: IReadingExerciseUpdate
): Promise<IReadingExercise> => {
  const response = await api.put(`${BASE_URL}${API_URL.READING}/${id}`, data);
  return response.data;
};

export const deleteReadingExercise = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${API_URL.READING}/${id}`);
};

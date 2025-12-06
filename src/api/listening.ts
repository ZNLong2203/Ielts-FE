import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import {
  IListeningExercise,
  IListeningExerciseCreate,
  IListeningExerciseUpdate,
  IListeningExerciseList,
} from "@/interface/listening";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getListeningExercisesBySection = async (
  testSectionId: string
): Promise<IListeningExerciseList> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.LISTENING}/test-section/${testSectionId}`
  );
  return response.data.data;
};

export const getListeningExercise = async (
  id: string
): Promise<IListeningExercise> => {
  const response = await api.get(`${BASE_URL}${API_URL.LISTENING}/${id}`);
  return response.data.data;
};

export const createListeningExercise = async (
  data: IListeningExerciseCreate
): Promise<IListeningExercise> => {
  const response = await api.post(`${BASE_URL}${API_URL.LISTENING}`, data);
  return response.data.data;
};

export const updateListeningExercise = async (
  id: string,
  data: IListeningExerciseUpdate
) => {
  const response = await api.put(`${BASE_URL}${API_URL.LISTENING}/${id}`, data);
  return response.data;
};

export const deleteListeningExercise = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${API_URL.LISTENING}/${id}`);
};

export const uploadListeningAudio = async (id: string, formData: FormData) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.LISTENING}/${id}/audio`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

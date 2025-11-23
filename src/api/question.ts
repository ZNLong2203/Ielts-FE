import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getQuestions = async (exerciseId: string) => {
  const response = await api.get(
    `${BASE_URL}${API_URL.QUESTIONS}/exercise/${exerciseId}`
  );
  return response.data.data;
};

export const getQuestion = async (id: string) => {
  const response = await api.get(`${BASE_URL}${API_URL.QUESTIONS}/${id}`);
  return response.data.data;
};

export const createQuestion = async (data: any) => {
  const response = await api.post(`${BASE_URL}${API_URL.QUESTIONS}`, data);
  return response.data;
};

export const updateQuestion = async (id: string, data: any) => {
  const response = await api.put(`${BASE_URL}${API_URL.QUESTIONS}/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id: string) => {
  await api.delete(`${BASE_URL}${API_URL.QUESTIONS}/${id}`);
};

export const uploadQuestionImage = async (id: string, formData: FormData) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.QUESTIONS}/${id}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const uploadQuestionAudio = async (id: string, formData: FormData) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.QUESTIONS}/${id}/audio`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";

import {
    IMockTestQuestion,
    IMockTestQuestionCreate,
    IMockTestQuestionUpdate,
} from "@/interface/mockTestQuestion";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getMockTestQuestions = async (): Promise<IMockTestQuestion[]> => {
    const response = await api.get(`${BASE_URL}${API_URL.QUESTIONS}`);
    return response.data.data;
}

export const createMockTestQuestion = async (data: IMockTestQuestionCreate): Promise<IMockTestQuestion> => {
    const response = await api.post(`${BASE_URL}${API_URL.QUESTIONS}`, data);
    return response.data.data;
}

export const getMockTestQuestion = async (id: string): Promise<IMockTestQuestion> => {
    const response = await api.get(`${BASE_URL}${API_URL.QUESTIONS}/${id}`);
    return response.data.data;
}

export const updateMockTestQuestion = async (id: string, data: IMockTestQuestionUpdate): Promise<IMockTestQuestion> => {
    const response = await api.put(`${BASE_URL}${API_URL.QUESTIONS}/${id}`, data);
    return response.data.data;
}

export const deleteMockTestQuestion = async (id: string) => {
    const response = await api.delete(`${BASE_URL}${API_URL.QUESTIONS}/${id}`);
    return response.data.data;
}
import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import {
    IQuestionGroup,
    IQuestionGroupCreate,
    IQuestionGroupUpdate,
} from "@/interface/questionGroup";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Get Question Groups by Exercise ID
export const getQuestionGroups = async ({ exercise_id }: { exercise_id: string }): Promise<IQuestionGroup[]> => {
    const response = await api.get(`${BASE_URL}/${API_URL.QUESTION_GROUPS}`, {
        params: { exercise_id },
    });
    return response.data;
};

// Create a new Question Group
export const createQuestionGroup = async (data: IQuestionGroupCreate): Promise<IQuestionGroupCreate> => {
    const response = await api.post(`${BASE_URL}/${API_URL.QUESTION_GROUPS}`, data);
    return response.data;
};

// Update an existing Question Group
export const updateQuestionGroup = async (id: string, data: IQuestionGroupUpdate): Promise<IQuestionGroupUpdate> => {
    const response = await api.put(`${BASE_URL}/${API_URL.QUESTION_GROUPS}/${id}`, data);
    return response.data;
};

// Delete a Question Group
export const deleteQuestionGroup = async (id: string) => {
    await api.delete(`${BASE_URL}/${API_URL.QUESTION_GROUPS}/${id}`);
};
import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IMockTests, IMockTestCreate, IMockTest, IMockTestUpdate } from "@/interface/mockTest";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getMockTests = async ({page}: {page: number}): Promise<IMockTests> => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}`, {
        params: {
            page
        }
    });
    return response.data.data;
}

export const createMockTest = async (data: IMockTestCreate): Promise<IMockTest> => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}`, data);
    return response.data.data;
}

export const getMockTest = async (id: string): Promise<IMockTest> => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`);
    return response.data.data.data;
}

export const updateMockTest = async (id: string, data: IMockTestUpdate): Promise<IMockTest> => {
    const response = await api.patch(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`, data);
    return response.data.data;
}

export const deleteMockTest = async (id: string) => {
    const response = await api.delete(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`);
    return response.data.data;
}

export const startMockTest = async (testId: string) => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}/${testId}/start`);
    const responseData = response.data.data;
    if (responseData?.success && responseData?.data) {
        return responseData.data;
    }
    if (responseData?.data) {
        return responseData.data;
    }
    return responseData;
}

export interface TestAnswerSubmission {
    question_id: string;
    user_answer: {
        fill_blank_answers?: string;
        multiple_choice_answers?: string[];
        true_false_answers?: string;
        matching_answers?: string;
    };
}

export interface TestSectionSubmission {
    test_result_id: string;
    test_section_id: string;
    time_taken: number; // in seconds
    answers: TestAnswerSubmission[];
}

export const submitSectionAnswers = async (data: TestSectionSubmission) => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}/submit-section`, data);
    const responseData = response.data.data;
    if (responseData?.data) {
        return { data: responseData.data };
    }
    return { data: responseData || response.data };
}

export const getTestResult = async (resultId: string) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/results/${resultId}`);
    return response.data.data;
}

export const getUserTestHistory = async (params?: { page?: number; limit?: number }) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/results/history`, {
        params
    });
    return response.data.data;
}
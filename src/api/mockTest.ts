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
    console.log(response.data.data);
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
import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IStudent } from "@/interface/student";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getStudents = async ({page}: {page: number}) => {
    const response = await api.get(`${BASE_URL}${API_URL.STUDENT}/?page=${page}`);
    console.log(response);
    return response;
}

export const getStudent = async (id: string) => {
    const response = await api.get(`${BASE_URL}${API_URL.STUDENT}/${id}`);
    console.log(response);
    return response;
}

export const createStudent = async (data: IStudent) => {
    const response = await api.post(`${BASE_URL}${API_URL.STUDENT}`, data);
    console.log(response);
    return response;
}

export const updateStudent = async (id: string, data: IStudent) => {
    const response = await api.patch(`${BASE_URL}${API_URL.STUDENT}/${id}`, data);
    console.log(response);
    return response;
}

export const deleteStudent = async (id: string) => {
    const response = await api.delete(`${BASE_URL}${API_URL.STUDENT}/${id}`);
    console.log(response);
    return response;
}
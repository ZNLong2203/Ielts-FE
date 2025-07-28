import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IStudent, IStudentUpdate } from "@/interface/student";
import { IUser, IUsers } from "@/interface/user";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getStudents = async ({page}: {page: number}): Promise<IUsers> => {
    const response = await api.get(`${BASE_URL}${API_URL.STUDENT}/?page=${page}`);
    console.log("Student list response:", response);
    return response.data.data;
}

export const getStudent = async (id: string): Promise<IUser> => {
    const response = await api.get(`${BASE_URL}${API_URL.STUDENT}/${id}`);
    console.log("Student detail response:", response);
    return response.data.data;
}

export const createStudent = async (data: IStudent) => {
    const response = await api.post(`${BASE_URL}${API_URL.STUDENT}`, data);
    console.log(response);
    return response.data
}

export const updateStudent = async (id: string, data: IStudentUpdate) => {
    const response = await api.patch(`${BASE_URL}${API_URL.STUDENT}/${id}`, data);
    console.log("Update student response:", response);
    return response.data;
}

export const deleteStudent = async (id: string) => {
    const response = await api.delete(`${BASE_URL}${API_URL.STUDENT}/${id}`);
    console.log(response);
    return response.data;
}
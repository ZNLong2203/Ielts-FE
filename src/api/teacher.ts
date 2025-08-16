import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IUser, IUsers } from "@/interface/user";
import { ITeacherUpdate } from "@/interface/teacher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getTeachers = async (params?: {
  page?: number;
  all?: boolean;
}): Promise<IUsers> => {
  const queryParams = new URLSearchParams();
  if(params?.page) queryParams.append('page', params.page.toString());
  if(params?.all) queryParams.append('all', params.all.toString());
  const response = await api.get(`${BASE_URL}${API_URL.TEACHER}/?${queryParams.toString()}`);
  console.log("Teacher list response:", response);
  return response.data.data;
};

export const getPendingTeachers = async (): Promise<IUsers> => {
  const response = await api.get(`${BASE_URL}${API_URL.TEACHER}/pending`);
  console.log("Pending teacher list response:", response);
  return response.data.data;
};

export const getTeacher = async (id: string): Promise<IUser> => {
  const response = await api.get(`${BASE_URL}${API_URL.TEACHER}/${id}`);
  console.log("Teacher detail response:", response);
  return response.data.data;
};

export const createTeacher = async (data: IUser) => {
  const response = await api.post(`${BASE_URL}${API_URL.TEACHER}`, data);
  console.log(response);
  return response;
};

export const updateTeacher = async (id: string, data: ITeacherUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.TEACHER}/${id}`, data);
  console.log("Update teacher response:", response);
  return response;
};

export const deleteTeacher = async (id: string) => {
  const response = await api.delete(`${BASE_URL}${API_URL.TEACHER}/${id}`);
  console.log(response);
  return response;
};

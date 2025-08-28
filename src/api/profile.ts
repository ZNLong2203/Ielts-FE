import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IUserUpdate } from "@/interface/user";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const updateProfile = async (id: string, data: IUserUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.PROFILE}/${id}`, data);
  console.log(response);
  return response;
};

export const getProfile = async () => {
  const response = await api.get(`${BASE_URL}${API_URL.PROFILE}/me`);
  console.log(response);
  return response;
};

export const updateOwnStudentProfile = async (data: IUserUpdate) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/student/me`,
    data
  );
  console.log(response);
  return response;
};

export const updateOwnTeacherProfile = async (data: IUserUpdate) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/teacher/me`,
    data
  );
  console.log(response);
  return response;
};

export const updateProfileStatus = async (id: string, status: string) => {
  const response = await api.put(`${BASE_URL}${API_URL.PROFILE}/${id}/status`, { status });
  console.log(response);
  return response;
};

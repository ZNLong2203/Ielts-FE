import api from "@/utils/interceptor";
import { ILoginParams, IRegisterParams } from "@/interface/auth";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const Login = async (data: ILoginParams) => {
  const response = await api.post(`${BASE_URL}${API_URL.LOGIN}`, data);
  console.log(response);
  return response;
};

export const Logout = async () => {
  const response = await api.post(`${BASE_URL}${API_URL.LOGOUT}`);
  console.log(response);
  return response;
};

export const studentRegister = async (data: IRegisterParams) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.STUDENT_REGISTER}`,
    data
  );
  console.log(response);
  return response;
};

export const teacherRegister = async (data: IRegisterParams) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.TEACHER_REGISTER}`,
    data
  );
  console.log(response);
  return response;
};

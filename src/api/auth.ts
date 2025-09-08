import api from "@/utils/interceptor";
import { ILogin, IResetTeacherPassword, IStudentRegister, ITeacherRegister } from "@/interface/auth";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const Login = async (data: ILogin) => {
  const response = await api.post(`${BASE_URL}${API_URL.LOGIN}`, data);
  console.log(response);
  return response;
};

export const Logout = async () => {
  const response = await api.post(`${BASE_URL}${API_URL.LOGOUT}`);
  console.log(response);
  return response;
};

export const studentRegister = async (data: IStudentRegister) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.STUDENT_REGISTER}`,
    data
  );
  console.log(response);
  return response;
};

export const teacherRegister = async (data: ITeacherRegister) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.TEACHER_REGISTER}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log(response);
  return response;
};

export const resetTeacherPassword = async (data: IResetTeacherPassword & { token: string }) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.TEACHER_RESET_PASSWORD}?token=${data.token}`,
    {
      new_password: data.new_password,
      confirm_password: data.confirm_password
    }
  );
  console.log(response);
  return response;
}
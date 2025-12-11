import { API_URL } from "@/constants/api";
import { IStudentUpdate } from "@/interface/student";
import { ITeacherUpdate } from "@/interface/teacher";
import { IUserUpdate } from "@/interface/user";
import api from "@/utils/interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const updateProfile = async (id: string, data: IUserUpdate) => {
  const response = await api.patch(`${BASE_URL}${API_URL.PROFILE}/${id}`, data);
  console.log(response);
  return response;
};

export const getProfile = async () => {
  const response = await api.get(`${BASE_URL}${API_URL.OWN_PROFILE}`);
  console.log(response);
  return response;
};

export const updateOwnProfile = async (data: IUserUpdate) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/me`,
    data
  );
  console.log(response);
  return response;
};

export const updatePassword = async (data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.CHANGE_PASSWORD}`,
    data
  );
  return response;
};

export const updateOwnStudentProfile = async (data: IStudentUpdate) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/student/me`,
    data
  );
  console.log(response);
  return response;
};

export const updateOwnTeacherProfile = async (data: ITeacherUpdate) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/teacher/me`,
    data
  );
  console.log(response);
  return response;
};

export const updateProfileStatus = async (id: string, status: string) => {
  const response = await api.put(`${BASE_URL}${API_URL.PROFILE}/${id}/status`, {
    status,
  });
  console.log(response);
  return response;
};

export const updateAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.patch(
    `${BASE_URL}${API_URL.OWN_PROFILE}/avatar`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

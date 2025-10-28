import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getCertificates = async () => {
  const response = await api.get(`${BASE_URL}${API_URL.CERTIFICATES}`);
  return response.data.data;
};

export const generateCertificate = async (comboEnrollmentId: string) => {
  const response = await api.post(`${BASE_URL}${API_URL.CERTIFICATES}/generate`, {
    combo_enrollment_id: comboEnrollmentId,
  });
  return response.data.data;
};


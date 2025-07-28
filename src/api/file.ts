import api from "@/utils/interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const uploadAvatar = async (file: File, id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.patch(`${BASE_URL}/profile/${id}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Image upload response:", response);
  return response.data;
};

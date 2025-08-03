import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IBlog, IBlogCreate } from "@/interface/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createBlog = async (data: IBlogCreate) => {
    const response = await api.post(
        `${BASE_URL}${API_URL.ADMIN_BLOG}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    console.log("Create blog response:", response);
    return response.data;
}
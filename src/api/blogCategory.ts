import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import {
  IBlogCategoryCreate,
  IBlogCategories,
  IBlogCategoryUpdate,
  IBlogCategory,
} from "@/interface/blogCategory";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getBlogCategories = async ({
  page,
}: {
  page: number;
}): Promise<IBlogCategories> => {
  const response = await api.get(
    `${BASE_URL}/blogs/category?page=${page}`
  );
  console.log(response);
  return response.data.data;
};

export const createBlogCategory = async (data: IBlogCategoryCreate) => {
  const response = await api.post(
    `${BASE_URL}${API_URL.ADMIN_BLOG_CATEGORY}`,
    data
  );
  console.log(response);
  return response.data;
};

export const updateBlogCategory = async (
  id: string,
  data: IBlogCategoryUpdate
) => {
  const response = await api.patch(
    `${BASE_URL}${API_URL.ADMIN_BLOG_CATEGORY}/${id}`,
    data
  );
  console.log(response);
  return response.data;
};

export const deleteBlogCategory = async (id: string) => {
  const response = await api.delete(
    `${BASE_URL}${API_URL.ADMIN_BLOG_CATEGORY}${id}`
  );
  console.log(response);
  return response.data;
};

export const getBlogCategoryById = async (id: string): Promise<IBlogCategory> => {
  const response = await api.get(`${BASE_URL}${API_URL.ADMIN_BLOG_CATEGORY}/${id}`);
  console.log(response);
  return response.data.data;
};

import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IBlog, IBlogCreate, IBlogs } from "@/interface/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createBlog = async (data: IBlogCreate) => {
  const response = await api.post(`${BASE_URL}${API_URL.ADMIN_BLOG}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Create blog response:", response);
  return response.data;
};

export const getBlogs = async ({ page }: { page: number }): Promise<IBlogs> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.ADMIN_BLOG}?page=${page}`
  );
  console.log("Get blogs response:", response);
  return response.data.data;
};

export const getDraftBlogs = async ({
  page,
}: {
  page: number;
}): Promise<IBlogs> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.ADMIN_BLOG}/draft?page=${page}`
  );
  console.log("Get draft blogs response:", response);
  return response.data.data;
};

export const getPublishedBlogs = async ({
  page,
}: {
  page: number;
}): Promise<IBlogs> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.ADMIN_BLOG}/published?page=${page}`
  );
  console.log("Get published blogs response:", response);
  return response.data.data;
};

export const getArchivedBlogs = async ({
  page,
}: {
  page: number;
}): Promise<IBlogs> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.ADMIN_BLOG}/archived?page=${page}`
  );
  console.log("Get archived blogs response:", response);
  return response.data.data;
};

export const getBlog = async (id: string): Promise<IBlog> => {
  const response = await api.get(`${BASE_URL}${API_URL.ADMIN_BLOG}/detail/${id}`);
  console.log("Get blog response:", response);
  return response.data.data;
};

export const publishBlog = async (id: string) => {
  const response = await api.patch(`${BASE_URL}${API_URL.ADMIN_BLOG}/${id}/publish`)
  console.log("Publish blog:", response)
  return response
}

export const archiveBlog = async (id: string) => {
  const response = await api.patch(`${BASE_URL}${API_URL.ADMIN_BLOG}/${id}/archive`)
  console.log("Archive blog:", response)
  return response
}

export const deleteBlog = async (id: string) => {
  const response = await api.delete(`${BASE_URL}${API_URL.ADMIN_BLOG}/${id}`)
  console.log("Delete blog:", response)
  return response
}
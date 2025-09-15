import api from "@/utils/interceptor";
import { IBlog, IBlogCreate, IBlogs, IBlogCategory, IBlogCategoryCreate, IBlogCategoryUpdate, IBlogUpdate } from "@/interface/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// PUBLIC APIs
export const getPublicBlogCategories = async (): Promise<IBlogCategory[]> => {
  const response = await api.get(`${BASE_URL}/blogs/category`);
  return response.data.data;
};

export const getPublicPublishedBlogs = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<IBlogs> => {
  const response = await api.get(`${BASE_URL}/blogs`, { params });
  return response.data.data;
};

export const getPublicBlogBySlug = async (id: string): Promise<IBlog> => {
  const response = await api.get(`${BASE_URL}/blogs/detail/${id}`);
  return response.data.data;
};

// TEACHER APIS 
export const createTeacherBlog = async (data: IBlogCreate) => {
  const response = await api.post(`${BASE_URL}/blogs/teacher`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Create teacher blog response:", response);
  return response.data;
};

export const getTeacherBlogs = async (teacherId: string, params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.status) queryParams.append('status', params.status);

  const response = await api.get(`${BASE_URL}/blogs/teacher/${teacherId}?${queryParams.toString()}`);
  console.log("Get teacher blogs response:", response);
  return response.data.data;
};

export const getTeacherBlogDetail = async (id: string): Promise<IBlog> => {
  const response = await api.get(`${BASE_URL}/blogs/teacher/detail/${id}`);
  console.log("Get teacher blog detail response:", response);
  return response.data.data;
};

export const updateTeacherBlog = async (id: string, data: IBlogUpdate) => {
  const response = await api.patch(`${BASE_URL}/blogs/teacher/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Update teacher blog response:", response);
  return response.data;
};

export const deleteTeacherBlog = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/blogs/teacher/${id}`);
  console.log("Delete teacher blog response:", response);
  return response.data;
};

// ADMIN APIS 

export const createBlogCategory = async (data: IBlogCategoryCreate) => {
  const response = await api.post(`${BASE_URL}/blogs/admin/category`, data);
  console.log("Create blog category response:", response);
  return response.data;
};

export const getBlogCategoryDetail = async (id: string): Promise<IBlogCategory> => {
  const response = await api.get(`${BASE_URL}/blogs/admin/category/${id}`);
  console.log("Get blog category detail response:", response);
  return response.data.data;
};

export const updateBlogCategory = async (id: string, data: IBlogCategoryUpdate) => {
  const response = await api.patch(`${BASE_URL}/blogs/admin/category/${id}`, data);
  console.log("Update blog category response:", response);
  return response.data;
};

export const deleteBlogCategory = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/blogs/admin/category/${id}`);
  console.log("Delete blog category response:", response);
  return response.data;
};

export const createBlogByAdmin = async (data: IBlogCreate) => {
  const response = await api.post(`${BASE_URL}/blogs/admin`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Create blog by admin response:", response);
  return response.data;
};

export const getAllBlogsForAdmin = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  author_id?: string;
}): Promise<IBlogs> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.author_id) queryParams.append('author_id', params.author_id);

  const response = await api.get(`${BASE_URL}/blogs/admin/?${queryParams.toString()}`);
  console.log("Get all blogs for admin response:", response);
  return response.data.data;
};

export const getDraftBlogs = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  author_id?: string;
}): Promise<IBlogs> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.author_id) queryParams.append('author_id', params.author_id);

  const response = await api.get(`${BASE_URL}/blogs/admin/draft?${queryParams.toString()}`);
  console.log("Get draft blogs response:", response);
  return response.data.data;
};

export const getPublishedBlogs = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  author_id?: string;
}): Promise<IBlogs> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.author_id) queryParams.append('author_id', params.author_id);

  const response = await api.get(`${BASE_URL}/blogs/admin/published?${queryParams.toString()}`);
  console.log("Get published blogs response:", response);
  return response.data.data;
};

export const getArchivedBlogs = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  author_id?: string;
}): Promise<IBlogs> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.author_id) queryParams.append('author_id', params.author_id);

  const response = await api.get(`${BASE_URL}/blogs/admin/archived?${queryParams.toString()}`);
  console.log("Get archived blogs response:", response);
  return response.data.data;
};

export const getBlogDetailForAdmin = async (id: string): Promise<IBlog> => {
  const response = await api.get(`${BASE_URL}/blogs/admin/detail/${id}`);
  console.log("Get blog detail for admin response:", response);
  return response.data.data;
};

export const publishBlog = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/blogs/admin/${id}/publish`);
  console.log("Publish blog response:", response);
  return response.data;
};

export const archiveBlog = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/blogs/admin/${id}/archive`);
  console.log("Archive blog response:", response);
  return response.data;
};

export const draftBlog = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/blogs/admin/${id}/draft`);
  console.log("Draft blog response:", response);
  return response.data;
};

export const updateBlogByAdmin = async (id: string, data: IBlogUpdate) => {
  const response = await api.patch(`${BASE_URL}/blogs/admin/${id}`, data);
  console.log("Update blog by admin response:", response);
  return response.data;
};

export const deleteBlogByAdmin = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/blogs/admin/${id}`);
  console.log("Delete blog by admin response:", response);
  return response.data;
};

export const createBlog = createBlogByAdmin;
export const getBlogs = getAllBlogsForAdmin;
export const getBlog = getBlogDetailForAdmin;


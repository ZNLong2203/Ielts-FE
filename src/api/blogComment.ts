import api from "@/utils/interceptor";
import { IBlogComment } from "@/interface/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createBlogComment = async (blogId: string, data: { content: string }) => {
  const response = await api.post(`${BASE_URL}/blogs/${blogId}/comments`, data);
  console.log("Create blog comment response:", response);
  return response.data;
};

export const createReplyInComment = async (
  blogId: string, 
  commentId: string, 
  data: { content: string }
) => {
  const response = await api.post(`${BASE_URL}/blogs/${blogId}/comments/${commentId}/reply`, data);
  console.log("Create reply comment response:", response);
  return response.data;
};

export const getBlogComments = async (blogId: string): Promise<IBlogComment[]> => {
  const response = await api.get(`${BASE_URL}/blogs/${blogId}/comments`);
  console.log("Get blog comments response:", response);
  return response.data.data;
};

export const getCommentReplies = async (blogId: string, commentId: string): Promise<IBlogComment[]> => {
  const response = await api.get(`${BASE_URL}/blogs/${blogId}/comments/${commentId}/replies`);
  console.log("Get comment replies response:", response);
  return response.data.data;
};

export const deleteBlogComment = async (blogId: string, commentId: string) => {
  const response = await api.delete(`${BASE_URL}/blogs/${blogId}/comments/${commentId}`);
  console.log("Delete blog comment response:", response);
  return response.data;
};

import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { ICourseCategories, ICourseCategory, ICourseCategoryCreate, ICourseCategoryUpdate } from "@/interface/courseCategory";

export const getCourseCategories = async ({page}: {page: number}): Promise<ICourseCategories> => {
    const response = await api.get(`${API_URL.COURSE_CATEGORIES}?page=${page}`);
    console.log(response)
    return response.data.data;
};

export const getCourseCategory = async (id: string): Promise<ICourseCategory> => {
    const response = await api.get(`${API_URL.COURSE_CATEGORIES}/${id}`);
    return response.data.data;
};

export const createCourseCategory = async (data: ICourseCategoryCreate) => {
    const response = await api.post(API_URL.COURSE_CATEGORIES, data);
    return response.data;
};

export const updateCourseCategory = async (id: string, data: ICourseCategoryUpdate) => {
    const response = await api.patch(`${API_URL.COURSE_CATEGORIES}/${id}`, data);
    return response.data;
};

export const deleteCourseCategory = async (id: string) => {
    const response = await api.delete(`${API_URL.COURSE_CATEGORIES}/${id}`);
    return response.data;
};

import api from "@/utils/interceptor"
import { ICourseQuestion, ICourseQuestionCreate, ICourseQuestionUpdate } from "@/interface/courseQuestion"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const createCourseQuestion = async (lessonId: string, exerciseId: string, data: ICourseQuestionCreate) => {
    const response = await api.post(
        `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/question`,
        data
    )
    return response.data.data
}

export const uploadCourseQuestionImage = async (lessonId: string, exerciseId: string, questionId: string, formData: FormData) => {
    const response = await api.post(
        `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/question/${questionId}/image`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
    return response.data.data
}

export const uploadCourseQuestionAudio = async (lessonId: string, exerciseId: string, questionId: string, formData: FormData) => {
    const response = await api.post(
        `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/question/${questionId}/audio`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
    return response.data.data
}

export const updateCourseQuestion = async (lessonId: string, exerciseId: string, questionId: string, data: ICourseQuestionUpdate) => {
    const response = await api.put(
        `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/question/${questionId}`,
        data
    )
    return response.data.data
}

export const deleteCourseQuestion = async (lessonId: string, exerciseId: string, questionId: string) => {
    const response = await api.delete(
        `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/question/${questionId}`
    )
    return response.data.data
}   

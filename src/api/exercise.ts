import api from "@/utils/interceptor"
import {
    IExercise,
    IExerciseCreate,
    IExerciseUpdate,
} from "@/interface/exercise"
import { API_URL } from "@/constants/api"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Get all exercises for a specific lesson
export const getExercisesByLessonId = async (lessonId: string): Promise<IExercise[]> => {
    const response = await api.get(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}`
    )
    return response.data.data.data
}

// Get a exercise for a specific lesson
export const getExerciseByLessonId = async (
    lessonId: string, exerciseId: string
): Promise<IExercise> => {
    const response = await api.get(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}`
    )
    return response.data.data.data
}

// Create a new exercise
export const createExercise = async (
    data: IExerciseCreate,
    lessonId: string
): Promise<IExercise> => {
    const response = await api.post(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}`,
        data
    )
    // Response structure: { statusCode, message, data: { success: true, data: exercise } }
    // Return the actual exercise object
    if (response.data?.data?.data) {
        return response.data.data.data;
    }
    // Fallback: if response.data.data is directly the exercise
    if (response.data?.data?.id) {
        return response.data.data;
    }
    // Last fallback
    return response.data.data;
}

// Update an exercise
export const updateExercise = async (
    data: IExerciseUpdate,
    exerciseId: string,
    lessonId: string
): Promise<IExercise> => {
    const response = await api.put(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}`,
        data
    )
    return response.data.data
}

// Delete an exercise
export const deleteExercise = async (lessonId: string, exerciseId: string) => {
    const response = await api.delete(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}`
    )
    return response.data
}

// Submit exercise answers
export const submitExercise = async (
    lessonId: string,
    exerciseId: string,
    answers: Record<string, string | string[] | null>,
    timeTaken?: number
) => {
    const response = await api.post(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}/submit`,
        {
            exerciseId,
            answers,
            timeTaken,
        }
    )
    return response.data.data
}

export const getExerciseSubmission = async (
    lessonId: string,
    exerciseId: string
) => {
    const response = await api.get(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}/submission`
    )
    return response.data.data?.data || response.data.data
}
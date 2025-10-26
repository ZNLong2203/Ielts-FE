import api from "@/utils/interceptor"
import {
    IExercise,
    IExerciseCreate,
    IExercises,
    IExerciseUpdate,
} from "@/interface/exercise"
import { API_URL } from "@/constants/api"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Get a exercise for a specific lesson
export const getExerciseByLessonId = async (
    lessonId: string, exerciseId: string
): Promise<IExercises> => {
    const response = await api.get(
        `${BASE_URL}${API_URL.LESSONS}/${lessonId}${API_URL.EXERCISES}/${exerciseId}`
    )
    return response.data.data
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
    return response.data.data
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
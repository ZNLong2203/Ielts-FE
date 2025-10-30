import api from "@/utils/interceptor"
import { ICourseQuestion, ICourseQuestionUpdate } from "@/interface/courseQuestion"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const getCourseQuestionsByCourseId = async (courseId: string): Promise<ICourseQuestion[]> => {
    const response = await api.get(
        `${BASE_URL}/courses/${courseId}/questions`
    )
    return response.data.data.data
}


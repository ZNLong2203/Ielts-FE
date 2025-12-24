import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";
import { IMockTests, IMockTestCreate, IMockTest, IMockTestUpdate } from "@/interface/mockTest";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getMockTests = async ({page, status}: {page: number, status?: string}): Promise<IMockTests> => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}`, {
        params: {
            page,
            ...(status && { status })
        }
    });
    return response.data.data;
}

export const createMockTest = async (data: IMockTestCreate): Promise<IMockTest> => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}`, data);
    return response.data.data;
}

export const getMockTest = async (id: string): Promise<IMockTest> => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`);
    return response.data.data.data;
}

export const updateMockTest = async (id: string, data: IMockTestUpdate): Promise<IMockTest> => {
    const response = await api.patch(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`, data);
    return response.data.data;
}

export const deleteMockTest = async (id: string) => {
    const response = await api.delete(`${BASE_URL}${API_URL.MOCK_TESTS}/${id}`);
    return response.data.data;
}

export const startMockTest = async (testId: string) => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}/${testId}/start`);
    const responseData = response.data.data;
    if (responseData?.success && responseData?.data) {
        return responseData.data;
    }
    if (responseData?.data) {
        return responseData.data;
    }
    return responseData;
}

export interface TestAnswerSubmission {
    question_id: string;
    user_answer: {
        fill_blank_answers?: string;
        multiple_choice_answers?: string[];
        true_false_answers?: string;
        matching_answers?: string;
        essay_answers?: string;
    };
}

export interface TestSectionSubmission {
    test_result_id: string;
    test_section_id: string;
    time_taken: number; // in seconds
    answers: TestAnswerSubmission[];
    speaking_audio_data?: Array<{
        question_id: string;
        audio_url: string;
        question_text: string;
    }>; // For speaking section - audio URLs and question texts
    grading_method?: 'ai' | 'teacher'; // For writing section - choose AI or teacher grading
}

export const submitSectionAnswers = async (data: TestSectionSubmission) => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}/submit-section`, data);
    const responseData = response.data.data;
    if (responseData?.data) {
        return { data: responseData.data };
    }
    return { data: responseData || response.data };
}

export const getTestResult = async (resultId: string) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/results/${resultId}`);
    return response.data.data;
}

export const getTestResultReview = async (resultId: string) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/results/${resultId}/review`);
    // Response structure: 
    // response.data = {statusCode: 200, message: "...", data: {success: true, data: {...testResult}}}
    // response.data.data = {success: true, data: {...testResult}}
    // response.data.data.data = {...testResult, section_results: ...}  // Actual data
    const result = response.data?.data?.data || response.data?.data || response.data;
    console.log('getTestResultReview - result:', result);
    console.log('getTestResultReview - result.section_results:', result?.section_results);
    return result;
}

export const getUserTestHistory = async (params?: { page?: number; limit?: number }) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/results/history`, {
        params
    });
    return response.data.data;
}

// Teacher grading APIs
export interface PendingWritingSubmission {
    id: string;
    test_result_id: string;
    test_section_id: string;
    created_at: string;
    test_results: {
        id: string;
        users: {
            id: string;
            full_name: string;
            email: string;
        };
        mock_tests: {
            id: string;
            title: string;
            test_type: string;
        };
    };
    test_sections: {
        id: string;
        section_name: string;
        section_type: string;
        duration: number;
    };
}

export interface GradedWritingSubmission extends PendingWritingSubmission {
    band_score: number | null;
    teacher_score: number | null;
    graded_at: string;
    graded_by: string | null;
    users?: {
        id: string;
        full_name: string;
        email: string;
    };
}

export interface WritingSubmissionDetail extends PendingWritingSubmission {
    band_score?: number | null;
    teacher_score?: number | null;
    teacher_feedback?: string | null;
    graded_at?: string | null;
    graded_by?: string | null;
    detailed_answers: {
        tasks: Array<{
            task_type: 'task_1' | 'task_2';
            question_id: string;
            question_text: string;
            student_answer: string;
            image_url?: string;
            word_count: number;
            overall_score?: number;
            task_achievement_score?: number;
            coherence_cohesion_score?: number;
            lexical_resource_score?: number;
            grammatical_range_accuracy_score?: number;
            detailed_feedback?: string;
        }>;
        overallScore?: number;
        teacher_feedback?: string;
    };
    test_sections: {
        exercises: Array<{
            id: string;
            title: string;
            instruction?: string;
            question_groups: Array<{
                id: string;
                group_title?: string;
                group_instruction?: string;
                questions: Array<{
                    id: string;
                    question_text: string;
                }>;
            }>;
        }>;
    };
}

export interface SubmitGradingDto {
    task1_score: number;
    task1_task_achievement?: number;
    task1_coherence_cohesion?: number;
    task1_lexical_resource?: number;
    task1_grammatical_range_accuracy?: number;
    task1_feedback?: string;
    task2_score: number;
    task2_task_achievement?: number;
    task2_coherence_cohesion?: number;
    task2_lexical_resource?: number;
    task2_grammatical_range_accuracy?: number;
    task2_feedback?: string;
    general_feedback?: string;
}

export const getPendingWritingSubmissions = async (params?: { page?: number; limit?: number }) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/writing/pending`, {
        params
    });
    console.log("[API] getPendingWritingSubmissions raw response:", response.data);

    const innerData = response.data.data;
    if (innerData?.success && innerData?.data) {
        // Nested structure: { success: true, data: { items, pagination } }
        return innerData.data;
    }
    return innerData;
}

export const getGradedWritingSubmissions = async (params?: { page?: number; limit?: number }) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/writing/graded`, {
        params
    });
    console.log("[API] getGradedWritingSubmissions raw response:", response.data);

    const innerData = response.data.data;
    if (innerData?.success && innerData?.data) {
        return innerData.data;
    }
    return innerData;
}

export const getWritingSubmissionForGrading = async (sectionResultId: string) => {
    const response = await api.get(`${BASE_URL}${API_URL.MOCK_TESTS}/writing/${sectionResultId}`);
    console.log("[API] getWritingSubmissionForGrading raw response:", response.data);
    const innerData = response.data.data;
    if (innerData?.success && innerData?.data) {
        return innerData.data;
    }
    return innerData;
}

export const submitWritingGrading = async (sectionResultId: string, gradingDto: SubmitGradingDto) => {
    const response = await api.post(`${BASE_URL}${API_URL.MOCK_TESTS}/writing/${sectionResultId}/grade`, gradingDto);
    return response.data.data;
}
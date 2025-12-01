import api from "@/utils/interceptor";
import { API_URL } from '@/constants/api';

export interface GradeWritingDto {
  studentAnswer: string;
  question: string;
  taskType: 'task_1' | 'task_2';
  wordLimit?: string;
  additionalInstructions?: string;
}

export interface WritingGradeResponse {
  overallScore: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  detailedFeedback: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  
  // Detailed metrics
  detailedMetrics?: {
    task1?: {
      score: number;
      taskAchievement: number;
      coherenceCohesion: number;
      lexicalResource: number;
      grammaticalRangeAccuracy: number;
      scoreDescription: string;
      criteriaBreakdown: {
        addressingAllParts?: { score: number; level: string; feedback: string };
        comparisons?: { score: number; level: string; feedback: string };
        progression?: { score: number; level: string; feedback: string };
        linkingDevices?: { score: number; level: string; feedback: string };
        paragraphing?: { score: number; level: string; feedback: string };
        vocabularyRange?: { score: number; level: string; feedback: string };
        wordFormation?: { score: number; level: string; feedback: string };
        grammarVariety?: { score: number; level: string; feedback: string };
        accuracy?: { score: number; level: string; feedback: string };
      };
      collocations?: Array<{ phrase: string; context: string }>;
      topicSpecificWords?: string[];
      lexicalErrors?: Array<{ original: string; corrected: string; context: string }>;
      grammaticalErrors?: Array<{ original: string; corrected: string; context: string }>;
      repetitiveWords?: string[];
      improvements?: string[];
    };
    task2?: {
      score: number;
      taskResponse: number;
      coherenceCohesion: number;
      lexicalResource: number;
      grammaticalRangeAccuracy: number;
      scoreDescription: string;
      criteriaBreakdown: {
        addressingAllParts?: { score: number; level: string; feedback: string };
        position?: { score: number; level: string; feedback: string };
        progression?: { score: number; level: string; feedback: string };
        linkingDevices?: { score: number; level: string; feedback: string };
        paragraphing?: { score: number; level: string; feedback: string };
        vocabularyRange?: { score: number; level: string; feedback: string };
        wordFormation?: { score: number; level: string; feedback: string };
        grammarVariety?: { score: number; level: string; feedback: string };
        accuracy?: { score: number; level: string; feedback: string };
      };
      collocations?: Array<{ phrase: string; context: string }>;
      topicSpecificWords?: string[];
      lexicalErrors?: Array<{ original: string; corrected: string; context: string }>;
      grammaticalErrors?: Array<{ original: string; corrected: string; context: string }>;
      repetitiveWords?: string[];
      improvements?: string[];
    };
  };
  
  upgradedEssay?: string;
  sampleAnswer?: string;
  taskType?: 'task_1' | 'task_2';
  question?: string;
  studentAnswer?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const gradeWritingByGemini = async (data: GradeWritingDto): Promise<WritingGradeResponse> => {
  const response = await api.post(`${BASE_URL}${API_URL.WRITING}/grade`, data);
  return response.data.data;
};

export interface SaveWritingAssessmentDto {
  exerciseId?: string;
  taskType: 'task_1' | 'task_2';
  question: string;
  studentAnswer: string;
  wordLimit?: string;
  additionalInstructions?: string;
  overallScore: number;
  taskAchievementScore: number;
  coherenceCohesionScore: number;
  lexicalResourceScore: number;
  grammaticalRangeAccuracyScore: number;
  detailedFeedback: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  detailedMetrics?: unknown;
  upgradedEssay?: string;
  sampleAnswer?: string;
  aiModel?: string;
}

export interface WritingAssessmentResponse {
  id: string;
  userId: string;
  exerciseId?: string;
  taskType: string;
  question: string;
  studentAnswer: string;
  wordLimit?: string;
  additionalInstructions?: string;
  overallScore: number;
  taskAchievementScore: number;
  coherenceCohesionScore: number;
  lexicalResourceScore: number;
  grammaticalRangeAccuracyScore: number;
  detailedFeedback: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  detailedMetrics?: unknown;
  upgradedEssay?: string;
  sampleAnswer?: string;
  aiModel?: string;
  gradingMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const saveWritingAssessment = async (data: SaveWritingAssessmentDto): Promise<WritingAssessmentResponse> => {
  const response = await api.post(`${BASE_URL}${API_URL.WRITING}/save-assessment`, data);
  return response.data.data;
};

export const getMyWritingAssessments = async (exerciseId?: string, taskType?: string): Promise<WritingAssessmentResponse[]> => {
  const params = new URLSearchParams();
  if (exerciseId) params.append('exerciseId', exerciseId);
  if (taskType) params.append('taskType', taskType);
  
  const url = `${BASE_URL}${API_URL.WRITING}/my-assessments${params.toString() ? '?' + params.toString() : ''}`;
  const response = await api.get(url);
  return response.data.data;
};

export const getWritingAssessmentById = async (id: string): Promise<WritingAssessmentResponse | null> => {
  const response = await api.get(`${BASE_URL}${API_URL.WRITING}/assessment/${id}`);
  return response.data.data;
};

// Mock Test Exercise APIs
export interface IWritingMockTestExercise {
  id: string;
  title: string;
  instruction?: string;
  test_section_id: string;
  task_type?: 'task_1' | 'task_2';
  question_type?: 'essay' | 'letter' | 'report' | 'discursive';
  question_text?: string;
  question_image?: string;
  question_chart?: string;
  word_limit?: number;
  time_limit?: number;
  passing_score?: number;
  ordering?: number;
  keywords?: string[];
  sample_answers?: string[];
  writing_content?: {
    taskType?: string;
    questionType?: string;
    questionText?: string;
    questionImage?: string;
    questionChart?: string;
    wordLimit?: number;
    keywords?: string[];
    sampleAnswers?: string[];
  };
  question_groups?: Array<{
    id: string;
    group_title?: string;
    group_instruction?: string;
    image_url?: string;
    question_type: string;
    questions?: Array<{
      id: string;
      question_text: string;
      question_type: string;
      image_url?: string;
    }>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface IWritingMockTestExerciseCreate {
  test_section_id: string;
  title: string;
  instruction?: string;
  task_type: 'task_1' | 'task_2';
  question_type: 'essay' | 'letter' | 'report' | 'discursive';
  question_text: string;
  question_image?: string;
  question_chart?: string;
  word_limit?: number;
  time_limit?: number;
  passing_score?: number;
  ordering?: number;
  keywords?: string[];
  sample_answers?: string[];
}

export interface IWritingMockTestExerciseUpdate extends Partial<IWritingMockTestExerciseCreate> {}

export interface IWritingMockTestExerciseList {
  test_section: {
    id: string;
    section_name: string;
    mock_test: {
      id: string;
      title: string;
      test_type: string;
    };
  };
  exercises: IWritingMockTestExercise[];
}

export const getWritingExercisesBySection = async (
  testSectionId: string
): Promise<IWritingMockTestExerciseList> => {
  const response = await api.get(
    `${BASE_URL}${API_URL.WRITING}/test-section/${testSectionId}`
  );
  return response.data.data;
};

export const getWritingMockTestExercise = async (
  id: string
): Promise<IWritingMockTestExercise> => {
  const response = await api.get(`${BASE_URL}${API_URL.WRITING}/mock-test/${id}`);
  return response.data.data;
};

export const createWritingMockTestExercise = async (
  data: IWritingMockTestExerciseCreate
): Promise<IWritingMockTestExercise> => {
  const response = await api.post(`${BASE_URL}${API_URL.WRITING}/mock-test`, data);
  return response.data.data;
};

export const updateWritingMockTestExercise = async (
  id: string,
  data: IWritingMockTestExerciseUpdate
) => {
  const response = await api.put(`${BASE_URL}${API_URL.WRITING}/mock-test/${id}`, data);
  return response.data.data;
};

export const deleteWritingMockTestExercise = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${API_URL.WRITING}/mock-test/${id}`);
};

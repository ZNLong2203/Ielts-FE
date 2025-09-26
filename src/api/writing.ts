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
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const gradeWritingByGemini = async (data: GradeWritingDto): Promise<WritingGradeResponse> => {
  const response = await api.post(`${BASE_URL}${API_URL.WRITING}/grade`, data);
  return response.data.data;
};

import api from "@/utils/interceptor";
import { API_URL } from '@/constants/api';

export type SpeakingPart = 'part_1' | 'part_2' | 'part_3';

export interface SpeakingQuestion {
  question: string;
  context?: string;
}

export interface GradeSpeakingDto {
  studentAnswer: string;
  partType: SpeakingPart;
  questions: SpeakingQuestion[];
  additionalInstructions?: string;
  targetDuration?: string;
}

export interface SpeakingGradeResponse {
  overallScore: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  pronunciation: number;
  detailedFeedback: string;
  partResponse?: {
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRangeAccuracy: number;
    pronunciation: number;
    feedback: string;
  };
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface TranscribeAndGradeResponse {
  audioUrl: string;
  transcription: string;
  grading: SpeakingGradeResponse;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const gradeSpeakingByGemini = async (data: GradeSpeakingDto): Promise<SpeakingGradeResponse> => {
  const response = await api.post(`${BASE_URL}${API_URL.SPEAKING}/grade`, data);
  return response.data.data;
};

export const uploadAndTranscribe = async (audioFile: File): Promise<{uploadResult: any; transcription: string}> => {
  const formData = new FormData();
  formData.append('file', audioFile);
  
  const response = await api.post(`${BASE_URL}${API_URL.SPEAKING}/upload-and-transcribe`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

export const transcribeAndGrade = async (
  audioFile: File,
  data: {
    partType: SpeakingPart;
    questions: SpeakingQuestion[];
    additionalInstructions?: string;
    targetDuration?: string;
  }
): Promise<TranscribeAndGradeResponse> => {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('partType', data.partType);
  formData.append('questions', JSON.stringify(data.questions));
  
  if (data.additionalInstructions) {
    formData.append('additionalInstructions', data.additionalInstructions);
  }
  
  if (data.targetDuration) {
    formData.append('targetDuration', data.targetDuration);
  }
  
  const response = await api.post(`${BASE_URL}${API_URL.SPEAKING}/transcribe-and-grade`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};


export interface IMockTestQuestionOption {
    option_text: string;
    is_correct: boolean;
    ordering: number;
    explanation: string;
}

export interface IMockTestQuestion {
    id: string;
    question_group_id: string;
    question_group: string;
    question_type: string;
    question_text: string;
    reading_passage?: string;
    correct_answer: string;
    alternate_answers?: string[];
    points: number;
    ordering: number;
    difficulty_level: number;
    explanation?: string;
    image_url?: string;
    audio_url?: string;
    audio_duration?: number;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface IMockTestQuestionCreate {
    question_group_id: string;
    question_text: string;
    question_type: string;
    reading_passage?: string;
    correct_answer: string;
    alternate_answers?: string[];
    points: number;
    ordering: number;
    difficulty_level: number;
    explanation?: string;
    options: IMockTestQuestionOption[];
    media_url?: File;
}

export interface IMockTestQuestionUpdate {
    question_group_id?: string;
    question_text?: string;
    question_type?: string;
    reading_passage?: string;
    correct_answer?: string;
    alternate_answers?: string[];
    points?: number;
    ordering?: number;
    difficulty_level?: number;
    explanation?: string;
    options?: IMockTestQuestionOption[];
    media_url?: File | null;
}
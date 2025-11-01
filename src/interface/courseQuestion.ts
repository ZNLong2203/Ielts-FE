export interface ICourseQuestionCreate {
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    points: string;
    order_index: number;
    media_url: File
}

export interface ICourseQuestionUpdate {
    question_text?: string;
    question_type?: string;
    points?: string;
    options?: string[];
    correct_answer?: string;
    media_url?: File;
}

export interface ICourseQuestion {
    id: string;
    exercise_id: string;
    question_text: string;
    question_type: string;
    image_url?: string;
    audio_url?: string;
    explanation?: string;
    audio_duration?: number;
    deleted: boolean;
    difficulty_level: string;
    reading_passage: string;
    question_group: string;
    question_group_id: string;
    question_options: string[];
    correct_answer: string;
    points: string;
    ordering: number;
    created_at: Date;
    updated_at: Date;
}
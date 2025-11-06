export interface ICourseQuestionCreate {
    question_text: string;
    question_type: string;
    options: ICourseQuestionOption[];
    difficulty_level: number;
    explanation: string;
    correct_answer: string;
    points: string;
    ordering: number;
    media_url: File
}

export interface ICourseQuestionUpdate {
    question_text?: string;
    question_type?: string;
    points?: string;
    difficulty_level?: number;
    explanation?: string;
    options?: ICourseQuestionOption[];
    correct_answer?: string;
    ordering?: number;
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
    question_options: ICourseQuestionOption[];
    correct_answer: string;
    points: string;
    ordering: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICourseQuestionOption {
    deleted?: boolean;
    explanation?: string;
    id?: string;
    is_correct?: boolean;    
    option_text?: string;
    ordering?: number;
    point?: string;
}
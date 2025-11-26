export interface IQuestionList {
    exercise_info: {
        exercise_type: string,
        id: string,
        skill_type: string,
        title: string,
    }
    questions: any,
    total_questions: number,
    total_points: number,
    ungrouped_questions: any,
}

export interface IQuestionOption {
    id?: string;
    option_text: string;
    is_correct: boolean;
    ordering: number;
    point: number;
    explanation: string;
    matching_option_id?: string;
}

export interface IQuestionOptionCreate {
    option_text: string;
    is_correct: boolean;
    ordering: number;
    point: number;
    explanation: string;
}

export interface IQuestionCreate {
    question_group_id: string;
    question_type: string;
    question_text: string;
    reading_passage: string;
    options: IQuestionOptionCreate[];
    correct_answer: string;
    alternative_answers: string[];
    points: number;
    ordering: number;
    difficulty_level: number;
    question_group: string;
    explanation: string;
}

export interface IQuestionUpdate {
    question_group_id?: string;
    question_type?: string;
    question_text?: string;
    reading_passage?: string;
    options?: IQuestionOptionCreate[];
    correct_answer?: string;
    alternative_answers?: string[];
    points?: number;
    ordering?: number;
    difficulty_level?: number;
    question_group?: string;
    explanation?: string;
}

export interface IQuestionDetail {
    id: string;
    exercise_id: string;
    explanation: string;
    group: {
        id: string;
        group_title: string;
        question_type: string;
    }
    options: IQuestionOption[];
    ordering: number;
    points: number;
    question_text: string;
    question_type: string;
    reading_passage: string;
    difficulty_level: string;
    audio_url: string;
}

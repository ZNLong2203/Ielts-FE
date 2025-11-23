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
    options: IQuestionOption[];
    correct_answer: string;
    alternate_answers: string[];
    points: number;
    ordering: number;
    difficulty_level: string;
    question_group: string;
    explanation: string;
    image_url?: string;
    audio_url?: string;
}
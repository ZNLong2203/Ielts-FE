export interface IMatchingOption {
    option_text: string;
    ordering: number;
}

export interface IQuestionGroup {
    id: string;
    exercise_id: string;
    group_title: string;
    group_instructions: string;
    passage_reference: string;
    question_type: string;
    question_range: string;
    correct_answer_count: number;
    ordering: number;
    image_url?: string;
    matching_options?: IMatchingOption[];
}

export interface IQuestionGroupCreate {
    exercise_id: string;
    group_title: string;
    group_instructions: string;
    passage_reference: string;
    question_type: string;
    question_range: string;
    correct_answer_count: number;
    ordering: number;
    matching_options?: IMatchingOption[];
}

export interface IQuestionGroupUpdate {
    group_title?: string;
    group_instructions?: string;
    passage_reference?: string;
    question_type?: string;
    question_range?: string;
    correct_answer_count?: number;
    ordering?: number;
    matching_options?: IMatchingOption[];
}
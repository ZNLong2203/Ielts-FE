export interface IMatchingOption {
    option_text: string;
    ordering: number;
}

export interface IQuestionGroup {
    id: string;
    exercise_id: string;
    group_title: string;
    group_instruction: string;
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
    group_instruction: string;
    passage_reference: string;
    question_type: string;
    question_range: string;
    correct_answer_count: number;
    ordering: number;
    matching_options?: IMatchingOption[];
}

export interface IQuestionGroupUpdate {
    group_title?: string;
    group_instruction?: string;
    passage_reference?: string;
    question_type?: string;
    question_range?: string;
    correct_answer_count?: number;
    ordering?: number;
    matching_options?: IMatchingOption[];
}

export interface IQuestionGroupList {
    exercise_info: {
        exercise_type: string,
        id: string,
        skill_type: string,
        title: string,
    }
    groups: any,
    total_groups: number,
}
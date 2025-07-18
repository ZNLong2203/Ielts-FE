
export interface IStudent {
    id: string;
    user_id?: string;
    bio?: string;
    target_ielts_score?: number;
    current_level?: string;
    learning_goals?: string[];
    timezone?: string;
    language_preference?: string;
    deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface IStudentUpdate {
    bio?: string;
    target_ielts_score?: number;
    current_level?: string;
    learning_goals?: string[];
    timezone?: string;
    language_preference?: string;
}

export interface IProfile {
    id: string;
    user_id: string;
    full_name?: string;
    avatar?: string
    phone?: string;
    date_of_birth?: Date;
    gender?: string;
    bio?: string;
    country?: string;
    city?: string;
    target_ielts_score?: number;
    current_level?: string;
    timezone?: string;
    language_preferences?: string;
    learning_goals?: string[];
    privacy_settings?: JSON;
    created_at?: Date;
    updated_at?: Date;

}
import { IUser } from "./user";

export interface IProfile {
    id: String;
    user_id: String;
    full_name?: String;
    avatar?: String
    phone?: String;
    date_of_birth?: Date;
    gender?: String;
    bio?: String;
    country?: String;
    city?: String;
    target_ielts_score?: Number;
    current_level?: String;
    timezone?: String;
    language_preferences?: String;
    learning_goals?: String[];
    privacy_settings?: JSON;
    created_at?: Date;
    updated_at?: Date;

}
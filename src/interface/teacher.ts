import { IUser } from './user';

export interface ITeacher {
    id: String;
    user_id: String;
    qualification?: String;
    experience_years?: Number;
    specializations: String[];
    ielts_band_score?: Number;
    certification_urls: String[];
    teaching_style?: String;
    hourly_rate?: Number;
    availability?: {
        days: String[];
        timeSlots: String[];
    };
    ratings?: Number;
    total_students?: Number;
    total_courses?: Number;
    is_verified?: Boolean;
}


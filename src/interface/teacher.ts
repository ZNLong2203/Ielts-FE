
export interface ITeacher {
    id: string;
    user_id?: string;
    qualification?: string;
    experience_years?: number;
    specializations?: string[];
    ielts_band_score?: number;
    certification_urls: string[];
    teaching_style?: string;
    hourly_rate?: number;
    availability?: {
        days: string[];
        timeSlots: string[];
    };
    ratings?: number;
    total_students?: number;
    total_courses?: number;
    is_verified?: boolean;
    status?: string;
    deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}


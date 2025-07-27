
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
        [key: string]: string[]; // e.g., { monday: ["9:00-10:00", "10:00-11:00"] }
    }
    ratings?: number;
    total_students?: number;
    total_courses?: number;
    is_verified?: boolean;
    status?: string;
    deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface ITeacherUpdate {
    qualification?: string;
    experience_years?: number;
    specializations?: string[];
    ielts_band_score?: number;
    teaching_style?: string;
    hourly_rate?: number;
}
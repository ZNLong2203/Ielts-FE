

export interface IStudent {
    id: string;
    user_id?: string;
    bio?: string;
    target_ielts_score?: number;
    current_level?: number;
    learning_goals?: string[];
    language_preference?: string;
    deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface IStudentUpdate {
    bio?: string;
    target_ielts_score?: number;
    current_level?: number;
    learning_goals?: string[];
    language_preference?: string;
}

// Student Dashboard Types
export interface IStudentDashboard {
    student: {
        id: string;
        full_name: string;
        email: string;
        avatar?: string;
        current_level?: number;
        target_ielts_score?: number;
        learning_goals?: string[];
    };
    stats: {
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
        averageProgress: number;
    };
    comboEnrollments: IComboEnrollment[];
    courseEnrollments: ICourseEnrollment[];
}

export interface IComboEnrollment {
    id: string;
    enrollment_date: Date;
    overall_progress_percentage: number;
    is_active: boolean;
    combo: {
        id: string;
        name: string;
        description: string;
        thumbnail?: string;
        original_price: number;
        combo_price: number;
        discount_percentage: number;
        enrollment_count: number;
        tags: string[];
        total_courses: number;
        completed_courses: number;
    };
    courses: IEnrolledCourse[];
}

export interface ICourseEnrollment {
    id: string;
    enrollment_date: Date;
    progress_percentage: number;
    completion_date?: Date;
    is_active: boolean;
    course: IEnrolledCourse;
}

export interface IEnrolledCourse {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    skill_focus?: string;
    difficulty_level?: string;
    estimated_duration?: number;
    price: number;
    discount_price?: number;
    rating?: number;
    rating_count?: number;
    enrollment_count?: number;
    teacher?: string;
    teacher_avatar?: string;
    category?: string;
    category_icon?: string;
    progress: number;
    total_lessons: number;
    completed_lessons: number;
    is_completed: boolean;
}

export interface ICertificate {
    id: string;
    title: string;
    description: string;
    certificate_url: string;
    issued_at: Date;
    progress: number;
    thumbnail?: string;
}

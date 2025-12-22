export interface ICourseStudentProgressItem {
  enrollment_id: string;
  enrolled_at: string;
  is_active: boolean;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar?: string | null;
  };
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  status: "not_started" | "in_progress" | "completed";
  last_activity: string | null;
}

export interface ICourseStudentProgressResponse {
  success: boolean;
  data: {
    course: {
      id: string;
      title: string;
      thumbnail?: string | null;
      skill_focus?: string | null;
      difficulty_level?: string | null;
    };
    meta: {
      current: number;
      currentSize: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    students: ICourseStudentProgressItem[];
  };
}



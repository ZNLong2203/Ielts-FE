export interface ICourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  skill_focus: string;
  difficulty_level: string;
  estimated_duration: number;
  price: number;
  discount_price?: number;
  is_featured: boolean;
  requirements: string[];
  what_you_learn: string[];
  course_outline: CourseOutline;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CourseOutline {
  sections: CourseSection[];
}

export interface CourseSection {
  title: string;
  lessons: string[];
}

export interface ICourses {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: ICourse[];
}

export interface CourseCategory {
  name: string;
  icon: string;
  id: string;
}

export interface ICourseCreate {
  title: string;
  description: string;
  category_id: string;
  skill_focus: string;
  difficulty_level: string;
  estimated_duration: number;
  price: number;
  discount_price?: number;
  is_featured: boolean;
  requirements: string[];
  what_you_learn: string[];
  course_outline: CourseOutline;
  tags: string[];
}

export interface ICourseUpdate {
  title?: string;
  description?: string;
  teacher_id?: string;
  category_id?: string;
  skill_focus?: string;
  difficulty_level?: string;
  estimated_duration?: number;
  price?: number;
  discount_price?: number;
  is_featured?: boolean;
  requirements?: string[];
  what_you_learn?: string[];
  course_outline?: CourseOutline;
  tags?: string[];
}

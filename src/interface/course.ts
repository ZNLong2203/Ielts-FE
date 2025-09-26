import { ISection } from "./section";

export interface ICourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  skill_focus: string;
  difficulty_level: string;
  estimated_duration: number;
  price: string;
  discount_price?: string;
  is_featured: boolean;
  requirements: string[];
  what_you_learn: string[];
  course_outline: CourseOutline;
  sections: ISection[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CourseOutline {
  sections: CourseSection[];
}

export interface CourseSection {
  title?: string;
  lessons?: string[];
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
  price: string;
  discount_price?: string;
  is_featured: boolean;
  requirements: string[];
  what_you_learn: string[];
  // course_outline: CourseOutline;
  tags: string[];
}

export interface ICourseUpdate {
  title?: string;
  description?: string;
  category_id?: string;
  skill_focus?: string;
  difficulty_level?: string;
  estimated_duration?: number;
  price?: string;
  discount_price?: string;
  is_featured?: boolean;
  requirements?: string[];
  what_you_learn?: string[];
  // course_outline?: CourseOutline;
  tags?: string[];
}

// Combo Course Interfaces
export interface IComboCourse {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  original_price: string;
  combo_price: string;
  discount_percentage: string;
  course_ids: string[];
  enrollment_count: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  // Additional fields for frontend display
  courses?: ICourse[];
  total_duration?: number;
  total_lessons?: number;
}

export interface IComboCourses {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IComboCourse[];
}

export interface IComboCourseCreate {
  name: string;
  description: string;
  original_price: string;
  combo_price: string;
  discount_percentage: string;
  course_ids: string[];
  tags?: string[];
}

export interface IComboCourseUpdate {
  name?: string;
  description?: string;
  original_price?: string;
  combo_price?: string;
  discount_percentage?: string;
  course_ids?: string[];
  tags?: string[];
}

// New interface for combo course level range response
export interface IComboCourseLevelRangeResponse {
  comboCourses: IComboCourse[];
  totalOriginalPrice: number;
  totalComboPrice: number;
  totalSavings: number;
  levelRange: string;
  includedLevels: string[];
}

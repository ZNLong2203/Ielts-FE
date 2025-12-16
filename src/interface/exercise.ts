import { ICourseQuestion } from "./courseQuestion";
import { ILesson } from "./lesson";

export interface IQuestionGroup {
  id: string;
  exercise_id: string;
  image_url?: string;
  group_title?: string;
  group_instruction: string;
  passage_reference?: string;
  question_type: string;
  ordering: number;
  question_range?: string;
  correct_answer_count: number;
  questions?: ICourseQuestion[];
  created_at?: Date;
  updated_at?: Date;
  deleted?: boolean;
}

export interface IExercise {
  id: string;
  lesson_id: string;
  section_id?: string;
  title: string;
  instruction: string;
  content: {
      description: string;
      main_content: string;
  }
  deleted: boolean
  media_url: string;
  audio_url?: string;
  time_limit: number;
  max_attempts: number;
  passing_score: string;
  ordering: number;
  is_active: boolean;
  skill_type?: string;
  question_groups?: IQuestionGroup[];
  questions: ICourseQuestion[];
  lesson?: ILesson
}

export interface IExerciseCreate {
  lesson_id: string;
  title: string;
  description: string;
  instruction: string;
  content: string;
  media_url: string;
  time_limit: number;
  max_attempts: number;
  passing_score: string;
  ordering: number;
  is_active: boolean;
}

export interface IExerciseUpdate {
  title?: string;
  description?: string;
  instruction?: string;
  content?: string;
  media_url?: string;
  time_limit?: number;
  max_attempts?: number;
  passing_score?: string;
  ordering?: number;
  is_active?: boolean;
}
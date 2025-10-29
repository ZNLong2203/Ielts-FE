

export interface IExercise {
  id: string;
  lesson_id: string;
  title: string;
  instruction: string;
  content: {
      description: string;
      main_content: string;
  }
  deleted: boolean
  media_url: string;
  time_limit: number;
  max_attempts: number;
  passing_score: string;
  ordering: number;
  is_active: boolean;
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


export interface IListeningPassage {
  title: string;
  content: string;
  word_count: number;
  difficulty_level: string;
}

export interface ExerciseContent {
  id: string;
  test_section_id: string;
  title: string;
  passage: IListeningPassage;
  time_limit: number; // in minutes
  passing_score: string;
  ordering: number;
  audio_url?: string;
}

export interface IListeningSection {
  id: string;
  mock_test: {
    id: string;
    test_type: string;
    title: string;
  };
  section_name: string;
}

export interface IListeningExerciseList {
  exercises: ExerciseContent[];
  test_section: IListeningSection;
}

export interface IListeningExercise {
  id: string;
  audio_url?: string;
  exercise_type: string;
  instruction: string;
  ordering: number;
  passing_score: string;
  reading_passage: {
    content: string;
    difficulty_level: string;
    estimated_listening_time: number;
    title: string;
    word_count: number;
  }
  skill_type: string;
  time_limit: number; // in minutes
  title: string;
  total_questions: number;
  total_points: number;
  ungrouped_questions?: any[];
  question_groups?: any[];
}

export interface IListeningPassageCreate {
  title: string;
  content: string;
  audio_url?: File;
  difficulty_level: string;
}

export interface IListeningExerciseCreate {
  test_section_id: string;
  title: string;
  passage: IListeningPassageCreate;
  time_limit: number; // in minutes
  passing_score: string;
  ordering: number;
}

export interface IListeningExerciseUpdate {
  title?: string;
  audio_url?: File;
  passage?: IListeningPassageCreate;
  time_limit?: number; // in minutes
  passing_score?: string;
  ordering?: number;
}

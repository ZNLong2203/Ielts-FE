export interface IMockTestQuestionOption {
  id: string;
  option_text: string;
  ordering: number;
}

export interface IMockTestMatchingOption {
  id: string;
  option_text: string;
  ordering: number;
}

export interface IMockTestQuestion {
  id: string;
  question_text: string;
  question_type: string;
  image_url?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  reading_passage?: string | null;
  points?: number | null;
  ordering: number;
  question_options?: IMockTestQuestionOption[];
}

export interface IMockTestQuestionGroup {
  id: string;
  image_url?: string | null;
  group_title?: string | null;
  group_instruction?: string | null;
  passage_reference?: string | null;
  question_type: string;
  ordering: number;
  question_range?: string | null;
  questions: IMockTestQuestion[];
  matching_options?: IMockTestMatchingOption[];
}

export interface IMockTestExercise {
  id: string;
  title: string;
  instruction?: string | null;
  content?: any;
  exercise_type: string;
  skill_type: string;
  time_limit?: number | null;
  ordering: number;
  audio_url?: string | null;
  question_groups?: IMockTestQuestionGroup[];
}

export interface IMockTestSection {
  id?: string; // Optional - exists when updating existing section
  section_name: string;
  section_type: string;
  duration: number; // in minutes
  ordering: number;
  description: string;
  exercises?: IMockTestExercise[];
}

export interface IMockTestSectionDetail {
  id: string;
  section_name: string;
  section_type: string;
  duration: number; // in minutes
  ordering: number;
  description: string;
  exercises?: IMockTestExercise[];
}

export interface IMockTestCreate {
  title: string;
  test_type: string;
  instructions: string;
  duration: number; // in minutes
  deleted: boolean;
  difficulty_level: string;
  description: string;
  test_sections: IMockTestSection[];
}

export interface IMockTestUpdate {
  title?: string;
  test_type?: string;
  instructions?: string;
  duration?: number; // in minutes
  deleted?: boolean;
  difficulty_level?: string;
  description?: string;
  test_sections?: IMockTestSection[];
}

export interface IMockTest {
  id: string;
  title: string;
  test_type: string;
  instructions: string;
  duration: number; // in minutes
  deleted: boolean;
  difficulty_level: string;
  target_band_score?: string | null;
  description: string;
  test_sections?: IMockTestSectionDetail[];
  created_at: Date;
  updated_at: Date;
}

// Test Result interfaces
export interface IQuestionReview {
  question_id: string;
  question: IMockTestQuestion | null;
  is_correct: boolean | null;
  user_answer: string | string[] | null;
  correct_answer: string | string[] | null;
  points_earned: number;
  max_points: number;
  explanation?: string | null;
  part?: string | null;
  ai_feedback?: string | null;
  // For writing tasks
  task_type?: string;
  overall_score?: number;
  task_achievement_score?: number;
  coherence_cohesion_score?: number;
  lexical_resource_score?: number;
  grammatical_range_accuracy_score?: number;
  detailed_feedback?: string | null;
  suggestions?: any;
  strengths?: any;
  weaknesses?: any;
}

export interface ISectionResult {
  id: string;
  test_result_id: string;
  test_section_id: string;
  band_score: number;
  time_taken: number;
  correct_answers: number;
  total_questions: number;
  detailed_answers?: any;
  graded_at: Date;
  test_sections?: IMockTestSection;
  question_reviews?: IQuestionReview[];
}

export interface ITestResult {
  id: string;
  user_id: string;
  mock_test_id: string;
  status: string;
  band_score?: number | null;
  reading_score?: number | null;
  listening_score?: number | null;
  writing_score?: number | null;
  speaking_score?: number | null;
  time_taken?: number | null;
  created_at: Date;
  updated_at: Date;
  mock_tests?: IMockTest;
  section_results?: ISectionResult[];
}

export interface IMockTests {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IMockTest[];
}

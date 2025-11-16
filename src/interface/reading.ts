export interface IReadingPassage {
  title: string;
  content: string;
  paragraphs: IReadingParagraph[];
  word_count: number;
  difficulty_level: string;
}

export interface IReadingParagraph {
  id: string;   
  label: string;
  content: string;
}

export interface ExerciseContent {
    id: string;
    test_section_id: string;
    title: string;
    passage: IReadingPassage;
    time_limit: number; // in minutes
    passing_score: string;
    ordering: number;
}

export interface IReadingExerciseList {
  exercises: ExerciseContent[];
  test_section: IReadingSection;
}

export interface IReadingExercise {
    id: string;
    exercise_type: string;
    instruction: string;
    ordering: number;
    passing_score: string
    reading_passage: {
        content: string;
        difficulty_level: string;
        estimated_reading_time: number;
        title: string;
        word_count: number;
        paragraphs: IReadingParagraph[];
    };
    skill_type: string;
    time_limit: number; // in minutes
    title: string;
    total_questions: number;
    total_points: number;
    ungrouped_questions?: any[];
    question_groups?: any[];
}

export interface IReadingPassageCreate {
  title: string;
  content: string;
  paragraphs: IReadingParagraph[];
  word_count: number;
  difficulty_level: string;
}

export interface IReadingExerciseCreate {
  test_section_id: string;
  title: string;
  passage: IReadingPassageCreate;
  time_limit: number; // in minutes
  passing_score: string;
  ordering: number;
}

export interface IReadingExerciseUpdate {
  title?: string;
  passage?: IReadingPassageCreate;
  time_limit?: number; // in minutes
  passing_score?: string;
  ordering?: number;
}

export interface IReadingSection {
  id: string;
  mock_test: {
    id: string;
    test_type: string;
    title: string;
  };
  section_name: string;
}

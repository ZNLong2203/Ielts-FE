export interface IPassageParagraph {
    id: string;
    label: string;
    content: string;
}

export interface IReadingPassage {
    title: string;
    content: string;
    paragraphs: IPassageParagraph[];
    word_count: number;
    difficulty_level: string;
}

export interface IReadingExercise {
    id: string;
    test_section_id: string;
    title: string;
    passage: IReadingPassage;
    time_limit: number; // in minutes
    passing_score: number; 
    ordering: number;
}

export interface IReadingExerciseCreate {
    test_section_id: string;
    title: string;
    passage: IReadingPassage;
    time_limit: number; // in minutes
    passing_score: number;
    ordering: number;
}

export interface IReadingExerciseUpdate {
    title?: string;
    passage?: IReadingPassage;
    time_limit?: number; // in minutes
    passing_score?: number;
    ordering?: number;
}
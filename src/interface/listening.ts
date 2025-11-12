export interface IPassageParagraph {
    id: string;
    label: string;
    content: string;
}

export interface IListeningPassage {
    title: string;
    content: string;
    paragraphs: IPassageParagraph[];
    word_count: number;
    difficulty_level: string;
}

export interface IListeningExercise {
    id: string;
    test_section_id: string;
    title: string;
    passage: IListeningPassage;
    time_limit: number; // in minutes
    passing_score: number; 
    ordering: number;
}

export interface IListeningExerciseCreate {
    test_section_id: string;
    title: string;
    passage: IListeningPassage;
    time_limit: number; // in minutes
    passing_score: number;
    ordering: number;
}

export interface IListeningExerciseUpdate {
    title?: string;
    passage?: IListeningPassage;
    time_limit?: number; // in minutes
    passing_score?: number;
    ordering?: number;
}
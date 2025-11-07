export interface IMockTestSection {
    section_name: string;
    section_type: string;
    time_limit: number; // in minutes
    ordering: number;
    instructions: string;
}

export interface IMockTestCreate {
    title: string;
    test_type: string;
    test_level: string;
    instructions: string;
    time_limit: number; // in minutes
    is_active: boolean;
    difficulty_level: string;
    description: string;
    sections: IMockTestSection[];
}

export interface IMockTestUpdate {
    title?: string;
    test_type?: string;
    test_level?: string;
    instructions?: string;
    time_limit?: number; // in minutes
    is_active?: boolean;
    difficulty_level?: string;
    description?: string;
    sections?: IMockTestSection[];
}

export interface IMockTest {
    id: string;
    title: string;
    test_type: string;
    test_level: string;
    instructions: string;
    duration: number; // in minutes
    time_limit: number; // in minutes
    is_active: boolean;
    difficulty_level: string;
    description: string;
    sections: IMockTestSection[];
    created_at: Date;
    updated_at: Date;
}

export interface IMockTests {
    meta: {
        current: number;
        currentSize: number;
        pageSize: number;
        pages: number;
        total: number;
    }
    result: IMockTest[];
}
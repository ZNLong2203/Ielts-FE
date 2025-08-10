export interface ICourseCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    ordering?: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ICourseCategories {
    meta: {
        current: number;
        currentSize: number;
        pageSize: number;
        pages: number;
        total: number;
    }
    result: ICourseCategory[];
}

export interface ICourseCategoryCreate {
    name: string;
    description: string;
    icon: string;
    ordering: number;
    is_active: boolean;
}

export interface ICourseCategoryUpdate {
    name?: string;
    description?: string;
    icon?: string;
    ordering?: number;
    is_active?: boolean;
}
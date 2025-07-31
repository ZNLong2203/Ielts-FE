export interface IBlogCategory {
    id: string;
    name: string;
    slug?: string;
    description: string;
    ordering?: number;
    is_active?: boolean;
    created_at: Date
}

export interface IBlogCategories {
    meta: {
        current: number;
        currentSize: number;
        pageSize: number;
        pages: number;
        total: number;
    }
    result: IBlogCategory[];
}

export interface IBlogCategoryCreate {
    name: string;
    description?: string;
    ordering?: number;
    is_active?: boolean;
}

export interface IBlogCategoryUpdate {
    name?: string;
    description?: string;
    ordering?: number;
    is_active?: boolean;
}


export interface IBlogCategory {
    id: string;
    name: string;
    slug?: string;
    description: string;
    ordering?: number;
    is_active?: boolean;
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
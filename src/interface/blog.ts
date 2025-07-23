export interface IBlog {
    id: string;
    author_id?: string;
    category_id?: string;
    title: string;
    content: string;
    image?: string;
    tags?: string[];
    status?: "draft" | "published" | "archived";
    is_featured?: boolean;
    like_count?: number;
    published_at?: Date;
}

export interface IBlogCategory {
    id: string;
    name: string;
    slug?: string;
    description: string;
    ordering?: number;
    is_active?: boolean;
}

export interface IBlogComment {
    id: string;
    blog_id?: string;
    user_id?: string;
    parent_comment_id?: string;
    content: string;
    is_approved?: boolean;
    like_count?: number;
}
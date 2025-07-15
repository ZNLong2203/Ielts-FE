export interface IBlog {
    id: string;
    author_id?: string;
    category_id?: string;
    parent_comment_id?: string;
    content: string;
    is_approved?: boolean;
    like_count?: number;
    deleted?: boolean;
    created_at: Date;
    updated_at: Date;
}
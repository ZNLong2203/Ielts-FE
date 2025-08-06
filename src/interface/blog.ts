export interface IBlog {
  id: string;
  author_id?: string;
  category_id?: string;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  status: "draft" | "published" | "archived";
  is_featured?: boolean;
  like_count?: number;
  published_at?: Date;
}

export interface IBlogs {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IBlog[];
}

export interface IBlogCreate {
  title: string;
  content: string;
  image?: string;
  tags?: string[];
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

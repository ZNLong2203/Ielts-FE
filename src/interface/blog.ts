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
  view_count?: number;
  comment_count?: number;
  published_at?: Date | string;
  reading_time?: string;
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  category?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IBlogResponse {
  statusCode: number;
  message: string;
  data: IBlogs;
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
  category_id?: string;
}

export interface IBlogUpdate {
  title?: string;
  content?: string;
  image?: string;
  tags?: string[];
  category_id?: string;
}

export interface IBlogCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  ordering?: number;
  count?: number;
  color?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IBlogCategoryCreate {
  name: string;
  description?: string;
  ordering?: number;
}

export interface IBlogCategoryUpdate {
  name?: string;
  description?: string;
  ordering?: number;
}

export interface IBlogUpdate {
  title?: string;
  content?: string;
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
  created_at?: Date | string;
  updated_at?: Date | string;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  replies?: IBlogComment[];
}

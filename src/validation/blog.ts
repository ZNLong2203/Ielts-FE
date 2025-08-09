import * as z from 'zod';

export const BlogCreateSchema = z.object({
    category_id: z.string().min(1, "Category ID is required"),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    tags: z.array(z.string()).optional(),
    file: z.any(),
    is_featured: z.boolean().optional(),
})

export const BlogUpdateSchema = z.object({
    category_id: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
    file: z.any().optional(),
    is_featured: z.boolean().optional(),
})
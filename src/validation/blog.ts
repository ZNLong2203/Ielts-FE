import * as z from 'zod';

export const BlogCreateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    tags: z.array(z.string()).optional(),
    file: z.any(),
})
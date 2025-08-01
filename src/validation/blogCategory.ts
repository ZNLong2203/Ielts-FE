import * as z from "zod";

export const BlogCategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  ordering: z.number(),
  is_active: z.boolean().optional(),
  slug: z.string().optional(),
});


export const BlogCategoryUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    ordering: z.number().optional(),
    is_active: z.boolean().optional(),
    slug: z.string().optional(),
})


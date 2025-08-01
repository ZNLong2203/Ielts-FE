import * as z from "zod";

export const BlogCategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  ordering: z.number(),
  is_active: z.boolean().optional(),
  slug: z.string().optional(),
});

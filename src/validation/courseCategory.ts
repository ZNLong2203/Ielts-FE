import * as z from "zod";

export const CourseCategoryCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    is_active: z.boolean().default(true),
    icon: z.string().min(1, "Icon is required"),
    ordering: z.number().min(0, "Ordering must be a positive number")
})

export const CourseCategoryUpdateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    is_active: z.boolean().default(true),
    icon: z.string().min(1, "Icon is required"),
    ordering: z.number().min(0, "Ordering must be a positive number")
})
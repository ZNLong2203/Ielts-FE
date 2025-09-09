import * as z from "zod"

export const CourseComboCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    discount_percentage: z.string().min(1, "Discount price must be positive").min(1, "Discount price must be less than or equal to price"),
    combo_price: z.string().min(1, "Combo price must be positive").min(1, "Combo price must be less than or equal to price"),
    original_price: z.string().min(1, "Original price must be positive"),
    course_ids: z.array(z.string()).min(1, "At least one course is required"),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
})

export const CourseComboUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    original_price: z.string().min(1, "Original price must be positive").optional(),
    discount_percentage: z.string().min(1, "Discount price must be positive").min(1, "Discount price must be less than or equal to price").optional(),
    combo_price: z.string().min(1, "Combo price must be positive").min(1, "Combo price must be less than or equal to price").optional(),
    course_ids: z.array(z.string()).min(1, "At least one course is required").optional(),
    tags: z.array(z.string()).min(1, "At least one tag is required").optional(),
})
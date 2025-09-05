import * as z from 'zod';

// Schema cho section trong course outline
const SectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  lessons: z.string().array().min(1, "At least one lesson is required"),
});

// Schema cho course outline
const CourseOutlineSchema = z.object({
  sections: z.array(SectionSchema).min(1, "At least one section is required"),
});

export const CourseCreateSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(10, "Course description is required"),
  teacher_id: z.string().min(1, "Teacher ID is required"),
  category_id: z.string().min(1, "Category ID is required"),
  skill_focus: z.string().min(1, "Skill focus is required"),
  difficulty_level: z.string().min(1, "Difficulty level is required"),
  estimated_duration: z.number().min(1, "Estimated duration is required"),
  price: z.string().min(1, "Price must be positive"),
  discount_price: z.string().min(1, "Discount price must be positive").min(1, "Discount price must be less than or equal to price"),
  is_featured: z.boolean(),
  requirements: z.array(z.string()).min(1, "At least one requirement is required"),
  what_you_learn: z.array(z.string()).min(1, "At least one thing you will learn is required"),
  course_outline: CourseOutlineSchema,
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

export const CourseUpdateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    teacher_id: z.string().optional(),
    category_id: z.string().optional(),
    skill_focus: z.string().optional(),
    difficulty_level: z.string().optional(),
    estimated_duration: z.number().optional(),
    price: z.string().optional(),
    discount_price: z.string().optional(),
    is_featured: z.boolean().optional(),
    requirements: z.array(z.string()).optional(),
    what_you_learn: z.array(z.string()).optional(),
    course_outline: CourseOutlineSchema.optional(),
    tags: z.array(z.string()).optional(),
})
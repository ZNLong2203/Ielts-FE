import * as z from "zod";

export const ExerciseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().min(1, "Description is required"),
  instruction: z.string().min(1, "Instruction is required"),
  content: z.string().min(1, "Content is required"),
  media_url: z.string().url().optional().or(z.literal("")),
  time_limit: z.number().min(30, "Time limit must be at least 30 seconds"),
  max_attempts: z.number().min(1, "Max attempts must be at least 1").max(10, "Max 10 attempts allowed"),
  passing_score: z.string().min(1, "Passing score must be at least 1"),
  ordering: z.number().min(1, "Order must be at least 1"),
  is_active: z.boolean(),
});
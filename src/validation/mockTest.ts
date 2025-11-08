import * as z from "zod";

export const MockTestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  test_type: z.string().min(1, "Please select a test type"),
  instructions: z.string(),
  time_limit: z.number().min(1, "Time limit must be at least 1 minute"),
  test_level: z.string().min(1, "Please select a test level"),
  deleted: z.boolean().optional(),
  difficulty_level: z.string().min(1).max(5).optional(),
  sections: z.array(
    z.object({
      section_name: z.string().min(3).max(100),
      section_type: z.string().min(1),
      time_limit: z.number().min(1),
      instructions: z.string().optional(),
    })
  ),
});

export const MockTestFormUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  test_type: z.string().min(1, "Please select a test type").optional(),
  instructions: z.string().optional(),
  deleted: z.boolean().optional(),
  time_limit: z.number().min(1, "Time limit must be at least 1 minute").optional(),
  difficulty_level: z.string().min(1).max(5).optional(),
  sections: z.array(
    z.object({
      section_name: z.string().min(3).max(100).optional(),
      section_type: z.string().min(1).optional(),
      time_limit: z.number().min(1).optional(),
      instructions: z.string().optional(),
    })
  ),
})
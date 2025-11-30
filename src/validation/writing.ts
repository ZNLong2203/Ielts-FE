import * as z from "zod";

export const WritingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  test_section_id: z.string().min(1, "Section ID is required"),
  instruction: z.string().optional(),
  task_type: z.enum(["task_1", "task_2"], {
    required_error: "Task type is required",
  }),
  question_type: z.enum(["essay", "letter", "report", "discursive"], {
    required_error: "Question type is required",
  }),
  question_text: z
    .string()
    .min(10, "Question text must be at least 10 characters")
    .max(2000, "Question text is too long"),
  question_image: z.string().optional(),
  question_chart: z.string().optional(),
  word_limit: z
    .number()
    .min(50, "Word limit must be at least 50")
    .max(500, "Word limit cannot exceed 500")
    .optional(),
  time_limit: z
    .number()
    .min(1, "Time limit must be at least 1 minute")
    .max(180, "Time limit cannot exceed 180 minutes")
    .optional(),
  passing_score: z
    .number()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score cannot exceed 100")
    .optional(),
  ordering: z.number().min(0, "Ordering must be at least 0").optional(),
});

export const WritingFormUpdateSchema = WritingFormSchema.partial();


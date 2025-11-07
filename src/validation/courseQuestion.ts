import * as z from "zod";

// FIXED: Zod schema matching interface exactly
const CourseQuestionOptionSchema = z.object({
  id: z.string().optional(),
  option_text: z.string().optional(),
  is_correct: z.boolean().optional(),
  ordering: z.number().optional(),
  explanation: z.string().optional(),
  point: z.string().optional(),
  deleted: z.boolean().optional(),
});

export const CourseQuestionFormSchema = z.object({
  question_text: z.string().min(5, "Question text must be at least 5 characters"),
  question_type: z.string().min(1, "Please select a question type"),
  difficulty_level: z.any(),
  explanation: z.string().optional(),
  correct_answer: z.string().optional(),
  points: z.string().min(1, "Points is required"),
  ordering: z.number().min(1, "Order must be at least 1"),
  question_options: z.array(CourseQuestionOptionSchema).optional(),
  media_url: z.any().optional(), // Fileimpor
  reading_passage: z.string().optional(),
});
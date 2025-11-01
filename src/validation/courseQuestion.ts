import * as z from "zod";

export const CourseQuestionFormSchema = z.object({
  question_text: z.string().min(5, "Question text must be at least 5 characters"),
  question_type: z.string().min(1, "Please select a question type"),
  points: z.string().min(1, "Points must be at least 1").max(3, "Points cannot exceed 3"),
  order_index: z.number().min(1, "Order must be at least 1"),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  media_url: z.any().optional(), // File object
});
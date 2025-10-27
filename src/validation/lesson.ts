import * as z from "zod";
export const LessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().min(1, "Description is required"),
  lesson_type: z.enum(["video", "document", "quiz", "assignment"], {
    required_error: "Please select a lesson type",
  }),
  is_preview: z.boolean(),
  ordering: z.number().min(1, "Order must be at least 1"),
  document_url: z.string().optional(),
});
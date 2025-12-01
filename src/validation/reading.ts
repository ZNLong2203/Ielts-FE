import * as z from "zod";

export const ReadingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  test_section_id: z.string().min(1, "Section ID is required"),
  time_limit: z.number().min(1, "Time limit must be at least 1 minute").max(180, "Time limit cannot exceed 180 minutes"),
  ordering: z.number().min(1, "Ordering must be at least 1"),
  passage: z.object({
    title: z.string().min(1, "Passage title is required"),
    content: z.string().optional(), // Content will be auto-generated from paragraphs
    difficulty_level: z.string().min(1, "Difficulty level is required"),
    paragraphs: z.array(z.object({
      id: z.string(),
      label: z.string().min(1, "Paragraph label is required"),
      content: z.string().min(1, "Paragraph content is required"),
    })).min(1, "At least one paragraph is required"), 
  }),
});
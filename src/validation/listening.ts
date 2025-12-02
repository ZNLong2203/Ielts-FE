import * as z from "zod";

export const ListeningFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  test_section_id: z.string().min(1, "Section ID is required"),
  audio_url: z.any().optional(),
  time_limit: z.number().min(1, "Time limit must be at least 1 minute").max(180, "Time limit cannot exceed 180 minutes"),
  ordering: z.number().min(1, "Ordering must be at least 1"),
  passage: z.object({
    title: z.string().min(1, "Audio title is required"),
    // Transcript is optional in admin; keep field for compatibility but no min length.
    content: z.string().optional().or(z.literal("")),
    // Word count is optional; when provided it should be non‑negative.
    word_count: z.number().min(0).optional(),
    difficulty_level: z.string().min(1, "Difficulty level is required"),
  }),
});
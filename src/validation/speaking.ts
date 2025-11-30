import * as z from "zod";

const SpeakingQuestionSchema = z.object({
  question_text: z
    .string()
    .min(5, "Question text must be at least 5 characters")
    .max(500, "Question text is too long"),
  expected_duration: z
    .number()
    .min(10, "Expected duration must be at least 10 seconds")
    .max(300, "Expected duration cannot exceed 300 seconds")
    .optional(),
  instructions: z.string().optional(),
});

export const SpeakingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  test_section_id: z.string().min(1, "Section ID is required"),
  instruction: z.string().optional(),
  part_type: z.enum(["part_1", "part_2", "part_3"], {
    required_error: "Part type is required",
  }),
  questions: z
    .array(SpeakingQuestionSchema)
    .min(1, "At least one question is required"),
  time_limit: z
    .number()
    .min(1, "Time limit must be at least 1 minute")
    .max(60, "Time limit cannot exceed 60 minutes")
    .optional(),
  passing_score: z
    .number()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score cannot exceed 100")
    .optional(),
  ordering: z.number().min(0, "Ordering must be at least 0").optional(),
  additional_instructions: z.string().optional(),
});

export const SpeakingFormUpdateSchema = SpeakingFormSchema.partial();


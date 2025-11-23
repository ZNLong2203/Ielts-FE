import { z } from "zod";
import { FileText, CheckCircle, Circle, Link2 } from "lucide-react";

// Schema
export const MatchingOptionSchema = z.object({
  option_text: z.string().min(1, "Option text is required"),
  ordering: z.number().min(1),
});

export const QuestionGroupSchema = z.object({
  exercise_id: z.string().min(1, "Exercise ID is required"),
  group_title: z.string().min(1, "Group title is required"),
  group_instruction: z.string().min(1, "Instructions are required"),
  passage_reference: z.string().optional(),
  question_type: z.enum([
    "fill_blank",
    "true_false",
    "multiple_choice",
    "matching",
  ]),
  question_range: z.string().min(1, "Question range is required"),
  correct_answer_count: z
    .number()
    .min(1, "Must have at least 1 correct answer"),
  ordering: z.number().min(1),
  image_url: z.any().optional(),
  matching_options: z.array(MatchingOptionSchema).optional(),
});

export const QuestionGroupUpdateSchema = QuestionGroupSchema.partial();

// Types
export type QuestionGroupFormData = z.infer<typeof QuestionGroupSchema>;
export type QuestionGroupUpdateData = z.infer<typeof QuestionGroupUpdateSchema>;

// Constants
export const QUESTION_TYPE_OPTIONS = [
  {
    label: "Fill in the Blanks",
    value: "fill_blank",
    icon: FileText,
    description: "Students fill in missing words",
  },
  {
    label: "True/False",
    value: "true_false",
    icon: CheckCircle,
    description: "True or false statements",
  },
  {
    label: "Multiple Choice",
    value: "multiple_choice",
    icon: Circle,
    description: "Choose from multiple options",
  },
  {
    label: "Matching",
    value: "matching",
    icon: Link2,
    description: "Match items with options",
  },
] as const;

export interface QuestionGroupFormProps {
  exerciseId?: string;
  mockTestId?: string;
  sectionId?: string;
  questionGroupId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}
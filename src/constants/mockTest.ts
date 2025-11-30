import { BookOpen, Mic, PenTool, Target, Volume2 } from "lucide-react";

// Test type options
export const TEST_TYPE_OPTIONS = [
  {
    label: "Full Test",
    value: "full_test",
    icon: Target,
    description: "Complete IELTS test with all sections",
  },
  {
    label: "Listening",
    value: "listening",
    icon: Volume2,
    description: "Audio comprehension test",
  },
  {
    label: "Reading",
    value: "reading",
    icon: BookOpen,
    description: "Reading comprehension test",
  },
  {
    label: "Writing",
    value: "writing",
    icon: PenTool,
    description: "Essay and writing tasks",
  },
  {
    label: "Speaking",
    value: "speaking",
    icon: Mic,
    description: "Oral communication test",
  },
];

export const DIFFICULTY_LEVEL_OPTIONS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Hard", value: "hard" },
  { label: "Advanced", value: "advanced" },
  { label: "Master", value: "master" },
];

export const SECTION_TYPE_OPTIONS = [
  { label: "Listening", value: "listening" },
  { label: "Reading", value: "reading" },
  { label: "Writing", value: "writing" },
  { label: "Speaking", value: "speaking" },
];
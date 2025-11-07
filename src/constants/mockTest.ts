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

export const TEST_LEVEL_OPTIONS = [
  { label: "Academic", value: "academic" },
  { label: "General", value: "general" },
];

export const DIFFICULTY_LEVEL_OPTIONS = [
  { label: "Level 1 (Easy)", value: "1" },
  { label: "Level 2 (Medium)", value: "2" },
  { label: "Level 3 (Hard)", value: "3" },
  { label: "Level 4 (Expert)", value: "4" },
  { label: "Level 5 (Master)", value: "5" },
];

export const SECTION_TYPE_OPTIONS = [
  { label: "Listening", value: "listening" },
  { label: "Reading", value: "reading" },
  { label: "Writing", value: "writing" },
  { label: "Speaking", value: "speaking" },
];
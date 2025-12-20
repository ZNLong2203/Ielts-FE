import { IExerciseCreate } from "@/interface/exercise";
import { ICourseQuestionCreate } from "@/interface/courseQuestion";
import { createExercise } from "@/api/exercise";
import { createCourseQuestion } from "@/api/courseQuestion";

export interface JsonQuestionOption {
  option_text: string;
  is_correct: boolean;
  ordering?: number;
  explanation?: string;
  point?: string | number;
}

export interface JsonQuestion {
  question_text: string;
  question_type: "multiple_choice" | "drop_list" | "droplist" | "fill_blank";
  options?: JsonQuestionOption[]; // Required for multiple_choice and drop_list
  correct_answer?: string; // Required for fill_blank
  alternative_answers?: string[]; // Optional for fill_blank
  explanation?: string;
  points?: number | string;
  ordering: number;
  image_url?: string;
  audio_url?: string;
  reading_passage?: string;
}

export interface JsonExercise {
  title: string;
  instruction?: string;
  description?: string;
  content?: string;
  media_url?: string;
  time_limit?: number;
  max_attempts?: number;
  passing_score?: string | number;
  ordering?: number;
  is_active?: boolean;
  skill_type?: string;
  questions: JsonQuestion[];
}

export interface ImportResult {
  success: boolean;
  exerciseId?: string;
  createdQuestions: number;
  errors: string[];
  warnings: string[];
}

export function validateJsonExercise(json: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!json || typeof json !== "object" || json === null) {
    errors.push("JSON is empty or invalid");
    return { valid: false, errors };
  }

  const jsonObj = json as Record<string, unknown>;

  // Validate exercise
  if (!jsonObj.title || typeof jsonObj.title !== "string") {
    errors.push("Exercise title is required and must be a string");
  }

  if (!jsonObj.questions || !Array.isArray(jsonObj.questions)) {
    errors.push("Exercise must have a 'questions' array");
    return { valid: false, errors };
  }

  if (jsonObj.questions.length === 0) {
    errors.push("Exercise must have at least one question");
  }

  // Validate each question
  jsonObj.questions.forEach((question: unknown, index: number) => {
    if (!question || typeof question !== "object" || question === null) {
      errors.push(`Question ${index + 1}: Invalid question object`);
      return;
    }

    const qPrefix = `Question ${index + 1}`;
    const questionObj = question as Record<string, unknown>;

    if (!questionObj.question_text || typeof questionObj.question_text !== "string") {
      errors.push(`${qPrefix}: question_text is required and must be a string`);
    }

    const validTypes = ["multiple_choice", "drop_list", "droplist", "fill_blank"];
    if (!questionObj.question_type || !validTypes.includes(questionObj.question_type as string)) {
      errors.push(
        `${qPrefix}: question_type must be one of: ${validTypes.join(", ")}`
      );
    }

    if (questionObj.ordering === undefined || questionObj.ordering === null) {
      errors.push(`${qPrefix}: ordering is required`);
    }

    // Validate based on question type
    if (questionObj.question_type === "multiple_choice" || 
        questionObj.question_type === "drop_list" || 
        questionObj.question_type === "droplist") {
      if (!questionObj.options || !Array.isArray(questionObj.options) || questionObj.options.length === 0) {
        errors.push(`${qPrefix}: options array is required for ${questionObj.question_type} questions`);
      } else {
        // Validate options
        questionObj.options.forEach((option: unknown, optIndex: number) => {
          if (!option || typeof option !== "object" || option === null) {
            errors.push(`${qPrefix}, Option ${optIndex + 1}: Invalid option object`);
            return;
          }

          const optionObj = option as Record<string, unknown>;

          if (!optionObj.option_text || typeof optionObj.option_text !== "string") {
            errors.push(`${qPrefix}, Option ${optIndex + 1}: option_text is required`);
          }
          if (optionObj.is_correct === undefined || typeof optionObj.is_correct !== "boolean") {
            errors.push(`${qPrefix}, Option ${optIndex + 1}: is_correct must be a boolean`);
          }
        });

        // Check if at least one option is correct
        const hasCorrectOption = questionObj.options.some((opt: unknown) => {
          if (!opt || typeof opt !== "object" || opt === null) return false;
          const optObj = opt as Record<string, unknown>;
          return optObj.is_correct === true;
        });
        if (!hasCorrectOption) {
          errors.push(`${qPrefix}: At least one option must be marked as correct`);
        }
      }
    } else if (questionObj.question_type === "fill_blank") {
      if (!questionObj.correct_answer || typeof questionObj.correct_answer !== "string") {
        errors.push(`${qPrefix}: correct_answer is required for fill_blank questions`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

function convertJsonQuestionToQuestionCreate(
  jsonQuestion: JsonQuestion
): ICourseQuestionCreate {
  const questionType = jsonQuestion.question_type === "drop_list" 
    ? "droplist" 
    : jsonQuestion.question_type;

  const questionData: ICourseQuestionCreate = {
    question_text: jsonQuestion.question_text,
    question_type: questionType,
    explanation: jsonQuestion.explanation || "",
    correct_answer: jsonQuestion.correct_answer || "",
    points: String(jsonQuestion.points || 1),
    ordering: jsonQuestion.ordering,
    options: [], // Initialize with empty array, will be filled below
  };

  if (jsonQuestion.options && jsonQuestion.options.length > 0) {
    questionData.options = jsonQuestion.options.map((opt, index) => ({
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      ordering: opt.ordering !== undefined ? opt.ordering : index,
      explanation: opt.explanation,
      point: opt.point ? String(opt.point) : "1",
    }));
  }

  return questionData;
}

export async function importExerciseFromJson(
  lessonId: string,
  jsonData: JsonExercise
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    createdQuestions: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Validate JSON structure
    const validation = validateJsonExercise(jsonData);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Create exercise
    const exerciseData: IExerciseCreate = {
      lesson_id: lessonId,
      title: jsonData.title,
      description: jsonData.description || "",
      instruction: jsonData.instruction || "",
      content: jsonData.content || "",
      media_url: jsonData.media_url || "",
      time_limit: jsonData.time_limit || 30,
      max_attempts: jsonData.max_attempts || 3,
      passing_score: String(jsonData.passing_score || 70),
      ordering: jsonData.ordering ?? 0,
      is_active: jsonData.is_active ?? true,
    };

    let createdExercise;
    try {
      createdExercise = await createExercise(exerciseData, lessonId);
      console.log("Full exercise creation response:", JSON.stringify(createdExercise, null, 2));
    } catch (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }
    
    let exerciseId: string | undefined;
    
    if (createdExercise && typeof createdExercise === 'object') {
      // Case 1: Response is { success: true, data: exercise }
      if ('success' in createdExercise && 'data' in createdExercise && createdExercise.data) {
        const exerciseData = createdExercise.data;
        if (exerciseData && typeof exerciseData === 'object' && 'id' in exerciseData) {
          exerciseId = (exerciseData as { id: string }).id;
        }
      }
      // Case 2: Response is directly the exercise object (fallback)
      else if ('id' in createdExercise) {
        exerciseId = (createdExercise as { id: string }).id;
      }
    }
    
    if (!exerciseId) {
      console.error("Exercise creation response structure:", createdExercise);
      throw new Error("Failed to create exercise: No exercise ID found in response");
    }
    
    result.exerciseId = exerciseId;
    console.log("Extracted exercise ID:", exerciseId);

    // Create questions sequentially
    const sortedQuestions = [...jsonData.questions].sort(
      (a, b) => a.ordering - b.ordering
    );

    for (const jsonQuestion of sortedQuestions) {
      try {
        const questionData = convertJsonQuestionToQuestionCreate(jsonQuestion);
        console.log(`Creating question: ${jsonQuestion.question_text}, type: ${questionData.question_type}, exerciseId: ${exerciseId}`);
        await createCourseQuestion(lessonId, exerciseId, questionData);
        result.createdQuestions++;
      } catch (error: unknown) {
        const errorMsg = error instanceof Error 
          ? `Failed to create question "${jsonQuestion.question_text}": ${error.message}`
          : `Failed to create question "${jsonQuestion.question_text}": Unknown error`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    if (result.errors.length === 0) {
      result.success = true;
    } else if (result.createdQuestions > 0) {
      result.warnings.push(
        `Exercise created but ${result.errors.length} question(s) failed to import`
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error
      ? `Failed to create exercise: ${error.message}`
      : "Failed to create exercise: Unknown error";
    result.errors.push(errorMsg);
    console.error("Import error:", error);
  }

  return result;
}

export function parseJsonFile(fileContent: string): JsonExercise | null {
  try {
    const parsed = JSON.parse(fileContent);
    return parsed as JsonExercise;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

export const EXAMPLE_JSON: JsonExercise = {
  title: "Reading Comprehension Exercise",
  instruction: "Read the passage and answer the questions below",
  description: "Basic reading comprehension exercise",
  content: "This is the main passage content...",
  time_limit: 30,
  max_attempts: 3,
  passing_score: 70,
  ordering: 1,
  is_active: true,
  skill_type: "reading",
  questions: [
    {
      question_text: "What is the main idea of the passage?",
      question_type: "multiple_choice",
      ordering: 1,
      points: 1,
      explanation: "The main idea is explained in the first paragraph",
      options: [
        {
          option_text: "Option A",
          is_correct: false,
          ordering: 0,
        },
        {
          option_text: "Option B (Correct)",
          is_correct: true,
          ordering: 1,
        },
        {
          option_text: "Option C",
          is_correct: false,
          ordering: 2,
        },
        {
          option_text: "Option D",
          is_correct: false,
          ordering: 3,
        },
      ],
    },
    {
      question_text: "Choose the best answer from the dropdown",
      question_type: "drop_list",
      ordering: 2,
      points: 1,
      options: [
        {
          option_text: "Answer 1",
          is_correct: false,
        },
        {
          option_text: "Answer 2 (Correct)",
          is_correct: true,
        },
        {
          option_text: "Answer 3",
          is_correct: false,
        },
      ],
    },
    {
      question_text: "Fill in the blank: The capital of France is _____",
      question_type: "fill_blank",
      ordering: 3,
      points: 1,
      correct_answer: "Paris",
      alternative_answers: ["paris", "PARIS"],
      explanation: "Paris is the capital city of France",
    },
  ],
};


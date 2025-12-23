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

/**
 * Parse a CSV line handling quoted fields with commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse CSV file - supports both Quizizz format and custom format
 */
export async function parseCsvFile(fileContent: string): Promise<JsonExercise | null> {
  try {
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      console.error('CSV file is too short');
      throw new Error('CSV file is too short');
    }

    // Detect format by checking first line
    const firstLine = lines[0].toLowerCase();
    const isQuizizzFormat = firstLine.includes('question text') && firstLine.includes('question type');
    
    if (isQuizizzFormat) {
      return parseQuizizzCsvFormat(lines);
    } else {
      return parseCustomCsvFormat(lines);
    }
  } catch (error) {
    console.error('Failed to parse CSV:', error);
    return null;
  }
}

/**
 * Parse Quizizz CSV format
 */
function parseQuizizzCsvFormat(lines: string[]): JsonExercise {
  const exercise: JsonExercise = {
    title: 'Untitled Exercise',
    instruction: '',
    description: '',
    content: '',
    media_url: '',
    time_limit: 1800,
    max_attempts: 3,
    passing_score: '70',
    ordering: 1,
    is_active: true,
    questions: [],
  };

  // Find header row
  let headerIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('question text') && line.includes('question type') && !line.includes('(required)')) {
      headerIndex = i;
      break;
    }
  }

  const headers = parseCsvLine(lines[headerIndex]).map(h => h.toLowerCase().trim());
  
  const getColIndex = (name: string): number => {
    return headers.findIndex(h => h.includes(name));
  };
  
  const colIndices = {
    questionText: getColIndex('question text'),
    questionType: getColIndex('question type'),
    option1: getColIndex('option 1'),
    option2: getColIndex('option 2'),
    option3: getColIndex('option 3'),
    option4: getColIndex('option 4'),
    option5: getColIndex('option 5'),
    correctAnswer: getColIndex('correct answer'),
    timeInSeconds: getColIndex('time in seconds'),
    explanation: getColIndex('answer explanation'),
  };

  let questionOrder = 0;
  let metadataStartIndex = -1;

  // Parse question rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we've reached metadata section
    if (line.toLowerCase().includes('exercise metadata') || line.toLowerCase().includes('title:')) {
      metadataStartIndex = i;
      break;
    }
    
    if (!line) continue;
    
    const cells = parseCsvLine(line);
    if (cells.length < 3) continue;
    
    const questionText = cells[colIndices.questionText] || '';
    if (!questionText) continue;
    
    questionOrder++;
    const questionTypeRaw = (cells[colIndices.questionType] || 'Multiple Choice').toLowerCase();
    
    let questionType: JsonQuestion['question_type'] = 'multiple_choice';
    if (questionTypeRaw.includes('fill') || questionTypeRaw.includes('blank')) {
      questionType = 'fill_blank';
    } else if (questionTypeRaw.includes('checkbox')) {
      questionType = 'multiple_choice';
    }
    
    const question: JsonQuestion = {
      question_text: questionText,
      question_type: questionType,
      ordering: questionOrder,
      points: 1,
      explanation: cells[colIndices.explanation] || '',
      options: [],
    };
    
    // Handle fill_blank type
    if (questionType === 'fill_blank') {
      const option1 = cells[colIndices.option1] || '';
      const option2 = cells[colIndices.option2] || '';
      const option3 = cells[colIndices.option3] || '';
      
      question.correct_answer = option1;
      question.alternative_answers = [option2, option3].filter(a => a);
    } 
    // Handle multiple_choice
    else {
      const options = [
        cells[colIndices.option1],
        cells[colIndices.option2],
        cells[colIndices.option3],
        cells[colIndices.option4],
        cells[colIndices.option5],
      ].filter(opt => opt);
      
      const correctAnswerIndex = parseInt(cells[colIndices.correctAnswer]) - 1;
      
      question.options = options.map((optText, idx) => ({
        option_text: optText,
        is_correct: idx === correctAnswerIndex,
        ordering: idx,
        explanation: '',
        point: '1',
      }));
    }
    
    // Validate question
    if (questionType === 'fill_blank' && question.correct_answer) {
      exercise.questions.push(question);
    } else if (questionType === 'multiple_choice' && question.options && question.options.length > 0) {
      const hasCorrect = question.options.some(opt => opt.is_correct);
      if (hasCorrect) {
        exercise.questions.push(question);
      }
    }
  }
  
  // Parse metadata if present (after questions section)
  if (metadataStartIndex > -1) {
    for (let i = metadataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.toLowerCase().includes('exercise metadata') || line.toLowerCase().includes('optional')) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const field = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();
      
      if (field === 'title') exercise.title = value;
      else if (field === 'instruction') exercise.instruction = value;
      else if (field === 'description') exercise.description = value;
      else if (field === 'content') exercise.content = value;
      else if (field === 'media_url' || field === 'media url') exercise.media_url = value;
      else if (field === 'time_limit' || field === 'time limit') exercise.time_limit = parseInt(value) || 1800;
      else if (field === 'max_attempts' || field === 'max attempts') exercise.max_attempts = parseInt(value) || 3;
      else if (field === 'passing_score' || field === 'passing score') exercise.passing_score = parseInt(value) || 70;
      else if (field === 'ordering') exercise.ordering = parseInt(value) || 1;
      else if (field === 'is_active' || field === 'is active') exercise.is_active = value.toLowerCase() === 'true';
    }
  }
  
  if (exercise.questions.length === 0) {
    throw new Error('No valid questions found in CSV file');
  }

  console.log(`Parsed Quizizz CSV successfully: ${exercise.questions.length} questions found`);
  return exercise;
}

/**
 * Parse custom CSV format (existing format)
 */
function parseCustomCsvFormat(lines: string[]): JsonExercise {
  // Helper function to parse field:value format
  const parseFieldValue = (line: string): { field: string; value: string } | null => {
    if (!line) return null;
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return null;
    
    const field = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    return { field, value };
  };

  // Find where the questions table starts
  let metadataEndIndex = 0;
  let questionsStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('question_order') && line.includes('question_text')) {
      questionsStartIndex = i;
      metadataEndIndex = i;
      break;
    }
  }
  
  if (questionsStartIndex === -1) {
    throw new Error('Could not find questions table header');
  }

  // Parse exercise metadata
  const exercise: JsonExercise = {
    title: 'Untitled Exercise',
    instruction: '',
    description: '',
    content: '',
    media_url: '',
    time_limit: 1800,
    max_attempts: 3,
    passing_score: '70',
    ordering: 1,
    is_active: true,
    questions: [],
  };

  // Extract metadata
  for (let i = 0; i < metadataEndIndex; i++) {
    const parsed = parseFieldValue(lines[i]);
    if (!parsed) continue;
    
    const field = parsed.field.toLowerCase();
    const value = parsed.value;
    
    if (field === 'title') exercise.title = value;
    else if (field === 'instruction') exercise.instruction = value;
    else if (field === 'description') exercise.description = value;
    else if (field === 'content') exercise.content = value;
    else if (field === 'media_url') exercise.media_url = value;
    else if (field === 'time_limit') exercise.time_limit = parseInt(value) || 1800;
    else if (field === 'max_attempts') exercise.max_attempts = parseInt(value) || 3;
    else if (field === 'passing_score') exercise.passing_score = value;
    else if (field === 'ordering') exercise.ordering = parseInt(value) || 1;
    else if (field === 'is_active') exercise.is_active = value.toLowerCase() === 'true';
  }

  // Parse questions table
  const headerLine = lines[questionsStartIndex];
  const headers = parseCsvLine(headerLine).map(h => h.toLowerCase().trim());
  
  const getColIndex = (name: string): number => {
    return headers.findIndex(h => h.includes(name));
  };
  
  const colIndices = {
    question_order: getColIndex('question_order'),
    question_text: getColIndex('question_text'),
    question_type: getColIndex('question_type'),
    points: getColIndex('points'),
    explanation: getColIndex('explanation'),
    option_text: getColIndex('option_text'),
    is_correct: getColIndex('is_correct'),
    option_order: getColIndex('option_order'),
    correct_answer: getColIndex('correct_answer'),
    alternative_answers: getColIndex('alternative'),
    image_url: getColIndex('image_url'),
    audio_url: getColIndex('audio_url'),
    reading_passage: getColIndex('reading_passage'),
  };

  // Group rows by question_order
  const questionMap = new Map<number, JsonQuestion>();
  
  for (let i = questionsStartIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.includes('===') || line.includes('---')) continue;
    
    const cells = parseCsvLine(line);
    if (cells.length < 3) continue;
    
    const orderStr = cells[colIndices.question_order] || '';
    const questionOrder = parseInt(orderStr);
    if (isNaN(questionOrder) || questionOrder <= 0) continue;
    
    // Get or create question
    if (!questionMap.has(questionOrder)) {
      const questionText = cells[colIndices.question_text] || '';
      const questionType = (cells[colIndices.question_type] || 'multiple_choice').toLowerCase();
      
      const validTypes = ['multiple_choice', 'drop_list', 'droplist', 'fill_blank'];
      if (!validTypes.includes(questionType)) continue;
      
      questionMap.set(questionOrder, {
        question_text: questionText,
        question_type: questionType === 'drop_list' ? 'droplist' : questionType as JsonQuestion['question_type'],
        ordering: questionOrder,
        points: parseInt(cells[colIndices.points]) || 1,
        explanation: cells[colIndices.explanation] || '',
        image_url: cells[colIndices.image_url] || '',
        audio_url: cells[colIndices.audio_url] || '',
        reading_passage: cells[colIndices.reading_passage] || '',
        options: [],
      });
    }
    
    const question = questionMap.get(questionOrder)!;
    
    // Handle fill_blank
    if (question.question_type === 'fill_blank') {
      if (!question.correct_answer) {
        question.correct_answer = cells[colIndices.correct_answer] || '';
        const altAnswers = cells[colIndices.alternative_answers] || '';
        if (altAnswers) {
          question.alternative_answers = altAnswers.split(';').map(a => a.trim()).filter(a => a);
        }
      }
    }
    // Handle multiple_choice and droplist options
    else {
      const optionText = cells[colIndices.option_text] || '';
      if (optionText) {
        const isCorrectStr = (cells[colIndices.is_correct] || 'false').toLowerCase();
        const isCorrect = isCorrectStr === 'true' || isCorrectStr === '1' || isCorrectStr === 'yes';
        const optionOrderStr = cells[colIndices.option_order] || '';
        const optionOrdering = optionOrderStr ? parseInt(optionOrderStr) : question.options!.length;
        
        question.options!.push({
          option_text: optionText,
          is_correct: isCorrect,
          ordering: optionOrdering,
          explanation: '',
          point: '1',
        });
      }
    }
  }

  // Validate and add questions
  questionMap.forEach((question) => {
    if (!question.question_text) return;
    
    if (question.question_type === 'multiple_choice' || question.question_type === 'droplist') {
      if (!question.options || question.options.length === 0) return;
      const hasCorrect = question.options.some(opt => opt.is_correct);
      if (!hasCorrect) return;
    } else if (question.question_type === 'fill_blank') {
      if (!question.correct_answer) return;
    }
    
    exercise.questions.push(question);
  });

  exercise.questions.sort((a, b) => a.ordering - b.ordering);

  if (exercise.questions.length === 0) {
    throw new Error('No valid questions found in CSV file');
  }

  console.log(`Parsed custom CSV successfully: ${exercise.questions.length} questions found`);
  return exercise;
}

/**
 * Parse a CSV line handling quoted fields with commas
 */

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

// CSV Example Template - Quizizz format (easy to edit in Excel/Google Sheets)
export const EXAMPLE_CSV = `Question Text,Question Type,Option 1,Option 2,Option 3,Option 4,Option 5,Correct Answer,Time in seconds,Answer Explanation
What is the main idea of the passage?,Multiple Choice,The history of technology,The impact of technology on modern life,How to use digital devices,Future inventions,,2,20,The passage discusses both advantages and disadvantages of technology.
One benefit of technology mentioned is ____.,Multiple Choice,global connectivity,less communication,social isolation,,,1,20,
Fill in the blank: Technology has transformed the way people _____ and work.,Fill-in-the-Blank,communicate,Communicate,COMMUNICATE,,,1,20,The passage states technology has transformed communication.
Which concern is raised about technology?,Multiple Choice,Increased efficiency,Reduced face-to-face interaction,Better education,Faster learning,,2,20,
Fill in the blank: Some people worry about dependence on digital _____.,Fill-in-the-Blank,devices,Devices,DEVICES,,,1,20,The passage mentions dependence on digital devices.

Exercise Metadata (Optional - add these fields if needed):
Title: IELTS Reading Practice Test - Extended
Instruction: Read the passage and answer the questions below
Description: IELTS Reading with Multiple Choice, Fill in the Blank
Content: Technology has transformed the way people communicate, work, and learn. While it offers many benefits such as efficiency and global connectivity, it also raises concerns about reduced face-to-face interaction and dependence on digital devices.
Time Limit: 1800
Max Attempts: 1
Passing Score: 70
Ordering: 1
Is Active: true
`;


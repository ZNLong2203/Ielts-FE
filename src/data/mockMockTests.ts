// Mock data for Mock Tests APIs
export const mockMockTests = [
  {
    id: "1",
    title: "IELTS Academic Practice Test #1",
    description:
      "Complete practice test with all four skills - Reading, Writing, Listening, Speaking",
    type: "Academic",
    duration: 165, // minutes
    totalQuestions: 40,
    difficulty: "Intermediate",
    sections: [
      {
        id: "1",
        name: "Listening",
        duration: 30,
        questionCount: 40,
        order: 1,
      },
      {
        id: "2",
        name: "Reading",
        duration: 60,
        questionCount: 40,
        order: 2,
      },
      {
        id: "3",
        name: "Writing",
        duration: 60,
        questionCount: 2,
        order: 3,
      },
      {
        id: "4",
        name: "Speaking",
        duration: 15,
        questionCount: 3,
        order: 4,
      },
    ],
    isPublished: true,
    isFree: false,
    price: 49,
    completionCount: 1247,
    averageScore: 6.5,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-11-25T15:30:00Z",
  },
  {
    id: "2",
    title: "IELTS General Training Practice Test #1",
    description:
      "Comprehensive General Training test focusing on everyday English skills",
    type: "General Training",
    duration: 165,
    totalQuestions: 40,
    difficulty: "Beginner",
    sections: [
      {
        id: "5",
        name: "Listening",
        duration: 30,
        questionCount: 40,
        order: 1,
      },
      {
        id: "6",
        name: "Reading",
        duration: 60,
        questionCount: 40,
        order: 2,
      },
      {
        id: "7",
        name: "Writing",
        duration: 60,
        questionCount: 2,
        order: 3,
      },
      {
        id: "8",
        name: "Speaking",
        duration: 15,
        questionCount: 3,
        order: 4,
      },
    ],
    isPublished: true,
    isFree: true,
    price: 0,
    completionCount: 923,
    averageScore: 6.2,
    createdAt: "2024-02-15T14:30:00Z",
    updatedAt: "2024-11-20T11:45:00Z",
  },
  {
    id: "3",
    title: "IELTS Speaking Practice Test",
    description:
      "Focused speaking practice with all three parts of the IELTS Speaking test",
    type: "Speaking Only",
    duration: 15,
    totalQuestions: 12,
    difficulty: "All Levels",
    sections: [
      {
        id: "9",
        name: "Speaking Part 1",
        duration: 5,
        questionCount: 4,
        order: 1,
      },
      {
        id: "10",
        name: "Speaking Part 2",
        duration: 4,
        questionCount: 1,
        order: 2,
      },
      {
        id: "11",
        name: "Speaking Part 3",
        duration: 6,
        questionCount: 7,
        order: 3,
      },
    ],
    isPublished: true,
    isFree: false,
    price: 19,
    completionCount: 756,
    averageScore: 6.8,
    createdAt: "2024-03-10T09:20:00Z",
    updatedAt: "2024-11-18T16:10:00Z",
  },
];

export const mockTestResults = [
  {
    id: "1",
    mockTestId: "1",
    studentId: "1",
    completedAt: "2024-12-01T14:30:00Z",
    totalScore: 7.0,
    scoresBreakdown: {
      listening: 7.5,
      reading: 6.5,
      writing: 6.5,
      speaking: 7.5,
    },
    timeSpent: 158, // minutes
    answers: {
      correct: 32,
      incorrect: 8,
      skipped: 0,
    },
    feedback:
      "Good overall performance. Focus on improving reading speed and writing task achievement.",
  },
  {
    id: "2",
    mockTestId: "2",
    studentId: "2",
    completedAt: "2024-12-02T10:15:00Z",
    totalScore: 7.5,
    scoresBreakdown: {
      listening: 8.0,
      reading: 7.0,
      writing: 7.0,
      speaking: 8.0,
    },
    timeSpent: 152,
    answers: {
      correct: 36,
      incorrect: 4,
      skipped: 0,
    },
    feedback:
      "Excellent performance across all skills. Ready for the actual test.",
  },
];

export const mockTestStats = {
  totalMockTests: 89,
  publishedTests: 78,
  draftTests: 11,
  freeTests: 23,
  paidTests: 55,
  totalCompletions: 5678,
  averageScore: 6.4,
  averageCompletionTime: 155,
  popularTestTypes: [
    { type: "Academic", count: 45, percentage: 57 },
    { type: "General Training", count: 25, percentage: 32 },
    { type: "Speaking Only", count: 9, percentage: 11 },
  ],
};

export const mockMockTestsWithPagination = (
  page = 1,
  limit = 10,
  search = ""
) => {
  let filteredTests = mockMockTests;

  if (search) {
    filteredTests = mockMockTests.filter(
      (test) =>
        test.title.toLowerCase().includes(search.toLowerCase()) ||
        test.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  return {
    mockTests: paginatedTests,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredTests.length,
      total_pages: Math.ceil(filteredTests.length / limit),
      has_next_page: endIndex < filteredTests.length,
      has_prev_page: page > 1,
    },
  };
};

export const mockTestResultsWithPagination = (
  page = 1,
  limit = 10,
  studentId?: string
) => {
  let filteredResults = mockTestResults;

  if (studentId) {
    filteredResults = mockTestResults.filter(
      (result) => result.studentId === studentId
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  return {
    results: paginatedResults,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredResults.length,
      total_pages: Math.ceil(filteredResults.length / limit),
      has_next_page: endIndex < filteredResults.length,
      has_prev_page: page > 1,
    },
  };
};

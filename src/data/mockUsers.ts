// Mock data for Users APIs
export const mockStudents = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    avatar: "/avatars/student1.jpg",
    dateOfBirth: "1995-06-15",
    phoneNumber: "+1234567890",
    country: "United States",
    targetScore: 7.5,
    currentLevel: "Intermediate",
    enrolledCourses: 3,
    completedTests: 12,
    totalStudyHours: 45,
    joinedDate: "2024-09-15T10:30:00Z",
    lastActiveDate: "2024-12-04T14:20:00Z",
    isActive: true,
    subscription: {
      plan: "Premium",
      expiryDate: "2025-06-15T00:00:00Z",
      isActive: true,
    },
  },
  {
    id: "2",
    email: "sarah.wilson@example.com",
    name: "Sarah Wilson",
    avatar: "/avatars/student2.jpg",
    dateOfBirth: "1992-03-22",
    phoneNumber: "+1987654321",
    country: "Canada",
    targetScore: 8.0,
    currentLevel: "Advanced",
    enrolledCourses: 5,
    completedTests: 24,
    totalStudyHours: 78,
    joinedDate: "2024-07-20T09:15:00Z",
    lastActiveDate: "2024-12-03T16:45:00Z",
    isActive: true,
    subscription: {
      plan: "Premium",
      expiryDate: "2025-07-20T00:00:00Z",
      isActive: true,
    },
  },
  {
    id: "3",
    email: "mike.chen@example.com",
    name: "Mike Chen",
    avatar: "/avatars/student3.jpg",
    dateOfBirth: "1998-11-08",
    phoneNumber: "+8612345678",
    country: "China",
    targetScore: 7.0,
    currentLevel: "Intermediate",
    enrolledCourses: 2,
    completedTests: 8,
    totalStudyHours: 32,
    joinedDate: "2024-10-10T14:30:00Z",
    lastActiveDate: "2024-12-04T10:15:00Z",
    isActive: true,
    subscription: {
      plan: "Basic",
      expiryDate: "2025-01-10T00:00:00Z",
      isActive: true,
    },
  },
];

export const mockTeachers = [
  {
    id: "1",
    email: "dr.wilson@ieltsexpert.com",
    name: "Dr. Sarah Wilson",
    avatar: "/avatars/instructor1.jpg",
    phoneNumber: "+1555123456",
    bio: "IELTS Expert with 15+ years of teaching experience. Former IELTS examiner with deep understanding of test requirements.",
    qualification:
      "PhD in Applied Linguistics, CELTA, IELTS Examiner Certificate",
    experience: 15,
    specialization: [
      "Academic Writing",
      "Test Strategies",
      "Band Score Improvement",
    ],
    coursesCreated: 8,
    totalStudents: 2456,
    averageRating: 4.9,
    totalEarnings: 125680,
    joinedDate: "2023-01-15T00:00:00Z",
    isActive: true,
    isVerified: true,
  },
  {
    id: "2",
    email: "michael.chen@speakingpro.com",
    name: "Michael Chen",
    avatar: "/avatars/instructor2.jpg",
    phoneNumber: "+1555789012",
    bio: "Speaking Coach and IELTS Examiner specializing in fluency and pronunciation improvement.",
    qualification:
      "MA in TESOL, IELTS Examiner Certificate, Pronunciation Specialist Certification",
    experience: 12,
    specialization: ["Speaking Skills", "Pronunciation", "Fluency Development"],
    coursesCreated: 6,
    totalStudents: 1923,
    averageRating: 4.8,
    totalEarnings: 89420,
    joinedDate: "2023-03-20T00:00:00Z",
    isActive: true,
    isVerified: true,
  },
  {
    id: "3",
    email: "emma.davis@writingmaster.com",
    name: "Emma Davis",
    avatar: "/avatars/instructor3.jpg",
    phoneNumber: "+1555345678",
    bio: "Academic Writing Specialist with expertise in helping students achieve Band 7+ scores in IELTS Writing.",
    qualification:
      "MA in Academic Writing, IELTS Training Certificate, Academic English Specialist",
    experience: 10,
    specialization: ["Academic Writing", "Essay Structure", "Task Achievement"],
    coursesCreated: 4,
    totalStudents: 1567,
    averageRating: 4.7,
    totalEarnings: 67890,
    joinedDate: "2023-05-10T00:00:00Z",
    isActive: true,
    isVerified: true,
  },
];

export const mockUserStats = {
  totalStudents: 2847,
  totalTeachers: 45,
  activeStudents: 2456,
  activeTeachers: 42,
  newStudentsThisMonth: 234,
  newTeachersThisMonth: 3,
  studentsGrowthRate: 12.5,
  teachersGrowthRate: 8.7,
};

export const mockStudentsWithPagination = (
  page = 1,
  limit = 10,
  search = ""
) => {
  let filteredStudents = mockStudents;

  if (search) {
    filteredStudents = mockStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  return {
    students: paginatedStudents,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredStudents.length,
      total_pages: Math.ceil(filteredStudents.length / limit),
      has_next_page: endIndex < filteredStudents.length,
      has_prev_page: page > 1,
    },
  };
};

export const mockTeachersWithPagination = (
  page = 1,
  limit = 10,
  search = ""
) => {
  let filteredTeachers = mockTeachers;

  if (search) {
    filteredTeachers = mockTeachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  return {
    teachers: paginatedTeachers,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredTeachers.length,
      total_pages: Math.ceil(filteredTeachers.length / limit),
      has_next_page: endIndex < filteredTeachers.length,
      has_prev_page: page > 1,
    },
  };
};

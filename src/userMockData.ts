import { IUser } from './interface/user';
import { ITeacher } from './interface/teacher';
import { IProfile } from './interface/student';

// Mock Users Data theo schema
export const mockUsers: IUser[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // UUID format
    email: "john.doe@email.com",
    password: "$2b$10$hashedPassword123", // Hashed password
    role: "student",
    status: "active",
    email_verified: true,
    email_verification_token: "",
    password_reset_token: "",
    password_reset_expires: undefined,
    last_login: new Date("2024-07-05T14:20:00Z"),
    login_count: 15,
    created_at: new Date("2024-01-15T08:30:00Z"),
    updated_at: new Date("2024-07-01T10:15:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "jane.smith@email.com",
    password: "$2b$10$anotherHashedPassword",
    role: "teacher",
    status: "active",
    email_verified: true,
    email_verification_token: "",
    password_reset_token: "",
    password_reset_expires: undefined,
    last_login: new Date("2024-07-05T09:30:00Z"),
    login_count: 42,
    created_at: new Date("2023-09-20T09:00:00Z"),
    updated_at: new Date("2024-07-04T16:45:00Z")
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "alex.wilson@email.com",
    password: "$2b$10$pendingUserPassword",
    role: "student",
    status: "pending",
    email_verified: false,
    email_verification_token: "evt_abc123def456ghi789",
    password_reset_token: "",
    password_reset_expires: undefined,
    last_login: new Date("2024-07-01T12:00:00Z"),
    login_count: 0,
    created_at: new Date("2024-07-01T12:00:00Z"),
    updated_at: new Date("2024-07-01T12:00:00Z")
  }
];

// Mock User với Profile (như API response với include)
export const mockUserWithProfile: IUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "john.doe@email.com",
  password: "$2b$10$hashedPassword123",
  role: "student",
  status: "active",
  email_verified: true,
  email_verification_token: "",
  password_reset_token: "",
  password_reset_expires: undefined,
  last_login: new Date("2024-07-05T14:20:00Z"),
  login_count: 15,
  created_at: new Date("2024-01-15T08:30:00Z"),
  updated_at: new Date("2024-07-01T10:15:00Z"),
  
  // Include profile
  profile: {
    id: "550e8400-e29b-41d4-a716-446655440101",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    full_name: "John Doe",
    avatar: "https://example.com/avatars/john-doe.jpg",
    phone: "+1-555-123-4567",
    date_of_birth: new Date("1995-03-15"),
    gender: "Male",
    bio: "Passionate about learning English and preparing for IELTS",
    country: "Vietnam"

  }
};

// Mock User với Teacher relation
export const mockUserWithTeacher: IUser = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  email: "jane.smith@email.com",
  password: "$2b$10$teacherHashedPassword",
  role: "teacher",
  status: "active",
  email_verified: true,
  last_login: new Date("2024-07-05T09:30:00Z"),
  login_count: 42,
  created_at: new Date("2023-09-20T09:00:00Z"),
  updated_at: new Date("2024-07-04T16:45:00Z"),
  
  // Include profile và teacher
  profile: {
    id: "550e8400-e29b-41d4-a716-446655440102",
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    full_name: "Jane Smith",
    avatar: "https://example.com/avatars/jane-smith.jpg",
    phone: "+44-20-7946-0958",
    date_of_birth: new Date("1988-07-22"),
    gender: "Female",
    bio: "Experienced IELTS instructor",
    country: "United Kingdom",

  },
  
  teacher: {
    id: "550e8400-e29b-41d4-a716-446655440201",
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    qualification: "Master's in English Literature, TESOL Certified",
    experience_years: 8,
    specializations: ["IELTS Writing", "IELTS Speaking", "Academic English"],
    ielts_band_score: 8.5,
    certification_urls: [
      "https://example.com/cert1.pdf",
      "https://example.com/cert2.pdf"
    ],
    teaching_style: "Interactive and student-centered approach",
    hourly_rate: 45,
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      timeSlots: ["09:00-12:00", "14:00-17:00", "19:00-21:00"]
    },
    ratings: 4.8,
    total_students: 156,
    total_courses: 12,
    is_verified: true,
  }
};
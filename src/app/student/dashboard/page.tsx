"use client"

import { DashboardStats } from "@/components/student/dashboard/DashboardStats"
import { LearningPathCard } from "@/components/student/dashboard/LearningPathCard"
import { StudyTips } from "@/components/student/dashboard/StudyTips"

const activeLearningPaths = [
  {
    id: "1",
    title: "IELTS 5.0 → 6.0 Foundation",
    description: "Build strong fundamentals across all four skills",
    level: "Beginner to Intermediate",
    progress: 75,
    totalCourses: 4,
    completedCourses: 3,
    estimatedTime: "8-10 weeks",
    enrolledStudents: 2847,
    purchaseDate: "2024-01-15",
    rating: 4.8,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    courses: [
      {
        id: "1",
        title: "IELTS Listening Fundamentals",
        skill: "Listening",
        duration: "3 weeks",
        progress: 100,
        isCompleted: true,
        lessons: 15,
      },
      {
        id: "2",
        title: "IELTS Reading Strategies",
        skill: "Reading",
        duration: "3 weeks",
        progress: 100,
        isCompleted: true,
        lessons: 18,
      },
      {
        id: "3",
        title: "IELTS Writing Task 1 & 2",
        skill: "Writing",
        duration: "4 weeks",
        progress: 100,
        isCompleted: true,
        lessons: 22,
      },
      {
        id: "4",
        title: "IELTS Speaking Confidence",
        skill: "Speaking",
        duration: "2 weeks",
        progress: 45,
        isCompleted: false,
        lessons: 12,
      },
    ],
  },
  {
    id: "2",
    title: "IELTS 6.0 → 7.0 Advanced",
    description: "Master advanced techniques for higher band scores",
    level: "Intermediate to Advanced",
    progress: 30,
    totalCourses: 4,
    completedCourses: 1,
    estimatedTime: "10-12 weeks",
    enrolledStudents: 1923,
    purchaseDate: "2024-02-01",
    rating: 4.9,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    courses: [
      {
        id: "5",
        title: "Advanced Listening Techniques",
        skill: "Listening",
        duration: "4 weeks",
        progress: 100,
        isCompleted: true,
        lessons: 20,
      },
      {
        id: "6",
        title: "Complex Reading Comprehension",
        skill: "Reading",
        duration: "4 weeks",
        progress: 25,
        isCompleted: false,
        lessons: 24,
      },
      {
        id: "7",
        title: "Academic Writing Mastery",
        skill: "Writing",
        duration: "5 weeks",
        progress: 0,
        isCompleted: false,
        lessons: 28,
      },
      {
        id: "8",
        title: "Fluent Speaking Practice",
        skill: "Speaking",
        duration: "3 weeks",
        progress: 0,
        isCompleted: false,
        lessons: 16,
      },
    ],
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600 mt-2">
              Ready to continue your IELTS journey? Let&apos;s achieve your target band score.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Level</div>
            <div className="text-2xl font-bold text-blue-600">Band 5.5</div>
            <div className="text-sm text-gray-500">Target: Band 7.0</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Learning Paths</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>

          {activeLearningPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>

        {/* Study Tips */}
        <div>
          <StudyTips />
        </div>
      </div>
    </div>
  )
}

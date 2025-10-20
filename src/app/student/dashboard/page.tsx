"use client"

import { DashboardStats } from "@/components/student/dashboard/DashboardStats"
import { LearningPathCard } from "@/components/student/dashboard/LearningPathCard"
import { StudyTips } from "@/components/student/dashboard/StudyTips"
import { useStudent } from "@/context/StudentContext"

export default function DashboardPage() {
  const { studentData, loading, error } = useStudent()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error || "Failed to load dashboard"}</p>
        </div>
      </div>
    )
  }

  const { student, stats, comboEnrollments } = studentData

  // Transform combo enrollments to learning paths format
  const activeLearningPaths = comboEnrollments.map((enrollment) => ({
    id: enrollment.id,
    title: enrollment.combo.name,
    description: enrollment.combo.description || "",
    level: `Band ${student.current_level ? Number(student.current_level).toFixed(1) : 0} → ${student.target_ielts_score ? Number(student.target_ielts_score).toFixed(1) : 0}`,
    progress: Number(enrollment.overall_progress_percentage) || 0,
    totalCourses: enrollment.combo.total_courses,
    completedCourses: enrollment.combo.completed_courses,
    estimatedTime: `${enrollment.courses.reduce((acc: number, c) => acc + (c.estimated_duration || 0), 0)} hours`,
    enrolledStudents: enrollment.combo.enrollment_count,
    purchaseDate: new Date(enrollment.enrollment_date).toISOString().split("T")[0],
    rating: 4.8, // TODO: Add rating to combo in backend
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    courses: enrollment.courses.map((course) => ({
      id: course.id,
      title: course.title,
      skill: course.skill_focus || "General",
      duration: `${course.estimated_duration || 0} hours`,
      progress: course.progress,
      isCompleted: course.is_completed,
      lessons: course.total_lessons,
    })),
  }))

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {student.full_name || "Student"}!
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to continue your IELTS journey? Let&apos;s achieve your target band score.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Level</div>
            <div className="text-2xl font-bold text-blue-600">
              Band {student.current_level ? Number(student.current_level).toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              Target: Band {student.target_ielts_score ? Number(student.target_ielts_score).toFixed(1) : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Learning Paths</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>

          {activeLearningPaths.length > 0 ? (
            activeLearningPaths.map((path) => <LearningPathCard key={path.id} path={path} />)
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No learning paths enrolled yet.</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Study Tips */}
        <div>
          <StudyTips />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Play, CheckCircle, Clock, Users, Star } from "lucide-react"

interface Course {
  id: string
  title: string
  skill: string
  duration: string
  progress: number
  isCompleted: boolean
  lessons: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  level: string
  progress: number
  totalCourses: number
  completedCourses: number
  estimatedTime: string
  enrolledStudents: number
  purchaseDate: string
  rating: number
  bgColor: string
  textColor: string
  courses: Course[]
}

interface LearningPathCardProps {
  path: LearningPath
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleContinue = () => {
    router.push(`/student/dashboard/learning-paths/${path.id}`)
  }

  const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case "listening":
        return "bg-blue-100 text-blue-700"
      case "reading":
        return "bg-green-100 text-green-700"
      case "writing":
        return "bg-purple-100 text-purple-700"
      case "speaking":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200`}
    >
      {/* Header */}
      <div className={`${path.bgColor} p-6 border-b border-gray-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
            <p className="text-gray-600 mb-4">{path.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {path.estimatedTime}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {path.enrolledStudents.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {path.rating}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                {path.completedCourses} of {path.totalCourses} courses completed
              </span>
              <span className={`text-sm font-medium ${path.textColor}`}>{path.progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full ${path.textColor.replace("text-", "bg-")} transition-all duration-500`}
                style={{ width: `${path.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-sm font-medium">{isExpanded ? "Hide Courses" : "View Courses"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={handleContinue}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
              path.progress === 0
                ? "bg-blue-600 hover:bg-blue-700"
                : path.progress === 100
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {path.progress === 0 ? "Start Learning" : path.progress === 100 ? "Review" : "Continue"}
          </button>
        </div>
      </div>

      {/* Expanded Courses */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid gap-4">
            {path.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {course.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Play className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(course.skill)}`}>
                        {course.skill}
                      </span>
                      <span className="text-sm text-gray-500">{course.lessons} lessons</span>
                      <span className="text-sm text-gray-500">{course.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{course.progress}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          course.isCompleted ? "bg-emerald-500" : "bg-blue-500"
                        } transition-all duration-300`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      course.isCompleted
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : course.progress > 0
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {course.isCompleted ? "Review" : course.progress > 0 ? "Continue" : "Start"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

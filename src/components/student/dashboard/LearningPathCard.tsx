"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Play, CheckCircle, Clock, Users } from "lucide-react"

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

  const handleCourseClick = (courseId: string) => {
    router.push(`/student/courses/${courseId}`)
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
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Title & Description */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{path.title}</h3>
              <p className="text-slate-600 text-lg leading-relaxed">{path.description}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Duration</div>
                    <div className="text-lg font-bold text-slate-800">{path.estimatedTime}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Students</div>
                    <div className="text-lg font-bold text-slate-800">{path.enrolledStudents.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 font-semibold">
                  {path.completedCourses} of {path.totalCourses} courses completed
                </span>
                <span className="text-blue-600 font-bold text-lg">{path.progress}%</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-700 ease-out"
                    style={{ width: `${path.progress}%` }}
                  />
                </div>
                {/* Progress milestones */}
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Start</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
          >
            <span>{isExpanded ? "Hide Courses" : "View Courses"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={handleContinue}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
              path.progress === 0
                ? "bg-blue-600 hover:bg-blue-700"
                : path.progress === 100
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-800 hover:bg-slate-900"
            }`}
          >
            {path.progress === 0 ? "Start Learning" : path.progress === 100 ? "Review" : "Continue"}
          </button>
        </div>
      </div>

      {/* Expanded Courses */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Course Details</h4>
            <div className="space-y-4">
              {path.courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                        course.isCompleted ? "bg-emerald-100" : "bg-blue-100"
                      }`}>
                        {course.isCompleted ? (
                          <CheckCircle className="w-7 h-7 text-emerald-600" />
                        ) : (
                          <Play className="w-7 h-7 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">{course.title}</h5>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillColor(course.skill)}`}>
                            {course.skill}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">{course.lessons} lessons</span>
                          <span className="text-sm text-slate-500 font-medium">{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 mb-1">{course.progress}%</div>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              course.isCompleted ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          course.isCompleted
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : course.progress > 0
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                      >
                        {course.isCompleted ? "Review" : course.progress > 0 ? "Continue" : "Start"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

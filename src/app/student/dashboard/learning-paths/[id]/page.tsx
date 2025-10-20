"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowLeft, Clock, Users, Star, CheckCircle, BookOpen, Award, TrendingUp } from "lucide-react"
import { getStudentComboEnrollments } from "@/api/student"
import { IComboEnrollment } from "@/interface/student"
import { selectUserId } from "@/redux/features/user/userSlice"
import Image from "next/image"
import Link from "next/link" 

export default function LearningPathDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathId = params.id as string
  
  // Get userId from Redux store
  const userId = useSelector(selectUserId)

  const [comboEnrollment, setComboEnrollment] = useState<IComboEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComboEnrollment = async () => {
      try {
        setLoading(true)
        
        // Check if user is authenticated
        if (!userId) {
          setError("Please login to view your learning paths")
          setLoading(false)
          return
        }
        
        const data = await getStudentComboEnrollments(userId)
        const combo = data.find((c: IComboEnrollment) => c.id === pathId)
        if (!combo) {
          setError("Learning path not found")
        } else {
          setComboEnrollment(combo)
        }
      } catch (err) {
        console.error("Error fetching combo enrollment:", err)
        setError("Failed to load learning path")
      } finally {
        setLoading(false)
      }
    }

    fetchComboEnrollment()
  }, [pathId, userId])

  const getSkillColor = (skill: string | undefined) => {
    switch (skill?.toLowerCase()) {
      case "listening":
        return { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" }
      case "reading":
        return { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-700" }
      case "writing":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-700",
        }
      case "speaking":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          badge: "bg-orange-100 text-orange-700",
        }
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", badge: "bg-gray-100 text-gray-700" }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning path...</p>
        </div>
      </div>
    )
  }

  if (error || !comboEnrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Learning path not found"}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { combo, courses, enrollment_date, overall_progress_percentage } = comboEnrollment

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/student/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Learning Path Header - Enhanced Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative p-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium mb-6 shadow-lg">
                <BookOpen className="w-4 h-4" />
                <span>Learning Path</span>
                <Award className="w-4 h-4 ml-2" />
              </div>

              {/* Title & Description */}
              <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                {combo.name}
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
                {combo.description}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100">Duration</div>
                      <div className="text-lg font-bold">
                        {courses?.reduce((acc, c) => acc + (c.estimated_duration || 0), 0)}h
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100">Courses</div>
                      <div className="text-lg font-bold">{combo.total_courses}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100">Students</div>
                      <div className="text-lg font-bold">
                        {combo.enrollment_count?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100">Rating</div>
                      <div className="text-lg font-bold">4.8/5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
                      <p className="text-sm text-gray-600">
                        {combo.completed_courses} of {combo.total_courses} courses completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {Number(overall_progress_percentage).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-700 ease-out relative overflow-hidden"
                      style={{ width: `${overall_progress_percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  {/* Progress Milestones */}
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Start</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>Complete</span>
                  </div>
                </div>
              </div>

              {/* Enrollment Date */}
              <div className="mt-6 flex items-center gap-2 text-blue-100">
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                <span className="text-sm">
                  Enrolled on{" "}
                  {new Date(enrollment_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List - Enhanced Design */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Courses in this Learning Path
            </h2>
            <p className="text-gray-600">
              Complete all courses to master your target IELTS band score
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">
              {combo.total_courses} Total Courses
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {courses?.map((course, index) => {
            const skillColors = getSkillColor(course.skill_focus)
            const isCompleted = course.is_completed
            const hasStarted = course.progress > 0

            return (
              <div
                key={course.id}
                className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  isCompleted
                    ? "border-2 border-emerald-400 shadow-lg shadow-emerald-100"
                    : hasStarted
                      ? "border-2 border-blue-400 shadow-lg shadow-blue-100"
                      : "border-2 border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Status Badge */}
                {(isCompleted || hasStarted) && (
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm shadow-lg ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span>In Progress</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 p-6">
                  {/* Course Number Badge */}
                  <div
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl ${
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-200"
                        : hasStarted
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200"
                          : "bg-gradient-to-br from-gray-200 to-gray-300"
                    } flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-10 h-10 text-white" />
                    ) : (
                      <span
                        className={`text-2xl font-extrabold ${
                          hasStarted ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Course Thumbnail with Overlay */}
                  <div className="relative flex-shrink-0 group/thumb">
                    <Image
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      width={180}
                      height={140}
                      className="w-44 h-32 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                    {/* Skill Badge on Image */}
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${skillColors.badge} border border-white/50`}
                      >
                        {course.skill_focus || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {course.teacher?.charAt(0) || "I"}
                          </span>
                        </div>
                        <p className="text-sm font-medium">by {course.teacher || "IELTS Academy"}</p>
                      </div>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">
                          {course.estimated_duration || 0}h
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">
                          {course.total_lessons} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {course.enrollment_count?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Progress Section */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500"
                                : hasStarted
                                  ? "bg-blue-500 animate-pulse"
                                  : "bg-gray-400"
                            }`}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {course.completed_lessons} of {course.total_lessons} lessons completed
                          </span>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            isCompleted
                              ? "text-emerald-600"
                              : hasStarted
                                ? "text-blue-600"
                                : "text-gray-500"
                          }`}
                        >
                          {course.progress}%
                        </span>
                      </div>
                      
                      {/* Gradient Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-3 rounded-full transition-all duration-700 ease-out ${
                              isCompleted
                                ? "bg-gradient-to-r from-emerald-400 to-green-600"
                                : hasStarted
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                                  : "bg-gray-400"
                            } relative`}
                            style={{ width: `${course.progress}%` }}
                          >
                            {hasStarted && (
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button - Enhanced */}
                    <div className="flex items-center justify-end">
                      <Link href={`/student/courses/${course.id}`}>
                        <button
                          className={`group/btn px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                            isCompleted
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                              : hasStarted
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                                : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Review Course
                              </>
                            ) : hasStarted ? (
                              <>
                                <TrendingUp className="w-5 h-5" />
                                Continue Learning
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-5 h-5" />
                                Start Course
                              </>
                            )}
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

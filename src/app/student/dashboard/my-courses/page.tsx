"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Search, Grid3X3, List, Clock, Play, CheckCircle, BookOpen } from "lucide-react"
import { getStudentComboEnrollments } from "@/api/student"
import { IComboEnrollment } from "@/interface/student"
import { selectUserId } from "@/redux/features/user/userSlice"
import Image from "next/image"

// Interface for flattened course from combo
interface CourseWithComboInfo {
  id: string
  title: string
  thumbnail: string | null
  skill_focus: string | null
  teacher: string | null
  estimated_duration: number
  enrollment_count: number
  total_lessons: number
  completed_lessons: number
  progress: number
  comboName: string
  comboId: string
  enrollment_date: Date
  completion_date: Date | null
}

export default function MyCoursesPage() {
  // Get userId from Redux store
  const userId = useSelector(selectUserId)
  const router = useRouter()
  
  const [allCourses, setAllCourses] = useState<CourseWithComboInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkill, setFilterSkill] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const handleCourseClick = (courseId: string) => {
    router.push(`/student/courses/${courseId}`)
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        
        // Check if user is authenticated
        if (!userId) {
          setError("Please login to view your courses")
          setLoading(false)
          return
        }
        
        const data = await getStudentComboEnrollments(userId)

        // Flatten all courses from all combos
        const coursesFromCombos: CourseWithComboInfo[] = []
        const seenCourseIds = new Set<string>() // Deduplicate courses across combos

        data.forEach((combo: IComboEnrollment) => {
          combo.courses?.forEach((course) => {
            // Only add unique courses
            if (!seenCourseIds.has(course.id)) {
              seenCourseIds.add(course.id)
              coursesFromCombos.push({
                id: course.id,
                title: course.title,
                thumbnail: course.thumbnail || null,
                skill_focus: course.skill_focus || null,
                teacher: course.teacher || null,
                estimated_duration: course.estimated_duration || 0,
                enrollment_count: course.enrollment_count || 0,
                total_lessons: course.total_lessons,
                completed_lessons: course.completed_lessons,
                progress: course.progress,
                comboName: combo.combo.name,
                comboId: combo.combo.id,
                enrollment_date: combo.enrollment_date,
                completion_date: course.progress === 100 ? new Date() : null,
              })
            }
          })
        })

        setAllCourses(coursesFromCombos)
      } catch (err) {
        console.error("Error fetching combo enrollments:", err)
        setError("Failed to load courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [userId])

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.skill_focus?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesSkill =
      filterSkill === "all" || course.skill_focus?.toLowerCase() === filterSkill

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && course.completion_date) ||
      (filterStatus === "in-progress" && !course.completion_date && course.progress > 0) ||
      (filterStatus === "not-started" && course.progress === 0)

    return matchesSearch && matchesSkill && matchesStatus
  })


  const stats = {
    total: allCourses.length,
    completed: allCourses.filter((c) => c.completion_date).length,
    inProgress: allCourses.filter((c) => !c.completion_date && c.progress > 0).length,
    averageProgress: Math.round(
      allCourses.reduce((acc, c) => acc + c.progress, 0) / (allCourses.length || 1)
    ),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            </div>
            <p className="text-gray-600 mt-2 ml-11">Access and continue your individual course purchases</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="flex flex-row w-full gap-6">
        <div className="flex-1 bg-white rounded-xl border-l-4 border-l-blue-500 border border-gray-200 shadow-md p-6 hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm font-medium text-gray-600">Total Courses</div>
            </div>
            <div className="bg-blue-100 rounded-xl p-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border-l-4 border-l-indigo-500 border border-gray-200 shadow-md p-6 hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
              <div className="text-sm font-medium text-gray-600">Completed</div>
            </div>
            <div className="bg-indigo-100 rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border-l-4 border-l-amber-500 border border-gray-200 shadow-md p-6 hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgress}</div>
              <div className="text-sm font-medium text-gray-600">In Progress</div>
            </div>
            <div className="bg-amber-100 rounded-xl p-4">
              <Play className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Skills</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progress = course.progress
            const isCompleted = !!course.completion_date

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 shadow-md group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity z-10"></div>
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 shadow-sm border border-slate-200">
                      {course.skill_focus || "General"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    {isCompleted ? (
                      <div className="bg-indigo-600 text-white rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Play className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
                      <div
                        className={`h-full ${isCompleted ? "bg-indigo-600" : "bg-blue-600"} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-4">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 mb-5 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{course.estimated_duration || 0}h</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{course.total_lessons} lessons</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600 font-medium">
                        {course.completed_lessons} of {course.total_lessons} lessons
                      </span>
                      <span className={`font-bold ${isCompleted ? "text-indigo-600" : "text-blue-600"}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full ${isCompleted ? "bg-indigo-600" : "bg-blue-600"} transition-all duration-500 rounded-full`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-4">
                      <div className="font-medium mb-1">Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}</div>
                      <div className="text-gray-400">From: {course.comboName}</div>
                    </div>
                    <button
                      onClick={() => handleCourseClick(course.id)}
                      className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                        progress === 0
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : isCompleted
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {progress === 0 ? "Start Learning" : isCompleted ? "Review Course" : "Continue Learning"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const progress = course.progress
            const isCompleted = !!course.completion_date

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 shadow-md group"
              >
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      width={120}
                      height={120}
                      className="w-28 h-28 object-cover rounded-xl shadow-sm"
                    />
                    <div className="absolute -top-2 -right-2 z-10">
                      {isCompleted ? (
                        <div className="bg-indigo-600 text-white rounded-full p-2 shadow-lg">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <Play className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-xl mb-2">{course.title}</h3>
                      </div>
                      <div className="ml-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border ${
                          course.skill_focus?.toLowerCase() === 'listening' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : course.skill_focus?.toLowerCase() === 'reading'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : course.skill_focus?.toLowerCase() === 'writing'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : course.skill_focus?.toLowerCase() === 'speaking'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {course.skill_focus || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{course.estimated_duration || 0}h</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="text-gray-600">
                        {course.completed_lessons} of {course.total_lessons} lessons
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-600 font-medium">Progress</span>
                          <span className={`font-bold ${isCompleted ? "text-indigo-600" : "text-blue-600"}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full ${isCompleted ? "bg-indigo-600" : "bg-blue-600"} transition-all duration-500 rounded-full`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>From: {course.comboName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap ${
                          progress === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : isCompleted
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {progress === 0 ? "Start" : isCompleted ? "Review" : "Continue"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you&apos;re looking for</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Search, Grid3X3, List, Clock, Users, Play, CheckCircle } from "lucide-react"
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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

  const getSkillColor = (skill: string | undefined) => {
    switch (skill?.toLowerCase()) {
      case "listening":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
      case "reading":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
      case "writing":
        return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
      case "speaking":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" }
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    }
  }

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Access and continue your individual course purchases</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
        <div className="rounded-lg border border-emerald-200 p-6 bg-emerald-50">
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="rounded-lg border border-blue-200 p-6 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="rounded-lg border border-purple-200 p-6 bg-purple-50">
          <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
          <div className="text-sm text-gray-600">Average Progress</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const skillColors = getSkillColor(course.skill_focus ?? undefined)
            const progress = course.progress
            const isCompleted = !!course.completion_date

            return (
              <div
                key={course.id}
                className={`bg-white rounded-lg border ${skillColors.border} overflow-hidden hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="relative">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${skillColors.bg} ${skillColors.text}`}
                    >
                      {course.skill_focus || "General"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 bg-white rounded-full" />
                    ) : (
                      <Play className="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">by {course.teacher || "Unknown"}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {course.completed_lessons} of {course.total_lessons} lessons
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-blue-500"} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.estimated_duration || 0}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrollment_count?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <div>Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}</div>
                        <div className="text-gray-400 mt-1">From: {course.comboName}</div>
                      </div>
                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          progress === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : isCompleted
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-900 text-white hover:bg-gray-800"
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
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const skillColors = getSkillColor(course.skill_focus ?? undefined)
            const progress = course.progress
            const isCompleted = !!course.completion_date

            return (
              <div
                key={course.id}
                className={`bg-white rounded-lg border ${skillColors.border} p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2">
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600 bg-white rounded-full" />
                      ) : (
                        <Play className="w-6 h-6 text-blue-600 bg-blue-50 rounded-full p-1" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{course.title}</h3>
                        <p className="text-gray-600 text-sm">by {course.teacher || "Unknown"}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${skillColors.bg} ${skillColors.text}`}
                        >
                          {course.skill_focus || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.estimated_duration || 0}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrollment_count?.toLocaleString() || 0}
                      </div>
                      <div>
                        {course.completed_lessons} of {course.total_lessons} lessons
                      </div>
                      <div>Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}</div>
                      <div className="text-gray-400">From: {course.comboName}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-blue-500"} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          progress === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : isCompleted
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-900 text-white hover:bg-gray-800"
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
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

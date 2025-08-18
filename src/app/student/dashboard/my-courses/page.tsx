"use client"

import { useState } from "react"
import { Search, Grid3X3, List, Clock, Users, Star, Play, CheckCircle } from "lucide-react"

// Mock data for individual purchased courses
const purchasedCourses = [
  {
    id: "1",
    title: "IELTS Listening Fundamentals",
    instructor: "Sarah Johnson",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Listening",
    level: "Beginner",
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    duration: "3 weeks",
    rating: 4.8,
    enrolledStudents: 2847,
    isCompleted: true,
    purchaseDate: "2024-01-15",
    lastAccessed: "2 days ago",
    price: 49.99,
    learningPath: "IELTS 5.0 → 6.0 Foundation",
  },
  {
    id: "2",
    title: "IELTS Reading Strategies",
    instructor: "Michael Chen",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Reading",
    level: "Intermediate",
    progress: 85,
    totalLessons: 18,
    completedLessons: 15,
    duration: "3 weeks",
    rating: 4.9,
    enrolledStudents: 1923,
    isCompleted: false,
    purchaseDate: "2024-01-15",
    lastAccessed: "1 day ago",
    price: 59.99,
    learningPath: "IELTS 5.0 → 6.0 Foundation",
  },
  {
    id: "3",
    title: "IELTS Writing Task 1 & 2",
    instructor: "Emma Wilson",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Writing",
    level: "Intermediate",
    progress: 60,
    totalLessons: 22,
    completedLessons: 13,
    duration: "4 weeks",
    rating: 4.7,
    enrolledStudents: 1456,
    isCompleted: false,
    purchaseDate: "2024-01-15",
    lastAccessed: "3 days ago",
    price: 69.99,
    learningPath: "IELTS 5.0 → 6.0 Foundation",
  },
  {
    id: "4",
    title: "IELTS Speaking Confidence",
    instructor: "David Brown",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Speaking",
    level: "Beginner",
    progress: 30,
    totalLessons: 12,
    completedLessons: 4,
    duration: "2 weeks",
    rating: 4.6,
    enrolledStudents: 2156,
    isCompleted: false,
    purchaseDate: "2024-01-15",
    lastAccessed: "5 days ago",
    price: 39.99,
    learningPath: "IELTS 5.0 → 6.0 Foundation",
  },
  {
    id: "5",
    title: "Advanced Listening Techniques",
    instructor: "Lisa Anderson",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Listening",
    level: "Advanced",
    progress: 45,
    totalLessons: 20,
    completedLessons: 9,
    duration: "4 weeks",
    rating: 4.9,
    enrolledStudents: 987,
    isCompleted: false,
    purchaseDate: "2024-02-01",
    lastAccessed: "1 week ago",
    price: 79.99,
    learningPath: "IELTS 6.0 → 7.0 Advanced",
  },
  {
    id: "6",
    title: "Complex Reading Comprehension",
    instructor: "Robert Taylor",
    thumbnail: "/placeholder.svg?height=200&width=300",
    skill: "Reading",
    level: "Advanced",
    progress: 20,
    totalLessons: 24,
    completedLessons: 5,
    duration: "4 weeks",
    rating: 4.8,
    enrolledStudents: 756,
    isCompleted: false,
    purchaseDate: "2024-02-01",
    lastAccessed: "2 weeks ago",
    price: 89.99,
    learningPath: "IELTS 6.0 → 7.0 Advanced",
  },
]

export default function MyCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkill, setFilterSkill] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredCourses = purchasedCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.skill.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSkill = filterSkill === "all" || course.skill.toLowerCase() === filterSkill

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && course.isCompleted) ||
      (filterStatus === "in-progress" && !course.isCompleted && course.progress > 0) ||
      (filterStatus === "not-started" && course.progress === 0)

    return matchesSearch && matchesSkill && matchesStatus
  })

  const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
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
    total: purchasedCourses.length,
    completed: purchasedCourses.filter((c) => c.isCompleted).length,
    inProgress: purchasedCourses.filter((c) => !c.isCompleted && c.progress > 0).length,
    averageProgress: Math.round(purchasedCourses.reduce((acc, c) => acc + c.progress, 0) / purchasedCourses.length),
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
        <div className="bg-white rounded-lg border border-emerald-200 p-6 bg-emerald-50">
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-6 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-6 bg-purple-50">
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
            const skillColors = getSkillColor(course.skill)
            return (
              <div
                key={course.id}
                className={`bg-white rounded-lg border ${skillColors.border} overflow-hidden hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${skillColors.bg} ${skillColors.text}`}
                    >
                      {course.skill}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    {course.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 bg-white rounded-full" />
                    ) : (
                      <Play className="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">by {course.instructor}</p>
                  <p className="text-gray-500 text-xs mb-4">Part of: {course.learningPath}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {course.completedLessons} of {course.totalLessons} lessons
                      </span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${course.isCompleted ? "bg-emerald-500" : "bg-blue-500"} transition-all duration-300`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolledStudents.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <div>Last accessed: {course.lastAccessed}</div>
                        <div>Purchased: {new Date(course.purchaseDate).toLocaleDateString()}</div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          course.progress === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : course.isCompleted
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        {course.progress === 0 ? "Start" : course.isCompleted ? "Review" : "Continue"}
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
            const skillColors = getSkillColor(course.skill)
            return (
              <div
                key={course.id}
                className={`bg-white rounded-lg border ${skillColors.border} p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2">
                      {course.isCompleted ? (
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
                        <p className="text-gray-600 text-sm">by {course.instructor}</p>
                        <p className="text-gray-500 text-xs mt-1">Part of: {course.learningPath}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${skillColors.bg} ${skillColors.text}`}
                        >
                          {course.skill}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolledStudents.toLocaleString()}
                      </div>
                      <div>
                        {course.completedLessons} of {course.totalLessons} lessons
                      </div>
                      <div>Last accessed: {course.lastAccessed}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${course.isCompleted ? "bg-emerald-500" : "bg-blue-500"} transition-all duration-300`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          course.progress === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : course.isCompleted
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        {course.progress === 0 ? "Start" : course.isCompleted ? "Review" : "Continue"}
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

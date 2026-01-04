"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowLeft, Clock, BookOpen, PlayCircle, CheckCircle } from "lucide-react"
import { getAdminCourseDetail } from "@/api/course"
import { ICourse } from "@/interface/course"
import { selectUserId } from "@/redux/features/user/userSlice"
import Image from "next/image"
import Link from "next/link"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const userId = useSelector(selectUserId)

  const [course, setCourse] = useState<ICourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        
        if (!userId) {
          setError("Please login to view course details")
          setLoading(false)
          return
        }
        
        const data = await getAdminCourseDetail(courseId)
        setCourse(data)
      } catch (err) {
        console.error("Error fetching course:", err)
        setError("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, userId])

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
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Course not found"}</p>
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

  const skillColors = getSkillColor(course.skill_focus)

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <button
          onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold px-3 py-1.5 bg-slate-50 rounded-lg">
          {course.title}
        </span>
      </nav>

      {/* Course Header - Clean Professional Design */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex flex-col lg:flex-row">
          {/* Course Thumbnail */}
          <div className="lg:w-1/3 relative">
            <Image
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              width={400}
              height={300}
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/20"></div>
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${skillColors.badge} shadow-lg`}>
                {course.skill_focus || "General"}
              </span>
            </div>
          </div>

          {/* Course Info */}
          <div className="lg:w-2/3 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {/* Title & Description */}
                <h1 className="text-5xl font-black text-slate-800 mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                  {course.description}
                </p>

                {/* Stats - Clean Design */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex-1 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Estimated Duration</div>
                        <div className="text-lg font-bold text-gray-900">{course.estimated_duration}h</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Sections</div>
                        <div className="text-lg font-bold text-gray-900">{course.sections?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Info */}
                {course.teacher && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {course.teacher.name?.charAt(0) || "T"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Instructor</p>
                      <p className="text-lg font-semibold text-gray-900">{course.teacher.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sections List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Course Content</h2>
                <p className="text-slate-600">Explore all sections and lessons</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-full text-white shadow-lg">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">
                  {course.sections?.length || 0} Sections
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {course.sections?.map((section, index) => (
                <div
                  key={section.id}
                  className="group bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Section Number */}
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {index + 1}
                        </span>
                      </div>

                      {/* Section Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-slate-600 mb-3 font-medium">
                            {section.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <PlayCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{section.lessons?.length || 0} lessons</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Link href={`/student/courses/${courseId}/sections/${section.id}`}>
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                          View Lessons
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Info Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Course Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Difficulty</span>
                <span className="font-bold text-blue-700 capitalize px-3 py-1 bg-blue-100 rounded-full text-sm">
                  {course.difficulty_level}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Estimated Duration</span>
                <span className="font-bold text-slate-800">
                  {course.estimated_duration} hours
                </span>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          {course.what_you_learn && course.what_you_learn.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What You&apos;ll Learn</h3>
              <ul className="space-y-2">
                {course.what_you_learn.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

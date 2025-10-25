"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowLeft, Clock, PlayCircle, CheckCircle, Lock, FileText, Video, BookOpen } from "lucide-react"
import { getAdminCourseDetail } from "@/api/course"
import { ICourse } from "@/interface/course"
import { selectUserId } from "@/redux/features/user/userSlice"
import Link from "next/link"

export default function SectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const sectionId = params.sectionId as string
  
  // Get userId from Redux store
  const userId = useSelector(selectUserId)

  const [course, setCourse] = useState<ICourse | null>(null)
  const [currentSection, setCurrentSection] = useState<{
    id: string;
    title: string;
    description?: string;
    lessons?: Array<{
      id: string;
      title: string;
      description?: string;
      lesson_type: string;
      video_duration?: number;
      is_preview?: boolean;
      ordering: number;
    }>;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        
        // Check if user is authenticated
        if (!userId) {
          setError("Please login to view course details")
          setLoading(false)
          return
        }
        
        const data = await getAdminCourseDetail(courseId)
        setCourse(data)
        
        // Find the current section
        const section = data.sections?.find(s => s.id === sectionId)
        if (!section) {
          setError("Section not found")
        } else {
          setCurrentSection(section)
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        setError("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, sectionId, userId])

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType?.toLowerCase()) {
      case "video":
        return <Video className="w-5 h-5 text-blue-600" />
      case "document":
        return <FileText className="w-5 h-5 text-green-600" />
      case "quiz":
        return <CheckCircle className="w-5 h-5 text-purple-600" />
      case "assignment":
        return <FileText className="w-5 h-5 text-orange-600" />
      default:
        return <PlayCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00"
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading section details...</p>
        </div>
      </div>
    )
  }

  if (error || !course || !currentSection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Section not found"}</p>
          <button
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Course</span>
      </button>

      {/* Section Header - Modern Design */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 mb-2">
                  {currentSection.title}
                </h1>
                <p className="text-slate-600 font-medium">Section Overview</p>
              </div>
            </div>
            
            {currentSection.description && (
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium max-w-3xl">
                {currentSection.description}
              </p>
            )}

            {/* Section Stats - Enhanced */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Lessons</div>
                    <div className="text-xl font-bold text-gray-900">{currentSection.lessons?.length || 0}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-xl font-bold text-gray-900">
                      ~{Math.ceil((currentSection.lessons?.length || 0) * 0.5)}h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List - Enhanced Design */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Lessons</h2>
            <p className="text-slate-600">Complete all lessons to master this section</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-600 px-6 py-3 rounded-full text-white shadow-lg">
            <PlayCircle className="w-5 h-5" />
            <span className="font-semibold">
              {currentSection.lessons?.length || 0} Total Lessons
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {currentSection.lessons?.map((lesson, index: number) => {
            const isCompleted = false // This would come from user progress
            const isLocked = false // This would be based on course progression logic
            
            return (
              <div
                key={lesson.id}
                className={`group bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-300 ${
                  isCompleted
                    ? "border-green-300 bg-green-50"
                    : isLocked
                      ? "border-gray-200 bg-gray-50"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Lesson Number */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      isCompleted
                        ? "bg-green-600"
                        : isLocked
                          ? "bg-gray-300"
                          : "bg-blue-600"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 text-gray-500" />
                      ) : (
                        <span className={`text-xl font-bold ${
                          isLocked ? "text-gray-500" : "text-white"
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-xl font-bold ${
                          isCompleted
                            ? "text-green-800"
                            : isLocked
                              ? "text-gray-500"
                              : "text-slate-800 group-hover:text-blue-600"
                        } transition-colors`}>
                          {lesson.title}
                        </h3>
                        {lesson.is_preview && (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                            Preview
                          </span>
                        )}
                      </div>
                      
                      {lesson.description && (
                        <p className={`text-slate-600 mb-3 font-medium ${
                          isLocked ? "text-gray-400" : ""
                        }`}>
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm">
                        <div className={`flex items-center gap-2 ${
                          isLocked ? "text-gray-400" : "text-slate-500"
                        }`}>
                          <div className="p-1 bg-blue-100 rounded">
                            {getLessonIcon(lesson.lesson_type)}
                          </div>
                          <span className="font-medium capitalize">{lesson.lesson_type}</span>
                        </div>
                        {lesson.video_duration && (
                          <div className={`flex items-center gap-2 ${
                            isLocked ? "text-gray-400" : "text-slate-500"
                          }`}>
                            <div className="p-1 bg-purple-100 rounded">
                              <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">{formatDuration(lesson.video_duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {isLocked ? (
                      <button
                        disabled
                        className="px-8 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                      >
                        Locked
                      </button>
                    ) : (
                      <Link href={`/student/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`}>
                        <button className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                          isCompleted
                            ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                        }`}>
                          {isCompleted ? "Review" : "Start"}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Section Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold text-gray-900">0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: "0%" }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0 of {currentSection.lessons?.length || 0} lessons completed</span>
            <span>Estimated time remaining: ~{Math.ceil((currentSection.lessons?.length || 0) * 0.5)}h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowLeft, Clock, PlayCircle, CheckCircle, FileText, Video, Download, BookOpen, PenTool } from "lucide-react"
import { getAdminCourseDetail } from "@/api/course"
import { ICourse } from "@/interface/course"
import { ILesson } from "@/interface/lesson"
import { IExercise } from "@/interface/exercise"
import { selectUserId } from "@/redux/features/user/userSlice"
import Link from "next/link"
import { mockExercises } from "@/data/mockExercises"

// Extended lesson interface for API data
interface ILessonExtended extends ILesson {
  video_url?: string
  document_url?: string
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const sectionId = params.sectionId as string
  const lessonId = params.lessonId as string
  
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
  const [currentLesson, setCurrentLesson] = useState<{
    id: string;
    title: string;
    description?: string;
    lesson_type: string;
    video_duration?: number;
    is_preview?: boolean;
    ordering: number;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<IExercise[]>([])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        
        // Check if user is authenticated
        if (!userId) {
          setError("Please login to view lesson details")
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
          
          // Find the current lesson
          const lesson = section.lessons?.find((l: ILessonExtended) => l.id === lessonId)
          if (!lesson) {
            setError("Lesson not found")
          } else {
            setCurrentLesson(lesson)
            
            // Load mock exercises (tạm thời dùng tất cả mock exercises để test)
            // TODO: Khi có API thật, sẽ filter theo lessonId
            setExercises(mockExercises)
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        setError("Failed to load lesson details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, sectionId, lessonId, userId])

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

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType?.toLowerCase()) {
      case "video":
        return <Video className="w-6 h-6 text-blue-600" />
      case "document":
        return <FileText className="w-6 h-6 text-green-600" />
      case "quiz":
        return <CheckCircle className="w-6 h-6 text-purple-600" />
      case "assignment":
        return <FileText className="w-6 h-6 text-orange-600" />
      default:
        return <PlayCircle className="w-6 h-6 text-gray-600" />
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson details...</p>
        </div>
      </div>
    )
  }

  if (error || !course || !currentSection || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Lesson not found"}</p>
          <button
            onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Section
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Section</span>
      </button>

      {/* Lesson Header - Modern Design */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                {getLessonIcon(currentLesson.lesson_type)}
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 mb-2">
                  {currentLesson.title}
                </h1>
                <p className="text-slate-600 font-medium">Lesson {currentLesson.ordering}</p>
              </div>
            </div>
            
            {currentLesson.description && (
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium max-w-3xl">
                {currentLesson.description}
              </p>
            )}

            {/* Lesson Stats */}
            <div className="flex items-center gap-6">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-lg font-bold text-gray-900">{formatDuration(currentLesson.video_duration || null)}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PlayCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="text-lg font-bold text-gray-900 capitalize">{currentLesson.lesson_type}</div>
                  </div>
                </div>
              </div>
              {currentLesson.is_preview && (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="text-lg font-bold text-gray-900">Preview</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Button - Start exercises */}
      {exercises.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${exercises[0].id}`)}
            className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-slate-200 hover:border-blue-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-all">
                  <PenTool className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    Start Exercises
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {exercises.length} exercises available • Click to start
                  </p>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 rounded-xl font-semibold text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-all flex items-center gap-2">
                <span>Start</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Lesson Content</h2>
            
            {currentLesson.lesson_type === "video" && (currentLesson as ILessonExtended).video_url ? (
              <div className="mb-8">
                <div className="relative w-full h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <PlayCircle className="w-10 h-10" />
                      </div>
                      <p className="text-xl font-semibold mb-2">Video Player</p>
                      <p className="text-sm opacity-70">Click to play video content</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  Video URL: {(currentLesson as ILessonExtended).video_url}
                </p>
              </div>
            ) : currentLesson.lesson_type === "document" && (currentLesson as ILessonExtended).document_url ? (
              <div className="mb-8">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-3">Document Available</p>
                  <p className="text-slate-600 mb-6 font-medium">Download and view the lesson document</p>
                  <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                    <Download className="w-5 h-5 inline mr-2" />
                    Download Document
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  Document URL: {(currentLesson as ILessonExtended).document_url}
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50 to-purple-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-3">Content Coming Soon</p>
                  <p className="text-slate-600 font-medium">This lesson content is being prepared</p>
                </div>
              </div>
            )}

            {/* Lesson Description */}
            {currentLesson.description && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-slate-800 mb-4">About This Lesson</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {currentLesson.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Info */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Lesson Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Type</span>
                <span className="font-bold text-blue-700 capitalize px-3 py-1 bg-blue-100 rounded-full text-sm">
                  {currentLesson.lesson_type}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Duration</span>
                <span className="font-bold text-slate-800">
                  {formatDuration(currentLesson.video_duration || null)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Order</span>
                <span className="font-bold text-slate-800">
                  {currentLesson.ordering}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Status</span>
                <span className="font-bold text-slate-800">
                  {currentLesson.is_preview ? "Preview" : "Full Access"}
                </span>
              </div>
            </div>
          </div>

          {/* Course Navigation */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Course Navigation</h3>
            <div className="space-y-3">
              <Link href={`/student/courses/${courseId}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-white">C</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                    <p className="text-xs text-slate-500">Course Overview</p>
                  </div>
                </div>
              </Link>
              
              <Link href={`/student/courses/${courseId}/sections/${sectionId}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-white">S</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{currentSection.title}</p>
                    <p className="text-xs text-slate-500">Section Overview</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Your Progress</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Lesson Progress</span>
                <span className="font-bold text-slate-800">0%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Mark as completed when finished
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

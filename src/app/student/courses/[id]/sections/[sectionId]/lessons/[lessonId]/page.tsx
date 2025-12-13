"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowLeft, Clock, PlayCircle, CheckCircle, FileText, Video, Download, BookOpen, PenTool, Save, Edit2 } from "lucide-react"
import { getAdminCourseDetail } from "@/api/course"
import { getLessonProgress, markLessonComplete } from "@/api/lesson"
import { getVideoStreamUrl } from "@/api/file"
import { getExercisesByLessonId } from "@/api/exercise"
import HlsVideoPlayer from "@/components/modal/video-player"
import { ICourse } from "@/interface/course"
import { ILesson } from "@/interface/lesson"
import { IExercise } from "@/interface/exercise"
import { selectUserId } from "@/redux/features/user/userSlice"
import Link from "next/link"
interface ILessonExtended extends ILesson {
  video_url?: string // URL từ MinIO (backend upload) - ưu tiên
  video_url_public?: string // URL public từ FE - fallback
  document_url?: string
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const sectionId = params.sectionId as string
  const lessonId = params.lessonId as string
  
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
  const [currentLesson, setCurrentLesson] = useState<ILessonExtended | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Debug: Log videoUrl changes
  useEffect(() => {
    console.log("videoUrl state changed:", videoUrl)
    console.log("currentLesson:", currentLesson)
    console.log("lesson_type:", currentLesson?.lesson_type)
  }, [videoUrl, currentLesson])
  const [error, setError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<IExercise[]>([])
  const [lessonProgress, setLessonProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [lessonNote, setLessonNote] = useState<string>("")
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        
        if (!userId) {
          setError("Please login to view lesson details")
          setLoading(false)
          return
        }
        
        const data = await getAdminCourseDetail(courseId)
        setCourse(data)
        
        const section = data.sections?.find(s => s.id === sectionId)
        if (!section) {
          setError("Section not found")
        } else {
          setCurrentSection(section)
          
          const lesson = section.lessons?.find((l: ILessonExtended) => l.id === lessonId)
          if (!lesson) {
            setError("Lesson not found")
          } else {
            setCurrentLesson(lesson)
            
            // Fetch exercises for this lesson from API
            try {
              const exercisesData = await getExercisesByLessonId(lessonId)
              setExercises(exercisesData || [])
            } catch (err) {
              console.error("Error fetching exercises:", err)
              setExercises([])
            }
            
            // Determine video URL: prioritize HLS from API, fallback to public URL
            const videoUrlFromBackend = (lesson as ILessonExtended).video_url
            const publicUrl = (lesson as ILessonExtended).video_url_public
            
            // Check if video_url is a full URL (http/https) or public path (starts with /)
            const isFullUrl = videoUrlFromBackend && (
              videoUrlFromBackend.startsWith('http://') || 
              videoUrlFromBackend.startsWith('https://')
            )
            
            const isPublicPath = videoUrlFromBackend && videoUrlFromBackend.startsWith('/')
            
            // Handle video URL based on type
            if (lesson.lesson_type === "video") {
              if (isFullUrl) {
                // Use full URL directly (external URL)
                setVideoUrl(videoUrlFromBackend)
              } else if (isPublicPath) {
                // video_url is a public path (e.g., /test/video.mp4), use it directly or fallback to video_url_public
                if (publicUrl) {
                  const normalizedPublicUrl = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`
                  setVideoUrl(normalizedPublicUrl)
                } else {
                  // Use video_url as-is if it's a public path
                  setVideoUrl(videoUrlFromBackend)
                }
              } else if (videoUrlFromBackend) {
                // video_url is a filename (e.g., video-xxx.mp4), try to get HLS URL from API first
                getVideoStreamUrl(videoUrlFromBackend)
                  .then(data => {
                    // Handle nested structure: data might be {success: true, data: {...}} or just {...}
                    const responseData = data as {
                      success?: boolean;
                      data?: {
                        preferredUrl?: string | null;
                        hlsUrl?: string | null;
                        originalUrl?: string | null;
                      };
                      preferredUrl?: string | null;
                      hlsUrl?: string | null;
                      originalUrl?: string | null;
                    };
                    
                    const videoData = responseData?.data || responseData;
                    
                    // Priority: preferredUrl (HLS) > hlsUrl > originalUrl > publicUrl
                    if (videoData?.preferredUrl) {
                      setVideoUrl(videoData.preferredUrl)
                    } else if (videoData?.hlsUrl) {
                      setVideoUrl(videoData.hlsUrl)
                    } else if (videoData?.originalUrl) {
                      setVideoUrl(videoData.originalUrl)
                    } else if (publicUrl) {
                      // Fallback to public URL if API doesn't return URL
                      const normalizedPublicUrl = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`
                      setVideoUrl(normalizedPublicUrl)
                    } else {
                      setVideoUrl(null)
                    }
                  })
                  .catch(err => {
                    console.error("Error fetching video stream URL:", err)
                    // Fallback to public URL on error
                    if (publicUrl) {
                      const normalizedPublicUrl = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`
                      setVideoUrl(normalizedPublicUrl)
                    } else {
                      // Last resort: try to use video_url as-is
                      setVideoUrl(videoUrlFromBackend)
                    }
                  })
              } else if (publicUrl) {
                // No video_url, but has publicUrl
                const normalizedPublicUrl = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`
                setVideoUrl(normalizedPublicUrl)
              } else {
                setVideoUrl(null)
              }
            } else {
              setVideoUrl(null)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        setError("Failed to load lesson details")
      } finally {
        setLoading(false)
      }
    }

    const fetchProgress = async () => {
      if (!userId) return

      try {
        console.log("Fetching lesson progress for:", { sectionId, lessonId, userId })
        const progressData = await getLessonProgress(sectionId, lessonId)
        console.log("Progress data received:", progressData)
        if (progressData) {
          setLessonProgress(progressData.progress_percentage || 0)
          setIsCompleted(progressData.is_completed || false)
        }
      } catch (err) {
        console.error("Error fetching lesson progress:", err)
      }
    }

    fetchCourse()
    fetchProgress()
    
    if (userId && lessonId) {
      const savedNote = localStorage.getItem(`lesson_note_${userId}_${lessonId}`)
      if (savedNote) {
        setLessonNote(savedNote)
      }
    }
  }, [courseId, sectionId, lessonId, userId])

  const loadLessonNote = () => {
    if (!userId || !lessonId) return
    const savedNote = localStorage.getItem(`lesson_note_${userId}_${lessonId}`)
    if (savedNote) {
      setLessonNote(savedNote)
    }
  }

  const saveLessonNote = async () => {
    if (!userId || !lessonId) return
    
    setIsSavingNote(true)
    try {
      localStorage.setItem(`lesson_note_${userId}_${lessonId}`, lessonNote)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setIsEditingNote(false)
      console.log("Lesson note saved successfully")
    } catch (err) {
      console.error("Error saving lesson note:", err)
      setError("Failed to save note. Please try again.")
    } finally {
      setIsSavingNote(false)
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

  const handleMarkComplete = async () => {
    if (!userId || isCompleted || isMarkingComplete) return

    try {
      setIsMarkingComplete(true)
      await markLessonComplete(sectionId, lessonId, courseId)
      const progressData = await getLessonProgress(sectionId, lessonId)
      
      if (progressData) {
        setLessonProgress(progressData.progress_percentage || 100)
        setIsCompleted(progressData.is_completed || true)
      } else {
        setLessonProgress(100)
        setIsCompleted(true)
      }
    } catch (err) {
      console.error("Error marking lesson as completed:", err)
      setError("Failed to mark lesson as completed. Please try again.")
    } finally {
      setIsMarkingComplete(false)
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
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap">
        <button
          onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-300">/</span>
        <button
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="text-slate-500 hover:text-slate-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          {course?.title || "Course"}
        </button>
        <span className="text-slate-300">/</span>
        <button
          onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}`)}
          className="text-slate-500 hover:text-slate-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          {currentSection?.title || "Section"}
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold px-3 py-1.5 bg-slate-50 rounded-lg">
          {currentLesson?.title || "Lesson"}
        </span>
      </nav>

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
            
            {currentLesson.lesson_type === "video" && videoUrl ? (
              <div className="mb-8">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                  {videoUrl.includes('.m3u8') || videoUrl.includes('playlist.m3u8') ? (
                    // Use HLS Video Player for HLS streams
                    <HlsVideoPlayer
                      hlsUrl={videoUrl}
                      title={currentLesson.title || "Lesson Video"}
                      duration={currentLesson.video_duration || undefined}
                    />
                  ) : (
                    // Use native video player for MP4/WebM
                    <video
                      key={videoUrl}
                      className="w-full aspect-video"
                      controls
                      controlsList="nodownload"
                      preload="auto"
                      playsInline
                      crossOrigin="anonymous"
                      onLoadedData={() => {
                        console.log("Video loaded successfully:", videoUrl);
                      }}
                      onError={(e) => {
                        console.error("Video loading error:", e, "URL:", videoUrl);
                      }}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "600px",
                        objectFit: "contain"
                      }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            ) : null}

            {/* Lesson Notes Section - Phía dưới video */}
            {currentLesson.lesson_type === "video" && (
              <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">My Notes</h3>
                  </div>
                  {!isEditingNote && (
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      {lessonNote ? "Edit Note" : "Add Note"}
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-4">
                    <textarea
                      value={lessonNote}
                      onChange={(e) => setLessonNote(e.target.value)}
                      placeholder="Write your notes here... You can add key points, important concepts, or questions about this lesson."
                      className="w-full h-48 p-4 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none text-slate-700 font-medium"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveLessonNote}
                        disabled={isSavingNote}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingNote ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Note
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNote(false)
                          loadLessonNote() // Reload saved note
                        }}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 min-h-[120px]">
                    {lessonNote ? (
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                        {lessonNote}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                          <Edit2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No notes yet. Click &quot;Add Note&quot; to start writing.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentLesson.lesson_type === "document" && (currentLesson as ILessonExtended).document_url ? (
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
            ) : currentLesson.lesson_type === "video" && !(currentLesson as ILessonExtended).video_url ? (
              <div className="mb-8">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50 to-purple-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-3">Content Coming Soon</p>
                  <p className="text-slate-600 font-medium">This lesson content is being prepared</p>
                </div>
              </div>
            ) : currentLesson.lesson_type !== "video" && currentLesson.lesson_type !== "document" ? (
              <div className="mb-8">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50 to-purple-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-3">Content Coming Soon</p>
                  <p className="text-slate-600 font-medium">This lesson content is being prepared</p>
                </div>
              </div>
            ) : null}

            {/* Lesson Description */}
            {currentLesson.description && (
              <div className="prose max-w-none mt-8">
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
              {/* <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Order</span>
                <span className="font-bold text-slate-800">
                  {currentLesson.ordering}
                </span>
              </div> */}
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
                <span className="font-bold text-slate-800">{lessonProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`} style={{ width: `${lessonProgress}%` }}></div>
              </div>
              {isCompleted ? (
                <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Lesson completed!
                </div>
              ) : (
                <div className="text-sm text-slate-500 font-medium">
                  Mark as completed when finished
                </div>
              )}
              <button
                onClick={handleMarkComplete}
                disabled={isCompleted || isMarkingComplete}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : isMarkingComplete
                    ? 'bg-slate-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isMarkingComplete ? (
                  <>
                    <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Marking...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

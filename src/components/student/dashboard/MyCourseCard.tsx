"use client"

import { Play, CheckCircle, Clock, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"

interface MyCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  skill: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastAccessed: string
  duration: string
  isCompleted: boolean
  purchaseDate: string
}

interface MyCourseCardProps {
  course: MyCourse
}

export function MyCourseCard({ course }: MyCourseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Thumbnail */}
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <button className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-100">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {course.isCompleted ? (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Completed
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{course.skill}</span>
            <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mt-1">by {course.instructor}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {course.progress}% ({course.completedLessons}/{course.totalLessons} lessons)
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 rounded-full h-2 transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Course Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.totalLessons} lessons
          </span>
        </div>

        {/* Last Accessed */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Last accessed: {course.lastAccessed}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors text-center"
          >
            {course.isCompleted ? "Review Course" : "Continue Learning"}
          </Link>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  )
}

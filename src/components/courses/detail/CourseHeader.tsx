"use client"

import { motion } from "framer-motion"
import { Star, Users, Clock, Calendar, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CourseHeaderProps {
  courseData: {
    title: string
    subtitle: string
    category: string
    level: string
    discount: number
    rating: number
    reviews: number
    students: number
    totalHours: number
    lastUpdated: string
    language: string
    image: string
    instructor: {
      name: string
      avatar: string
      title: string
      experience: string
      students: string
      rating: number
    }
  }
}

export default function CourseHeader({ courseData }: CourseHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-blue-100 text-blue-800">{courseData.category}</Badge>
        <Badge variant="outline">{courseData.level}</Badge>
        {courseData.discount > 0 && <Badge className="bg-red-500 text-white">-{courseData.discount}% OFF</Badge>}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{courseData.title}</h1>

      <p className="text-xl text-gray-600 mb-6 leading-relaxed">{courseData.subtitle}</p>

      {/* Course Stats */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-900">{courseData.rating}</span>
          <span>({courseData.reviews} reviews)</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{courseData.students.toLocaleString()} students</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{courseData.totalHours} hours</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Updated {courseData.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{courseData.language}</span>
        </div>
      </div>

      {/* Instructor Info */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Avatar className="h-12 w-12">
          <AvatarImage src={courseData.instructor.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {courseData.instructor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{courseData.instructor.name}</p>
          <p className="text-sm text-gray-600">{courseData.instructor.title}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span>{courseData.instructor.experience} experience</span>
            <span>•</span>
            <span>{courseData.instructor.students} students</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{courseData.instructor.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

"use client"

import { Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface RelatedCourse {
  id: string
  title: string
  slug: string
  image: string
  price: number
  originalPrice: number
  rating: number
  students: number
}

interface RelatedCoursesProps {
  courses: RelatedCourse[]
}

export default function RelatedCourses({ courses }: RelatedCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Related Courses
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`}>
            <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
              <Image
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                width={80}
                height={60}
                className="w-20 h-15 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600">${course.price}</span>
                  {course.originalPrice > course.price && (
                    <span className="text-xs text-gray-500 line-through">${course.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

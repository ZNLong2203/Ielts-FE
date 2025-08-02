"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface CourseStatsProps {
  students: number
  duration: string
  lessons: number
  level: string
  language: string
  rating: number
}

export default function CourseStats({ students, duration, lessons, level, language, rating }: CourseStatsProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Course Statistics</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Students Enrolled</span>
          <span className="font-medium">{students.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Course Duration</span>
          <span className="font-medium">{duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Lessons</span>
          <span className="font-medium">{lessons}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Skill Level</span>
          <span className="font-medium">{level}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Language</span>
          <span className="font-medium">{language}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Rating</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface InstructorProfileProps {
  instructor: {
    name: string
    avatar: string
    title: string
    bio: string
    rating: number
    students: string
    courses: number
    experience: string
    credentials: string[]
  }
}

export default function InstructorProfile({ instructor }: InstructorProfileProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={instructor.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
              {instructor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{instructor.name}</h3>
            <p className="text-lg text-blue-600 mb-4">{instructor.title}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{instructor.rating}</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{instructor.students}</div>
                <div className="text-sm text-gray-500">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{instructor.courses}</div>
                <div className="text-sm text-gray-500">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{instructor.experience}</div>
                <div className="text-sm text-gray-500">Experience</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed mb-6">{instructor.bio}</p>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Credentials & Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {instructor.credentials.map((credential) => (
              <Badge key={credential} variant="outline" className="text-sm">
                <Award className="h-3 w-3 mr-1" />
                {credential}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

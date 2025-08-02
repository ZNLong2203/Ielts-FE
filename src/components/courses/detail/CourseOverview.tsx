"use client"

import { useState } from "react"
import { CheckCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CourseOverviewProps {
  courseData: {
    description: string
    outcomes: string[]
    skills: string[]
    requirements: string[]
  }
}

export default function CourseOverview({ courseData }: CourseOverviewProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  return (
    <div className="space-y-8">
      {/* Course Description */}
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold">About This Course</h3>
        </CardHeader>
        <CardContent>
          <div className={`prose max-w-none ${!showFullDescription ? "line-clamp-4" : ""}`}>
            <p className="text-gray-700 leading-relaxed mb-4">{courseData.description}</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our comprehensive IELTS Academic course covers all four essential skills: Reading, Writing, Listening, and
              Speaking. With over 48 detailed video lessons, interactive exercises, and personalized feedback, you&apos;ll
              develop the confidence and skills needed to excel in your IELTS exam.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The course includes unlimited access to mock tests, downloadable resources, live group sessions, and
              one-on-one speaking practice with certified instructors. Join thousands of successful students who have
              achieved their target band scores with our proven methodology.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-4 p-0 h-auto text-blue-600 hover:text-blue-700"
          >
            {showFullDescription ? "Show Less" : "Show More"}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFullDescription ? "rotate-180" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      {/* What You'll Learn */}
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold">What You&apos;ll Learn</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {courseData.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{outcome}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills You'll Gain */}
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold">Skills You&apos;ll Gain</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {courseData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold">Requirements</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseData.requirements.map((requirement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{requirement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

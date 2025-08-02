"use client"

import { PlayCircle, FileText, Target, Users, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CurriculumModule {
  title: string
  lessons: number
  duration: string
  description: string
  items: Array<{
    title: string
    duration: string
    type: string
    preview: boolean
  }>
}

interface CourseCurriculumProps {
  curriculum: CurriculumModule[]
  totalLessons: number
  totalHours: number
}

export default function CourseCurriculum({ curriculum, totalLessons, totalHours }: CourseCurriculumProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-600" />
      case "quiz":
        return <FileText className="h-4 w-4 text-green-600" />
      case "test":
        return <Target className="h-4 w-4 text-orange-600" />
      case "live":
        return <Users className="h-4 w-4 text-purple-600" />
      case "assignment":
        return <Award className="h-4 w-4 text-red-600" />
      default:
        return <PlayCircle className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-2xl font-bold">Course Curriculum</h3>
        <p className="text-gray-600">
          {totalLessons} lessons • {totalHours} hours total length
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {curriculum.map((module, index) => (
            <AccordionItem key={index} value={`module-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{module.lessons} lessons</div>
                    <div>{module.duration}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-4">
                  {module.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getIcon(item.type)}
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{item.duration}</span>
                        {item.preview && (
                          <Badge variant="outline" className="text-xs">
                            Preview
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

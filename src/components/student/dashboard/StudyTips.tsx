"use client"

import { Lightbulb, Target, Clock, BookOpen } from "lucide-react"

export function StudyTips() {
  const tips = [
    {
      icon: Target,
      title: "Set Daily Goals",
      description: "Aim for 30 minutes of focused study each day",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Practice Timing",
      description: "Use a timer during practice tests",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: BookOpen,
      title: "Review Mistakes",
      description: "Keep a journal of common errors",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Lightbulb,
      title: "Stay Consistent",
      description: "Regular practice beats intensive cramming",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Tips</h3>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className={`${tip.bgColor} rounded-lg p-4 border border-gray-100`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 ${tip.bgColor} rounded-lg flex items-center justify-center`}>
                <tip.icon className={`w-4 h-4 ${tip.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

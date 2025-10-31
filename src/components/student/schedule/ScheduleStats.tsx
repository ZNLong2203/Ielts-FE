"use client"

import { BookOpen, CheckCircle2, Clock } from "lucide-react"
import { ScheduledItem, Course } from "./types"

interface ScheduleStatsProps {
  scheduledItems: ScheduledItem[]
  getCourse: (courseId: string) => Course | undefined
}

export function ScheduleStats({ scheduledItems, getCourse }: ScheduleStatsProps) {
  const completedCount = scheduledItems.filter((item) => item.isCompleted).length
  const totalHours = Math.round(
    scheduledItems.reduce(
      (sum, item) => sum + (getCourse(item.courseId)?.duration || 0),
      0
    ) / 60
  )
  const completionRate = scheduledItems.length > 0 
    ? Math.round((completedCount / scheduledItems.length) * 100) 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {scheduledItems.length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Scheduled Items</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
            <div className="text-sm text-gray-600 font-medium">
              Completed ({completionRate}%)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-full p-4 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalHours}</div>
            <div className="text-sm text-gray-600 font-medium">Hours Scheduled</div>
          </div>
        </div>
      </div>
    </div>
  )
}


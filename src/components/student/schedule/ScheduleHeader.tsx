"use client"

import { Calendar } from "lucide-react"

interface ScheduleHeaderProps {
  onGoToToday: () => void
}

export function ScheduleHeader({ onGoToToday }: ScheduleHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Schedule</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Drag courses to schedule your learning</span>
          </p>
        </div>
        <button
          onClick={onGoToToday}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
        >
          <Calendar className="w-4 h-4" />
          Today
        </button>
      </div>
    </div>
  )
}


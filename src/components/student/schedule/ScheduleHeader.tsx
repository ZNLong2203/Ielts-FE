"use client"

import { Calendar, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleHeaderProps {
  onGoToToday: () => void
  pendingCount?: number
  onBatchSave?: () => void
  isSaving?: boolean
}

export function ScheduleHeader({ 
  onGoToToday, 
  pendingCount = 0,
  onBatchSave,
  isSaving = false,
}: ScheduleHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Schedule</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Drag courses to schedule your learning</span>
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && onBatchSave && (
            <Button
              onClick={onBatchSave}
              disabled={isSaving}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : `Save All (${pendingCount})`}
            </Button>
          )}
          <Button
            onClick={onGoToToday}
            variant="outline"
            className="px-4 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            Today
          </Button>
        </div>
      </div>
    </div>
  )
}


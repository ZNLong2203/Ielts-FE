"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Course, ScheduledItem } from "./types"
import { DroppableDateCell } from "./DroppableDateCell"

interface ScheduleCalendarProps {
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  getCourse: (courseId: string) => Course | undefined
  getScheduledItemsForDate: (date: Date) => ScheduledItem[]
  onToggleCompletion: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}

export function ScheduleCalendar({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  getCourse,
  getScheduledItemsForDate,
  onToggleCompletion,
  onDeleteItem,
}: ScheduleCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-white/60 rounded-lg transition-all hover:scale-110 active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white/60 rounded-lg transition-all hover:scale-110 active:scale-95 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-2">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-1.5 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => (
            <DroppableDateCell
              key={format(day, "yyyy-MM-dd")}
              day={day}
              currentMonth={currentMonth}
              dayItems={getScheduledItemsForDate(day)}
              getCourse={getCourse}
              onToggleCompletion={onToggleCompletion}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


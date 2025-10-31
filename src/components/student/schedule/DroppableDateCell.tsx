"use client"

import { useDroppable } from "@dnd-kit/core"
import { format, isSameMonth, isToday } from "date-fns"
import { ScheduledItem, Course } from "./types"
import { ScheduledItemCard } from "./ScheduledItemCard"

interface DroppableDateCellProps {
  day: Date
  currentMonth: Date
  dayItems: ScheduledItem[]
  getCourse: (courseId: string) => Course | undefined
  onToggleCompletion: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}

export function DroppableDateCell({
  day,
  currentMonth,
  dayItems,
  getCourse,
  onToggleCompletion,
  onDeleteItem,
}: DroppableDateCellProps) {
  const dateStr = format(day, "yyyy-MM-dd")
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateStr}`,
  })

  const isCurrentMonth = isSameMonth(day, currentMonth)
  const isTodayDate = isToday(day)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[180px] border-2 rounded-lg p-2.5 transition-all duration-200 ${
        !isCurrentMonth ? "bg-gray-50 opacity-50" : "bg-white hover:bg-gray-50"
      } ${isTodayDate ? "border-blue-500 bg-blue-50/30 shadow-sm" : "border-gray-200"} ${
        isOver
          ? "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-500 border-dashed shadow-lg scale-[1.02]"
          : ""
      } relative`}
    >
      <div
        className={`text-xs font-semibold mb-2 ${
          isTodayDate ? "text-blue-600" : "text-gray-700"
        }`}
      >
        {format(day, "d")}
      </div>
      <div className="space-y-1.5 overflow-y-auto max-h-[155px]">
        {dayItems.map((item) => (
          <ScheduledItemCard
            key={item.id}
            item={item}
            course={getCourse(item.courseId)}
            onToggleCompletion={onToggleCompletion}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  )
}


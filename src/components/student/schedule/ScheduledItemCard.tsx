"use client"

import { useState } from "react"
import { CheckCircle2, Trash2 } from "lucide-react"
import { ScheduledItem, Course } from "./types"

interface ScheduledItemCardProps {
  item: ScheduledItem
  course: Course | undefined
  onToggleCompletion: (itemId: string) => void
  onDelete: (itemId: string) => void
}

export function ScheduledItemCard({
  item,
  course,
  onToggleCompletion,
  onDelete,
}: ScheduledItemCardProps) {
  const [showFullTitle, setShowFullTitle] = useState(false)
  if (!course) return null

  // Check if title needs truncation (more than ~30 chars)
  const needsTruncation = course.title.length > 30
  
  // Check if this is a pending schedule
  const isPending = (item as any).isPending || item.id.startsWith("pending-")
  
  // Format time display
  const formatTime = (time?: string | Date) => {
    if (!time) return ""
    if (typeof time === 'string') {
      // If it's already in HH:mm format, return as is
      if (/^\d{2}:\d{2}$/.test(time)) return time
      // If it's ISO string, parse it
      if (time.includes('T')) {
        try {
          const date = new Date(time)
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          })
        } catch {
          return time
        }
      }
      return time
    }
    // If it's a Date object
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }

  return (
    <div
      className={`${course.color} text-white text-xs p-2.5 rounded-lg group hover:scale-[1.02] transition-all shadow-md hover:shadow-lg relative ${
        item.isCompleted ? "opacity-60 line-through" : ""
      } ${isPending ? "opacity-75 border-2 border-dashed border-white/50" : ""}`}
      onMouseEnter={() => setShowFullTitle(true)}
      onMouseLeave={() => setShowFullTitle(false)}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="font-medium leading-snug break-words line-clamp-3 text-[11px]">
            {course.title}
          </div>
          {item.time && (
            <div className="text-[9px] opacity-90 mt-1 font-medium">
              {formatTime(item.time)}
            </div>
          )}
          {isPending && (
            <div className="text-[8px] opacity-75 mt-0.5 italic">Pending</div>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleCompletion(item.id)
            }}
            className="p-0.5 hover:bg-white/20 rounded"
            title="Mark as completed"
          >
            <CheckCircle2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className="p-0.5 hover:bg-white/20 rounded"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Tooltip for full title - only show if truncated */}
      {showFullTitle && needsTruncation && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl max-w-xs text-center">
          {course.title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}


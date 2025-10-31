"use client"

import { useDraggable } from "@dnd-kit/core"
import { GripVertical, Clock, CheckCircle2 } from "lucide-react"
import { Course } from "./types"

interface DraggableCourseProps {
  course: Course
}

export function DraggableCourse({ course }: DraggableCourseProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${course.color} text-white p-4 rounded-xl cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group shadow-md hover:shadow-xl ${
        isDragging ? "opacity-50 scale-95 rotate-2" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <GripVertical className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          <span className="font-medium text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {course.skill}
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{course.title}</h3>
        <div className="flex items-center gap-1 text-xs opacity-90 bg-white/10 px-2 py-1 rounded-full w-fit">
          <Clock className="w-3 h-3" />
          <span>{course.duration} min</span>
        </div>
      </div>
      {course.isCompleted && (
        <CheckCircle2 className="w-5 h-5 opacity-90 flex-shrink-0 ml-2" />
      )}
    </div>
  )
}


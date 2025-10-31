"use client"

import { useState, useMemo } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { format, addDays } from "date-fns"
import { Course, ScheduledItem } from "@/components/student/schedule/types"
import { ScheduleHeader } from "@/components/student/schedule/ScheduleHeader"
import { CourseList } from "@/components/student/schedule/CourseList"
import { ScheduleCalendar } from "@/components/student/schedule/ScheduleCalendar"
import { ScheduleStats } from "@/components/student/schedule/ScheduleStats"

// Mock courses data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "IELTS Writing Task 1",
    skill: "Writing",
    duration: 60,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    isCompleted: false,
  },
  {
    id: "2",
    title: "IELTS Speaking Part 2",
    skill: "Speaking",
    duration: 45,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    isCompleted: false,
  },
  {
    id: "3",
    title: "IELTS Reading Comprehension",
    skill: "Reading",
    duration: 90,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    isCompleted: false,
  },
  {
    id: "4",
    title: "IELTS Listening Practice",
    skill: "Listening",
    duration: 30,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    isCompleted: false,
  },
  {
    id: "5",
    title: "Vocabulary Building",
    skill: "General",
    duration: 20,
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    isCompleted: true,
  },
  {
    id: "6",
    title: "Advanced Grammar Practice",
    skill: "Writing",
    duration: 75,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    isCompleted: false,
  },
  {
    id: "7",
    title: "Pronunciation Mastery",
    skill: "Speaking",
    duration: 50,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    isCompleted: false,
  },
  {
    id: "8",
    title: "Reading Speed Training",
    skill: "Reading",
    duration: 40,
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
    isCompleted: false,
  },
  {
    id: "9",
    title: "Listening Comprehension",
    skill: "Listening",
    duration: 55,
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    isCompleted: false,
  },
  {
    id: "10",
    title: "Essay Writing Workshop",
    skill: "Writing",
    duration: 120,
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    isCompleted: false,
  },
]

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([
    {
      id: "s1",
      courseId: "1",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      isCompleted: false,
    },
    {
      id: "s2",
      courseId: "5",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "14:00",
      isCompleted: true,
    },
    {
      id: "s3",
      courseId: "2",
      date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      time: "10:00",
      isCompleted: false,
    },
  ])
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "duration" | "skill">("title")
  const [filterSkill, setFilterSkill] = useState<string>("all")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...mockCourses]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by skill
    if (filterSkill !== "all") {
      filtered = filtered.filter((course) => course.skill === filterSkill)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      } else if (sortBy === "duration") {
        return b.duration - a.duration
      } else {
        return a.skill.localeCompare(b.skill)
      }
    })

    return filtered
  }, [searchQuery, sortBy, filterSkill])

  // Get unique skills for filter
  const uniqueSkills = useMemo(() => {
    const skills = new Set(mockCourses.map((c) => c.skill))
    return Array.from(skills).sort()
  }, [])

  // Previous/Next month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Get scheduled items for a date
  const getScheduledItemsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return scheduledItems.filter((item) => item.date === dateStr)
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const course = mockCourses.find((c) => c.id === event.active.id)
    if (course) {
      setDraggedCourse(course)
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCourse(null)

    if (!over || !active) return

    // If dropped on a date cell
    if (over.id.toString().startsWith("date-")) {
      const dateStr = over.id.toString().replace("date-", "")
      const course = mockCourses.find((c) => c.id === active.id)
      
      if (course) {
        const newItem: ScheduledItem = {
          id: `s-${Date.now()}`,
          courseId: course.id,
          date: dateStr,
          isCompleted: false,
        }
        setScheduledItems([...scheduledItems, newItem])
      }
    }
  }

  // Toggle completion
  const toggleCompletion = (itemId: string) => {
    setScheduledItems(
      scheduledItems.map((item) =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    )
  }

  // Delete scheduled item
  const deleteScheduledItem = (itemId: string) => {
    setScheduledItems(scheduledItems.filter((item) => item.id !== itemId))
  }

  // Get course by ID helper
  const getCourse = (courseId: string) => mockCourses.find((c) => c.id === courseId)

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6 w-full">
        <ScheduleHeader onGoToToday={() => setCurrentMonth(new Date())} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3">
          {/* Sidebar - Available Courses */}
          <div className="lg:col-span-2">
            <CourseList
              courses={filteredAndSortedCourses}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterSkill={filterSkill}
              onFilterSkillChange={setFilterSkill}
              skills={uniqueSkills}
            />
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-10">
            <ScheduleCalendar
              currentMonth={currentMonth}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              getCourse={getCourse}
              getScheduledItemsForDate={getScheduledItemsForDate}
              onToggleCompletion={toggleCompletion}
              onDeleteItem={deleteScheduledItem}
            />
          </div>
        </div>

        {/* Stats Section */}
        <ScheduleStats scheduledItems={scheduledItems} getCourse={getCourse} />

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedCourse ? (
            <div
              className={`${draggedCourse.color} text-white p-4 rounded-lg shadow-2xl transform rotate-3 scale-105`}
            >
              <div className="font-semibold">{draggedCourse.title}</div>
              <div className="text-sm opacity-90">{draggedCourse.skill}</div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}


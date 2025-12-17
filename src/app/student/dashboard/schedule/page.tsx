"use client"

import { useState, useMemo } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import { selectUserId } from "@/redux/features/user/userSlice"
import { Course, ScheduledItem, PendingSchedule } from "@/components/student/schedule/types"
import { ScheduleHeader } from "@/components/student/schedule/ScheduleHeader"
import { CourseList } from "@/components/student/schedule/CourseList"
import { ScheduleCalendar } from "@/components/student/schedule/ScheduleCalendar"
import { ScheduleStats } from "@/components/student/schedule/ScheduleStats"
import { ScheduleTimeModal } from "@/components/student/schedule/ScheduleTimeModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getStudentCourseEnrollments, getStudentComboEnrollments } from "@/api/student"
import { 
  getMySchedules, 
  createSchedule, 
  deleteSchedule,
  completeSession,
  type StudyScheduleDetails,
  type CreateScheduleDto,
} from "@/api/studySchedule"
import { IEnrolledCourse, IComboEnrollment } from "@/interface/student"

// Map skill focus to colors
const skillColors: Record<string, string> = {
  reading: "bg-gradient-to-br from-purple-500 to-purple-600",
  writing: "bg-gradient-to-br from-blue-500 to-blue-600",
  listening: "bg-gradient-to-br from-orange-500 to-orange-600",
  speaking: "bg-gradient-to-br from-green-500 to-green-600",
  general: "bg-gradient-to-br from-pink-500 to-pink-600",
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "duration" | "skill">("title")
  const [filterSkill, setFilterSkill] = useState<string>("all")
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null)
  const [pendingSchedules, setPendingSchedules] = useState<PendingSchedule[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)
  
  const userId = useSelector(selectUserId)
  const queryClient = useQueryClient()
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["student-course-enrollments", userId],
    queryFn: async () => {
      if (!userId) return []
      const data = await getStudentCourseEnrollments(userId)
      return data || []
    },
    enabled: !!userId,
  })

  // Fetch combo enrollments
  const { data: comboEnrollments = [], isLoading: combosLoading } = useQuery({
    queryKey: ["student-combo-enrollments", userId],
    queryFn: async () => {
      if (!userId) return []
      const data = await getStudentComboEnrollments(userId)
      return data || []
    },
    enabled: !!userId,
  })

  // Fetch schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["my-schedules", userId],
    queryFn: async () => {
      if (!userId) return []
      const data = await getMySchedules({})
      return data || []
    },
    enabled: !!userId,
  })

  // Convert enrolled courses to Course format
  const courses: Course[] = useMemo(() => {
    const courseList: Course[] = []

    // Add individual enrolled courses
    enrolledCourses.forEach((enrollment: { course: IEnrolledCourse }) => {
      const course = enrollment.course
      courseList.push({
        id: course.id,
        title: course.title,
        skill: course.skill_focus || "general",
        duration: course.estimated_duration || 60,
        color: skillColors[course.skill_focus || "general"] || skillColors.general,
        isCompleted: course.is_completed || false,
        // Individual enrollment, no combo_id
      })
    })

    // Add courses from combo enrollments
    comboEnrollments.forEach((comboEnrollment: IComboEnrollment) => {
      comboEnrollment.courses.forEach((course: IEnrolledCourse) => {
        // Check if course already exists in list
        const existingCourse = courseList.find(c => c.id === course.id)
        if (!existingCourse) {
          // Add new course with combo_id
          courseList.push({
            id: course.id,
            title: course.title,
            skill: course.skill_focus || "general",
            duration: course.estimated_duration || 60,
            color: skillColors[course.skill_focus || "general"] || skillColors.general,
            isCompleted: course.is_completed || false,
            comboId: comboEnrollment.combo.id, // Store combo_id for courses from combo
          })
        } else {
          // If course exists but doesn't have comboId, add it
          // This handles case where course is in both individual and combo enrollment
          if (!existingCourse.comboId) {
            existingCourse.comboId = comboEnrollment.combo.id
          }
        }
      })
    })

    return courseList
  }, [enrolledCourses, comboEnrollments])

  // Convert schedules to ScheduledItem format
  const scheduledItems: ScheduledItem[] = useMemo(() => {
    const savedItems = schedules.map((schedule: StudyScheduleDetails) => ({
      id: schedule.id,
      courseId: schedule.course_id,
      date: format(new Date(schedule.scheduled_date), "yyyy-MM-dd"),
      time: typeof schedule.start_time === 'string' 
        ? schedule.start_time.includes('T') 
          ? new Date(schedule.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : schedule.start_time
        : schedule.start_time,
      isCompleted: schedule.status === "completed",
      reminderEnabled: schedule.reminder_enabled ?? false,
      reminderSent: schedule.reminder_sent ?? false,
      reminderMinutesBefore: schedule.reminder_minutes_before ?? undefined,
    }))
    
    // Add pending schedules
    const pendingItems = pendingSchedules.map((pending) => ({
      id: pending.id,
      courseId: pending.courseId,
      date: pending.date,
      time: pending.startTime,
      isCompleted: false,
      isPending: true,
      reminderEnabled: pending.reminderEnabled ?? false,
      reminderMinutesBefore: pending.reminderMinutesBefore ?? undefined,
    }))
    
    return [...savedItems, ...pendingItems]
  }, [schedules, pendingSchedules])

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (data: CreateScheduleDto) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-schedules"] })
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to create schedule"
        : "Failed to create schedule"
      setNotification({ 
        message: errorMessage, 
        type: "error" 
      })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-schedules"] })
      setNotification({ message: "Schedule deleted successfully", type: "success" })
      setTimeout(() => setNotification(null), 3000)
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to delete schedule"
        : "Failed to delete schedule"
      setNotification({ 
        message: errorMessage, 
        type: "error" 
      })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { completion_percentage: number } }) =>
      completeSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-schedules"] })
      setNotification({ message: "Session marked as completed", type: "success" })
      setTimeout(() => setNotification(null), 3000)
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to complete session"
        : "Failed to complete session"
      setNotification({ 
        message: errorMessage, 
        type: "error" 
      })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses]

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterSkill !== "all") {
      filtered = filtered.filter((course) => course.skill === filterSkill)
    }

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
  }, [courses, searchQuery, sortBy, filterSkill])

  // Get unique skills for filter
  const uniqueSkills = useMemo(() => {
    const skills = new Set(courses.map((c) => c.skill))
    return Array.from(skills).sort()
  }, [courses])

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
    const course = courses.find((c) => c.id === event.active.id)
    if (course) {
      setDraggedCourse(course)
    }
  }

  // Handle drag end - open modal to select time and options
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCourse(null)

    if (!over || !active) return

    // If dropped on a date cell, open modal to select time and options
    if (over.id.toString().startsWith("date-")) {
      const dateStr = over.id.toString().replace("date-", "")
      const course = courses.find((c) => c.id === active.id)
      
      if (course) {
        setSelectedCourse(course)
        setSelectedDate(dateStr)
        setTimeModalOpen(true)
      }
    }
  }

  // Handle save from modal - add to pending schedules
  const handleSaveFromModal = async (data: {
    course_id: string
    combo_id?: string
    scheduled_date: string
    start_time: string
    end_time: string
    study_goal?: string
    notes?: string
    reminder_enabled?: boolean
    reminder_minutes_before?: number
  }) => {
    // Add to pending schedules
    const newPending: PendingSchedule = {
      id: `pending-${Date.now()}-${Math.random()}`,
      courseId: data.course_id,
      comboId: data.combo_id,
      date: data.scheduled_date,
      startTime: data.start_time,
      endTime: data.end_time,
      studyGoal: data.study_goal,
      notes: data.notes,
      reminderEnabled: data.reminder_enabled ?? true,
      reminderMinutesBefore: data.reminder_minutes_before ?? 30,
    }
    
    setPendingSchedules([...pendingSchedules, newPending])
    setTimeModalOpen(false)
    setSelectedCourse(null)
    setSelectedDate("")
  }

  // Handle batch save all pending schedules
  const handleBatchSave = async () => {
    if (pendingSchedules.length === 0) return
    
    try {
      // Create all schedules
      const promises = pendingSchedules.map((pending) => 
        createSchedule({
          course_id: pending.courseId,
          combo_id: pending.comboId,
          scheduled_date: pending.date,
          start_time: pending.startTime,
          end_time: pending.endTime,
          study_goal: pending.studyGoal,
          notes: pending.notes,
          reminder_enabled: pending.reminderEnabled,
          reminder_minutes_before: pending.reminderMinutesBefore,
        })
      )
      
      await Promise.all(promises)
      
      // Clear pending schedules
      setPendingSchedules([])
      
      // Refresh schedules
      queryClient.invalidateQueries({ queryKey: ["my-schedules"] })
      
      setNotification({ 
        message: `Successfully saved ${pendingSchedules.length} schedule(s)`, 
        type: "success" 
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to save schedules"
        : "Failed to save schedules"
      setNotification({ message: errorMessage, type: "error" })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Remove pending schedule
  const removePendingSchedule = (id: string) => {
    setPendingSchedules(pendingSchedules.filter(p => p.id !== id))
  }

  // Toggle completion
  const toggleCompletion = async (itemId: string) => {
    const item = scheduledItems.find((i) => i.id === itemId)
    if (!item) return

    // Check if this is a pending schedule 
    const isPending = itemId.startsWith("pending-")
    if (isPending) {
      setNotification({ 
        message: "Please save the schedule first before marking it as completed", 
        type: "error" 
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (item.isCompleted) {
      // If already completed, we could update to scheduled status
      // For now, just toggle locally for simplicity
      // You might want to add an update endpoint for this
    } else {
      // Mark as completed - only for saved schedules
      await completeSessionMutation.mutateAsync({
        id: itemId,
        data: { completion_percentage: 100 },
      })
    }
  }

  // Delete scheduled item - show confirmation dialog
  const deleteScheduledItem = (itemId: string) => {
    setScheduleToDelete(itemId)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return

    // Check if it's a pending schedule
    if (scheduleToDelete.startsWith("pending-")) {
      removePendingSchedule(scheduleToDelete)
      setDeleteDialogOpen(false)
      setScheduleToDelete(null)
      return
    }
    
    // Otherwise delete from backend
    await deleteScheduleMutation.mutateAsync(scheduleToDelete)
    setDeleteDialogOpen(false)
    setScheduleToDelete(null)
  }

  // Get course by ID helper
  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId)

  const isLoading = coursesLoading || combosLoading || schedulesLoading

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6 w-full">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {notification.message}
          </div>
        )}

        <ScheduleHeader 
          onGoToToday={() => setCurrentMonth(new Date())}
          pendingCount={pendingSchedules.length}
          onBatchSave={pendingSchedules.length > 0 ? handleBatchSave : undefined}
          isSaving={createScheduleMutation.isPending}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading schedules...</p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Time Modal for selecting schedule options */}
        <ScheduleTimeModal
          open={timeModalOpen}
          onOpenChange={setTimeModalOpen}
          course={selectedCourse}
          selectedDate={selectedDate}
          onSave={handleSaveFromModal}
          isLoading={false}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this schedule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDialogOpen(false)
                setScheduleToDelete(null)
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

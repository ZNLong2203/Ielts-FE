export interface Course {
  id: string
  title: string
  skill: string
  duration: number
  color: string
  isCompleted: boolean
  comboId?: string // Store combo_id if course belongs to a combo
}

export interface ScheduledItem {
  id: string
  courseId: string
  date: string
  time?: string | Date
  isCompleted: boolean
}

export interface PendingSchedule {
  id: string // temporary ID
  courseId: string
  comboId?: string
  date: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  studyGoal?: string
  notes?: string
  reminderEnabled?: boolean
  reminderMinutesBefore?: number
}


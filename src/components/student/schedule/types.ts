export interface Course {
  id: string
  title: string
  skill: string
  duration: number
  color: string
  isCompleted: boolean
}

export interface ScheduledItem {
  id: string
  courseId: string
  date: string
  time?: string
  isCompleted: boolean
}


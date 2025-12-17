"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Course } from "./types"
import { TimePicker } from "./TimePicker"

interface ScheduleTimeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  selectedDate: string
  onSave: (data: {
    course_id: string
    combo_id?: string
    scheduled_date: string
    start_time: string
    end_time: string
    study_goal?: string
    notes?: string
    reminder_enabled?: boolean
    reminder_minutes_before?: number
  }) => Promise<void>
  isLoading?: boolean
}

export function ScheduleTimeModal({
  open,
  onOpenChange,
  course,
  selectedDate,
  onSave,
  isLoading = false,
}: ScheduleTimeModalProps) {
  // Calculate default end time based on course duration
  const getDefaultEndTime = (start: string, durationMinutes: number = 60) => {
    const [hours, minutes] = start.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0)
    startDate.setMinutes(startDate.getMinutes() + durationMinutes)
    return `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`
  }

  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState(() => getDefaultEndTime("09:00", course?.duration || 60))
  const [studyGoal, setStudyGoal] = useState("")
  const [notes, setNotes] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderMinutes, setReminderMinutes] = useState(30)

  const handleSave = async () => {
    if (!course) return

    // Calculate end time if not provided
    let finalEndTime = endTime
    if (!endTime || endTime <= startTime) {
      // Default to 1 hour after start time
      const [hours, minutes] = startTime.split(":").map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0)
      startDate.setHours(startDate.getHours() + 1)
      finalEndTime = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`
    }

    await onSave({
      course_id: course.id,
      combo_id: course.comboId, // Include combo_id if course belongs to a combo
      scheduled_date: selectedDate,
      start_time: startTime,
      end_time: finalEndTime,
      study_goal: studyGoal || undefined,
      notes: notes || undefined,
      reminder_enabled: reminderEnabled,
      reminder_minutes_before: reminderEnabled ? reminderMinutes : undefined,
    })

    // Reset form
    const defaultStart = "09:00"
    setStartTime(defaultStart)
    setEndTime(getDefaultEndTime(defaultStart, course?.duration || 60))
    setStudyGoal("")
    setNotes("")
    setReminderEnabled(true)
    setReminderMinutes(30)
  }

  // Update end time when start time changes
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime)
    // Auto-update end time if it's before or equal to start time
    if (!endTime || endTime <= newStartTime) {
      const newEndTime = getDefaultEndTime(newStartTime, course?.duration || 60)
      setEndTime(newEndTime)
    }
  }

  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Study Time</DialogTitle>
          <DialogDescription>
            Set the time for <span className="font-semibold">{course.title}</span> on{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartTimeChange}
              id="start-time"
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={(newEndTime) => {
                setEndTime(newEndTime)
              }}
              id="end-time"
              min={startTime}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="study-goal">Study Goal (Optional)</Label>
            <Input
              id="study-goal"
              placeholder="e.g., Complete Section 2: Reading Strategies"
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-blue-50/50">
            <div className="space-y-0.5">
              <Label htmlFor="reminder" className="flex items-center gap-2">
                Enable Reminder
                <span className="text-xs text-blue-600 font-medium">(Email)</span>
              </Label>
              <p className="text-sm text-gray-600">
                You&apos;ll receive an email reminder before your study session starts
              </p>
            </div>
            <Switch
              id="reminder"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {reminderEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder-minutes">Remind me (minutes before)</Label>
              <Input
                id="reminder-minutes"
                type="number"
                min={5}
                max={120}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">Between 5 and 120 minutes</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


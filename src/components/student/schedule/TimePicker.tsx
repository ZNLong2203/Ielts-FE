"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clock } from "lucide-react"

interface TimePickerProps {
  label: string
  value: string // Format: "HH:mm"
  onChange: (value: string) => void
  id?: string
  min?: string // Minimum time in "HH:mm" format
}

export function TimePicker({ label, value, onChange, id, min }: TimePickerProps) {
  // Parse time string "HH:mm" to hours and minutes
  const [hours, minutes] = value ? value.split(":").map(Number) : [9, 0]
  
  // Get min hours and minutes if provided
  const minTime = min ? min.split(":").map(Number) : null

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0")
    return {
      value: hour,
      label: hour,
      disabled: minTime ? i < minTime[0] : false,
    }
  })

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = [
    { value: "00", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ]

  const handleHourChange = (newHour: string) => {
    const newTime = `${newHour}:${String(minutes).padStart(2, "0")}`
    onChange(newTime)
  }

  const handleMinuteChange = (newMinute: string) => {
    const newTime = `${String(hours).padStart(2, "0")}:${newMinute}`
    onChange(newTime)
  }

  const currentHour = String(hours).padStart(2, "0")
  const currentMinute = String(minutes).padStart(2, "0")

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Select value={currentHour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((hour) => (
              <SelectItem
                key={hour.value}
                value={hour.value}
                disabled={hour.disabled}
              >
                {hour.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-lg font-semibold text-gray-400">:</span>
        <Select value={currentMinute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="mm" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute.value} value={minute.value}>
                {minute.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}


import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Study Schedule Types
export interface CreateScheduleDto {
  combo_id?: string;
  course_id: string;
  lesson_id?: string;
  scheduled_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  study_goal?: string;
  notes?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export interface UpdateScheduleDto {
  combo_id?: string;
  course_id?: string;
  lesson_id?: string;
  scheduled_date?: string;
  start_time?: string;
  end_time?: string;
  study_goal?: string;
  notes?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
  status?: ScheduleStatusType;
}

export interface CompleteScheduleDto {
  completion_percentage: number;
}

export interface TimeSlotDto {
  day: string;
  start_time: string;
  end_time: string;
}

export interface BulkCreateScheduleDto {
  combo_id: string;
  weeks_count: number;
  time_slots: TimeSlotDto[];
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export type ScheduleStatusType = "scheduled" | "completed" | "missed" | "cancelled";

export interface StudyScheduleDetails {
  id: string;
  user_id: string;
  combo_id?: string;
  course_id: string;
  lesson_id?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  study_goal?: string;
  notes?: string;
  status: ScheduleStatusType;
  completion_percentage: number;
  reminder_enabled: boolean;
  reminder_minutes_before?: number;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  combo?: {
    id: string;
    name: string;
    target_band_range?: string;
  };
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
    skill_focus?: string;
  };
  lesson?: {
    id: string;
    title: string;
    lesson_type?: string;
  };
  reminders?: Array<{
    id: string;
    title: string;
    message: string;
    scheduled_time: string;
    status: string;
    is_read: boolean;
  }>;
}

export interface WeeklyScheduleSummary {
  week_start: string;
  week_end: string;
  total_sessions: number;
  completed_sessions: number;
  missed_sessions: number;
  total_planned_hours: number;
  total_actual_hours: number;
  completion_rate: number;
  schedules: StudyScheduleDetails[];
}

export interface StudyAnalytics {
  period: "week" | "month";
  total_sessions: number;
  completed_sessions: number;
  missed_sessions: number;
  cancelled_sessions: number;
  total_study_hours: string;
  avg_completion_percentage: string;
  most_studied_skill?: string;
  combo_progress?: Array<{
    combo_id: string;
    combo_name: string;
    completed_courses: number;
    total_courses: number;
    progress_percentage: number;
  }>;
}

// Create a single schedule
export const createSchedule = async (data: CreateScheduleDto): Promise<StudyScheduleDetails> => {
  const response = await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}`, data);
  return response.data.data;
};

// Bulk create schedules for combo
export const bulkCreateSchedules = async (data: BulkCreateScheduleDto): Promise<{
  created_count: number;
  schedules: StudyScheduleDetails[];
}> => {
  const response = await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/bulk`, data);
  return response.data.data;
};

// Get my schedules
export const getMySchedules = async (params?: {
  date?: string;
  week?: string;
  month?: string;
  status?: ScheduleStatusType;
  combo_id?: string;
  course_id?: string;
}): Promise<StudyScheduleDetails[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/my-schedules`, { params });
  return response.data.data;
};

// Get weekly schedule
export const getWeeklySchedule = async (weekOffset?: number): Promise<WeeklyScheduleSummary> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/weekly-schedule`, {
    params: { week_offset: weekOffset },
  });
  return response.data.data;
};

// Get schedule by ID
export const getScheduleById = async (id: string): Promise<StudyScheduleDetails> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}`);
  return response.data.data;
};

// Update schedule
export const updateSchedule = async (id: string, data: UpdateScheduleDto): Promise<StudyScheduleDetails> => {
  const response = await api.put(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}`, data);
  return response.data.data;
};

// Start session
export const startSession = async (id: string): Promise<StudyScheduleDetails> => {
  const response = await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}/start`);
  return response.data.data;
};

// Complete session
export const completeSession = async (id: string, data: CompleteScheduleDto): Promise<StudyScheduleDetails> => {
  const response = await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}/complete`, data);
  return response.data.data;
};

// Cancel schedule
export const cancelSchedule = async (id: string): Promise<void> => {
  await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}/cancel`);
};

// Delete schedule
export const deleteSchedule = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/${id}`);
};

// Get study analytics
export const getStudyAnalytics = async (period?: "week" | "month"): Promise<StudyAnalytics> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/analytics`, {
    params: { period },
  });
  return response.data.data;
};

// Get combo schedules
export const getComboSchedules = async (comboId: string): Promise<StudyScheduleDetails[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/combo/${comboId}/schedules`);
  return response.data.data;
};

// Get combo progress
export const getComboProgress = async (comboId: string) => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/combo/${comboId}/progress`);
  return response.data.data;
};

// Reminder Types
export interface StudyReminder {
  id: string;
  user_id: string;
  schedule_id: string;
  title: string;
  message: string;
  scheduled_time: string;
  status: "pending" | "sent" | "failed";
  is_read: boolean;
  created_at: string;
  updated_at: string;
  schedule?: {
    id: string;
    course_id: string;
    scheduled_date: string;
    start_time: string;
    study_goal?: string;
    course?: {
      id: string;
      title: string;
      thumbnail?: string;
    };
  };
}

// Get my reminders
export const getMyReminders = async (params?: {
  status?: "pending" | "sent" | "failed";
  unread_only?: boolean;
}): Promise<StudyReminder[]> => {
  const response = await api.get(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/reminders/my-reminders`, { params });
  return response.data.data;
};

// Mark reminder as read
export const markReminderAsRead = async (reminderId: string): Promise<void> => {
  await api.post(`${BASE_URL}${API_URL.STUDY_SCHEDULE}/reminders/${reminderId}/read`);
};


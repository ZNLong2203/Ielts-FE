export const TEACHER_STATUS = [
  {
    value: "pending",
    label: "Pending"
  },
  {
    value: "approved",
    label: "Approved"
  },
  {
    value: "rejected",
    label: "Rejected"
  },
  {
    value: "suspended",
    label: "Suspended"
  }
];

export const TEACHER_SPECIALIZATION = [
  {
    value: "reading",
    label: "Reading"
  },
  {
    value: "writing",
    label: "Writing"
  },
  {
    value: "listening",
    label: "Listening"
  },
  {
    value: "speaking",
    label: "Speaking"
  }
];

export const DAY_OF_WEEK = [
  {
    value: "monday",
    label: "Monday"
  },
  {
    value: "tuesday",
    label: "Tuesday"
  },
  {
    value: "wednesday",
    label: "Wednesday"
  },
  {
    value: "thursday",
    label: "Thursday"
  },
  {
    value: "friday",
    label: "Friday"
  },
  {
    value: "saturday",
    label: "Saturday"
  },
  {
    value: "sunday",
    label: "Sunday"
  }
];

export type TeacherStatus =
  (typeof TEACHER_STATUS)[keyof typeof TEACHER_STATUS];
export type TeacherSpecialization =
  (typeof TEACHER_SPECIALIZATION)[keyof typeof TEACHER_SPECIALIZATION];
export type DayOfWeek = (typeof DAY_OF_WEEK)[keyof typeof DAY_OF_WEEK];

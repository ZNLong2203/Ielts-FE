export const USER_STATUS = [
  {
    value: "active",
    label: "Active"
  },
  {
    value: "inactive",
    label: "Inactive"
  }
]

// filepath: c:\Workspace\Ielts-FE\src\constants\user.ts
export const USER_GENDER = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
]

export const USER_ROLE = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

const ROUTES = {
  HOME: "/",
  STUDENT_REGISTER: "/auth/student/register",
  TEACHER_REGISTER: "/auth/teacher/register",
  TEACHER_RESET_PASSWORD: "/auth/teacher/reset-password",
  LOGIN: "/auth/login",

  STUDENT_PROFILE: "/profile/student",
  TEACHER_PROFILE: "/teacher/dashboard/profile",

  ADMIN: "/admin",
  ADMIN_STUDENTS: "/admin/student",
  ADMIN_TEACHERS: "/admin/teacher",
  ADMIN_BLOG_CATEGORIES: "/admin/blogCategory",
  ADMIN_BLOGS: "/admin/blog",
  ADMIN_COURSE_CATEGORIES: "/admin/courseCategory",
  ADMIN_COURSES: "/admin/course",
  ADMIN_COUPONS: "/admin/coupon",
  ADMIN_COURSE_COMBO: "/admin/courseCombo",
  ADMIN_ORDERS: "/admin/order",
  ADMIN_MOCK_TESTS: "/admin/mockTest",
  ADMIN_READING: "/reading",
  ADMIN_LISTENING: "/listening",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_CHATBOT: "/admin/chatbot",
  
  TEACHER: "/teacher/dashboard",
  TEACHER_BLOGS: "/teacher/dashboard/blog",
  TEACHER_WRITING_GRADING: "/teacher/dashboard/writing-grading",
  TEACHER_SPEAKING_GRADING: "/teacher/dashboard/speaking-grading",
  TEACHER_CHATBOT: "/teacher/dashboard/chatbot",
  TEACHER_SETTINGS: "/teacher/dashboard/settings",
  TEACHER_COURSES: "/teacher/dashboard/course",
  TEACHER_COURSE_STUDENTS: "/teacher/dashboard/course/[slug]/students",
};

export default ROUTES;

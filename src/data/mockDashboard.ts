// Dashboard Mock Data
export const mockDashboardStats = {
  totalUsers: 2847,
  totalCourses: 156,
  totalMockTests: 89,
  totalRevenue: 125670,
  userGrowth: 12.5,
  courseGrowth: 8.3,
  mockTestGrowth: 15.7,
  revenueGrowth: 23.2,
  todayNewUsers: 28,
  todayTestsCompleted: 134,
  todayEnrollments: 45,
  todayRevenue: 980,
};

export const mockRecentActivities = [
  {
    type: "user_registered" as const,
    title: "New user registration",
    description: "John Doe joined the platform",
    timestamp: "2 minutes ago",
    user: {
      name: "John Doe",
      avatar: "/avatars/01.png",
    },
  },
  {
    type: "course_created" as const,
    title: "New course published",
    description: "IELTS Speaking Mastery course was published",
    timestamp: "15 minutes ago",
    user: {
      name: "Sarah Wilson",
      avatar: "/avatars/02.png",
    },
  },
  {
    type: "payment_received" as const,
    title: "Payment received",
    description: "Premium course purchase",
    timestamp: "1 hour ago",
    amount: 199,
    user: {
      name: "Mike Chen",
      avatar: "/avatars/03.png",
    },
  },
  {
    type: "mocktest_completed" as const,
    title: "Mock test completed",
    description: "IELTS Academic Practice Test #5",
    timestamp: "2 hours ago",
    user: {
      name: "Emma Davis",
      avatar: "/avatars/04.png",
    },
  },
  {
    type: "user_registered" as const,
    title: "New user registration",
    description: "Alex Johnson joined the platform",
    timestamp: "3 hours ago",
    user: {
      name: "Alex Johnson",
    },
  },
];

export const mockUserGrowthChart = [
  { name: "Jan", value: 120, label: "Users" },
  { name: "Feb", value: 190, label: "Users" },
  { name: "Mar", value: 300, label: "Users" },
  { name: "Apr", value: 500, label: "Users" },
  { name: "May", value: 620, label: "Users" },
  { name: "Jun", value: 900, label: "Users" },
  { name: "Jul", value: 1200, label: "Users" },
  { name: "Aug", value: 1400, label: "Users" },
  { name: "Sep", value: 1800, label: "Users" },
  { name: "Oct", value: 2100, label: "Users" },
  { name: "Nov", value: 2500, label: "Users" },
  { name: "Dec", value: 2847, label: "Users" },
];

export const mockRevenueChart = [
  { name: "Jan", value: 4500, label: "Revenue ($)" },
  { name: "Feb", value: 6200, label: "Revenue ($)" },
  { name: "Mar", value: 8900, label: "Revenue ($)" },
  { name: "Apr", value: 12400, label: "Revenue ($)" },
  { name: "May", value: 15600, label: "Revenue ($)" },
  { name: "Jun", value: 18900, label: "Revenue ($)" },
  { name: "Jul", value: 22300, label: "Revenue ($)" },
  { name: "Aug", value: 26700, label: "Revenue ($)" },
  { name: "Sep", value: 31200, label: "Revenue ($)" },
  { name: "Oct", value: 35800, label: "Revenue ($)" },
  { name: "Nov", value: 40500, label: "Revenue ($)" },
  { name: "Dec", value: 45200, label: "Revenue ($)" },
];

export const mockTopCourses = [
  {
    id: "1",
    title: "IELTS Academic Complete Course",
    thumbnail: "/course-thumbnails/01.jpg",
    enrollments: 1247,
    rating: 4.8,
    revenue: 24940,
  },
  {
    id: "2",
    title: "IELTS Speaking Mastery",
    thumbnail: "/course-thumbnails/02.jpg",
    enrollments: 923,
    rating: 4.9,
    revenue: 18460,
  },
  {
    id: "3",
    title: "IELTS Writing Band 7+ Secrets",
    thumbnail: "/course-thumbnails/03.jpg",
    enrollments: 756,
    rating: 4.7,
    revenue: 15120,
  },
  {
    id: "4",
    title: "IELTS Listening Practice Pro",
    thumbnail: "/course-thumbnails/04.jpg",
    enrollments: 634,
    rating: 4.6,
    revenue: 12680,
  },
  {
    id: "5",
    title: "IELTS Reading Strategies",
    thumbnail: "/course-thumbnails/05.jpg",
    enrollments: 589,
    rating: 4.8,
    revenue: 11780,
  },
];

export const mockDashboardData = {
  stats: mockDashboardStats,
  recentActivities: mockRecentActivities,
  userGrowthChart: mockUserGrowthChart,
  revenueChart: mockRevenueChart,
  topCourses: mockTopCourses,
};

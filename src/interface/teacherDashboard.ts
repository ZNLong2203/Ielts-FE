export interface TeacherStats {
  pendingSubmissions: number;
  totalBlogs: number;
  publishedBlogs: number;
  weeklyBlogs: number;
  weeklyGraded: number;
  monthlyGraded: number;
  blogGrowth: number;
  gradingGrowth: number;
}

export interface RecentSubmission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  courseTitle: string;
  exerciseTitle: string;
  type: string;
  submittedAt: string;
  status: string;
}

export interface TeacherDashboard {
  stats: TeacherStats;
  recentSubmissions: RecentSubmission[];
}

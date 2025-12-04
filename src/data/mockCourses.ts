// Mock data for Course APIs
export const mockCourses = [
  {
    id: "1",
    title: "IELTS Academic Complete Course",
    description:
      "Comprehensive IELTS preparation course covering all four skills",
    thumbnail: "/course-thumbnails/01.jpg",
    price: 199,
    originalPrice: 299,
    rating: 4.8,
    reviewCount: 1247,
    enrollmentCount: 1247,
    duration: "40 hours",
    level: "Intermediate",
    instructor: {
      id: "1",
      name: "Dr. Sarah Wilson",
      avatar: "/avatars/instructor1.jpg",
      bio: "IELTS Expert with 15+ years experience",
    },
    category: {
      id: "1",
      name: "IELTS Academic",
      slug: "ielts-academic",
    },
    isFeatured: true,
    isPublished: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-20T14:45:00Z",
  },
  {
    id: "2",
    title: "IELTS Speaking Mastery",
    description:
      "Master IELTS Speaking with proven strategies and practice sessions",
    thumbnail: "/course-thumbnails/02.jpg",
    price: 149,
    originalPrice: 199,
    rating: 4.9,
    reviewCount: 923,
    enrollmentCount: 923,
    duration: "25 hours",
    level: "All Levels",
    instructor: {
      id: "2",
      name: "Michael Chen",
      avatar: "/avatars/instructor2.jpg",
      bio: "Speaking Coach & IELTS Examiner",
    },
    category: {
      id: "2",
      name: "IELTS Speaking",
      slug: "ielts-speaking",
    },
    isFeatured: true,
    isPublished: true,
    createdAt: "2024-02-10T09:15:00Z",
    updatedAt: "2024-11-18T11:20:00Z",
  },
  {
    id: "3",
    title: "IELTS Writing Band 7+ Secrets",
    description: "Unlock the secrets to achieving Band 7+ in IELTS Writing",
    thumbnail: "/course-thumbnails/03.jpg",
    price: 129,
    originalPrice: 179,
    rating: 4.7,
    reviewCount: 756,
    enrollmentCount: 756,
    duration: "20 hours",
    level: "Advanced",
    instructor: {
      id: "3",
      name: "Emma Davis",
      avatar: "/avatars/instructor3.jpg",
      bio: "Writing Specialist & Academic Trainer",
    },
    category: {
      id: "3",
      name: "IELTS Writing",
      slug: "ielts-writing",
    },
    isFeatured: false,
    isPublished: true,
    createdAt: "2024-03-05T16:45:00Z",
    updatedAt: "2024-11-15T13:30:00Z",
  },
];

export const mockCourseCategories = [
  {
    id: "1",
    name: "IELTS Academic",
    slug: "ielts-academic",
    description: "Complete IELTS Academic preparation courses",
    courseCount: 25,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "IELTS Speaking",
    slug: "ielts-speaking",
    description: "Specialized courses for IELTS Speaking improvement",
    courseCount: 12,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "IELTS Writing",
    slug: "ielts-writing",
    description: "Expert-led courses for IELTS Writing mastery",
    courseCount: 15,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "IELTS Listening",
    slug: "ielts-listening",
    description: "Comprehensive listening practice and strategies",
    courseCount: 8,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "IELTS Reading",
    slug: "ielts-reading",
    description: "Reading comprehension and technique courses",
    courseCount: 10,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const mockFeaturedCourses = mockCourses.filter(
  (course) => course.isFeatured
);

export const mockNewestCourses = [...mockCourses]
  .sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  .slice(0, 6);

export const mockCoursesWithPagination = (
  page = 1,
  limit = 10,
  search = ""
) => {
  let filteredCourses = mockCourses;

  if (search) {
    filteredCourses = mockCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return {
    courses: paginatedCourses,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredCourses.length,
      total_pages: Math.ceil(filteredCourses.length / limit),
      has_next_page: endIndex < filteredCourses.length,
      has_prev_page: page > 1,
    },
  };
};

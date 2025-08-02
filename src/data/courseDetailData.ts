import {
  Video,
  Users,
  MessageCircle,
  FileText,
  BadgeIcon as Certificate,
  Smartphone,
  Download,
  Infinity,
} from "lucide-react"

export const courseData = {
  id: "1",
  title: "IELTS Academic Complete Preparation Course",
  slug: "ielts-academic-complete",
  subtitle: "Master all four skills and achieve Band 7+ with proven strategies",
  description:
    "This comprehensive IELTS Academic course is designed by former IELTS examiners and has helped over 2,800 students achieve their target band scores. You'll master all four skills through interactive lessons, unlimited practice, and personalized feedback.",
  image: "/placeholder.svg?height=400&width=800",
  video: "/placeholder.svg?height=400&width=800",
  category: "IELTS Academic",
  level: "All Levels",
  duration: "12 weeks",
  lessons: 48,
  totalHours: 36,
  students: 2847,
  rating: 4.9,
  reviews: 324,
  price: 299,
  originalPrice: 399,
  discount: 25,
  lastUpdated: "January 2024",
  language: "English",

  instructor: {
    name: "Dr. Sarah Johnson",
    avatar: "/placeholder.svg?height=80&width=80",
    title: "IELTS Expert & Former Examiner",
    bio: "Dr. Sarah Johnson is a certified IELTS examiner with over 10 years of experience. She has helped thousands of students achieve their target band scores and holds a PhD in Applied Linguistics from Cambridge University.",
    experience: "10+ years",
    students: "5,000+",
    courses: 8,
    rating: 4.9,
    credentials: ["PhD Applied Linguistics", "Certified IELTS Examiner", "Cambridge CELTA", "TESOL Certified"],
  },

  features: [
    { icon: Video, title: "48 HD Video Lessons", description: "Comprehensive video content covering all IELTS skills" },
    { icon: Users, title: "Live Group Classes", description: "Weekly interactive sessions with the instructor" },
    { icon: MessageCircle, title: "1-on-1 Speaking Sessions", description: "Personal speaking practice with feedback" },
    { icon: FileText, title: "Unlimited Mock Tests", description: "Full-length practice tests with detailed analysis" },
    {
      icon: Certificate,
      title: "Certificate of Completion",
      description: "Official certificate upon course completion",
    },
    { icon: Smartphone, title: "Mobile App Access", description: "Learn on-the-go with our mobile application" },
    { icon: Download, title: "Downloadable Resources", description: "PDF guides, audio files, and practice materials" },
    { icon: Infinity, title: "Lifetime Access", description: "Keep access to all course materials forever" },
  ],

  curriculum: [
    {
      title: "Getting Started with IELTS",
      lessons: 6,
      duration: "2 hours",
      description: "Introduction to IELTS format, scoring system, and test strategies",
      items: [
        { title: "IELTS Overview and Test Format", duration: "15 min", type: "video", preview: true },
        { title: "Understanding Band Scores", duration: "12 min", type: "video", preview: false },
        { title: "Test Day Preparation", duration: "18 min", type: "video", preview: false },
        { title: "Study Plan Creation", duration: "20 min", type: "video", preview: false },
        { title: "Common Mistakes to Avoid", duration: "16 min", type: "video", preview: false },
        { title: "Module 1 Quiz", duration: "10 min", type: "quiz", preview: false },
      ],
    },
    // Add more curriculum modules...
  ],

  skills: [
    "IELTS Reading Strategies",
    "Academic Writing",
    "Listening Comprehension",
    "Speaking Fluency",
    "Test-taking Techniques",
    "Time Management",
    "Vocabulary Building",
    "Grammar Mastery",
  ],

  requirements: [
    "Intermediate level of English (B1 or above)",
    "Computer or mobile device with internet connection",
    "Headphones or speakers for listening practice",
    "Notebook for taking notes during lessons",
    "Commitment to practice regularly",
  ],

  outcomes: [
    "Achieve your target IELTS band score (7.0+)",
    "Master all four IELTS skills comprehensively",
    "Develop effective test-taking strategies",
    "Build confidence for the actual test day",
    "Improve overall English proficiency",
    "Access to exclusive practice materials",
    "Receive personalized feedback on performance",
    "Join a community of successful IELTS students",
  ],

  testimonials: [
    {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=60&width=60",
      country: "Spain",
      score: "Band 8.0",
      text: "This course completely transformed my IELTS preparation. Dr. Sarah's teaching methods are exceptional, and the practice materials are incredibly comprehensive. I achieved Band 8.0 on my first attempt!",
      rating: 5,
    },
    // Add more testimonials...
  ],

  faqs: [
    {
      question: "How long do I have access to the course?",
      answer: "You get lifetime access to all course materials, including future updates and new content additions.",
    },
    // Add more FAQs...
  ],
}

export const relatedCourses = [
  {
    id: "2",
    title: "IELTS Speaking Confidence Booster",
    slug: "ielts-speaking-confidence",
    image: "/placeholder.svg?height=200&width=300",
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    students: 1523,
  },
  // Add more related courses...
]
"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Components
import CourseHeader from "@/components/courses/detail/CourseHeader"
import CourseVideo from "@/components/courses/detail/CourseVideo"
import CourseOverview from "@/components/courses/detail/CourseOverview"
import CourseCurriculum from "@/components/courses/detail/CourseCurriculum"
import InstructorProfile from "@/components/courses/detail/InstructorProfile"
import CourseReviews from "@/components/courses/detail/CourseReviews"
import CourseFAQ from "@/components/courses/detail/CourseFAQ"
import PurchaseCard from "@/components/courses/detail/PurchaseCard"
import CourseStats from "@/components/courses/detail/CourseStats"
import RelatedCourses from "@/components/courses/detail/RelatedCourses"

// Mock data - trong thực tế sẽ fetch từ API
import { courseData, relatedCourses } from "@/data/courseDetailData"

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-gray-500 mb-6"
      >
        <Link href="/courses" className="hover:text-blue-600 transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{courseData.category}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate">{courseData.title}</span>
      </motion.nav>

      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <Link href="/courses">
          <Button variant="ghost" className="pl-0 hover:pl-2 transition-all group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Button>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <CourseHeader courseData={courseData} />

          {/* Course Video */}
          <CourseVideo title={courseData.title} image={courseData.image} />

          {/* Course Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <CourseOverview courseData={courseData} />
              </TabsContent>

              <TabsContent value="curriculum">
                <CourseCurriculum
                  curriculum={courseData.curriculum}
                  totalLessons={courseData.lessons}
                  totalHours={courseData.totalHours}
                />
              </TabsContent>

              <TabsContent value="instructor">
                <InstructorProfile instructor={courseData.instructor} />
              </TabsContent>

              <TabsContent value="reviews">
                <CourseReviews
                  rating={courseData.rating}
                  reviews={courseData.reviews}
                  testimonials={courseData.testimonials}
                />
              </TabsContent>

              <TabsContent value="faq">
                <CourseFAQ faqs={courseData.faqs} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-8 space-y-6">
            {/* Purchase Card */}
            <PurchaseCard
              price={courseData.price}
              originalPrice={courseData.originalPrice}
              discount={courseData.discount}
              features={courseData.features}
            />

            {/* Course Stats */}
            <CourseStats
              students={courseData.students}
              duration={courseData.duration}
              lessons={courseData.lessons}
              level={courseData.level}
              language={courseData.language}
              rating={courseData.rating}
            />

            {/* Related Courses */}
            <RelatedCourses courses={relatedCourses} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

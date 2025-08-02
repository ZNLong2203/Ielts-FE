"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, GraduationCap, Clock, Trophy, Target, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Components
import HeroSection from "@/components/courses/HeroSection"
import CategoryCard from "@/components/courses/CategoryCard"
import SearchAndFilter from "@/components/courses/SearchAndFilter"
import CourseCard from "@/components/courses/CourseCard"
import LoadingSpinner from "@/components/courses/LoadingSpinner"

// Mock data
import { categories, courses } from "@/data/coursesData"

const stats = [
  {
    label: "Active Students",
    value: "25,000+",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Learning with us globally",
  },
  {
    label: "Expert Instructors",
    value: "150+",
    icon: GraduationCap,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Certified professionals",
  },
  {
    label: "Course Hours",
    value: "2,500+",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Of premium content",
  },
  {
    label: "Success Rate",
    value: "96%",
    icon: Trophy,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Students achieve goals",
  },
]

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.students - a.students
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      default:
        return 0
    }
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <HeroSection stats={stats} />

        {/* Categories Section */}
        <motion.section variants={containerVariants} initial="hidden" animate="visible" className="mb-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full px-6 py-3 mb-6 border border-purple-200/50">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Choose Your Path</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Specialized Learning <span className="text-blue-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover expertly crafted courses designed to meet your specific English learning goals and career
              aspirations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {categories.map((category, index) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard category={category} onSelect={setSelectedCategory} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Search and Filter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={categories}
          />
        </motion.section>

        {/* Courses Grid */}
        <motion.section variants={containerVariants} initial="hidden" animate="visible" className="mb-16">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all" ? "All Courses" : selectedCategory}
              </h2>
              <p className="text-xl text-gray-600">
                {sortedCourses.length} premium course{sortedCourses.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4" />
              <span>Updated weekly with new content</span>
            </div>
          </motion.div>

          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {sortedCourses.map((course, index) => (
                <motion.div key={course.id} variants={itemVariants}>
                  <CourseCard course={course} hoveredCard={hoveredCard} onHover={setHoveredCard} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Load More Button */}
        {sortedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-2 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Load More Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Clock, Users, Star, Award, Play, Heart, ShoppingCart, Globe, BookOpen, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

interface Course {
  id: string
  title: string
  slug: string
  subtitle: string
  image: string
  category: string
  level: string
  totalHours: number
  lessons: number
  students: number
  rating: number
  reviews: number
  completionRate: number
  price: number
  originalPrice: number
  discount: number
  language: string
  instructor: {
    name: string
    avatar: string
    title: string
  }
  skills: string[]
  isBestseller: boolean
  isNew: boolean
  certificateAvailable: boolean
}

interface CourseCardProps {
  course: Course
  hoveredCard: string | null
  onHover: (id: string | null) => void
}

export default function CourseCard({ course, hoveredCard, onHover }: CourseCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      onHoverStart={() => onHover(course.id)}
      onHoverEnd={() => onHover(null)}
      className="group cursor-pointer"
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white h-full">
          <div className="relative overflow-hidden">
            <motion.div animate={{ scale: hoveredCard === course.id ? 1.1 : 1 }} transition={{ duration: 0.6 }}>
              <Image
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                width={400}
                height={250}
                className="w-full h-52 object-cover"
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Enhanced Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {course.isBestseller && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium shadow-lg">
                  <Award className="h-3 w-3 mr-1" />
                  Bestseller
                </Badge>
              )}
              {course.isNew && (
                <Badge className="bg-gradient-to-r from-green-400 to-emerald-600 text-white font-medium shadow-lg">
                  <Zap className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
            </div>

            {/* Discount Badge */}
            {course.discount > 0 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500 text-white font-bold text-sm shadow-lg">-{course.discount}%</Badge>
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-10 w-10 p-0 bg-white/90 hover:bg-white shadow-lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="h-10 w-10 p-0 bg-white/90 hover:bg-white shadow-lg">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Category and Level */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs font-medium">
                {course.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {course.level}
              </Badge>
              {course.certificateAvailable && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  Certificate
                </Badge>
              )}
            </div>

            {/* Title and Description */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {course.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{course.subtitle}</p>

            {/* Instructor */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-9 w-9 ring-2 ring-gray-100">
                <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {course.instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{course.instructor.name}</p>
                <p className="text-xs text-gray-500">{course.instructor.title}</p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.totalHours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()}</span>
              </div>
            </div>

            {/* Rating and Completion */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{course.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({course.reviews})</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium text-green-600">{course.completionRate}%</span> completion
              </div>
            </div>

            {/* Skills Preview */}
            <div className="flex flex-wrap gap-1 mb-6">
              {course.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {course.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{course.skills.length - 3}
                </Badge>
              )}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                {course.originalPrice > course.price && (
                  <span className="text-sm text-gray-500 line-through">${course.originalPrice}</span>
                )}
              </div>
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

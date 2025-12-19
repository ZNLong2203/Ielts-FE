"use client"

import { motion } from "framer-motion"
import { Clock, Users, CheckCircle, Tag, TrendingUp, Package } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { IComboCourse } from "@/interface/course"

interface Course {
  id: string
  title: string
  image: string
  originalPrice: number
  discountPrice: number
  duration: string
  lessons: number
  level: string
  instructor: string
  bandScore: string
}

interface OrderSummaryProps {
  courses: Course[]
  comboDiscount: number
  totalOriginalPrice: number
  totalDiscountPrice: number
  finalPrice: number
  comboCourse?: IComboCourse
  levelRange?: string
  isMultiCombo?: boolean
}

export default function OrderSummary({
  courses,
  comboDiscount,
  totalOriginalPrice,
  totalDiscountPrice,
  finalPrice,
  comboCourse,
  levelRange,
  isMultiCombo,
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    // Custom Vietnamese number formatting
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND'
  }
  return (
    <Card className="shadow-sm border border-gray-200 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isMultiCombo && levelRange
                ? `IELTS Path ${levelRange}`
                : comboCourse
                ? comboCourse.name
                : 'IELTS Learning Path'}
            </h3>
            <p className="text-sm text-blue-600">
              {isMultiCombo
                ? 'Multi-combo course package'
                : comboCourse
                ? 'Combo Course Package'
                : 'Band 3.0 → 7.5+ Complete Journey'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Combo Course Badge */}
        <div className="flex items-center justify-center mb-6">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
            <Tag className="h-3 w-3 mr-1" />
            {comboCourse ? `COMBO PACKAGE - Save ${comboDiscount}%` : `COMPLETE PATH - Save ${comboDiscount}%`}
          </Badge>
        </div>

        {/* Course List with Band Progression */}
        <div className="space-y-4 mb-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-100 hover:shadow-sm transition-all"
            >
              {/* Step indicator */}
              <div className="absolute -left-2 top-4">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>

              <div className="relative ml-4">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  width={80}
                  height={60}
                  className="w-20 h-15 object-cover rounded"
                />
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                    {course.bandScore}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-gray-300">
                    {course.level}
                  </Badge>
                </div>

                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{course.title}</h4>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">by {course.instructor}</span>
                  <div className="text-sm font-semibold text-emerald-600">
                    {formatPrice(course.discountPrice)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({courses.length} courses)</span>
            <span className="text-gray-900">{formatPrice(totalOriginalPrice)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Course Discounts</span>
            <span className="text-emerald-600">-{formatPrice(totalOriginalPrice - totalDiscountPrice)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{comboCourse ? 'Combo Package Discount' : 'Learning Path Discount'} ({comboDiscount}%)</span>
            <span className="text-emerald-600">-{formatPrice(totalDiscountPrice - finalPrice)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              <div className="text-sm text-emerald-600">You save {formatPrice(totalOriginalPrice - finalPrice)}</div>
            </div>
          </div>
        </div>

        {/* Package Benefits */}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <h4 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {comboCourse ? 'Combo Package Includes' : 'Complete Learning Path Includes'}
          </h4>
          <div className="space-y-2 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{comboCourse ? 'All courses in the package' : 'Structured progression from Band 3.0 to 7.5+'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Lifetime Access to All Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Official IELTS Certificate Preparation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Priority Support & Progress Tracking</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

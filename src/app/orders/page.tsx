/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Components
import OrderProgress from "@/components/orders/OrderProgress"
import OrderSummary from "@/components/orders/OrderSummary"
import PersonalInfo from "@/components/orders/PersonalInfo"
import PaymentMethods from "@/components/orders/PaymentMethods"
import CouponSection from "@/components/orders/CouponSection"

// Mock data for IELTS Learning Path
const mockCourses = [
  {
    id: "1",
    title: "IELTS Foundation: From Beginner to Band 4.0",
    image: "/placeholder.svg?height=80&width=120",
    originalPrice: 199,
    discountPrice: 149,
    duration: "8 weeks",
    lessons: 32,
    level: "Beginner",
    instructor: "Dr. Sarah Johnson",
    bandScore: "3.0 → 4.0",
  },
  {
    id: "2",
    title: "IELTS Intermediate: Achieving Band 5.5",
    image: "/placeholder.svg?height=80&width=120",
    originalPrice: 299,
    discountPrice: 249,
    duration: "10 weeks",
    lessons: 40,
    level: "Intermediate",
    instructor: "Emma Wilson",
    bandScore: "4.0 → 5.5",
  },
  {
    id: "3",
    title: "IELTS Advanced: Mastering Band 7.0+",
    image: "/placeholder.svg?height=80&width=120",
    originalPrice: 399,
    discountPrice: 329,
    duration: "12 weeks",
    lessons: 48,
    level: "Advanced",
    instructor: "Michael Chen",
    bandScore: "5.5 → 7.5+",
  },
]

const mockUserInfo = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  country: "United States",
  avatar: "/placeholder.svg?height=80&width=80",
  memberSince: "2024",
  completedCourses: 3,
  currentLevel: "B2",
}

export default function OrderPage() {
  const [currentStep] = useState(2)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  // Calculate prices
  const totalOriginalPrice = mockCourses.reduce((sum, course) => sum + course.originalPrice, 0)
  const totalDiscountPrice = mockCourses.reduce((sum, course) => sum + course.discountPrice, 0)
  const comboDiscount = 15 // Learning path discount
  let finalPrice = Math.round(totalDiscountPrice * (1 - comboDiscount / 100))

  // Apply coupon discount
  if (appliedCoupon) {
    finalPrice = Math.round(finalPrice * (1 - appliedCoupon.discount / 100))
  }

  const handlePaymentSubmit = (method: string, data: any) => {
    console.log("Payment submitted:", method, data)
  }

  const handleCouponApply = (code: string, discount: number) => {
    if (code && discount > 0) {
      setAppliedCoupon({ code, discount })
    } else {
      setAppliedCoupon(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" className="pl-0 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your IELTS Journey</h1>
              <p className="text-gray-600">Secure checkout for your complete learning path</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>25,000+ Students</span>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <OrderProgress currentStep={currentStep} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <OrderSummary
              courses={mockCourses}
              comboDiscount={comboDiscount}
              totalOriginalPrice={totalOriginalPrice}
              totalDiscountPrice={totalDiscountPrice}
              finalPrice={finalPrice}
            />

            <CouponSection onCouponApply={handleCouponApply} appliedCoupon={appliedCoupon} />
          </motion.div>

          {/* Right Column - Personal Info & Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            <PersonalInfo userInfo={mockUserInfo} />
            <PaymentMethods totalAmount={finalPrice} onPaymentSubmit={handlePaymentSubmit} />
          </motion.div>
        </div>

        {/* Footer Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>30-Day Money Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Lifetime Access to All Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Official IELTS Certificate Prep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>24/7 Priority Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

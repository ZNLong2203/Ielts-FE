/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Clock, Users, Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

// Components
import OrderProgress from "@/components/orders/OrderProgress"
import OrderSummary from "@/components/orders/OrderSummary"
import PersonalInfo from "@/components/orders/PersonalInfo"
import PaymentMethods from "@/components/orders/PaymentMethods"
import CouponSection from "@/components/orders/CouponSection"

// Types
import { IComboCourse } from "@/interface/course"
import { createOrder } from "@/api/order"
import { IOrderCreate } from "@/interface/order"

// Mock user data for non-authenticated users
const mockUserInfo = {
  name: "Guest User",
  email: "guest@example.com",
  phone: "+84 (xxx) xxx-xxxx",
  country: "Vietnam",
  avatar: "/placeholder.svg?height=80&width=80",
  memberSince: "2024",
  completedCourses: 0,
  currentLevel: "Beginner",
}

export default function OrderPage() {
  const [currentStep] = useState(2)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [comboCourseData, setComboCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.user)
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated)

  useEffect(() => {
    // Get combo course data from sessionStorage
    const storedData = sessionStorage.getItem('selectedComboCourse')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setComboCourseData(parsedData)
        console.log('Loaded combo course data:', parsedData)
      } catch (error) {
        console.error('Error parsing combo course data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // If no combo course data, show error or redirect
  if (!isLoading && !comboCourseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Course Selected</h1>
          <p className="text-gray-600 mb-6">Please select a combo course to proceed with the order.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Calculate prices from combo course data
  const comboCourse = comboCourseData?.comboCourse as IComboCourse
  const totalOriginalPrice = comboCourse?.original_price || 0
  const totalComboPrice = comboCourse?.combo_price || 0
  const comboDiscount = comboCourse ? Math.round(((totalOriginalPrice - totalComboPrice) / totalOriginalPrice) * 100) : 0
  let finalPrice = totalComboPrice

  // Apply coupon discount
  if (appliedCoupon) {
    finalPrice = Math.round(finalPrice * (1 - appliedCoupon.discount / 100))
  }

  // Convert combo course to display format for OrderSummary component
  const displayCourses = comboCourse?.courses?.map((course) => ({
    id: course.id,
    title: course.title,
    image: "/placeholder.svg?height=80&width=120",
    originalPrice: course.price || 0,
    discountPrice: course.price || 0,
    duration: `${course.estimated_duration || 0}h`,
    lessons: course.estimated_duration || 0,
    level: course.difficulty_level || 'All Levels',
    instructor: "IELTS Expert",
    bandScore: `${comboCourseData?.selectedLevel || 0} → ${comboCourseData?.selectedTarget || 0}`,
  })) || []

  const handlePaymentSubmit = async (method: string) => {
    if (!isAuthenticated) {
      alert("Please log in to complete your purchase")
      return
    }

    if (!comboCourseData?.comboCourseId) {
      alert("No combo course selected")
      return
    }

    setIsProcessingPayment(true)
    
    try {
      const orderData: IOrderCreate = {
        comboId: comboCourseData.comboCourseId,
        couponId: appliedCoupon?.code || undefined,
        paymentMethod: method.toUpperCase(),
        notes: `Combo course purchase: ${comboCourseData.comboCourseName}`
      }

      console.log("Creating order with data:", orderData)
      const response = await createOrder(orderData)
      console.log("Order created successfully:", response)
      
      // Clear session storage
      sessionStorage.removeItem('selectedComboCourse')
      
      // Redirect to success page or payment gateway
      if (response.payment?.payment_url) {
        window.location.href = response.payment.payment_url
      } else {
        alert("Order created successfully! Payment processing...")
        // TODO: Redirect to order success page
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCouponApply = (code: string, discount: number) => {
    if (code && discount > 0) {
      setAppliedCoupon({ code, discount })
    } else {
      setAppliedCoupon(null)
    }
  }

  // Determine user info to display
  const userInfo = isAuthenticated && user ? {
    name: user.full_name || user.email,
    email: user.email,
    phone: user.phone || "+84 (xxx) xxx-xxxx",
    country: user.country || "Vietnam",
    avatar: user.avatar || "/placeholder.svg?height=80&width=80",
    memberSince: user.created_at ? new Date(user.created_at).getFullYear().toString() : "2024",
    completedCourses: 0, // TODO: Get from user profile
    currentLevel: "Beginner", // TODO: Get from user profile
  } : mockUserInfo

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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="h-8 w-8 mr-3 text-blue-600" />
                Complete Your IELTS Journey
              </h1>
              <p className="text-gray-600">
                Secure checkout for your combo course: {comboCourse?.name}
              </p>
              {comboCourseData?.levelRange && (
                <p className="text-sm text-blue-600 font-medium mt-1">
                  Level Range: {comboCourseData.levelRange}
                </p>
              )}
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
              courses={displayCourses}
              comboDiscount={comboDiscount}
              totalOriginalPrice={totalOriginalPrice}
              totalDiscountPrice={totalComboPrice}
              finalPrice={finalPrice}
              comboCourse={comboCourse}
            />

            <CouponSection 
              onApply={handleCouponApply} 
              currentCoupon={appliedCoupon?.code || ""} 
              currentDiscount={appliedCoupon?.discount || 0} 
            />
          </motion.div>

          {/* Right Column - Personal Info & Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            <PersonalInfo userInfo={userInfo} isAuthenticated={isAuthenticated} />
            <PaymentMethods 
              totalAmount={finalPrice} 
              onPaymentSubmit={handlePaymentSubmit}
              isProcessing={isProcessingPayment}
              isAuthenticated={isAuthenticated}
            />
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

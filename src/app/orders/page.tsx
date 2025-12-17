/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Clock, Users, Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import toast from "react-hot-toast"

// Components
import OrderProgress from "@/components/orders/OrderProgress"
import OrderSummary from "@/components/orders/OrderSummary"
import PersonalInfo from "@/components/orders/PersonalInfo"
import PaymentMethods from "@/components/orders/PaymentMethods"
import CouponSection, { AppliedCoupon } from "@/components/orders/CouponSection"

// Types
import { IComboCourse } from "@/interface/course"
import { createOrder } from "@/api/order"
import { IOrderCreate } from "@/interface/order"
import { handleStripeSuccess, handleStripeCancel } from "@/api/payment"

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
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [comboCourseData, setComboCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.user)
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated)

  // Debug: Log authentication state
  useEffect(() => {
    console.log("[OrderPage] Authentication state:", {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      accessToken: localStorage.getItem("accessToken") ? "exists" : "missing",
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    const paymentId = urlParams.get('paymentId')
    const success = urlParams.get('success')
    const cancel = urlParams.get('cancel')

    if (orderId && paymentId) {
      if (success === 'true') {
        // Handle Stripe success callback
        handleStripeSuccess(orderId, paymentId)
          .then(() => {
            console.log('Payment successful!')
            toast.success('Payment completed successfully! Redirecting to success page...')

            setTimeout(() => {
              window.location.href = '/payment/success'
            }, 1500)
          })
          .catch((error) => {
            console.error('Error handling payment success:', error)
            toast.error('Payment verification failed. Please contact support.')

            setTimeout(() => {
              window.location.href = '/payment/failed'
            }, 1500)
          })
      } else if (cancel === 'true') {
        handleStripeCancel(orderId, paymentId)
          .then(() => {
            console.log('Payment cancelled')
            toast.error('Payment was cancelled. You can try again.')

            setTimeout(() => {
              window.location.href = '/payment/failed'
            }, 1500)
          })
          .catch((error) => {
            console.error('Error handling payment cancel:', error)
            toast.error('Error processing payment cancellation.')
            setTimeout(() => {
              window.location.href = '/payment/failed'
            }, 1500)
          })
      }
    }

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
  const comboCourses: IComboCourse[] =
    comboCourseData?.comboCourses ||
    (comboCourseData?.comboCourse ? [comboCourseData.comboCourse] : []);
  const comboCourse = comboCourses[0] as IComboCourse | undefined;

  const totalOriginalPrice =
    typeof comboCourseData?.totalOriginalPrice === "number"
      ? comboCourseData.totalOriginalPrice
      : comboCourses.reduce(
          (sum, c) => sum + (Number(c.original_price) || 0),
          0
        );

  const totalComboPrice =
    typeof comboCourseData?.totalComboPrice === "number"
      ? comboCourseData.totalComboPrice
      : comboCourses.reduce(
          (sum, c) => sum + (Number(c.combo_price) || 0),
          0
        );
  const comboDiscount =
    totalOriginalPrice > 0
      ? Math.round(((totalOriginalPrice - totalComboPrice) / totalOriginalPrice) * 100)
      : 0
  let finalPrice = totalComboPrice
  if (appliedCoupon) {
    finalPrice = Math.max(0, Math.round((totalComboPrice - appliedCoupon.discountAmount) * 100) / 100)
  }

  // Convert combo courses to display format for OrderSummary component
  const displayCourses =
    comboCourses.flatMap((combo) =>
      (combo.courses || []).map((course) => ({
        id: course.id,
        title: course.title,
        image: "/placeholder.svg?height=80&width=120",
        originalPrice: Number(course.price) || 0,
        discountPrice: Number(course.price) || 0,
        duration: `${course.estimated_duration || 0}h`,
        lessons: course.estimated_duration || 0,
        level: course.difficulty_level || "All Levels",
        instructor: "IELTS Expert",
        bandScore: `${comboCourseData?.selectedLevel || 0} → ${
          comboCourseData?.selectedTarget || 0
        }`,
      }))
    ) || []

  const handlePaymentSubmit = async (method: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to complete your purchase")
      return
    }

    if (
      !comboCourseData?.comboCourseId &&
      !Array.isArray(comboCourseData?.comboCourseIds)
    ) {
      toast.error("No combo course selected")
      return
    }

    setIsProcessingPayment(true)
    toast.loading("Processing your payment...", { id: "payment-processing" })
    
    try {
      // Validate combo course data
      const comboIds: string[] =
        comboCourseData.comboCourseIds ||
        (comboCourseData.comboCourseId
          ? [comboCourseData.comboCourseId]
          : []);

      if (!comboIds.length) {
        toast.error("Invalid combo course data. Please try again.", { id: "payment-processing" })
        return
      }

      const orderData: IOrderCreate = {
        comboIds,
        couponId: appliedCoupon?.id || undefined,
        paymentMethod: method.toLowerCase(),
        notes: `Combo course purchase: ${comboCourseData.comboCourseName}`
      }

      console.log("Creating order with data:", orderData)
      console.log("Payment method:", method.toLowerCase())
      console.log("Combo price:", comboCourseData.comboPrice)
      
      const response = await createOrder(orderData)
      console.log("Order created successfully:", response)
      console.log("Payment data:", response.data?.payment)
      
      // Clear session storage
      sessionStorage.removeItem('selectedComboCourse')
      
      // Handle payment response based on method
      if (response.data?.payment) {
        const { payment } = response.data
        
        if (method.toLowerCase() === 'stripe') {
          if (payment.checkoutUrl) {
            console.log("Redirecting to Stripe checkout:", payment.checkoutUrl)
            toast.success("Redirecting to Stripe checkout...", { id: "payment-processing" })
            setTimeout(() => {
              window.location.href = payment.checkoutUrl
            }, 1000)
          } else {
            toast.error("Stripe checkout URL not available. Please try again.", { id: "payment-processing" })
          }
        } else if (method.toLowerCase() === 'zalopay') {
          // ZaloPay: Show QR code or redirect to payment URL
          if (payment.checkoutUrl) {
            console.log("Redirecting to ZaloPay:", payment.checkoutUrl)
            toast.success("Redirecting to ZaloPay...", { id: "payment-processing" })
            setTimeout(() => {
              window.location.href = payment.checkoutUrl
            }, 1000)
          } else {
            toast.error("ZaloPay payment URL not available. Please try again.", { id: "payment-processing" })
          }
        } else {
          toast.error("Unsupported payment method. Please try again.", { id: "payment-processing" })
        }
      } else {
        toast.error("Payment information not available. Please try again.", { id: "payment-processing" })
      }
    } catch (error: any) {
      console.error("Error creating order:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      
      let errorMessage = error.response?.data?.message || error.message || "Failed to create order. Please try again."
      
      if (method.toLowerCase() === 'zalopay') {
        if (errorMessage.includes('ZaloPay create order failed')) {
          errorMessage = "ZaloPay payment service is temporarily unavailable. Please try Stripe payment instead."
        } else if (errorMessage.includes('Dữ liệu yêu cầu không hợp lệ')) {
          errorMessage = "Invalid payment data for ZaloPay. Please try Stripe payment instead."
        }
        
        console.log("ZaloPay error detected. Consider using Stripe as alternative.")
      }
      
      toast.error(errorMessage, { id: "payment-processing" })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCouponApply = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon)
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
            <Link href="/">
              <Button variant="ghost" className="pl-0 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="h-8 w-8 mr-3 text-blue-600" />
                Complete Your IELTS Journey
              </h1>
              <p className="text-gray-600">
                Secure checkout for your combo package
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
              levelRange={comboCourseData?.levelRange}
              isMultiCombo={comboCourses.length > 1}
            />

            <CouponSection 
              comboIds={
                comboCourseData?.comboCourseIds ||
                (comboCourseData?.comboCourseId
                  ? [comboCourseData.comboCourseId]
                  : [])
              }
              comboPrice={totalComboPrice}
              onApply={handleCouponApply} 
              appliedCoupon={appliedCoupon}
              isAuthenticated={isAuthenticated}
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
                <span>Official IELTS Certificate</span>
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

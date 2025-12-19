"use client"

import { motion } from "framer-motion"
import { CheckCircle, Play, BookOpen, Award, ArrowRight, Home, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getOrder } from "@/api/order"
import { IOrder } from "@/interface/order"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

export default function PaymentSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [order, setOrder] = useState<IOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => state.user.user)

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? Number(price) : price
    return `${numPrice.toLocaleString('vi-VN')} ₫`
  }

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId) {
      getOrder(orderId)
        .then((orderData) => {
          setOrder(orderData)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching order:', error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your order. Please contact support.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const finalAmount = Number(order.final_amount) || 0
  const courses = order.order_items?.filter(item => item.course_title) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-emerald-200 rounded-full opacity-20"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-20"
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-teal-200 rounded-full opacity-20"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "easeOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-6 shadow-2xl"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Payment Successful! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Congratulations! Your IELTS learning journey starts now. 
            You now have lifetime access to all course materials.
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Order Confirmation</h3>
                  <p className="text-gray-600">Order ID: {order.order_code}</p>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-lg">
                  {formatPrice(finalAmount)}
                </Badge>
              </div>

              {/* Course List */}
              {courses.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Your IELTS Learning Path
                  </h4>
                  {courses.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{item.course_title || 'Course'}</div>
                        {item.combo_name && (
                          <div className="text-sm text-gray-600">Combo: {item.combo_name}</div>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        ✓ Enrolled
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Email Confirmation */}
              {user?.email && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Confirmation Email Sent</div>
                      <div className="text-sm text-blue-700">
                        Receipt and course access details sent to {user.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <Link href="/student/dashboard/my-courses" className="w-full">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
              <Play className="h-5 w-5 mr-2" />
              Start Learning Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50 flex items-center justify-center">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-purple-600" />
                What&apos;s Next?
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access Your Courses</h4>
                  <p className="text-gray-600 text-sm">
                    Start with the Foundation course and progress through your learning path
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Watch Video Lessons</h4>
                  <p className="text-gray-600 text-sm">
                    High-quality video content with expert instructors and practice materials
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
                  <p className="text-gray-600 text-sm">
                    Monitor your improvement and get ready for your IELTS exam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

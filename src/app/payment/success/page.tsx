"use client"

import { motion } from "framer-motion"
import { CheckCircle, Download, Play, BookOpen, Award, ArrowRight, Home, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function PaymentSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    // Auto-hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const orderDetails = {
    orderId: "ORD-2024-001234",
    amount: 627,
    courses: [
      { title: "IELTS Foundation: From Beginner to Band 4.0", level: "3.0 → 4.0" },
      { title: "IELTS Intermediate: Achieving Band 5.5", level: "4.0 → 5.5" },
      { title: "IELTS Advanced: Mastering Band 7.0+", level: "5.5 → 7.5+" },
    ],
    email: "john.doe@example.com"
  }

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
                  <p className="text-gray-600">Order ID: {orderDetails.orderId}</p>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-lg">
                  ${orderDetails.amount}
                </Badge>
              </div>

              {/* Course List */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Your IELTS Learning Path
                </h4>
                {orderDetails.courses.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-600">Band Score Progress: {course.level}</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      ✓ Enrolled
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {/* Email Confirmation */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Confirmation Email Sent</div>
                    <div className="text-sm text-blue-700">
                      Receipt and course access details sent to {orderDetails.email}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            <Play className="h-5 w-5 mr-2" />
            Start Learning Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button variant="outline" className="py-6 text-lg font-semibold border-2 hover:bg-gray-50">
            <Download className="h-5 w-5 mr-2" />
            Download Receipt
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50">
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

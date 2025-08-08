"use client"

import { motion } from "framer-motion"
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, CreditCard, HelpCircle, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"

export default function PaymentFailedPage() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryPayment = () => {
    setIsRetrying(true)
    setTimeout(() => {
      window.location.href = "/order"
      setIsRetrying(false)
    }, 2000)
  }

  const failureReasons = [
    {
      icon: CreditCard,
      title: "Insufficient Funds",
      description: "Your card may not have enough balance for this transaction",
      color: "red"
    },
    {
      icon: AlertTriangle,
      title: "Card Declined",
      description: "Your bank may have declined the transaction for security reasons",
      color: "orange"
    },
    {
      icon: XCircle,
      title: "Expired Card",
      description: "Please check if your card has expired or update your payment method",
      color: "gray"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-red-200 rounded-full opacity-10"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-orange-200 rounded-full opacity-10"
          animate={{ scale: [1.1, 1, 1.1], rotate: [180, 90, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-yellow-200 rounded-full opacity-10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, -180] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Failed Header */}
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
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-2xl"
          >
            <XCircle className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Payment Failed 😔
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Don&apos;t worry! Payment issues happen sometimes.
            Let&apos;s get you back on track to start your IELTS learning journey.
          </motion.p>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Transaction Details</h3>
                  <p className="text-gray-600">Transaction ID: TXN-2024-FAILED-001234</p>
                </div>
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 text-lg">
                  Failed
                </Badge>
              </div>

              {/* Error Message */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Payment Processing Error</div>
                    <div className="text-sm text-red-700">
                      Your payment could not be processed at this time. Please try again or use a different payment method.
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Your Order</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IELTS Complete Learning Path</span>
                    <span className="font-medium">$627</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">3 Courses (Foundation → Advanced)</span>
                    <span className="text-gray-500">Band 3.0 → 7.5+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Common Issues */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-8">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-600" />
                Common Payment Issues
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {failureReasons.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 bg-${reason.color}-50 rounded-xl border border-${reason.color}-200`}
                  >
                    <div className={`w-12 h-12 bg-${reason.color}-100 rounded-full flex items-center justify-center mb-4`}>
                      <reason.icon className={`h-6 w-6 text-${reason.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{reason.title}</h4>
                    <p className="text-gray-600 text-sm">{reason.description}</p>
                  </motion.div>
                ))}
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
          <Button 
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isRetrying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Redirecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </>
            )}
          </Button>
          
          <Link href="/order">
            <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Checkout
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you complete your purchase and start learning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Contact Support
                </Button>
                <Button variant="outline">
                  Live Chat
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                Available 24/7 • Average response time: 2 minutes
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

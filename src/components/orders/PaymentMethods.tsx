/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, QrCode, Shield, Lock, ExternalLink, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface PaymentMethodsProps {
  totalAmount: number
  onPaymentSubmit: (method: string) => void
  isProcessing?: boolean
  isAuthenticated?: boolean
}

export default function PaymentMethods({ totalAmount, onPaymentSubmit, isProcessing: externalProcessing, isAuthenticated }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState("STRIPE")
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentMethods = [
    {
      id: "STRIPE",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      color: "blue",
      popular: true,
      features: ["Instant processing", "Secure encryption", "Worldwide accepted"],
      redirectUrl: "https://checkout.stripe.com/pay/...",
    },
    {
      id: "ZALOPAY",
      name: "ZaloPay",
      description: "Mobile banking & e-wallets",
      icon: QrCode,
      color: "emerald",
      popular: false,
      features: ["Mobile friendly", "No card needed", "Bank direct transfer"],
      redirectUrl: "https://payment.zalopay.com/...",
    },
  ]

  const handlePaymentRedirect = (method: any) => {
    if (!isAuthenticated) {
      alert("Please log in to complete your purchase")
      return
    }
    
    setIsProcessing(true)
    onPaymentSubmit(method.id)
  }

  const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedMethod)

  return (
    <Card className="shadow-sm border border-gray-200 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Lock className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
              <p className="text-sm text-emerald-600">Choose your preferred payment option</p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
            <Shield className="h-3 w-3 mr-1" />
            SSL Secured
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Payment Method Selection */}
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="mb-8">
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.01 }}
                className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedMethod === method.id
                    ? `border-${method.color}-500 bg-${method.color}-50/50 shadow-lg shadow-${method.color}-100`
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {method.popular && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-${method.color}-100 rounded-xl`}>
                          <method.icon className={`h-6 w-6 text-${method.color}-600`} />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {method.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`text-xs px-3 py-1 rounded-full bg-${method.color}-100 text-${method.color}-700`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Label>
                </div>
              </motion.div>
            ))}
          </div>
        </RadioGroup>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-gray-900">{totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            You&apos;ll be redirected to {selectedPaymentMethod?.name} to complete payment
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={() => handlePaymentRedirect(selectedPaymentMethod)}
          disabled={isProcessing || externalProcessing || !isAuthenticated}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {(isProcessing || externalProcessing) ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing payment...
              </motion.div>
            ) : !isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <Lock className="h-5 w-5" />
                Please log in to continue
              </motion.div>
            ) : (
              <motion.div
                key="pay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <Lock className="h-5 w-5" />
                Pay {totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND with {selectedPaymentMethod?.name}
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Security Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">🔒 Secure Payment Process</div>
            <div>
              Your payment is processed through industry-leading security protocols. 
              We never store your payment information.
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Shield className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">256-bit SSL</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Lock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">PCI Compliant</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <ExternalLink className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">Verified Secure</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

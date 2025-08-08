"use client"

import { motion } from "framer-motion"
import { CheckCircle, CreditCard, ShoppingCart, Award } from 'lucide-react'

interface OrderProgressProps {
  currentStep: number
}

export default function OrderProgress({ currentStep }: OrderProgressProps) {
  const steps = [
    { 
      id: 1, 
      title: "Review Order", 
      subtitle: "Confirm your selection",
      icon: ShoppingCart, 
      color: "blue" 
    },
    { 
      id: 2, 
      title: "Payment", 
      subtitle: "Secure checkout",
      icon: CreditCard, 
      color: "emerald" 
    },
    { 
      id: 3, 
      title: "Complete", 
      subtitle: "Start learning",
      icon: Award, 
      color: "purple" 
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: currentStep >= step.id ? 1.1 : 1,
                  rotate: currentStep > step.id ? 360 : 0
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                  currentStep > step.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : currentStep === step.id
                      ? `bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 border-${step.color}-500 text-white shadow-lg shadow-${step.color}-200`
                      : "bg-white border-gray-300 text-gray-400 shadow-sm"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <step.icon className="h-8 w-8" />
                )}
                
                {/* Pulse animation for current step */}
                {currentStep === step.id && (
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-${step.color}-400 opacity-30`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              <div className="mt-4 text-center">
                <div className={`text-base font-semibold transition-colors ${
                  currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                }`}>
                  {step.title}
                </div>
                <div className={`text-sm mt-1 transition-colors ${
                  currentStep >= step.id ? "text-gray-600" : "text-gray-400"
                }`}>
                  {step.subtitle}
                </div>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-8">
                <motion.div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    currentStep > step.id 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm" 
                      : "bg-gray-200"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

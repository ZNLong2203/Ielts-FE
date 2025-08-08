"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tag, Check, X, Percent } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CouponSectionProps {
  onCouponApply: (coupon: string, discount: number) => void
  appliedCoupon?: { code: string; discount: number } | null
}

export default function CouponSection({ onCouponApply, appliedCoupon }: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState("")

  // Mock coupon validation
  const validCoupons = {
    IELTS20: 20,
    STUDENT15: 15,
    FIRST10: 10,
    WELCOME25: 25,
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplying(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      const upperCode = couponCode.toUpperCase()
      if (validCoupons[upperCode as keyof typeof validCoupons]) {
        onCouponApply(upperCode, validCoupons[upperCode as keyof typeof validCoupons])
        setCouponCode("")
      } else {
        setError("Invalid coupon code")
      }
      setIsApplying(false)
    }, 1000)
  }

  const handleRemoveCoupon = () => {
    onCouponApply("", 0)
  }

  return (
    <Card className="shadow-sm border border-gray-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Tag className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Discount Code</h3>
            <p className="text-sm text-gray-600">Have a coupon? Apply it here</p>
          </div>
        </div>

        {appliedCoupon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 bg-emerald-500 rounded-full">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="font-medium text-emerald-800">Coupon Applied!</div>
                <div className="text-sm text-emerald-700">
                  Code: <span className="font-mono font-semibold">{appliedCoupon.code}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-white">
                <Percent className="h-3 w-3 mr-1" />
                {appliedCoupon.discount}% OFF
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white"
                onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                {isApplying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            {/* Available Coupons Hint */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Available Discounts:</div>
                <div className="text-xs text-blue-700">Try: IELTS20, STUDENT15, FIRST10, WELCOME25</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

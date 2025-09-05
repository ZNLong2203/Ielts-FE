"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, CheckCircle, X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponSectionProps {
  onApply: (code: string, discount: number) => void;
  currentCoupon: string;
  currentDiscount: number;
}

export default function CouponSection({ onApply, currentCoupon, currentDiscount }: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock coupon validation - in real app, this would be an API call
  const validateCoupon = async (code: string) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const validCoupons = {
      "WELCOME10": { discount: 10, message: "Welcome discount applied!" },
      "SAVE20": { discount: 20, message: "20% off your order!" },
      "COMBO15": { discount: 15, message: "Combo course discount applied!" },
      "NEWUSER": { discount: 25, message: "New user special discount!" }
    };

    const coupon = validCoupons[code.toUpperCase() as keyof typeof validCoupons];
    
    if (coupon) {
      setSuccess(coupon.message);
      onApply(code.toUpperCase(), coupon.discount);
    } else {
      setError("Invalid coupon code. Please try again.");
    }

    setIsLoading(false);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim());
    }
  };

  const handleRemoveCoupon = () => {
    onApply("", 0);
    setCouponCode("");
    setError("");
    setSuccess("");
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 rounded-lg p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
          <Gift className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Apply Coupon</h3>
          <p className="text-blue-200 text-sm">Enter your discount code</p>
        </div>
      </div>

      {/* Current Coupon Applied */}
      {currentCoupon && currentDiscount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-green-300 font-medium">{currentCoupon}</div>
                <div className="text-green-400 text-sm">-{currentDiscount}% discount applied</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-green-300 hover:text-green-100 hover:bg-green-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Coupon Input Form */}
      {!currentCoupon && (
        <form onSubmit={handleApplyCoupon} className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!couponCode.trim() || isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </div>
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-sm flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </motion.div>
          )}
        </form>
      )}

      {/* Available Coupons */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-blue-200 mb-3">Available Coupons:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { code: "WELCOME10", discount: "10%", description: "Welcome discount" },
            { code: "SAVE20", discount: "20%", description: "General discount" },
            { code: "COMBO15", discount: "15%", description: "Combo course special" },
            { code: "NEWUSER", discount: "25%", description: "New user special" }
          ].map((coupon) => (
            <motion.div
              key={coupon.code}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all duration-200"
              onClick={() => setCouponCode(coupon.code)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{coupon.code}</div>
                  <div className="text-blue-300 text-xs">{coupon.description}</div>
                </div>
                <div className="text-green-400 font-bold">{coupon.discount}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="mt-4 text-xs text-blue-300">
        <p>• Coupons can only be used once per order</p>
        <p>• Cannot be combined with other promotions</p>
        <p>• Valid for new and existing customers</p>
      </div>
    </motion.div>
  );
}

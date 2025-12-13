"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, CheckCircle, X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAvailableCoupons, validateCouponCode } from "@/api/coupon";
import { ICoupon } from "@/interface/coupon";

export interface AppliedCoupon {
  id: string;
  code: string;
  discountAmount: number;
  discountType: string;
  discountValue: number;
  name?: string;
}

interface CouponSectionProps {
  comboId?: string;
  comboPrice: number;
  onApply: (coupon: AppliedCoupon | null) => void;
  appliedCoupon: AppliedCoupon | null;
  isAuthenticated?: boolean;
}

export default function CouponSection({
  comboId,
  comboPrice,
  onApply,
  appliedCoupon,
  isAuthenticated = false,
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<ICoupon[]>([]);
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? "");
    if (!appliedCoupon) {
      setSuccess("");
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (!isAuthenticated || !comboId) {
      setAvailableCoupons([]);
      setIsFetchingCoupons(false);
      return;
    }

    let mounted = true;
    setIsFetchingCoupons(true);

    console.log("[CouponSection] Fetching available coupons for comboId:", comboId);

    getAvailableCoupons([comboId])
      .then((data) => {
        if (!mounted) return;
        console.log("[CouponSection] Received available coupons:", data);
        setAvailableCoupons(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          console.log("[CouponSection] Authentication required to view available coupons");
        } else {
          console.error("[CouponSection] Failed to fetch available coupons", err);
          console.error("[CouponSection] Error details:", {
            status: err?.response?.status,
            data: err?.response?.data,
            message: err?.message,
          });
        }
        setAvailableCoupons([]);
      })
      .finally(() => {
        if (mounted) {
          setIsFetchingCoupons(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [comboId, isAuthenticated]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!isAuthenticated) {
      setError("Please log in to apply coupons.");
      return;
    }
    if (!comboId) {
      setError("No combo selected. Please pick a combo package first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("[CouponSection] Validating coupon:", {
        code: couponCode.trim().toUpperCase(),
        comboId,
        comboPrice,
      });

      const validation = await validateCouponCode({
        code: couponCode.trim().toUpperCase(),
        combo_ids: [comboId],
        total_amount: comboPrice,
      });

      console.log("[CouponSection] Validation result:", validation);

      if (!validation?.isValid || !validation?.coupon) {
        setError(
          validation?.errorMessage || "Invalid coupon code. Please try again."
        );
        onApply(null);
        return;
      }

      const discountAmount = validation.discount_amount || 0;
      const coupon = validation.coupon;

      onApply({
        id: coupon.id,
        code: coupon.code,
        discountAmount,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        name: coupon.name,
      });

      setSuccess(
        `Coupon applied! You saved ${formatPrice(discountAmount)}.`
      );
      setError("");
    } catch (err: unknown) {
      // Handle authentication errors
      const axiosError = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (axiosError?.response?.status === 403 || axiosError?.response?.status === 401) {
        setError("Please log in to apply coupons.");
      } else {
        const message =
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          "Failed to validate coupon. Please try again.";
        setError(message);
      }
      onApply(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApply(null);
    setCouponCode("");
    setError("");
    setSuccess("");
  };

  const formatPrice = (price: number) => {
    if (!price) return "0 VND";
    return `${Number(price).toLocaleString("vi-VN")} VND`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
          <Gift className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Apply Coupon</h3>
          <p className="text-gray-600 text-sm">
            Enter your discount code or pick one from the list below
          </p>
        </div>
      </div>

      {/* Current Coupon Applied */}
      {appliedCoupon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-green-300 font-medium">
                  {appliedCoupon.code}
                </div>
                <div className="text-green-400 text-sm">
                  Saved {formatPrice(appliedCoupon.discountAmount)}
                </div>
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
      {!appliedCoupon && (
        <form onSubmit={handleApplyCoupon} className="space-y-4">
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Please log in to view and apply coupons.
              </p>
            </div>
          )}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={isLoading || !isAuthenticated}
              />
            </div>
            <Button
              type="submit"
              disabled={!couponCode.trim() || isLoading || !comboId || !isAuthenticated}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {isAuthenticated && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Available Coupons:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableCoupons.length > 0 ? (
              availableCoupons.map((coupon) => (
                <motion.div
                  key={coupon.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                  onClick={() => {
                    setCouponCode(coupon.code);
                    setError("");
                    setSuccess("");
                  }}
                >
                  <div className="text-gray-900 font-semibold text-sm mb-1">
                    {coupon.code}
                  </div>
                  <div className="text-green-600 font-bold text-sm mb-1">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : formatPrice(Number(coupon.discount_value))}
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {coupon.description}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-sm text-gray-500">
                {isFetchingCoupons
                  ? "Loading available coupons..."
                  : "No active coupons for this combo right now."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Coupons can only be used once per order</p>
        <p>• Cannot be combined with other promotions</p>
        <p>• Valid coupons are pulled directly from your account</p>
      </div>
    </motion.div>
  );
}

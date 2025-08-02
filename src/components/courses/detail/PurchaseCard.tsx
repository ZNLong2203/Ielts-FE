/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ShoppingCart, CreditCard, Shield, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Feature {
  icon: any
  title: string
  description: string
}

interface PurchaseCardProps {
  price: number
  originalPrice: number
  discount: number
  features: Feature[]
}

export default function PurchaseCard({ price, originalPrice, discount, features }: PurchaseCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <Card className="border-2 border-blue-200 shadow-xl">
      <CardContent className="p-6">
        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl font-bold text-blue-600">${price}</span>
            {originalPrice > price && <span className="text-lg text-gray-500 line-through">${originalPrice}</span>}
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600 font-medium">
              Save ${originalPrice - price} ({discount}% off)
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-6">
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Enroll Now
          </Button>
          <Button size="lg" variant="outline" className="w-full py-6 bg-transparent">
            <CreditCard className="h-5 w-5 mr-2" />
            Buy Now - Pay Later
          </Button>
        </div>

        {/* Guarantee */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-500" />
            30-day money-back guarantee
          </div>
        </div>

        {/* Course Includes */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">This course includes:</h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <feature.icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{feature.title}</p>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Wishlist */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button variant="ghost" className="w-full" onClick={() => setIsWishlisted(!isWishlisted)}>
            <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
          <Button variant="ghost" className="w-full mt-2">
            <Share2 className="h-4 w-4 mr-2" />
            Share Course
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { motion } from "framer-motion"
import { BookOpen, CheckCircle, ChevronRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  gradient: string
  count: number
  popular: boolean
  completionRate: number
}

interface CategoryCardProps {
  category: Category
  onSelect: (categoryName: string) => void
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={() => onSelect(category.name)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm relative h-full">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Popular Badge */}
        {category.popular && (
          <div className="absolute top-6 right-6 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium shadow-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}

        <CardContent className="p-8 text-center relative z-10 h-full flex flex-col">
          {/* Icon */}
          <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{category.description}</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">{category.count} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{category.completionRate}% success</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="outline"
            className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 bg-transparent border-2"
          >
            Explore Courses
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

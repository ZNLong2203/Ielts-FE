"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { IComboCourse } from "@/interface/course";

interface ComboCourseCardProps {
  comboCourse: IComboCourse;
  selectedLevel: number;
  selectedTarget: number;
}

export default function ComboCourseCard({ 
  comboCourse, 
  selectedLevel, 
  selectedTarget 
}: ComboCourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const calculateSavings = () => {
    return comboCourse.original_price - comboCourse.combo_price;
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 4.0) return "text-green-400";
    if (level <= 6.0) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Header with Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-300">
              Combo Course
            </span>
          </div>
          <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
            {comboCourse.discount_percentage}% OFF
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
          {comboCourse.name}
        </h3>

        {/* Description */}
        <p className="text-blue-100 text-sm mb-4 line-clamp-2">
          {comboCourse.description}
        </p>

        {/* Course List */}
        {comboCourse.courses && comboCourse.courses.length > 0 && (
          <div className="mb-4 flex-grow">
            <h4 className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Included Courses ({comboCourse.courses.length})
            </h4>
            <div className="space-y-2">
              {comboCourse.courses.slice(0, 3).map((course, index) => (
                <div key={course.id} className="flex items-center text-sm">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-blue-100 truncate">{course.title}</span>
                </div>
              ))}
              {comboCourse.courses.length > 3 && (
                <div className="text-xs text-blue-300">
                  +{comboCourse.courses.length - 3} more courses
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-300" />
            </div>
            <div className="text-xs text-blue-200">
              {comboCourse.total_duration || 0}h
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="h-4 w-4 text-blue-300" />
            </div>
            <div className="text-xs text-blue-200">
              {comboCourse.total_lessons || 0} lessons
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-300" />
            </div>
            <div className="text-xs text-blue-200">
              {comboCourse.enrollment_count || 0}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {formatPrice(comboCourse.combo_price)}
              </div>
              <div className="text-sm text-blue-300 line-through">
                {formatPrice(comboCourse.original_price)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-400 font-medium">
                Save {formatPrice(calculateSavings())}
              </div>
              <div className="text-xs text-blue-300">
                {comboCourse.discount_percentage}% discount
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {comboCourse.tags && comboCourse.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {comboCourse.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-300 hover:to-yellow-400 font-medium py-3 rounded-xl transition-all duration-200 group-hover:shadow-lg mt-auto"
          asChild
        >
          <Link href={`/combo-courses/${comboCourse.id}`}>
            <span className="flex items-center justify-center">
              View Combo Details
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </Button>

        {/* Hover Effect */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl pointer-events-none"
          />
        )}
      </div>
    </motion.div>
  );
}

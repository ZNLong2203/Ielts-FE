"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
  X,
  ShoppingCart
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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handlePurchase = async () => {
    console.log('Starting purchase process...', { selectedLevel, selectedTarget });
    
    try {
      // Clear sessionStorage first to prevent old data interference
      console.log('Clearing sessionStorage...');
      sessionStorage.removeItem('selectedComboCourse');
      
      // Clear previous Redux data first and wait for it to complete
      console.log('Clearing previous Redux data...');
      dispatch(clearComboData());
      
      // Wait a bit to ensure clear is processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Set level range in Redux
      console.log('Setting level range in Redux...');
      dispatch(setLevelRange({ currentLevel: selectedLevel, targetLevel: selectedTarget }));
      
      // Wait a bit to ensure level range is set
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Fetch combo courses data
      console.log('Fetching combo courses from API...');
      const result = await dispatch(fetchComboCoursesByLevel({ currentLevel: selectedLevel, targetLevel: selectedTarget }));
      
      console.log('API result:', result);
      
      if (result.type.endsWith('/rejected')) {
        console.error('API call was rejected:', result.payload);
        throw new Error('Failed to fetch combo courses');
      }
      
      // Wait a bit more to ensure Redux state is fully updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to orders page
      console.log('Navigating to orders page...');
      router.push('/orders');
    } catch (error) {
      console.error('Error handling purchase:', error);
      // Fallback to sessionStorage if Redux fails
      console.log('Falling back to sessionStorage...');
      const orderData = {
        comboCourseId: comboCourse.id,
        comboCourseName: comboCourse.name,
        comboPrice: comboCourse.combo_price,
        originalPrice: comboCourse.original_price,
        courseIds: comboCourse.course_ids,
        levelRange: `${selectedLevel} - ${selectedTarget}`,
        selectedLevel: Number(selectedLevel),
        selectedTarget: Number(selectedTarget),
        currentLevel: Number(selectedLevel),
        targetLevel: Number(selectedTarget)
      };
      
      sessionStorage.setItem('selectedComboCourse', JSON.stringify(orderData));
      console.log('SessionStorage data set:', orderData);
      
      // Wait a bit before navigating
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/orders');
    }
  };

  return (
    <>
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

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <Button
              className="flex-1 bg-blue-600/30 text-blue-200 hover:bg-blue-600/50 font-medium py-3 rounded-xl transition-all duration-200"
              onClick={() => setShowModal(true)}
            >
              <span className="flex items-center justify-center">
                View Details
                <BookOpen className="ml-2 h-4 w-4" />
              </span>
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-300 hover:to-yellow-400 font-medium py-3 rounded-xl transition-all duration-200"
              onClick={handlePurchase}
            >
              <span className="flex items-center justify-center">
                Purchase
                <ShoppingCart className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>

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

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {comboCourse.name}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Level Range: {selectedLevel} - {selectedTarget}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{comboCourse.description}</p>
              </div>

              {/* Included Courses */}
              {comboCourse.courses && comboCourse.courses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Included Courses ({comboCourse.courses.length})
                  </h3>
                  <div className="grid gap-4">
                    {comboCourse.courses.map((course, index) => (
                      <div key={course.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                Course {index + 1}
                              </span>
                              <span className="text-sm text-gray-500">• {course.difficulty_level || 'All Levels'}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {course.estimated_duration || 0}h
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {course.estimated_duration || 0} lessons
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                0 students
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(course.price || 0)}
                            </div>
                            <div className="text-sm text-gray-500">Individual price</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Summary</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {comboCourse.total_duration || 0}h
                    </div>
                    <div className="text-sm text-gray-600">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {comboCourse.total_lessons || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {comboCourse.enrollment_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Enrolled Students</div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Original Price (Individual):</span>
                    <span className="text-gray-500 line-through text-lg">
                      {formatPrice(comboCourse.original_price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium text-lg">Combo Package Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(comboCourse.combo_price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-green-200">
                    <span className="text-green-700 font-semibold">You Save:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(calculateSavings())} ({comboCourse.discount_percentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {comboCourse.tags && comboCourse.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {comboCourse.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-600" />
                  Package Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Lifetime access to all courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Structured learning path</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Certificate upon completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 rounded-b-2xl p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  onClick={handlePurchase}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase Complete Package
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

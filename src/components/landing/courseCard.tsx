import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CheckCircle, Star, Clock, Users, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: number;
  category_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  price: number;
  discountPrice?: number;
  features?: string[];
}

interface CourseCardProps {
  selectedLevel: number;
  selectedTarget: number;
  courseData: Course[];
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  }
};

const CourseCard: React.FC<CourseCardProps> = ({
  selectedLevel,
  selectedTarget,
  courseData,
}) => {
  const filteredCourses = courseData.filter((course) => {
    const [minLevel, maxLevel] = course.difficulty_level.split(" - ").map(Number);
    return minLevel === selectedLevel && maxLevel === selectedTarget;
  });

  // Function to format numbers with commas as thousand separators
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice: number, discountPrice: number) => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {filteredCourses.map((course, index) => {
        const discountPercentage = course.discountPrice ? 
          getDiscountPercentage(course.price, course.discountPrice) : 0;
          
        return (
          <motion.div
            key={`course-${course.id}-${index}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="h-full"
          >
            <Card className="bg-white text-blue-900 rounded-2xl overflow-hidden shadow-lg h-full border-0 flex flex-col">
              {/* Course Header with Gradient Background */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white relative">
                {course.discountPrice && (
                  <div className="absolute -right-1 -top-1 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-2 rounded-lg shadow-md transform rotate-6 z-10">
                    Save {discountPercentage}%
                  </div>
                )}
                
                <div className="flex items-center mb-3">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium bg-white/20 rounded-full px-3 py-0.5">
                    IELTS {course.difficulty_level} Course
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                <p className="text-blue-100 text-sm mb-4">{course.description}</p>
                
              </div>
              
              {/* Course Content */}
              <div className="p-6 flex-grow">
                {/* Price section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-3xl font-bold text-blue-900">
                      {course.discountPrice ? formatCurrency(course.discountPrice) : formatCurrency(course.price)}
                      <span className="text-gray-400 text-sm ml-1">VND</span>
                    </p>
                    
                    {course.discountPrice && (
                      <p className="text-gray-500 text-sm line-through">
                        {formatCurrency(course.price)} VND
                      </p>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">*Price includes all learning materials</p>
                </div>
                
                {/* Benefits section */}
                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-blue-900 border-b border-gray-100 pb-2">WHAT YOU'LL GET</h4>
                  
                  {(course.features || [
                    "Own a specialized study curriculum",
                    "Practice Listening & Reading tests with detailed explanations",
                    "Mock tests to prepare for the real exam",
                    "One-on-one tutoring sessions"
                  ]).map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="bg-blue-500 p-1 rounded-full mr-2 mt-0.5 flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="space-y-3 mt-auto">
                  <Button className="w-full bg-blue-500 text-white hover:bg-blue-600 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                    Register Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CourseCard;
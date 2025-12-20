"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICourse } from "@/interface/course";
import {
  BookOpen,
  Star,
  Award,
  Calendar,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TeacherCourseListProps {
  courses: ICourse[];
}

const TeacherCourseList = ({ courses }: TeacherCourseListProps) => {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(parseFloat(price));
  };

  const getDifficultyColor = (level: string) => {
    switch ((level ?? "").toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (courses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-sm text-gray-600">
              You haven't been assigned to any courses yet.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300"
        >
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="h-16 w-16 text-blue-300" />
              </div>
            )}
            {course.is_featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-yellow-500 text-white border-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className={getDifficultyColor(course.difficulty_level)}
              >
                <Award className="h-3 w-3 mr-1" />
                {course.difficulty_level}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Title */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Price & Date */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                {course.discount_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(course.discount_price)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {new Date(course.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/teacher/dashboard/course/${course.id}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                <BookOpen className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherCourseList;

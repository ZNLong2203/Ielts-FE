"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICourse } from "@/interface/course";
import {
  BookOpen,
  Award,
  Calendar,
  Tag,
  Eye,
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
              You haven&apos;t been assigned to any courses yet.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Course Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-24 relative rounded-md overflow-hidden bg-gray-100">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {course.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {course.description || "No description"}
                      </p>
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {course.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-600 border-gray-200 px-1.5 py-0"
                            >
                              <Tag className="h-2.5 w-2.5 mr-0.5" />
                              {tag}
                            </Badge>
                          ))}
                          {course.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{course.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Skill Focus */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {course.skill_focus ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                      {course.skill_focus}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>

                {/* Difficulty Level */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {course.difficulty_level ? (
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(course.difficulty_level)}
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {course.difficulty_level.charAt(0).toUpperCase() +
                        course.difficulty_level.slice(1)}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {course.discount_price ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-green-600">
                        {formatPrice(course.discount_price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-blue-600">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(course.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link href={`/teacher/dashboard/course/${course.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TeacherCourseList;

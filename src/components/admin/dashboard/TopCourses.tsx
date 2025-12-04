import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopCourse } from "@/interface/adminDashboard";
import { BookOpen, DollarSign, Star, Users } from "lucide-react";
import Image from "next/image";

interface TopCoursesProps {
  courses: TopCourse[];
}

export default function TopCourses({ courses }: TopCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span>Top Performing Courses</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="flex items-center space-x-4 p-4 rounded-lg border border-dashed border-gray-200 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-shrink-0 relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : index === 2
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    #{index + 1}
                  </Badge>
                </div>
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                    {course.title}
                  </h3>
                </div>

                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollments.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>${course.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No courses found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

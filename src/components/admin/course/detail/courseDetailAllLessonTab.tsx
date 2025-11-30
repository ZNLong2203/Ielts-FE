"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle,
  Clock, 
  ChevronRight,
  Video,
  CheckCircle,
  FileText,
  FileImage
} from "lucide-react";

interface AllLessonsTabProps {
  courseData: any;
}

const AllLessonsTab: React.FC<AllLessonsTabProps> = ({ courseData }) => {
  const formatDuration = (duration: number) => {
    if (!duration) return "~30 min";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = () => {
    return courseData?.sections?.reduce((total: any, section: any) => {
      const sectionDuration = section.lessons?.reduce((sTotal: any, lesson: any) => 
        sTotal + (lesson.video_duration || 30), 0) || 0;
      return total + sectionDuration;
    }, 0) || 0;
  };

  const getLessonTypeIcon = (lessonType: string) => {
    switch (lessonType?.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "assignment":
        return <FileImage className="h-4 w-4 text-orange-600" />;
      default:
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const allLessons = courseData?.sections?.flatMap((section: any, sectionIndex: number) => 
    section.lessons?.map((lesson: any, lessonIndex: number) => ({
      ...lesson,
      sectionTitle: section.title || `Section ${sectionIndex + 1}`,
      sectionIndex: sectionIndex + 1,
      lessonIndex: lessonIndex + 1,
      globalIndex: courseData.sections.slice(0, sectionIndex).reduce((acc: any, s: any) => acc + (s.lessons?.length || 0), 0) + lessonIndex + 1
    })) || []
  ) || [];

  return (
    <div className="space-y-4">
      {allLessons.length > 0 ? (
        <>
          {/* Summary Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{allLessons.length}</div>
                  <div className="text-sm text-gray-600">Total Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{courseData?.sections?.length || 0}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(getTotalDuration())}
                  </div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {allLessons.filter((lesson: any) => lesson.is_preview).length}
                  </div>
                  <div className="text-sm text-gray-600">Preview Lessons</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                <span>All Lessons</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {allLessons.map((lesson: any, index: number) => (
                  <div
                    key={lesson.id || index}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-bold">
                        {lesson.globalIndex}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{lesson.title}</span>
                          {lesson.is_preview && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Preview
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {lesson.sectionTitle}
                          </Badge>
                          <span>•</span>
                          <span>Lesson {lesson.lessonIndex}</span>
                          <span>•</span>
                          <span className="capitalize">{lesson.lesson_type || "video"}</span>
                        </div>
                        {lesson.description && (
                          <div className="text-xs text-gray-400 mt-1 max-w-md truncate">
                            {lesson.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(lesson.video_duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getLessonTypeIcon(lesson.lesson_type)}
                        <span className="capitalize">{lesson.lesson_type || "Video"}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        #{lesson.ordering || lesson.globalIndex}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
              <p className="text-gray-500">This course doesn't have any lessons yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllLessonsTab;
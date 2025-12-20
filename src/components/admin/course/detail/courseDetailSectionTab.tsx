"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Eye, 
  Clock, 
  ChevronRight, 
  FileText, 
  BookOpen,
  Video,
  CheckCircle,
  FileImage,
  PlayCircle
} from "lucide-react";

interface SectionTabProps {
  courseData: any;
  setSelectedSectionIndex: (index: number) => void;
}

const SectionTab: React.FC<SectionTabProps> = ({ 
  courseData, 
  setSelectedSectionIndex 
}) => {
  const formatDuration = (duration: number) => {
    if (!duration) return "~30 min";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getSectionDuration = (section: any) => {
    return section.lessons?.reduce((total: any, lesson: any) => 
      total + (lesson.video_duration || 30), 0) || 0;
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

  return (
    <div className="space-y-6">
      {courseData?.sections && courseData.sections.length > 0 ? (
        courseData.sections.map((section: any, sectionIndex: number) => (
          <Card key={sectionIndex} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {section.title || `Section ${sectionIndex + 1}`}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {section.lessons?.length || 0} lessons
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(getSectionDuration(section))}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      {sectionIndex + 1}
                    </span>
                    <div className="text-xs text-gray-500">Section</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSectionIndex(sectionIndex)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Lessons</span>
                  </Button>
                </div>
              </div>
              {section.description && (
                <div className="mt-3 text-sm text-gray-600">
                  {section.description}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {section.lessons && section.lessons.length > 0 ? (
                <div className="space-y-3">
                  {section.lessons.map((lesson: any, lessonIndex: number) => (
                    <div
                      key={lesson.id || lessonIndex}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getLessonTypeIcon(lesson.lesson_type)}
                          <div>
                            <div className="font-medium text-gray-900">
                              {lesson.title}
                            </div>
                            {lesson.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {lesson.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(lesson.video_duration)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {lesson.lesson_type || "video"}
                          </Badge>
                        </div>
                        {lesson.is_preview && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Preview
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No lessons in this section</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Available</h3>
              <p className="text-gray-500">This course doesn't have any sections yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SectionTab;
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FolderOpen, Eye, PlayCircle } from "lucide-react";
import SectionTab from "./courseDetailSectionTab";
import SectionLessonsTab from "./courseDetailSectionLessonTab";
import AllLessonsTab from "./courseDetailAllLessonTab";
interface CourseContentTabsProps {
  courseData: any;
}

const CourseContentTabs: React.FC<CourseContentTabsProps> = ({ courseData }) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  const getTotalLessons = () => {
    return courseData?.sections?.reduce((total: any, section: any) => 
      total + (section.lessons?.length || 0), 0) || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Course Content</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Sections ({courseData?.sections?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="section-lessons" 
              className="flex items-center space-x-2"
              disabled={selectedSectionIndex === null}
            >
              <Eye className="h-4 w-4" />
              <span>
                {selectedSectionIndex !== null 
                  ? `Section ${selectedSectionIndex + 1} Lessons`
                  : "Section Lessons"
                }
              </span>
            </TabsTrigger>
            <TabsTrigger value="all-lessons" className="flex items-center space-x-2">
              <PlayCircle className="h-4 w-4" />
              <span>All Lessons ({getTotalLessons()})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="mt-6">
            <SectionTab 
              courseData={courseData} 
              setSelectedSectionIndex={setSelectedSectionIndex}
            />
          </TabsContent>
          
          <TabsContent value="section-lessons" className="mt-6">
            <SectionLessonsTab 
              courseData={courseData}
              selectedSectionIndex={selectedSectionIndex}
              setSelectedSectionIndex={setSelectedSectionIndex}
            />
          </TabsContent>
          
          <TabsContent value="all-lessons" className="mt-6">
            <AllLessonsTab courseData={courseData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CourseContentTabs;
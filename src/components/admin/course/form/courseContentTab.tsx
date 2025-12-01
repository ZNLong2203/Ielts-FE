"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FolderOpen, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  Plus,
  List
} from "lucide-react";
import SectionTab from "@/components/admin/course/form/courseSectionTab";
import LessonTab from "@/components/admin/course/form/courseLessonTab";
import ExerciseTab from "@/components/admin/course/form/courseExerciseTab";
import QuestionTab from "@/components/admin/course/form/courseQuestionTab";

interface CourseContentTabsProps {
  courseData: any;
  onRefresh?: () => void;
}

const CourseContentTabs: React.FC<CourseContentTabsProps> = ({ 
  courseData, 
  onRefresh 
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sections");

  // Auto-select first items when data changes
  useEffect(() => {
    if (courseData?.sections && courseData.sections.length > 0 && !selectedSectionId) {
      const firstSection = courseData.sections[0];
      setSelectedSectionId(firstSection.id);
      
      if (firstSection.lessons && firstSection.lessons.length > 0) {
        const firstLesson = firstSection.lessons[0];
        setSelectedLessonId(firstLesson.id);
        
        if (firstLesson.exercises && firstLesson.exercises.length > 0) {
          setSelectedExerciseId(firstLesson.exercises[0].id);
        }
      }
    }
  }, [courseData, selectedSectionId]);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
    setActiveTab("lessons");
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedExerciseId(null);
    setActiveTab("exercises");
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setActiveTab("questions");
  };

  const getTotalCounts = () => {
    const sections = courseData?.sections || [];
    const totalLessons = sections.reduce((acc: number, section: any) => 
      acc + (section.lessons?.length || 0), 0);
    const totalExercises = sections.reduce((acc: number, section: any) => 
      acc + (section.lessons?.reduce((lessonAcc: number, lesson: any) => 
        lessonAcc + (lesson.exercises?.length || 0), 0) || 0), 0);
    const totalQuestions = sections.reduce((acc: number, section: any) => 
      acc + (section.lessons?.reduce((lessonAcc: number, lesson: any) => 
        lessonAcc + (lesson.exercises?.reduce((exAcc: number, exercise: any) => 
          exAcc + (exercise.questions?.length || 0), 0) || 0), 0) || 0), 0);

    return { totalLessons, totalExercises, totalQuestions };
  };

  const { totalLessons, totalExercises, totalQuestions } = getTotalCounts();

  const getSelectedSection = () => {
    if (!selectedSectionId || !courseData?.sections) return null;
    return courseData.sections.find((section: any) => section.id === selectedSectionId);
  };

  const getSelectedLesson = () => {
    if (!selectedLessonId) return null;
    const section = getSelectedSection();
    if (!section?.lessons) return null;
    return section.lessons.find((lesson: any) => lesson.id === selectedLessonId);
  };

  const getSelectedExercise = () => {
    if (!selectedExerciseId) return null;
    const lesson = getSelectedLesson();
    if (!lesson?.exercises) return null;
    return lesson.exercises.find((exercise: any) => exercise.id === selectedExerciseId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="h-5 w-5 text-purple-600" />
            <span>Course Content Management</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{courseData?.sections?.length || 0} sections</Badge>
              <Badge variant="outline">{totalLessons} lessons</Badge>
              <Badge variant="outline">{totalExercises} exercises</Badge>
              <Badge variant="outline">{totalQuestions} questions</Badge>
            </div>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Sections ({courseData?.sections?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lessons" 
              className="flex items-center space-x-2"
              disabled={!selectedSectionId}
            >
              <PlayCircle className="h-4 w-4" />
              <span>
                Lessons ({getSelectedSection()?.lessons?.length || 0})
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="exercises" 
              className="flex items-center space-x-2"
              disabled={!selectedLessonId}
            >
              <FileText className="h-4 w-4" />
              <span>
                Exercises ({getSelectedLesson()?.exercises?.length || 0})
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="questions" 
              className="flex items-center space-x-2"
              disabled={!selectedExerciseId}
            >
              <HelpCircle className="h-4 w-4" />
              <span>
                Questions ({getSelectedExercise()?.questions?.length || 0})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="mt-6">
            <SectionTab
              courseData={courseData}
              selectedSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <LessonTab
              section={getSelectedSection()}
              selectedLessonId={selectedLessonId}
              onLessonSelect={handleLessonSelect}
              onBack={() => setActiveTab("sections")}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <ExerciseTab
              lesson={getSelectedLesson()}
              selectedExerciseId={selectedExerciseId}
              onExerciseSelect={handleExerciseSelect}
              onBack={() => setActiveTab("lessons")}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <QuestionTab
              exercise={getSelectedExercise()}
              onBack={() => setActiveTab("exercises")}
              onRefresh={onRefresh}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CourseContentTabs;
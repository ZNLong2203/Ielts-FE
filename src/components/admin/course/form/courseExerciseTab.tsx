"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Target,
  CheckCircle,
  Edit
} from "lucide-react";
import ExerciseForm from "../exercise/exerciseForm";

interface ExerciseTabProps {
  lesson: any;
  selectedExerciseId: string | null;
  onExerciseSelect: (exerciseId: string) => void;
  onBack: () => void;
  onRefresh?: () => void;
}

const ExerciseTab: React.FC<ExerciseTabProps> = ({
  lesson,
  selectedExerciseId,
  onExerciseSelect,
  onBack,
  onRefresh
}) => {
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  const handleExerciseFormSuccess = () => {
    setShowExerciseForm(false);
    setEditingExercise(null);
    onRefresh?.();
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setShowExerciseForm(true);
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "listening":
        return "bg-orange-100 text-orange-800";
      case "writing":
        return "bg-purple-100 text-purple-800";
      case "speaking":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!lesson) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Selected</h3>
            <p className="text-gray-500 mb-4">Please select a lesson to view its exercises.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{lesson.title} - Exercises</h3>
            <p className="text-sm text-gray-600">
              Manage exercises for this lesson
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingExercise(null);
            setShowExerciseForm(!showExerciseForm);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Exercise</span>
        </Button>
      </div>

      {/* Lesson Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">{lesson.title}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="outline" className="bg-white text-xs">
                  Lesson {lesson.ordering}
                </Badge>
                <Badge variant="outline" className="bg-white text-xs">
                  {lesson.exercises?.length || 0} exercises
                </Badge>
                <Badge variant="outline" className="bg-white text-xs capitalize">
                  {lesson.lesson_type || "video"}
                </Badge>
              </div>
            </div>
          </div>
          {lesson.description && (
            <p className="text-green-700 text-sm mt-2">{lesson.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Exercise Form */}
      {showExerciseForm && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingExercise ? "Edit Exercise" : "Create New Exercise"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseForm
                lessonId={lesson.id}
                existingExercises={lesson.exercises || []}
                onSuccess={handleExerciseFormSuccess}
                onCancel={() => {
                  setShowExerciseForm(false);
                  setEditingExercise(null);
                }}
              />
            </CardContent>
          </Card>
          <Separator />
        </>
      )}

      {/* Exercises List */}
      {lesson.exercises && lesson.exercises.length > 0 ? (
        <div className="space-y-3">
          {lesson.exercises
            .sort((a: any, b: any) => (a.ordering || 999) - (b.ordering || 999))
            .map((exercise: any, index: number) => (
              <Card 
                key={exercise.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedExerciseId === exercise.id 
                    ? "ring-2 ring-green-500 bg-green-50" 
                    : "hover:bg-gray-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg font-bold">
                        {index + 1}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {exercise.title}
                          </h4>
                          <Badge 
                            className={`text-xs ${getExerciseTypeColor(exercise.exercise_type)}`}
                          >
                            {exercise.exercise_type}
                          </Badge>
                          <Badge 
                            className={`text-xs ${getDifficultyColor(exercise.difficulty_level)}`}
                          >
                            {exercise.difficulty_level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>Score: {exercise.max_score || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{exercise.time_limit || 'No limit'} min</span>
                          </div>
                          <span>Order #{exercise.ordering || index + 1}</span>
                          <span>{exercise.questions?.length || 0} questions</span>
                        </div>
                        
                        {exercise.description && (
                          <p className="text-xs text-gray-400 mt-1 max-w-md truncate">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditExercise(exercise);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => onExerciseSelect(exercise.id)}
                        className="flex items-center space-x-1"
                      >
                        <span>View Questions</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No exercises in this lesson
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first exercise to start building lesson content.
              </p>
              <Button
                onClick={() => setShowExerciseForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseTab;
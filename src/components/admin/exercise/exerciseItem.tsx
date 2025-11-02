"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Trophy,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Target,
  HelpCircle,
  Eye,
  EyeOff,
  Plus,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IExercise } from "@/interface/exercise";
import { getExerciseByLessonId } from "@/api/exercise";

const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0 s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} m`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} s`);
  }

  return parts.join(" ");
};

interface ExerciseItemProps {
  exercise: IExercise;
  exerciseIndex: number;
  lessonId: string;
  handleEditExercise: (exercise: IExercise) => void;
  handleDeleteExercise: (exercise: IExercise) => void;
  onManageQuestions?: (exercise: IExercise) => void;
}

const ExerciseItem = ({
  exercise,
  exerciseIndex,
  lessonId,
  handleEditExercise,
  handleDeleteExercise,
  onManageQuestions,
}: ExerciseItemProps) => {
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);

  // Fetch exercise details including questions
  const {
    data: exerciseData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exercise", lessonId, exercise.id],
    queryFn: () => getExerciseByLessonId(lessonId, exercise.id),
  });

  console.log("Exercise Data:", exerciseData);

  const questions = exerciseData && Array.isArray(exerciseData.questions)
    ? exerciseData.questions.filter((q: any) => q.deleted === false)
    : [];

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <Badge variant="outline" className="w-20 h-6 bg-gray-200 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
        <span className="text-red-600 text-sm">Error loading exercise details</span>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-sm hover:border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            <Target className="h-4 w-4" />
          </div>

          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800"
          >
            Exercise {exercise.ordering ?? exerciseIndex + 1}
          </Badge>

          {/* Exercise title */}
          <h4 className="font-semibold text-gray-900">
            {exercise.title || `Untitled Exercise ${exerciseIndex + 1}`}
          </h4>

          {/* Active status badge */}
          <Badge
            variant="outline"
            className={`text-xs ${
              exercise.is_active
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {exercise.is_active ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>

        {/* Actions - giống sortableLessonItem */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {/* Toggle question details button */}
            {questions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionDetails(!showQuestionDetails)}
                className="h-8 px-2 text-xs hover:bg-blue-50 text-blue-700 hover:text-blue-800"
                title="Toggle question details"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                {showQuestionDetails ? "Hide" : "Show"} Questions
              </Button>
            )}

            {/* Manage questions button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageQuestions?.(exercise)}
              className="h-8 px-2 text-xs hover:bg-green-50 text-green-700 hover:text-green-800"
              title="Manage questions"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Manage Questions
            </Button>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditExercise(exercise)}
              className="h-8 w-8 p-0 hover:bg-blue-50"
              title="Edit exercise"
            >
              <Edit className="h-3 w-3" />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteExercise(exercise)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete exercise"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Exercise Metadata - giống sortableLessonItem */}
      <div className="flex items-center space-x-3 mb-4">
      
        {/* Time limit */}
        {exercise.time_limit && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(exercise.time_limit)}</span>
          </div>
        )}

        {/* Passing score */}
        {exercise.passing_score && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Trophy className="h-3 w-3" />
            <span>{exercise.passing_score}</span>
          </div>
        )}

        {/* Max attempts */}
        {exercise.max_attempts && (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {exercise.max_attempts} attempt{exercise.max_attempts > 1 ? 's' : ''}
          </Badge>
        )}

        {/* Question count */}
        {questions.length > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <HelpCircle className="h-3 w-3 mr-1" />
            {questions.length} question{questions.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {questions && questions.length > 0 ? (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <HelpCircle className="h-3 w-3" />
              <span>Questions</span>
              <Badge variant="outline" className="text-xs ml-2">
                {questions.length} total
              </Badge>
            </h5>
            
            {/* Toggle visibility button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestionDetails(!showQuestionDetails)}
              className="h-6 px-2 text-xs"
            >
              {showQuestionDetails ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>

          {/* Question details - collapsible */}
          {showQuestionDetails && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {questions
                .sort((a, b) => (a.ordering ?? 999) - (b.ordering ?? 999))
                .map((question: any, questionIndex: number) => (
                  <div
                    key={question.id || questionIndex}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className="text-xs w-8 justify-center flex-shrink-0 mt-0.5"
                      >
                        {question.ordering ?? questionIndex + 1}
                      </Badge>

                      <div className="flex-shrink-0 mt-0.5">
                        <HelpCircle className="h-4 w-4 text-green-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {question.question_text || `Question ${questionIndex + 1}`}
                        </p>
                        
                        {question.question_type && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {question.question_type}
                            </Badge>
                            
                            {question.points && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <BarChart3 className="h-3 w-3" />
                                <span>{question.points} pts</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Question options preview */}
                        {question.question_options && question.question_options.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Options: </span>
                            <span>{question.question_options.length} choices</span>
                          </div>
                        )}

                        {/* Question explanation/answer key preview */}
                        {question.explanation && (
                          <div className="mt-2 text-xs text-gray-400 italic">
                            Has explanation
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <Separator />
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500 mb-2">
              No questions in this exercise
            </p>
            {onManageQuestions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageQuestions(exercise)}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Questions
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Exercise Content Preview */}
      {exercise.content && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Content Preview</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 break-words">
              {typeof exercise.content === 'string' 
                ? exercise.content 
                : exercise.content?.main_content || exercise.content?.description || 'No content available'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseItem;
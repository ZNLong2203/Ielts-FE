"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Trophy,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { IExercise } from "@/interface/exercise";

const ExerciseItem = ({
  exercise,
  exerciseIndex,
  handleEditExercise,
  handleDeleteExercise,
  formatDuration,
}: {
  exercise: IExercise;
  exerciseIndex: number;
  handleEditExercise: (exercise: IExercise) => void;
  handleDeleteExercise: (exercise: IExercise) => void;
  formatDuration: (seconds: number) => string;
}) => {
  return (
    <div className="border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-sm hover:border-gray-300">
      {/* Exercise Header - giống SortableLessonItem */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Order badge - giống style */}
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

        {/* Actions - giống SortableLessonItem */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
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

      {/* Exercise Description */}
      {exercise.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {exercise.description}
        </p>
      )}

      {/* Exercise Metadata - giống SortableLessonItem */}
      <div className="flex items-center space-x-3">
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
            <span>{exercise.passing_score}%</span>
          </div>
        )}

        {/* Max attempts */}
        {exercise.max_attempts && (
          <Badge variant="outline" className="text-xs">
            {exercise.max_attempts} attempt{exercise.max_attempts > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ExerciseItem;
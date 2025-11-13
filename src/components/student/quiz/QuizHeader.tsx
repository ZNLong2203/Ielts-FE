"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizHeaderProps {
  title: string;
  section: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  progress: number;
  getTimeColor: () => string;
  formatTime: (seconds: number) => string;
  onExit: () => void;
}

const QuizHeader = ({
  title,
  section,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  progress,
  getTimeColor,
  formatTime,
  onExit,
}: QuizHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onExit}
            className="text-gray-600"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Exit
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{section.toUpperCase()} Section</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Progress */}
          <div className="text-center hidden sm:block">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="font-semibold text-gray-900">
              {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className={cn("font-mono font-bold text-lg", getTimeColor())}>
              <Clock className="h-4 w-4 inline mr-1" />
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto mt-4">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export default QuizHeader;


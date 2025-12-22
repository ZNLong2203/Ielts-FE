"use client";

import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizHeaderProps {
  quizTitle: string;
  sectionName: string;
  timeRemaining: number;
  onExit: () => void;
  isPinned?: boolean;
}

export default function QuizHeader({
  quizTitle,
  sectionName,
  timeRemaining,
  onExit,
  isPinned = false,
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (timeRemaining: number, totalTime: number) => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage <= 5) return "text-red-600 animate-pulse";
    if (percentage <= 10) return "text-red-600";
    if (percentage <= 25) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div
      className={cn(
        "bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40",
        isPinned && "w-full"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between",
          isPinned ? "w-full px-6" : "max-w-7xl mx-auto"
        )}
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onExit} className="text-gray-600">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Exit
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {quizTitle}
            </h1>
            <p className="text-sm text-gray-600">{sectionName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p
              className={cn(
                "font-mono font-bold text-lg",
                getTimeColor(timeRemaining, 3600) // Default to 1 hour
              )}
            >
              <Clock className="h-4 w-4 inline mr-1" />
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


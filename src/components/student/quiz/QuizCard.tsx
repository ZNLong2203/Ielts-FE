"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Headphones, FileText, BookOpen, Mic } from "lucide-react";
import { IMockTest } from "@/interface/mockTest";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: IMockTest;
  section: string;
  sectionColor: string;
  borderColor: string;
  difficulty: string;
  getSectionIcon: (section: string) => React.ReactNode;
  onStart: (quizId: string) => void;
}

const QuizCard = ({
  quiz,
  section,
  sectionColor,
  borderColor,
  difficulty,
  getSectionIcon,
  onStart,
}: QuizCardProps) => {
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
        borderColor,
        "bg-white border border-gray-200"
      )}
      onClick={() => onStart(quiz.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={cn(
              "p-2.5 rounded-lg border",
              sectionColor,
              "bg-white"
            )}>
              {getSectionIcon(section)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                {quiz.title}
              </CardTitle>
              <p className="text-xs text-gray-500 capitalize">
                {quiz.test_type === "full_test" ? "Complete IELTS Test" : `${section || "Test"} Practice`}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {quiz.description || "Comprehensive IELTS practice test"}
        </p>

        {/* Badges and Info */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className={cn(
            "text-xs font-medium px-2.5 py-1",
            sectionColor
          )}>
            {quiz.test_type === "full_test" ? "FULL TEST" : (section || "TEST").toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs font-medium border-gray-300 text-gray-600 bg-white">
            {difficulty}
          </Badge>
        </div>

        {/* Section info and duration */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            {section === "listening" && (
              <div className="flex items-center space-x-1.5">
                <Headphones className="h-3.5 w-3.5" />
                <span>4 Sections</span>
              </div>
            )}
            {section === "writing" && (
              <div className="flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Task 1 & 2</span>
              </div>
            )}
            {section === "speaking" && (
              <div className="flex items-center space-x-1.5">
                <Mic className="h-3.5 w-3.5" />
                <span>3 Parts</span>
              </div>
            )}
            {section === "reading" && (
              <div className="flex items-center space-x-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>3 Passages</span>
              </div>
            )}
          </div>
          {quiz.duration && (
            <div className="flex items-center space-x-1.5 text-xs font-medium text-gray-700">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>{quiz.duration} min</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            className={cn(
              "w-full text-white hover:opacity-90 transition-opacity font-medium text-sm py-5",
              section === "listening" && "bg-blue-600 hover:bg-blue-700",
              section === "reading" && "bg-green-600 hover:bg-green-700",
              section === "writing" && "bg-purple-600 hover:bg-purple-700",
              section === "speaking" && "bg-orange-600 hover:bg-orange-700",
              section === "full_test" && "bg-gray-700 hover:bg-gray-800"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onStart(quiz.id);
            }}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;


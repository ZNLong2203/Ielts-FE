"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, BookOpen, FileText, Headphones, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizInstructionsProps {
  quiz: {
    title: string;
    section: string;
    description: string;
    instructions: string;
  } | null | undefined;
  onBack: () => void;
  onStart: () => void;
}

export default function QuizInstructions({
  quiz,
  onBack,
  onStart,
}: QuizInstructionsProps) {
  // Guard clause: if quiz is undefined, show loading or error
  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Loading quiz information...</p>
        </div>
      </div>
    );
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "listening":
        return <Headphones className="h-5 w-5" />;
      case "reading":
        return <BookOpen className="h-5 w-5" />;
      case "writing":
        return <FileText className="h-5 w-5" />;
      case "speaking":
        return <Mic className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case "listening":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "reading":
        return "bg-green-50 text-green-700 border-green-200";
      case "writing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "speaking":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-3 rounded-lg border", getSectionColor(quiz.section))}>
                {getSectionIcon(quiz.section)}
              </div>
              <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <p className="text-gray-600 mt-1 capitalize">
                  {quiz.section} Section - Practice Test
                </p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-sm", getSectionColor(quiz.section))}>
              {quiz.section.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 leading-relaxed">{quiz.description}</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Important Instructions
            </h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p className="whitespace-pre-line">{quiz.instructions}</p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onStart}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Start Test Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

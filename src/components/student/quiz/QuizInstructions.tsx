"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const QuizInstructions = () => {
  return (
    <Card className="bg-blue-50 border-2 border-blue-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <MessageSquare className="h-5 w-5" />
          <span>How to Take IELTS Practice Tests</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
            <div>
              <p className="font-medium">Choose Your Section</p>
              <p className="text-blue-700">Start with listening and reading for skill building</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
            <div>
              <p className="font-medium">Time Management</p>
              <p className="text-blue-700">Stick to the time limits for realistic practice</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
            <div>
              <p className="font-medium">Review Answers</p>
              <p className="text-blue-700">Study explanations to understand mistakes</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</div>
            <div>
              <p className="font-medium">Track Progress</p>
              <p className="text-blue-700">Monitor your band scores over time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizInstructions;


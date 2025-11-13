"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Headphones, FileText, Mic } from "lucide-react";
import { IMockTest } from "@/interface/mockTest";

interface QuizStatisticsProps {
  quizList: IMockTest[];
  getQuizSection: (quiz: IMockTest) => string;
}

const QuizStatistics = ({ quizList, getQuizSection }: QuizStatisticsProps) => {
  const stats = [
    { label: "Listening", type: "listening", icon: Headphones, bgColor: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-200" },
    { label: "Reading", type: "reading", icon: BookOpen, bgColor: "bg-green-50", iconColor: "text-green-600", borderColor: "border-green-200" },
    { label: "Writing", type: "writing", icon: FileText, bgColor: "bg-purple-50", iconColor: "text-purple-600", borderColor: "border-purple-200" },
    { label: "Speaking", type: "speaking", icon: Mic, bgColor: "bg-orange-50", iconColor: "text-orange-600", borderColor: "border-orange-200" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const count = quizList.filter((quiz) => {
          const section = getQuizSection(quiz);
          return section === stat.type;
        }).length;
        return (
          <Card key={stat.label} className={`${stat.bgColor} ${stat.borderColor} border-2 transition-all hover:shadow-md`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">Tests Available</p>
                </div>
                <div className={`${stat.iconColor} bg-white rounded-full p-3 shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuizStatistics;


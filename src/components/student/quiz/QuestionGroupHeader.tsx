"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface QuestionGroupHeaderProps {
  title?: string;
  startIndex: number;
  endIndex: number;
  passage?: string;
  image?: string;
}

const QuestionGroupHeader = ({
  title,
  startIndex,
  endIndex,
  passage,
  image,
}: QuestionGroupHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-blue-900">
          {title || `Questions ${startIndex + 1}-${endIndex + 1}`}
        </h3>
        <Badge className="bg-blue-600 text-white">
          Questions {startIndex + 1}-{endIndex + 1}
        </Badge>
      </div>
      {passage && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {passage}
          </p>
        </div>
      )}
      {image && (
        <div className="mt-4">
          <img 
            src={image} 
            alt="Question reference" 
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionGroupHeader;


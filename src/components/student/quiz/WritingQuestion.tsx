import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface WritingQuestionProps {
  questionId: string;
  questionText: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minWords?: number; // Minimum word count (150 for Task 1, 250 for Task 2)
}

const WritingQuestion: React.FC<WritingQuestionProps> = ({
  questionId,
  questionText,
  value,
  onChange,
  placeholder = "Type your detailed answer here...",
  rows = 15,
  minWords = 250, // Default to Task 2 requirement
}) => {
  const wordCount = (value.match(/\S+/g) || []).length;
  const characterCount = value.length;

  return (
    <div className="space-y-4">
      {/* Answer Textarea Card */}
      <Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <label htmlFor={questionId} className="text-sm font-semibold text-gray-700">
                  Your Answer
                </label>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{wordCount}</span> words
                </span>
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{characterCount}</span> characters
                </span>
              </div>
            </div>
            <Textarea
              id={questionId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full p-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-sans text-base leading-relaxed resize-none transition-colors"
            />
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Write clearly and organize your thoughts</span>
              <span className={wordCount >= minWords ? "text-xs text-green-600 font-medium" : "text-xs text-amber-600 font-medium"}>
                {wordCount >= minWords ? (
                  <span className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Minimum word count met</span>
                  </span>
                ) : (
                  `Minimum ${minWords} words (${minWords - wordCount} remaining)`
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingQuestion;


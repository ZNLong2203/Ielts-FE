"use client"

import { ICourseQuestion } from "@/interface/courseQuestion"

interface ShortAnswerProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

export function ShortAnswer({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: ShortAnswerProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Write your answer (no more than 3 words):
          </label>
          <input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={showResults}
            className={`w-full px-4 py-3 border-2 rounded-lg font-medium text-slate-800 transition-all ${
              showResults && isCorrect
                ? 'border-green-500 bg-green-50'
                : showResults && !isCorrect
                ? 'border-red-500 bg-red-50'
                : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            } ${showResults ? 'cursor-default' : ''}`}
            placeholder="Enter your answer..."
            maxLength={50}
          />
          <p className="text-xs text-slate-500">Maximum 3 words</p>
        </div>
        {showResults && question.explanation && (
          <div className={`mt-4 p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm text-slate-700">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

